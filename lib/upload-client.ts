/**
 * Bộ công cụ tải ảnh phía Client tối ưu hóa toàn diện cho Chạm A Lưới:
 * 1. Nén ảnh thông minh trước khi upload (Scale ảnh lớn từ smartphone > 2MB xuống kích thước web chuẩn)
 * 2. Upload qua HTTP Multipart tiêu chuẩn (Tránh triệt để lỗi "Unexpected end of form" của Server Actions)
 * 3. Tự động đồng bộ đường dẫn và kiểm tra tính hợp lệ
 */

export interface UploadClientOptions {
  category?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Nén ảnh trước khi tải lên (Canvas Client-side Compression)
 */
async function compressImage(file: File, options?: UploadClientOptions): Promise<Blob | File> {
  if (typeof window === "undefined") return file;
  // Bỏ qua nén đối với SVG hoặc file nhỏ hơn 1.5MB
  if (file.type === "image/svg+xml" || file.size < 1.5 * 1024 * 1024) {
    return file;
  }

  // Chỉ nén JPEG, PNG, WEBP
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    return file;
  }

  return new Promise((resolve) => {
    const maxWidth = options?.maxWidth || 2400;
    const maxHeight = options?.maxHeight || 2400;
    const quality = options?.quality || 0.85;

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;
      if (width <= maxWidth && height <= maxHeight && file.size < 3 * 1024 * 1024) {
        return resolve(file);
      }

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height);
        height = maxHeight;
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(file);

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      const outputMime = file.type === "image/png" ? "image/png" : "image/jpeg";
      canvas.toBlob(
        (blob) => {
          if (blob && blob.size < file.size) {
            resolve(new File([blob], file.name, { type: outputMime }));
          } else {
            resolve(file);
          }
        },
        outputMime,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });
}

/**
 * Tải ảnh trực tiếp lên máy chủ an toàn 100%
 */
export async function uploadImageClient(
  file: File,
  options?: UploadClientOptions
): Promise<{
  success: boolean;
  url?: string;
  fileName?: string;
  error?: string;
}> {
  try {
    if (!file) {
      return { success: false, error: "Vui lòng chọn một file hình ảnh." };
    }

    if (file.size > 50 * 1024 * 1024) {
      return { success: false, error: "Dung lượng file vượt quá giới hạn 50MB." };
    }

    // Nén nhẹ client-side nếu là ảnh chụp phân giải quá cao
    let fileToUpload: File | Blob = file;
    try {
      fileToUpload = await compressImage(file, options);
    } catch {
      fileToUpload = file;
    }

    // Tạo FormData chuẩn
    const formData = new FormData();
    formData.append("file", fileToUpload, file.name);
    if (options?.category) {
      formData.append("category", options.category);
    }

    // Gửi HTTP POST trực tiếp đến /api/upload
    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      const errText = await res.text();
      let errMsg = "Không thể tải ảnh lên máy chủ (Mã lỗi: " + res.status + ")";
      try {
        const json = JSON.parse(errText);
        if (json.error) errMsg = json.error;
      } catch {}
      return { success: false, error: errMsg };
    }

    const data = await res.json();
    return {
      success: !!data.success,
      url: data.url,
      fileName: data.fileName,
      error: data.error
    };
  } catch (err: any) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Lỗi kết nối mạng khi tải ảnh."
    };
  }
}
