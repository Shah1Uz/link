import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getAuthenticatedUser } from "@/lib/auth";

const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/mp4",
  "audio/x-m4a",
  "audio/m4a",
  "audio/aac",
  "audio/x-aac",
  "audio/ogg",
  "audio/opus",
  "audio/webm",
  "audio/flac",
  "audio/x-flac",
];

const AUDIO_EXTS = ["mp3", "wav", "m4a", "ogg", "aac", "flac", "weba", "opus"];
const VIDEO_EXTS = ["mp4", "webm", "mov"];
const IMAGE_EXTS = ["png", "jpg", "jpeg", "webp", "gif", "svg"];

const AUDIO_MIME_BY_EXT: Record<string, string> = {
  mp3: "audio/mpeg",
  wav: "audio/wav",
  m4a: "audio/mp4",
  ogg: "audio/ogg",
  aac: "audio/aac",
  flac: "audio/flac",
  weba: "audio/webm",
  opus: "audio/opus",
};

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB (supports audio, video & media assets)

export async function POST(req: NextRequest) {
  try {
    await getAuthenticatedUser();

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Fayl tanlanmadi / No file provided" },
        { status: 400 }
      );
    }

    const rawExt = file.name.split(".").pop()?.toLowerCase() || "";
    const isAudioExt = AUDIO_EXTS.includes(rawExt);
    const isVideoExt = VIDEO_EXTS.includes(rawExt);
    const isImageExt = IMAGE_EXTS.includes(rawExt);
    const isAllowedMime =
      ALLOWED_MIME_TYPES.includes(file.type) ||
      file.type.startsWith("audio/") ||
      file.type.startsWith("image/") ||
      file.type.startsWith("video/");

    if (!isAllowedMime && !isAudioExt && !isVideoExt && !isImageExt) {
      return NextResponse.json(
        {
          error:
            "Faqat rasm, video yoki audio (MP3, M4A, WAV, OGG, AAC, MP4, WEBM, JPG, PNG) fayllari qabul qilinadi",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Fayl hajmi 25MB dan oshmasligi kerak / File exceeds 25MB limit" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const isAudio = isAudioExt || file.type.startsWith("audio/");
    const isVideo = !isAudio && (isVideoExt || file.type.startsWith("video/"));
    const isImage = !isAudio && !isVideo && (isImageExt || file.type.startsWith("image/"));

    const sanitizedExt = [...IMAGE_EXTS, ...VIDEO_EXTS, ...AUDIO_EXTS].includes(rawExt)
      ? rawExt
      : isAudio
        ? "mp3"
        : isVideo
          ? "mp4"
          : "jpg";

    const filename = `asset_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${sanitizedExt}`;
    const mimeForDataUrl = isAudio
      ? file.type.startsWith("audio/")
        ? file.type
        : AUDIO_MIME_BY_EXT[sanitizedExt] || "audio/mpeg"
      : file.type || "application/octet-stream";

    const base64 = buffer.toString("base64");
    const dataUrl = `data:${mimeForDataUrl};base64,${base64}`;

    const publicUrl = `/uploads/${filename}`;
    let writtenToDisk = false;
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);
      writtenToDisk = true;

      try {
        const tmpDir = path.join("/tmp", "uploads");
        await mkdir(tmpDir, { recursive: true });
        await writeFile(path.join(tmpDir, filename), buffer);
      } catch {}
    } catch (fsError) {
      console.warn("Local filesystem write restricted:", fsError);
    }

    // Store <= 6MB images as Data URLs so they persist across ephemeral containers (Render/cloud).
    // For audio <= 6MB in production/Render OR when disk write fails, also persist as Data URL
    // so uploaded MP3/M4A files don't 404 after container restarts.
    const isEphemeralProd = Boolean(process.env.RENDER) || process.env.NODE_ENV === "production";
    const finalUrl = isImage
      ? file.size <= 6 * 1024 * 1024
        ? dataUrl
        : publicUrl
      : isAudio && file.size <= 6 * 1024 * 1024 && (isEphemeralProd || !writtenToDisk)
        ? dataUrl
        : writtenToDisk
          ? publicUrl
          : file.size <= 6 * 1024 * 1024
            ? dataUrl
            : publicUrl;

    return NextResponse.json({
      success: true,
      url: finalUrl,
      publicUrl,
      filename,
      size: file.size,
      type: mimeForDataUrl,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Faylni yuklashda xatolik yuz berdi / Upload failed" },
      { status: 500 }
    );
  }
}
