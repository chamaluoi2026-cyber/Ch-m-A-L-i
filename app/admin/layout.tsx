import Link from "next/link";
import { Building2, Home } from "lucide-react";
import { ReactNode } from "react";
import { getNotifications, getSiteSettings } from "@/lib/server-store";
import { getAdminSidebarBadgeCounts } from "@/lib/admin-badges";
import { AppImage } from "@/components/ui/app-image";
import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";
import { MobileAdminNav } from "@/components/admin/mobile-admin-nav";
import { AdminAudioNotifier } from "@/components/admin/admin-audio-notifier";

export const metadata = {
  title: "Quản trị hệ thống | Chạm A Lưới",
  description: "Bảng điều khiển quản trị nền tảng kết nối du lịch cộng đồng Chạm A Lưới"
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const notifications = getNotifications().filter((n) => !n.isRead);
  const siteSettings = getSiteSettings();
  const initialBadges = await getAdminSidebarBadgeCounts();

  return (
    <div className="min-h-screen bg-[#F4F6F5] text-ink flex flex-col md:flex-row">
      {/* Mobile Navigation (Top Sticky Bar, Slide-in Drawer & Bottom Finger Navigation) */}
      <MobileAdminNav
        siteSettings={siteSettings}
        initialBadges={initialBadges}
        notificationsCount={notifications.length}
      />

      {/* Desktop Sidebar (Only visible on md screens and up) */}
      <aside className="hidden md:flex md:w-64 bg-[#0F382E] text-white flex-shrink-0 flex-col justify-between">
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-white/10 flex items-center justify-between">
            <Link href="/admin" className="flex items-center gap-2.5">
              {siteSettings.logo ? (
                <div className="relative h-9 w-28 shrink-0">
                  <AppImage src={siteSettings.logo} alt="Logo Chạm A Lưới" fill className="object-contain object-left" />
                </div>
              ) : (
                <span className="size-8 rounded-xl bg-clay text-white grid place-items-center font-black text-sm">
                  AL
                </span>
              )}
              <div>
                <h1 className="font-extrabold text-sm tracking-tight text-white leading-tight">Chạm A Lưới</h1>
                <p className="text-[10px] uppercase tracking-widest text-emerald-300 font-bold">Admin Portal</p>
              </div>
            </Link>
            <span className="rounded-full bg-emerald-500/20 text-emerald-300 px-2 py-0.5 text-[10px] font-bold">
              v1.0
            </span>
          </div>

          {/* Navigation Links with Live Badges */}
          <AdminSidebarNav initialBadges={initialBadges} />
        </div>

        {/* Bottom links */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/business"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-300 bg-white/5 hover:bg-white/10 transition"
          >
            <Building2 className="size-4" />
            Xem giao diện Cơ sở
          </Link>
          <a
            href="https://chamaluoi.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white transition"
          >
            <Home className="size-4" />
            Xem web khách
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Desktop Top Header (Hidden on Mobile because MobileAdminNav handles top bar) */}
        <header className="hidden md:flex h-16 bg-white border-b border-black/5 px-6 items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink/60">
            <span>Khu vực Quản trị</span>
            <span>/</span>
            <span className="text-forest font-bold">Hệ thống điều hành</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Chuông báo âm thanh Ding & Nhấp nháy tab khi có đơn mới */}
            <AdminAudioNotifier />

            {notifications.length > 0 ? (
              <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 text-xs font-bold flex items-center gap-1.5 animate-pulse">
                <span className="size-2 rounded-full bg-amber-500" />
                {notifications.length} thông báo mới
              </span>
            ) : null}

            <div className="flex items-center gap-2 text-xs">
              <span className="size-8 rounded-full bg-forest text-white grid place-items-center font-bold">
                AD
              </span>
              <div className="hidden sm:block text-left">
                <p className="font-bold text-ink leading-tight">Admin Tổng</p>
                <p className="text-[10px] text-ink/50">admin@chamaluoi.vn</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content with bottom padding pb-24 for mobile bottom nav bar */}
        <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">{children}</main>
      </div>
    </div>
  );
}
