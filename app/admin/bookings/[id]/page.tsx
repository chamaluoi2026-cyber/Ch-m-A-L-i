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
  Copy,
  CreditCard,
  DollarSign,
  Download,
  ExternalLink,
  History,
  Info,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Printer,
  QrCode,
  RotateCcw,
  Save,
  Share2,
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

  // Business note state
  const [businessNote, setBusinessNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [noteSavedMsg, setNoteSavedMsg] = useState(false);

  // QR state
  const [qrAmount, setQrAmount] = useState<number>(0);
  const [copiedQr, setCopiedQr] = useState(false);

  function loadData() {
    if (!bookingId) return;
    setLoading(true);

    fetch(`/api/bookings?id=${bookingId}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.booking) {
          const b = data.booking;
          setBooking(b);
          setNewBookingStatus(((b.bookingStatus || b.status || "pending") as string).toLowerCase() as BookingStatus);
          setNewPaymentStatus(((b.paymentStatus || "unpaid") as string).toLowerCase() as PaymentStatus);
          setRefundAmount(Number(b.finalAmount) || 0);
          setBusinessNote(b.businessNote || "");
          setQrAmount(Number(b.finalAmount) || 0);
          setLoading(false);
          return;
        }

        // Fallback to server action
        fetchBookingByIdAction(bookingId).then((actionData) => {
          setBooking(actionData);
          if (actionData) {
            setNewBookingStatus(((actionData.bookingStatus || actionData.status || "pending") as string).toLowerCase() as BookingStatus);
            setNewPaymentStatus(((actionData.paymentStatus || "unpaid") as string).toLowerCase() as PaymentStatus);
            setRefundAmount(Number(actionData.finalAmount) || 0);
            setBusinessNote(actionData.businessNote || "");
            setQrAmount(Number(actionData.finalAmount) || 0);
          }
          setLoading(false);
        });
      })
      .catch(() => {
        fetchBookingByIdAction(bookingId).then((actionData) => {
          setBooking(actionData);
          if (actionData) {
            setNewBookingStatus(((actionData.bookingStatus || actionData.status || "pending") as string).toLowerCase() as BookingStatus);
            setNewPaymentStatus(((actionData.paymentStatus || "unpaid") as string).toLowerCase() as PaymentStatus);
            setRefundAmount(Number(actionData.finalAmount) || 0);
            setBusinessNote(actionData.businessNote || "");
            setQrAmount(Number(actionData.finalAmount) || 0);
          }
          setLoading(false);
        });
      });
  }

  useEffect(() => {
    loadData();
  }, [bookingId]);

  async function handleUpdateBookingStatus() {
    if (!booking) return;
    startTransition(async () => {
      try {
        const res = await fetch("/api/bookings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: booking.id,
            bookingStatus: newBookingStatus,
            cancelReason: newBookingStatus === "cancelled" ? cancelReason : undefined
          })
        });
        const data = await res.json();
        if (data.success && data.booking) {
          setBooking(data.booking);
          return;
        }
      } catch {}

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
      try {
        const res = await fetch("/api/bookings", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: booking.id,
            paymentStatus: newPaymentStatus
          })
        });
        const data = await res.json();
        if (data.success && data.booking) {
          setBooking(data.booking);
          return;
        }
      } catch {}

      const res = await updateBookingPaymentAction(booking.id, newPaymentStatus, {
        actor: { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" },
        refundAmount: newPaymentStatus === "refunded" ? refundAmount : undefined
      });

      if (res.success && res.booking) {
        setBooking(res.booking);
      }
    });
  }

  async function handleSaveBusinessNote() {
    if (!booking) return;
    setSavingNote(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: booking.id,
          businessNote: businessNote
        })
      });
      const data = await res.json();
      if (data.success && data.booking) {
        setBooking(data.booking);
        setNoteSavedMsg(true);
        setTimeout(() => setNoteSavedMsg(false), 3000);
      }
    } catch {}
    setSavingNote(false);
  }

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="size-10 mx-auto animate-spin rounded-full border-4 border-forest border-t-transparent" />
        <p className="mt-4 text-xs font-bold text-ink/60">Đang tải chi tiết đơn booking từ hệ thống...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="rounded-3xl bg-white p-12 text-center shadow-card border border-black/5 max-w-lg mx-auto my-12">
        <AlertCircle className="mx-auto size-12 text-clay" />
        <h2 className="mt-4 text-xl font-bold text-ink">Không tìm thấy Booking</h2>
        <p className="mt-2 text-xs text-ink/60">Mã booking ({bookingId}) không tồn tại hoặc đã bị xóa.</p>
        <Link
          href="/admin/bookings"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-forest px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-forest/90 transition"
        >
          <ArrowLeft className="size-4" /> Quay lại danh sách Booking
        </Link>
      </div>
    );
  }

  const curBookingSt = ((booking.bookingStatus || booking.status || "pending") as string).toLowerCase() as BookingStatus;
  const curPaymentSt = ((booking.paymentStatus || "unpaid") as string).toLowerCase() as PaymentStatus;

  const cleanPhone = String(booking.phone || "").replace(/[^0-9]/g, "");
  const finalAmountNum = Number(booking.finalAmount) || 0;
  const unitPriceNum = Number(booking.unitPrice) || 0;
  const subtotalNum = Number(booking.subtotal) || 0;
  const discountNum = Number(booking.discount || booking.discountAmount) || 0;
  const commissionRateNum = Number(booking.commissionRate) || 10;
  const commissionAmountNum = Number(booking.commissionAmount) || Math.round((finalAmountNum * commissionRateNum) / 100);
  const partnerPayout = Math.max(0, finalAmountNum - commissionAmountNum);

  // VietQR generation
  const bankId = "VCB";
  const bankAcc = "1028899889";
  const bankAccName = "HTX DU LICH CONG DONG A LUOI";
  const qrMemo = `BK ${booking.id} ${cleanPhone}`.trim();
  const currentQrAmount = qrAmount > 0 ? qrAmount : finalAmountNum;
  const vietQrUrl = `https://img.vietqr.io/image/${bankId}-${bankAcc}-compact2.png?amount=${currentQrAmount}&addInfo=${encodeURIComponent(qrMemo)}&accountName=${encodeURIComponent(bankAccName)}`;

  return (
    <div className="space-y-6 pb-20 print:p-0 print:space-y-4">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
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
              <span className="rounded bg-black/5 px-2 py-0.5 text-[11px] font-bold text-ink/70 uppercase">
                {booking.type || "tour"}
              </span>
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
              Chi tiết Đơn đặt: {booking.itemTitle || "Dịch vụ du lịch"}
            </h1>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-2xl bg-white border border-black/10 px-3.5 py-2 text-xs font-bold text-ink hover:bg-stone-50 transition shadow-sm"
          >
            <Printer className="size-4 text-ink/60" /> In phiếu xác nhận
          </button>
          {cleanPhone && (
            <a
              href={`https://zalo.me/${cleanPhone}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition shadow-sm"
            >
              <MessageCircle className="size-4" /> Nhắn Zalo khách
            </a>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column: Customer, Service, Financials */}
        <div className="space-y-6">
          {/* Customer & Contact Info */}
          <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <h2 className="text-base font-extrabold text-ink flex items-center gap-2">
                <User className="size-4 text-forest" /> Thông tin du khách
              </h2>
              <span className="text-[11px] font-mono text-ink/50">ID: {booking.customerId || "Khách vãng lai"}</span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <p className="text-ink/50 font-semibold">Tên khách hàng:</p>
                <p className="text-sm font-extrabold text-ink mt-0.5">{booking.customerName || "Chưa cung cấp"}</p>
              </div>
              <div>
                <p className="text-ink/50 font-semibold">Số điện thoại:</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono font-bold text-sm text-ink">{booking.phone || "Không có"}</span>
                  {booking.phone && (
                    <>
                      <a
                        href={`tel:${booking.phone}`}
                        className="size-7 rounded-full bg-forest/10 flex items-center justify-center text-forest hover:bg-forest hover:text-white transition"
                        title="Gọi điện trực tiếp"
                      >
                        <Phone className="size-3.5" />
                      </a>
                      <a
                        href={`https://zalo.me/${cleanPhone}`}
                        target="_blank"
                        rel="noreferrer"
                        className="size-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition"
                        title="Nhắn tin Zalo"
                      >
                        <MessageCircle className="size-3.5" />
                      </a>
                    </>
                  )}
                </div>
              </div>
              <div>
                <p className="text-ink/50 font-semibold">Email:</p>
                <p className="font-medium text-ink mt-0.5">{booking.email || "Không có email"}</p>
              </div>
              <div>
                <p className="text-ink/50 font-semibold">Thời điểm đặt:</p>
                <p className="font-mono text-ink/70 mt-0.5">
                  {booking.bookingDate || booking.createdAt ? new Date(booking.bookingDate || booking.createdAt).toLocaleString("vi-VN") : "Chưa xác định"}
                </p>
              </div>
            </div>

            {booking.customerNote || booking.notes ? (
              <div className="mt-4 rounded-2xl bg-amber-50/80 border border-amber-200/70 p-3.5 text-xs text-amber-950">
                <p className="font-bold flex items-center gap-1">
                  <Info className="size-3.5 text-amber-600" /> Ghi chú & Yêu cầu của du khách:
                </p>
                <p className="mt-1 italic">&ldquo;{booking.customerNote || booking.notes}&rdquo;</p>
              </div>
            ) : null}
          </div>

          {/* Service & Experience Details */}
          <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5">
            <h2 className="text-base font-extrabold text-ink flex items-center gap-2 border-b border-black/5 pb-4">
              <Package className="size-4 text-forest" /> Chi tiết Dịch vụ & Cơ sở phụ trách
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 text-xs">
              <div className="rounded-2xl bg-beige/40 p-3.5 space-y-1">
                <p className="text-ink/50 font-semibold">Dịch vụ / Gói đặt:</p>
                <p className="font-extrabold text-forest text-sm">{booking.itemTitle || "Du lịch Chạm A Lưới"}</p>
                <p className="text-[11px] text-ink/50 uppercase font-bold">Loại: {booking.type || "tour"}</p>
              </div>

              <div className="rounded-2xl bg-beige/40 p-3.5 space-y-1">
                <p className="text-ink/50 font-semibold">Cơ sở cung cấp:</p>
                <p className="font-extrabold text-ink text-sm">{booking.businessName || "Đối tác du lịch A Lưới"}</p>
                <p className="text-[11px] text-ink/50">Mã cơ sở: {booking.businessId || "Chưa gán"}</p>
              </div>

              <div>
                <p className="text-ink/50 font-semibold">Ngày trải nghiệm / Lưu trú:</p>
                <p className="font-bold text-ink mt-0.5 flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-clay" /> {booking.experienceDate || booking.startDate || "Linh hoạt / Tự túc"}
                </p>
                {booking.experienceTime ? (
                  <p className="text-[11px] text-ink/50 mt-0.5">Khung giờ: {booking.experienceTime}</p>
                ) : null}
              </div>

              <div>
                <p className="text-ink/50 font-semibold">Số lượng:</p>
                <p className="font-bold text-ink mt-0.5 flex items-center gap-1.5">
                  <Users className="size-3.5 text-clay" /> {booking.numberOfPeople || booking.quantity || 1} {booking.type === "product" ? "phần" : "người"}
                </p>
              </div>

              {booking.deliveryAddress && (
                <div className="sm:col-span-2">
                  <p className="text-ink/50 font-semibold">Địa chỉ giao hàng / Đón trả:</p>
                  <p className="font-medium text-ink mt-0.5 flex items-center gap-1">
                    <MapPin className="size-3.5 text-clay" /> {booking.deliveryAddress}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Financial Split */}
          <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5">
            <h2 className="text-base font-extrabold text-ink flex items-center gap-2 border-b border-black/5 pb-4">
              <DollarSign className="size-4 text-forest" /> Giá trị đơn hàng & Đối soát tài chính
            </h2>
            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-ink/70">
                <span>Đơn giá niêm yết:</span>
                <span className="font-bold text-ink">{unitPriceNum.toLocaleString("vi-VN")} đ</span>
              </div>
              <div className="flex justify-between text-ink/70">
                <span>Tạm tính (Subtotal):</span>
                <span className="font-bold text-ink">{subtotalNum.toLocaleString("vi-VN")} đ</span>
              </div>
              {discountNum > 0 ? (
                <div className="flex justify-between text-clay font-semibold">
                  <span>Ưu đãi Voucher ({booking.voucher || booking.voucherCode}):</span>
                  <span>-{discountNum.toLocaleString("vi-VN")} đ</span>
                </div>
              ) : null}
              <div className="flex justify-between text-base font-black text-forest border-t border-black/5 pt-2">
                <span>Tổng giá trị chốt (Final Amount):</span>
                <span>{finalAmountNum.toLocaleString("vi-VN")} đ</span>
              </div>

              {/* Commission & Partner Payout breakdown */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200/60 p-3.5">
                  <p className="font-bold text-emerald-950">Hoa hồng sàn ({commissionRateNum}%):</p>
                  <p className="text-lg font-black text-emerald-800 mt-1">
                    +{commissionAmountNum.toLocaleString("vi-VN")} đ
                  </p>
                  <p className="text-[10px] text-emerald-700 mt-0.5">Thu nhập giữ lại nền tảng</p>
                </div>
                <div className="rounded-2xl bg-blue-50/80 border border-blue-200/60 p-3.5">
                  <p className="font-bold text-blue-950">Chi trả cơ sở dịch vụ:</p>
                  <p className="text-lg font-black text-blue-800 mt-1">
                    {partnerPayout.toLocaleString("vi-VN")} đ
                  </p>
                  <p className="text-[10px] text-blue-700 mt-0.5">Thanh toán đối soát cho cơ sở</p>
                </div>
              </div>
            </div>
          </div>

          {/* Internal Business Note */}
          <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5">
            <h2 className="text-base font-extrabold text-ink flex items-center gap-2 border-b border-black/5 pb-4">
              <ShieldCheck className="size-4 text-forest" /> Ghi chú điều phối nội bộ (Admin & Cơ sở)
            </h2>
            <div className="mt-4 space-y-3">
              <p className="text-xs text-ink/60">
                Ghi chú tiến độ liên hệ khách, yêu cầu đặc biệt hoặc thỏa thuận điều phối dịch vụ với homestay/hướng dẫn viên:
              </p>
              <textarea
                value={businessNote}
                onChange={(e) => setBusinessNote(e.target.value)}
                placeholder="Ví dụ: Đã gọi điện lúc 9h xác nhận lịch, khách tự túc xe máy từ Huế lên, dặn homestay chuẩn bị ăn trưa..."
                rows={3}
                className="w-full rounded-2xl border border-black/10 p-3 text-xs text-ink focus:border-forest focus:ring-1 focus:ring-forest"
              />
              <div className="flex items-center justify-between">
                {noteSavedMsg ? (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="size-3.5" /> Đã lưu ghi chú thành công!
                  </span>
                ) : <span />}
                <button
                  type="button"
                  onClick={handleSaveBusinessNote}
                  disabled={savingNote}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-forest px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-forest/90 transition disabled:opacity-50"
                >
                  <Save className="size-3.5" /> {savingNote ? "Đang lưu..." : "Lưu ghi chú điều phối"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Status Management & VietQR */}
        <div className="space-y-6">
          {/* Status & Lifecycle Management */}
          <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5 space-y-5">
            <h2 className="text-base font-extrabold text-ink flex items-center gap-2 border-b border-black/5 pb-4">
              <ShieldCheck className="size-4 text-forest" /> Quản trị Vòng đời & Thanh toán
            </h2>

            {/* Lifecycle */}
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

            {/* Payment Status */}
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

          {/* Quick VietQR Generator for this booking */}
          <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5 space-y-4">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <h2 className="text-base font-extrabold text-ink flex items-center gap-2">
                <QrCode className="size-4 text-forest" /> Mã VietQR Đơn này
              </h2>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                Tự động tạo
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 bg-stone-50 rounded-2xl border border-black/5">
              <img
                src={vietQrUrl}
                alt="VietQR Đơn đặt"
                className="max-h-64 object-contain rounded-xl shadow-sm bg-white p-2"
              />
              <p className="font-mono text-xs font-bold text-forest mt-2">
                {currentQrAmount.toLocaleString("vi-VN")} đ
              </p>
              <p className="text-[11px] text-ink/60 font-mono mt-0.5">
                Cú pháp: {qrMemo}
              </p>
            </div>

            {/* QR Amount controls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink/60 font-semibold">Tùy chỉnh số tiền QR:</span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setQrAmount(finalAmountNum)}
                    className="rounded-lg bg-black/5 px-2 py-1 text-[10px] font-bold hover:bg-black/10"
                  >
                    100% ({finalAmountNum.toLocaleString("vi-VN")} đ)
                  </button>
                  {finalAmountNum > 0 && (
                    <button
                      type="button"
                      onClick={() => setQrAmount(Math.round(finalAmountNum * 0.3))}
                      className="rounded-lg bg-black/5 px-2 py-1 text-[10px] font-bold hover:bg-black/10"
                    >
                      Cọc 30% ({Math.round(finalAmountNum * 0.3).toLocaleString("vi-VN")} đ)
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={qrAmount || ""}
                  onChange={(e) => setQrAmount(Number(e.target.value) || 0)}
                  placeholder="Nhập số tiền..."
                  className="w-full rounded-xl border border-black/10 px-3 py-1.5 text-xs font-bold"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(vietQrUrl);
                    setCopiedQr(true);
                    setTimeout(() => setCopiedQr(false), 2500);
                  }}
                  className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-forest/10 hover:bg-forest/20 text-forest py-2 text-xs font-bold transition"
                >
                  <Copy className="size-3.5" />
                  {copiedQr ? "Đã chép link QR!" : "Chép link ảnh QR"}
                </button>
                <a
                  href={vietQrUrl}
                  target="_blank"
                  rel="noreferrer"
                  download={`vietqr-${booking.id}.png`}
                  className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 py-2 text-xs font-bold transition"
                >
                  <Download className="size-3.5" /> Tải ảnh QR
                </a>
              </div>
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
              {/* Event 1: Tạo đơn */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1 size-4 rounded-full bg-forest border-2 border-white shadow-sm" />
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <h4 className="font-extrabold text-xs text-ink">Khởi tạo đơn đặt</h4>
                    <span className="text-[10px] text-ink/40 font-mono">
                      {booking.createdAt ? new Date(booking.createdAt).toLocaleString("vi-VN") : "Gần đây"}
                    </span>
                  </div>
                  <p className="text-xs text-ink/70 mt-1 leading-relaxed">
                    Đơn đặt được khởi tạo qua hệ thống Chạm A Lưới bởi {booking.customerName || "du khách"}.
                  </p>
                </div>
              </div>

              {/* Event 2+: Các sự kiện timeline khác nếu có */}
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
