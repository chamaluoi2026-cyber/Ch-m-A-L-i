import { BRAND_CONFIG } from "@/lib/brand.config";
import type { SiteSettings } from "@/lib/server-store";

export interface ZaloBookingContext {
  bookingId?: string;
  customerName?: string;
  serviceTitle?: string;
}

export interface ZaloResolutionResult {
  isAvailable: boolean;
  zaloUrl: string;
  displayName: string;
  phone: string;
  fallbackHotline: string;
  fallbackMessage: string;
}

export function resolveZaloCoordinator(
  settings?: SiteSettings | null,
  context?: ZaloBookingContext,
  customMessage?: string
): ZaloResolutionResult {
  const fallbackHotline = settings?.contactPhone || BRAND_CONFIG.contact.hotline;
  const isZaloActive = settings?.zaloActive ?? true;
  const phone = settings?.zaloPhone || "0825497468";
  const customUrl = settings?.zaloUrl;
  const displayName = settings?.zaloCoordinatorName || "Điều phối viên Chạm A Lưới";

  const fallbackMessage = `Zalo điều phối viên đang bảo trì kết nối. Quý khách vui lòng gọi Hotline ${fallbackHotline} để được hỗ trợ xác nhận đơn ngay lập tức.`;

  if (isZaloActive === false) {
    return {
      isAvailable: false,
      zaloUrl: "",
      displayName,
      phone,
      fallbackHotline,
      fallbackMessage
    };
  }

  let message = customMessage;
  if (!message) {
    if (context?.bookingId) {
      message = `Xin chào Chạm A Lưới, tôi muốn trao đổi về booking ${context.bookingId}.`;
    } else {
      message = "Xin chào Chạm A Lưới, tôi cần hỗ trợ thông tin du lịch bản địa.";
    }
  }

  if (customUrl && customUrl.startsWith("http")) {
    const separator = customUrl.includes("?") ? "&" : "?";
    return {
      isAvailable: true,
      zaloUrl: `${customUrl}${separator}text=${encodeURIComponent(message)}`,
      displayName,
      phone,
      fallbackHotline,
      fallbackMessage
    };
  }

  const cleanPhone = phone.replace(/[^0-9]/g, "");
  if (!cleanPhone || cleanPhone.length < 9) {
    return {
      isAvailable: false,
      zaloUrl: "",
      displayName,
      phone,
      fallbackHotline,
      fallbackMessage
    };
  }

  return {
    isAvailable: true,
    zaloUrl: `https://zalo.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
    displayName,
    phone: cleanPhone,
    fallbackHotline,
    fallbackMessage
  };
}
