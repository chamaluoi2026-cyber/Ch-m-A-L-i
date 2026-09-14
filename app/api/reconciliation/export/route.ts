import { NextResponse } from "next/server";
import { getAllCommissions } from "@/lib/server-store";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");
    const placeId = searchParams.get("placeId");
    const status = searchParams.get("status");

    let items = getAllCommissions();

    if (businessId && businessId !== "all") {
      items = items.filter((c) => c.businessId === businessId || c.businessName === businessId);
    }
    if (placeId && placeId !== "all") {
      items = items.filter((c) => c.placeId === placeId || c.placeName === placeId);
    }
    if (status && status !== "all") {
      items = items.filter((c) => c.status === status);
    }

    // Header CSV theo yêu cầu 10: Booking ID, Business, Place, GMV, Commission rate, Commission, Status, Date
    const headers = [
      "Booking ID",
      "Business",
      "Place",
      "GMV (VND)",
      "Commission Rate (%)",
      "Commission Amount (VND)",
      "Status",
      "Date"
    ];

    const rows = items.map((c) => [
      `"${c.bookingId}"`,
      `"${c.businessName.replace(/"/g, '""')}"`,
      `"${c.placeName.replace(/"/g, '""')}"`,
      c.commissionBaseAmount,
      `${c.commissionRate}%`,
      c.commissionAmount,
      `"${c.status}"`,
      `"${c.createdAt.split("T")[0]}"`
    ]);

    // Thêm BOM UTF-8 để mở đúng tiếng Việt trên Excel
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="ChamALuoi-Reconciliation-${new Date().toISOString().split("T")[0]}.csv"`
      }
    });
  } catch (err) {
    return NextResponse.json({ error: "Lỗi xuất báo cáo đối soát" }, { status: 500 });
  }
}
