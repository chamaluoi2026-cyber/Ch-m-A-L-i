import Link from "next/link";
import {
  Building2,
  CheckCircle2,
  DollarSign,
  Home,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  ShieldCheck,
  Ticket,
  UserCheck
} from "lucide-react";
import { ReactNode } from "react";

export const metadata = {
  title: "Cổng thông tin Doanh nghiệp & Cơ sở | Chạm A Lưới",
  description: "Bảng điều khiển dành riêng cho đối tác, homestay và hợp tác xã tại A Lưới"
};

const businessNav = [
  { href: "/business", label: "Tổng quan Cơ sở", icon: LayoutDashboard },
  { href: "/business/vouchers", label: "Xác nhận Voucher & Hóa đơn", icon: Ticket, highlight: true },
  { href: "/business/leads", label: "Leads Khách gửi về", icon: MessageSquare },
  { href: "/business/places", label: "Địa điểm & Dịch vụ", icon: MapPin },
  { href: "/business/transactions", label: "Giao dịch & Hoa hồng", icon: DollarSign },
  { href: "/business/profile", label: "Hồ sơ Cơ sở", icon: Building2 }
];

export default function BusinessLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-ink flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#16211E] text-white flex-shrink-0 flex flex-col justify-between">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-white/10">
            <Link href="/" className="flex items-center gap-2">
              <span className="size-8 rounded-xl bg-forest text-white grid place-items-center font-black text-sm border border-emerald-400/40">
                AL
              </span>
              <div>
                <h1 className="font-extrabold text-sm tracking-tight text-white">Chạm A Lưới</h1>
                <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Cổng Doanh nghiệp</p>
              </div>
            </Link>

            {/* Current Partner badge */}
            <div className="mt-4 rounded-xl bg-white/10 p-3 text-xs border border-white/10">
              <p className="text-white/50 text-[10px] uppercase font-bold">Cơ sở đăng nhập:</p>
              <p className="font-bold text-white mt-0.5 line-clamp-1">HTX Du lịch Cộng đồng A Nôr</p>
              <p className="text-[11px] text-emerald-300 font-mono mt-0.5">Tỷ lệ hoa hồng: 10%</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1" aria-label="Menu Doanh nghiệp">
            {businessNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    item.highlight
                      ? "bg-forest text-white shadow-md border border-emerald-400/30"
                      : "text-white/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className={`size-4 shrink-0 ${item.highlight ? "text-amber-300" : "text-emerald-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom links */}
        <div className="p-4 border-t border-white/10 space-y-2">
          <Link
            href="/admin"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-amber-300 bg-white/5 hover:bg-white/10 transition"
          >
            <ShieldCheck className="size-4" />
            Chuyển sang Quản trị Admin
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white transition"
          >
            <Home className="size-4" />
            Về trang chủ khách hàng
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-black/5 px-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2 text-xs font-semibold text-ink/60">
            <span>Không gian Cơ sở</span>
            <span>/</span>
            <span className="text-forest font-bold">Hợp tác xã A Nôr</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/business/vouchers"
              className="rounded-xl bg-forest px-3.5 py-2 text-white font-bold hover:bg-forest/90 transition shadow-sm flex items-center gap-1.5"
            >
              <Ticket className="size-4 text-amber-300" />
              Xác nhận Voucher khách đến
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
