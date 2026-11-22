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
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB (supports video & media assets)

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    // Allow uploads for authenticated or onboarding users

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Fayl tanlanmadi / No file provided" }, { status: 400 });
    }

    // Validate mime type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "Faqat rasm yoki video fayllari (JPG, PNG, WEBP, GIF, SVG, MP4, WEBM, MOV) qabul qilinadi" },
        { status: 400 }
      );
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "Fayl hajmi 25MB dan oshmasligi kerak / File exceeds 25MB limit" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Get file extension from mime type or file name
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const sanitizedExt = [
      "png",
      "jpg",
      "jpeg",
      "webp",
      "gif",
      "svg",
      "mp4",
      "webm",
      "mov",
    ].includes(ext)
      ? ext
      : file.type.startsWith("video/")
      ? "mp4"
      : "jpg";
    const filename = `asset_${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${sanitizedExt}`;

    const isImage = file.type.startsWith("image/");
    const base64 = buffer.toString("base64");
    const dataUrl = `data:${file.type};base64,${base64}`;

    let publicUrl = `/uploads/${filename}`;
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);

      // Also mirror to /tmp/uploads for container environments
      try {
        const tmpDir = path.join("/tmp", "uploads");
        await mkdir(tmpDir, { recursive: true });
        await writeFile(path.join(tmpDir, filename), buffer);
      } catch {}
    } catch (fsError) {
      console.warn("Local filesystem write restricted:", fsError);
    }

    // For images <= 6MB, use Data URL so image persists in PostgreSQL permanently
    // across container reboots, redeploys, and ephemeral hosting.
    const finalUrl = isImage && file.size <= 6 * 1024 * 1024 ? dataUrl : publicUrl;

    return NextResponse.json({
      success: true,
      url: finalUrl,
      publicUrl,
      filename,
      size: file.size,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Rasmni yuklashda xatolik yuz berdi / Upload failed" },
      { status: 500 }
    );
  }
}

