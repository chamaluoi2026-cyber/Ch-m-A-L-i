import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Calendar,
  CheckCircle2,
  DollarSign,
  Eye,
  FileCheck,
  MapPin,
  MessageSquare,
  Sparkles,
  Ticket,
  TrendingUp,
  Users
} from "lucide-react";
import { getAdminMetrics, getAllLeads, getAllTransactions, getAllBusinesses, getSiteSettingsAsync, defaultTravelConditions } from "@/lib/server-store";
import { AiReportModal } from "@/components/admin/ai-report-modal";
import { TravelConditionsCard } from "@/components/admin/travel-conditions-card";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const metrics = getAdminMetrics();
  const settings = await getSiteSettingsAsync();
  const recentLeads = getAllLeads().slice(0, 5);
  const recentTransactions = getAllTransactions().slice(0, 5);
  const businesses = getAllBusinesses();

  const statCards = [
    { title: "Tổng người dùng", value: metrics.totalUsers, icon: Users, color: "text-blue-600 bg-blue-50" },
    { title: "Doanh nghiệp / Cơ sở", value: metrics.totalBusinesses, icon: Building2, color: "text-purple-600 bg-purple-50" },
    { title: "Địa điểm đối tác", value: metrics.totalPlaces, icon: MapPin, color: "text-emerald-600 bg-emerald-50" },
    { title: "Lượt xem ước tính", value: "3.420+", icon: Eye, color: "text-amber-600 bg-amber-50" },
    { title: "Số Leads tư vấn", value: metrics.totalLeads, icon: MessageSquare, color: "text-clay bg-clay/10" },
    { title: "Voucher đã cấp", value: metrics.totalVouchers, icon: Ticket, color: "text-indigo-600 bg-indigo-50" },
    { title: "Voucher đã sử dụng", value: metrics.vouchersUsed, icon: CheckCircle2, color: "text-emerald-700 bg-emerald-100" },
    { title: "Số giao dịch thực tế", value: metrics.totalTransactions, icon: FileCheck, color: "text-forest bg-forest/10" }
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-ink tracking-tight">Tổng quan Hệ thống Chạm A Lưới</h1>
          <p className="mt-1 text-xs md:text-sm text-ink/60">
            Nền tảng trung gian kết nối du lịch vùng cao • Cập nhật dữ liệu thời gian thực
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <AiReportModal buttonText="✨ Phân tích AI & Báo cáo HTML" />
          <Link
            href="/admin/commissions"
            className="rounded-xl bg-forest px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-forest/90 transition flex items-center gap-2"
          >
            <DollarSign className="size-4" />
            Đối soát hoa hồng ngay ({metrics.pendingReconcileCount} chưa duyệt)
          </Link>
        </div>
      </div>

      {/* Bản tin thực địa A Lưới hôm nay (Travel Conditions) */}
      <TravelConditionsCard initialData={settings.travelConditions || defaultTravelConditions} />

      {/* Financial KPIs Banner */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl bg-gradient-to-br from-forest to-[#16211E] p-6 text-white shadow-lg">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Tổng doanh thu cơ sở tạo ra</p>
          <p className="mt-2 text-3xl md:text-4xl font-black tracking-tight">
            {metrics.totalRevenue.toLocaleString("vi-VN")} <span className="text-lg font-normal">đ</span>
          </p>
          <p className="mt-2 text-xs text-white/70">Ghi nhận qua các hóa đơn du khách sử dụng voucher</p>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-clay to-[#8a4b24] p-6 text-white shadow-lg">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-200">Tổng hoa hồng hệ thống</p>
          <p className="mt-2 text-3xl md:text-4xl font-black tracking-tight">
            {metrics.totalCommission.toLocaleString("vi-VN")} <span className="text-lg font-normal">đ</span>
          </p>
          <p className="mt-2 text-xs text-white/70">Mức hoa hồng thỏa thuận trung bình 8% - 12%</p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-card border border-forest/15">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Hoa hồng chưa đối soát</p>
          <p className="mt-2 text-3xl md:text-4xl font-black tracking-tight text-ink">
            {metrics.pendingReconcileAmount.toLocaleString("vi-VN")} <span className="text-lg font-normal text-ink/50">đ</span>
          </p>
          <div className="mt-2 flex items-center justify-between text-xs font-semibold text-amber-700">
            <span>{metrics.pendingReconcileCount} giao dịch cần kiểm tra</span>
            <Link href="/admin/commissions" className="text-forest hover:underline">
              Chi tiết →
            </Link>
          </div>
        </div>
      </div>

      {/* Core Metrics Grid */}
      <div>
        <h2 className="text-base font-bold uppercase tracking-wider text-ink/70 text-xs mb-3">Chỉ số vận hành hệ thống</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className="rounded-2xl bg-white p-4 shadow-sm border border-black/5 flex items-center gap-3.5">
                <span className={`p-3 rounded-xl ${card.color}`}>
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-xs font-medium text-ink/55 line-clamp-1">{card.title}</p>
                  <p className="text-xl font-black text-ink mt-0.5">{card.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Two Columns: Recent Leads & Recent Transactions */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Leads */}
        <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <div>
                <h3 className="text-lg font-extrabold text-ink">Leads khách hàng mới nhất</h3>
                <p className="text-xs text-ink/50">Khách để lại nhu cầu và nhận mã voucher</p>
              </div>
              <Link href="/admin/leads" className="text-xs font-bold text-forest hover:underline">
                Xem tất cả ({metrics.totalLeads}) →
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.leadId} className="rounded-2xl bg-beige/60 p-3.5 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-forest">{lead.leadId}</span>
                      <span className="font-extrabold text-ink">{lead.customerName}</span>
                      <span className="text-ink/40 font-normal">({lead.phone})</span>
                    </div>
                    <p className="text-ink/65 mt-0.5">
                      Điểm đến: <strong>{lead.placeName}</strong> • {lead.guests} người ({lead.expectedDate})
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block rounded-full bg-forest/10 px-2.5 py-0.5 text-[11px] font-bold text-forest">
                      {lead.status === "new" ? "Mới" : lead.status === "consulting" ? "Đang tư vấn" : "Đã dùng voucher"}
                    </span>
                    <p className="text-[10px] text-ink/40 mt-0.5 font-mono">{lead.voucherCode}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-black/5 text-right">
            <Link href="/admin/leads" className="text-xs font-bold text-forest hover:underline">
              Quản lý chi tiết danh sách Leads →
            </Link>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-black/5">
              <div>
                <h3 className="text-lg font-extrabold text-ink">Giao dịch cơ sở xác nhận gần đây</h3>
                <p className="text-xs text-ink/50">Phát sinh khi khách dùng mã voucher tại chỗ</p>
              </div>
              <Link href="/admin/transactions" className="text-xs font-bold text-forest hover:underline">
                Xem tất cả →
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="rounded-2xl bg-beige/60 p-3.5 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink">{tx.businessName}</span>
                      <span className="font-mono text-[11px] text-forest bg-forest/10 px-1.5 py-0.5 rounded">
                        {tx.voucherCode}
                      </span>
                    </div>
                    <p className="text-ink/65 mt-0.5">
                      Hóa đơn: <strong>{tx.orderValue.toLocaleString("vi-VN")}đ</strong> • Tỷ lệ: {tx.commissionRate}%
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-black text-clay text-sm">+{tx.commissionAmount.toLocaleString("vi-VN")}đ</p>
                    <span className="inline-block rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold mt-0.5">
                      {tx.status === "pending_reconciliation" ? "Chờ đối soát" : "Đã đối soát"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-black/5 text-right">
            <Link href="/admin/commissions" className="text-xs font-bold text-forest hover:underline">
              Vào mục Đối soát Hoa hồng chi tiết →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
