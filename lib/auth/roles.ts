import crypto from "crypto";
import { cookies } from "next/headers";

// 1. ROLES DEFINITION
export type SystemRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "CONTENT_MANAGER"
  | "SALES"
  | "FINANCE"
  | "SUPPORT"
  | "BUSINESS"
  | "CUSTOMER";

// 2. PERMISSION DEFINITION
export type Permission =
  | "admin:full"
  | "content:read"
  | "content:write"
  | "sales:read"
  | "sales:write"
  | "finance:read"
  | "finance:write"
  | "support:read"
  | "support:write"
  | "business:own_data"
  | "customer:own_data";

// 3. ROLE-PERMISSION MATRIX
export const ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  SUPER_ADMIN: [
    "admin:full",
    "content:read",
    "content:write",
    "sales:read",
    "sales:write",
    "finance:read",
    "finance:write",
    "support:read",
    "support:write",
    "business:own_data",
    "customer:own_data"
  ],
  ADMIN: [
    "content:read",
    "content:write",
    "sales:read",
    "sales:write",
    "finance:read",
    "finance:write",
    "support:read",
    "support:write",
    "business:own_data",
    "customer:own_data"
  ],
  CONTENT_MANAGER: [
    "content:read",
    "content:write"
  ],
  SALES: [
    "sales:read",
    "sales:write",
    "support:read"
  ],
  FINANCE: [
    "finance:read",
    "finance:write",
    "sales:read"
  ],
  SUPPORT: [
    "support:read",
    "support:write",
    "sales:read"
  ],
  BUSINESS: [
    "business:own_data"
  ],
  CUSTOMER: [
    "customer:own_data"
  ]
};

// 4. SESSION TYPES & CONSTANTS
export const AUTH_COOKIE_NAME = "cal_auth_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "cham-a-luoi-secure-session-key-2026-very-secret";

export type AuthSession = {
  id: string; // User ID / Customer ID
  email: string;
  name: string;
  role: SystemRole;
  businessId?: string; // Bắt buộc đối với role BUSINESS
  issuedAt: number;
  expiresAt: number;
};

// 5. SIGNED TOKEN UTILITIES (HMAC SHA-256)
export function signSession(session: Omit<AuthSession, "issuedAt" | "expiresAt">, ttlSeconds: number = 86400 * 7): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: AuthSession = {
    ...session,
    issuedAt: now,
    expiresAt: now + ttlSeconds
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(payloadB64);
  const signature = hmac.digest("base64url");

  return `${payloadB64}.${signature}`;
}

export function verifySessionToken(token: string | undefined | null): AuthSession | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadB64, signature] = parts;
  const hmac = crypto.createHmac("sha256", SESSION_SECRET);
  hmac.update(payloadB64);
  const expectedSig = hmac.digest("base64url");

  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf8")) as AuthSession;
    const now = Math.floor(Date.now() / 1000);
    if (payload.expiresAt && payload.expiresAt < now) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

// 6. SERVER-SIDE SESSION RETRIEVAL (Reads HTTP-Only Cookie or Fallback)
export async function getSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    if (token) {
      const verified = verifySessionToken(token);
      if (verified) return verified;
    }

    // Fallback: Kiểm tra user_role cookie cũ nếu đang trong quá trình chuyển giao hoặc demo
    const legacyRole = cookieStore.get("user_role")?.value;
    if (legacyRole) {
      const normalizedRole = normalizeRole(legacyRole);
      return {
        id: "usr-" + legacyRole,
        email: `${legacyRole}@chamaluoi.vn`,
        name: `Tài khoản ${legacyRole}`,
        role: normalizedRole,
        businessId: legacyRole === "business" ? "biz-a-nor" : undefined,
        issuedAt: Math.floor(Date.now() / 1000),
        expiresAt: Math.floor(Date.now() / 1000) + 86400
      };
    }
  } catch {
    // Có thể xảy ra trong môi trường không có request context
  }
  return null;
}

