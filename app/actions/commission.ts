"use server";

import {
  getAllCommissions,
  getCommissionById,
  getCommissionsByBusiness,
  getCommissionDashboardMetrics,
  updateCommissionRateDirect,
  disputeCommission,
  resolveCommissionDispute,
  getAllReconciliationBatches,
  getReconciliationBatchById,
  createReconciliationBatch,
  confirmReconciliationBatch,
  payoutReconciliationBatch,
  type CommissionRecord,
  type CommissionStatus,
  type ReconciliationBatchRecord,
  type ReconciliationBatchStatus
} from "@/lib/server-store";
import { revalidatePath } from "next/cache";
import { getSession, requireRole, sanitizeErrorMessage } from "@/lib/auth/roles";

export type { CommissionRecord, CommissionStatus, ReconciliationBatchRecord, ReconciliationBatchStatus };

// Chỉ SUPER_ADMIN, ADMIN, FINANCE mới có quyền xem chỉ số tài chính hoa hồng
export async function fetchCommissionMetricsAction() {
  try {
    const session = await getSession();
    if (!session || !["SUPER_ADMIN", "ADMIN", "FINANCE"].includes(session.role)) {
      return { success: false, error: "FORBIDDEN: Chỉ bộ phận Tài chính/Quản trị mới có quyền truy cập chỉ số hoa hồng." };
    }

    const metrics = getCommissionDashboardMetrics();
    return { success: true, metrics };
  } catch (err) {
    return { success: false, error: sanitizeErrorMessage(err, "Lỗi tải chỉ số hoa hồng.") };
  }
}

export async function fetchAllCommissionsAction(filters?: {
  businessId?: string;
  placeId?: string;
  status?: string;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
}) {
  try {
    const session = await getSession();

    // Chặn hoàn toàn SUPPORT và CONTENT_MANAGER
    if (session && ["SUPPORT", "CONTENT_MANAGER"].includes(session.role)) {
      return [];
    }

    let items = getAllCommissions();

    // DATA ISOLATION: Nếu là BUSINESS, chỉ cho xem hoa hồng của đúng business đó
    if (session && session.role === "BUSINESS") {
      items = items.filter((c) => c.businessId === session.businessId);
    } else if (filters?.businessId && filters.businessId !== "all") {
      items = items.filter((c) => c.businessId === filters.businessId || c.businessName === filters.businessId);
    }

    if (filters?.placeId && filters.placeId !== "all") {
      items = items.filter((c) => c.placeId === filters.placeId || c.placeName === filters.placeId);
    }
    if (filters?.status && filters.status !== "all") {
      items = items.filter((c) => c.status === filters.status);
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      items = items.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.bookingId.toLowerCase().includes(q) ||
          c.businessName.toLowerCase().includes(q) ||
          c.placeName.toLowerCase().includes(q) ||
          (c.serviceTitle && c.serviceTitle.toLowerCase().includes(q))
      );
    }
    if (filters?.dateFrom) {
      const dFrom = new Date(filters.dateFrom).getTime();
      items = items.filter((c) => new Date(c.createdAt).getTime() >= dFrom);
    }
    if (filters?.dateTo) {
      const dTo = new Date(filters.dateTo).getTime() + 86400000;
      items = items.filter((c) => new Date(c.createdAt).getTime() <= dTo);
    }

    return items;
  } catch (err) {
    console.error("[fetchAllCommissionsAction Error]:", err);
    return [];
  }
}

export async function fetchCommissionByIdAction(id: string) {
  try {
    const session = await getSession();
    if (session && ["SUPPORT", "CONTENT_MANAGER"].includes(session.role)) {
      return null;
    }

    const c = getCommissionById(id);
    if (!c) return null;

    if (session && session.role === "BUSINESS" && c.businessId !== session.businessId) {
      return null;
    }

    return c;
  } catch {
    return null;
  }
}

