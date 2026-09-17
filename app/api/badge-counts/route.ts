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
          chat: 0,
          leads: 0,
          bookings: 0,
          orders: 0,
          payments: 0,
          reviews: 0,
          vouchers: 0,
          transactions: 0,
          commissions: 0,
          reconciliation: 0,
          notifications: 0
        }
      },
      { status: 500 }
    );
  }
}
