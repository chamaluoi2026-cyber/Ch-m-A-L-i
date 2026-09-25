import { getSiteSettingsAsync } from "@/lib/server-store";

const DEFAULT_BOT_TOKEN = "8821903735:AAHaucbQqL-_HlKAW5occiEKSaWKzxEyNxc";
const DEFAULT_CHAT_ID = "7051477688";

/**
 * Mã hóa an toàn các ký tự đặc biệt (&, <, >, ") để không bị lỗi 400 Bad Request từ Telegram HTML Parser
 */
export function escapeHtml(str: string | number | null | undefined): string {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Bóc tách toàn bộ thẻ HTML để chuyển tin nhắn về dạng văn bản thuần (Plain Text) khi cần fallback
 */
export function stripHtml(html: string): string {
  if (!html) return "";
  return String(html)
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

/**
 * Gửi thông báo tức thì về Telegram của Ban quản trị:
 * 1. Thử gửi với định dạng HTML (đẹp, có link và định dạng).
 * 2. Nếu Telegram từ chối (400 Bad Request do lỗi ký tự HTML), tự động bóc HTML và gửi lại dưới dạng Plain Text.
 * 3. Hỗ trợ fallback Token & Chat ID mặc định nếu kết nối cơ sở dữ liệu tạm thời bận.
 */
export async function sendTelegramNotification(message: string): Promise<boolean> {
  try {
    const settings = await getSiteSettingsAsync().catch(() => null);
    const token = settings?.telegramBotToken?.trim() || process.env.TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN;
    const chatId = settings?.telegramChatId?.trim() || process.env.TELEGRAM_CHAT_ID || DEFAULT_CHAT_ID;
    const enabled = settings?.telegramEnabled !== false;

    if (!enabled || !token || !chatId) {
      console.warn("[TELEGRAM_SKIP] Telegram bị tắt hoặc thiếu token/chatId");
      return false;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    // Lần 1: Gửi dạng HTML
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true
      })
    });

    if (res.ok) {
      return true;
    }

    // Lần 2 (Tự phục hồi): Nếu lỗi (thường do thẻ HTML hoặc ký tự lạ), tự động gửi Plain Text
    const errData = await res.json().catch(() => null);
    console.warn("[TELEGRAM_HTML_REJECTED]", errData?.description || res.statusText, "-> Tự động gửi lại Plain Text");

    await new Promise((r) => setTimeout(r, 250));
    const plainText = stripHtml(message);

    const retryRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: plainText,
        disable_web_page_preview: true
      })
    });

    if (!retryRes.ok) {
      const retryErr = await retryRes.json().catch(() => null);
      console.error("[TELEGRAM_RETRY_ERR]", retryErr);
      return false;
    }

    return true;
  } catch (err) {
    console.error("[TELEGRAM_NOTIFICATION_ERR]", err);
    return false;
  }
}
