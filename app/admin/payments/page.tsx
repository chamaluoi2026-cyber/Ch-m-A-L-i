"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  CreditCard,
  QrCode,
  Building2,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Eye,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  fetchAllPaymentsAction,
  verifyPaymentCallbackAction,
  processRefundAction
} from "@/app/actions/payments";
import type { PaymentRecord } from "@/lib/server-store";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [methodFilter, setMethodFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [refundAmount, setRefundAmount] = useState<number | "">("");
  const [isPending, startTransition] = useTransition();

  const loadData = () => {
    setLoading(true);
    fetchAllPaymentsAction()
      .then((data) => {
        setPayments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalPaid = payments
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + p.amount, 0);

  const totalRefunded = payments
    .filter((p) => p.status === "REFUNDED" || p.status === "PARTIALLY_REFUNDED")
    .reduce((sum, p) => sum + (p.refundAmount || p.amount), 0);

  const counts = {
    all: payments.length,
    paid: payments.filter((p) => p.status === "PAID").length,
    pending: payments.filter((p) => p.status === "PENDING" || p.status === "PROCESSING").length,
    failed: payments.filter((p) => p.status === "FAILED").length,
    refunded: payments.filter((p) => p.status === "REFUNDED" || p.status === "PARTIALLY_REFUNDED").length
  };

  const filteredPayments = payments.filter((p) => {
    if (statusFilter !== "ALL") {
      if (statusFilter === "PENDING_GROUP" && p.status !== "PENDING" && p.status !== "PROCESSING") return false;
      if (statusFilter === "REFUND_GROUP" && p.status !== "REFUNDED" && p.status !== "PARTIALLY_REFUNDED") return false;
      if (statusFilter !== "PENDING_GROUP" && statusFilter !== "REFUND_GROUP" && p.status !== statusFilter) return false;
    }
    if (methodFilter !== "ALL" && p.method !== methodFilter) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.id.toLowerCase().includes(q) ||
      p.paymentCode.toLowerCase().includes(q) ||
      p.bookingId.toLowerCase().includes(q) ||
      p.customerName.toLowerCase().includes(q) ||
      (p.providerTransactionId && p.providerTransactionId.toLowerCase().includes(q))
    );
  });

  const handleManualVerify = (p: PaymentRecord) => {
    if (!confirm(`Xác thực thanh toán thủ công cho giao dịch ${p.paymentCode} (${p.amount.toLocaleString("vi-VN")} đ)?`)) return;

    startTransition(async () => {
      const res = await verifyPaymentCallbackAction({
        paymentIdOrCode: p.id,
        receivedAmount: p.amount,
        providerTransactionId: `MANUAL-ADMIN-${Date.now()}`,
        actor: { id: "admin-1", name: "Kế toán Admin", role: "admin" }
      });
      if (res.success && res.payment) {
        setPayments((prev) => prev.map((item) => (item.id === p.id ? res.payment! : item)));
        if (selectedPayment?.id === p.id) setSelectedPayment(res.payment);
      } else {
        alert(res.error || "Lỗi xác thực");
      }
    });
  };

  const handleProcessRefund = (p: PaymentRecord) => {
    const reason = refundReason.trim() || "Hoàn tiền theo yêu cầu khách hàng";
    const amount = typeof refundAmount === "number" && refundAmount > 0 ? refundAmount : p.amount;

    startTransition(async () => {
      const res = await processRefundAction({
        paymentIdOrCode: p.id,
        refundAmount: amount,
        reason,
        actor: { id: "admin-1", name: "Quản trị viên", role: "admin" }
      });
      if (res.success && res.payment) {
        setPayments((prev) => prev.map((item) => (item.id === p.id ? res.payment! : item)));
        setSelectedPayment(res.payment);
        setRefundReason("");
        setRefundAmount("");
        alert("Đã xử lý hoàn tiền thành công!");
      } else {
        alert(res.error || "Lỗi hoàn tiền");
      }
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-forest/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-forest text-white">
              <CreditCard className="size-6" />
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-ink">Quản lý Thanh toán & Dòng tiền</h1>
          </div>
          <p className="text-xs md:text-sm text-ink/60 mt-1">
            Theo dõi, đối soát và xử lý các giao dịch thanh toán (VietQR, Chuyển khoản, COD, Cổng thanh toán) có kiểm tra Idempotency và Server-side Verification.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading} className="border-forest/20">
            <RefreshCw className={`size-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider opacity-75">Thực thu thành công</p>
          <p className="text-2xl font-black mt-1">{totalPaid.toLocaleString("vi-VN")} đ</p>
          <p className="text-[11px] text-emerald-700 mt-1 font-semibold">{counts.paid} giao dịch đã PAID</p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider opacity-75">Chờ thanh toán / xử lý</p>
          <p className="text-2xl font-black mt-1">{counts.pending}</p>
          <p className="text-[11px] text-amber-700 mt-1 font-semibold">Giao dịch PENDING hoặc COD</p>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider opacity-75">Thất bại / Hủy</p>
          <p className="text-2xl font-black mt-1">{counts.failed}</p>
          <p className="text-[11px] text-rose-700 mt-1 font-semibold">Sai số tiền hoặc hết hạn</p>
        </div>

        <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider opacity-75">Tiền đã hoàn (Refund)</p>
          <p className="text-2xl font-black mt-1">{totalRefunded.toLocaleString("vi-VN")} đ</p>
          <p className="text-[11px] text-indigo-700 mt-1 font-semibold">{counts.refunded} giao dịch hoàn trả</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-forest/10 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {[
            { key: "ALL", label: "Tất cả" },
            { key: "PAID", label: `Đã thu (${counts.paid})` },
            { key: "PENDING_GROUP", label: `Chờ xử lý (${counts.pending})` },
            { key: "REFUND_GROUP", label: `Hoàn tiền (${counts.refunded})` },
            { key: "FAILED", label: `Thất bại (${counts.failed})` }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                statusFilter === tab.key
                  ? "bg-forest text-white shadow-sm"
                  : "bg-forest/5 text-ink/70 hover:bg-forest/10"
              }`}
            >
              {tab.label}
            </button>
          ))}

          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-xl border border-forest/20 bg-white font-medium focus:outline-none"
          >
            <option value="ALL">Mọi phương thức</option>
            <option value="qr">VietQR (Napas247)</option>
            <option value="bank_transfer">Chuyển khoản</option>
            <option value="cod">Tiền mặt (COD)</option>
            <option value="gateway">Cổng Online</option>
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink/40" />
          <input
            type="text"
            placeholder="Tìm theo mã giao dịch, đơn, khách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-forest/20 focus:outline-none focus:border-forest"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-3xl border border-forest/10 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-ink/50 text-sm">Đang tải danh sách thanh toán...</div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CreditCard className="size-10 text-forest/30 mx-auto" />
            <p className="text-sm font-bold text-ink">Không có giao dịch thanh toán nào</p>
            <p className="text-xs text-ink/50">Khi khách thực hiện thanh toán cho các đơn đặt, lịch sử giao dịch sẽ hiển thị tại đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-beige/60 text-ink/60 uppercase font-extrabold border-b border-forest/10">
                <tr>
                  <th className="p-4">Mã thanh toán</th>
                  <th className="p-4">Đơn đặt (Booking)</th>
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Số tiền</th>
                  <th className="p-4">Phương thức & Cổng</th>
                  <th className="p-4">Trạng thái</th>
                  <th className="p-4">Thời gian</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/5">
                {filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-forest/5 transition">
                    <td className="p-4">
                      <div className="font-mono font-bold text-forest">{p.paymentCode}</div>
                      <div className="text-[10px] text-ink/40 font-mono">ID: {p.id}</div>
                    </td>

                    <td className="p-4">
                      <Link
                        href={`/admin/bookings/${p.bookingId}`}
                        className="font-mono font-bold text-ink hover:text-forest flex items-center gap-1"
                      >
                        {p.bookingId}
                        <ExternalLink className="size-3 text-ink/40" />
                      </Link>
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-ink">{p.customerName}</div>
                      {p.customerPhone && <div className="text-[11px] text-ink/50">{p.customerPhone}</div>}
                    </td>

                    <td className="p-4">
                      <div className="font-black text-ink text-sm">
                        {p.amount.toLocaleString("vi-VN")} đ
                      </div>
                      {p.refundAmount && (
                        <div className="text-[10px] text-rose-600 font-bold">
                          Đã hoàn: {p.refundAmount.toLocaleString("vi-VN")} đ
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-1 font-bold text-ink uppercase">
                        {p.method === "qr" ? <QrCode className="size-3.5 text-forest" /> : <CreditCard className="size-3.5 text-forest" />}
                        <span>{p.method}</span>
                      </div>
                      <div className="text-[10px] text-ink/50 uppercase font-mono mt-0.5">
                        Provider: {p.provider}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                        p.status === "PAID"
                          ? "bg-emerald-100 text-emerald-800"
                          : p.status === "PROCESSING"
                          ? "bg-blue-100 text-blue-800"
                          : p.status === "PENDING"
                          ? "bg-amber-100 text-amber-800"
                          : p.status === "FAILED"
                          ? "bg-rose-100 text-rose-800"
                          : p.status === "REFUNDED" || p.status === "PARTIALLY_REFUNDED"
                          ? "bg-indigo-100 text-indigo-800"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {p.status === "PAID" && <CheckCircle2 className="size-3" />}
                        {p.status === "PENDING" && <Clock className="size-3" />}
                        {p.status === "REFUNDED" && <RotateCcw className="size-3" />}
                        {p.status}
                      </span>
                    </td>

                    <td className="p-4 text-ink/60 whitespace-nowrap">
                      {new Date(p.createdAt).toLocaleDateString("vi-VN")}
                      <div className="text-[10px] text-ink/40 font-mono">
                        {new Date(p.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedPayment(p);
                            setRefundAmount(p.amount);
                          }}
                          className="h-8 px-2 text-forest hover:bg-forest/10"
                        >
                          <Eye className="size-3.5 mr-1" /> Xem
                        </Button>

                        {(p.status === "PENDING" || p.status === "PROCESSING") && (
                          <Button
                            size="sm"
                            onClick={() => handleManualVerify(p)}
                            disabled={isPending}
                            className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                          >
                            <CheckCircle2 className="size-3.5 mr-1" /> Xác nhận
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Detail & Refund Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 md:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-forest/10 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-forest">{selectedPayment.paymentCode}</span>
                <h3 className="text-xl font-extrabold text-ink mt-0.5">Chi tiết Giao dịch Thanh toán</h3>
                <p className="text-xs text-ink/60">ID: {selectedPayment.id}</p>
              </div>
              <button
                onClick={() => setSelectedPayment(null)}
                className="text-ink/40 hover:text-ink text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Main Info */}
            <div className="grid grid-cols-2 gap-3 bg-beige/60 p-4 rounded-2xl text-xs">
              <div>
                <p className="text-ink/50 font-medium">Đơn đặt liên kết:</p>
                <Link
                  href={`/admin/bookings/${selectedPayment.bookingId}`}
                  className="font-mono font-bold text-forest hover:underline flex items-center gap-1 mt-0.5"
                >
                  {selectedPayment.bookingId}
                  <ExternalLink className="size-3" />
                </Link>
                <p className="text-[11px] text-ink/60 mt-2">Khách hàng:</p>
                <p className="font-bold text-ink">{selectedPayment.customerName}</p>
                <p className="text-[11px] text-ink/50">{selectedPayment.customerPhone}</p>
              </div>

              <div>
                <p className="text-ink/50 font-medium">Số tiền thanh toán:</p>
                <p className="text-lg font-black text-ink mt-0.5">
                  {selectedPayment.amount.toLocaleString("vi-VN")} đ
                </p>
                <p className="text-[11px] text-ink/60 mt-2">Phương thức / Cổng:</p>
                <p className="font-bold text-ink uppercase">{selectedPayment.method} ({selectedPayment.provider})</p>
                {selectedPayment.providerTransactionId && (
                  <p className="text-[10px] font-mono text-ink/50">Mã GD: {selectedPayment.providerTransactionId}</p>
                )}
              </div>
            </div>

            {/* Status & Timing */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-forest/5 text-xs border border-forest/10">
              <div>
                <p className="text-ink/50 font-medium">Trạng thái:</p>
                <p className="font-black text-ink mt-0.5">{selectedPayment.status}</p>
              </div>
              <div>
                <p className="text-ink/50 font-medium">Thời gian thanh toán:</p>
                <p className="font-mono font-bold text-ink mt-0.5">
                  {selectedPayment.paidAt ? new Date(selectedPayment.paidAt).toLocaleString("vi-VN") : "Chưa hoàn tất"}
                </p>
              </div>
            </div>

            {/* Refund Section */}
            {selectedPayment.status === "PAID" && (
              <div className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50/50 space-y-3">
                <div className="flex items-center gap-2 text-indigo-950 font-bold text-xs">
                  <RotateCcw className="size-4 text-indigo-600" />
                  <span>Xử lý Hoàn tiền (Refund)</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-ink/70 mb-1">Số tiền hoàn (VND):</label>
                    <input
                      type="number"
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(Number(e.target.value))}
                      className="w-full p-2 text-xs rounded-xl border border-indigo-200 bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-ink/70 mb-1">Lý do hoàn trả:</label>
                    <input
                      type="text"
                      placeholder="Lý do hoàn trả..."
                      value={refundReason}
                      onChange={(e) => setRefundReason(e.target.value)}
                      className="w-full p-2 text-xs rounded-xl border border-indigo-200 bg-white"
                    />
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleProcessRefund(selectedPayment)}
                  disabled={isPending}
                  className="w-full bg-indigo-700 hover:bg-indigo-800 text-white font-bold text-xs"
                >
                  <RotateCcw className="size-3.5 mr-1.5" />
                  Xác nhận hoàn tiền
                </Button>
              </div>
            )}

            {/* Actions footer */}
            <div className="flex items-center justify-between pt-3 border-t border-forest/10">
              {(selectedPayment.status === "PENDING" || selectedPayment.status === "PROCESSING") ? (
                <Button
                  size="sm"
                  onClick={() => handleManualVerify(selectedPayment)}
                  disabled={isPending}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                >
                  <CheckCircle2 className="size-3.5 mr-1.5" />
                  Xác nhận đã nhận tiền (Khớp thủ công)
                </Button>
              ) : <div />}

              <Button variant="outline" size="sm" onClick={() => setSelectedPayment(null)} className="text-xs">
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
