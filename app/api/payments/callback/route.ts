import { NextRequest, NextResponse } from "next/server";
import { verifyAndConfirmPayment, getPaymentById } from "@/lib/server-store";
import { PaymentProviderFactory } from "@/lib/payment/provider";
import { revalidatePath } from "next/cache";

// POST /api/payments/callback - Webhook / Callback từ ngân hàng hoặc cổng thanh toán
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { paymentIdOrCode, amount, transactionId, callbackId, signature } = body;

    if (!paymentIdOrCode) {
      return NextResponse.json({ success: false, error: "Thiếu paymentId hoặc paymentCode tham chiếu." }, { status: 400 });
    }

    const payment = getPaymentById(paymentIdOrCode);
    if (!payment) {
      return NextResponse.json({ success: false, error: "Không tìm thấy giao dịch." }, { status: 404 });
    }

    // Provider verify
    const provider = PaymentProviderFactory.getProvider(payment.provider);
    const verification = await provider.verifyPayment(payment, body);

    if (!verification.verified) {
      return NextResponse.json({
        success: false,
        error: verification.error || "Xác thực giao dịch thất bại."
      }, { status: 400 });
    }

    // Confirm payment with idempotency
    const confirmResult = verifyAndConfirmPayment({
      paymentIdOrCode,
      receivedAmount: verification.amount || Number(amount) || 0,
      providerTransactionId: verification.providerTransactionId || transactionId,
      callbackId,
      actor: { id: "payment-gateway", name: payment.provider.toUpperCase(), role: "gateway" }
    });

    if (!confirmResult.success || !confirmResult.payment) {
      return NextResponse.json({ success: false, error: confirmResult.error }, { status: 400 });
    }

    revalidatePath("/admin/payments");
    revalidatePath("/admin/bookings");
    revalidatePath("/account");

    return NextResponse.json({
      success: true,
      payment: confirmResult.payment,
      isDuplicate: confirmResult.isDuplicate,
      message: confirmResult.isDuplicate
        ? "Giao dịch đã được xử lý từ trước (Idempotent)."
        : "Xác thực thanh toán thành công."
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
