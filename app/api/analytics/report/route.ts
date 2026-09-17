import { NextResponse } from "next/server";
import { generateAnalyticsData, renderHtmlReport } from "@/lib/analytics-report";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get("download") === "true";

    const data = await generateAnalyticsData();
    const html = renderHtmlReport(data);

    const todayStr = new Date().toISOString().split("T")[0];
    const headers: Record<string, string> = {
      "Content-Type": "text/html; charset=utf-8"
    };

    if (isDownload) {
      headers["Content-Disposition"] = `attachment; filename="Bao-Cao-Kinh-Doanh-Cham-A-Luoi-${todayStr}.html"`;
    }

    return new NextResponse(html, {
      status: 200,
      headers
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi tạo báo cáo phân tích" },
      { status: 500 }
    );
  }
}
