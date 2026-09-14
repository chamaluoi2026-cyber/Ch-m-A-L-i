import { NextRequest, NextResponse } from "next/server";
import {
  createBooking,
  getAllBookings,
  getBookingById,
  getBookingsByUser,
  updateBookingStatus,
  updateBookingPayment
} from "@/lib/server-store";
import { revalidatePath } from "next/cache";

// GET /api/bookings
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const customerView = searchParams.get("customerView");

    if (userId || customerView) {
      const bks = userId ? getBookingsByUser(userId) : getAllBookings();
      // Mask internal commission and business notes for customers
      const sanitized = bks.map(b => ({
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
      return NextResponse.json({ success: true, bookings: sanitized });
    }

    const all = getAllBookings();
    return NextResponse.json({ success: true, bookings: all });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/bookings - Create new booking
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.customerName || !body.phone || !body.itemTitle) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập họ tên, số điện thoại và tên dịch vụ/sản phẩm." },
        { status: 400 }
      );
    }

    const booking = createBooking(body);
    revalidatePath("/admin/bookings");
    revalidatePath("/account");
    return NextResponse.json({ success: true, booking });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
