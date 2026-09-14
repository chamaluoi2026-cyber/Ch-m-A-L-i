import { NextRequest, NextResponse } from "next/server";
import { getBookingsByUser } from "@/lib/server-store";

// GET /api/bookings/customer
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || "";
    const bks = getBookingsByUser(userId);

    // Sanitize: No commissionRate, commissionAmount, businessNote
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
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
