import { NextRequest, NextResponse } from "next/server";
import { type ChatSession, type ChatMessage, getSiteSettingsAsync } from "@/lib/server-store";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcunfovtwbzfatudejfs.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdW5mb3Z0d2J6ZmF0dWRlamZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NTM5OSwiZXhwIjoyMTA0OTcxMzk5fQ.7QwyRHqGXa6UwgbUNAhlWdmGZqpuS8Cxall2v8j7lMU';

async function fetchChatsFromCloud(): Promise<ChatSession[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/system_store?id=eq.chats_store&select=data`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      cache: "no-store"
    });
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows[0]?.data)) {
        return rows[0].data as ChatSession[];
      }
    }
  } catch (e) {
    console.error("[WEBHOOK_FETCH_CHATS_ERR]", e);
  }
  return [];
}

async function saveChatsToCloud(chats: ChatSession[]): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/system_store`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates"
      },
      body: JSON.stringify({
        id: "chats_store",
        data: chats,
        updated_at: new Date().toISOString()
      })
    });
    return res.ok;
  } catch (e) {
    console.error("[WEBHOOK_SAVE_CHATS_ERR]", e);
    return false;
  }
}

async function sendTelegramReply(token: string, chatId: number | string, replyToMsgId: number, text: string) {
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        reply_to_message_id: replyToMsgId,
        text,
        parse_mode: "HTML"
      })
    });
    if (!res.ok) {
      const plain = text.replace(/<[^>]+>/g, "");
      await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          reply_to_message_id: replyToMsgId,
          text: plain
        })
      });
    }
  } catch (err) {
    console.error("[TELEGRAM_CONFIRM_ERR]", err);
  }
}

export async function GET() {
  return NextResponse.json({
    status: "active",
    name: "Telegram 2-Way Chat Webhook - Cham A Luoi",
    timestamp: new Date().toISOString()
  });
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // Kiểm tra tin nhắn Telegram hợp lệ
    const message = update?.message || update?.edited_message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const replyTo = message.reply_to_message;
    const staffReplyText = message.text.trim();
    const chatId = message.chat?.id;
    const msgId = message.message_id;

    // Chỉ xử lý nếu nhân viên quẹt phải Trả Lời (Reply) vào một tin nhắn trước đó
    if (!replyTo) {
      return NextResponse.json({ ok: true, ignored: "not_a_reply" });
    }

    const originalText = replyTo.text || replyTo.caption || "";

    // Trích xuất sessionId từ thẻ [SID:chat-xxx] hoặc định dạng tương đương
    let sessionId: string | null = null;
    const sidMatch = originalText.match(/\[SID:(chat-[\w-]+)\]/i);
    if (sidMatch && sidMatch[1]) {
      sessionId = sidMatch[1];
    } else {
      const altMatch = originalText.match(/(chat-\d+-\d+)/i);
      if (altMatch && altMatch[1]) {
        sessionId = altMatch[1];
      }
    }

    if (!sessionId) {
      return NextResponse.json({ ok: true, ignored: "no_session_id_found" });
    }

    const now = new Date().toISOString();
    const currentChats = await fetchChatsFromCloud();
    const sessionIndex = currentChats.findIndex(c => c.id === sessionId);

    if (sessionIndex === -1) {
      console.warn(`[WEBHOOK] Không tìm thấy phiên chat với ID: ${sessionId}`);
      return NextResponse.json({ ok: true, error: "session_not_found" });
    }

    const session = currentChats[sessionIndex];
    const staffName = message.from?.first_name || message.from?.username || "Nhân viên Chạm A Lưới";

    // Tạo tin nhắn mới của Nhân viên gửi về web
    const staffMsg: ChatMessage = {
      id: `msg-tg-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`,
      role: "staff",
      text: staffReplyText,
      createdAt: now
    };

    session.messages.push(staffMsg);
    session.lastMessage = staffReplyText;
    session.updatedAt = now;
    session.unreadByAdmin = false;

    // Đưa session lên đầu danh sách và lưu vào Database Supabase
    currentChats.splice(sessionIndex, 1);
    currentChats.unshift(session);
    await saveChatsToCloud(currentChats);

    revalidatePath("/admin/chat");

    // Gửi tin nhắn xác nhận lại trong Telegram
    const settings = await getSiteSettingsAsync();
    const token = settings?.telegramBotToken?.trim();
    if (token && chatId && msgId) {
      const confirmText = `✅ <i>Đã chuyển câu trả lời tới khách <b>${session.guestName || "trên web"}</b>!</i>`;
      await sendTelegramReply(token, chatId, msgId, confirmText);
    }

    return NextResponse.json({
      ok: true,
      deliveredToWeb: true,
      sessionId,
      guestName: session.guestName
    });
  } catch (err: any) {
    console.error("[TELEGRAM_WEBHOOK_ERR]", err);
    return NextResponse.json({ ok: false, error: err?.message || "Internal error" }, { status: 500 });
  }
}
