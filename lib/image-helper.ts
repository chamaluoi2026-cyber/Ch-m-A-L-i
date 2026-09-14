/**
 * Bộ tiện ích chuẩn hóa và xử lý đường dẫn hình ảnh thông minh cho Chạm A Lưới.
 * Hỗ trợ tự động chuyển đổi link Google Drive, Dropbox, Unsplash, Imgur, link cục bộ và link mạng.
 */

// Ảnh placeholder phong cách thiên nhiên Trường Sơn tối ưu khi thiếu ảnh hoặc link chết
export const DEFAULT_PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'%3E%3Cdefs%3E%3ClinearGradient id='bg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%230F5C4A'/%3E%3Cstop offset='100%25' stop-color='%2316211E'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23bg)'/%3E%3Cpath d='M100 480 L320 220 L480 380 L620 260 L750 480 Z' fill='%23B86F3C' opacity='0.25'/%3E%3Cpath d='M50 520 L240 320 L400 450 L580 330 L780 520 Z' fill='%23ffffff' opacity='0.12'/%3E%3Ccircle cx='650' cy='160' r='50' fill='%23fef08a' opacity='0.3'/%3E%3Ctext x='50%25' y='52%25' font-family='sans-serif' font-size='26' font-weight='bold' fill='%23ffffff' text-anchor='middle' opacity='0.85'%3ECh%E1%BA%A1m A L%C6%B0%E1%BB%9Bi%3C/text%3E%3Ctext x='50%25' y='58%25' font-family='sans-serif' font-size='14' fill='%23ffffff' text-anchor='middle' opacity='0.6'%3EH%C3%ACnh %E1%BA%A3nh %C4%91ang %C4%91%C6%B0%E1%BB%A3c c%E1%BA%ADp nh%E1%BA%ADt%3C/text%3E%3C/svg%3E";

/**
 * Trích xuất Google Drive File ID từ bất kỳ định dạng link chia sẻ nào
 */
export function extractGoogleDriveId(url: string): string | null {
  if (!url) return null;

  // Dạng: drive.google.com/file/d/FILE_ID/view?usp=sharing
  const matchFileD = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) return matchFileD[1];

  // Dạng: drive.google.com/open?id=FILE_ID
  const matchOpenId = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
  if (matchOpenId && matchOpenId[1]) return matchOpenId[1];

  // Dạng: drive.google.com/uc?id=FILE_ID
  const matchUcId = url.match(/drive\.google\.com\/uc\?(?:.*&)?id=([a-zA-Z0-9_-]+)/);
  if (matchUcId && matchUcId[1]) return matchUcId[1];

  // Dạng: docs.google.com/uc?id=FILE_ID
  const matchDocsId = url.match(/docs\.google\.com\/uc\?(?:.*&)?id=([a-zA-Z0-9_-]+)/);
  if (matchDocsId && matchDocsId[1]) return matchDocsId[1];

  return null;
}

/**
 * Xác định nguồn ảnh của URL
 */
export function detectImageSource(url: string): "google-drive" | "unsplash" | "dropbox" | "imgur" | "local" | "external" {
  if (!url) return "local";
  if (url.startsWith("/") || url.startsWith("data:")) return "local";
  if (url.startsWith("photo-") || url.includes("images.unsplash.com")) return "unsplash";
  if (extractGoogleDriveId(url)) return "google-drive";
  if (url.includes("dropbox.com")) return "dropbox";
  if (url.includes("imgur.com")) return "imgur";
  return "external";
}

/**
 * Chuẩn hóa bất kỳ link ảnh nào thành link ảnh gốc trực tiếp (Direct URL)
 * Tự động chuyển đổi Google Drive, Dropbox, Unsplash, Imgur
 */
export function normalizeImageUrl(rawUrl?: string | null): string {
  if (!rawUrl || !rawUrl.trim()) {
    return DEFAULT_PLACEHOLDER_IMAGE;
  }

  const url = rawUrl.trim();

  // 1. Nếu là data URL SVG/Base64 hoặc link cục bộ
  if (url.startsWith("data:") || url.startsWith("/")) {
    return url;
  }

  // 2. Nếu là ID ảnh Unsplash (ví dụ "photo-1506744038136-46273834b3fb")
  if (url.startsWith("photo-")) {
    return `https://images.unsplash.com/${url}?auto=format&fit=crop&w=1600&q=82`;
  }

  // 3. Nếu là link Google Drive (chia sẻ công khai)
  // Chuyển sang Google CDN (lh3.googleusercontent.com/d/FILE_ID) - Tốc độ cao, không chặn CORS, hiển thị ngay lập tức
  const googleDriveId = extractGoogleDriveId(url);
  if (googleDriveId) {
    return `https://lh3.googleusercontent.com/d/${googleDriveId}`;
  }

  // 4. Nếu là link Dropbox
  if (url.includes("dropbox.com")) {
    return url.replace("dl=0", "raw=1");
  }

  // 5. Nếu là link Imgur dạng trang xem (chưa có đuôi ảnh)
  if (url.includes("imgur.com/") && !url.includes("i.imgur.com") && !url.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
    const parts = url.split("imgur.com/");
    if (parts[1]) {
      return `https://i.imgur.com/${parts[1].replace("/", "")}.jpg`;
    }
  }

  // 6. Nếu người dùng gõ link nội bộ nhưng quên dấu / ở đầu (ví dụ "images/products/forest-honey.png")
  if (url.startsWith("images/") || url.startsWith("uploads/")) {
    return `/${url}`;
  }

  // 7. Mặc định giữ nguyên URL trực tiếp
  return url;
}

/**
 * Kiểm tra xem chuỗi có phải là link ảnh hợp lệ không
 */
export function isValidImageUrl(url?: string | null): boolean {
  if (!url || !url.trim()) return false;
  const str = url.trim();
  if (str.startsWith("/") || str.startsWith("photo-") || str.startsWith("data:image/")) return true;
  return str.startsWith("http://") || str.startsWith("https://");
}
