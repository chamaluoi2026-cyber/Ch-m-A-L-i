"use client";

import { useState } from "react";
import { Shield, ShieldAlert, FileText, Briefcase, DollarSign, Headphones, User, ArrowRight, Loader2 } from "lucide-react";
import { loginWithAccountAction } from "@/app/actions/auth";

interface AdminQuickLoginProps {
  nextUrl?: string;
}

export function AdminQuickLogin({ nextUrl = "/admin" }: AdminQuickLoginProps) {
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [customEmail, setCustomEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const demoAccounts = [
    {
      role: "SUPER_ADMIN",
      title: "Super Admin (Toàn quyền)",
      email: "superadmin@chamaluoi.vn",
      desc: "Toàn quyền hệ thống, phân quyền, cấu hình & tài chính",
      badgeColor: "bg-red-100 text-red-800 border-red-200",
      icon: ShieldAlert
    },
    {
      role: "ADMIN",
      title: "Quản trị viên (Admin)",
      email: "admin@chamaluoi.vn",
      desc: "Quản trị điều hành các mảng Content, Sales, Partners",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      icon: Shield
    },
    {
      role: "FINANCE",
      title: "Kế toán / Tài chính (Finance)",
      email: "finance@chamaluoi.vn",
      desc: "Thanh toán, Đối soát hoa hồng & Quyết toán Payout",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: DollarSign
    },
    {
      role: "CONTENT_MANAGER",
      title: "Biên tập nội dung (Content)",
      email: "content@chamaluoi.vn",
      desc: "Quản lý Blog bài viết, Địa điểm du lịch, Kho ảnh Media",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      icon: FileText
    },
    {
      role: "SALES",
      title: "Kinh doanh & Điều phối (Sales)",
      email: "sales@chamaluoi.vn",
      desc: "Quản lý Leads khách hàng, Bookings, chốt đơn",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      icon: Briefcase
    },
    {
      role: "SUPPORT",
      title: "Chăm sóc khách hàng (Support)",
      email: "support@chamaluoi.vn",
      desc: "Tư vấn Leads, Live Chat, kiểm duyệt đánh giá Review",
      badgeColor: "bg-cyan-100 text-cyan-800 border-cyan-200",
      icon: Headphones
    }
  ];

  async function handleLogin(identifier: string) {
    setLoadingRole(identifier);
    setError(null);

    const res = await loginWithAccountAction(identifier, nextUrl);
    if (res.success && res.redirectUrl) {
      window.location.href = res.redirectUrl;
    } else {
      setError(res.error || "Đăng nhập thất bại.");
      setLoadingRole(null);
    }
  }

  return (
    <div className="text-left space-y-4">
      {error && (
        <div className="rounded-2xl bg-red-50 p-3 text-xs font-bold text-red-700 border border-red-200">
          {error}
        </div>
      )}

      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-forest mb-2">
          Chọn tài khoản quản trị để đăng nhập ngay:
        </p>
        <div className="grid gap-2">
          {demoAccounts.map((acc) => {
            const Icon = acc.icon;
            const isLoading = loadingRole === acc.email;
            return (
              <button
                key={acc.role}
                type="button"
                disabled={Boolean(loadingRole)}
                onClick={() => handleLogin(acc.email)}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-black/10 bg-white hover:border-forest hover:bg-forest/5 transition text-left group shadow-sm disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0 group-hover:bg-forest group-hover:text-white transition">
                    {isLoading ? <Loader2 className="size-5 animate-spin" /> : <Icon className="size-5" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-ink">{acc.title}</span>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${acc.badgeColor}`}>
                        {acc.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink/60 mt-0.5">{acc.desc}</p>
                  </div>
                </div>
                <ArrowRight className="size-4 text-ink/30 group-hover:text-forest group-hover:translate-x-1 transition shrink-0" />
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (customEmail.trim()) {
              handleLogin(customEmail);
            }
          }}
          className="flex gap-2"
        >
          <input
            type="text"
            value={customEmail}
            onChange={(e) => setCustomEmail(e.target.value)}
            placeholder="Hoặc nhập email quản trị khác..."
            className="flex-1 rounded-xl border border-black/15 px-3 py-2 text-xs focus:border-forest focus:outline-none"
          />
          <button
            type="submit"
            disabled={Boolean(loadingRole) || !customEmail.trim()}
            className="rounded-xl bg-forest px-4 py-2 text-xs font-bold text-white hover:bg-forest/90 transition disabled:opacity-50"
          >
            Đăng nhập
          </button>
        </form>
      </div>
    </div>
  );
}
