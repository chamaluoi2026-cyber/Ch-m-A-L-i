"use server";

import {
  createPayment,
  verifyAndConfirmPayment,
  processPaymentRefund,
  cancelPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByBookingId,
  getBookingById,
  type PaymentRecord,
  type PaymentMethodType
} from "@/lib/server-store";
import { PaymentProviderFactory } from "@/lib/payment/provider";
import { revalidatePath } from "next/cache";
import { getSession, requireRole, assertCustomerAccess, sanitizeErrorMessage } from "@/lib/auth/roles";

// 1. Tạo yêu cầu thanh toán (Payment Request)
export async function initiatePaymentAction(params: {
  bookingId: string;
  method: PaymentMethodType;
  provider?: string;
  amount?: number;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
}) {
  try {
    const booking = getBookingById(params.bookingId);
    if (!booking) {
      return { success: false, error: "Không tìm thấy mã đơn đặt." };
    }

    // Identity check: Nếu có session khách hàng, đảm bảo khớp danh tính
    const session = await getSession();
    if (session && session.role === "CUSTOMER") {
      params.customerId = session.id;
      params.customerName = session.name;
    }

    const res = createPayment(params);
    if (!res.success || !res.payment) {
      return { success: false, error: res.error || "Không thể khởi tạo thanh toán." };
    }

    const providerInstance = PaymentProviderFactory.getProvider(params.method);
    const details = await providerInstance.initiatePayment(res.payment, booking);

    revalidatePath("/payment/" + res.payment.id);
    revalidatePath("/admin/payments");
    revalidatePath("/admin/bookings");
    revalidatePath("/account");

    return {
      success: true,
      payment: res.payment,
      details
    };
  } catch (err: any) {
    return {
      success: false,
      error: sanitizeErrorMessage(err, "Lỗi khởi tạo thanh toán.")
    };
  }
}

// 2. Xác thực thanh toán Server-Side (Không tin dữ liệu client)
export async function verifyPaymentCallbackAction(params: {
  paymentIdOrCode: string;
  receivedAmount: number;
  providerTransactionId?: string;
  actor?: { id: string; name: string; role: string };
  callbackId?: string;
}) {
  try {
    // Chỉ SUPER_ADMIN, ADMIN, FINANCE hoặc Webhook System mới được xác thực
    const session = await getSession();
    if (session && ["CONTENT_MANAGER", "SUPPORT", "BUSINESS"].includes(session.role)) {
      return { success: false, error: "FORBIDDEN: Bạn không có quyền xác thực giao dịch tài chính." };
    }

    const result = verifyAndConfirmPayment(params);
    if (!result.success || !result.payment) {
      return { success: false, error: result.error || "Xác thực thanh toán thất bại." };
    }

    revalidatePath("/payment/" + result.payment.id);
    revalidatePath("/admin/payments");
    revalidatePath("/admin/bookings");
    revalidatePath("/account");

    return {
      success: true,
      payment: result.payment,
      isDuplicate: result.isDuplicate,
      message: result.isDuplicate
        ? "Giao dịch đã được ghi nhận trước đó (Idempotent)."
        : "Thanh toán thành công và đơn đặt đã được xác nhận."
    };
  } catch (err: any) {
    return {
      success: false,
      error: sanitizeErrorMessage(err, "Lỗi xác thực thanh toán.")
    };
  }
}

// 3. Admin/Finance xử lý hoàn tiền (Refund Lifecycle)
export async function processRefundAction(params: {
  paymentIdOrCode: string;
  refundAmount?: number;
  reason: string;
  actor?: { id: string; name: string; role: string };
}) {
  try {
    // CONTENT_MANAGER, SALES, SUPPORT, BUSINESS bị chặn hoàn tiền
    const session = await requireRole(["SUPER_ADMIN", "ADMIN", "FINANCE"]);

    const effectiveActor = {
      id: session.id,
      name: session.name,
      role: session.role
    };

    const res = processPaymentRefund({
      ...params,
      actor: effectiveActor
    });

    if (!res.success || !res.payment) {
      return { success: false, error: res.error || "Lỗi xử lý hoàn tiền." };
    }

    revalidatePath("/admin/payments");
    revalidatePath("/admin/bookings");
    revalidatePath("/account");

    return { success: true, payment: res.payment };
  } catch (err: any) {
    return {
      success: false,
      error: sanitizeErrorMessage(err, "Lỗi xử lý hoàn tiền.")
    };
  }
}

// 4. Lấy danh sách thanh toán (Chỉ Quản trị & Tài chính)
export async function fetchAllPaymentsAction(): Promise<PaymentRecord[]> {
  try {
    const session = await getSession();
    // CONTENT_MANAGER, SUPPORT không được xem danh sách thanh toán
    if (session && ["CONTENT_MANAGER", "SUPPORT"].includes(session.role)) {
      return [];
    }

    return getAllPayments();
  } catch {
    return [];
  }
}

// 5. Lấy chi tiết thanh toán theo ID
export async function fetchPaymentByIdAction(id: string): Promise<PaymentRecord | null> {
  try {
    const session = await getSession();
    if (session && ["CONTENT_MANAGER", "SUPPORT"].includes(session.role)) {
      return null;
    }

    const p = getPaymentById(id);
    if (!p) return null;

    // Nếu là CUSTOMER, chỉ cho xem thanh toán của chính mình
    if (session && session.role === "CUSTOMER" && p.customerId !== session.id) {
      return null;
    }

    return p;
  } catch {
    return null;
  }
}
