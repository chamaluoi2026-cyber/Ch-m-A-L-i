import { NextRequest, NextResponse } from "next/server";
import { updateBookingStatus } from "@/lib/server-store";
import { revalidatePath } from "next/cache";

// PATCH /api/bookings/[id]/status
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, actor, cancelReason } = body;

    const updated = updateBookingStatus(id, status, actor, cancelReason);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Không tìm thấy booking" }, { status: 404 });
    }

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/bookings/" + id);
    revalidatePath("/account");
    return NextResponse.json({ success: true, booking: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
