import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json();

    const trimmedKey = typeof apiKey === "string" ? apiKey.trim() : "";
    if (!trimmedKey) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập Google Gemini API Key để kiểm tra." },
        { status: 400 }
      );
    }

    // Thử nghiệm gọi Gemini 2.5 Flash, nếu cần thì fallback sang Gemini 1.5 Flash
    let model = "gemini-2.5-flash";
    let url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${trimmedKey}`;

    let res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: "Bạn là Trợ lý Chạm A Lưới. Hãy phản hồi đúng 1 câu ngắn gọn: 'Kết nối Google Gemini AI thành công!'"
              }
            ]
          }
        ]
      })
    });

    // Nếu model 2.5 chưa khả dụng, thử fallback sang gemini-1.5-flash
    if (!res.ok && res.status === 404) {
      model = "gemini-1.5-flash";
      url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${trimmedKey}`;
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Bạn là Trợ lý Chạm A Lưới. Hãy phản hồi đúng 1 câu ngắn gọn: 'Kết nối Google Gemini AI thành công!'"
                }
              ]
            }
          ]
        })
      });
    }

    if (res.ok) {
      const data = await res.json();
      const replyText = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "Kết nối Google Gemini AI thành công!";
      return NextResponse.json({
        success: true,
        model,
        message: replyText
      });
    } else {
      let errorMessage = "Không thể xác thực khóa Google Gemini API.";
      try {
        const errorData = await res.json();
        if (errorData?.error?.message) {
          errorMessage = errorData.error.message;
        }
      } catch {}

      if (res.status === 400 || res.status === 403) {
        errorMessage = `API Key không hợp lệ hoặc không có quyền truy cập (${errorMessage}). Vui lòng kiểm tra lại tại Google AI Studio.`;
      } else if (res.status === 429) {
        errorMessage = "Đã vượt hạn mức yêu cầu (Rate Limit) của Google Gemini. Vui lòng thử lại sau ít phút.";
      }

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 400 }
      );
    }
  } catch (err: any) {
    console.error("[TEST_GEMINI_API_ERR]", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Lỗi kết nối tới Google Generative Language API." },
      { status: 500 }
    );
  }
}
