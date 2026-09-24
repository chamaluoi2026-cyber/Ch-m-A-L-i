"use server";

import {
  generateLocalProductContent,
  generateProductContentWithGemini,
  type GenerateProductAiInput,
  type GeneratedProductAiOutput
} from "@/lib/ai/product-content-generator";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

export async function generateProductAiAction(
  input: GenerateProductAiInput
): Promise<{
  success: boolean;
  data?: GeneratedProductAiOutput;
  error?: string;
}> {
  try {
    if (!input.name || !input.name.trim()) {
      return { success: false, error: "Vui lòng nhập tên sản phẩm để AI có thể phân tích." };
    }

    // 1. Thử gọi Google Gemini AI nếu có API Key
    if (GEMINI_API_KEY && GEMINI_API_KEY.length > 10) {
      try {
        const geminiResult = await generateProductContentWithGemini(input, GEMINI_API_KEY);
        if (geminiResult && geminiResult.description) {
          return { success: true, data: geminiResult };
        }
      } catch (geminiErr) {
        console.warn("[AI_WRITER] Gemini API error/busy, falling back to local expert engine:", geminiErr);
      }
    }

    // 2. Fallback sang Local Domain Engine A Lưới (hoạt động 100% offline, chuẩn văn hóa bản địa)
    const localResult = generateLocalProductContent(input);
    return { success: true, data: localResult };
  } catch (err: any) {
    console.error("[AI_WRITER] Action failure:", err);
    // Vẫn fallback an toàn tuyệt đối
    const fallback = generateLocalProductContent(input);
    return { success: true, data: fallback };
  }
}
