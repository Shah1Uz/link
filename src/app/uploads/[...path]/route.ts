import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import path from "path";
import { existsSync } from "fs";

export const dynamic = "force-dynamic";

const MIME_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  mp4: "video/mp4",
  webm: "video/webm",
  mov: "video/quicktime",
  mp3: "audio/mpeg",
  wav: "audio/wav",
  m4a: "audio/mp4",
  ogg: "audio/ogg",
  aac: "audio/aac",
  flac: "audio/flac",
  weba: "audio/webm",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];
    const filename = pathSegments.join("/");

    // Sanitize path against directory traversal
    const safeFilename = path.normalize(filename).replace(/^(\.\.[\/\\])+/, "");

    const possiblePaths = [
      path.join(process.cwd(), "public", "uploads", safeFilename),
      path.join(process.cwd(), "uploads", safeFilename),
      path.join("/tmp", "uploads", safeFilename),
    ];

    let foundPath: string | null = null;
    for (const p of possiblePaths) {
      if (existsSync(p)) {
        foundPath = p;
        break;
      }
    }

    if (!foundPath) {
      return new NextResponse("File not found", { status: 404 });
    }

    const ext = safeFilename.split(".").pop()?.toLowerCase() || "jpg";
    const contentType = MIME_TYPES[ext] || "application/octet-stream";

    const fileStat = await stat(foundPath);
    const totalSize = fileStat.size;
    const fileBuffer = await readFile(foundPath);

    const rangeHeader = req.headers.get("range");
    if (rangeHeader && totalSize > 0) {
      const match = rangeHeader.match(/bytes=(\d*)-(\d*)/);
      if (match) {
        const start = match[1] ? parseInt(match[1], 10) : 0;
        const end = match[2]
          ? Math.min(parseInt(match[2], 10), totalSize - 1)
          : totalSize - 1;

        if (start >= 0 && start <= end && end < totalSize) {
          const chunk = fileBuffer.subarray(start, end + 1);
          return new NextResponse(chunk, {
            status: 206,
            headers: {
              "Content-Type": contentType,
              "Content-Range": `bytes ${start}-${end}/${totalSize}`,
              "Accept-Ranges": "bytes",
              "Content-Length": String(chunk.length),
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        }
      }
    }

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(totalSize),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    console.error("Error serving uploaded asset:", err);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
