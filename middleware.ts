import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Danh sách các route phân quyền chi tiết trong /admin
const ROUTE_PERMISSIONS: Array<{
  prefix: string;
  allowedRoles: string[];
}> = [
  // Finance only + Super Admin
  { prefix: "/admin/commissions", allowedRoles: ["SUPER_ADMIN", "ADMIN", "FINANCE"] },
  { prefix: "/admin/reconciliation", allowedRoles: ["SUPER_ADMIN", "ADMIN", "FINANCE"] },
  { prefix: "/admin/payments", allowedRoles: ["SUPER_ADMIN", "ADMIN", "FINANCE"] },
  { prefix: "/admin/transactions", allowedRoles: ["SUPER_ADMIN", "ADMIN", "FINANCE"] },

  // Content Manager + Super Admin + Admin
  { prefix: "/admin/blogs", allowedRoles: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"] },
  { prefix: "/admin/media", allowedRoles: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"] },
  { prefix: "/admin/places", allowedRoles: ["SUPER_ADMIN", "ADMIN", "CONTENT_MANAGER"] },

  // Sales & Support
  { prefix: "/admin/leads", allowedRoles: ["SUPER_ADMIN", "ADMIN", "SALES", "SUPPORT"] },
  { prefix: "/admin/bookings", allowedRoles: ["SUPER_ADMIN", "ADMIN", "SALES", "SUPPORT"] },
  { prefix: "/admin/orders", allowedRoles: ["SUPER_ADMIN", "ADMIN", "SALES", "SUPPORT"] },
  { prefix: "/admin/chat", allowedRoles: ["SUPER_ADMIN", "ADMIN", "SUPPORT", "SALES"] },
  { prefix: "/admin/reviews", allowedRoles: ["SUPER_ADMIN", "ADMIN", "SUPPORT", "CONTENT_MANAGER"] },

  // System, Audit Logs, Notifications & Users
  { prefix: "/admin/notifications", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/admin/audit-logs", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/admin/users", allowedRoles: ["SUPER_ADMIN", "ADMIN"] },
  { prefix: "/admin/businesses", allowedRoles: ["SUPER_ADMIN", "ADMIN"] }
];

function parseSessionToken(token: string | undefined): { role: string; businessId?: string; id?: string } | null {
  if (!token) return null;
  try {
    const [payloadB64] = token.split(".");
    if (!payloadB64) return null;
    const jsonStr = Buffer.from(payloadB64, "base64url").toString("utf8");
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bảo vệ toàn bộ khu vực /admin/*
  if (pathname.startsWith("/admin")) {
    const authSessionToken = request.cookies.get("cal_auth_session")?.value;
    const legacyRole = request.cookies.get("user_role")?.value?.toUpperCase();

    let userRole = legacyRole || "UNAUTHORIZED";
    if (authSessionToken) {
      const session = parseSessionToken(authSessionToken);
      if (session?.role) {
        userRole = session.role.toUpperCase();
      }
    }

    // Nếu chưa xác thực hoặc là khách hàng thường (CUSTOMER)
    if (!userRole || userRole === "CUSTOMER" || userRole === "UNAUTHORIZED") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "unauthorized");
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Nếu là BUSINESS: Không được vào Dashboard tổng của Admin sàn
    if (userRole === "BUSINESS") {
      const forbiddenUrl = new URL("/login", request.url);
      forbiddenUrl.searchParams.set("error", "forbidden_business_portal");
      return NextResponse.redirect(forbiddenUrl);
    }

    // SUPER_ADMIN có toàn quyền truy cập tất cả route
    if (userRole === "SUPER_ADMIN" || userRole === "ADMIN") {
      return NextResponse.next();
    }

    // Kiểm tra quyền hạn theo từng sub-route
    for (const rule of ROUTE_PERMISSIONS) {
      if (pathname.startsWith(rule.prefix)) {
        if (!rule.allowedRoles.includes(userRole)) {
          // Trả về 403 Forbidden
          return new NextResponse(
            JSON.stringify({
              error: "403 Forbidden",
              message: `Tài khoản với vai trò '${userRole}' không có quyền truy cập khu vực này.`
            }),
            {
              status: 403,
              headers: { "Content-Type": "application/json" }
            }
          );
        }
      }
    }
  }

  // 2. Bảo vệ route /business/* (Cổng thông tin đối tác cơ sở)
  if (pathname.startsWith("/business")) {
    const authSessionToken = request.cookies.get("cal_auth_session")?.value;
    const legacyRole = request.cookies.get("user_role")?.value?.toUpperCase();

    let userRole = legacyRole || "UNAUTHORIZED";
    if (authSessionToken) {
      const session = parseSessionToken(authSessionToken);
      if (session?.role) {
        userRole = session.role.toUpperCase();
      }
    }

    if (userRole === "CUSTOMER" || userRole === "UNAUTHORIZED") {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "unauthorized");
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/business/:path*"]
};
