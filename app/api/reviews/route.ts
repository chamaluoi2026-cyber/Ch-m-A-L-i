import { NextRequest, NextResponse } from "next/server";
import {
  getAllReviews,
  getReviewsByPlace,
  getReviewByBookingId,
  canUserReviewBooking,
  createReview,
  updateReviewStatus
} from "@/lib/server-store";
import { revalidatePath } from "next/cache";

// GET /api/reviews
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const place = searchParams.get("place") || searchParams.get("placeSlug") || "";
    const bookingId = searchParams.get("bookingId");
    const status = searchParams.get("status");

    if (bookingId) {
      const review = getReviewByBookingId(bookingId);
      return NextResponse.json({ success: true, review: review || null });
    }

    if (place) {
      const onlyApproved = status !== "all";
      const reviews = getReviewsByPlace(place, onlyApproved);
      return NextResponse.json({ success: true, reviews });
    }

    const all = getAllReviews();
    const filtered = status ? all.filter(r => r.status === status) : all;
    return NextResponse.json({ success: true, reviews: filtered });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/reviews - Submit review
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bookingId, customerId, authorName, authorPhone, authorAvatar, rating, content, title, images } = body;

    if (!bookingId) {
      return NextResponse.json({ success: false, error: "Thiếu mã đơn đặt dịch vụ (Booking ID)." }, { status: 400 });
    }
    if (!content || String(content).trim().length < 5) {
      return NextResponse.json({ success: false, error: "Nội dung đánh giá cần tối thiểu 5 ký tự." }, { status: 400 });
    }

    // Eligibility check
    const check = canUserReviewBooking(bookingId, customerId, authorPhone);
    if (!check.eligible) {
      const statusCode = check.error?.includes("sở hữu") ? 403 : check.error?.includes("trước đó") ? 409 : 400;
      return NextResponse.json({ success: false, error: check.error }, { status: statusCode });
    }

    const result = createReview({
      bookingId,
      customerId,
      authorName,
      authorPhone,
      authorAvatar,
      rating: Number(rating) || 5,
      content,
      title,
      images
    });

    if (!result.success || !result.review) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    revalidatePath("/places/" + result.review.placeSlug);
    revalidatePath("/places");
    revalidatePath("/account");
    revalidatePath("/admin/reviews");

    return NextResponse.json({
      success: true,
      review: result.review,
      message: "Đánh giá đã được gửi thành công và đang chờ Admin duyệt!"
    }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
