import { getSiteSettingsAsync } from "@/lib/server-store";

export async function sendTelegramNotification(message: string): Promise<boolean> {
  try {
    const settings = await getSiteSettingsAsync();
    const token = settings?.telegramBotToken?.trim();
    const chatId = settings?.telegramChatId?.trim();
    const enabled = settings?.telegramEnabled !== false;

    if (!enabled || !token || !chatId) {
      return false;
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
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

    return res.ok;
  } catch (err) {
    console.error("[TELEGRAM_NOTIFICATION_ERR]", err);
    return false;
  }
}