export async function updateCommissionRateAction(
  commissionIdOrParams: string | { commissionId: string; newRate: number; reason?: string },
  newRateArg?: number,
  reasonArg?: string
) {
  try {
    const session = await requireRole(["SUPER_ADMIN", "ADMIN", "FINANCE"]);

    let commissionId: string;
    let newRate: number;
    let reason: string;

    if (typeof commissionIdOrParams === "string") {
      commissionId = commissionIdOrParams;
      newRate = Number(newRateArg);
      reason = reasonArg || "Điều chỉnh tỷ lệ hoa hồng đối tác";
    } else {
      commissionId = commissionIdOrParams.commissionId;
      newRate = Number(commissionIdOrParams.newRate);
      reason = commissionIdOrParams.reason || "Điều chỉnh tỷ lệ hoa hồng đối tác";
    }

    const actor = {
      id: session.id,
      name: session.name,
      role: session.role
    };

    const res = updateCommissionRateDirect(commissionId, newRate, reason, actor);

    if (!res.success) {
      return { success: false, error: res.error || "Không thể cập nhật tỷ lệ hoa hồng." };
    }

    revalidatePath("/admin/commissions");
    revalidatePath("/admin/reconciliation");
    return { success: true, commission: res.commission, oldRate: (res as any).oldRate, newRate: (res as any).newRate };
  } catch (err) {
    return { success: false, error: sanitizeErrorMessage(err, "Lỗi phân quyền cập nhật tỷ lệ hoa hồng.") };
  }
}

export async function disputeCommissionAction(
  commissionIdOrParams: string | { commissionId: string; reason: string; note?: string; evidence?: string },
  paramsArg?: { reason: string; note?: string; evidence?: string }
) {
  try {
    const session = await requireRole(["SUPER_ADMIN", "ADMIN", "FINANCE", "BUSINESS"]);

    let commissionId: string;
    let reason: string;
    let note: string | undefined;
    let evidence: string | undefined;

    if (typeof commissionIdOrParams === "string") {
      commissionId = commissionIdOrParams;
      reason = paramsArg?.reason || "Khiếu nại hoa hồng";
      note = paramsArg?.note;
      evidence = paramsArg?.evidence;
    } else {
      commissionId = commissionIdOrParams.commissionId;
      reason = commissionIdOrParams.reason || "Khiếu nại hoa hồng";
      note = commissionIdOrParams.note;
      evidence = commissionIdOrParams.evidence;
    }

    const comm = getCommissionById(commissionId);
    if (!comm) {
      return { success: false, error: "Không tìm thấy bản ghi hoa hồng." };
    }

    if (session.role === "BUSINESS" && comm.businessId !== session.businessId) {
      return { success: false, error: "FORBIDDEN: Bạn chỉ có thể khiếu nại đơn của cơ sở mình." };
    }

    const actor = {
      id: session.id,
      name: session.name,
      role: session.role
    };

    const res = disputeCommission(commissionId, {
      reason,
      note,
      evidence,
      actor
    });

    if (!res.success) {
      return { success: false, error: res.error || "Không thể gửi khiếu nại hoa hồng." };
    }

    revalidatePath("/admin/commissions");
    revalidatePath("/admin/reconciliation");
    return { success: true, commission: res.commission };
  } catch (err) {
    return { success: false, error: sanitizeErrorMessage(err, "Lỗi gửi khiếu nại hoa hồng.") };
  }
}

export async function resolveCommissionDisputeAction(
  commissionIdOrParams: string | { commissionId: string; resolution: "ACCEPTED" | "REJECTED"; resolutionNote: string; adjustedAmount?: number },
  optionsArg?: { resolution: "ACCEPTED" | "REJECTED" | "accept_original" | "adjusted" | "cancelled"; resolutionNote: string; adjustedAmount?: number }
) {
  try {
    const session = await requireRole(["SUPER_ADMIN", "ADMIN", "FINANCE"]);

    let commissionId: string;
    let resolution: "accept_original" | "adjusted" | "cancelled";
    let resolutionNote: string;
    let adjustedAmount: number | undefined;

    if (typeof commissionIdOrParams === "string") {
      commissionId = commissionIdOrParams;
      const optRes = optionsArg?.resolution;
      resolution = optRes === "adjusted" ? "adjusted" : optRes === "cancelled" ? "cancelled" : "accept_original";
      resolutionNote = optionsArg?.resolutionNote || "";
      adjustedAmount = optionsArg?.adjustedAmount;
    } else {
      commissionId = commissionIdOrParams.commissionId;
      resolution = commissionIdOrParams.resolution === "ACCEPTED" ? "adjusted" : "accept_original";
      resolutionNote = commissionIdOrParams.resolutionNote;
      adjustedAmount = commissionIdOrParams.adjustedAmount;
    }

    const actor = {
      id: session.id,
      name: session.name,
      role: session.role
    };

    const res = resolveCommissionDispute(commissionId, {
      resolution,
      resolutionNote,
      adjustedAmount,
      actor
    });

    if (!res.success) {
      return { success: false, error: res.error || "Không thể giải quyết khiếu nại hoa hồng." };
    }

    revalidatePath("/admin/commissions");
    revalidatePath("/admin/reconciliation");
    return { success: true, commission: res.commission };
  } catch (err) {
    return { success: false, error: sanitizeErrorMessage(err, "Lỗi giải quyết khiếu nại.") };
  }
}

