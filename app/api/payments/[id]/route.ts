import { NextRequest, NextResponse } from "next/server";
import { getPaymentById, processPaymentRefund, cancelPayment } from "@/lib/server-store";
import { revalidatePath } from "next/cache";

// GET /api/payments/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const payment = getPaymentById(id);
    if (!payment) {
      return NextResponse.json({ success: false, error: "Không tìm thấy giao dịch." }, { status: 404 });
    }
    return NextResponse.json({ success: true, payment });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/payments/[id]/refund
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { refundAmount, reason, actor } = body;

    const res = processPaymentRefund({
      paymentIdOrCode: id,
      refundAmount: Number(refundAmount) || undefined,
      reason: reason || "Hoàn tiền theo yêu cầu",
      actor: actor || { id: "admin-1", name: "Ban Quản Trị", role: "admin" }
    });

    if (!res.success || !res.payment) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    revalidatePath("/admin/payments");
    revalidatePath("/admin/bookings");
    revalidatePath("/account");

    return NextResponse.json({ success: true, payment: res.payment });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
