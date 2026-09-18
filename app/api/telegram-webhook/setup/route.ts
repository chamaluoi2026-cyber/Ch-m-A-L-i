import { NextRequest, NextResponse } from "next/server";
import { getSiteSettingsAsync } from "@/lib/server-store";

export const dynamic = "force-dynamic";

// GET /api/telegram-webhook/setup - Kiểm tra trạng thái Webhook hiện tại
export async function GET() {
  try {
    const settings = await getSiteSettingsAsync();
    const token = settings?.telegramBotToken?.trim();

    if (!token) {
      return NextResponse.json({
        success: false,
        error: "Chưa cấu hình Telegram Bot Token trong hệ thống."
      });
    }

    const res = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`, {
      cache: "no-store"
    });
    const data = await res.json();

    return NextResponse.json({
      success: true,
      botConfigured: true,
      webhookInfo: data.result || null
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Lỗi kiểm tra Webhook" }, { status: 500 });
  }
}

// POST /api/telegram-webhook/setup - Đăng ký Webhook với máy chủ Telegram
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const settings = await getSiteSettingsAsync();
    const token = settings?.telegramBotToken?.trim();

    if (!token) {
      return NextResponse.json({
        success: false,
        error: "Vui lòng cấu hình Bot Token trước khi kích hoạt Webhook."
      }, { status: 400 });
    }

    let webhookUrl = body?.webhookUrl?.trim();
    if (!webhookUrl) {
      // Tự động suy ra URL từ domain
      const origin = req.nextUrl.origin;
      webhookUrl = `${origin}/api/telegram-webhook`;
    }

    // Đăng ký webhook với Telegram API
    const tgRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: webhookUrl,
        drop_pending_updates: false,
        allowed_updates: ["message", "edited_message"]
      })
    });

    const tgData = await tgRes.json();

    if (tgData.ok) {
      return NextResponse.json({
        success: true,
        message: "Kích hoạt Webhook 2 chiều Telegram thành công!",
        webhookUrl,
        telegramResponse: tgData
      });
    } else {
      return NextResponse.json({
        success: false,
        error: tgData.description || "Telegram từ chối đăng ký Webhook",
        telegramResponse: tgData
      }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Lỗi đăng ký Webhook" }, { status: 500 });
  }
}

// DELETE /api/telegram-webhook/setup - Hủy đăng ký Webhook
export async function DELETE() {
  try {
    const settings = await getSiteSettingsAsync();
    const token = settings?.telegramBotToken?.trim();

    if (!token) {
      return NextResponse.json({ success: false, error: "Chưa cấu hình Token" }, { status: 400 });
    }

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/deleteWebhook`);
    const tgData = await tgRes.json();

    return NextResponse.json({
      success: tgData.ok,
      message: tgData.ok ? "Đã hủy Webhook Telegram thành công" : tgData.description
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Lỗi hủy Webhook" }, { status: 500 });
  }
}
