"use server";

import {
  getAllBusinesses,
  getBusinessById,
  updateBusinessProfile,
  createBusiness,
  deleteBusiness,
  type BusinessRecord
} from "@/lib/server-store";
import { revalidatePath } from "next/cache";
import { getSession, assertBusinessAccess, requireRole, sanitizeErrorMessage } from "@/lib/auth/roles";

export async function fetchBusinessesAction(): Promise<BusinessRecord[]> {
  try {
    const session = await getSession();
    const all = getAllBusinesses();

    // Data Isolation: Nếu là BUSINESS, chỉ trả về đúng doanh nghiệp của mình
    if (session && session.role === "BUSINESS") {
      return all.filter((b) => b.id === session.businessId);
    }

    return all;
  } catch (err) {
    console.error("[fetchBusinessesAction Error]:", err);
    return getAllBusinesses();
  }
}

export async function fetchBusinessByIdAction(id: string) {
  try {
    const session = await getSession();

    // Data Isolation: Ngăn Business A xem thông tin nội bộ của Business B
    if (session && session.role === "BUSINESS") {
      if (!session.businessId || session.businessId !== id) {
        throw new Error("FORBIDDEN: Bạn chỉ có quyền xem thông tin cơ sở của chính mình.");
      }
    }

    return getBusinessById(id) || null;
  } catch (err) {
    console.error("[fetchBusinessByIdAction Error]:", err);
    throw new Error(sanitizeErrorMessage(err, "Không thể tải thông tin cơ sở."));
  }
}

export async function createBusinessAction(data: {
  id?: string;
  name: string;
  ownerName: string;
  phone: string;
  email?: string;
  zaloUrl?: string;
  address?: string;
  commissionRate?: number;
  status?: "active" | "pending" | "paused";
}) {
  try {
    const session = await getSession();
    const actor = session
      ? { id: session.id, name: session.name, role: session.role }
      : { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" };

    if (!data.name || !data.name.trim()) {
      return { success: false, error: "Vui lòng nhập tên cơ sở / hợp tác xã." };
    }

    const created = createBusiness(
      {
        id: data.id,
        name: data.name,
        ownerName: data.ownerName || "",
        phone: data.phone || "",
        email: data.email || "",
        zaloUrl: data.zaloUrl || (data.phone ? `https://zalo.me/${data.phone.replace(/\D/g, "")}` : ""),
        address: data.address || "Huyện A Lưới, Thừa Thiên Huế",
        commissionRate: Number(data.commissionRate) || 10,
        status: data.status || "active"
      },
      actor
    );

    revalidatePath("/admin/businesses");
    revalidatePath("/business/profile");
    return { success: true, business: created };
  } catch (err) {
    console.error("[createBusinessAction Error]:", err);
    return {
      success: false,
      error: sanitizeErrorMessage(err, "Không thể tạo mới cơ sở đối tác.")
    };
  }
}

export async function updateBusinessAction(id: string, updates: Partial<BusinessRecord>) {
  try {
    // Kiểm tra quyền: Phải là Admin sàn hoặc chính chủ sở hữu cơ sở đó
    await assertBusinessAccess(id);

    // BẢO VỆ MASS ASSIGNMENT: Business không thể tự ý thay đổi commissionRate hoặc id
    const session = await getSession();
    const sanitizedUpdates = { ...updates };

    if (session && session.role === "BUSINESS") {
      delete sanitizedUpdates.commissionRate;
      delete (sanitizedUpdates as any).id;
      delete (sanitizedUpdates as any).joinedDate;
    }

    const updated = updateBusinessProfile(id, sanitizedUpdates);
    if (!updated) {
      return { success: false, error: "Không tìm thấy thông tin cơ sở." };
    }

    revalidatePath("/business/profile");
    revalidatePath("/admin/businesses");
    return { success: true, business: updated };
  } catch (err) {
    return {
      success: false,
      error: sanitizeErrorMessage(err, "Không có quyền cập nhật cơ sở.")
    };
  }
}

export async function deleteBusinessAction(id: string) {
  try {
    const session = await getSession();
    const actor = session
      ? { id: session.id, name: session.name, role: session.role }
      : { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" };

    const ok = deleteBusiness(id, actor);
    if (!ok) {
      return { success: false, error: "Không tìm thấy cơ sở để xóa." };
    }

    revalidatePath("/admin/businesses");
    return { success: true };
  } catch (err) {
    console.error("[deleteBusinessAction Error]:", err);
    return {
      success: false,
      error: sanitizeErrorMessage(err, "Không thể xóa cơ sở đối tác.")
    };
  }
}
