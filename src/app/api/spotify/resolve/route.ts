import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

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

    // Normalize spotify:track:xxx or URL
    let cleanUrl = inputUrl;
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

    // Extract track ID and embed URL
    const trackIdMatch = cleanUrl.match(/\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
    const itemType = trackIdMatch ? trackIdMatch[1] : "track";
    const itemId = trackIdMatch ? trackIdMatch[2] : "";

    const iframeUrl =
      data.iframe_url ||
      (itemId ? `https://open.spotify.com/embed/${itemType}/${itemId}?utm_source=generator&theme=0` : null);

    // Attempt to resolve direct playable audio preview via iTunes
    let previewUrl: string | null = null;
    if (data.title) {
      try {
        const searchTitle = data.title.replace(/[\(\[].*?[\)\]]/g, "").trim();
        const itunesRes = await fetch(
          `https://itunes.apple.com/search?term=${encodeURIComponent(searchTitle)}&entity=song&limit=1`
        );
        if (itunesRes.ok) {
          const itunesData = await itunesRes.json();
          if (itunesData.results?.[0]?.previewUrl) {
            previewUrl = itunesData.results[0].previewUrl;
          }
        }
      } catch {
        // Non-blocking fallback
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
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q")?.trim();

    if (!query) {
      return NextResponse.json({ results: [] });
    }

    // Search music via iTunes Music Search API (100% free, no rate limits, high-res art & audio previews)
    const itunesUrl = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=6`;
    const res = await fetch(itunesUrl);

    if (!res.ok) {
      return NextResponse.json({ results: [] });
    }

    const data = await res.json();
    const results = (data.results || []).map((item: any) => ({
      id: item.trackId ? String(item.trackId) : Math.random().toString(36),
      title: item.trackName || "Unknown Song",
      artist: item.artistName || "Unknown Artist",
      artwork: (item.artworkUrl100 || "").replace("100x100bb.jpg", "400x400bb.jpg"),
      previewUrl: item.previewUrl || null,
      spotifySearchUrl: `https://open.spotify.com/search/${encodeURIComponent(
        `${item.trackName} ${item.artistName}`
      )}`,
    }));

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Spotify search error:", error);
    return NextResponse.json({ results: [] });
  }
}
