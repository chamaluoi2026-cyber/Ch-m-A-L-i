import { NextResponse } from "next/server";
import { getAdminSidebarBadgeCounts } from "@/lib/admin-badges";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const badges = await getAdminSidebarBadgeCounts();
    return NextResponse.json({ success: true, badges });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Lỗi khi lấy dữ liệu thông báo",
        badges: {
          bookings: 0,
          leads: 0,
          chat: 0,
          reviews: 0,
          payments: 0,
          notifications: 0
        }
      },
      { status: 500 }
    );
  }
}
