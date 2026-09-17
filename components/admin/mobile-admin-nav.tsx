"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Calendar,
  CreditCard,
  Headphones,
  Home,
  LayoutDashboard,
  Menu,
  X
} from "lucide-react";
import { AppImage } from "@/components/ui/app-image";
import type { AdminBadgeCounts } from "@/lib/admin-badges";
import type { SiteSettings } from "@/lib/server-store";
import { navItems } from "@/components/admin/admin-sidebar-nav";

interface MobileAdminNavProps {
  siteSettings: SiteSettings;
  initialBadges?: AdminBadgeCounts;
  notificationsCount?: number;
}

export function MobileAdminNav({
  siteSettings,
  initialBadges,
  notificationsCount = 0
}: MobileAdminNavProps) {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [badges, setBadges] = useState<AdminBadgeCounts>(
    initialBadges || {
      chat: 0,
      leads: 0,
      bookings: 0,
      orders: 0,
      payments: 0,
      reviews: 0,
      vouchers: 0,
      transactions: 0,
      commissions: 0,
      reconciliation: 0,
      notifications: 0
    }
  );

  // Tự động đóng Drawer khi người dùng chuyển trang
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [pathname]);

  // Khóa cuộn trang nền khi Drawer đang mở
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  // Cập nhật số lượng thông báo định kỳ
  useEffect(() => {
    let isMounted = true;

    async function fetchBadges() {
      try {
        let res = await fetch("/api/badge-counts", { cache: "no-store" });
        if (!res.ok) {
          res = await fetch("/api/admin/badge-counts", { cache: "no-store" });
        }
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.success && data.badges) {
          setBadges(data.badges);
        }
      } catch {}
    }

    const interval = setInterval(fetchBadges, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const totalUrgentCount = (badges.bookings || 0) + (badges.chat || 0) + (badges.leads || 0);

  return (
    <>
      {/* 1. Top Bar trên Điện Thoại (< md) */}
      <header className="md:hidden sticky top-0 z-30 h-14 bg-[#0F382E] text-white border-b border-white/10 px-4 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            className="relative p-2 -ml-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition active:scale-95"
            aria-label="Mở danh mục quản trị"
          >
            <Menu className="size-5" />
            {totalUrgentCount > 0 && (
              <span className="absolute top-1 right-1 size-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </button>

          <Link href="/admin" className="flex items-center gap-2">
            {siteSettings.logo ? (
              <div className="relative h-7 w-20 shrink-0">
                <AppImage
                  src={siteSettings.logo}
                  alt="Logo Chạm A Lưới"
                  fill
                  className="object-contain object-left"
                />
              </div>
            ) : (
              <span className="size-7 rounded-lg bg-clay text-white grid place-items-center font-black text-xs">
                AL
              </span>
            )}
            <span className="font-extrabold text-xs tracking-tight text-white">Chạm A Lưới</span>
          </Link>
        </div>

        <div className="flex items-center gap-2.5">
          {notificationsCount > 0 && (
            <span className="rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 text-[10px] font-bold">
              {notificationsCount} tin
            </span>
          )}
          <div className="size-7 rounded-full bg-forest text-white grid place-items-center text-xs font-bold ring-1 ring-white/20">
            AD
          </div>
        </div>
      </header>

      {/* 2. Drawer Menu Trượt Ra Từ Cạnh Trái (Slide-in Drawer) */}
      {isDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop mờ */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200"
            onClick={() => setIsDrawerOpen(false)}
            aria-hidden="true"
          />

          {/* Khung Drawer */}
          <div className="relative w-[85vw] max-w-xs bg-[#0F382E] text-white flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200 h-full">
            {/* Drawer Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {siteSettings.logo ? (
                  <div className="relative h-8 w-24 shrink-0">
                    <AppImage
                      src={siteSettings.logo}
                      alt="Logo Chạm A Lưới"
                      fill
                      className="object-contain object-left"
                    />
                  </div>
                ) : (
                  <span className="size-7 rounded-lg bg-clay text-white grid place-items-center font-black text-xs">
                    AL
                  </span>
                )}
                <div>
                  <h2 className="font-extrabold text-xs text-white leading-tight">Chạm A Lưới</h2>
                  <p className="text-[9px] uppercase tracking-widest text-emerald-300 font-bold">
                    Admin Portal
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="size-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition"
                aria-label="Đóng menu"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Navigation Links with Scroll */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              <p className="px-3 py-1.5 text-[10px] font-bold text-white/40 uppercase tracking-wider">
                Chuyên mục Quản trị & Điều hành
              </p>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                const count = item.badgeKey ? badges[item.badgeKey] || 0 : 0;
                const displayCount = count > 99 ? "99+" : count.toString();

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsDrawerOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? "bg-emerald-500/25 text-white font-bold border-l-4 border-emerald-400 pl-2 shadow-sm"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-1.5">
                      <Icon
                        className={`size-4 shrink-0 ${
                          isActive ? "text-emerald-300" : "text-emerald-400/80"
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {count > 0 && (
                      <span
                        className={`shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] leading-none ${
                          item.badgeColor || "bg-emerald-500 text-white"
                        } ${item.pulse ? "animate-pulse" : ""}`}
                      >
                        {displayCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Bottom quick links in drawer */}
            <div className="p-3 border-t border-white/10 space-y-1.5 bg-black/10">
              <Link
                href="/business"
                onClick={() => setIsDrawerOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 hover:bg-white/10 transition"
              >
                <Building2 className="size-4 shrink-0" />
                Giao diện Đối tác Cơ sở
              </Link>
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white transition"
              >
                <Home className="size-4 shrink-0" />
                Xem web khách (Port 3000)
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 3. Bottom Navigation Bar Cố Định Cho Ngón Tay Cái (Mobile Bottom Nav) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F382E]/95 backdrop-blur-lg border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.25)]"
        aria-label="Thanh điều hướng nhanh ngón cái"
      >
        {/* Nút 1: Dashboard */}
        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[56px] transition active:scale-95 ${
            pathname === "/admin"
              ? "text-emerald-300 font-bold"
              : "text-white/65 hover:text-white"
          }`}
        >
          <LayoutDashboard className="size-4" />
          <span className="text-[10px] mt-0.5 tracking-tight">Tổng quan</span>
        </Link>

        {/* Nút 2: Bookings (Kèm Badge số đơn chờ) */}
        <Link
          href="/admin/bookings"
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[56px] transition active:scale-95 ${
            pathname.startsWith("/admin/bookings")
              ? "text-emerald-300 font-bold"
              : "text-white/65 hover:text-white"
          }`}
        >
          <div className="relative">
            <Calendar className="size-4" />
            {(badges.bookings || 0) > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[15px] h-3.5 px-1 rounded-full bg-rose-500 text-white text-[9px] font-extrabold flex items-center justify-center shadow-sm animate-pulse">
                {badges.bookings > 9 ? "9+" : badges.bookings}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Bookings</span>
        </Link>

        {/* Nút 3: Live Chat (Kèm Badge tin nhắn) */}
        <Link
          href="/admin/chat"
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[56px] transition active:scale-95 ${
            pathname.startsWith("/admin/chat")
              ? "text-emerald-300 font-bold"
              : "text-white/65 hover:text-white"
          }`}
        >
          <div className="relative">
            <Headphones className="size-4" />
            {(badges.chat || 0) > 0 && (
              <span className="absolute -top-1.5 -right-2.5 min-w-[15px] h-3.5 px-1 rounded-full bg-teal-400 text-slate-900 text-[9px] font-extrabold flex items-center justify-center shadow-sm">
                {badges.chat > 9 ? "9+" : badges.chat}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Tư vấn</span>
        </Link>

        {/* Nút 4: Thanh toán */}
        <Link
          href="/admin/payments"
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[56px] transition active:scale-95 ${
            pathname.startsWith("/admin/payments")
              ? "text-emerald-300 font-bold"
              : "text-white/65 hover:text-white"
          }`}
        >
          <CreditCard className="size-4" />
          <span className="text-[10px] mt-0.5 tracking-tight">Thanh toán</span>
        </Link>

        {/* Nút 5: Menu Đầy Đủ (Mở Drawer) */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl min-w-[56px] transition active:scale-95 ${
            isDrawerOpen ? "text-emerald-300 font-bold" : "text-white/65 hover:text-white"
          }`}
        >
          <div className="relative">
            <Menu className="size-4" />
            {totalUrgentCount > 0 && (
              <span className="absolute -top-1 -right-1 size-2 rounded-full bg-rose-500" />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">Menu ☰</span>
        </button>
      </nav>
    </>
  );
}
