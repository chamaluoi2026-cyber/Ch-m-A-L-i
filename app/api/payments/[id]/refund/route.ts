import { NextRequest, NextResponse } from "next/server";
import { processPaymentRefund } from "@/lib/server-store";
import { revalidatePath } from "next/cache";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
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
