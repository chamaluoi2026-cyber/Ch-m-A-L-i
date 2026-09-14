import { NextRequest, NextResponse } from "next/server";
import { getAllReviews, updateReviewStatus } from "@/lib/server-store";
import { revalidatePath } from "next/cache";

// GET /api/reviews/[id]
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const all = getAllReviews();
    const review = all.find(r => r.id === id);
    if (!review) {
      return NextResponse.json({ success: false, error: "Không tìm thấy đánh giá." }, { status: 404 });
    }
    return NextResponse.json({ success: true, review });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PATCH /api/reviews/[id] - Duyệt / Từ chối / Ẩn review
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, actor, adminNote } = body;

    if (!["pending", "approved", "rejected", "hidden"].includes(status)) {
      return NextResponse.json({ success: false, error: "Trạng thái không hợp lệ." }, { status: 400 });
    }

    const updated = updateReviewStatus(id, status, actor, adminNote);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Không tìm thấy đánh giá." }, { status: 404 });
    }

    if (updated.placeSlug) {
      revalidatePath("/places/" + updated.placeSlug);
    }
    revalidatePath("/places");
    revalidatePath("/admin/reviews");

    return NextResponse.json({ success: true, review: updated });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
