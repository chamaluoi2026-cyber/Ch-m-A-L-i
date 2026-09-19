"use server";

import {
  createBooking,
  updateBookingStatus,
  updateBookingPayment,
  getAllBookings,
  getBookingById,
  getBookingsByUser,
  getBookingsByBusiness,
  type BookingRecord,
  type BookingType,
  type BookingStatus,
  type PaymentStatus,
  type PaymentMethod
} from "@/lib/server-store";
import { revalidatePath } from "next/cache";
import { getSession, requireRole, assertBusinessAccess, assertCustomerAccess, sanitizeErrorMessage } from "@/lib/auth/roles";

export interface CreateBookingInput {
  leadId?: string;
  placeId?: string;
  source?: string;
  campaign?: string;
  commissionRate?: number;
  type: BookingType;
  customerName: string;
  phone: string;
  email?: string;
  userId?: string;
  customerId?: string;
  itemTitle: string;
  itemId?: string;
  itemSlug?: string;
  serviceOrTourId?: string;
  businessId?: string;
  businessName?: string;
  quantity?: number;
  numberOfPeople?: number;
  startDate?: string;
  experienceDate?: string;
  experienceTime?: string;
  deliveryAddress?: string;
  notes?: string;
  customerNote?: string;
  businessNote?: string;
  unitPrice?: number;
  voucherCode?: string;
  voucher?: string;
  paymentMethod?: PaymentMethod;
  idempotencyKey?: string;
}

export async function submitBookingAction(input: CreateBookingInput) {
  try {
    if (!input.customerName || !input.phone) {
      return { success: false, error: "Vui lòng cung cấp họ tên và số điện thoại liên hệ." };
    }
    if (!input.itemTitle) {
      return { success: false, error: "Thông tin dịch vụ/sản phẩm không hợp lệ." };
    }

    // Lấy authenticated session nếu có
    const session = await getSession();
    const effectiveCustomerId = session?.role === "CUSTOMER" ? session.id : (input.userId || input.customerId || "guest");
    const effectiveCustomerName = session?.role === "CUSTOMER" ? session.name : input.customerName;

    const booking = createBooking({
      ...input,
      customerId: effectiveCustomerId,
      customerName: effectiveCustomerName,
      actor: {
        id: effectiveCustomerId,
        name: effectiveCustomerName,
        role: session?.role || "customer"
      }
    });

    revalidatePath("/account");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/orders");
    revalidatePath("/admin");

    return {
      success: true,
      booking
    };
  } catch (err) {
    return {
      success: false,
      error: sanitizeErrorMessage(err, "Đã có lỗi xảy ra khi tạo đơn đặt.")
    };
  }
}

export async function updateBookingStatusAction(
  id: string,
  status: BookingStatus,
  actor?: { id: string; name: string; role: string },
  cancelReason?: string
) {
  try {
    const session = await getSession();
    const existing = getBookingById(id);
    if (!existing) {
      return { success: false, error: "Không tìm thấy mã đơn đặt." };
    }

    // Quyền:
    // - SUPER_ADMIN, ADMIN, SALES có thể cập nhật mọi trạng thái
    // - BUSINESS chỉ có thể cập nhật đơn của cơ sở mình (xác nhận hoặc hoàn thành)
    // - CUSTOMER chỉ có thể tự hủy đơn của chính mình khi chưa xác nhận
    if (session) {
      if (session.role === "BUSINESS") {
        if (existing.businessId && existing.businessId !== session.businessId) {
          return { success: false, error: "FORBIDDEN: Bạn chỉ có thể cập nhật đơn của cơ sở mình." };
        }
      } else if (session.role === "CUSTOMER") {
        if (existing.customerId !== session.id) {
          return { success: false, error: "FORBIDDEN: Bạn không phải chủ đơn đặt này." };
        }
        if (status !== "cancelled") {
          return { success: false, error: "Khách hàng chỉ có thể hủy đơn đặt." };
        }
      } else if (!["SUPER_ADMIN", "ADMIN", "SALES", "SUPPORT"].includes(session.role)) {
        return { success: false, error: "FORBIDDEN: Không có quyền cập nhật trạng thái đơn đặt." };
      }
    }

    const effectiveActor = actor || {
      id: session?.id || "admin",
      name: session?.name || "Hệ thống",
      role: session?.role || "admin"
    };

    const updated = updateBookingStatus(id, status, effectiveActor, cancelReason);
    if (!updated) {
      return { success: false, error: "Không tìm thấy mã đơn đặt." };
    }

    revalidatePath("/account");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/bookings/" + id);
    revalidatePath("/admin/orders");
    revalidatePath("/admin");

    return { success: true, booking: updated };
  } catch (err) {
    return {
      success: false,
      error: sanitizeErrorMessage(err, "Lỗi cập nhật trạng thái đơn đặt.")
    };
  }
}

