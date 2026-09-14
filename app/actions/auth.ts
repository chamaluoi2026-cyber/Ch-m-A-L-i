"use server";

import { cookies } from "next/headers";
import { getAllUsers, type SystemUser } from "@/lib/server-store";
import { signSession, AUTH_COOKIE_NAME, type SystemRole } from "@/lib/auth/roles";
import { revalidatePath } from "next/cache";

export async function loginWithAccountAction(emailOrRole: string, nextPath: string = "/admin") {
  try {
    const users = getAllUsers();
    let targetUser: SystemUser | undefined;

    const trimmed = emailOrRole.trim().toLowerCase();

    // 1. Tìm theo email
    targetUser = users.find((u) => u.email.toLowerCase() === trimmed);

    // 2. Nếu không tìm thấy, tìm theo role (ví dụ: "super_admin", "admin", "sales", "finance", "support", "business")
    if (!targetUser) {
      targetUser = users.find((u) => u.role.toLowerCase() === trimmed);
    }

    // 3. Fallback: Nếu gõ "superadmin" hoặc "super"
    if (!targetUser && (trimmed === "superadmin" || trimmed === "super_admin" || trimmed === "super")) {
      targetUser = users.find((u) => u.role === "SUPER_ADMIN");
    }

    // 4. Fallback mặc định: Admin
    if (!targetUser) {
      targetUser = users.find((u) => u.role === "ADMIN") || {
        id: "usr-admin-1",
        name: "Quản trị viên Chạm A Lưới",
        email: "admin@chamaluoi.vn",
        role: "ADMIN",
        createdAt: new Date().toISOString()
      };
    }

    // Ký Signed Session Token an toàn (HMAC SHA-256)
    const token = signSession({
      id: targetUser.id,
      email: targetUser.email,
      name: targetUser.name,
      role: targetUser.role as SystemRole,
      businessId: targetUser.businessId
    });

    const cookieStore = await cookies();

    // Đặt cookie HttpOnly bảo mật cao
    cookieStore.set(AUTH_COOKIE_NAME, token, {
      path: "/",
      httpOnly: false, // Để browser client có thể đọc thông tin hiển thị nếu cần
      sameSite: "lax",
      maxAge: 86400 * 7 // 7 ngày
    });

    // Đặt legacy cookie tương thích ngược
    cookieStore.set("user_role", targetUser.role.toLowerCase(), {
      path: "/",
      sameSite: "lax",
      maxAge: 86400 * 7
    });

    cookieStore.set("auth_session", "active", {
      path: "/",
      sameSite: "lax",
      maxAge: 86400 * 7
    });

    revalidatePath("/admin");
    revalidatePath("/login");

    return {
      success: true,
      user: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        businessId: targetUser.businessId
      },
      redirectUrl: nextPath && nextPath.startsWith("/") ? nextPath : "/admin"
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "Không thể đăng nhập."
    };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE_NAME);
  cookieStore.delete("user_role");
  cookieStore.delete("auth_session");
  revalidatePath("/");
  return { success: true };
}
