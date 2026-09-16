import { NextRequest, NextResponse } from "next/server";
import { type ChatSession, type ChatMessage } from "@/lib/server-store";
import { revalidatePath } from "next/cache";
import { sendTelegramNotification } from "@/lib/notification/telegram";

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
    console.error("[CHATS_CLOUD_FETCH_ERR]", e);
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
    console.error("[CHATS_CLOUD_SAVE_ERR]", e);
    return false;
  }
}

// GET /api/chat - Lấy phiên chat hoặc tất cả phiên chat
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    const allChats = await fetchChatsFromCloud();

    if (sessionId) {
      const session = allChats.find(c => c.id === sessionId);
      return NextResponse.json({ success: true, session: session || null });
    }

    return NextResponse.json({ success: true, sessions: allChats });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/chat - Gửi tin nhắn mới (Khách gửi hoặc Nhân viên phản hồi)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, sessionId, guestName, guestPhone, role } = body;

    if (!text || !String(text).trim()) {
      return NextResponse.json({ success: false, error: "Nội dung tin nhắn không được để trống." }, { status: 400 });
    }

    const now = new Date().toISOString();
    const isStaff = role === "staff";
    const currentChats = await fetchChatsFromCloud();

    let session = sessionId ? currentChats.find(c => c.id === sessionId) : undefined;

    if (!session) {
      const newSessionId = sessionId || `chat-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
      session = {
        id: newSessionId,
        guestName: guestName || "Khách truy cập",
        guestPhone: guestPhone || "",
        lastMessage: String(text).trim(),
        updatedAt: now,
        unreadByAdmin: !isStaff,
        messages: [
          {
            id: `msg-welcome`,
            role: "staff",
            text: "Xin chào quý khách! Đội ngũ Chạm A Lưới có thể hỗ trợ tư vấn điểm đến, lịch trình hoặc homestay cho bạn.",
            createdAt: now
          }
        ]
      };
      currentChats.unshift(session);
    } else {
      if (guestName && guestName !== "Khách truy cập") session.guestName = guestName;
      if (guestPhone) session.guestPhone = guestPhone;
      session.lastMessage = String(text).trim();
      session.updatedAt = now;
      if (!isStaff) session.unreadByAdmin = true;
      else session.unreadByAdmin = false;
    }

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`,
      role: isStaff ? "staff" : "guest",
      text: String(text).trim(),
      createdAt: now
    };

    session.messages.push(newMsg);

    // Di chuyển session lên đầu danh sách
    const updatedChats = [session, ...currentChats.filter(c => c.id !== session!.id)];
    await saveChatsToCloud(updatedChats);

    // Gửi thông báo Telegram nếu là khách hàng gửi tin nhắn
    if (!isStaff) {
      try {
        const tgMsg = `💬 <b>TIN NHẮN HỖ TRỢ MỚI - CHẠM A LƯỚI</b>\n` +
          `👤 <b>Khách:</b> ${session.guestName || "Khách truy cập"}\n` +
          (session.guestPhone ? `📞 <b>SĐT:</b> ${session.guestPhone}\n` : "") +
          `💬 <b>Tin nhắn:</b> "${newMsg.text}"\n` +
          `👉 <a href="https://chamaluoiadmin.netlify.app/admin/chat">Mở hộp chat phản hồi ngay</a>`;
        await sendTelegramNotification(tgMsg);
      } catch {}
    }

    revalidatePath("/admin/chat");

    return NextResponse.json({
      success: true,
      session,
      message: newMsg
    });
  } catch (err: any) {
    console.error("[API_CHAT_ERR]", err);
    return NextResponse.json({ success: false, error: err?.message || "Lỗi gửi tin nhắn." }, { status: 500 });
  }
}
