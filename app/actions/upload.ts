"use server";

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import {
  getSystemAssets,
  saveSystemAsset,
  deleteSystemAsset,
  getSiteSettings,
  updateSiteSettings,
  getBlogPosts,
  getBlogPostBySlug,
  getBlogPostById,
  saveBlogPost,
  deleteBlogPost,
  getPlaces,
  getPlaceBySlug,
  getPlaceById,
  savePlace,
  deletePlace,
  type PlaceRecord,
  type PlaceFAQItem,
  type SystemAssetRecord,
  type SiteSettings,
  type BlogPostRecord,
  type BlogContentBlock,
  type TeamMemberItem,
  type CoreValueItem
} from "@/lib/server-store";
import { getSession, requireRole, sanitizeErrorMessage } from "@/lib/auth/roles";

export type { SystemAssetRecord, SiteSettings, BlogPostRecord, BlogContentBlock, PlaceRecord, PlaceFAQItem, TeamMemberItem, CoreValueItem };

export type UploadedImageItem = {
  url: string;
  name: string;
  size: number;
  createdAt: string;
};

// Danh sách các đuôi file hình ảnh được chấp nhận
const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg", ".ico"]);

// Danh sách MIME type hợp lệ
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

// Danh sách phần mở rộng nguy hiểm (chặn tuyệt đối)
const DANGEROUS_EXTENSIONS = new Set([
  ".exe", ".bat", ".cmd", ".sh", ".bash", ".ps1", ".vbs",
  ".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs",
  ".php", ".php3", ".php4", ".php5", ".phtml", ".phps",
  ".html", ".htm", ".xhtml", ".shtml",
  ".py", ".pyc", ".rb", ".pl", ".cgi", ".jar", ".war"
]);

// Kiểm tra Magic Bytes trong Buffer của file
function validateMagicBytes(buffer: Buffer, extension: string): boolean {
  if (buffer.length < 4) return false;

  // JPEG: FF D8 FF
  if (extension === ".jpg" || extension === ".jpeg") {
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }
  // PNG: 89 50 4E 47
  if (extension === ".png") {
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  }
  // GIF: GIF87a or GIF89a
  if (extension === ".gif") {
    return buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46;
  }
  // WEBP: RIFF....WEBP
  if (extension === ".webp") {
    const riff = buffer.subarray(0, 4).toString("ascii");
    const webp = buffer.subarray(8, 12).toString("ascii");
    return riff === "RIFF" && webp === "WEBP";
  }
  // SVG: Không được chứa script tag hoặc event handler độc hại
  if (extension === ".svg") {
    const text = buffer.subarray(0, 4096).toString("utf8").toLowerCase();
    if (text.includes("<script") || text.includes("javascript:") || text.includes("onload=") || text.includes("onerror=")) {
      return false;
    }
    return text.includes("<svg") || text.includes("<?xml");
  }

  // Fallback an toàn cho .ico và .avif
  return true;
}

// Danh sách các thư mục cần đồng bộ file ảnh

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
    "D:\\Website\\ChamALuoi-Data\\uploads",
    "D:\\ChamALuoi-Admin\\public\\images\\uploads",
    "D:\\ChamALuoi-Customer\\public\\images\\uploads",
    "D:\\ChamALuoi-Data\\uploads"
  ];
  return Array.from(new Set(dirs.map((d) => path.resolve(d))));
}

/**
 * Tải ảnh thông thường lên máy chủ (Kiểm tra bảo mật toàn diện)
 */
