import { NextRequest, NextResponse } from "next/server";
import { getBookingById, updateBookingStatus, updateBookingPayment } from "@/lib/server-store";
import { revalidatePath } from "next/cache";

// GET /api/bookings/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const booking = getBookingById(id);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Không tìm thấy booking" }, { status: 404 });
    }
    return NextResponse.json({ success: true, booking });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
