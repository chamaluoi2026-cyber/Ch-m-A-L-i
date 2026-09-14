"use server";

import {
  createReview,
  getReviewsByPlace,
  getAllReviews,
  getReviewByBookingId,
  canUserReviewBooking,
  updateReviewStatus,
  type ReviewRecord,
  type ReviewStatus
} from "@/lib/server-store";
import { revalidatePath } from "next/cache";

export interface SubmitReviewInput {
  bookingId: string;
  customerId?: string;
  authorName?: string;
  authorAvatar?: string;
  authorPhone?: string;
  authorEmail?: string;
  rating: number;
  content: string;
  title?: string;
  images?: string[];
}

// Kiểm tra quyền đánh giá của khách hàng trước khi mở form
export async function checkReviewEligibilityAction(
  bookingId: string,
  customerId?: string,
  customerPhone?: string
) {
  try {
    return canUserReviewBooking(bookingId, customerId, customerPhone);
  } catch (err: any) {
    return { eligible: false, error: err.message };
  }
}

// Du khách submit đánh giá trải nghiệm
export async function submitReviewAction(input: SubmitReviewInput) {
  try {
    if (!input.bookingId) {
      return { success: false, error: "Thiếu mã đơn đặt (Booking ID)." };
    }
    if (!input.content || input.content.trim().length < 5) {
      return { success: false, error: "Vui lòng nhập nội dung đánh giá tối thiểu 5 ký tự." };
    }
    if (input.rating < 1 || input.rating > 5) {
      return { success: false, error: "Số sao đánh giá phải từ 1 đến 5." };
    }

    const res = createReview(input);
    if (!res.success || !res.review) {
      return { success: false, error: res.error || "Không thể gửi đánh giá." };
    }

    revalidatePath("/places/" + res.review.placeSlug);
    revalidatePath("/places");
    revalidatePath("/account");
    revalidatePath("/admin/reviews");
    revalidatePath("/admin");

    return {
      success: true,
      review: res.review,
      message: "Đánh giá của bạn đã được gửi thành công và đang chờ ban quản trị duyệt!"
    };
  } catch (err: any) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Đã có lỗi xảy ra khi gửi đánh giá."
    };
  }
}

// Lấy danh sách review đã duyệt của địa điểm (Công khai)
export async function fetchPlaceReviewsAction(placeSlugOrId: string, onlyApproved: boolean = true) {
  return getReviewsByPlace(placeSlugOrId, onlyApproved);
}

// Lấy toàn bộ reviews (Admin)
export async function fetchAllReviewsAction(): Promise<ReviewRecord[]> {
  return getAllReviews();
}

// Lấy review theo booking ID
export async function fetchReviewByBookingIdAction(bookingId: string): Promise<ReviewRecord | null> {
  const r = getReviewByBookingId(bookingId);
  return r || null;
}

// Admin cập nhật trạng thái: approved | rejected | hidden (kèm adminNote)
export async function updateReviewStatusAction(
  reviewId: string,
  status: ReviewStatus,
  actor?: { id: string; name: string; role: string },
  adminNote?: string
) {
  try {
    const updated = updateReviewStatus(reviewId, status, actor, adminNote);
    if (!updated) {
      return { success: false, error: "Không tìm thấy đánh giá." };
    }

    if (updated.placeSlug) {
      revalidatePath("/places/" + updated.placeSlug);
    }
    revalidatePath("/places");
    revalidatePath("/admin/reviews");
    revalidatePath("/admin");

    return { success: true, review: updated };
  } catch (err: any) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Lỗi kiểm duyệt đánh giá."
    };
  }
}
