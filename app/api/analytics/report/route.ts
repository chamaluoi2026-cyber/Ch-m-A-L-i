import { NextResponse } from "next/server";
import { generateDynamicAiReport } from "@/lib/analytics-report";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const isDownload = searchParams.get("download") === "true";
    const prompt = searchParams.get("prompt") || undefined;
    const focus = searchParams.get("focus") || undefined;
    const apiKey = searchParams.get("apiKey") || undefined;

    const html = await generateDynamicAiReport({
      userPrompt: prompt,
      focusArea: focus,
      apiKey: apiKey
    });

    const todayStr = new Date().toISOString().split("T")[0];
    const headers: Record<string, string> = {
      "Content-Type": "text/html; charset=utf-8"
    };

    if (isDownload) {
      headers["Content-Disposition"] = `attachment; filename="Bao-Cao-Chien-Luoc-Cham-A-Luoi-${todayStr}.html"`;
    }

    return new NextResponse(html, {
      status: 200,
      headers
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi tạo báo cáo phân tích AI" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { prompt, focus, apiKey, isDownload } = body;

    const html = await generateDynamicAiReport({
      userPrompt: prompt,
      focusArea: focus,
      apiKey: apiKey
    });

    const todayStr = new Date().toISOString().split("T")[0];
    const headers: Record<string, string> = {
      "Content-Type": "text/html; charset=utf-8"
    };

    if (isDownload) {
      headers["Content-Disposition"] = `attachment; filename="Bao-Cao-Chien-Luoc-Cham-A-Luoi-${todayStr}.html"`;
    }

    return new NextResponse(html, {
      status: 200,
      headers
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi tạo báo cáo phân tích AI" },
      { status: 500 }
    );
  }
}

