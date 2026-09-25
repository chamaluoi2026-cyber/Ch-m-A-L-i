"use server";

import {
  generateLocalProductContent,
  generateProductContentWithGemini,
  type GenerateProductAiInput,
  type GeneratedProductAiOutput
} from "@/lib/ai/product-content-generator";

import { getSiteSettingsAsync } from "@/lib/server-store";

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

    // 1. Lấy Gemini API Key từ Cloud Site Settings (Supabase) hoặc Env
    let apiKey = process.env.GEMINI_API_KEY?.trim() || process.env.NEXT_PUBLIC_GEMINI_API_KEY?.trim() || "";
    try {
      const settings = await getSiteSettingsAsync().catch(() => null);
      if (settings?.geminiApiKey && settings.geminiApiKey.trim().length > 10) {
        apiKey = settings.geminiApiKey.trim();
      }
    } catch (e) {
      console.warn("[AI_WRITER] Could not load cloud site settings, using env key:", e);
    }

    // 2. Thử gọi Google Gemini AI nếu có API Key
    if (apiKey && apiKey.length > 10) {
      try {
        const geminiResult = await generateProductContentWithGemini(input, apiKey);
        if (geminiResult && geminiResult.description) {
          return { success: true, data: geminiResult };
        }
      } catch (geminiErr) {
        console.warn("[AI_WRITER] Gemini API error/busy, falling back to local expert engine:", geminiErr);
      }
    }

    // 3. Fallback sang Local Domain Engine A Lưới (hoạt động 100% offline, chuẩn văn hóa bản địa chuyên sâu)
    const localResult = generateLocalProductContent(input);
    return { success: true, data: localResult };
  } catch (err: any) {
    console.error("[AI_WRITER] Action failure:", err);
    // Vẫn fallback an toàn tuyệt đối
    const fallback = generateLocalProductContent(input);
    return { success: true, data: fallback };
  }
}
