"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  EyeOff,
  Eye,
  Star,
  MessageSquare,
  Building2,
  MapPin,
  Calendar,
  AlertTriangle,
  Search,
  Filter,
  RefreshCw,
  Clock,
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchAllReviewsAction, updateReviewStatusAction } from "@/app/actions/reviews";
import type { ReviewRecord, ReviewStatus } from "@/lib/server-store";

type TabKey = "pending" | "approved" | "rejected" | "hidden";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("pending");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReview, setSelectedReview] = useState<ReviewRecord | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState("");
  const [actionError, setActionError] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadData = () => {
    setLoading(true);
    fetchAllReviewsAction()
      .then((data) => {
        setReviews(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const counts = {
    pending: reviews.filter((r) => r.status === "pending").length,
    approved: reviews.filter((r) => r.status === "approved").length,
    rejected: reviews.filter((r) => r.status === "rejected").length,
    hidden: reviews.filter((r) => r.status === "hidden").length
  };

  const filteredReviews = reviews.filter((r) => {
    if (r.status !== activeTab) return false;
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      r.id.toLowerCase().includes(q) ||
      r.bookingId?.toLowerCase().includes(q) ||
      r.authorName.toLowerCase().includes(q) ||
      r.placeName.toLowerCase().includes(q) ||
      r.content.toLowerCase().includes(q)
    );
  });

  const handleUpdateStatus = (id: string, newStatus: ReviewStatus, note?: string) => {
    setActionError("");
    startTransition(async () => {
      const res = await updateReviewStatusAction(
        id,
        newStatus,
        { id: "admin-1", name: "Ban Quản Trị", role: "admin" },
        note
      );
      if (res.success && res.review) {
        setReviews((prev) => prev.map((item) => (item.id === id ? res.review! : item)));
        if (selectedReview?.id === id) {
          setSelectedReview(res.review);
        }
      } else {
        setActionError(res.error || "Không thể cập nhật trạng thái");
      }
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-forest/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Star className="size-6 fill-amber-500 text-amber-500" />
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-ink">Kiểm duyệt Đánh giá (Reviews & Ratings)</h1>
          </div>
          <p className="text-xs md:text-sm text-ink/60 mt-1">
            Chỉ những du khách đã thực sự hoàn tất trải nghiệm mới được quyền đánh giá. Admin kiểm duyệt nội dung trước khi công khai.
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
        {[
          { key: "pending", label: "Chờ duyệt", count: counts.pending, color: "bg-amber-50 text-amber-900 border-amber-200" },
          { key: "approved", label: "Đã xuất bản", count: counts.approved, color: "bg-emerald-50 text-emerald-900 border-emerald-200" },
          { key: "rejected", label: "Từ chối", count: counts.rejected, color: "bg-rose-50 text-rose-900 border-rose-200" },
          { key: "hidden", label: "Đã ẩn", count: counts.hidden, color: "bg-slate-100 text-slate-900 border-slate-300" }
        ].map((kpi) => (
          <div
            key={kpi.key}
            onClick={() => setActiveTab(kpi.key as TabKey)}
            className={`p-4 rounded-2xl border cursor-pointer transition shadow-sm hover:shadow-md ${
              activeTab === kpi.key ? "ring-2 ring-forest" : ""
            } ${kpi.color}`}
          >
            <p className="text-xs font-bold uppercase tracking-wider opacity-75">{kpi.label}</p>
            <p className="text-2xl md:text-3xl font-black mt-1">{kpi.count}</p>
          </div>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-forest/10 shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {[
            { key: "pending", label: `Chờ duyệt (${counts.pending})` },
            { key: "approved", label: `Đã duyệt (${counts.approved})` },
            { key: "rejected", label: `Từ chối (${counts.rejected})` },
            { key: "hidden", label: `Đã ẩn (${counts.hidden})` }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TabKey)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                activeTab === tab.key
                  ? "bg-forest text-white shadow-sm"
                  : "bg-forest/5 text-ink/70 hover:bg-forest/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink/40" />
          <input
            type="text"
            placeholder="Tìm theo khách, địa điểm, mã đơn..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-forest/20 focus:outline-none focus:border-forest"
          />
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white rounded-3xl border border-forest/10 shadow-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-ink/50 text-sm">Đang tải danh sách đánh giá...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <MessageSquare className="size-10 text-forest/30 mx-auto" />
            <p className="text-sm font-bold text-ink">Không có đánh giá nào trong mục này</p>
            <p className="text-xs text-ink/50">Khi khách gửi đánh giá mới, nội dung sẽ xuất hiện tại tab Chờ duyệt.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-beige/60 text-ink/60 uppercase font-extrabold border-b border-forest/10">
                <tr>
                  <th className="p-4">Khách hàng & Đơn đặt</th>
                  <th className="p-4">Điểm đến & Cơ sở</th>
                  <th className="p-4">Đánh giá</th>
                  <th className="p-4">Ảnh thực tế</th>
                  <th className="p-4">Ngày gửi</th>
                  <th className="p-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/5">
                {filteredReviews.map((r) => (
                  <tr key={r.id} className="hover:bg-forest/5 transition">
                    <td className="p-4">
                      <div className="font-bold text-ink text-sm flex items-center gap-1.5">
                        {r.authorName}
                        <span title="Đã xác thực Booking hoàn thành"><ShieldCheck className="size-3.5 text-emerald-600" /></span>
                      </div>
                      <div className="text-[11px] text-ink/60 font-mono mt-0.5">
                        Đơn: <span className="font-bold text-forest">{r.bookingId}</span>
                      </div>
                      {r.authorPhone && <div className="text-[11px] text-ink/50">{r.authorPhone}</div>}
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-ink">{r.placeName}</div>
                      <div className="text-[11px] text-ink/60 flex items-center gap-1 mt-0.5">
                        <Building2 className="size-3" /> {r.businessName || "Chạm A Lưới"}
                      </div>
                    </td>

                    <td className="p-4 max-w-xs">
                      <div className="flex items-center gap-1 text-amber-500 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`size-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                          />
                        ))}
                        <span className="font-bold text-ink ml-1">{r.rating}.0</span>
                      </div>
                      <p className="text-ink/80 line-clamp-2 leading-relaxed italic">
                        &ldquo;{r.content}&rdquo;
                      </p>
                      {r.adminNote && (
                        <div className="mt-1 text-[10px] text-rose-700 bg-rose-50 p-1.5 rounded-lg">
                          <strong>Ghi chú Admin:</strong> {r.adminNote}
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      {r.images && r.images.length > 0 ? (
                        <div className="flex items-center gap-1.5">
                          {r.images.slice(0, 3).map((img, idx) => (
                            <div key={idx} className="relative size-9 rounded-lg overflow-hidden border border-black/10">
                              <Image src={img} alt="review" fill className="object-cover" />
                            </div>
                          ))}
                          {r.images.length > 3 && (
                            <span className="text-[10px] font-bold text-ink/60">+{r.images.length - 3}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-ink/40 text-[11px]">Không có ảnh</span>
                      )}
                    </td>

                    <td className="p-4 text-ink/60 whitespace-nowrap">
                      {new Date(r.createdAt).toLocaleDateString("vi-VN")}
                      <div className="text-[10px] text-ink/40 font-mono">
                        {new Date(r.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedReview(r);
                            setAdminNoteInput(r.adminNote || "");
                          }}
                          className="h-8 px-2 text-forest hover:bg-forest/10"
                        >
                          <Eye className="size-3.5 mr-1" /> Chi tiết
                        </Button>

                        {r.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleUpdateStatus(r.id, "approved")}
                              disabled={isPending}
                              className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                            >
                              <CheckCircle2 className="size-3.5 mr-1" /> Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                const reason = prompt("Lý do từ chối đánh giá:", "Nội dung vi phạm quy chuẩn cộng đồng");
                                if (reason !== null) {
                                  handleUpdateStatus(r.id, "rejected", reason);
                                }
                              }}
                              disabled={isPending}
                              className="h-8 px-2.5 border-rose-200 text-rose-700 hover:bg-rose-50 font-bold"
                            >
                              <XCircle className="size-3.5 mr-1" /> Từ chối
                            </Button>
                          </>
                        )}

                        {r.status === "approved" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const reason = prompt("Lý do ẩn đánh giá này khỏi website:", "Tạm ẩn theo yêu cầu");
                              if (reason !== null) {
                                handleUpdateStatus(r.id, "hidden", reason);
                              }
                            }}
                            disabled={isPending}
                            className="h-8 px-2.5 border-slate-300 text-slate-700 hover:bg-slate-100"
                          >
                            <EyeOff className="size-3.5 mr-1" /> Ẩn
                          </Button>
                        )}

                        {(r.status === "hidden" || r.status === "rejected") && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateStatus(r.id, "approved")}
                            disabled={isPending}
                            className="h-8 px-2.5 bg-forest hover:bg-forest/90 text-white font-bold"
                          >
                            <CheckCircle2 className="size-3.5 mr-1" /> Cho phép hiển thị
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

      {/* Review Detail Modal */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-forest/10 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-forest">Mã review: {selectedReview.id}</span>
                <h3 className="text-xl font-extrabold text-ink mt-0.5">{selectedReview.placeName}</h3>
                <p className="text-xs text-ink/60">Cơ sở: {selectedReview.businessName || "Chạm A Lưới"}</p>
              </div>
              <button
                onClick={() => setSelectedReview(null)}
                className="text-ink/40 hover:text-ink text-xl font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Booking & Customer Info */}
            <div className="grid grid-cols-2 gap-3 bg-beige/60 p-4 rounded-2xl text-xs">
              <div>
                <p className="text-ink/50 font-medium">Khách hàng:</p>
                <p className="font-bold text-ink mt-0.5">{selectedReview.authorName}</p>
                <p className="text-[11px] text-ink/60">{selectedReview.authorPhone || "Chưa có SĐT"}</p>
              </div>
              <div>
                <p className="text-ink/50 font-medium">Mã đơn đặt dịch vụ (Booking ID):</p>
                <p className="font-mono font-bold text-forest mt-0.5">{selectedReview.bookingId}</p>
                <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> Đã hoàn thành (COMPLETED)
                </p>
              </div>
            </div>

            {/* Rating & Content */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <div className="flex items-center text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${i < selectedReview.rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="font-black text-sm text-ink">{selectedReview.rating}.0 / 5.0 sao</span>
              </div>
              <div className="p-4 rounded-2xl bg-forest/5 text-ink text-sm leading-relaxed whitespace-pre-wrap border border-forest/10">
                {selectedReview.content}
              </div>
            </div>

            {/* Images */}
            {selectedReview.images && selectedReview.images.length > 0 && (
              <div>
                <p className="text-xs font-bold text-ink/70 mb-2">Ảnh thực tế đính kèm ({selectedReview.images.length}):</p>
                <div className="grid grid-cols-3 gap-3">
                  {selectedReview.images.map((img, idx) => (
                    <a
                      key={idx}
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative aspect-square rounded-xl overflow-hidden border border-forest/10 group cursor-zoom-in"
                    >
                      <Image src={img} alt="review detail" fill className="object-cover group-hover:scale-105 transition" />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white">
                        <ExternalLink className="size-4" />
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Moderation Note */}
            <div className="space-y-1.5 pt-2 border-t border-forest/10">
              <label className="text-xs font-bold text-ink">Ghi chú kiểm duyệt của Ban Quản Trị (Admin Note):</label>
              <textarea
                value={adminNoteInput}
                onChange={(e) => setAdminNoteInput(e.target.value)}
                placeholder="Ghi chú nội bộ hoặc lý do từ chối/ẩn đánh giá này..."
                rows={2}
                className="w-full text-xs p-3 rounded-xl border border-forest/20 focus:outline-none focus:border-forest"
              />
              <p className="text-[11px] text-ink/50 italic">
                * Lưu ý: Ban Quản Trị không được phép sửa nội dung review gốc của khách hàng để đảm bảo tính khách quan.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-forest/10">
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                selectedReview.status === "approved"
                  ? "bg-emerald-100 text-emerald-800"
                  : selectedReview.status === "pending"
                  ? "bg-amber-100 text-amber-800"
                  : selectedReview.status === "rejected"
                  ? "bg-rose-100 text-rose-800"
                  : "bg-slate-100 text-slate-800"
              }`}>
                Trạng thái: {selectedReview.status.toUpperCase()}
              </span>

              <div className="flex items-center gap-2">
                {selectedReview.status !== "approved" && (
                  <Button
                    size="sm"
                    onClick={() => handleUpdateStatus(selectedReview.id, "approved", adminNoteInput)}
                    disabled={isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
                  >
                    <CheckCircle2 className="size-3.5 mr-1" /> Duyệt xuất bản
                  </Button>
                )}

                {selectedReview.status !== "rejected" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedReview.id, "rejected", adminNoteInput || "Vi phạm tiêu chuẩn cộng đồng")}
                    disabled={isPending}
                    className="border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs"
                  >
                    <XCircle className="size-3.5 mr-1" /> Từ chối
                  </Button>
                )}

                {selectedReview.status !== "hidden" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleUpdateStatus(selectedReview.id, "hidden", adminNoteInput || "Đã ẩn theo yêu cầu")}
                    disabled={isPending}
                    className="border-slate-300 text-slate-700 hover:bg-slate-100 text-xs"
                  >
                    <EyeOff className="size-3.5 mr-1" /> Ẩn khỏi web
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