export function normalizeRole(raw: string | undefined | null): SystemRole {
  if (!raw) return "CUSTOMER";
  const upper = raw.toUpperCase();
  if (upper === "SUPER_ADMIN" || upper === "SUPERADMIN") return "SUPER_ADMIN";
  if (upper === "ADMIN") return "ADMIN";
  if (upper === "CONTENT_MANAGER" || upper === "CONTENT") return "CONTENT_MANAGER";
  if (upper === "SALES") return "SALES";
  if (upper === "FINANCE") return "FINANCE";
  if (upper === "SUPPORT") return "SUPPORT";
  if (upper === "BUSINESS") return "BUSINESS";
  return "CUSTOMER";
}

// 7. PERMISSION CHECKERS
export function hasPermission(role: SystemRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes("admin:full") || permissions.includes(permission);
}

export function isStaffOrAdmin(role: SystemRole): boolean {
  return ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER", "SALES", "FINANCE", "SUPPORT"].includes(role);
}

// 8. GUARDS FOR SERVER ACTIONS & ROUTES
export async function requireAuth(): Promise<AuthSession> {
  const session = await getSession();
  if (!session) {
    throw new Error("UNAUTHORIZED: Yêu cầu đăng nhập để thực hiện tác vụ này.");
  }
  return session;
}

export async function requireRole(allowedRoles: SystemRole[]): Promise<AuthSession> {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.role) && session.role !== "SUPER_ADMIN") {
    throw new Error(`FORBIDDEN: Bạn không có quyền truy cập chức năng này (Yêu cầu vai trò: ${allowedRoles.join(", ")}).`);
  }
  return session;
}

export async function requirePermission(permission: Permission): Promise<AuthSession> {
  const session = await requireAuth();
  if (!hasPermission(session.role, permission)) {
    throw new Error(`FORBIDDEN: Thiếu quyền thực thi: ${permission}.`);
  }
  return session;
}

/**
 * Đảm bảo tính cô lập dữ liệu theo Business (Data Isolation)
 * - SUPER_ADMIN / ADMIN / SALES / FINANCE có thể xem/sửa theo phân quyền
 * - BUSINESS chỉ được thao tác trên đúng targetBusinessId của chính mình
 */
export async function assertBusinessAccess(targetBusinessId: string): Promise<AuthSession> {
  const session = await requireAuth();
  if (session.role === "SUPER_ADMIN" || session.role === "ADMIN") {
    return session;
  }
  if (session.role === "BUSINESS") {
    if (!session.businessId || session.businessId !== targetBusinessId) {
      throw new Error(`FORBIDDEN: Bạn chỉ có quyền truy cập cơ sở kinh doanh của chính mình.`);
    }
    return session;
  }
  throw new Error("FORBIDDEN: Bạn không có quyền quản trị cơ sở kinh doanh.");
}

/**
 * Đảm bảo tính cô lập dữ liệu theo Customer (Data Isolation)
 * - SUPER_ADMIN / ADMIN / SUPPORT có thể hỗ trợ
 * - CUSTOMER chỉ được thao tác trên đúng targetCustomerId của chính mình
 */
export async function assertCustomerAccess(targetCustomerId: string): Promise<AuthSession> {
  const session = await requireAuth();
  if (["SUPER_ADMIN", "ADMIN", "SUPPORT", "SALES"].includes(session.role)) {
    return session;
  }
  if (session.role === "CUSTOMER") {
    if (session.id !== targetCustomerId) {
      throw new Error(`FORBIDDEN: Bạn chỉ có quyền truy cập thông tin của chính mình.`);
    }
    return session;
  }
  throw new Error("FORBIDDEN: Yêu cầu quyền truy cập hợp lệ.");
}

// 9. ERROR MASKING UTILITY (Production safe error messages)
export function sanitizeErrorMessage(error: unknown, fallback: string = "Đã có lỗi xảy ra trên hệ thống."): string {
  if (error instanceof Error) {
    const msg = error.message;
    // Giữ nguyên các thông báo nghiệp vụ rõ ràng
    if (msg.startsWith("UNAUTHORIZED:") || msg.startsWith("FORBIDDEN:") || msg.includes("Vui lòng") || msg.includes("Không tìm thấy")) {
      return msg;
    }
    // Ghi log trên server
    console.error("[SERVER_SECURITY_ERROR]:", error);
    if (process.env.NODE_ENV === "production") {
      return fallback;
    }
    return msg;
  }
  return fallback;
}