export async function fetchAllReconciliationBatchesAction() {
  try {
    const session = await getSession();
    if (session && ["SUPPORT", "CONTENT_MANAGER"].includes(session.role)) {
      return [];
    }

    const all = getAllReconciliationBatches();
    if (session && session.role === "BUSINESS") {
      return all.filter((b) => b.businessId === session.businessId);
    }
    return all;
  } catch {
    return [];
  }
}

export async function createReconciliationBatchAction(params: {
  businessId: string;
  commissionIds?: string[];
  bookingIds?: string[];
  period?: string;
  notes?: string;
}) {
  try {
    const session = await requireRole(["SUPER_ADMIN", "ADMIN", "FINANCE"]);

    const actor = {
      id: session.id,
      name: session.name,
      role: session.role
    };

    const targetBookingIds = params.bookingIds || params.commissionIds || [];
    const res = createReconciliationBatch({
      businessId: params.businessId,
      bookingIds: targetBookingIds,
      period: params.period || `Kỳ đối soát Tháng ${new Date().getMonth() + 1}/${new Date().getFullYear()}`,
      notes: params.notes,
      actor
    });

    if (!res.success) {
      return { success: false, error: res.error || "Không thể tạo đợt đối soát." };
    }

    revalidatePath("/admin/reconciliation");
    revalidatePath("/admin/commissions");
    return { success: true, batch: res.batch };
  } catch (err) {
    return { success: false, error: sanitizeErrorMessage(err, "Lỗi tạo đợt đối soát.") };
  }
}

export async function confirmReconciliationBatchAction(batchId: string, notes?: string) {
  try {
    const session = await requireRole(["SUPER_ADMIN", "ADMIN", "FINANCE", "BUSINESS"]);

    const batch = getReconciliationBatchById(batchId);
    if (!batch) {
      return { success: false, error: "Không tìm thấy đợt đối soát." };
    }

    if (session.role === "BUSINESS" && batch.businessId !== session.businessId) {
      return { success: false, error: "FORBIDDEN: Bạn chỉ có thể xác nhận đợt đối soát của cơ sở mình." };
    }

    const actor = {
      id: session.id,
      name: session.name,
      role: session.role
    };

    const res = confirmReconciliationBatch(batchId, actor);
    if (!res.success) {
      return { success: false, error: res.error || "Không thể xác nhận đợt đối soát." };
    }

    revalidatePath("/admin/reconciliation");
    return { success: true, batch: res.batch };
  } catch (err) {
    return { success: false, error: sanitizeErrorMessage(err, "Lỗi xác nhận đợt đối soát.") };
  }
}

export async function payoutReconciliationBatchAction(
  batchIdOrParams: string | { batchId: string; payoutProof?: string; notes?: string },
  optionsArg?: { payoutProof?: string; notes?: string }
) {
  try {
    const session = await requireRole(["SUPER_ADMIN", "ADMIN", "FINANCE"]);

    let batchId: string;
    let payoutProof: string | undefined;
    let notes: string | undefined;

    if (typeof batchIdOrParams === "string") {
      batchId = batchIdOrParams;
      payoutProof = optionsArg?.payoutProof;
      notes = optionsArg?.notes;
    } else {
      batchId = batchIdOrParams.batchId;
      payoutProof = batchIdOrParams.payoutProof;
      notes = batchIdOrParams.notes;
    }

    const actor = {
      id: session.id,
      name: session.name,
      role: session.role
    };

    const res = payoutReconciliationBatch(batchId, {
      payoutProof,
      notes,
      actor
    });

    if (!res.success) {
      return { success: false, error: res.error || "Không thể quyết toán chi trả cho đợt đối soát này." };
    }

    revalidatePath("/admin/reconciliation");
    return { success: true, batch: res.batch };
  } catch (err) {
    return { success: false, error: sanitizeErrorMessage(err, "Lỗi quyết toán chi trả đối tác.") };
  }
}
