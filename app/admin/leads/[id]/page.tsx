"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  fetchLeadByIdAction,
  updateLeadStatusAction,
  assignLeadAction,
  addLeadNoteAction,
  convertLeadToBookingAction,
  softDeleteLeadAction
} from "@/app/actions/leads";
import type { LeadRecord, LeadStatus, LeadLossReason } from "@/lib/leads";
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign,
  FileText,
  Gift,
  History,
  MessageCircle,
  MessageSquare,
  Package,
  Phone,
  Send,
  ShieldAlert,
  Sparkles,
  Tag,
  Trash2,
  TrendingUp,
  User,
  UserCheck,
  Users,
  XCircle
} from "lucide-react";

export default function AdminLeadDetailPage() {
  const params = useParams();
  const router = useRouter();
  const leadId = params?.id as string;

  const [lead, setLead] = useState<LeadRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  // Status Modal / Form states
  const [selectedStatus, setSelectedStatus] = useState<LeadStatus>("new");
  const [lossReason, setLossReason] = useState<LeadLossReason>("unreachable");
  const [lossNote, setLossNote] = useState("");

  // Assign form states
  const [assignedBusiness, setAssignedBusiness] = useState("");
  const [assignedStaff, setAssignedStaff] = useState("");
  const [nextFollowUp, setNextFollowUp] = useState("");

  // Note form state
  const [newNote, setNewNote] = useState("");

  // Booking Conversion modal
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingType, setBookingType] = useState<"tour" | "homestay" | "product">("tour");
  const [bookingTitle, setBookingTitle] = useState("");
  const [bookingUnitPrice, setBookingUnitPrice] = useState(500000);
  const [bookingQty, setBookingQty] = useState(2);
  const [bookingStartDate, setBookingStartDate] = useState("");
  const [bookingAddress, setBookingAddress] = useState("");
  const [bookingNote, setBookingNote] = useState("");
  const [convertError, setConvertError] = useState<string | null>(null);

  function loadLead() {
    if (!leadId) return;
    setLoading(true);
    fetchLeadByIdAction(leadId).then((data) => {
      setLead(data);
      if (data) {
        setSelectedStatus(data.status);
        setAssignedBusiness(data.assignedBusinessName || data.businessName || "");
        setAssignedStaff(data.assignedStaffName || "");
        setNextFollowUp(data.nextFollowUpAt || "");
        setBookingTitle(data.serviceOrTour || `Trải nghiệm ${data.placeName}`);
        setBookingQty(data.guests || 2);
        setBookingStartDate(data.expectedDate || "");
        setBookingNote(data.need || "");
      }
      setLoading(false);
    });
  }

  useEffect(() => {
    loadLead();
  }, [leadId]);

  // Handler: Update Status
  async function handleUpdateStatus() {
    if (!lead) return;
    startTransition(async () => {
      const res = await updateLeadStatusAction(lead.leadId, selectedStatus, {
        lossReason: selectedStatus === "unsuccessful" ? lossReason : undefined,
        lossNote: selectedStatus === "unsuccessful" ? lossNote : undefined,
        actor: { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" }
      });
      if (res.success && res.lead) {
        setLead(res.lead);
      }
    });
  }

  // Handler: Assign Business & Staff
  async function handleAssign() {
    if (!lead) return;
    startTransition(async () => {
      const res = await assignLeadAction(lead.leadId, {
        businessName: assignedBusiness,
        staffName: assignedStaff,
        nextFollowUpAt: nextFollowUp || undefined,
        actor: { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" }
      });
      if (res.success && res.lead) {
        setLead(res.lead);
      }
    });
  }

  // Handler: Add Note
  async function handleAddNote() {
    if (!lead || !newNote.trim()) return;
    startTransition(async () => {
      const res = await addLeadNoteAction(lead.leadId, newNote.trim(), {
        id: "usr-admin-1",
        name: "Ban Quản Trị",
        role: "admin"
      });
      if (res.success && res.lead) {
        setLead(res.lead);
        setNewNote("");
      }
    });
  }

  // Handler: Convert to Booking
  async function handleConvertBooking() {
    if (!lead) return;
    setConvertError(null);
    startTransition(async () => {
      const res = await convertLeadToBookingAction(lead.leadId, {
        type: bookingType,
        itemTitle: bookingTitle,
        unitPrice: Number(bookingUnitPrice) || 0,
        quantity: Number(bookingQty) || 1,
        startDate: bookingStartDate || lead.expectedDate,
        deliveryAddress: bookingAddress || undefined,
        notes: bookingNote || lead.need,
        actor: { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" }
      });

      if (res.success && res.lead) {
        setLead(res.lead);
        setShowBookingModal(false);
      } else {
        setConvertError(res.error || "Không thể chuyển Lead sang Booking.");
      }
    });
  }

  // Handler: Soft Delete
  async function handleSoftDelete() {
    if (!lead) return;
    if (!confirm("Bạn có chắc muốn ẩn Lead này không? Lead sẽ không bị xóa vĩnh viễn và vẫn được giữ cho audit log.")) {
      return;
    }
    startTransition(async () => {
      const res = await softDeleteLeadAction(lead.leadId);
      if (res.success) {
        router.push("/admin/leads");
      }
    });
  }

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="size-8 mx-auto animate-spin rounded-full border-4 border-forest border-t-transparent" />
        <p className="mt-4 text-xs font-bold text-ink/60">Đang tải hồ sơ Lead...</p>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="rounded-3xl bg-white p-12 text-center shadow-card border border-black/5">
        <AlertCircle className="mx-auto size-12 text-clay" />
        <h2 className="mt-4 text-xl font-bold text-ink">Không tìm thấy Lead</h2>
        <p className="mt-2 text-xs text-ink/60">Mã Lead không tồn tại hoặc đã bị xóa.</p>
        <Link
          href="/admin/leads"
          className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-forest px-5 py-2.5 text-xs font-bold text-white shadow-sm"
        >
          <ArrowLeft className="size-4" /> Quay lại danh sách Lead
        </Link>
      </div>
    );
  }

  const statusMap: Record<LeadStatus, { label: string; badge: string }> = {
    new: { label: "Mới tạo", badge: "bg-blue-100 text-blue-800" },
    contacted: { label: "Đã liên hệ", badge: "bg-indigo-100 text-indigo-800" },
    consulting: { label: "Đang tư vấn", badge: "bg-amber-100 text-amber-800" },
    converted: { label: "Đã chuyển Booking", badge: "bg-emerald-100 text-emerald-800" },
    unsuccessful: { label: "Không thành công", badge: "bg-red-100 text-red-800" },
    voucher_used: { label: "Đã dùng voucher", badge: "bg-teal-100 text-teal-800" },
    expired: { label: "Hết hạn", badge: "bg-gray-100 text-gray-700" },
    cancelled: { label: "Đã hủy", badge: "bg-stone-100 text-stone-700" }
  };

  const currentSt = statusMap[lead.status] || { label: lead.status, badge: "bg-gray-100 text-gray-700" };

  return (
    <div className="space-y-6 pb-20">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/leads"
            className="flex size-10 items-center justify-center rounded-2xl bg-white shadow-sm border border-black/5 text-ink/70 hover:text-forest hover:bg-beige transition"
          >
            <ArrowLeft className="size-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-black text-forest">{lead.leadId}</span>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${currentSt.badge}`}>
                {currentSt.label}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-ink mt-0.5">
              Hồ sơ tư vấn: {lead.customerName}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {lead.status !== "converted" ? (
            <button
              type="button"
              onClick={() => setShowBookingModal(true)}
              className="flex items-center gap-2 rounded-2xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-700 transition"
            >
              <Package className="size-4" /> Chuyển thành Booking
            </button>
          ) : (
            <Link
              href="/admin/orders"
              className="flex items-center gap-2 rounded-2xl bg-emerald-100 border border-emerald-300 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-200 transition"
            >
              <CheckCircle2 className="size-4 text-emerald-700" />
              Đã chuyển Booking ({lead.convertedBookingId}) → Xem đơn
            </Link>
          )}

          <button
            type="button"
            onClick={handleSoftDelete}
            className="flex items-center gap-1.5 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition"
            title="Ẩn Lead (Soft delete)"
          >
            <Trash2 className="size-3.5" /> Ẩn Lead
          </button>
        </div>
      </div>

      {/* Main Grid: Left Details & Right Timeline */}
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left Column: Customer Details, Request Info, Assign & Status */}
        <div className="space-y-6">
          {/* Card: Customer Information */}
          <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <h2 className="text-base font-extrabold text-ink flex items-center gap-2">
                <User className="size-4 text-forest" /> Thông tin khách hàng
              </h2>
              <span className="rounded-full bg-forest/10 px-2.5 py-0.5 text-xs font-mono font-bold text-forest">
                {lead.source || "WEBSITE"}
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <p className="text-ink/50 font-semibold">Họ và tên:</p>
                <p className="text-sm font-extrabold text-ink mt-0.5">{lead.customerName}</p>
              </div>

              <div>
                <p className="text-ink/50 font-semibold">Số điện thoại / Hotline:</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono font-bold text-sm text-ink">{lead.phone}</span>
                  <a
                    href={`tel:${lead.phone}`}
                    className="size-6 rounded-full bg-forest/10 flex items-center justify-center text-forest hover:bg-forest hover:text-white transition"
                    title="Gọi ngay"
                  >
                    <Phone className="size-3" />
                  </a>
                </div>
              </div>

              <div>
                <p className="text-ink/50 font-semibold">Zalo trao đổi:</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-mono font-bold text-ink">{lead.zalo || lead.phone}</span>
                  <a
                    href={`https://zalo.me/${lead.zalo || lead.phone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="size-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition"
                    title="Mở Zalo"
                  >
                    <MessageCircle className="size-3" />
                  </a>
                </div>
              </div>

              <div>
                <p className="text-ink/50 font-semibold">Email:</p>
                <p className="font-medium text-ink mt-0.5">{lead.email || "Không cung cấp"}</p>
              </div>

              <div>
                <p className="text-ink/50 font-semibold">Mã Voucher gắn kèm:</p>
                <p className="font-mono font-extrabold text-clay mt-0.5">{lead.voucherCode}</p>
              </div>

              <div>
                <p className="text-ink/50 font-semibold">Khách hàng ID (Tài khoản):</p>
                <p className="font-mono text-ink/70 mt-0.5">{lead.customerId || lead.userId || "Khách vãng lai"}</p>
              </div>
            </div>

            {/* Tracking UTM Metadata */}
            {(lead.landingPage || lead.utmSource || lead.utmCampaign) && (
              <div className="mt-5 rounded-2xl bg-beige/60 p-3.5 text-[11px] text-ink/75 space-y-1">
                <p className="font-bold text-forest">Dữ liệu nguồn & Tracking:</p>
                {lead.landingPage ? <p>Landing page: <code className="text-forest font-semibold">{lead.landingPage}</code></p> : null}
                {lead.utmSource ? <p>UTM Source: <span className="font-mono font-semibold">{lead.utmSource}</span> | Medium: <span className="font-mono">{lead.utmMedium || "-"}</span> | Campaign: <span className="font-mono">{lead.utmCampaign || "-"}</span></p> : null}
              </div>
            )}
          </div>

          {/* Card: Trip Requirements */}
          <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5">
            <h2 className="text-base font-extrabold text-ink flex items-center gap-2 border-b border-black/5 pb-4">
              <Compass className="size-4 text-forest" /> Nhu cầu & Trải nghiệm quan tâm
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-3 text-xs">
              <div className="rounded-2xl bg-beige/40 p-3">
                <p className="text-ink/50 font-semibold">Địa điểm quan tâm:</p>
                <p className="font-extrabold text-forest mt-0.5 text-sm">{lead.placeName}</p>
                <Link
                  href={`/places/${lead.placeSlug}`}
                  target="_blank"
                  className="mt-1 text-[11px] text-clay font-bold hover:underline inline-block"
                >
                  Xem trang public →
                </Link>
              </div>

              <div className="rounded-2xl bg-beige/40 p-3">
                <p className="text-ink/50 font-semibold">Lịch trình & Giờ đến:</p>
                <p className="font-bold text-ink mt-0.5">{lead.expectedDate}</p>
                <p className="text-ink/60 text-[11px] mt-0.5">
                  Khung giờ: {lead.preferredTime || "Chưa xác định"}
                </p>
              </div>

              <div className="rounded-2xl bg-beige/40 p-3">
                <p className="text-ink/50 font-semibold">Số lượng khách & Ngân sách:</p>
                <p className="font-bold text-ink mt-0.5">{lead.guests} khách</p>
                <p className="text-clay text-[11px] font-semibold mt-0.5">
                  Ngân sách: {lead.budget || "Linh hoạt"}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 p-4 text-xs">
              <p className="font-bold text-amber-900">Ghi chú & Yêu cầu cụ thể của khách:</p>
              <p className="mt-1.5 leading-relaxed text-amber-950 font-medium italic">
                &ldquo;{lead.need || "Khách không để lại ghi chú thêm."}&rdquo;
              </p>
            </div>
          </div>

          {/* Card: Status Management & Assignee */}
          <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5 space-y-5">
            <h2 className="text-base font-extrabold text-ink flex items-center gap-2 border-b border-black/5 pb-4">
              <UserCheck className="size-4 text-forest" /> Điều phối CRM & Cập nhật trạng thái
            </h2>

            {/* Lifecycle Status Selector */}
            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div>
                <label className="font-bold text-ink block mb-1.5">Trạng thái vòng đời Lead:</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as LeadStatus)}
                  className="w-full rounded-2xl border border-black/10 bg-white px-3 py-2.5 text-xs font-bold text-ink focus:ring-2 focus:ring-forest"
                >
                  <option value="new">MỚI (Lead created)</option>
                  <option value="contacted">ĐÃ LIÊN HỆ (Admin contacted)</option>
                  <option value="consulting">ĐANG TƯ VẤN (Customer consulted)</option>
                  <option value="converted">ĐÃ CHUYỂN BOOKING (Chốt thành công)</option>
                  <option value="unsuccessful">KHÔNG THÀNH CÔNG (Thất bại)</option>
                  <option value="voucher_used">ĐÃ SỬ DỤNG VOUCHER (Tại cơ sở)</option>
                </select>
              </div>

              {selectedStatus === "unsuccessful" && (
                <div>
                  <label className="font-bold text-red-600 block mb-1.5">Lý do không thành công:</label>
                  <select
                    value={lossReason}
                    onChange={(e) => setLossReason(e.target.value as LeadLossReason)}
                    className="w-full rounded-2xl border border-red-200 bg-red-50/50 px-3 py-2.5 text-xs font-bold text-red-700 focus:ring-2 focus:ring-red-500"
                  >
                    <option value="unreachable">Không liên hệ được</option>
                    <option value="plan_changed">Khách đổi kế hoạch</option>
                    <option value="price_unfit">Giá không phù hợp</option>
                    <option value="fully_booked">Hết chỗ / Hết phòng</option>
                    <option value="chose_competitor">Chọn đơn vị khác</option>
                    <option value="other">Lý do khác</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Ghi chú chi tiết lý do thất bại..."
                    value={lossNote}
                    onChange={(e) => setLossNote(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-red-200 px-3 py-1.5 text-xs bg-white"
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleUpdateStatus}
              disabled={isPending}
              className="rounded-2xl bg-forest px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-forest/90 transition disabled:opacity-50"
            >
              Lưu thay đổi trạng thái
            </button>

            <hr className="border-black/5" />

            {/* Business & Staff Assignment */}
            <div className="grid gap-3 sm:grid-cols-3 text-xs">
              <div>
                <label className="font-bold text-ink block mb-1.5">Doanh nghiệp phụ trách:</label>
                <input
                  type="text"
                  value={assignedBusiness}
                  onChange={(e) => setAssignedBusiness(e.target.value)}
                  placeholder="Tên cơ sở / HTX..."
                  className="w-full rounded-2xl border border-black/10 px-3 py-2 text-xs bg-beige/40 focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1.5">Nhân viên phụ trách:</label>
                <input
                  type="text"
                  value={assignedStaff}
                  onChange={(e) => setAssignedStaff(e.target.value)}
                  placeholder="Tên nhân viên..."
                  className="w-full rounded-2xl border border-black/10 px-3 py-2 text-xs bg-beige/40 focus:ring-2 focus:ring-forest"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1.5">Lịch hẹn chăm sóc lại:</label>
                <input
                  type="date"
                  value={nextFollowUp}
                  onChange={(e) => setNextFollowUp(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 px-3 py-2 text-xs bg-beige/40 focus:ring-2 focus:ring-forest"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleAssign}
              disabled={isPending}
              className="rounded-2xl border border-forest text-forest hover:bg-forest/5 px-4 py-2 text-xs font-bold transition disabled:opacity-50"
            >
              Cập nhật phân công & Lịch hẹn
            </button>
          </div>
        </div>

        {/* Right Column: Interactive CRM Timeline & Internal Notes */}
        <div className="space-y-6">
          {/* Notes Section */}
          <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5">
            <h2 className="text-base font-extrabold text-ink flex items-center gap-2 border-b border-black/5 pb-4">
              <MessageSquare className="size-4 text-forest" /> Ghi chú nội bộ & Nhật ký tư vấn
            </h2>

            <div className="mt-4 flex gap-2">
              <textarea
                rows={2}
                placeholder="Nhập ghi chú mới về khách (thói quen, yêu cầu xe đón, mức giá mong muốn...)"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full rounded-2xl border border-black/10 p-3 text-xs focus:ring-2 focus:ring-forest bg-beige/30"
              />
              <button
                type="button"
                onClick={handleAddNote}
                disabled={isPending || !newNote.trim()}
                className="self-end rounded-2xl bg-forest px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-forest/90 transition disabled:opacity-40"
              >
                <Send className="size-4" />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {(!lead.notes || lead.notes.length === 0) ? (
                <p className="text-xs text-ink/40 italic py-2">Chưa có ghi chú nào.</p>
              ) : (
                lead.notes.map((note) => (
                  <div key={note.id} className="rounded-2xl bg-beige/50 p-3 text-xs border border-black/5">
                    <div className="flex items-center justify-between text-[11px] text-ink/50">
                      <span className="font-bold text-forest">{note.authorName}</span>
                      <span>{new Date(note.createdAt).toLocaleString("vi-VN")}</span>
                    </div>
                    <p className="mt-1 text-ink/80 leading-relaxed font-medium">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Timeline Section */}
          <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <h2 className="text-base font-extrabold text-ink flex items-center gap-2">
                <History className="size-4 text-forest" /> Hành trình Lead Lifecycle
              </h2>
              <span className="text-[11px] text-ink/40">{(lead.timeline || []).length} mốc sự kiện</span>
            </div>

            <div className="mt-6 relative pl-6 border-l-2 border-forest/20 space-y-6">
              {(lead.timeline || []).map((event, idx) => (
                <div key={event.id || idx} className="relative">
                  {/* Timeline bullet dot */}
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
                      Người thực hiện: <span className="font-bold text-ink/60">{event.actor?.name || "Hệ thống"}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Conversion Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-black/10 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <Package className="size-6" />
                <h3 className="text-xl font-black text-ink">Chuyển Lead thành Booking</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowBookingModal(false)}
                className="size-8 rounded-full bg-beige text-ink/60 hover:text-ink flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-xs text-ink/60 leading-relaxed">
              Hệ thống sẽ tạo mới một <strong>BookingRecord</strong> có mã liên kết <code>leadId: &quot;{lead.leadId}&quot;</code>, giữ nguyên hồ sơ Lead để đối soát và audit.
            </p>

            {convertError ? (
              <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
                {convertError}
              </div>
            ) : null}

            <form
              className="mt-4 grid gap-3 text-xs"
              onSubmit={(e) => {
                e.preventDefault();
                handleConvertBooking();
              }}
            >
              <div>
                <label className="font-bold text-ink block mb-1">Loại dịch vụ:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "tour", label: "Tour trọn gói" },
                    { id: "homestay", label: "Homestay / Phòng" },
                    { id: "product", label: "Đặc sản" }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setBookingType(t.id as any)}
                      className={`rounded-xl py-2 font-bold text-center border transition ${
                        bookingType === t.id
                          ? "bg-forest text-white border-forest shadow-sm"
                          : "bg-beige text-ink/70 border-black/5 hover:bg-forest/10"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Tên gói dịch vụ / Tour:</label>
                <input
                  type="text"
                  required
                  value={bookingTitle}
                  onChange={(e) => setBookingTitle(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Đơn giá (VNĐ):</label>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    required
                    value={bookingUnitPrice}
                    onChange={(e) => setBookingUnitPrice(Number(e.target.value) || 0)}
                    className="w-full rounded-2xl border border-black/10 px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Số lượng / Số khách:</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={bookingQty}
                    onChange={(e) => setBookingQty(Number(e.target.value) || 1)}
                    className="w-full rounded-2xl border border-black/10 px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-900 font-bold flex items-center justify-between">
                <span>Tạm tính (chưa trừ voucher):</span>
                <span className="text-base font-black">
                  {(bookingUnitPrice * bookingQty).toLocaleString("vi-VN")} đ
                </span>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Ngày khởi hành / nhận phòng:</label>
                <input
                  type="date"
                  value={bookingStartDate}
                  onChange={(e) => setBookingStartDate(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 px-3 py-2 text-xs"
                />
              </div>

              {bookingType === "product" && (
                <div>
                  <label className="font-bold text-ink block mb-1">Địa chỉ giao hàng:</label>
                  <input
                    type="text"
                    value={bookingAddress}
                    onChange={(e) => setBookingAddress(e.target.value)}
                    placeholder="Số nhà, đường, phường/xã..."
                    className="w-full rounded-2xl border border-black/10 px-3 py-2 text-xs"
                  />
                </div>
              )}

              <div>
                <label className="font-bold text-ink block mb-1">Ghi chú điều hành:</label>
                <textarea
                  rows={2}
                  value={bookingNote}
                  onChange={(e) => setBookingNote(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 p-3 text-xs"
                />
              </div>

              <div className="mt-3 flex items-center justify-end gap-2 border-t border-black/5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="rounded-xl border border-black/10 px-4 py-2 font-bold text-ink/70 hover:bg-beige"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-black text-white hover:bg-emerald-700 shadow-md transition disabled:opacity-50"
                >
                  Xác nhận chốt & Tạo Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
