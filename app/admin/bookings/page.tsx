"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  fetchAllBookingsAction,
  updateBookingStatusAction,
  updateBookingPaymentAction
} from "@/app/actions/bookings";
import type { BookingRecord, BookingStatus, PaymentStatus } from "@/lib/server-store";
import {
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  ExternalLink,
  Eye,
  Filter,
  MapPin,
  Package,
  Phone,
  Search,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  User,
  Users,
  XCircle
} from "lucide-react";
import { BookingDetailView } from "@/components/admin/booking-detail-view";

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "tour" | "homestay" | "product">("all");
  const [filterBookingStatus, setFilterBookingStatus] = useState<string>("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function loadBookings() {
    fetch("/api/bookings", { cache: "no-store" })
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        } else {
          fetchAllBookingsAction().then(setBookings);
        }
      })
      .catch(() => fetchAllBookingsAction().then(setBookings));
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handleQuickStatusChange(id: string, status: BookingStatus) {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, bookingStatus: status })
      });
      const data = await res.json();
      if (data.success && data.booking) {
        setBookings((prev) => prev.map((b) => (b.id === id ? data.booking! : b)));
        setUpdatingId(null);
        return;
      }
    } catch {}
    const res = await updateBookingStatusAction(id, status, {
      id: "usr-admin-1",
      name: "Ban Quản Trị",
      role: "admin"
    });
    setUpdatingId(null);
    if (res.success && res.booking) {
      setBookings((prev) => prev.map((b) => (b.id === id ? res.booking! : b)));
    }
  }

  async function handleQuickPaymentChange(id: string, status: PaymentStatus) {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, paymentStatus: status })
      });
      const data = await res.json();
      if (data.success && data.booking) {
        setBookings((prev) => prev.map((b) => (b.id === id ? data.booking! : b)));
        setUpdatingId(null);
        return;
      }
    } catch {}
    const res = await updateBookingPaymentAction(id, status, {
      actor: { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" }
    });
    setUpdatingId(null);
    if (res.success && res.booking) {
      setBookings((prev) => prev.map((b) => (b.id === id ? res.booking! : b)));
    }
  }

  // Dashboard Metrics (Yêu cầu 4)
  const metrics = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    const total = bookings.length;
    const todayCount = bookings.filter((b) => (
      (b.bookingDate && b.bookingDate.startsWith(todayStr)) ||
      (b.createdAt && b.createdAt.startsWith(todayStr))
    )).length;
    const pendingCount = bookings.filter((b) => (b.bookingStatus === "pending" || b.status === "pending")).length;
    const confirmedCount = bookings.filter((b) => (b.bookingStatus === "confirmed" || b.status === "confirmed")).length;
    const completedCount = bookings.filter((b) => (b.bookingStatus === "completed" || b.status === "completed")).length;
    const cancelledCount = bookings.filter((b) => (b.bookingStatus === "cancelled" || b.status === "cancelled")).length;
    const totalGMV = bookings
      .filter((b) => b.status !== "cancelled" && b.bookingStatus !== "cancelled")
      .reduce((sum, b) => sum + (Number(b.finalAmount) || 0), 0);
    const totalCommission = bookings
      .filter((b) => b.status !== "cancelled" && b.bookingStatus !== "cancelled")
      .reduce((sum, b) => sum + (Number(b.commissionAmount) || Math.round(((Number(b.finalAmount) || 0) * (Number(b.commissionRate) || 10)) / 100)), 0);

    return {
      total,
      todayCount,
      pendingCount,
      confirmedCount,
      completedCount,
      cancelledCount,
      totalGMV,
      totalCommission
    };
  }, [bookings]);

  // Filtering
  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      const matchType = activeTab === "all" || b.type === activeTab;
      const curBookingSt = b.bookingStatus || b.status || "pending";
      const matchBookingSt = filterBookingStatus === "all" || curBookingSt === filterBookingStatus;
      const curPaymentSt = b.paymentStatus || "unpaid";
      const matchPaymentSt = filterPaymentStatus === "all" || curPaymentSt === filterPaymentStatus;

      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        term === "" ||
        Boolean(b.id && b.id.toLowerCase().includes(term)) ||
        Boolean(b.customerName && b.customerName.toLowerCase().includes(term)) ||
        Boolean(b.phone && String(b.phone).includes(term)) ||
        Boolean(b.itemTitle && b.itemTitle.toLowerCase().includes(term)) ||
        Boolean(b.businessName && b.businessName.toLowerCase().includes(term)) ||
        Boolean(b.leadId && b.leadId.toLowerCase().includes(term));

      return matchType && matchBookingSt && matchPaymentSt && matchSearch;
    });
  }, [bookings, activeTab, filterBookingStatus, filterPaymentStatus, searchTerm]);

  // Status mapping
  const bookingStatusConfig: Record<BookingStatus, { label: string; badge: string }> = {
    pending: { label: "Chờ xác nhận", badge: "bg-amber-100 text-amber-800" },
    confirmed: { label: "Đã xác nhận", badge: "bg-blue-100 text-blue-800" },
    completed: { label: "Đã hoàn thành", badge: "bg-emerald-100 text-emerald-800" },
    cancelled: { label: "Đã hủy", badge: "bg-red-100 text-red-800" }
  };

  const paymentStatusConfig: Record<string, { label: string; badge: string }> = {
    unpaid: { label: "Chưa thanh toán", badge: "bg-stone-100 text-stone-700" },
    paid: { label: "Đã thanh toán", badge: "bg-emerald-100 text-emerald-800 font-bold" },
    partially_paid: { label: "Đặt cọc (Một phần)", badge: "bg-indigo-100 text-indigo-800" },
    refunded: { label: "Đã hoàn tiền", badge: "bg-purple-100 text-purple-800" },
    failed: { label: "Thanh toán thất bại", badge: "bg-rose-100 text-rose-800" },
    PENDING: { label: "Chờ thanh toán", badge: "bg-stone-100 text-stone-700" },
    PROCESSING: { label: "Đang xử lý", badge: "bg-amber-100 text-amber-800" },
    PAID: { label: "Đã thanh toán", badge: "bg-emerald-100 text-emerald-800 font-bold" },
    FAILED: { label: "Thất bại", badge: "bg-rose-100 text-rose-800" },
    CANCELLED: { label: "Đã hủy", badge: "bg-red-100 text-red-800" },
    REFUNDED: { label: "Đã hoàn tiền", badge: "bg-purple-100 text-purple-800" },
    PARTIALLY_REFUNDED: { label: "Hoàn một phần", badge: "bg-purple-100 text-purple-800" }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-ink">Quản lý Booking & Giao dịch Đặt chỗ</h1>
          <p className="text-xs text-ink/60 mt-1">
            Theo dõi vòng đời booking, tình trạng đặt cọc/thanh toán VietQR, doanh số GMV và hoa hồng dịch vụ
          </p>
        </div>
        <span className="rounded-2xl bg-forest/10 px-3.5 py-2 text-xs font-bold text-forest">
          {bookings.length} Booking toàn sàn
        </span>
      </div>

      {/* Dashboard KPI Cards (Yêu cầu 4) */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl bg-white p-4 shadow-sm border border-black/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-ink/50 uppercase tracking-wider">Tổng Booking</span>
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700">
              Hôm nay: {metrics.todayCount}
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-ink">{metrics.total}</p>
          <span className="text-[10px] text-ink/40 mt-1">Giao dịch phát sinh toàn sàn</span>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm border border-black/5 border-l-4 border-l-amber-500 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Chờ xác nhận</span>
          <p className="mt-2 text-2xl font-black text-amber-700">{metrics.pendingCount}</p>
          <span className="text-[10px] text-amber-600 mt-1">Đã xác nhận: {metrics.confirmedCount}</span>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm border border-black/5 border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Tổng GMV Booking</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              Hoàn thành: {metrics.completedCount}
            </span>
          </div>
          <p className="mt-2 text-2xl font-black text-forest">
            {metrics.totalGMV.toLocaleString("vi-VN")} <span className="text-xs font-normal">đ</span>
          </p>
          <span className="text-[10px] text-ink/40 mt-1">Đã hủy: {metrics.cancelledCount}</span>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm border border-black/5 border-l-4 border-l-clay flex flex-col justify-between">
          <span className="text-[11px] font-bold text-clay uppercase tracking-wider">Hoa hồng tích lũy</span>
          <p className="mt-2 text-2xl font-black text-clay">
            {metrics.totalCommission.toLocaleString("vi-VN")} <span className="text-xs font-normal">đ</span>
          </p>
          <span className="text-[10px] text-ink/40 mt-1">Thu nhập quản lý nền tảng</span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="rounded-3xl bg-white p-4 shadow-sm border border-black/5 space-y-3">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink/40" />
            <input
              type="text"
              placeholder="Tìm theo Mã Booking, Mã Lead, Tên khách, SĐT, Dịch vụ hoặc Cơ sở..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-beige/60 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-ink/60 shrink-0">Booking Status:</span>
            <select
              value={filterBookingStatus}
              onChange={(e) => setFilterBookingStatus(e.target.value)}
              className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-ink focus:ring-2 focus:ring-forest"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-ink/60 shrink-0">Payment:</span>
            <select
              value={filterPaymentStatus}
              onChange={(e) => setFilterPaymentStatus(e.target.value)}
              className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-ink focus:ring-2 focus:ring-forest"
            >
              <option value="all">Tất cả thanh toán</option>
              <option value="unpaid">Chưa thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="partially_paid">Đặt cọc (Một phần)</option>
              <option value="refunded">Đã hoàn tiền</option>
              <option value="failed">Thất bại</option>
            </select>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1.5 text-xs pt-2 border-t border-black/5">
          {[
            { id: "all", label: "Tất cả (" + bookings.length + ")" },
            { id: "tour", label: "Tour trọn gói (" + bookings.filter((b) => b.type === "tour").length + ")" },
            { id: "homestay", label: "Homestay / Phòng (" + bookings.filter((b) => b.type === "homestay").length + ")" },
            { id: "product", label: "Đặc sản (" + bookings.filter((b) => b.type === "product").length + ")" }
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
                activeTab === tab.id
                  ? "bg-forest text-white shadow-sm"
                  : "bg-beige text-ink/70 hover:bg-forest/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-card border border-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-forest/5 text-ink/70 font-bold uppercase tracking-wider border-b border-black/5">
              <tr>
                <th className="p-4">Mã Booking / Lead ID</th>
                <th className="p-4">Dịch vụ & Doanh nghiệp</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Lịch trình & Số lượng</th>
                <th className="p-4">Giá & Hoa hồng</th>
                <th className="p-4 text-center">Thanh toán</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-ink/50">
                    Không tìm thấy Booking nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => {
                  const curBookingSt = ((b.bookingStatus || b.status || "pending") as string).toLowerCase() as BookingStatus;
                  const curPaymentSt = ((b.paymentStatus || "unpaid") as string).toLowerCase() as PaymentStatus;
                  const bSt = bookingStatusConfig[curBookingSt] || { label: curBookingSt || "Chờ xác nhận", badge: "bg-amber-100 text-amber-800" };
                  const pSt = paymentStatusConfig[curPaymentSt] || { label: curPaymentSt || "Chưa thanh toán", badge: "bg-stone-100 text-stone-700" };

                  const displayDate = b.bookingDate 
                    ? (b.bookingDate.includes("T") ? b.bookingDate.split("T")[0] : b.bookingDate)
                    : (b.createdAt?.includes("T") ? b.createdAt.split("T")[0] : (b.createdAt || "Chưa xác định"));

                  const experienceDateDisplay = b.experienceDate || b.startDate || "Linh hoạt / Tự túc";
                  const finalAmountNum = Number(b.finalAmount) || 0;
                  const commissionAmountNum = Number(b.commissionAmount);

                  return (
                    <tr key={b.id} className="hover:bg-beige/30 transition">
                      <td className="p-4">
                        <button
                          type="button"
                          onClick={() => setSelectedBooking(b)}
                          className="font-mono font-black text-forest hover:underline text-sm flex items-center gap-1 text-left"
                          title="Bấm để xem chi tiết đơn tức thì"
                        >
                          {b.id}
                          <ExternalLink className="size-3 text-forest/50" />
                        </button>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="rounded bg-black/5 px-1.5 py-0.5 text-[10px] font-bold text-ink/70 uppercase">
                            {b.type || "tour"}
                          </span>
                          {b.leadId ? (
                            <Link
                              href={`/admin/leads/${b.leadId}`}
                              className="font-mono text-[10px] font-semibold text-clay hover:underline"
                            >
                              Lead: {b.leadId}
                            </Link>
                          ) : null}
                        </div>
                        <p className="text-[10px] text-ink/40 mt-1">
                          Đặt: {displayDate}
                        </p>
                      </td>

                      <td className="p-4">
                        <p className="font-extrabold text-ink text-sm">{b.itemTitle || "Dịch vụ du lịch"}</p>
                        <p className="text-[11px] text-ink/60 mt-0.5">{b.businessName || "Chưa gán cơ sở"}</p>
                        {b.voucherCode || b.voucher ? (
                          <span className="inline-block mt-1 font-mono text-[10px] text-forest font-semibold">
                            Voucher: {b.voucher || b.voucherCode}
                          </span>
                        ) : null}
                      </td>

                      <td className="p-4">
                        <p className="font-extrabold text-ink">{b.customerName || "Khách hàng"}</p>
                        <p className="text-ink/70 font-mono mt-0.5">{b.phone || "Chưa có SĐT"}</p>
                        {b.email ? <p className="text-[10px] text-ink/40">{b.email}</p> : null}
                      </td>

                      <td className="p-4">
                        <p className="font-bold text-ink flex items-center gap-1">
                          <Calendar className="size-3 text-clay" /> {experienceDateDisplay}
                        </p>
                        <p className="text-ink/60 mt-0.5">
                          {b.numberOfPeople || b.quantity || 1} {b.type === "product" ? "phần" : "người"}
                        </p>
                        {b.experienceTime ? (
                          <p className="text-[10px] text-ink/40 mt-0.5">Giờ: {b.experienceTime}</p>
                        ) : null}
                      </td>

                      <td className="p-4">
                        <p className="font-black text-forest text-sm">
                          {finalAmountNum.toLocaleString("vi-VN")} đ
                        </p>
                        <p className="text-[10px] text-clay font-medium mt-0.5">
                          Hoa hồng: {!isNaN(commissionAmountNum) && commissionAmountNum > 0 ? commissionAmountNum.toLocaleString("vi-VN") + " đ" : (b.commissionRate || 10) + "%"}
                        </p>
                      </td>

                      <td className="p-4 text-center">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold ${pSt.badge}`}>
                          {pSt.label}
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${bSt.badge}`}>
                          {bSt.label}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(b)}
                            className="inline-flex items-center gap-1 rounded-xl bg-forest px-3 py-1.5 text-xs font-bold text-white hover:bg-forest/90 transition shadow-sm"
                            title="Xem chi tiết đơn tức thì"
                          >
                            <Eye className="size-3.5" /> Chi tiết
                          </button>
                          <Link
                            href={`/admin/bookings/detail?id=${b.id}`}
                            target="_blank"
                            className="p-1.5 rounded-xl text-ink/40 hover:text-ink hover:bg-black/5 transition"
                            title="Mở trang chi tiết trong tab mới"
                          >
                            <ExternalLink className="size-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Modal Popup Xem & Quản Lý Chi Tiết Booking Tức Thì */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 md:p-6 backdrop-blur-sm flex items-start justify-center animate-in fade-in">
          <div className="relative w-full max-w-5xl rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-black/10 my-auto max-h-[92vh] overflow-y-auto">
            <BookingDetailView
              initialBooking={selectedBooking}
              bookingId={selectedBooking.id}
              isModal={true}
              onClose={() => setSelectedBooking(null)}
              onBookingUpdated={(updated) => {
                setBookings((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
                setSelectedBooking(updated);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
