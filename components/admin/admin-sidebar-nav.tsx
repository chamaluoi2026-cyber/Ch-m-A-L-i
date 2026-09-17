"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Building2,
  Calendar,
  CheckSquare,
  CreditCard,
  DollarSign,
  FileText,
  Headphones,
  Image as ImageIcon,
  LayoutDashboard,
  MapPin,
  MessageSquare,
  Package,
  ShieldAlert,
  Star,
  Ticket,
  Users
} from "lucide-react";
import type { AdminBadgeCounts } from "@/lib/admin-badges";

interface AdminSidebarNavProps {
  initialBadges?: AdminBadgeCounts;
}

type NavItem = {
  href: string;
  label: string;
  icon: any;
  badgeKey?: keyof AdminBadgeCounts;
  badgeColor?: string;
  pulse?: boolean;
};

const navItems: NavItem[] = [
  { href: "/admin", label: "Tổng quan Dashboard", icon: LayoutDashboard },
  {
    href: "/admin/chat",
    label: "Tư vấn & Live Chat",
    icon: Headphones,
    badgeKey: "chat",
    badgeColor: "bg-teal-500 text-white",
    pulse: true
  },
  { href: "/admin/blogs", label: "Quản lý Blog", icon: FileText },
  { href: "/admin/businesses", label: "Doanh nghiệp & Cơ sở", icon: Building2 },
  { href: "/admin/places", label: "Quản lý Địa điểm", icon: MapPin },
  {
    href: "/admin/leads",
    label: "Quản lý Leads",
    icon: MessageSquare,
    badgeKey: "leads",
    badgeColor: "bg-amber-500 text-white font-bold"
  },
  {
    href: "/admin/bookings",
    label: "Quản lý Bookings",
    icon: Calendar,
    badgeKey: "bookings",
    badgeColor: "bg-rose-500 text-white font-extrabold shadow-sm",
    pulse: true
  },
  { href: "/admin/orders", label: "Đơn tour & Sản phẩm", icon: Package },
  {
    href: "/admin/payments",
    label: "Thanh toán & VietQR",
    icon: CreditCard,
    badgeKey: "payments",
    badgeColor: "bg-sky-500 text-white font-bold"
  },
  { href: "/admin/commissions", label: "Đối soát Hoa hồng", icon: DollarSign },
  { href: "/admin/reconciliation", label: "Trung tâm Quyết toán & Ký duyệt", icon: BarChart3 },
  { href: "/admin/vouchers", label: "Kho Voucher", icon: Ticket },
  {
    href: "/admin/reviews",
    label: "Kiểm duyệt Đánh giá",
    icon: Star,
    badgeKey: "reviews",
    badgeColor: "bg-indigo-500 text-white font-bold"
  },
  { href: "/admin/transactions", label: "Nhật ký Giao dịch", icon: CheckSquare },
  { href: "/admin/media", label: "Thư viện Media & Hình ảnh", icon: ImageIcon },
  {
    href: "/admin/notifications",
    label: "Cấu hình Thông báo (Telegram)",
    icon: Bell,
    badgeKey: "notifications",
    badgeColor: "bg-emerald-500 text-white font-bold"
  },
  { href: "/admin/users", label: "Quản lý Người dùng", icon: Users },
  { href: "/admin/audit-logs", label: "Nhật ký Kiểm toán (Audit)", icon: ShieldAlert }
];

export function AdminSidebarNav({ initialBadges }: AdminSidebarNavProps) {
  const pathname = usePathname();
  const [badges, setBadges] = useState<AdminBadgeCounts>(
    initialBadges || {
      bookings: 0,
      leads: 0,
      chat: 0,
      reviews: 0,
      payments: 0,
      notifications: 0
    }
  );

  useEffect(() => {
    let isMounted = true;

    async function fetchBadgeCounts() {
      try {
        const res = await fetch("/api/admin/badge-counts", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.success && data.badges) {
          setBadges(data.badges);
        }
      } catch (err) {
        // Fallback im lặng nếu mạng chậm
      }
    }

    // Polling định kỳ mỗi 45 giây để cập nhật số lượng mới nhất
    const interval = setInterval(fetchBadgeCounts, 45000);

    // Cập nhật khi tab trình duyệt được active lại
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        fetchBadgeCounts();
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isMounted = false;
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <nav className="p-3 space-y-1" aria-label="Menu Quản trị">
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
            aria-current={isActive ? "page" : undefined}
            className={`group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
              isActive
                ? "bg-emerald-500/20 text-white font-bold border-l-4 border-emerald-400 pl-2.5 shadow-sm"
                : "text-white/75 hover:bg-white/10 hover:text-white"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              <Icon
                className={`size-4 shrink-0 transition-colors ${
                  isActive
                    ? "text-emerald-300"
                    : "text-emerald-400/80 group-hover:text-emerald-300"
                }`}
              />
              <span className="truncate">{item.label}</span>
            </div>

            {count > 0 && (
              <span
                className={`shrink-0 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] leading-none ${
                  item.badgeColor || "bg-emerald-500 text-white"
                } ${item.pulse ? "animate-pulse" : ""}`}
                title={`${count} mục cần xử lý`}
              >
                {displayCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
