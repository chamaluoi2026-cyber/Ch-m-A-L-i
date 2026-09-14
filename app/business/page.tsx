import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Gift,
  MessageSquare,
  Sparkles,
  Ticket,
  TrendingUp,
  Users
} from "lucide-react";
import { getLeadsByBusiness, getTransactionsByBusiness, getVouchersByBusiness } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export default function BusinessDashboardPage() {
  const currentBusinessId = "biz-a-nor";
  const leads = getLeadsByBusiness(currentBusinessId);
  const vouchers = getVouchersByBusiness(currentBusinessId);
  const transactions = getTransactionsByBusiness(currentBusinessId);

  const totalRevenue = transactions.reduce((acc, t) => acc + t.orderValue, 0);
  const totalCommissionDue = transactions
    .filter((t) => t.status === "pending_reconciliation")
    .reduce((acc, t) => acc + t.commissionAmount, 0);
  const totalCommissionPaid = transactions
    .filter((t) => t.status === "reconciled")
    .reduce((acc, t) => acc + t.commissionAmount, 0);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-bold text-forest">
            Đối tác chiến lược Chạm A Lưới
          </span>
          <h1 className="text-2xl md:text-3xl font-black text-ink tracking-tight mt-2">
            Hợp tác xã Du lịch Cộng đồng A Nôr
          </h1>
          <p className="text-xs text-ink/60 mt-1">
            Quản lý nguồn khách giới thiệu, xác nhận mã ưu đãi và đối soát hoa hồng minh bạch
          </p>
        </div>

        <Link
          href="/business/vouchers"
          className="rounded-2xl bg-forest hover:bg-forest/90 text-white font-extrabold px-5 py-3 text-sm shadow-md transition flex items-center gap-2"
        >
          <Ticket className="size-5 text-amber-300" />
          Nhập mã Voucher & Hóa đơn khách
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl bg-white p-5 shadow-card border border-black/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/50">Leads được giới thiệu</span>
            <span className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <Users className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-black text-ink">{leads.length}</p>
          <p className="mt-1 text-xs text-ink/50">Khách để lại thông tin quan tâm</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-card border border-black/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink/50">Voucher đang lưu</span>
            <span className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Ticket className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-3xl font-black text-ink">
            {vouchers.filter((v) => v.status === "unused").length}
          </p>
          <p className="mt-1 text-xs text-ink/50">Khách có mã chưa sử dụng</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-card border border-black/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Doanh thu ghi nhận</span>
            <span className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <TrendingUp className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl md:text-3xl font-black text-emerald-800">
            {totalRevenue.toLocaleString("vi-VN")} <span className="text-xs font-normal">đ</span>
          </p>
          <p className="mt-1 text-xs text-ink/50">{transactions.length} lượt khách đã dùng</p>
        </div>

        <div className="rounded-3xl bg-[#16211E] p-5 text-white shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Hoa hồng cần nộp</span>
            <span className="p-2.5 rounded-xl bg-white/10 text-amber-300">
              <DollarSign className="size-4" />
            </span>
          </div>
          <p className="mt-3 text-2xl md:text-3xl font-black text-amber-300">
            {totalCommissionDue.toLocaleString("vi-VN")} <span className="text-xs font-normal">đ</span>
          </p>
          <p className="mt-1 text-xs text-white/70">Tỷ lệ: 10% • Đối soát cuối tháng</p>
        </div>
      </div>

      {/* Two columns: Leads awaiting consultation & Quick Voucher Action */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Leads */}
        <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <div>
                <h2 className="text-lg font-extrabold text-ink">Khách hàng quan tâm gần đây</h2>
                <p className="text-xs text-ink/50">Du khách để lại thông tin để cơ sở chủ động liên hệ</p>
              </div>
              <Link href="/business/leads" className="text-xs font-bold text-forest hover:underline">
                Xem tất cả ({leads.length}) →
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {leads.slice(0, 4).map((l) => (
                <div key={l.leadId} className="rounded-2xl bg-beige/60 p-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-extrabold text-ink text-sm">{l.customerName}</p>
                      <p className="text-ink/60 mt-0.5">SĐT: <strong className="font-mono text-ink">{l.phone}</strong></p>
                    </div>
                    <span className="rounded-full bg-forest/10 px-2.5 py-1 text-[11px] font-bold text-forest">
                      {l.status === "new" ? "Mới gửi" : l.status === "voucher_used" ? "Đã dùng voucher" : "Đang tư vấn"}
                    </span>
                  </div>
                  <div className="mt-2 text-ink/70 flex items-center justify-between border-t border-black/5 pt-2">
                    <span>Dự kiến: {l.expectedDate} ({l.guests} khách)</span>
                    <span className="font-mono text-[11px] text-forest font-bold">Mã: {l.voucherCode}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-black/5 text-right">
            <Link href="/business/leads" className="text-xs font-bold text-forest hover:underline">
              Vào danh sách Leads chi tiết →
            </Link>
          </div>
        </div>

        {/* Quick voucher verification promo card */}
        <div className="rounded-3xl bg-gradient-to-br from-forest to-[#16211E] p-6 text-white shadow-card flex flex-col justify-between">
          <div>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur">
              Quy trình đón khách 3 bước
            </span>
            <h2 className="mt-4 text-2xl font-black leading-tight">
              Khách xuất trình Voucher? Xác nhận ngay trong 30 giây!
            </h2>
            <ol className="mt-4 space-y-2.5 text-xs text-white/85">
              <li className="flex items-start gap-2.5">
                <span className="size-5 rounded-full bg-white/20 grid place-items-center font-bold text-[11px] shrink-0">1</span>
                <span>Yêu cầu khách đọc mã Voucher (ví dụ: <code className="font-mono bg-white/10 px-1 rounded">CAL-VCH-XXXXX</code>)</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="size-5 rounded-full bg-white/20 grid place-items-center font-bold text-[11px] shrink-0">2</span>
                <span>Nhập mã vào hệ thống & áp dụng giảm giá trực tiếp cho khách theo ưu đãi.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="size-5 rounded-full bg-white/20 grid place-items-center font-bold text-[11px] shrink-0">3</span>
                <span>Nhập tổng tiền hóa đơn thực tế để hệ thống tự động ghi nhận hoa hồng đối soát.</span>
              </li>
            </ol>
          </div>

          <div className="mt-6">
            <Link
              href="/business/vouchers"
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-400 text-ink font-black py-3 px-4 shadow-lg hover:bg-amber-300 transition text-sm"
            >
              Mở công cụ Xác nhận Voucher ngay
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
