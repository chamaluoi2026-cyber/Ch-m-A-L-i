import Link from "next/link";
import {
  BarChart3,
  Building2,
  CheckSquare,
  CreditCard,
  Calendar,
  DollarSign,
  FileText,
  Headphones,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Package,
  Settings,
  ShieldAlert,
  Star,
  Ticket,
  Users
} from "lucide-react";
import { ReactNode } from "react";
import { getNotifications, getSiteSettings } from "@/lib/server-store";
import { AppImage } from "@/components/ui/app-image";

export const metadata = {
  title: "Quản trị hệ thống | Chạm A Lưới",
  description: "Bảng điều khiển quản trị nền tảng kết nối du lịch cộng đồng Chạm A Lưới"
};

const adminNav = [
  { href: "/admin", label: "Tổng quan Dashboard", icon: LayoutDashboard },
  { href: "/admin/chat", label: "Tư vấn & Live Chat", icon: Headphones },
  { href: "/admin/blogs", label: "Quản lý Blog", icon: FileText },
  { href: "/admin/businesses", label: "Doanh nghiệp & Cơ sở", icon: Building2 },
  { href: "/admin/places", label: "Quản lý Địa điểm", icon: MapPin },
  { href: "/admin/leads", label: "Quản lý Leads", icon: MessageSquare },
  { href: "/admin/bookings", label: "Quản lý Bookings", icon: Calendar },
  { href: "/admin/payments", label: "Quản lý Thanh toán", icon: CreditCard },
  { href: "/admin/reviews", label: "Kiểm duyệt Đánh giá", icon: Star },
  { href: "/admin/vouchers", label: "Kho Voucher", icon: Ticket },
  { href: "/admin/transactions", label: "Nhật ký Giao dịch", icon: CheckSquare },
  { href: "/admin/commissions", label: "Đối soát Hoa hồng", icon: DollarSign },
  { href: "/admin/reconciliation", label: "Trung tâm Quyết toán & Ký duyệt", icon: BarChart3 },
  { href: "/admin/media", label: "Media & Cấu hình Website", icon: ImageIcon },
  { href: "/admin/orders", label: "Đơn tour & Sản phẩm", icon: Package },
  { href: "/admin/users", label: "Quản lý Người dùng", icon: Users },
  { href: "/admin/audit-logs", label: "Nhật ký Kiểm toán (Audit)", icon: ShieldAlert }
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const notifications = getNotifications().filter((n) => !n.isRead);
  const siteSettings = getSiteSettings();

  return (
    <div className="min-h-screen bg-[#F4F6F5] text-ink flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0F382E] text-white flex-shrink-0 flex flex-col justify-between">
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

          {/* Navigation Links */}
          <nav className="p-3 space-y-1" aria-label="Menu Quản trị">
            {adminNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-white/80 hover:bg-white/10 hover:text-white transition"
                >
                  <Icon className="size-4 shrink-0 text-emerald-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
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
            href="http://localhost:3000"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white transition"
          >
            <Home className="size-4" />
            Xem web khách (Port 3000)
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-black/5 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink/60">
            <span>Khu vực Quản trị</span>
            <span>/</span>
            <span className="text-forest font-bold">Hệ thống điều hành</span>
          </div>

          <div className="flex items-center gap-4">
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

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
