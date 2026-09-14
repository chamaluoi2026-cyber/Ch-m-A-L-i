"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  fetchBusinessLeadsAction,
  updateLeadStatusAction,
  convertLeadToBookingAction
} from "@/app/actions/leads";
import type { LeadRecord, LeadStatus } from "@/lib/leads";
import {
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  MessageCircle,
  MessageSquare,
  Package,
  Phone,
  Sparkles,
  Ticket,
  User,
  Users
} from "lucide-react";

export default function BusinessLeadsPage() {
  const currentBusinessId = "biz-a-nor";
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Booking conversion modal for business
  const [activeConvertLead, setActiveConvertLead] = useState<LeadRecord | null>(null);
  const [bookingType, setBookingType] = useState<"tour" | "homestay" | "product">("tour");
  const [bookingTitle, setBookingTitle] = useState("");
  const [unitPrice, setUnitPrice] = useState(500000);
  const [quantity, setQuantity] = useState(2);
  const [startDate, setStartDate] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [convertError, setConvertError] = useState<string | null>(null);

  function loadLeads() {
    fetchBusinessLeadsAction(currentBusinessId).then(setLeads);
  }

  useEffect(() => {
    loadLeads();
  }, []);

  async function handleStatus(leadId: string, status: LeadStatus) {
    setUpdatingId(leadId);
    const res = await updateLeadStatusAction(leadId, status, {
      actor: { id: "usr-biz-1", name: "Hồ Văn Lập (HTX A Nôr)", role: "business" }
    });
    setUpdatingId(null);
    if (res.success && res.lead) {
      setLeads((prev) => prev.map((l) => (l.leadId === leadId ? res.lead! : l)));
    }
  }

  function openConvertModal(lead: LeadRecord) {
    setActiveConvertLead(lead);
    setBookingTitle(lead.serviceOrTour || `Trải nghiệm ${lead.placeName}`);
    setQuantity(lead.guests || 2);
    setStartDate(lead.expectedDate || "");
    setBookingNotes(lead.need || "");
    setConvertError(null);
  }

  async function handleConvertSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeConvertLead) return;
    setConvertError(null);

    startTransition(async () => {
      const res = await convertLeadToBookingAction(activeConvertLead.leadId, {
        type: bookingType,
        itemTitle: bookingTitle,
        unitPrice: Number(unitPrice) || 0,
        quantity: Number(quantity) || 1,
        startDate: startDate || activeConvertLead.expectedDate,
        notes: bookingNotes || activeConvertLead.need,
        actor: { id: "usr-biz-1", name: "Hồ Văn Lập (HTX A Nôr)", role: "business" }
      });

      if (res.success && res.lead) {
        setLeads((prev) => prev.map((l) => (l.leadId === activeConvertLead.leadId ? res.lead! : l)));
        setActiveConvertLead(null);
      } else {
        setConvertError(res.error || "Không thể chuyển đổi sang Booking.");
      }
    });
  }

  const statusMap: Record<LeadStatus, { label: string; badgeClass: string }> = {
    new: { label: "Mới gửi", badgeClass: "bg-blue-100 text-blue-800" },
    contacted: { label: "Đã liên hệ", badgeClass: "bg-indigo-100 text-indigo-800" },
    consulting: { label: "Đang tư vấn", badgeClass: "bg-amber-100 text-amber-800" },
    converted: { label: "Đã chốt (Booking)", badgeClass: "bg-emerald-100 text-emerald-800" },
    unsuccessful: { label: "Không thành công", badgeClass: "bg-red-100 text-red-800" },
    voucher_used: { label: "Đã dùng voucher", badgeClass: "bg-teal-100 text-teal-800" },
    expired: { label: "Hết hạn", badgeClass: "bg-gray-100 text-gray-700" },
    cancelled: { label: "Đã hủy", badgeClass: "bg-stone-100 text-stone-700" }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">Danh sách Leads Khách Gửi Về Cơ Sở</h1>
          <p className="text-xs text-ink/60 mt-1">
            Tiếp nhận yêu cầu tư vấn, kết nối Zalo trực tiếp với khách và chốt đơn chuyển thành Booking
          </p>
        </div>
        <span className="rounded-2xl bg-forest/10 px-3.5 py-2 text-xs font-bold text-forest">
          {leads.length} Khách hàng quan tâm
        </span>
      </div>

      <div className="grid gap-4">
        {leads.length === 0 ? (
          <div className="rounded-3xl bg-white p-8 text-center text-ink/50 shadow-card border border-black/5">
            Chưa có khách hàng nào để lại thông tin tư vấn cho cơ sở của bạn.
          </div>
        ) : (
          leads.map((lead) => {
            const st = statusMap[lead.status] || { label: lead.status, badgeClass: "bg-gray-100 text-gray-700" };
            const cleanPhone = lead.phone.replace(/[^0-9]/g, "");
            const zaloUrl = `https://zalo.me/${cleanPhone}?text=${encodeURIComponent(`Xin chào ${lead.customerName}, tôi là đại diện ${lead.businessName}. Chúng tôi đã nhận được yêu cầu tư vấn của bạn từ Chạm A Lưới (Mã Lead: ${lead.leadId}, Voucher: ${lead.voucherCode}).`)}`;

            return (
              <div
                key={lead.leadId}
                className="rounded-3xl bg-white p-6 shadow-card border border-black/5 space-y-4"
              >
                {/* Header card */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold font-mono text-forest bg-forest/10 px-2 py-0.5 rounded">
                        {lead.leadId}
                      </span>
                      <h3 className="text-lg font-extrabold text-ink">{lead.customerName}</h3>
                    </div>
                    <p className="text-xs text-ink/50 mt-0.5">
                      Điểm đăng ký: <strong>{lead.placeName}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${st.badgeClass}`}>
                      {st.label}
                    </span>
                    {lead.convertedBookingId && (
                      <span className="rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 px-2.5 py-0.5 text-[11px] font-mono font-bold">
                        Đơn: {lead.convertedBookingId}
                      </span>
                    )}
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid gap-3 sm:grid-cols-3 text-xs">
                  <div className="rounded-2xl bg-beige p-3.5 space-y-2">
                    <p className="text-ink/50 font-semibold">Thông tin liên hệ & Zalo:</p>
                    <p className="font-extrabold text-ink text-sm font-mono">{lead.phone}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href={zaloUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#0068FF] text-white px-2.5 py-1 text-xs font-bold shadow-sm hover:bg-[#0054cc] transition"
                      >
                        <MessageCircle className="size-3.5" />
                        Liên hệ Zalo
                      </a>
                      <a
                        href={`tel:${cleanPhone}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-forest text-forest px-2.5 py-1 text-xs font-bold hover:bg-forest/5 transition"
                      >
                        <Phone className="size-3.5" />
                        Gọi điện
                      </a>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-beige p-3.5 space-y-1">
                    <p className="text-ink/50 font-semibold">Lịch trình & Đoàn:</p>
                    <p className="font-extrabold text-ink text-sm mt-0.5">
                      {lead.expectedDate} ({lead.guests} người)
                    </p>
                    {lead.serviceOrTour ? (
                      <p className="text-[11px] text-forest font-semibold mt-1">
                        Dịch vụ: {lead.serviceOrTour}
                      </p>
                    ) : null}
                    {lead.budget ? (
                      <p className="text-[11px] text-clay font-medium">Ngân sách: {lead.budget}</p>
                    ) : null}
                  </div>

                  <div className="rounded-2xl bg-beige p-3.5 space-y-1">
                    <p className="text-ink/50 font-semibold">Mã ưu đãi (Voucher):</p>
                    <p className="font-mono font-black text-clay text-base mt-0.5">{lead.voucherCode}</p>
                    <p className="text-[10px] text-ink/50">
                      Gốc: {lead.source || "WEBSITE"} {lead.campaign ? `(${lead.campaign})` : ""}
                    </p>
                  </div>
                </div>

                {/* Customer Need */}
                {lead.need ? (
                  <div className="rounded-2xl bg-forest/5 p-3.5 text-xs text-ink/80">
                    <span className="font-bold text-forest">Nhu cầu du khách ghi chú: </span>
                    <span className="italic font-medium">&ldquo;{lead.need}&rdquo;</span>
                  </div>
                ) : null}

                {/* Actions & Status row */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-black/5">
                  <span className="text-[11px] text-ink/40">
                    Thời gian gửi: {new Date(lead.createdAt).toLocaleString("vi-VN")}
                  </span>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={updatingId === lead.leadId || lead.status === "contacted"}
                      onClick={() => handleStatus(lead.leadId, "contacted")}
                      className="rounded-xl border border-black/10 bg-white hover:bg-beige px-3 py-1.5 text-xs font-bold text-ink transition disabled:opacity-50"
                    >
                      Đã liên hệ
                    </button>

                    <button
                      type="button"
                      disabled={updatingId === lead.leadId || lead.status === "consulting"}
                      onClick={() => handleStatus(lead.leadId, "consulting")}
                      className="rounded-xl bg-amber-100 hover:bg-amber-200 px-3 py-1.5 text-xs font-bold text-amber-800 transition disabled:opacity-50"
                    >
                      Đang tư vấn
                    </button>

                    {lead.status !== "converted" ? (
                      <button
                        type="button"
                        onClick={() => openConvertModal(lead)}
                        className="rounded-xl bg-emerald-600 hover:bg-emerald-700 px-3.5 py-1.5 text-xs font-black text-white shadow-sm transition flex items-center gap-1.5"
                      >
                        <Package className="size-3.5" />
                        Chốt đơn → Chuyển Booking
                      </button>
                    ) : (
                      <span className="rounded-xl bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-800">
                        ✓ Đã chuyển Booking
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Booking Conversion Modal */}
      {activeConvertLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 md:p-8 shadow-2xl border border-black/10 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <div className="flex items-center gap-2 text-emerald-700">
                <Package className="size-6" />
                <h3 className="text-xl font-black text-ink">Chốt đơn tư vấn qua Zalo</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveConvertLead(null)}
                className="size-8 rounded-full bg-beige text-ink/60 hover:text-ink flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="mt-3 text-xs text-ink/60 leading-relaxed">
              Tạo Booking chính thức liên kết với Lead <strong>{activeConvertLead.leadId}</strong> của khách <strong>{activeConvertLead.customerName}</strong>. Doanh thu và hoa hồng sẽ được đối soát tự động.
            </p>

            {convertError ? (
              <div className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
                {convertError}
              </div>
            ) : null}

            <form className="mt-4 grid gap-3 text-xs" onSubmit={handleConvertSubmit}>
              <div>
                <label className="font-bold text-ink block mb-1">Loại hình dịch vụ:</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "tour", label: "Tour" },
                    { id: "homestay", label: "Homestay" },
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
                <label className="font-bold text-ink block mb-1">Tên dịch vụ đã thỏa thuận với khách:</label>
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
                  <label className="font-bold text-ink block mb-1">Đơn giá chốt (VNĐ):</label>
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(Number(e.target.value) || 0)}
                    className="w-full rounded-2xl border border-black/10 px-3 py-2 text-xs font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Số lượng khách / suất:</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value) || 1)}
                    className="w-full rounded-2xl border border-black/10 px-3 py-2 text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-900 font-bold flex items-center justify-between">
                <span>Tổng giá trị đơn:</span>
                <span className="text-base font-black">
                  {(unitPrice * quantity).toLocaleString("vi-VN")} đ
                </span>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Ngày khách đến sử dụng dịch vụ:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Ghi chú đón tiếp & dặn dò:</label>
                <textarea
                  rows={2}
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full rounded-2xl border border-black/10 p-3 text-xs"
                />
              </div>

              <div className="mt-3 flex items-center justify-end gap-2 border-t border-black/5 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveConvertLead(null)}
                  className="rounded-xl border border-black/10 px-4 py-2 font-bold text-ink/70 hover:bg-beige"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-emerald-600 px-5 py-2 font-black text-white hover:bg-emerald-700 shadow-md transition disabled:opacity-50"
                >
                  Xác nhận chốt đơn Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
