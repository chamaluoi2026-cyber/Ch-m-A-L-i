"use client";

import { useEffect, useState } from "react";
import { fetchAllTransactionsAction, reconcileTransactionAction } from "@/app/actions/transactions";
import { fetchBusinessesAction } from "@/app/actions/business";
import { fetchAllBookingsAction } from "@/app/actions/bookings";
import type { BookingRecord } from "@/lib/server-store";
import type { TransactionRecord } from "@/lib/leads";
import type { BusinessRecord } from "@/lib/server-store";
import {
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Filter,
  RefreshCw,
  ShieldCheck,
  TrendingUp
} from "lucide-react";

export default function AdminCommissionsPage() {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [selectedBiz, setSelectedBiz] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);

  useEffect(() => {
    fetchAllTransactionsAction().then(setTransactions);
    fetchBusinessesAction().then(setBusinesses);
    fetchAllBookingsAction().then(setBookings);
  }, []);

  async function handleReconcile(transactionId: string) {
    setProcessingId(transactionId);
    const res = await reconcileTransactionAction(transactionId);
    setProcessingId(null);
    if (res.success) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === transactionId ? { ...t, status: "reconciled" } : t))
      );
    }
  }

  const filtered = transactions.filter((t) => {
    const matchBiz = selectedBiz === "all" || t.businessId === selectedBiz || t.businessName === selectedBiz;
    const matchStatus = selectedStatus === "all" || t.status === selectedStatus;
    return matchBiz && matchStatus;
  });

  const totalOrderValue = filtered.reduce((acc, t) => acc + t.orderValue, 0);
  const totalCommission = filtered.reduce((acc, t) => acc + t.commissionAmount, 0);
  const pendingCount = filtered.filter((t) => t.status === "pending_reconciliation").length;
  const pendingAmount = filtered
    .filter((t) => t.status === "pending_reconciliation")
    .reduce((acc, t) => acc + t.commissionAmount, 0);
  const reconciledAmount = filtered
    .filter((t) => t.status === "reconciled")
    .reduce((acc, t) => acc + t.commissionAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">Trung tâm Đối soát & Quyết toán Hoa hồng</h1>
          <p className="text-xs text-ink/60 mt-1">
            Ghi nhận hoa hồng giới thiệu từ voucher, tính toán tự động và đối soát định kỳ với doanh nghiệp đối tác
          </p>
        </div>
      </div>

      {/* Marketing Attribution & Conversion Overview (Yêu cầu 8) */}
      <div className="rounded-3xl bg-gradient-to-r from-[#0F382E] to-[#1b5e4f] p-6 text-white shadow-card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Tracking Marketing & Attribution</span>
            <h2 className="text-xl font-black mt-0.5">Hiệu quả Chuyển đổi: Website → Lead → Booking → Hoa hồng</h2>
          </div>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-mono font-bold text-emerald-200">
            {bookings.length} Đơn chốt từ hệ thống
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-4 text-xs">
          <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
            <span className="text-white/70 font-semibold uppercase tracking-wider text-[10px]">Tổng GMV Booking</span>
            <p className="mt-1 text-xl font-black text-white">
              {bookings.reduce((sum, b) => sum + (b.finalAmount || 0), 0).toLocaleString("vi-VN")} đ
            </p>
            <span className="text-[10px] text-emerald-300 mt-1 block">Giá trị giao dịch toàn sàn</span>
          </div>

          <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
            <span className="text-white/70 font-semibold uppercase tracking-wider text-[10px]">Hoa hồng tích lũy</span>
            <p className="mt-1 text-xl font-black text-amber-300">
              {bookings.reduce((sum, b) => sum + (b.commissionAmount || Math.round((b.finalAmount * (b.commissionRate || 10)) / 100)), 0).toLocaleString("vi-VN")} đ
            </p>
            <span className="text-[10px] text-amber-200 mt-1 block">Dựa trên tỷ lệ hoa hồng đối tác</span>
          </div>

          <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
            <span className="text-white/70 font-semibold uppercase tracking-wider text-[10px]">Đơn phát sinh từ Lead</span>
            <p className="mt-1 text-xl font-black text-white">
              {bookings.filter(b => Boolean(b.leadId)).length} / {bookings.length} đơn
            </p>
            <span className="text-[10px] text-emerald-300 mt-1 block">Giữ trọn attribution leadId</span>
          </div>

          <div className="rounded-2xl bg-white/10 p-3.5 backdrop-blur-sm">
            <span className="text-white/70 font-semibold uppercase tracking-wider text-[10px]">Kênh chuyển đổi chính</span>
            <p className="mt-1 text-lg font-black text-emerald-200">
              WEBSITE & ZALO
            </p>
            <span className="text-[10px] text-white/70 mt-1 block">Khách chốt qua Zalo & Hotline</span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 shadow-card border border-black/5">
          <p className="text-xs font-bold uppercase tracking-wider text-ink/50">Doanh số theo bộ lọc</p>
          <p className="mt-2 text-2xl font-black text-ink">
            {totalOrderValue.toLocaleString("vi-VN")} <span className="text-sm font-normal text-ink/40">đ</span>
          </p>
          <p className="mt-1 text-xs text-ink/50">{filtered.length} giao dịch được chọn</p>
        </div>

        <div className="rounded-3xl bg-white p-5 shadow-card border border-black/5">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-600">Hoa hồng chưa đối soát</p>
          <p className="mt-2 text-2xl font-black text-amber-700">
            {pendingAmount.toLocaleString("vi-VN")} <span className="text-sm font-normal text-amber-600/60">đ</span>
          </p>
          <p className="mt-1 text-xs text-amber-800 font-semibold">{pendingCount} giao dịch đang chờ quyết toán</p>
        </div>

        <div className="rounded-3xl bg-forest p-5 text-white shadow-card">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">Hoa hồng đã quyết toán</p>
          <p className="mt-2 text-2xl font-black">
            {reconciledAmount.toLocaleString("vi-VN")} <span className="text-sm font-normal text-white/60">đ</span>
          </p>
          <p className="mt-1 text-xs text-emerald-100/70">Đã chốt sổ đối soát thành công</p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl shadow-sm border border-black/5">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="size-4 text-forest" />
            <span className="font-bold text-ink">Lọc theo Cơ sở:</span>
            <select
              value={selectedBiz}
              onChange={(e) => setSelectedBiz(e.target.value)}
              className="rounded-xl border border-black/10 bg-beige/60 px-3 py-1.5 font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-forest"
            >
              <option value="all">Tất cả các cơ sở</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.commissionRate}%)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 pl-3 border-l border-black/10">
            <span className="font-bold text-ink">Trạng thái:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="rounded-xl border border-black/10 bg-beige/60 px-3 py-1.5 font-semibold text-ink focus:outline-none focus:ring-1 focus:ring-forest"
            >
              <option value="all">Tất cả</option>
              <option value="pending_reconciliation">Chờ đối soát</option>
              <option value="reconciled">Đã đối soát</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-ink/50 font-semibold">
          Công thức: <code className="bg-beige px-2 py-1 rounded text-forest font-bold">hoa_hong = hoa_don * ty_le / 100</code>
        </div>
      </div>

      {/* Reconciliation Table */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-card border border-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-forest/5 text-ink/70 font-bold uppercase tracking-wider border-b border-black/5">
              <tr>
                <th className="p-4">Mã GD & Ngày</th>
                <th className="p-4">Mã Voucher / Lead</th>
                <th className="p-4">Cơ sở thụ hưởng</th>
                <th className="p-4 text-right">Giá trị hóa đơn</th>
                <th className="p-4 text-center">Tỷ lệ</th>
                <th className="p-4 text-right">Hoa hồng phải nộp</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right">Thao tác đối soát</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-ink/50">
                    Không có bản ghi đối soát nào cho bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filtered.map((tx) => (
                  <tr key={tx.id} className="hover:bg-beige/40 transition">
                    <td className="p-4">
                      <p className="font-mono font-bold text-ink">{tx.id}</p>
                      <p className="text-[10px] text-ink/40 mt-0.5">
                        {new Date(tx.confirmedAt).toLocaleDateString("vi-VN")}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className="font-mono font-bold text-forest bg-forest/10 px-2 py-0.5 rounded">
                        {tx.voucherCode}
                      </span>
                      <p className="font-mono text-[10px] text-ink/40 mt-1">Lead: {tx.leadId}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-extrabold text-ink">{tx.businessName}</p>
                      <p className="text-[11px] text-ink/50">{tx.placeName}</p>
                    </td>
                    <td className="p-4 text-right font-extrabold text-ink text-sm">
                      {tx.orderValue.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="p-4 text-center font-bold text-ink/80">
                      {tx.commissionRate}%
                    </td>
                    <td className="p-4 text-right font-black text-clay text-sm">
                      +{tx.commissionAmount.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="p-4 text-center">
                      {tx.status === "reconciled" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1 text-[11px] font-bold">
                          <CheckCircle2 className="size-3" /> Đã đối soát
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2.5 py-1 text-[11px] font-bold">
                          <Clock className="size-3" /> Chờ quyết toán
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {tx.status === "pending_reconciliation" ? (
                        <button
                          type="button"
                          disabled={processingId === tx.id}
                          onClick={() => handleReconcile(tx.id)}
                          className="rounded-xl bg-forest hover:bg-forest/90 text-white font-bold px-3 py-1.5 transition text-[11px] disabled:opacity-50"
                        >
                          {processingId === tx.id ? "Đang xử lý..." : "Xác nhận đối soát"}
                        </button>
                      ) : (
                        <span className="text-emerald-700 font-bold text-[11px] flex items-center justify-end gap-1">
                          <ShieldCheck className="size-3.5" /> Hoàn tất
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
