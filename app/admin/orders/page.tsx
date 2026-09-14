"use client";

import { useEffect, useState, useTransition } from "react";
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
  Filter,
  MapPin,
  Package,
  Phone,
  Search,
  ShoppingBag,
  Sparkles,
  Ticket,
  User,
  Users,
  XCircle
} from "lucide-react";

export default function AdminOrdersPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "tour" | "homestay" | "product">("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function loadBookings() {
    fetchAllBookingsAction().then(setBookings);
  }

  useEffect(() => {
    loadBookings();
  }, []);

  async function handleStatusChange(id: string, status: BookingStatus) {
    setUpdatingId(id);
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

  async function handlePaymentChange(id: string, status: PaymentStatus) {
    setUpdatingId(id);
    const res = await updateBookingPaymentAction(id, status, {
      actor: {
        id: "usr-admin-1",
        name: "Ban Quản Trị",
        role: "admin"
      }
    });
    setUpdatingId(null);
    if (res.success && res.booking) {
      setBookings((prev) => prev.map((b) => (b.id === id ? res.booking! : b)));
    }
  }

  const filtered = bookings.filter((b) => {
    const matchType = activeTab === "all" || b.type === activeTab;
    const matchPayment = paymentFilter === "all" || b.paymentStatus === paymentFilter;
    const term = searchTerm.toLowerCase().trim();
    const matchSearch =
      term === "" ||
      b.id.toLowerCase().includes(term) ||
      b.customerName.toLowerCase().includes(term) ||
      b.phone.includes(term) ||
      b.itemTitle.toLowerCase().includes(term) ||
      b.businessName.toLowerCase().includes(term) ||
      (b.leadId && b.leadId.toLowerCase().includes(term));

    return matchType && matchPayment && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-ink">Quản lý Đơn đặt & Booking</h1>
          <p className="text-xs text-ink/60 mt-1">
            Tổng hợp các đơn đặt tour trải nghiệm, lưu trú homestay và đặc sản bản địa được chốt từ Website & Lead CRM
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-2xl bg-forest/10 px-4 py-2 text-xs font-bold text-forest">
            {bookings.length} Đơn toàn hệ thống
          </span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-3xl bg-white p-4 shadow-sm border border-black/5 space-y-3">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink/40" />
            <input
              type="text"
              placeholder="Tìm theo Mã đơn, Mã Lead, Tên khách, SĐT, Dịch vụ hoặc Doanh nghiệp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-beige/60 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink/60 shrink-0">Thanh toán:</span>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value as any)}
              className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-ink focus:ring-2 focus:ring-forest"
            >
              <option value="all">Tất cả thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="unpaid">Chưa thanh toán</option>
            </select>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1.5 text-xs pt-2 border-t border-black/5">
          {[
            { id: "all", label: "Tất cả (" + bookings.length + ")" },
            { id: "tour", label: "Tour trọn gói (" + bookings.filter((b) => b.type === "tour").length + ")" },
            { id: "homestay", label: "Homestay / Phòng (" + bookings.filter((b) => b.type === "homestay").length + ")" },
            { id: "product", label: "Đặc sản bản địa (" + bookings.filter((b) => b.type === "product").length + ")" }
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
                <th className="p-4">Mã Đơn / Loại</th>
                <th className="p-4">Dịch vụ / Gói đặt</th>
                <th className="p-4">Khách hàng</th>
                <th className="p-4">Thời gian / Số lượng</th>
                <th className="p-4">Giá & Thanh toán</th>
                <th className="p-4 text-center">Trạng thái đơn</th>
                <th className="p-4 text-right">Điều hành</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-ink/50">
                    Không có đơn đặt nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-beige/30 transition">
                    <td className="p-4">
                      <p className="font-mono font-black text-forest text-sm">{b.id}</p>
                      <span className="inline-block mt-1 rounded bg-black/5 px-2 py-0.5 text-[10px] font-bold text-ink/70 uppercase">
                        {b.type === "tour" ? "Tour" : b.type === "homestay" ? "Homestay" : "Đặc sản"}
                      </span>
                      {b.leadId && (
                        <div className="mt-1">
                          <Link
                            href={`/admin/leads/${b.leadId}`}
                            className="font-mono text-[10px] font-bold text-clay hover:underline flex items-center gap-0.5"
                          >
                            Lead: {b.leadId} <ExternalLink className="size-2.5" />
                          </Link>
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <p className="font-extrabold text-ink text-sm">{b.itemTitle}</p>
                      <p className="text-[11px] text-ink/60 mt-0.5">{b.businessName}</p>
                      {b.notes ? (
                        <p className="text-[10px] text-ink/50 italic mt-1 line-clamp-1">
                          &ldquo;{b.notes}&rdquo;
                        </p>
                      ) : null}
                    </td>

                    <td className="p-4">
                      <p className="font-extrabold text-ink">{b.customerName}</p>
                      <p className="text-ink/70 font-mono mt-0.5">{b.phone}</p>
                      {b.email ? <p className="text-[10px] text-ink/40">{b.email}</p> : null}
                      {b.deliveryAddress ? (
                        <p className="text-[10px] text-ink/60 mt-0.5 flex items-center gap-1">
                          <MapPin className="size-3 text-clay shrink-0" /> {b.deliveryAddress}
                        </p>
                      ) : null}
                    </td>

                    <td className="p-4">
                      <p className="font-bold text-ink flex items-center gap-1">
                        <Calendar className="size-3 text-clay" /> {b.startDate || "Linh hoạt"}
                      </p>
                      <p className="text-ink/60 mt-0.5">SL: {b.quantity} {b.type === "product" ? "phần" : "khách"}</p>
                    </td>

                    <td className="p-4">
                      <p className="font-black text-forest text-sm">
                        {b.finalAmount.toLocaleString("vi-VN")} đ
                      </p>
                      {b.discountAmount ? (
                        <p className="text-[10px] text-clay line-through">
                          {b.totalAmount.toLocaleString("vi-VN")} đ
                        </p>
                      ) : null}
                      <div className="mt-1">
                        <button
                          type="button"
                          onClick={() => handlePaymentChange(b.id, b.paymentStatus === "paid" ? "unpaid" : "paid")}
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold border transition ${
                            b.paymentStatus === "paid"
                              ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                              : "bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200"
                          }`}
                        >
                          {b.paymentStatus === "paid" ? "✓ Đã thanh toán" : "○ Chưa thanh toán (Click đổi)"}
                        </button>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          b.status === "confirmed"
                            ? "bg-emerald-100 text-emerald-800"
                            : b.status === "completed"
                            ? "bg-teal-100 text-teal-800"
                            : b.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {b.status === "confirmed"
                          ? "Đã xác nhận"
                          : b.status === "completed"
                          ? "Hoàn tất"
                          : b.status === "cancelled"
                          ? "Đã hủy"
                          : "Chờ xác nhận"}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <select
                        value={b.status}
                        disabled={updatingId === b.id}
                        onChange={(e) => handleStatusChange(b.id, e.target.value as BookingStatus)}
                        className="rounded-xl border border-black/10 bg-white px-2 py-1 text-[11px] font-semibold text-ink focus:ring-1 focus:ring-forest"
                      >
                        <option value="pending">Chờ xác nhận</option>
                        <option value="confirmed">Xác nhận đơn</option>
                        <option value="completed">Hoàn tất phục vụ</option>
                        <option value="cancelled">Hủy đơn</option>
                      </select>
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
