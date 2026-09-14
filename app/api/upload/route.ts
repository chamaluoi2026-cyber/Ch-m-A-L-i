import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon"
]);

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg", ".ico"]);

const DANGEROUS_EXTENSIONS = new Set([
  ".exe", ".bat", ".cmd", ".sh", ".bash", ".ps1", ".vbs",
  ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs",
  ".php", ".php3", ".php4", ".php5", ".phtml", ".phps",
  ".html", ".htm", ".xhtml", ".shtml",
  ".py", ".pyc", ".rb", ".pl", ".cgi", ".jar", ".war"
]);

function validateMagicBytes(buffer: Buffer, extension: string): boolean {
  if (buffer.length < 4) return false;
  if (extension === ".jpg" || extension === ".jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  if (extension === ".png") {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  }
  if (extension === ".gif") {
    return buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
  }
  if (extension === ".webp") {
    const riff = buffer.subarray(0, 4).toString("ascii");
    const webp = buffer.subarray(8, 12).toString("ascii");
    return riff === "RIFF" && webp === "WEBP";
  }
  if (extension === ".svg") {
    const text = buffer.subarray(0, 4096).toString("utf8").toLowerCase();
    if (text.includes("<script") || text.includes("javascript:") || text.includes("onload=") || text.includes("onerror=")) {
      return false;
    }
    return text.includes("<svg") || text.includes("<?xml");
  }
  return true;
}

// Danh sách tất cả các thư mục cần đồng bộ tự động

async function uploadToSupabaseStorage(buffer: Buffer, filename: string, mimeType: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcunfovtwbzfatudejfs.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdW5mb3Z0d2J6ZmF0dWRlamZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NTM5OSwiZXhwIjoyMTA0OTcxMzk5fQ.7QwyRHqGXa6UwgbUNAhlWdmGZqpuS8Cxall2v8j7lMU';
  if (!url || !key) return null;

  try {
    const res = await fetch(`${url}/storage/v1/object/images/${filename}`, {
      method: "POST",
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`,
        "Content-Type": mimeType,
        "x-upsert": "true"
      },
      body: new Uint8Array(buffer)
    });
    if (res.ok) {
      return `${url}/storage/v1/object/public/images/${filename}`;
    }
  } catch (e) {
    console.error("Lỗi upload Supabase Storage:", e);
  }
  return null;
}

function getAllUploadDirs(): string[] {
  const dirs = [
    path.join(process.cwd(), "public", "images", "uploads"),
    "D:\\Website\\ChamALuoi-Admin\\public\\images\\uploads",
    "D:\\Website\\ChamALuoi-Customer\\public\\images\\uploads",
    "D:\\Website\\ChamALuoi-Data\\uploads"
  ];
  return Array.from(new Set(dirs.map((d) => path.resolve(d))));
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const category = (formData.get("category") as string) || "general";

    if (!file) {
      return NextResponse.json({ success: false, error: "Vui lòng chọn file hình ảnh để tải lên." }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ success: false, error: "Dung lượng file vượt quá giới hạn 50MB." }, { status: 400 });
    }

    if (file.size < 16) {
      return NextResponse.json({ success: false, error: "Dung lượng file quá nhỏ hoặc file rỗng." }, { status: 400 });
    }

    const rawName = path.basename(file.name);
    const extension = (path.extname(rawName) || ".jpg").toLowerCase();

    if (DANGEROUS_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        { success: false, error: "CẢNH BÁO: Định dạng file bị nghiêm cấm vì lý do an toàn." },
        { status: 403 }
      );
    }

    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        { success: false, error: "Định dạng file không được hỗ trợ. Chỉ chấp nhận ảnh JPG, PNG, WebP, AVIF, GIF, SVG." },
        { status: 400 }
      );
    }

    if (file.type && !ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: "Loại nội dung file (MIME type) không hợp lệ." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!validateMagicBytes(buffer, extension)) {
      return NextResponse.json(
        { success: false, error: "Nội dung file không khớp với định dạng ảnh hoặc chứa mã không an toàn." },
        { status: 400 }
      );
    }

    // Tạo tên file chuẩn SEO và định danh duy nhất
    const cleanBaseName = path
      .basename(rawName, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 25);
    const uniqueSuffix = `${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const prefix = category && category !== "general" ? `cal-${category}` : "cal";
    const filename = `${prefix}-${cleanBaseName || "img"}-${uniqueSuffix}${extension}`;

    // Đồng bộ ghi file vào toàn bộ các thư mục của hệ thống
    const targetDirs = getAllUploadDirs();
    for (const dir of targetDirs) {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(path.join(dir, filename), buffer);
      } catch (err) {
        console.error("[UPLOAD_SYNC_ERR] Lỗi đồng bộ sang:", dir, err);
      }
    }

    const cloudUrl = await uploadToSupabaseStorage(buffer, filename, file.type || "image/jpeg");
    const relativeUrl = cloudUrl || `/images/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: relativeUrl,
      fileName: filename,
      originalName: rawName,
      size: file.size,
      mimeType: file.type
    });
  } catch (error: any) {
    console.error("[API_UPLOAD_ERROR]:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Đã có lỗi xảy ra khi lưu file ảnh." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get("file");

    if (!fileName) {
      return NextResponse.json({ success: false, error: "Thiếu tên file cần xóa." }, { status: 400 });
    }

    const baseName = path.basename(fileName);
    if (!baseName || baseName === "." || baseName === ".." || baseName.includes("/")) {
      return NextResponse.json({ success: false, error: "Tên file không hợp lệ." }, { status: 400 });
    }

    const targetDirs = getAllUploadDirs();
    for (const dir of targetDirs) {
      try {
        const filePath = path.join(dir, baseName);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (e) {
        console.error("[DELETE_SYNC_ERR]:", e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Không thể xóa file." }, { status: 500 });
  }
}