export async function uploadImageAction(formData: FormData): Promise<{
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
}> {
  try {
    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "Vui lòng chọn file hình ảnh." };
    }

    if (file.size > 50 * 1024 * 1024) {
      return { success: false, error: "Kích thước file ảnh không được vượt quá 50MB." };
    }
    if (file.size < 16) {
      return { success: false, error: "File ảnh không hợp lệ (dung lượng quá nhỏ)." };
    }

    const rawFileName = path.basename(file.name);
    const extension = (path.extname(rawFileName) || ".jpg").toLowerCase();

    if (DANGEROUS_EXTENSIONS.has(extension)) {
      return { success: false, error: "CẢNH BÁO: Định dạng file bị nghiêm cấm vì lý do an toàn." };
    }
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return { success: false, error: "Định dạng file không được hỗ trợ. Chỉ chấp nhận ảnh JPG, PNG, WEBP, AVIF, GIF, SVG." };
    }

    if (file.type && !ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
      return { success: false, error: "Loại nội dung (MIME type) của file không phải là hình ảnh hợp lệ." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!validateMagicBytes(buffer, extension)) {
      return { success: false, error: "Nội dung file không khớp với định dạng hình ảnh hoặc chứa mã độc." };
    }

    const cleanBaseName = path
      .basename(rawFileName, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 25);
    const uniqueSuffix = `${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const safeFilename = `cal-${cleanBaseName || "img"}-${uniqueSuffix}${extension}`;

    const targetDirs = getAllUploadDirs();
    for (const dir of targetDirs) {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        const safeFilePath = path.join(dir, safeFilename);
        fs.writeFileSync(safeFilePath, buffer);
      } catch (e) {
        console.error("Lỗi ghi file vào thư mục:", dir, e);
      }
    }

    const cloudUrl = await uploadToSupabaseStorage(buffer, safeFilename, file.type || "image/jpeg");
    const relativeUrl = cloudUrl || `/images/uploads/${safeFilename}`;
    revalidatePath("/admin/media");

    return {
      success: true,
      url: relativeUrl,
      fileName: safeFilename
    };
  } catch (err) {
    return {
      success: false,
      error: sanitizeErrorMessage(err, "Không thể tải lên file ảnh.")
    };
  }
}

/**
 * Tải Logo, Favicon, Hero banner (Chỉ Quản trị viên & Biên tập viên)
 */
export async function uploadBrandAssetAction(
  formData: FormData,
  assetType: "logo" | "logo-dark" | "logo-mobile" | "favicon" | "hero" | "about" = "logo"
): Promise<{
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
}> {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"]);

    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "Vui lòng chọn file hình ảnh hoặc icon." };
    }

    const maxBytes = assetType === "favicon" ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxBytes) {
      return {
        success: false,
        error: `Kích thước file không được vượt quá ${assetType === "favicon" ? "10MB" : "50MB"}.`
      };
    }

    const rawFileName = path.basename(file.name);
    const extension = (path.extname(rawFileName) || ".png").toLowerCase();

    if (DANGEROUS_EXTENSIONS.has(extension) || !ALLOWED_EXTENSIONS.has(extension)) {
      return { success: false, error: "Định dạng file không hỗ trợ hoặc bị cấm." };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!validateMagicBytes(buffer, extension)) {
      return { success: false, error: "Nội dung file không hợp lệ." };
    }

    const cleanBaseName = path
      .basename(rawFileName, extension)
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .slice(0, 20);
    const safeFilename = `cal-brand-${assetType}-${cleanBaseName || "asset"}-${Date.now()}${extension}`;

    const targetDirs = getAllUploadDirs();
    for (const dir of targetDirs) {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(path.join(dir, safeFilename), buffer);
      } catch (e) {
        console.error("Lỗi ghi brand asset:", dir, e);
      }
    }

    const relativeUrl = `/images/uploads/${safeFilename}`;
    revalidatePath("/admin/media");
    revalidatePath("/", "layout");

    return {
      success: true,
      url: relativeUrl,
      fileName: safeFilename
    };
  } catch (err) {
    return {
      success: false,
      error: sanitizeErrorMessage(err, "Không có quyền thay đổi tài nguyên thương hiệu.")
    };
  }
}

/**
 * Xóa file ảnh (Chống Path Traversal)
 */
export async function deleteImageAction(fileName: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"]);

    const safeBaseName = path.basename(fileName);
    if (!safeBaseName || safeBaseName === "." || safeBaseName === "..") {
      return { success: false, error: "Tên file không hợp lệ." };
    }

    const targetDirs = getAllUploadDirs();
    let deletedCount = 0;

    for (const dir of targetDirs) {
      const fullPath = path.join(dir, safeBaseName);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
          deletedCount++;
        } catch (e) {
          console.error("Lỗi xóa file:", fullPath, e);
        }
      }
    }

    revalidatePath("/admin/media");
    return {
      success: deletedCount > 0,
      error: deletedCount > 0 ? undefined : "Không tìm thấy file để xóa."
    };
  } catch (err) {
    return {
      success: false,
      error: sanitizeErrorMessage(err, "Lỗi xóa file.")
    };
  }
}

// =========================================================================
// CÁC ACTIONS BỔ SUNG CHO BLOGS, PLACES, VÀ MEDIA GALLERY
// =========================================================================

export async function getBlogPostsAction(): Promise<BlogPostRecord[]> {
  return getBlogPosts();
}

export async function getBlogPostBySlugAction(slug: string): Promise<BlogPostRecord | null> {
  const post = getBlogPostBySlug(slug);
  return post || null;
}

export async function saveBlogPostAction(post: BlogPostRecord): Promise<{
  success: boolean;
  post?: BlogPostRecord;
  error?: string;
}> {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"]);
    const saved = saveBlogPost(post);
    revalidatePath("/admin/blogs");
    revalidatePath("/blog");
    if (saved.slug) revalidatePath(`/blog/${saved.slug}`);
    return { success: true, post: saved };
  } catch (err) {
    return { success: false, error: sanitizeErrorMessage(err, "Không thể lưu bài viết.") };
  }
}

export async function deleteBlogPostAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"]);
    const deleted = deleteBlogPost(id);
    revalidatePath("/admin/blogs");
    revalidatePath("/blog");
    return { success: deleted, error: deleted ? undefined : "Không thể xóa bài viết." };
  } catch (err) {
    return { success: false, error: sanitizeErrorMessage(err, "Lỗi xóa bài viết.") };
  }
}

export async function uploadBlogMediaAction(formData: FormData): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  const res = await uploadImageAction(formData);
  return { success: res.success, url: res.url, error: res.error };
}

export async function getPlacesAction(): Promise<PlaceRecord[]> {
  return getPlaces();
}

export async function getPlaceBySlugAction(slug: string): Promise<PlaceRecord | null> {
  const place = getPlaceBySlug(slug);
  return place || null;
}

export async function savePlaceAction(place: PlaceRecord): Promise<{
  success: boolean;
  place?: PlaceRecord;
  error?: string;
}> {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"]);
    const saved = savePlace(place);
    revalidatePath("/admin/places");
    revalidatePath("/places");
    if (saved.slug) revalidatePath(`/places/${saved.slug}`);
    return { success: true, place: saved };
  } catch (err) {
    return { success: false, error: sanitizeErrorMessage(err, "Không thể lưu địa điểm.") };
  }
}

export async function deletePlaceAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"]);
    const deleted = deletePlace(id);
    revalidatePath("/admin/places");
    revalidatePath("/places");
    return { success: deleted, error: deleted ? undefined : "Không thể xóa địa điểm." };
  } catch (err) {
    return { success: false, error: sanitizeErrorMessage(err, "Lỗi xóa địa điểm.") };
  }
}

export async function uploadPlaceMediaAction(formData: FormData): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  const res = await uploadImageAction(formData);
  return { success: res.success, url: res.url, error: res.error };
}

export async function getSystemAssetsAction(): Promise<SystemAssetRecord[]> {
  return getSystemAssets();
}

export async function saveSystemAssetAction(asset: Omit<SystemAssetRecord, "id" | "createdAt"> & { id?: string }): Promise<{
  success: boolean;
  asset?: SystemAssetRecord;
  error?: string;
}> {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"]);
    const saved = saveSystemAsset(asset);
    revalidatePath("/admin/media");
    return { success: true, asset: saved };
  } catch (err) {
    return { success: false, error: sanitizeErrorMessage(err, "Không thể lưu tài nguyên.") };
  }
}

export async function deleteSystemAssetAction(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"]);
    const deleted = deleteSystemAsset(id);
    revalidatePath("/admin/media");
    return { success: deleted, error: deleted ? undefined : "Không thể xóa tài nguyên." };
  } catch (err) {
    return { success: false, error: sanitizeErrorMessage(err, "Lỗi xóa tài nguyên.") };
  }
}

export async function getUploadedImagesAction(): Promise<UploadedImageItem[]> {
  try {
    const uploadDir = path.join(process.cwd(), "public", "images", "uploads");
    if (!fs.existsSync(uploadDir)) return [];

    const files = fs.readdirSync(uploadDir);
    return files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return ALLOWED_EXTENSIONS.has(ext);
      })
      .map((file) => {
        const fullPath = path.join(uploadDir, file);
        let size = 0;
        let mtime = new Date();
        try {
          const stats = fs.statSync(fullPath);
          size = stats.size;
          mtime = stats.mtime;
        } catch {}

        return {
          url: `/images/uploads/${file}`,
          name: file,
          size,
          createdAt: mtime.toISOString()
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export async function deleteUploadedImageAction(fileName: string): Promise<{
  success: boolean;
  error?: string;
}> {
  return deleteImageAction(fileName);
}

export async function deleteMultipleUploadedImagesAction(fileNames: string[]): Promise<{
  success: boolean;
  deletedCount: number;
}> {
  let count = 0;
  for (const name of fileNames) {
    const res = await deleteImageAction(name);
    if (res.success) count++;
  }
  return { success: count > 0, deletedCount: count };
}

export async function getSiteSettingsAction(): Promise<SiteSettings> {
  return getSiteSettings();
}

export async function updateSiteSettingsAction(settings: Partial<SiteSettings>): Promise<{
  success: boolean;
  settings?: SiteSettings;
  error?: string;
}> {
  try {
    await requireRole(["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"]);
    const updated = updateSiteSettings(settings);
    revalidatePath("/admin/media");
    revalidatePath("/", "layout");
    return { success: true, settings: updated };
  } catch (err) {
    return { success: false, error: sanitizeErrorMessage(err, "Không thể cập nhật cấu hình website.") };
  }
}

export async function saveCroppedImageAction(
  payload: FormData | { dataUrl: string; name?: string; category?: string }
): Promise<{
  success: boolean;
  url?: string;
  error?: string;
}> {
  if (payload instanceof FormData) {
    return uploadImageAction(payload);
  }
  try {
    const { dataUrl, name, category } = payload;
    const base64Data = dataUrl.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    const fileName = `${category || "cropped"}-${Date.now()}-${(name || "image").replace(/[^a-zA-Z0-9]/g, "_")}.png`;
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);
    return { success: true, url: `/uploads/${fileName}` };
  } catch (err: any) {
    return { success: false, error: err.message || "Lỗi lưu ảnh cắt." };
  }
}