export async function updateBookingPaymentAction(
  id: string,
  paymentStatus: PaymentStatus,
  options?: {
    transactionRef?: string;
    refundAmount?: number;
    actor?: { id: string; name: string; role: string };
    callbackId?: string;
  }
) {
  try {
    // Chỉ Quản trị / Tài chính mới được can thiệp thủ công trạng thái thanh toán
    const session = await requireRole(["SUPER_ADMIN", "ADMIN", "FINANCE"]);

    const effectiveActor = options?.actor || {
      id: session.id,
      name: session.name,
      role: session.role
    };

    const updated = updateBookingPayment(id, paymentStatus, {
      ...options,
      actor: effectiveActor
    });

    if (!updated) {
      return { success: false, error: "Không tìm thấy mã đơn đặt." };
    }

    revalidatePath("/account");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/bookings/" + id);
    revalidatePath("/admin/orders");
    revalidatePath("/admin");

    return { success: true, booking: updated };
  } catch (err) {
    return {
      success: false,
      error: sanitizeErrorMessage(err, "Lỗi cập nhật thanh toán.")
    };
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcunfovtwbzfatudejfs.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdW5mb3Z0d2J6ZmF0dWRlamZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NTM5OSwiZXhwIjoyMTA0OTcxMzk5fQ.7QwyRHqGXa6UwgbUNAhlWdmGZqpuS8Cxall2v8j7lMU';

async function getCloudBookings(): Promise<BookingRecord[]> {
  try {
    const [resB, resMain] = await Promise.all([
      fetch(`${SUPABASE_URL}/rest/v1/system_store?id=eq.bookings_store&select=data`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        cache: "no-store"
      }),
      fetch(`${SUPABASE_URL}/rest/v1/system_store?id=eq.main&select=data`, {
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
        cache: "no-store"
      })
    ]);

    let listB: BookingRecord[] = [];
    if (resB.ok) {
      const rows = await resB.json();
      if (Array.isArray(rows[0]?.data)) listB = rows[0].data as BookingRecord[];
    }

    let listMain: BookingRecord[] = [];
    if (resMain.ok) {
      const rows = await resMain.json();
      if (Array.isArray(rows[0]?.data?.bookings)) listMain = rows[0].data.bookings as BookingRecord[];
    }

    const map = new Map<string, BookingRecord>();
    for (const b of [...listB, ...listMain]) {
      if (b.id && !map.has(b.id)) map.set(b.id, b);
    }
    const merged = Array.from(map.values()).sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    if (merged.length > 0) return merged;
  } catch (e) {
    console.error("[CLOUD_BOOKINGS_FETCH_ERR]", e);
  }
  return getAllBookings();
}

export async function fetchAllBookingsAction(): Promise<BookingRecord[]> {
  try {
    const session = await getSession();
    const all = await getCloudBookings();

    // Data Isolation:
    // - Business chỉ xem đơn của cơ sở mình
    if (session && session.role === "BUSINESS" && session.businessId) {
      return all.filter((b) => b.businessId === session.businessId);
    }

    // - Customer chỉ xem đơn của mình
    if (session && session.role === "CUSTOMER") {
      return all.filter((b) => b.customerId === session.id || b.userId === session.id);
    }

    // - Content Manager không có quyền xem booking khách
    if (session && session.role === "CONTENT_MANAGER") {
      return [];
    }

    return all;
  } catch {
    return [];
  }
}

// ANTI-IDOR: Lấy danh sách booking của khách hàng từ Authenticated Session
export async function fetchCustomerBookingsAction(clientUserId?: string): Promise<Partial<BookingRecord>[]> {
  const session = await getSession();
  
  // Ưu tiên session ID để chống IDOR
  const targetId = session?.role === "CUSTOMER" ? session.id : (clientUserId || session?.id);
  if (!targetId) return [];

  // Nếu khách A truyền ID của khách B -> Chặn ngay
  if (session && session.role === "CUSTOMER" && clientUserId && clientUserId !== session.id) {
    return [];
  }

  const userBookings = getBookingsByUser(targetId);
  return userBookings.map((b) => ({
    id: b.id,
    leadId: b.leadId,
    itemTitle: b.itemTitle,
    itemSlug: b.itemSlug,
    placeId: b.placeId,
    businessName: b.businessName,
    type: b.type,
    bookingDate: b.bookingDate,
    experienceDate: b.experienceDate,
    experienceTime: b.experienceTime,
    numberOfPeople: b.numberOfPeople,
    unitPrice: b.unitPrice,
    subtotal: b.subtotal,
    discount: b.discount,
    finalAmount: b.finalAmount,
    paymentStatus: b.paymentStatus,
    paymentMethod: b.paymentMethod,
    bookingStatus: b.bookingStatus || b.status,
    customerNote: b.customerNote || b.notes,
    createdAt: b.createdAt
  }));
}

export async function fetchBookingByIdAction(id: string): Promise<BookingRecord | null> {
  try {
    const session = await getSession();
    let b: BookingRecord | null = getBookingById(id) || null;
    if (!b) {
      const cloudList = await getCloudBookings();
      b = cloudList.find((item) => item.id === id) || null;
    }
    if (!b) return null;

    // Data Isolation:
    if (session) {
      if (session.role === "BUSINESS" && b.businessId !== session.businessId) {
        return null;
      }
      if (session.role === "CUSTOMER" && b.customerId !== session.id && b.userId !== session.id) {
        return null;
      }
      if (session.role === "CONTENT_MANAGER") {
        return null;
      }
    }

    return b;
  } catch {
    return null;
  }
}
