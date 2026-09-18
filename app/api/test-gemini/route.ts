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

    // 1. Kiểm tra API Key và lấy danh sách Model được Google cấp quyền
    let availableModels: string[] = [];
    try {
      const listRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${trimmedKey}`,
        { method: "GET", headers: { "Content-Type": "application/json" } }
      );

      if (!listRes.ok) {
        let errMsg = "Khóa API không hợp lệ.";
        try {
          const errData = await listRes.json();
          if (errData?.error?.message) {
            errMsg = errData.error.message;
          }
        } catch {}

        if (listRes.status === 400 || listRes.status === 403) {
          return NextResponse.json(
            {
              success: false,
              error: `Khóa API không hợp lệ (${errMsg}). Vui lòng kiểm tra lại mã đã sao chép từ Google AI Studio.`
            },
            { status: 400 }
          );
        } else if (listRes.status === 429) {
          return NextResponse.json(
            {
              success: false,
              error: "Đã vượt giới hạn lượt gọi (Rate Limit) của Google Gemini. Vui lòng thử lại sau 1 phút."
            },
            { status: 429 }
          );
        }

        return NextResponse.json(
          { success: false, error: `Google API trả về lỗi: ${errMsg}` },
          { status: 400 }
        );
      }

      const listData = await listRes.json();
      if (Array.isArray(listData?.models)) {
        availableModels = listData.models
          .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
          .map((m: any) => m.name.replace(/^models\//, ""));
      }
    } catch (listErr: any) {
      console.warn("[TEST_GEMINI_LIST_WARN]", listErr?.message);
    }

    // 2. Danh sách model ưu tiên từ cao xuống thấp
    const preferredCandidates = [
      "gemini-2.0-flash",
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash-latest",
      "gemini-1.5-flash-002",
      "gemini-1.5-flash-001",
      "gemini-1.5-flash",
      "gemini-1.5-flash-8b",
      "gemini-2.0-pro-exp-02-05",
      "gemini-1.5-pro",
      "gemini-pro"
    ];

    const modelsToTry: string[] = [];
    for (const pref of preferredCandidates) {
      const match = availableModels.find(m => m === pref || m.includes(pref));
      if (match && !modelsToTry.includes(match)) {
        modelsToTry.push(match);
      }
    }
    // Bổ sung các model còn lại trong availableModels
    for (const m of availableModels) {
      if (!modelsToTry.includes(m)) {
        modelsToTry.push(m);
      }
    }
    // Nếu danh sách vẫn rỗng, fallback về danh sách mặc định
    if (modelsToTry.length === 0) {
      modelsToTry.push(...preferredCandidates);
    }

    // 3. Thử nghiệm gửi prompt kiểm tra
    let lastError = "";
    for (const model of modelsToTry.slice(0, 5)) {
      try {
        const testRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${trimmedKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: "Bạn là Trợ lý Chạm A Lưới. Hãy phản hồi đúng 1 câu ngắn gọn tiếng Việt: 'Kết nối Google Gemini AI thành công!'"
                    }
                  ]
                }
              ]
            })
          }
        );

        if (testRes.ok) {
          const data = await testRes.json();
          const replyText =
            data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ||
            "Kết nối Google Gemini AI thành công!";

          return NextResponse.json({
            success: true,
            model,
            message: replyText
          });
        } else {
          const errData = await testRes.json().catch(() => ({}));
          lastError = errData?.error?.message || `Mã lỗi HTTP ${testRes.status}`;
        }
      } catch (callErr: any) {
        lastError = callErr?.message || "Lỗi kết nối";
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: `Không thể kết nối với mô hình Gemini khả dụng: ${lastError}`
      },
      { status: 400 }
    );
  } catch (err: any) {
    console.error("[TEST_GEMINI_API_ERR]", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Lỗi kết nối tới Google Generative Language API." },
      { status: 500 }
    );
  }
}
