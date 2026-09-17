"use client";

import { useEffect, useState, useMemo } from "react";
import {
  fetchCommissionMetricsAction,
  fetchAllCommissionsAction,
  fetchAllReconciliationBatchesAction,
  updateCommissionRateAction,
  disputeCommissionAction,
  resolveCommissionDisputeAction,
  createReconciliationBatchAction,
  confirmReconciliationBatchAction,
  payoutReconciliationBatchAction,
  type CommissionRecord,
  type CommissionStatus,
  type ReconciliationBatchRecord
} from "@/app/actions/commission";
import { fetchBusinessesAction } from "@/app/actions/business";
import { getPlacesAction } from "@/app/actions/upload";
import { AiReportModal } from "@/components/admin/ai-report-modal";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  ExternalLink,
  Eye,
  Filter,
  Layers,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Tag,
  TrendingUp,
  X
} from "lucide-react";

export default function AdminReconciliationPage() {
  // Tabs: 'commissions' (Bảng kê hoa hồng theo Booking), 'batches' (Các đợt đối soát RECON)
  const [activeTab, setActiveTab] = useState<"commissions" | "batches">("commissions");

  // Data states
  const [metrics, setMetrics] = useState<{
    totalGMV: number;
    pendingExpectedCommission: number;
    recognizedCommission: number;
    reconciledCommission: number;
    paidCommission: number;
    pendingCollectCommission: number;
    disputedCount: number;
    totalCommissionsCount: number;
    totalBatchesCount: number;
  } | null>(null);

  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [batches, setBatches] = useState<ReconciliationBatchRecord[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter states
  const [selectedBusiness, setSelectedBusiness] = useState("all");
  const [selectedPlace, setSelectedPlace] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Modals
  const [showCreateBatchModal, setShowCreateBatchModal] = useState(false);
  const [batchBusinessId, setBatchBusinessId] = useState("");
  const [batchPeriod, setBatchPeriod] = useState("");
  const [selectedBookingIdsForBatch, setSelectedBookingIdsForBatch] = useState<string[]>([]);
  const [batchNotes, setBatchNotes] = useState("");
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

  // Rate Adjustment Modal (Audit log required)
  const [rateAdjustTarget, setRateAdjustTarget] = useState<CommissionRecord | null>(null);
  const [newRateInput, setNewRateInput] = useState<number>(10);
  const [rateAdjustReason, setRateAdjustReason] = useState("");
  const [isSavingRate, setIsSavingRate] = useState(false);

  // Dispute Modal
  const [disputeTarget, setDisputeTarget] = useState<CommissionRecord | null>(null);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeNote, setDisputeNote] = useState("");
  const [disputeEvidence, setDisputeEvidence] = useState("");
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);

  // Payout Proof Modal
  const [payoutTargetBatch, setPayoutTargetBatch] = useState<ReconciliationBatchRecord | null>(null);
  const [payoutProofUrl, setPayoutProofUrl] = useState("");
  const [payoutNotes, setPayoutNotes] = useState("");
  const [isSubmittingPayout, setIsSubmittingPayout] = useState(false);

  // Notification Toast
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  function showToast(type: "success" | "error" | "info", text: string) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  }

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setIsLoading(true);
    try {
      const [mRes, cRes, bRes, bizRes, pRes] = await Promise.all([
        fetchCommissionMetricsAction(),
        fetchAllCommissionsAction(),
        fetchAllReconciliationBatchesAction(),
        fetchBusinessesAction(),
        getPlacesAction()
      ]);

      if (mRes && (mRes as any).success && (mRes as any).metrics) setMetrics((mRes as any).metrics);
      if (Array.isArray(cRes)) {
        setCommissions(cRes);
      } else if (cRes && (cRes as any).items) {
        setCommissions((cRes as any).items);
      }
      if (Array.isArray(bRes)) {
        setBatches(bRes);
      } else if (bRes && (bRes as any).batches) {
        setBatches((bRes as any).batches);
      }
      if (bizRes) setBusinesses(bizRes);
      if (pRes) setPlaces(pRes);
    } finally {
      setIsLoading(false);
    }
  }

  // Filter commissions
  const filteredCommissions = useMemo(() => {
    return commissions.filter((c) => {
      const matchBiz = selectedBusiness === "all" || c.businessId === selectedBusiness || c.businessName === selectedBusiness;
      const matchPlace = selectedPlace === "all" || c.placeId === selectedPlace || c.placeName === selectedPlace;
      const matchStatus = selectedStatus === "all" || c.status === selectedStatus;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === "" ||
        c.id.toLowerCase().includes(q) ||
        c.bookingId.toLowerCase().includes(q) ||
        c.businessName.toLowerCase().includes(q) ||
        c.placeName.toLowerCase().includes(q) ||
        c.serviceTitle.toLowerCase().includes(q);

      let matchDate = true;
      if (dateFrom) {
        matchDate = matchDate && new Date(c.createdAt).getTime() >= new Date(dateFrom).getTime();
      }
      if (dateTo) {
        matchDate = matchDate && new Date(c.createdAt).getTime() <= new Date(dateTo).getTime() + 86400000;
      }

      return matchBiz && matchPlace && matchStatus && matchSearch && matchDate;
    });
  }, [commissions, selectedBusiness, selectedPlace, selectedStatus, searchQuery, dateFrom, dateTo]);

  // Handle Rate Change with Audit Log
  async function handleConfirmRateChange(e: React.FormEvent) {
    e.preventDefault();
    if (!rateAdjustTarget) return;

    if (!rateAdjustReason.trim()) {
      showToast("error", "Bắt buộc nhập lý do điều chỉnh để lưu vết kiểm toán (Audit Log).");
      return;
    }

    setIsSavingRate(true);
    try {
      const res = await updateCommissionRateAction(rateAdjustTarget.id, newRateInput, rateAdjustReason);
      if (res.success && res.commission) {
        showToast("success", `Đã cập nhật hoa hồng đơn ${res.commission.bookingId} thành ${newRateInput}% (Đã ghi nhận Audit Log)`);
        setRateAdjustTarget(null);
        setRateAdjustReason("");
        await loadAllData();
      } else {
        showToast("error", res.error || "Không thể cập nhật tỷ lệ hoa hồng.");
      }
    } finally {
      setIsSavingRate(false);
    }
  }

  // Handle Dispute
  async function handleConfirmDispute(e: React.FormEvent) {
    e.preventDefault();
    if (!disputeTarget) return;

    if (!disputeReason.trim()) {
      showToast("error", "Vui lòng nhập lý do khiếu nại đối soát.");
      return;
    }

    setIsSubmittingDispute(true);
    try {
      const res = await disputeCommissionAction(disputeTarget.id, {
        reason: disputeReason,
        note: disputeNote,
        evidence: disputeEvidence
      });
      if (res.success) {
        showToast("info", `Đã gắn nhãn KHIẾU NẠI (DISPUTED) cho đơn ${disputeTarget.bookingId}.`);
        setDisputeTarget(null);
        setDisputeReason("");
        setDisputeNote("");
        setDisputeEvidence("");
        await loadAllData();
      } else {
        showToast("error", res.error || "Lỗi khi gửi khiếu nại.");
      }
    } finally {
      setIsSubmittingDispute(false);
    }
  }

  // Handle Create Batch
  async function handleCreateBatchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!batchBusinessId) {
      showToast("error", "Vui lòng chọn cơ sở doanh nghiệp đối tác.");
      return;
    }
    if (selectedBookingIdsForBatch.length === 0) {
      showToast("error", "Vui lòng tích chọn ít nhất 1 booking để lập đợt đối soát.");
      return;
    }

    setIsSubmittingBatch(true);
    try {
      const res = await createReconciliationBatchAction({
        businessId: batchBusinessId,
        period: batchPeriod || `Kỳ đối soát Tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
        bookingIds: selectedBookingIdsForBatch,
        notes: batchNotes
      });

      if (res.success && res.batch) {
        showToast("success", `Đã tạo đợt đối soát ${res.batch.id} thành công với ${res.batch.totalBookings} đơn!`);
        setShowCreateBatchModal(false);
        setSelectedBookingIdsForBatch([]);
        setBatchNotes("");
        setActiveTab("batches");
        await loadAllData();
      } else {
        showToast("error", res.error || "Không thể tạo đợt đối soát.");
      }
    } finally {
      setIsSubmittingBatch(false);
    }
  }

  // Handle Confirm Batch
  async function handleConfirmBatch(batchId: string) {
    if (!confirm(`Xác nhận hoàn tất đối soát đợt ${batchId}? Toàn bộ hoa hồng trong đợt này sẽ chuyển sang trạng thái ĐÃ ĐỐI SOÁT (RECONCILED).`)) {
      return;
    }

    try {
      const res = await confirmReconciliationBatchAction(batchId);
      if (res.success) {
        showToast("success", `Đã xác nhận đối soát đợt ${batchId} thành công!`);
        await loadAllData();
      } else {
        showToast("error", res.error || "Lỗi khi xác nhận đối soát.");
      }
    } catch {
      showToast("error", "Lỗi kết nối.");
    }
  }

  // Handle Payout Batch
  async function handlePayoutBatchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!payoutTargetBatch) return;

    setIsSubmittingPayout(true);
    try {
      const res = await payoutReconciliationBatchAction(payoutTargetBatch.id, {
        payoutProof: payoutProofUrl,
        notes: payoutNotes
      });

      if (res.success) {
        showToast("success", `Đã quyết toán chi trả thành công đợt đối soát ${payoutTargetBatch.id}!`);
        setPayoutTargetBatch(null);
        setPayoutProofUrl("");
        setPayoutNotes("");
        await loadAllData();
      } else {
        showToast("error", res.error || "Lỗi chi trả quyết toán.");
      }
    } finally {
      setIsSubmittingPayout(false);
    }
  }

  // Candidates for Batch creation (bookings in selected business that are completed and not cancelled)
  const candidateCommissions = useMemo(() => {
    if (!batchBusinessId) return [];
    return commissions.filter(
      (c) =>
        c.businessId === batchBusinessId &&
        c.status !== "CANCELLED" &&
        c.status !== "PAID" &&
        c.status !== "RECONCILED" &&
        !c.reconciliationBatchId
    );
  }, [commissions, batchBusinessId]);

  // Status mapping
  const statusConfig: Record<CommissionStatus, { label: string; badge: string }> = {
    PENDING: { label: "Chờ ghi nhận (Pending)", badge: "bg-stone-100 text-stone-700" },
    CALCULATED: { label: "Đã ghi nhận (Calculated)", badge: "bg-blue-100 text-blue-800 font-bold" },
    READY_FOR_RECONCILIATION: { label: "Sẵn sàng đối soát", badge: "bg-indigo-100 text-indigo-800" },
    RECONCILED: { label: "Đã đối soát (Reconciled)", badge: "bg-purple-100 text-purple-800 font-bold" },
    PAID: { label: "Đã thanh toán (Paid)", badge: "bg-emerald-100 text-emerald-800 font-bold" },
    DISPUTED: { label: "Đang khiếu nại (Disputed)", badge: "bg-rose-100 text-rose-800 font-bold animate-pulse" },
    CANCELLED: { label: "Đã hủy (Cancelled)", badge: "bg-red-100 text-red-700" }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 animate-in fade-in slide-in-from-top-4">
          <div
            className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-xs font-bold shadow-xl border ${
              toast.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : toast.type === "error"
                ? "bg-red-50 text-red-800 border-red-200"
                : "bg-blue-50 text-blue-800 border-blue-200"
            }`}
          >
            {toast.type === "success" && <CheckCircle2 className="size-4 text-emerald-600" />}
            {toast.type === "error" && <AlertTriangle className="size-4 text-red-600" />}
            {toast.type === "info" && <AlertCircle className="size-4 text-blue-600" />}
            <span>{toast.text}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-ink">
            Trung Tâm Đối Soát & Quyết Toán Hoa Hồng
          </h1>
          <p className="text-xs text-ink/60 mt-1">
            Theo dõi vòng đời hoa hồng: Booking → Completed → Calculation → Reconciliation Batch (RECON) → Payout
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* AI Analytics Button */}
          <AiReportModal buttonText="✨ Phân tích AI & Báo cáo HTML" />

          {/* Export Excel / CSV button (Yêu cầu 10) */}
          <a
            href={`/api/reconciliation/export?businessId=${selectedBusiness}&placeId=${selectedPlace}&status=${selectedStatus}`}
            download
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border border-black/10 text-xs font-bold text-ink hover:bg-beige transition shadow-sm"
            title="Xuất file Excel / CSV đầy đủ thông tin đối soát"
          >
            <Download className="size-4 text-forest" />
            <span>Xuất Excel / CSV</span>
          </a>

          {/* Button Lập đợt đối soát */}
          <button
            type="button"
            onClick={() => {
              setShowCreateBatchModal(true);
              setBatchBusinessId(businesses[0]?.id || "");
              setBatchPeriod(`Kỳ đối soát Tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`);
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-forest text-xs font-extrabold text-white hover:bg-forest/90 transition shadow-sm"
          >
            <Plus className="size-4" />
            Lập đợt đối soát mới
          </button>
        </div>
      </div>

      {/* 5. ADMIN DASHBOARD KPI METRICS CARDS */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {/* GMV */}
        <div className="rounded-3xl bg-white p-4 shadow-card border border-black/5 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-ink/50 uppercase tracking-wider">Tổng GMV Toàn Sàn</span>
          <p className="text-lg font-black text-ink mt-1">
            {(metrics?.totalGMV || 0).toLocaleString("vi-VN")} đ
          </p>
          <span className="text-[10px] text-ink/40 mt-1">Giao dịch hợp lệ</span>
        </div>

        {/* Commission Dự kiến */}
        <div className="rounded-3xl bg-white p-4 shadow-card border border-black/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">Hoa hồng dự kiến</span>
            <Clock className="size-3.5 text-amber-500" />
          </div>
          <p className="text-lg font-black text-amber-600 mt-1">
            {(metrics?.pendingExpectedCommission || 0).toLocaleString("vi-VN")} đ
          </p>
          <span className="text-[10px] text-amber-600/70 mt-1">Đơn chưa hoàn thành</span>
        </div>

        {/* Commission Đã ghi nhận */}
        <div className="rounded-3xl bg-white p-4 shadow-card border border-black/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Đã ghi nhận (Completed)</span>
            <TrendingUp className="size-3.5 text-blue-500" />
          </div>
          <p className="text-lg font-black text-blue-700 mt-1">
            {(metrics?.recognizedCommission || 0).toLocaleString("vi-VN")} đ
          </p>
          <span className="text-[10px] text-blue-600/70 mt-1">Đủ điều kiện đối soát</span>
        </div>

        {/* Commission Đã đối soát */}
        <div className="rounded-3xl bg-white p-4 shadow-card border border-black/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">Đã đối soát</span>
            <ShieldCheck className="size-3.5 text-purple-500" />
          </div>
          <p className="text-lg font-black text-purple-700 mt-1">
            {(metrics?.reconciledCommission || 0).toLocaleString("vi-VN")} đ
          </p>
          <span className="text-[10px] text-purple-600/70 mt-1">Xác nhận đợt RECON</span>
        </div>

        {/* Commission Đã thanh toán */}
        <div className="rounded-3xl bg-white p-4 shadow-card border border-black/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Đã thanh toán</span>
            <CheckCircle2 className="size-3.5 text-emerald-500" />
          </div>
          <p className="text-lg font-black text-emerald-700 mt-1">
            {(metrics?.paidCommission || 0).toLocaleString("vi-VN")} đ
          </p>
          <span className="text-[10px] text-emerald-600/70 mt-1">Đã có chứng từ ủy nhiệm</span>
        </div>

        {/* Commission Còn phải thu */}
        <div className="rounded-3xl bg-white p-4 shadow-card border border-black/5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">Còn phải thu / Chờ trả</span>
            <DollarSign className="size-3.5 text-rose-500" />
          </div>
          <p className="text-lg font-black text-rose-700 mt-1">
            {(metrics?.pendingCollectCommission || 0).toLocaleString("vi-VN")} đ
          </p>
          <span className="text-[10px] text-rose-600/70 mt-1">
            {metrics?.disputedCount ? `${metrics.disputedCount} khiếu nại` : "Cần quyết toán"}
          </span>
        </div>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-black/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("commissions")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === "commissions"
              ? "bg-forest text-white shadow-sm"
              : "text-ink/70 hover:bg-beige hover:text-ink"
          }`}
        >
          <DollarSign className="size-4" />
          Danh mục Hoa hồng theo Booking ({commissions.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("batches")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition ${
            activeTab === "batches"
              ? "bg-forest text-white shadow-sm"
              : "text-ink/70 hover:bg-beige hover:text-ink"
          }`}
        >
          <Layers className="size-4" />
          Đợt Đối Soát & Quyết Toán RECON ({batches.length})
        </button>
      </div>

      {/* =========================================================
          TAB 1: DANH MỤC HOA HỒNG CHI TIẾT
         ========================================================= */}
      {activeTab === "commissions" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="rounded-3xl bg-white p-4 shadow-card border border-black/5 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Search */}
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-ink/40" />
              <input
                type="text"
                placeholder="Tìm mã Booking, tên khách, cơ sở..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-beige/60 text-xs focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>

            {/* Business filter */}
            <select
              value={selectedBusiness}
              onChange={(e) => setSelectedBusiness(e.target.value)}
              className="px-3 py-2 rounded-xl bg-beige/60 font-bold text-ink focus:outline-none"
            >
              <option value="all">Tất cả Doanh nghiệp / Cơ sở</option>
              {businesses.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>

            {/* Place filter */}
            <select
              value={selectedPlace}
              onChange={(e) => setSelectedPlace(e.target.value)}
              className="px-3 py-2 rounded-xl bg-beige/60 font-bold text-ink focus:outline-none"
            >
              <option value="all">Tất cả Địa điểm</option>
              {places.map((p) => (
                <option key={p.id} value={p.slug || p.id}>
                  {p.name}
                </option>
              ))}
            </select>

            {/* Status filter */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-xl bg-beige/60 font-bold text-ink focus:outline-none"
            >
              <option value="all">Tất cả Trạng thái Hoa hồng</option>
              <option value="PENDING">Chờ ghi nhận (Pending)</option>
              <option value="CALCULATED">Đã ghi nhận (Calculated)</option>
              <option value="READY_FOR_RECONCILIATION">Sẵn sàng đối soát</option>
              <option value="RECONCILED">Đã đối soát (Reconciled)</option>
              <option value="PAID">Đã thanh toán (Paid)</option>
              <option value="DISPUTED">Đang khiếu nại (Disputed)</option>
              <option value="CANCELLED">Đã hủy (Cancelled)</option>
            </select>

            {/* Refresh */}
            <button
              type="button"
              onClick={loadAllData}
              className="p-2 rounded-xl border border-black/10 hover:bg-beige text-ink/60"
              title="Tải lại dữ liệu"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>

          {/* Table */}
          <div className="rounded-3xl bg-white shadow-card border border-black/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black/5 bg-beige/40 text-[11px] font-extrabold uppercase tracking-wider text-ink/50">
                    <th className="p-4">Mã Booking</th>
                    <th className="p-4">Doanh Nghiệp & Địa Điểm</th>
                    <th className="p-4 text-right">GMV Đơn</th>
                    <th className="p-4 text-center">Tỷ Lệ (%)</th>
                    <th className="p-4 text-right">Hoa Hồng</th>
                    <th className="p-4 text-center">Trạng Thái</th>
                    <th className="p-4 text-center">Kỳ Đối Soát</th>
                    <th className="p-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {isLoading ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-ink/40">
                        <Loader2 className="size-6 animate-spin mx-auto text-forest mb-2" />
                        Đang đồng bộ và tính toán dữ liệu hoa hồng...
                      </td>
                    </tr>
                  ) : filteredCommissions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-ink/40">
                        Không tìm thấy bản ghi hoa hồng nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredCommissions.map((c) => {
                      const st = statusConfig[c.status] || { label: c.status, badge: "bg-gray-100 text-gray-800" };
                      return (
                        <tr key={c.id} className="hover:bg-beige/20 transition">
                          <td className="p-4 font-mono font-bold text-ink">
                            <div>{c.bookingId}</div>
                            <span className="text-[10px] text-ink/40 font-normal">{c.createdAt.split("T")[0]}</span>
                          </td>

                          <td className="p-4">
                            <p className="font-bold text-ink">{c.businessName}</p>
                            <p className="text-[11px] text-ink/60">{c.placeName || c.serviceTitle}</p>
                          </td>

                          <td className="p-4 text-right font-mono font-bold text-ink">
                            {c.commissionBaseAmount.toLocaleString("vi-VN")} đ
                            {c.originalAmount > c.commissionBaseAmount && (
                              <span className="block text-[10px] text-amber-600 font-normal">
                                Đã trừ hoàn tiền
                              </span>
                            )}
                          </td>

                          <td className="p-4 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 font-black font-mono">
                                {c.commissionRate}%
                              </span>
                              <span className="text-[9px] uppercase tracking-wider text-ink/40 mt-0.5">
                                Nguồn: {c.rateSource}
                              </span>
                            </div>
                          </td>

                          <td className="p-4 text-right font-mono font-black text-forest text-sm">
                            {c.commissionAmount.toLocaleString("vi-VN")} đ
                          </td>

                          <td className="p-4 text-center">
                            <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] ${st.badge}`}>
                              {st.label}
                            </span>
                            {c.dispute?.isDisputed && (
                              <span className="block text-[10px] text-red-600 font-bold mt-1">
                                ⚠️ {c.dispute.reason}
                              </span>
                            )}
                          </td>

                          <td className="p-4 text-center font-mono text-[11px] text-ink/70">
                            {c.reconciliationBatchId ? (
                              <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-bold">
                                {c.reconciliationBatchId}
                              </span>
                            ) : (
                              <span className="text-ink/30 italic">Chưa đối soát</span>
                            )}
                          </td>

                          <td className="p-4 text-right space-x-1">
                            {/* Nút Điều chỉnh Tỷ lệ kèm Audit Log */}
                            <button
                              type="button"
                              onClick={() => {
                                setRateAdjustTarget(c);
                                setNewRateInput(c.commissionRate);
                                setRateAdjustReason("");
                              }}
                              className="px-2.5 py-1 rounded-lg border border-black/10 text-[11px] font-bold text-ink hover:bg-beige transition"
                              title="Điều chỉnh tỷ lệ hoa hồng (Sẽ lưu Audit Log)"
                            >
                              Sửa %
                            </button>

                            {/* Nút Khiếu nại Dispute */}
                            {c.status !== "CANCELLED" && !c.dispute?.isDisputed && (
                              <button
                                type="button"
                                onClick={() => {
                                  setDisputeTarget(c);
                                  setDisputeReason("");
                                  setDisputeNote("");
                                  setDisputeEvidence("");
                                }}
                                className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-[11px] font-bold hover:bg-rose-100 transition"
                                title="Ghi nhận khiếu nại hoa hồng"
                              >
                                Khiếu nại
                              </button>
                            )}

                            {/* Nút Xử lý khiếu nại nếu đang DISPUTED */}
                            {c.status === "DISPUTED" && (
                              <button
                                type="button"
                                onClick={async () => {
                                  const note = prompt("Nhập kết luận giải quyết khiếu nại:");
                                  if (!note) return;
                                  await resolveCommissionDisputeAction(c.id, {
                                    resolution: "accept_original",
                                    resolutionNote: note
                                  });
                                  showToast("success", "Đã giải quyết xong khiếu nại.");
                                  await loadAllData();
                                }}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] font-bold hover:bg-emerald-700 transition"
                              >
                                Duyệt giải quyết
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          TAB 2: QUẢN LÝ CÁC ĐỢT ĐỐI SOÁT RECON (BATCHES)
         ========================================================= */}
      {activeTab === "batches" && (
        <div className="space-y-4">
          <div className="rounded-3xl bg-white shadow-card border border-black/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-black/5 bg-beige/40 text-[11px] font-extrabold uppercase tracking-wider text-ink/50">
                    <th className="p-4">Mã Đợt Đối Soát</th>
                    <th className="p-4">Cơ Sở / Doanh Nghiệp</th>
                    <th className="p-4">Kỳ Đối Soát</th>
                    <th className="p-4 text-center">Số Lượng Đơn</th>
                    <th className="p-4 text-right">Tổng GMV</th>
                    <th className="p-4 text-right">Hoa Hồng Sàn Thu</th>
                    <th className="p-4 text-right">Thực Nhận (Cơ sở)</th>
                    <th className="p-4 text-center">Trạng Thái</th>
                    <th className="p-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {batches.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-8 text-center text-ink/40">
                        Chưa có đợt đối soát nào được tạo. Hãy nhấn "Lập đợt đối soát mới" ở góc trên bên phải.
                      </td>
                    </tr>
                  ) : (
                    batches.map((b) => (
                      <tr key={b.id} className="hover:bg-beige/20 transition">
                        <td className="p-4 font-mono font-black text-purple-700">
                          {b.batchCode}
                          <span className="block text-[10px] text-ink/40 font-normal">{b.createdAt.split("T")[0]}</span>
                        </td>

                        <td className="p-4 font-bold text-ink">{b.businessName}</td>

                        <td className="p-4 text-ink/80">{b.period}</td>

                        <td className="p-4 text-center font-bold font-mono">
                          <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800">
                            {b.totalBookings} đơn
                          </span>
                        </td>

                        <td className="p-4 text-right font-mono font-bold text-ink">
                          {b.totalGMV.toLocaleString("vi-VN")} đ
                        </td>

                        <td className="p-4 text-right font-mono font-black text-forest">
                          {b.totalCommission.toLocaleString("vi-VN")} đ
                        </td>

                        <td className="p-4 text-right font-mono font-black text-ink text-sm">
                          {b.netPayoutToBusiness.toLocaleString("vi-VN")} đ
                        </td>

                        <td className="p-4 text-center">
                          {b.status === "READY_FOR_REVIEW" && (
                            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                              Chờ duyệt đối soát
                            </span>
                          )}
                          {b.status === "CONFIRMED" && (
                            <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 text-[10px] font-bold">
                              Đã xác nhận đối soát
                            </span>
                          )}
                          {b.status === "PAID" && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Đã tất toán (Paid)
                            </span>
                          )}
                        </td>

                        <td className="p-4 text-right space-x-1.5">
                          {/* Nút Xác nhận đối soát (CONFIRMED) */}
                          {b.status === "READY_FOR_REVIEW" && (
                            <button
                              type="button"
                              onClick={() => handleConfirmBatch(b.id)}
                              className="px-3 py-1.5 rounded-xl bg-forest text-white text-[11px] font-bold hover:bg-forest/90 transition shadow-sm"
                            >
                              Xác nhận đối soát
                            </button>
                          )}

                          {/* Nút Chi trả & Ghi nhận chứng từ (PAID) */}
                          {b.status === "CONFIRMED" && (
                            <button
                              type="button"
                              onClick={() => {
                                setPayoutTargetBatch(b);
                                setPayoutProofUrl(b.payoutProof || "");
                                setPayoutNotes("");
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-700 text-white text-[11px] font-bold hover:bg-emerald-800 transition shadow-sm"
                            >
                              Quyết toán / Chi trả
                            </button>
                          )}

                          {b.status === "PAID" && b.payoutProof && (
                            <a
                              href={b.payoutProof}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-xl border border-black/10 text-ink/70 text-[11px] font-bold hover:bg-beige transition inline-flex items-center gap-1"
                            >
                              <ExternalLink className="size-3" />
                              Chứng từ
                            </a>
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
      )}

      {/* =========================================================
          MODAL 1: LẬP ĐỢT ĐỐI SOÁT MỚI (RECON-YYYY-MM-XXX)
         ========================================================= */}
      {showCreateBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-black/10 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div>
                <h3 className="font-extrabold text-base text-ink">
                  Lập Đợt Đối Soát Doanh Số & Hoa Hồng
                </h3>
                <p className="text-xs text-ink/50 mt-0.5">
                  Hệ thống sẽ sinh mã định danh chuẩn <strong>RECON-YYYY-MM-XXX</strong> và tính toán tổng GMV
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateBatchModal(false)}
                className="p-1.5 rounded-xl text-ink/40 hover:text-ink"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatchSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink">Doanh nghiệp / Cơ sở:</label>
                  <select
                    value={batchBusinessId}
                    onChange={(e) => {
                      setBatchBusinessId(e.target.value);
                      setSelectedBookingIdsForBatch([]);
                    }}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                  >
                    <option value="">-- Chọn doanh nghiệp --</option>
                    {businesses.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink">Tên kỳ đối soát:</label>
                  <input
                    type="text"
                    required
                    value={batchPeriod}
                    onChange={(e) => setBatchPeriod(e.target.value)}
                    placeholder="Kỳ đối soát Tháng 09/2026..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>
              </div>

              {/* Candidate Bookings Checkbox List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-ink">
                    Chọn các Booking cần đối soát ({candidateCommissions.length} đơn sẵn sàng):
                  </label>
                  {candidateCommissions.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedBookingIdsForBatch.length === candidateCommissions.length) {
                          setSelectedBookingIdsForBatch([]);
                        } else {
                          setSelectedBookingIdsForBatch(candidateCommissions.map((c) => c.bookingId));
                        }
                      }}
                      className="text-[11px] font-bold text-forest hover:underline"
                    >
                      {selectedBookingIdsForBatch.length === candidateCommissions.length
                        ? "Bỏ chọn tất cả"
                        : "Chọn tất cả"}
                    </button>
                  )}
                </div>

                <div className="rounded-2xl border border-black/10 p-3 max-h-48 overflow-y-auto space-y-2 bg-beige/20 text-xs">
                  {candidateCommissions.length === 0 ? (
                    <p className="text-ink/40 italic text-center py-4">
                      Không có booking nào chờ đối soát cho cơ sở này. Hãy kiểm tra các đơn đã hoàn thành (COMPLETED).
                    </p>
                  ) : (
                    candidateCommissions.map((c) => (
                      <label
                        key={c.id}
                        className="flex items-center justify-between p-2 rounded-xl bg-white border border-black/5 hover:border-forest/40 transition cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={selectedBookingIdsForBatch.includes(c.bookingId)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedBookingIdsForBatch([...selectedBookingIdsForBatch, c.bookingId]);
                              } else {
                                setSelectedBookingIdsForBatch(
                                  selectedBookingIdsForBatch.filter((id) => id !== c.bookingId)
                                );
                              }
                            }}
                            className="rounded text-forest focus:ring-forest size-4"
                          />
                          <div>
                            <span className="font-mono font-bold text-ink">{c.bookingId}</span>
                            <span className="text-ink/60 block text-[11px]">{c.serviceTitle}</span>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <span className="font-bold text-ink">
                            GMV: {c.commissionBaseAmount.toLocaleString("vi-VN")} đ
                          </span>
                          <span className="block text-[11px] text-forest font-black">
                            Hoa hồng: {c.commissionAmount.toLocaleString("vi-VN")} đ ({c.commissionRate}%)
                          </span>
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Summary Calculation */}
              {selectedBookingIdsForBatch.length > 0 && (
                <div className="p-4 rounded-2xl bg-forest/5 border border-forest/20 grid grid-cols-3 gap-3 text-center text-xs">
                  <div>
                    <span className="text-ink/50 text-[10px] uppercase font-bold">Số lượng</span>
                    <p className="text-base font-black text-ink">{selectedBookingIdsForBatch.length} đơn</p>
                  </div>
                  <div>
                    <span className="text-ink/50 text-[10px] uppercase font-bold">Tổng GMV</span>
                    <p className="text-base font-black text-ink">
                      {candidateCommissions
                        .filter((c) => selectedBookingIdsForBatch.includes(c.bookingId))
                        .reduce((sum, c) => sum + c.commissionBaseAmount, 0)
                        .toLocaleString("vi-VN")}{" "}
                      đ
                    </p>
                  </div>
                  <div>
                    <span className="text-forest text-[10px] uppercase font-bold">Hoa hồng sàn</span>
                    <p className="text-base font-black text-forest">
                      {candidateCommissions
                        .filter((c) => selectedBookingIdsForBatch.includes(c.bookingId))
                        .reduce((sum, c) => sum + c.commissionAmount, 0)
                        .toLocaleString("vi-VN")}{" "}
                      đ
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Ghi chú đối soát:</label>
                <textarea
                  rows={2}
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  placeholder="Ghi chú đợt quyết toán..."
                  className="w-full px-3.5 py-2 rounded-xl bg-beige/60 text-xs focus:outline-none focus:ring-2 focus:ring-forest resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setShowCreateBatchModal(false)}
                  className="px-4 py-2 rounded-xl border border-black/10 text-xs font-semibold text-ink/70 hover:bg-beige"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingBatch || selectedBookingIdsForBatch.length === 0}
                  className="px-5 py-2 rounded-xl bg-forest text-xs font-extrabold text-white hover:bg-forest/90 transition shadow flex items-center gap-1.5"
                >
                  {isSubmittingBatch ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
                  Tạo Đợt Đối Soát (RECON)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 2: ĐIỀU CHỈNH TỶ LỆ HOA HỒNG (KÈM AUDIT LOG BẮT BUỘC)
         ========================================================= */}
      {rateAdjustTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-black/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="font-extrabold text-sm text-ink flex items-center gap-2">
                <ShieldAlert className="size-4 text-amber-600" />
                Điều Chỉnh Tỷ Lệ Hoa Hồng (Có Lưu Vết Kiểm Toán)
              </h3>
              <button
                type="button"
                onClick={() => setRateAdjustTarget(null)}
                className="p-1 rounded-lg text-ink/40 hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmRateChange} className="space-y-4">
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <p>
                  <strong>Mã Booking:</strong> {rateAdjustTarget.bookingId}
                </p>
                <p>
                  <strong>Doanh nghiệp:</strong> {rateAdjustTarget.businessName}
                </p>
                <p>
                  <strong>Tỷ lệ hiện tại:</strong> {rateAdjustTarget.commissionRate}% (Nguồn: {rateAdjustTarget.rateSource})
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Tỷ lệ hoa hồng mới (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.5"
                  required
                  value={newRateInput}
                  onChange={(e) => setNewRateInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                />
                <p className="text-[11px] text-ink/50">
                  Tiền hoa hồng sau điều chỉnh:{" "}
                  <strong>
                    {Math.round((rateAdjustTarget.commissionBaseAmount * newRateInput) / 100).toLocaleString("vi-VN")} đ
                  </strong>
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">
                  Lý do thay đổi <span className="text-red-600">* (Bắt buộc cho Audit Log)</span>:
                </label>
                <textarea
                  rows={3}
                  required
                  value={rateAdjustReason}
                  onChange={(e) => setRateAdjustReason(e.target.value)}
                  placeholder="Ví dụ: Thỏa thuận ưu đãi mùa thấp điểm, voucher hỗ trợ cơ sở theo công văn số..."
                  className="w-full px-3.5 py-2 rounded-xl bg-beige/60 text-xs focus:outline-none focus:ring-2 focus:ring-forest resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRateAdjustTarget(null)}
                  className="px-4 py-2 rounded-xl border border-black/10 text-xs font-semibold text-ink/70 hover:bg-beige"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSavingRate}
                  className="px-5 py-2 rounded-xl bg-amber-600 text-xs font-bold text-white hover:bg-amber-700 transition shadow flex items-center gap-1.5"
                >
                  {isSavingRate ? <Loader2 className="size-3.5 animate-spin" /> : <ShieldCheck className="size-3.5" />}
                  Xác Nhận & Ghi Audit Log
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 3: GHI NHẬN KHIẾU NẠI HOA HỒNG (DISPUTE)
         ========================================================= */}
      {disputeTarget && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-black/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="font-extrabold text-sm text-ink flex items-center gap-2">
                <AlertTriangle className="size-4 text-rose-600" />
                Ghi Nhận Khiếu Nại Hoa Hồng (Dispute)
              </h3>
              <button
                type="button"
                onClick={() => setDisputeTarget(null)}
                className="p-1 rounded-lg text-ink/40 hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmDispute} className="space-y-3">
              <p className="text-xs text-ink/70">
                Đơn <strong>{disputeTarget.bookingId}</strong> ({disputeTarget.businessName}) sẽ được gắn nhãn{" "}
                <span className="font-bold text-rose-600">DISPUTED</span> để chờ Hội đồng kiểm toán giải quyết. Dữ liệu
                cũ sẽ được bảo lưu nguyên vẹn.
              </p>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">
                  Lý do khiếu nại <span className="text-red-600">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  placeholder="Ví dụ: Cơ sở báo khách hủy tại điểm, số tiền thu thực tế thấp hơn..."
                  className="w-full px-3.5 py-2 rounded-xl bg-beige/60 text-xs focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Ghi chú chi tiết:</label>
                <textarea
                  rows={3}
                  value={disputeNote}
                  onChange={(e) => setDisputeNote(e.target.value)}
                  placeholder="Ý kiến của cơ sở hoặc ghi chú của nhân viên điều phối..."
                  className="w-full px-3.5 py-2 rounded-xl bg-beige/60 text-xs focus:outline-none focus:ring-2 focus:ring-forest resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Bằng chứng / Link đính kèm (Evidence):</label>
                <input
                  type="text"
                  value={disputeEvidence}
                  onChange={(e) => setDisputeEvidence(e.target.value)}
                  placeholder="URL ảnh chụp màn hình Zalo, hóa đơn giấy..."
                  className="w-full px-3.5 py-2 rounded-xl bg-beige/60 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDisputeTarget(null)}
                  className="px-4 py-2 rounded-xl border border-black/10 text-xs font-semibold text-ink/70 hover:bg-beige"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingDispute}
                  className="px-5 py-2 rounded-xl bg-rose-600 text-xs font-bold text-white hover:bg-rose-700 transition shadow flex items-center gap-1.5"
                >
                  {isSubmittingDispute ? <Loader2 className="size-3.5 animate-spin" /> : <AlertTriangle className="size-3.5" />}
                  Đánh Dấu Khiếu Nại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL 4: QUYẾT TOÁN & ĐÍNH KÈM CHỨNG TỪ CHI TRẢ (PAYOUT)
         ========================================================= */}
      {payoutTargetBatch && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-black/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="font-extrabold text-sm text-ink flex items-center gap-2">
                <DollarSign className="size-4 text-emerald-600" />
                Quyết Toán Chi Trả Đợt Đối Soát ({payoutTargetBatch.batchCode})
              </h3>
              <button
                type="button"
                onClick={() => setPayoutTargetBatch(null)}
                className="p-1 rounded-lg text-ink/40 hover:text-ink"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={handlePayoutBatchSubmit} className="space-y-3 text-xs">
              <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1 font-mono">
                <p>
                  <strong>Doanh nghiệp thụ hưởng:</strong> {payoutTargetBatch.businessName}
                </p>
                <p>
                  <strong>Tổng tiền đối soát:</strong> {payoutTargetBatch.totalGMV.toLocaleString("vi-VN")} đ
                </p>
                <p>
                  <strong>Hoa hồng sàn thu:</strong> {payoutTargetBatch.totalCommission.toLocaleString("vi-VN")} đ
                </p>
                <p className="text-sm font-black text-emerald-800 pt-1 border-t border-emerald-200">
                  Thực chi cho cơ sở: {payoutTargetBatch.netPayoutToBusiness.toLocaleString("vi-VN")} đ
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Ủy nhiệm chi / Link ảnh chuyển khoản (Payout Proof):</label>
                <input
                  type="text"
                  value={payoutProofUrl}
                  onChange={(e) => setPayoutProofUrl(e.target.value)}
                  placeholder="https://... hoặc /images/uploads/payout-xxx.jpg"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Ghi chú quyết toán:</label>
                <textarea
                  rows={2}
                  value={payoutNotes}
                  onChange={(e) => setPayoutNotes(e.target.value)}
                  placeholder="Chuyển khoản qua Agribank A Lưới, giao dịch viên..."
                  className="w-full px-3.5 py-2 rounded-xl bg-beige/60 text-xs focus:outline-none focus:ring-2 focus:ring-forest resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPayoutTargetBatch(null)}
                  className="px-4 py-2 rounded-xl border border-black/10 text-xs font-semibold text-ink/70 hover:bg-beige"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPayout}
                  className="px-5 py-2 rounded-xl bg-emerald-700 text-xs font-bold text-white hover:bg-emerald-800 transition shadow flex items-center gap-1.5"
                >
                  {isSubmittingPayout ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle2 className="size-3.5" />}
                  Hoàn Tất Quyết Toán (PAID)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
