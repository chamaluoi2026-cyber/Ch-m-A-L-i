"use server";

import { getAllAuditLogs, addAuditLog, type AuditLogRecord, type AuditAction, type AuditEntityType } from "@/lib/server-store";
import { getSession, requireRole, sanitizeErrorMessage } from "@/lib/auth/roles";
import { headers } from "next/headers";

export async function fetchAllAuditLogsAction(filters?: {
  actor?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}): Promise<AuditLogRecord[]> {
  try {
    // Chỉ Quản trị viên & Kế toán được xem nhật ký kiểm toán hệ thống
    const session = await getSession();
    if (!session || !["SUPER_ADMIN", "ADMIN", "FINANCE", "SUPPORT"].includes(session.role)) {
      return [];
    }

    let logs = getAllAuditLogs();

    if (filters?.actor && filters.actor !== "all") {
      const q = filters.actor.toLowerCase();
      logs = logs.filter((l) => l.actorName?.toLowerCase().includes(q) || l.actorId?.toLowerCase().includes(q));
    }

    if (filters?.action && filters.action !== "all") {
      logs = logs.filter((l) => l.action?.toUpperCase() === filters.action?.toUpperCase());
    }

    if (filters?.entityType && filters.entityType !== "all") {
      logs = logs.filter((l) => l.entityType?.toUpperCase() === filters.entityType?.toUpperCase());
    }

    if (filters?.entityId && filters.entityId.trim()) {
      const idQ = filters.entityId.toLowerCase().trim();
      logs = logs.filter((l) => l.entityId?.toLowerCase().includes(idQ));
    }

    if (filters?.search && filters.search.trim()) {
      const sQ = filters.search.toLowerCase().trim();
      logs = logs.filter((l) =>
        l.summary?.toLowerCase().includes(sQ) ||
        l.entityTitle?.toLowerCase().includes(sQ) ||
        l.entityId?.toLowerCase().includes(sQ) ||
        l.actorName?.toLowerCase().includes(sQ) ||
        (l.reason && l.reason.toLowerCase().includes(sQ))
      );
    }

    if (filters?.dateFrom) {
      const fromTime = new Date(filters.dateFrom).getTime();
      logs = logs.filter((l) => new Date(l.timestamp).getTime() >= fromTime);
    }

    if (filters?.dateTo) {
      const toTime = new Date(filters.dateTo).getTime() + 86400000;
      logs = logs.filter((l) => new Date(l.timestamp).getTime() <= toTime);
    }

    return logs;
  } catch (err) {
    console.error("[fetchAllAuditLogsAction Error]:", err);
    return [];
  }
}

/**
 * Ghi nhận Audit Log an toàn từ Server
 * BẢO MẬT: Không cho frontend tự truyền actorId/actorRole.
 * Bắt buộc lấy identity từ authenticated session.
 */
export async function recordAuditEventAction(params: {
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityTitle?: string;
  oldValue?: any;
  newValue?: any;
  summary: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    const session = await getSession();
    const headersList = await headers();
    const ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "127.0.0.1";
    const userAgent = headersList.get("user-agent") || "Web Client";

    const actorId = session?.id || "guest";
    const actorName = session?.name || "Khách truy cập";
    const actorRole = session?.role || "CUSTOMER";

    const entry = addAuditLog({
      ...params,
      actorId,
      actorName,
      actorRole,
      ip,
      userAgent
    });

    return { success: true, log: entry };
  } catch (err) {
    return { success: false, error: sanitizeErrorMessage(err, "Không thể ghi nhận nhật ký kiểm toán.") };
  }
}

// BẢO MẬT TUYỆT ĐỐI (APPEND-ONLY):
// Nghiêm cấm mọi hành vi sửa, xóa Audit Log. Ngay cả Super Admin cũng không thể can thiệp lịch sử kiểm toán.
export async function deleteAuditLogAction() {
  return {
    success: false,
    error: "FORBIDDEN: Nhật ký kiểm toán là dữ liệu bất biến (Append-only). Không ai có quyền xóa hoặc sửa đổi lịch sử kiểm toán hệ thống."
  };
}
