import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

export interface ResolvedTrackItem {
  id: string;
  title: string;
  artist: string;
  artwork: string;
  previewUrl: string | null;
  spotifySearchUrl: string;
  source?: "itunes" | "deezer";
}

function normalizeTrackKey(title: string, artist: string): string {
  const cleanTitle = (title || "")
    .toLowerCase()
    .replace(/[\(\[].*?[\)\]]/g, "")
    .replace(/[^a-z0-9\u0400-\u04FF]/g, "");
  const cleanArtist = (artist || "")
    .toLowerCase()
    .split(/[,&]|feat\.?|ft\.?/i)[0]
    .replace(/[^a-z0-9\u0400-\u04FF]/g, "");
  return `${cleanTitle}::${cleanArtist}`;
}

async function searchItunesTracks(
  query: string,
  limit: number,
  offset: number,
  country?: string
): Promise<ResolvedTrackItem[]> {
  try {
    const countryParam = country ? `&country=${country}` : "";
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=${limit}&offset=${offset}${countryParam}`;
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.results || []).map((item: any) => ({
      id: `itunes_${item.trackId || Math.random().toString(36)}`,
      title: item.trackName || "Unknown Song",
      artist: item.artistName || "Unknown Artist",
      artwork: (item.artworkUrl100 || "").replace("100x100bb.jpg", "400x400bb.jpg"),
      previewUrl: item.previewUrl || null,
      spotifySearchUrl: `https://open.spotify.com/search/${encodeURIComponent(
        `${item.trackName} ${item.artistName}`
      )}`,
      source: "itunes" as const,
    }));
  } catch {
    return [];
  }
}

async function searchDeezerTracks(
  query: string,
  limit: number,
  offset: number
): Promise<{ items: ResolvedTrackItem[]; hasNext: boolean }> {
  try {
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${limit}&index=${offset}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return { items: [], hasNext: false };
    const data = await res.json();
    const items: ResolvedTrackItem[] = (data.data || []).map((item: any) => ({
      id: `deezer_${item.id || Math.random().toString(36)}`,
      title: item.title_short || item.title || "Unknown Song",
      artist: item.artist?.name || "Unknown Artist",
      artwork:
        item.album?.cover_big ||
        item.album?.cover_medium ||
        item.artist?.picture_big ||
        "",
      previewUrl: item.preview || null,
      spotifySearchUrl: `https://open.spotify.com/search/${encodeURIComponent(
        `${item.title_short || item.title} ${item.artist?.name || ""}`
      )}`,
      source: "deezer" as const,
    }));
    return { items, hasNext: Boolean(data.next) };
  } catch {
    return { items: [], hasNext: false };
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const inputUrl = (body.url || "").trim();

    if (!inputUrl) {
      return NextResponse.json({ error: "Spotify URL is required" }, { status: 400 });
    }

    // Normalize spotify:track:xxx or international open.spotify.com/intl-xx/... URL
    let cleanUrl = inputUrl.replace(/open\.spotify\.com\/intl-[a-z-]+\//i, "open.spotify.com/");
    if (cleanUrl.startsWith("spotify:track:")) {
      cleanUrl = `https://open.spotify.com/track/${cleanUrl.replace("spotify:track:", "")}`;
    } else if (cleanUrl.startsWith("spotify:album:")) {
      cleanUrl = `https://open.spotify.com/album/${cleanUrl.replace("spotify:album:", "")}`;
    } else if (cleanUrl.startsWith("spotify:playlist:")) {
      cleanUrl = `https://open.spotify.com/playlist/${cleanUrl.replace("spotify:playlist:", "")}`;
    }

    // Call Spotify official oEmbed API
    const oembedUrl = `https://open.spotify.com/oembed?url=${encodeURIComponent(cleanUrl)}`;
    const res = await fetch(oembedUrl);

    if (!res.ok) {
      return NextResponse.json(
        { error: "Could not fetch track from Spotify. Make sure the link is valid." },
        { status: 400 }
      );
    }

    const data = await res.json();

    const trackIdMatch = cleanUrl.match(/\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
    const itemType = trackIdMatch ? trackIdMatch[1] : "track";
    const itemId = trackIdMatch ? trackIdMatch[2] : "";

    const iframeUrl =
      data.iframe_url ||
      (itemId ? `https://open.spotify.com/embed/${itemType}/${itemId}?utm_source=generator&theme=0` : null);

    // Attempt to resolve direct playable audio preview via iTunes first, then Deezer
    let previewUrl: string | null = null;
    if (data.title) {
      const searchTitle = data.title.replace(/[\(\[].*?[\)\]]/g, "").trim();
      const itunesMatches = await searchItunesTracks(searchTitle, 1, 0);
      if (itunesMatches[0]?.previewUrl) {
        previewUrl = itunesMatches[0].previewUrl;
      } else {
        const deezerMatches = await searchDeezerTracks(searchTitle, 1, 0);
        if (deezerMatches.items[0]?.previewUrl) {
          previewUrl = deezerMatches.items[0].previewUrl;
        }
      }
    }

    return NextResponse.json({
      success: true,
      title: data.title || "Spotify Track",
      thumbnailUrl: data.thumbnail_url || null,
      iframeUrl,
      previewUrl,
      trackUrl: cleanUrl,
      type: itemType,
      width: data.width,
      height: data.height,
    });
  } catch (error: any) {
    console.error("Spotify resolve error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to resolve Spotify track" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();
    const limitParam = parseInt(searchParams.get("limit") || "30", 10);
    const offsetParam = parseInt(searchParams.get("offset") || "0", 10);

    const perSourceLimit = Math.min(Math.max(Number.isFinite(limitParam) ? limitParam : 30, 6), 50);
    const offset = Math.max(Number.isFinite(offsetParam) ? offsetParam : 0, 0);

    if (!query) {
      return NextResponse.json({ results: [], hasMore: false, nextOffset: 0 });
    }

    // Query iTunes Global, iTunes UZ, and Deezer simultaneously so CIS/Uzbek & global tracks all appear
    const [itunesGlobal, itunesUz, deezerRes] = await Promise.all([
      searchItunesTracks(query, perSourceLimit, offset),
      offset === 0
        ? searchItunesTracks(query, 20, 0, "uz")
        : Promise.resolve([] as ResolvedTrackItem[]),
      searchDeezerTracks(query, perSourceLimit, offset),
    ]);

    const seen = new Map<string, ResolvedTrackItem>();

    // Prefer iTunes entries first (stable non-expiring audio previews), then add Deezer catalog tracks
    const orderedSources = [...itunesGlobal, ...itunesUz, ...deezerRes.items];
    for (const item of orderedSources) {
      const key = normalizeTrackKey(item.title, item.artist);
      const existing = seen.get(key);
      if (!existing) {
        seen.set(key, item);
      } else if (!existing.previewUrl && item.previewUrl) {
        seen.set(key, item);
      }
    }

    const results = Array.from(seen.values());
    const hasMore =
      itunesGlobal.length >= perSourceLimit ||
      deezerRes.hasNext ||
      deezerRes.items.length >= perSourceLimit;

    return NextResponse.json({
      results,
      hasMore,
      nextOffset: offset + perSourceLimit,
    });
  } catch (error: any) {
    console.error("Spotify search error:", error);
    return NextResponse.json({ results: [], hasMore: false, nextOffset: 0 });
  }
}
