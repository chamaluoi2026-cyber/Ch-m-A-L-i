"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { DEFAULT_PLACEHOLDER_IMAGE, normalizeImageUrl } from "@/lib/image-helper";

export interface AppImageProps extends Omit<ImageProps, "src"> {
  src?: string | null;
  fallbackSrc?: string;
}

/**
 * Component hiển thị hình ảnh tối ưu và an toàn cho toàn bộ dự án Chạm A Lưới:
 * 1. Tự động chuẩn hóa link (Google Drive, Dropbox, Unsplash, Imgur, link cục bộ).
 * 2. Tự động chuyển sang ảnh dự phòng thiên nhiên A Lưới nếu link chết hoặc lỗi mạng (không bao giờ vỡ giao diện).
 * 3. Hỗ trợ lazy-loading mượt mà và tối ưu hóa kích thước.
 */
export function AppImage({
  src,
  alt,
  fallbackSrc = DEFAULT_PLACEHOLDER_IMAGE,
  className,
  ...props
}: AppImageProps) {
  const normalizedSrc = normalizeImageUrl(src);
  const [currentSrc, setCurrentSrc] = useState<string>(normalizedSrc);
  const [hasError, setHasError] = useState(false);

  // Nếu props.src thay đổi, cập nhật lại state
  if (normalizedSrc !== currentSrc && !hasError) {
    setCurrentSrc(normalizedSrc);
  }

  function handleError() {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
  }

  return (
    <Image
      src={currentSrc}
      alt={alt || "Hình ảnh Chạm A Lưới"}
      className={className}
      onError={handleError}
      {...props}
    />
  );
}
