"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  fetchBookingByIdAction,
  updateBookingStatusAction,
  updateBookingPaymentAction
} from "@/app/actions/bookings";
import type { BookingRecord, BookingStatus, PaymentStatus } from "@/lib/server-store";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  ExternalLink,
  History,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Ticket,
  User,
  Users,
  XCircle
} from "lucide-react";

export default function AdminBookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id as string;

  const [booking, setBooking] = useState<BookingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const [newBookingStatus, setNewBookingStatus] = useState<BookingStatus>("pending");
  const [newPaymentStatus, setNewPaymentStatus] = useState<PaymentStatus>("unpaid");
  const [cancelReason, setCancelReason] = useState("");
  const [refundAmount, setRefundAmount] = useState<number>(0);

  function loadData() {
    if (!bookingId) return;
    setLoading(true);
    fetchBookingByIdAction(bookingId).then((data) => {
      setBooking(data);
      if (data) {
        setNewBookingStatus((data.bookingStatus || data.status) as BookingStatus);
        setNewPaymentStatus(data.paymentStatus as PaymentStatus);
        setRefundAmount(data.finalAmount || 0);
      }
      setLoading(false);
    });
  }

  useEffect(() => {
    loadData();
  }, [bookingId]);

  async function handleUpdateBookingStatus() {
    if (!booking) return;
    startTransition(async () => {
      const res = await updateBookingStatusAction(booking.id, newBookingStatus, {
        id: "usr-admin-1",
        name: "Ban Quản Trị",
        role: "admin"
      }, newBookingStatus === "cancelled" ? cancelReason : undefined);

      if (res.success && res.booking) {
        setBooking(res.booking);
      }
    });
  }

  async function handleUpdatePaymentStatus() {
    if (!booking) return;
    startTransition(async () => {
      const res = await updateBookingPaymentAction(booking.id, newPaymentStatus, {
        actor: { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" },
        refundAmount: newPaymentStatus === "refunded" ? refundAmount : undefined
      });

      if (res.success && res.booking) {
        setBooking(res.booking);
      }
    });
  }

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="size-8 mx-auto animate-spin rounded-full border-4 border-forest border-t-transparent" />
        <p className="mt-4 text-xs font-bold text-ink/60">Đang tải chi tiết đơn booking...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="rounded-3xl bg-white p-12 text-center shadow-card border border-black/5">
        <AlertCircle className="mx-auto size-12 text-clay" />
        <h2 className="mt-4 text-xl font-bold text-ink">Không tìm thấy Booking</h2>
        <p className="mt-2 text-xs text-ink/60">Mã booking không tồn tại hoặc đã bị xóa.</p>
        <Link
          href="/admin/bookings"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-forest px-5 py-2.5 text-xs font-bold text-white shadow-sm"
        >
          <ArrowLeft className="size-4" /> Quay lại danh sách Booking
        </Link>
      </div>
    );
  }

  const curBookingSt = (booking.bookingStatus || booking.status) as BookingStatus;
  const curPaymentSt = booking.paymentStatus as PaymentStatus;

  return (
    <div className="space-y-6 pb-20">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/bookings"
            className="flex size-10 items-center justify-center rounded-2xl bg-white shadow-sm border border-black/5 text-ink/70 hover:text-forest hover:bg-beige transition"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-forest">{booking.id}</span>
              {booking.leadId && (
                <Link
                  href={`/admin/leads/${booking.leadId}`}
                  className="rounded-full bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-0.5 text-xs font-mono font-bold hover:underline"
                >
                  Nguồn Lead: {booking.leadId}
                </Link>
              )}
            </div>
            <h1 className="text-xl md:text-2xl font-black text-ink mt-0.5">
              Chi tiết Đơn đặt: {booking.itemTitle}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {curBookingSt === "confirmed" && (
            <span className="rounded-2xl bg-blue-100 text-blue-800 px-3.5 py-1.5 text-xs font-bold">
              ✓ Đã xác nhận chỗ
            </span>
          )}
          {curBookingSt === "completed" && (
            <span className="rounded-2xl bg-emerald-100 text-emerald-800 px-3.5 py-1.5 text-xs font-bold">
              ✓ Đã hoàn thành trải nghiệm
            </span>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column: Customer, Service, Pricing, Financials & Operations */}
        <div className="space-y-6">
          {/* Customer & Contact Info */}
          <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5">
            <h2 className="text-base font-extrabold text-ink flex items-center gap-2 border-b border-black/5 pb-4">
              <User className="size-4 text-forest" /> Thông tin du khách
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <p className="text-ink/50 font-semibold">Tên khách hàng:</p>
                <p className="text-sm font-extrabold text-ink mt-0.5">{booking.customerName}</p>
              </div>
              <div>
                <p className="text-ink/50 font-semibold">Số điện thoại:</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono font-bold text-sm text-ink">{booking.phone}</span>
                  <a
                    href={`tel:${booking.phone}`}
                    className="size-6 rounded-full bg-forest/10 flex items-center justify-center text-forest hover:bg-forest hover:text-white transition"
                  >
                    <Phone className="size-3" />
                  </a>
                  <a
                    href={`https://zalo.me/${booking.phone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="size-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition"
                  >
                    <MessageCircle className="size-3" />
                  </a>
                </div>
              </div>
              <div>
                <p className="text-ink/50 font-semibold">Email:</p>
                <p className="font-medium text-ink mt-0.5">{booking.email || "Không có"}</p>
              </div>
              <div>
                <p className="text-ink/50 font-semibold">Customer ID:</p>
                <p className="font-mono text-ink/60 mt-0.5">{booking.customerId || booking.userId || "Khách vãng lai"}</p>
              </div>
            </div>
          </div>

          {/* Service & Experience Details */}
          <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5">
            <h2 className="text-base font-extrabold text-ink flex items-center gap-2 border-b border-black/5 pb-4">
              <Package className="size-4 text-forest" /> Chi tiết Dịch vụ & Cơ sở phụ trách
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-2xl bg-beige/40 p-3.5 space-y-1">
                <p className="text-ink/50 font-semibold">Dịch vụ / Gói đặt:</p>
                <p className="font-extrabold text-forest text-sm">{booking.itemTitle}</p>
                <p className="text-[11px] text-ink/50 uppercase font-bold">Loại hình: {booking.type}</p>
              </div>

              <div className="rounded-2xl bg-beige/40 p-3.5 space-y-1">
                <p className="text-ink/50 font-semibold">Cơ sở cung cấp:</p>
                <p className="font-extrabold text-ink text-sm">{booking.businessName}</p>
                <p className="text-[11px] text-ink/50">Mã cơ sở: {booking.businessId || "Chưa gán"}</p>
              </div>

              <div>
                <p className="text-ink/50 font-semibold">Ngày trải nghiệm:</p>
                <p className="font-bold text-ink mt-0.5 flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-clay" /> {booking.experienceDate || booking.startDate}
                </p>
                {booking.experienceTime ? (
                  <p className="text-[11px] text-ink/50 mt-0.5">Khung giờ: {booking.experienceTime}</p>
                ) : null}
              </div>

              <div>
                <p className="text-ink/50 font-semibold">Số lượng khách / suất:</p>
                <p className="font-bold text-ink mt-0.5 flex items-center gap-1.5">
                  <Users className="size-3.5 text-clay" /> {booking.numberOfPeople || booking.quantity} {booking.type === "product" ? "phần" : "người"}
                </p>
              </div>
            </div>

            {booking.customerNote || booking.notes ? (
              <div className="mt-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 p-3.5 text-xs text-amber-950">
                <p className="font-bold">Ghi chú của khách hàng:</p>
                <p className="mt-1 italic">&ldquo;{booking.customerNote || booking.notes}&rdquo;</p>
              </div>
            ) : null}
          </div>

          {/* Pricing, Voucher & Commission (Yêu cầu 1) */}
          <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5">
            <h2 className="text-base font-extrabold text-ink flex items-center gap-2 border-b border-black/5 pb-4">
              <DollarSign className="size-4 text-forest" /> Giá trị đơn hàng & Hoa hồng đối soát
            </h2>
            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-ink/70">
                <span>Đơn giá niêm yết:</span>
                <span className="font-bold text-ink">{(Number(booking.unitPrice) || 0).toLocaleString("vi-VN")} đ</span>
              </div>
              <div className="flex justify-between text-ink/70">
                <span>Tạm tính (Subtotal):</span>
                <span className="font-bold text-ink">{(Number(booking.subtotal) || 0).toLocaleString("vi-VN")} đ</span>
              </div>
              {(booking.discount || booking.discountAmount) ? (
                <div className="flex justify-between text-clay font-semibold">
                  <span>Ưu đãi Voucher ({booking.voucher || booking.voucherCode}):</span>
                  <span>-{(Number(booking.discount || booking.discountAmount) || 0).toLocaleString("vi-VN")} đ</span>
                </div>
              ) : null}
              <div className="flex justify-between text-base font-black text-forest border-t border-black/5 pt-2">
                <span>Tổng giá trị chốt (Final Amount):</span>
                <span>{(Number(booking.finalAmount) || 0).toLocaleString("vi-VN")} đ</span>
              </div>

              <div className="mt-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 p-3.5 flex items-center justify-between text-emerald-950">
                <div>
                  <p className="font-bold">Hoa hồng nền tảng ({booking.commissionRate || 10}%):</p>
                  <span className="text-[10px] text-emerald-700">Dùng cho đối soát định kỳ với cơ sở</span>
                </div>
                <span className="text-base font-black text-emerald-800">
                  +{(Number(booking.commissionAmount) || Math.round(((Number(booking.finalAmount) || 0) * (Number(booking.commissionRate) || 10)) / 100)).toLocaleString("vi-VN")} đ
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: State Management & Timeline */}
        <div className="space-y-6">
          {/* Booking & Payment Lifecycle Management */}
          <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5 space-y-5">
            <h2 className="text-base font-extrabold text-ink flex items-center gap-2 border-b border-black/5 pb-4">
              <ShieldCheck className="size-4 text-forest" /> Quản trị Vòng đời & Thanh toán
            </h2>

            {/* Lifecycle: CHỜ XÁC NHẬN -> ĐÃ XÁC NHẬN -> ĐÃ HOÀN THÀNH */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink block">Trạng thái Booking (Booking Status):</label>
              <select
                value={newBookingStatus}
                onChange={(e) => setNewBookingStatus(e.target.value as BookingStatus)}
                className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-xs font-bold text-ink focus:ring-2 focus:ring-forest"
              >
                <option value="pending">CHỜ XÁC NHẬN</option>
                <option value="confirmed">ĐÃ XÁC NHẬN</option>
                <option value="completed">ĐÃ HOÀN THÀNH</option>
                <option value="cancelled">ĐÃ HỦY</option>
              </select>

              {newBookingStatus === "cancelled" && (
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Lý do hủy đơn..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full rounded-xl border border-red-200 bg-red-50/50 px-3 py-2 text-xs text-red-900"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleUpdateBookingStatus}
                disabled={isPending}
                className="mt-2 w-full rounded-2xl bg-forest px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-forest/90 transition disabled:opacity-50"
              >
                Lưu trạng thái Booking
              </button>
            </div>

            <hr className="border-black/5" />

            {/* Payment Status (Yêu cầu 3: Tách biệt hoàn toàn) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-ink block">Trạng thái Thanh toán (Payment Status):</label>
              <select
                value={newPaymentStatus}
                onChange={(e) => setNewPaymentStatus(e.target.value as PaymentStatus)}
                className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-xs font-bold text-ink focus:ring-2 focus:ring-forest"
              >
                <option value="unpaid">CHƯA THANH TOÁN</option>
                <option value="paid">ĐÃ THANH TOÁN (Đủ 100%)</option>
                <option value="partially_paid">THANH TOÁN MỘT PHẦN (Cọc)</option>
                <option value="refunded">HOÀN TIỀN (Refunded)</option>
                <option value="failed">THANH TOÁN THẤT BẠI</option>
              </select>

              {newPaymentStatus === "refunded" && (
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs font-semibold text-ink/60 shrink-0">Số tiền hoàn:</span>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(Number(e.target.value) || 0)}
                    className="w-full rounded-xl border border-black/10 px-3 py-1.5 text-xs font-bold"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleUpdatePaymentStatus}
                disabled={isPending}
                className="mt-2 w-full rounded-2xl border border-forest text-forest hover:bg-forest/5 px-4 py-2 text-xs font-bold transition disabled:opacity-50"
              >
                Cập nhật Thanh toán
              </button>
            </div>
          </div>

          {/* Booking Timeline */}
          <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <h2 className="text-base font-extrabold text-ink flex items-center gap-2">
                <History className="size-4 text-forest" /> Timeline Giao dịch & Điều phối
              </h2>
              <span className="text-[11px] text-ink/40">{(booking.timeline || []).length} sự kiện</span>
            </div>

            <div className="mt-6 relative pl-6 border-l-2 border-forest/20 space-y-6">
              {(booking.timeline || []).map((event, idx) => (
                <div key={event.id || idx} className="relative">
                  <span className="absolute -left-[31px] top-1 size-4 rounded-full bg-forest border-2 border-white shadow-sm" />
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-1">
                      <h4 className="font-extrabold text-xs text-ink">{event.title}</h4>
                      <span className="text-[10px] text-ink/40 font-mono">
                        {new Date(event.timestamp).toLocaleString("vi-VN")}
                      </span>
                    </div>
                    <p className="text-xs text-ink/70 mt-1 leading-relaxed">{event.description}</p>
                    <div className="mt-1 text-[10px] text-ink/40 font-medium">
                      Người cập nhật: <span className="font-bold text-ink/60">{event.actor?.name || "Hệ thống"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
