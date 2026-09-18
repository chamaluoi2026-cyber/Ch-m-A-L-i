"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  Loader2,
  DollarSign,
  Briefcase,
  Headphones,
  FileText,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { loginWithAccountAction } from "@/app/actions/auth";

interface AdminLoginViewProps {
  nextUrl?: string;
}

export function AdminLoginView({ nextUrl = "/admin" }: AdminLoginViewProps) {
  const [activeTab, setActiveTab] = useState<"standard" | "quick">("standard");

  // Standard Login State
  const [email, setEmail] = useState("admin@chamaluoi.vn");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Loading and Error State
  const [loading, setLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
      role: "SALES",
      title: "Kinh doanh & Điều phối (Sales)",
      email: "sales@chamaluoi.vn",
      desc: "Quản lý Leads khách hàng, Bookings, chốt đơn",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      icon: Briefcase
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
      role: "SUPPORT",
      title: "Chăm sóc khách hàng (Support)",
      email: "support@chamaluoi.vn",
      desc: "Tư vấn Leads, Live Chat, kiểm duyệt đánh giá Review",
      badgeColor: "bg-cyan-100 text-cyan-800 border-cyan-200",
      icon: Headphones
    }
  ];

  async function executeLogin(identifier: string) {
    setError(null);
    setSuccess(null);

    const res = await loginWithAccountAction(identifier, nextUrl);
    if (res.success && res.redirectUrl) {
      setSuccess("Xác thực thành công! Đang chuyển vào Trung tâm Điều hành...");
      window.location.href = res.redirectUrl;
    } else {
      setError(res.error || "Tài khoản hoặc mật khẩu không chính xác.");
      setLoading(false);
      setLoadingRole(null);
    }
  }

  const handleStandardLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Vui lòng nhập Email hoặc Tên tài khoản quản trị.");
      return;
    }
    setLoading(true);
    await executeLogin(email.trim());
  };

  const handleQuickLogin = async (targetEmail: string) => {
    setLoadingRole(targetEmail);
    await executeLogin(targetEmail);
  };

  return (
    <div className="w-full max-w-xl mx-auto rounded-3xl bg-white shadow-card border border-black/5 overflow-hidden text-left">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#07241D] via-[#0F382E] to-[#124B3E] p-7 md:p-8 text-white relative">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300 border border-white/15 shadow-inner">
              <ShieldCheck className="size-6" />
            </div>
            <div>
              <p className="text-[10px] font-black tracking-widest text-emerald-300 uppercase">
                Hệ Thống Quản Trị & Vận Hành
              </p>
              <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                Chạm A Lưới Admin Portal
              </h1>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            RBAC v2.0
          </span>
        </div>
        <p className="text-xs text-white/70 leading-relaxed">
          Cổng điều phối nội bộ dành cho Ban Điều Hành, Kế toán, Chăm sóc khách hàng và Đối tác bản địa.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-black/5 bg-[#FBFBFB] p-1.5">
        <button
          type="button"
          onClick={() => { setActiveTab("standard"); setError(null); }}
          className={`flex-1 py-2.5 rounded-2xl text-xs md:text-sm font-bold transition flex items-center justify-center gap-2 ${
            activeTab === "standard"
              ? "bg-white text-forest shadow-sm border border-black/5"
              : "text-ink/60 hover:text-ink"
          }`}
        >
          <Lock className="size-4" />
          Đăng Nhập Tiêu Chuẩn
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab("quick"); setError(null); }}
          className={`flex-1 py-2.5 rounded-2xl text-xs md:text-sm font-bold transition flex items-center justify-center gap-2 ${
            activeTab === "quick"
              ? "bg-white text-forest shadow-sm border border-black/5"
              : "text-ink/60 hover:text-ink"
          }`}
        >
          <Sparkles className="size-4 text-amber-500" />
          Đăng Nhập Nhanh (1 Chạm)
        </button>
      </div>

      {/* Form Body */}
      <div className="p-6 md:p-8 space-y-5">
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold leading-relaxed">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
            {success}
          </div>
        )}

        {activeTab === "standard" ? (
          <form onSubmit={handleStandardLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                Email / Tên tài khoản quản trị
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@chamaluoi.vn"
                  className="w-full rounded-2xl border border-black/10 bg-[#FBFBFB] pl-10 pr-4 py-3 text-xs md:text-sm text-ink font-medium focus:border-forest focus:bg-white focus:outline-none transition"
                  required
                />
                <Mail className="absolute left-3.5 top-3.5 size-4 text-ink/40 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-ink">
                  Mật khẩu đăng nhập
                </label>
                <span className="text-[11px] text-ink/40">
                  (Mặc định bảo mật phiên nội bộ)
                </span>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu của bạn..."
                  className="w-full rounded-2xl border border-black/10 bg-[#FBFBFB] pl-10 pr-11 py-3 text-xs md:text-sm text-ink focus:border-forest focus:bg-white focus:outline-none transition"
                />
                <Lock className="absolute left-3.5 top-3.5 size-4 text-ink/40 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-ink/40 hover:text-ink"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-ink/70">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-black/20 text-forest focus:ring-forest size-4"
                />
                <span>Ghi nhớ đăng nhập 30 ngày</span>
              </label>

              <button
                type="button"
                onClick={() => setActiveTab("quick")}
                className="text-xs font-bold text-forest hover:underline"
              >
                Quên mật khẩu? Dùng đăng nhập nhanh →
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-[#0F382E] text-white text-xs md:text-sm font-bold hover:bg-[#0F382E]/90 transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
              {loading ? "Đang xác thực thông tin..." : "Đăng Nhập Quản Trị Hệ Thống"}
            </button>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-bold text-ink/70 uppercase tracking-wider">
              Chọn vai trò để đăng nhập tức thì không cần mật khẩu:
            </p>
            <div className="grid gap-2 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
              {demoAccounts.map((acc) => {
                const Icon = acc.icon;
                const isLoadingThis = loadingRole === acc.email;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    disabled={Boolean(loadingRole)}
                    onClick={() => handleQuickLogin(acc.email)}
                    className="flex items-center justify-between p-3.5 rounded-2xl border border-black/10 bg-white hover:border-forest hover:bg-forest/5 transition text-left group shadow-sm disabled:opacity-60"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-forest/10 text-forest flex items-center justify-center shrink-0 group-hover:bg-forest group-hover:text-white transition">
                        {isLoadingThis ? <Loader2 className="size-5 animate-spin" /> : <Icon className="size-5" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs md:text-sm text-ink">{acc.title}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${acc.badgeColor}`}>
                            {acc.role}
                          </span>
                        </div>
                        <p className="text-[11px] text-ink/60 mt-0.5 line-clamp-1">{acc.desc}</p>
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-ink/30 group-hover:text-forest group-hover:translate-x-1 transition shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Chuyển sang website khách hàng */}
        <div className="pt-3 border-t border-black/5 text-center">
          <p className="text-xs text-ink/50">
            Bạn là Khách du lịch?{" "}
            <a href="http://localhost:3000/login" className="font-bold text-forest hover:underline">
              Chuyển sang Cổng Khách Hàng Chạm A Lưới →
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
