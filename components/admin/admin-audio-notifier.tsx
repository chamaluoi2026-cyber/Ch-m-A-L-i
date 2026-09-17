"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  X,
  Play
} from "lucide-react";
import { soundSynthesizer } from "@/lib/audio/notification-sound";
import type { AdminBadgeCounts, AdminLatestAlert } from "@/lib/admin-badges";

export function AdminAudioNotifier() {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [activeToast, setActiveToast] = useState<AdminLatestAlert | null>(null);
  const [isBlinking, setIsBlinking] = useState(false);

  const prevCountsRef = useRef<AdminBadgeCounts | null>(null);
  const seenAlertIdsRef = useRef<Set<string>>(new Set());
  const blinkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const originalTitleRef = useRef<string>("");
  const isInitialLoadRef = useRef(true);

  // Khởi tạo trạng thái âm thanh từ LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSoundEnabled(soundSynthesizer.isEnabled());
      originalTitleRef.current = document.title || "Quản trị hệ thống | Chạm A Lưới";
    }
  }, []);

  // Hàm dừng nhấp nháy tab và khôi phục tiêu đề gốc
  const stopTitleBlink = () => {
    if (blinkIntervalRef.current) {
      clearInterval(blinkIntervalRef.current);
      blinkIntervalRef.current = null;
    }
    setIsBlinking(false);
    if (typeof document !== "undefined" && originalTitleRef.current) {
      document.title = originalTitleRef.current;
    }
  };

  // Hàm bắt đầu nhấp nháy tab trình duyệt
  const startTitleBlink = (alertTitle: string) => {
    if (typeof document === "undefined") return;

    if (!originalTitleRef.current) {
      originalTitleRef.current = document.title || "Quản trị hệ thống | Chạm A Lưới";
    }

    if (blinkIntervalRef.current) {
      clearInterval(blinkIntervalRef.current);
    }

    let toggle = false;
    setIsBlinking(true);

    blinkIntervalRef.current = setInterval(() => {
      toggle = !toggle;
      if (toggle) {
        document.title = `🔔 (1) ${alertTitle} - Chạm A Lưới`;
      } else {
        document.title = `⚡ Xử lý ngay! - Chạm A Lưới`;
      }
    }, 900);
  };

  // Lắng nghe khi nhân viên quay lại tab trình duyệt -> Khôi phục tiêu đề gốc
  useEffect(() => {
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        stopTitleBlink();
      }
    };

    window.addEventListener("focus", handleVisibilityOrFocus);
    document.addEventListener("visibilitychange", handleVisibilityOrFocus);

    return () => {
      window.removeEventListener("focus", handleVisibilityOrFocus);
      document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
      stopTitleBlink();
    };
  }, []);

  // Polling chuông báo và đơn mới mỗi 6 giây
  useEffect(() => {
    let isMounted = true;

    async function checkNewAlerts() {
      try {
        const res = await fetch("/api/badge-counts", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!isMounted || !data.success || !data.badges) return;

        const badges: AdminBadgeCounts = data.badges;

        // Lần đầu tải trang: lưu mốc so sánh, không phát chuông
        if (isInitialLoadRef.current) {
          prevCountsRef.current = badges;
          if (badges.latestAlert?.id) {
            seenAlertIdsRef.current.add(badges.latestAlert.id);
          }
          isInitialLoadRef.current = false;
          return;
        }

        const prev = prevCountsRef.current;
        if (!prev) {
          prevCountsRef.current = badges;
          return;
        }

        // Phát hiện đơn mới hoặc tin nhắn chat mới tăng lên
        const hasNewChat = badges.chat > prev.chat;
        const hasNewBooking = badges.bookings > prev.bookings;
        const hasNewOrder = badges.orders > prev.orders;
        const hasNewLead = badges.leads > prev.leads;

        const latestAlert = badges.latestAlert;
        const isNewAlertId = Boolean(latestAlert?.id && !seenAlertIdsRef.current.has(latestAlert.id));

        if (hasNewChat || hasNewBooking || hasNewOrder || hasNewLead || isNewAlertId) {
          // 1. Phát âm thanh chuông "Ding" êm dịu
          soundSynthesizer.playDing();

          // 2. Xác định tiêu đề hiển thị
          let alertTitle = "Khách mới nhắn tin!";
          let alertDesc = "Có tin nhắn mới trên Live Chat cần hỗ trợ.";
          let alertLink = "/admin/chat";
          let alertType: "chat" | "booking" | "order" | "lead" = "chat";

          if (latestAlert) {
            alertTitle = latestAlert.title;
            alertDesc = latestAlert.description;
            alertLink = latestAlert.link;
            alertType = latestAlert.type;
            seenAlertIdsRef.current.add(latestAlert.id);
          } else if (hasNewBooking) {
            alertTitle = "Có đơn Tour mới!";
            alertDesc = "Khách vừa đặt tour du lịch mới cần xác nhận.";
            alertLink = "/admin/bookings";
            alertType = "booking";
          } else if (hasNewOrder) {
            alertTitle = "Có đơn Đặc sản mới!";
            alertDesc = "Có đơn đặt mua đặc sản mới cần chuẩn bị giao hàng.";
            alertLink = "/admin/orders";
            alertType = "order";
          } else if (hasNewLead) {
            alertTitle = "Khách để lại SĐT!";
            alertDesc = "Khách vừa gửi yêu cầu tư vấn kèm số điện thoại.";
            alertLink = "/admin/leads";
            alertType = "lead";
          }

          // 3. Kích hoạt nhấp nháy tab trình duyệt
          startTitleBlink(alertTitle);

          // 4. Hiển thị Toast thông báo nổi bật góc màn hình
          setActiveToast({
            id: latestAlert?.id || `alert-${Date.now()}`,
            type: alertType,
            title: alertTitle,
            description: alertDesc,
            link: alertLink,
            timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
          });
        }

        prevCountsRef.current = badges;
      } catch (err) {
        // Im lặng nếu mạng chập chờn
      }
    }

    // Kiểm tra định kỳ mỗi 6 giây (phản hồi siêu nhanh trong 30 giây đầu)
    const interval = setInterval(checkNewAlerts, 6000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleToggleSound = () => {
    const next = soundSynthesizer.toggle();
    setSoundEnabled(next);
  };

  const handleTestSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundSynthesizer.playDing();
  };

  return (
    <>
      {/* Control button trên Desktop Top Header */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={handleToggleSound}
          title={soundEnabled ? "Bấm để tắt tiếng chuông báo" : "Bấm để bật chuông báo âm thanh"}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition ${
            soundEnabled
              ? "bg-emerald-50 text-emerald-800 border border-emerald-300/60 hover:bg-emerald-100"
              : "bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200"
          }`}
        >
          {soundEnabled ? (
            <>
              <Volume2 className="size-3.5 text-emerald-600 animate-pulse" />
              <span className="hidden sm:inline">Chuông: Bật</span>
            </>
          ) : (
            <>
              <VolumeX className="size-3.5 text-slate-400" />
              <span className="hidden sm:inline">Chuông: Tắt</span>
            </>
          )}
        </button>

        {soundEnabled && (
          <button
            type="button"
            onClick={handleTestSound}
            title="Thử tiếng chuông Ding"
            className="p-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 transition"
          >
            <Play className="size-3 fill-emerald-600 text-emerald-600" />
          </button>
        )}
      </div>

      {/* Floating Real-time Toast Banner (Góc trên màn hình, responsive mobile & desktop) */}
      {activeToast && (
        <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-5 sm:max-w-sm z-50 animate-in slide-in-from-top-4 duration-300">
          <div className="bg-[#0F382E] text-white rounded-2xl p-4 shadow-2xl border-2 border-emerald-400/40 backdrop-blur-lg flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <span className="size-8 rounded-xl bg-emerald-500 text-white grid place-items-center shrink-0 animate-bounce shadow-md">
                  <BellRing className="size-4" />
                </span>
                <div>
                  <h4 className="font-extrabold text-sm text-emerald-300 leading-tight flex items-center gap-1.5">
                    {activeToast.title}
                  </h4>
                  <span className="text-[10px] text-white/50">{activeToast.timestamp}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setActiveToast(null);
                  stopTitleBlink();
                }}
                className="p-1 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition"
                aria-label="Đóng thông báo"
              >
                <X className="size-4" />
              </button>
            </div>

            <p className="text-xs text-white/90 line-clamp-2 leading-relaxed pl-10">
              {activeToast.description}
            </p>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10 pl-10">
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles className="size-3" /> Chuẩn phản hồi trong 30s
              </span>

              <Link
                href={activeToast.link}
                onClick={() => {
                  setActiveToast(null);
                  stopTitleBlink();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-forest font-black text-xs transition shadow"
              >
                Mở xử lý ngay <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
