import { NextRequest, NextResponse } from "next/server";
import {
  createPayment,
  verifyAndConfirmPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByBookingId,
  getBookingById
} from "@/lib/server-store";
import { PaymentProviderFactory } from "@/lib/payment/provider";
import { revalidatePath } from "next/cache";

// GET /api/payments
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const bookingId = searchParams.get("bookingId");
    const id = searchParams.get("id") || searchParams.get("code");

    if (id) {
      const p = getPaymentById(id);
      return NextResponse.json({ success: true, payment: p || null });
    }

    if (bookingId) {
      const list = getPaymentsByBookingId(bookingId);
      return NextResponse.json({ success: true, payments: list });
    }

    const all = getAllPayments();
    return NextResponse.json({ success: true, payments: all });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/payments - Initiate payment request
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, method, amount, customerId, customerName, customerPhone, provider } = body;

    if (!bookingId) {
      return NextResponse.json({ success: false, error: "Thiếu mã đơn đặt (Booking ID)." }, { status: 400 });
    }

    const booking = getBookingById(bookingId);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Không tìm thấy mã đơn đặt." }, { status: 404 });
    }

    const res = createPayment({
      bookingId,
      method: method || "qr",
      provider,
      amount,
      customerId,
      customerName,
      customerPhone
    });

    if (!res.success || !res.payment) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    const providerInstance = PaymentProviderFactory.getProvider(res.payment.method);
    const details = await providerInstance.initiatePayment(res.payment, booking);

    revalidatePath("/admin/payments");
    revalidatePath("/admin/bookings");
    revalidatePath("/account");

    return NextResponse.json({
      success: true,
      payment: res.payment,
      details
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
