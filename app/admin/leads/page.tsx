"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  fetchAllLeadsAction,
  updateLeadStatusAction
} from "@/app/actions/leads";
import type { LeadRecord, LeadStatus, LeadSource } from "@/lib/leads";
import {
  ArrowUpDown,
  Calendar,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  Kanban,
  List,
  MessageSquare,
  Phone,
  Search,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  XCircle
} from "lucide-react";

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSource, setFilterSource] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [sortBy, setSortBy] = useState<"created_desc" | "created_asc" | "expected_asc">("created_desc");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function loadLeads() {
    try {
      const res = await fetch("/api/leads");
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setLeads(json.data);
        }
      }
    } catch (e) {
      console.error("Lỗi tải leads:", e);
    }
  }

  useEffect(() => {
    loadLeads();
    const interval = setInterval(loadLeads, 10000);
    return () => clearInterval(interval);
  }, []);

  async function handleQuickStatusChange(leadId: string, newStatus: LeadStatus) {
    setUpdatingId(leadId);
    try {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status: newStatus })
      });
      const data = await res.json();
      if (data.success && data.lead) {
        setLeads((prev) => prev.map((l) => (l.leadId === leadId ? data.lead : l)));
      }
    } catch (e) {
      console.error("Lỗi cập nhật trạng thái:", e);
    } finally {
      setUpdatingId(null);
    }
  }

  // Calculate CRM Metrics
  const metrics = useMemo(() => {
    const total = leads.length;
    const newCount = leads.filter((l) => l.status === "new").length;
    const contactedCount = leads.filter((l) => l.status === "contacted").length;
    const consultingCount = leads.filter((l) => l.status === "consulting").length;
    const convertedCount = leads.filter((l) => l.status === "converted" || l.status === "voucher_used").length;
    const failedCount = leads.filter((l) => l.status === "unsuccessful" || l.status === "cancelled" || l.status === "expired").length;
    const conversionRate = total > 0 ? Math.round((convertedCount / total) * 100) : 0;

    return {
      total,
      newCount,
      contactedCount,
      consultingCount,
      convertedCount,
      failedCount,
      conversionRate
    };
  }, [leads]);

  // Filtering & Sorting
  const filteredAndSorted = useMemo(() => {
    let list = leads.filter((lead) => {
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "active_pipeline"
          ? lead.status === "new" || lead.status === "contacted" || lead.status === "consulting"
          : lead.status === filterStatus);

      const matchSource = filterSource === "all" || lead.source === filterSource;

      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        term === "" ||
        lead.customerName.toLowerCase().includes(term) ||
        lead.phone.includes(term) ||
        lead.leadId.toLowerCase().includes(term) ||
        lead.voucherCode.toLowerCase().includes(term) ||
        lead.placeName.toLowerCase().includes(term) ||
        (lead.assignedBusinessName && lead.assignedBusinessName.toLowerCase().includes(term)) ||
        (lead.assignedStaffName && lead.assignedStaffName.toLowerCase().includes(term));

      return matchStatus && matchSource && matchSearch;
    });

    list.sort((a, b) => {
      if (sortBy === "created_desc") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "created_asc") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      if (sortBy === "expected_asc") return new Date(a.expectedDate).getTime() - new Date(b.expectedDate).getTime();
      return 0;
    });

    return list;
  }, [leads, filterStatus, filterSource, searchTerm, sortBy]);

  const totalPages = Math.ceil(filteredAndSorted.length / pageSize) || 1;
  const paginatedLeads = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSorted.slice(start, start + pageSize);
  }, [filteredAndSorted, currentPage, pageSize]);

  // Status mapping labels & colors
  const statusConfig: Record<LeadStatus, { label: string; badgeClass: string; borderClass: string }> = {
    new: { label: "Mới", badgeClass: "bg-blue-100 text-blue-800", borderClass: "border-blue-500" },
    contacted: { label: "Đã liên hệ", badgeClass: "bg-indigo-100 text-indigo-800", borderClass: "border-indigo-500" },
    consulting: { label: "Đang tư vấn", badgeClass: "bg-amber-100 text-amber-800", borderClass: "border-amber-500" },
    converted: { label: "Đã chuyển Booking", badgeClass: "bg-emerald-100 text-emerald-800", borderClass: "border-emerald-500" },
    unsuccessful: { label: "Không thành công", badgeClass: "bg-red-100 text-red-800", borderClass: "border-red-500" },
    voucher_used: { label: "Đã dùng voucher", badgeClass: "bg-teal-100 text-teal-800", borderClass: "border-teal-500" },
    expired: { label: "Hết hạn", badgeClass: "bg-gray-100 text-gray-700", borderClass: "border-gray-400" },
    cancelled: { label: "Đã hủy", badgeClass: "bg-stone-100 text-stone-700", borderClass: "border-stone-400" }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-ink">Quản lý Lead & CRM Pipeline</h1>
          <p className="text-xs text-ink/60 mt-1">
            Theo dõi hành trình tư vấn từ khách hàng website, phân công cơ sở, chốt đơn đến chuyển đổi Booking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-beige rounded-2xl p-1 flex items-center border border-black/5">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === "table" ? "bg-white text-forest shadow-sm" : "text-ink/60 hover:text-ink"
              }`}
            >
              <List className="size-3.5" /> Bảng
            </button>
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                viewMode === "kanban" ? "bg-white text-forest shadow-sm" : "text-ink/60 hover:text-ink"
              }`}
            >
              <Kanban className="size-3.5" /> Kanban
            </button>
          </div>
        </div>
      </div>

      {/* CRM Pipeline KPI Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="rounded-3xl bg-white p-4 shadow-sm border border-black/5 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-ink/50 uppercase tracking-wider">Tổng Lead</span>
          <p className="mt-2 text-2xl font-black text-ink">{metrics.total}</p>
          <span className="text-[10px] text-ink/40 mt-1">Toàn hệ thống</span>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm border border-black/5 border-l-4 border-l-blue-500 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Mới tạo</span>
          <p className="mt-2 text-2xl font-black text-blue-700">{metrics.newCount}</p>
          <span className="text-[10px] text-blue-500/80 mt-1">Chờ phân công/liên hệ</span>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm border border-black/5 border-l-4 border-l-indigo-500 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider">Đã liên hệ</span>
          <p className="mt-2 text-2xl font-black text-indigo-700">{metrics.contactedCount}</p>
          <span className="text-[10px] text-indigo-500/80 mt-1">Đã kết nối điện thoại/Zalo</span>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm border border-black/5 border-l-4 border-l-amber-500 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">Đang tư vấn</span>
          <p className="mt-2 text-2xl font-black text-amber-700">{metrics.consultingCount}</p>
          <span className="text-[10px] text-amber-500/80 mt-1">Đang chốt tour/phòng</span>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm border border-black/5 border-l-4 border-l-emerald-500 flex flex-col justify-between">
          <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">Đã chuyển Booking</span>
          <p className="mt-2 text-2xl font-black text-emerald-700">{metrics.convertedCount}</p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1">Thành công</span>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm border border-black/5 border-l-4 border-l-clay flex flex-col justify-between">
          <span className="text-[11px] font-bold text-clay uppercase tracking-wider">Tỷ lệ chốt</span>
          <p className="mt-2 text-2xl font-black text-clay">{metrics.conversionRate}%</p>
          <span className="text-[10px] text-ink/40 mt-1">Không thành công: {metrics.failedCount}</span>
        </div>
      </div>

      {/* Filters, Search & Sort Bar */}
      <div className="rounded-3xl bg-white p-4 shadow-sm border border-black/5 space-y-3">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink/40" />
            <input
              type="text"
              placeholder="Tìm theo Tên khách, SĐT, Mã Lead, Voucher, Điểm đến hoặc Doanh nghiệp..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-beige/60 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-forest"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-ink/60 shrink-0">Nguồn:</span>
            <select
              value={filterSource}
              onChange={(e) => {
                setFilterSource(e.target.value);
                setCurrentPage(1);
              }}
              className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-ink focus:ring-2 focus:ring-forest"
            >
              <option value="all">Tất cả nguồn</option>
              <option value="WEBSITE">Website trực tiếp</option>
              <option value="FACEBOOK">Facebook Ads</option>
              <option value="TIKTOK">TikTok</option>
              <option value="ZALO">Zalo OA/Chat</option>
              <option value="DIRECT">Vãng lai / Direct</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="size-3.5 text-ink/40" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-2xl border border-black/10 bg-white px-3 py-2 text-xs font-semibold text-ink focus:ring-2 focus:ring-forest"
            >
              <option value="created_desc">Ngày tạo mới nhất</option>
              <option value="created_asc">Ngày tạo cũ nhất</option>
              <option value="expected_asc">Ngày dự kiến đến gần nhất</option>
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs pt-2 border-t border-black/5">
          {[
            { id: "all", label: "Tất cả (" + metrics.total + ")" },
            { id: "active_pipeline", label: "Đang xử lý (" + (metrics.newCount + metrics.contactedCount + metrics.consultingCount) + ")" },
            { id: "new", label: "Mới (" + metrics.newCount + ")" },
            { id: "contacted", label: "Đã liên hệ (" + metrics.contactedCount + ")" },
            { id: "consulting", label: "Đang tư vấn (" + metrics.consultingCount + ")" },
            { id: "converted", label: "Đã chuyển Booking (" + metrics.convertedCount + ")" },
            { id: "unsuccessful", label: "Không thành công (" + metrics.failedCount + ")" }
          ].map((st) => (
            <button
              key={st.id}
              type="button"
              onClick={() => {
                setFilterStatus(st.id);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                filterStatus === st.id
                  ? "bg-forest text-white shadow-sm"
                  : "bg-beige text-ink/70 hover:bg-forest/10"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content: Table or Kanban */}
      {viewMode === "table" ? (
        <div className="overflow-hidden rounded-3xl bg-white shadow-card border border-black/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-forest/5 text-ink/70 font-bold uppercase tracking-wider border-b border-black/5">
                <tr>
                  <th className="p-4">Lead ID / Nguồn</th>
                  <th className="p-4">Khách hàng</th>
                  <th className="p-4">Địa điểm & Doanh nghiệp</th>
                  <th className="p-4">Lịch trình & Khách</th>
                  <th className="p-4">Phụ trách & Follow-up</th>
                  <th className="p-4 text-center">Trạng thái</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {paginatedLeads.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-ink/50">
                      Không tìm thấy Lead nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  paginatedLeads.map((lead) => {
                    const st = statusConfig[lead.status] || {
                      label: lead.status,
                      badgeClass: "bg-gray-100 text-gray-700",
                      borderClass: ""
                    };
                    return (
                      <tr key={lead.leadId} className="hover:bg-beige/30 transition">
                        <td className="p-4">
                          <Link
                            href={`/admin/leads/${lead.leadId}`}
                            className="font-mono font-black text-forest hover:underline text-sm flex items-center gap-1"
                          >
                            {lead.leadId}
                            <ExternalLink className="size-3 text-forest/50" />
                          </Link>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="rounded bg-black/5 px-1.5 py-0.5 text-[10px] font-bold text-ink/70">
                              {lead.source || "WEBSITE"}
                            </span>
                            <span className="font-mono text-[10px] text-clay font-bold">
                              {lead.voucherCode}
                            </span>
                          </div>
                          <p className="text-[10px] text-ink/40 mt-1">
                            Tạo: {new Date(lead.createdAt).toLocaleDateString("vi-VN")}
                          </p>
                        </td>

                        <td className="p-4">
                          <p className="font-extrabold text-ink text-sm">{lead.customerName}</p>
                          <p className="text-ink/70 font-mono mt-0.5">{lead.phone}</p>
                          {lead.email ? <p className="text-[10px] text-ink/40">{lead.email}</p> : null}
                          {lead.budget ? (
                            <span className="inline-block mt-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                              Ngân sách: {lead.budget}
                            </span>
                          ) : null}
                        </td>

                        <td className="p-4">
                          <p className="font-extrabold text-ink">{lead.placeName}</p>
                          <p className="text-[11px] text-ink/60 mt-0.5">
                            {lead.assignedBusinessName || lead.businessName}
                          </p>
                          {lead.serviceOrTour ? (
                            <p className="text-[10px] text-forest font-medium mt-1">
                              Quan tâm: {lead.serviceOrTour}
                            </p>
                          ) : null}
                        </td>

                        <td className="p-4">
                          <p className="font-bold text-ink flex items-center gap-1">
                            <Calendar className="size-3 text-clay" /> {lead.expectedDate}
                          </p>
                          <p className="text-ink/60 mt-0.5">{lead.guests} khách</p>
                          {lead.preferredTime ? (
                            <p className="text-[10px] text-ink/40 mt-0.5">
                              {lead.preferredTime === "buoi-sang"
                                ? "Sáng"
                                : lead.preferredTime === "buoi-trua"
                                ? "Trưa"
                                : lead.preferredTime === "buoi-chieu"
                                ? "Chiều"
                                : lead.preferredTime === "buoi-toi"
                                ? "Tối"
                                : "Cả ngày"}
                            </p>
                          ) : null}
                        </td>

                        <td className="p-4">
                          <p className="font-semibold text-ink">
                            {lead.assignedStaffName ? (
                              <span className="flex items-center gap-1 text-forest">
                                <UserCheck className="size-3" /> {lead.assignedStaffName}
                              </span>
                            ) : (
                              <span className="text-ink/40 italic">Chưa giao NV</span>
                            )}
                          </p>
                          {lead.nextFollowUpAt ? (
                            <p className="text-[10px] text-amber-700 mt-1 font-medium flex items-center gap-1">
                              <Clock className="size-3" /> Hẹn: {lead.nextFollowUpAt}
                            </p>
                          ) : (
                            <p className="text-[10px] text-ink/40 mt-1">
                              LH gần nhất: {lead.lastContactAt ? new Date(lead.lastContactAt).toLocaleDateString("vi-VN") : "Chưa"}
                            </p>
                          )}
                        </td>

                        <td className="p-4 text-center">
                          <span className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold ${st.badgeClass}`}>
                            {st.label}
                          </span>
                          {lead.convertedBookingId ? (
                            <div className="mt-1">
                              <Link
                                href="/admin/orders"
                                className="font-mono text-[10px] font-bold text-emerald-700 hover:underline"
                              >
                                Đơn: {lead.convertedBookingId}
                              </Link>
                            </div>
                          ) : null}
                        </td>

                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <select
                              value={lead.status}
                              disabled={updatingId === lead.leadId || lead.status === "converted"}
                              onChange={(e) => handleQuickStatusChange(lead.leadId, e.target.value as LeadStatus)}
                              className="rounded-xl border border-black/10 bg-white px-2 py-1 text-[11px] font-semibold text-ink focus:ring-1 focus:ring-forest disabled:opacity-50"
                            >
                              <option value="new">Mới</option>
                              <option value="contacted">Đã liên hệ</option>
                              <option value="consulting">Đang tư vấn</option>
                              <option value="converted">Đã chốt (Booking)</option>
                              <option value="unsuccessful">Không thành công</option>
                              <option value="voucher_used">Đã dùng voucher</option>
                            </select>

                            <Link
                              href={`/admin/leads/${lead.leadId}`}
                              className="rounded-xl bg-forest/10 p-1.5 text-forest hover:bg-forest/20 transition"
                              title="Xem chi tiết & Timeline"
                            >
                              <Eye className="size-4" />
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

          {/* Pagination */}
          {totalPages > 1 ? (
            <div className="flex items-center justify-between border-t border-black/5 p-4 text-xs">
              <span className="text-ink/60">
                Hiển thị {(currentPage - 1) * pageSize + 1} -{" "}
                {Math.min(currentPage * pageSize, filteredAndSorted.length)} trong số{" "}
                {filteredAndSorted.length} Leads
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="rounded-xl border border-black/10 p-2 hover:bg-beige disabled:opacity-40"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <span className="font-bold text-ink">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="rounded-xl border border-black/10 p-2 hover:bg-beige disabled:opacity-40"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        /* Kanban Pipeline View */
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-6">
          {[
            { key: "new", title: "MỚI", leads: leads.filter((l) => l.status === "new"), border: "border-t-blue-500" },
            { key: "contacted", title: "ĐÃ LIÊN HỆ", leads: leads.filter((l) => l.status === "contacted"), border: "border-t-indigo-500" },
            { key: "consulting", title: "ĐANG TƯ VẤN", leads: leads.filter((l) => l.status === "consulting"), border: "border-t-amber-500" },
            { key: "converted", title: "ĐÃ CHUYỂN BOOKING", leads: leads.filter((l) => l.status === "converted" || l.status === "voucher_used"), border: "border-t-emerald-500" },
            { key: "unsuccessful", title: "KHÔNG THÀNH CÔNG", leads: leads.filter((l) => l.status === "unsuccessful" || l.status === "cancelled" || l.status === "expired"), border: "border-t-red-500" }
          ].map((col) => (
            <div
              key={col.key}
              className={`rounded-3xl bg-beige/40 p-3.5 border-t-4 shadow-sm border border-black/5 ${col.border} flex flex-col min-w-[260px]`}
            >
              <div className="flex items-center justify-between pb-3 border-b border-black/5">
                <h3 className="font-extrabold text-xs text-ink">{col.title}</h3>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-black text-ink shadow-sm">
                  {col.leads.length}
                </span>
              </div>

              <div className="mt-3 space-y-3 flex-1 overflow-y-auto max-h-[680px] pr-1">
                {col.leads.length === 0 ? (
                  <p className="text-center text-[11px] text-ink/40 py-8">Trống</p>
                ) : (
                  col.leads.map((l) => (
                    <article
                      key={l.leadId}
                      className="rounded-2xl bg-white p-3.5 shadow-sm border border-black/5 hover:shadow-md transition space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/admin/leads/${l.leadId}`}
                          className="font-mono text-xs font-black text-forest hover:underline"
                        >
                          {l.leadId}
                        </Link>
                        <span className="text-[10px] text-ink/40">
                          {new Date(l.createdAt).toLocaleDateString("vi-VN")}
                        </span>
                      </div>

                      <div>
                        <p className="font-bold text-ink text-sm">{l.customerName}</p>
                        <p className="text-xs text-ink/60 font-mono">{l.phone}</p>
                      </div>

                      <div className="rounded-xl bg-beige/60 p-2 text-[11px] text-ink/75">
                        <p className="font-bold text-forest">{l.placeName}</p>
                        <p className="text-ink/60 mt-0.5">
                          {l.expectedDate} • {l.guests} khách
                        </p>
                        {l.assignedStaffName ? (
                          <p className="text-[10px] text-forest font-semibold mt-1">
                            NV: {l.assignedStaffName}
                          </p>
                        ) : null}
                      </div>

                      <div className="pt-2 border-t border-black/5 flex items-center justify-between text-[11px]">
                        <span className="font-mono text-clay font-semibold">{l.voucherCode}</span>
                        <Link
                          href={`/admin/leads/${l.leadId}`}
                          className="font-bold text-forest hover:underline flex items-center gap-1 text-[11px]"
                        >
                          Chi tiết →
                        </Link>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
