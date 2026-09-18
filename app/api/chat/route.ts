import { NextRequest, NextResponse } from "next/server";
import { type ChatSession, type ChatMessage } from "@/lib/server-store";
import { revalidatePath } from "next/cache";
import { sendTelegramNotification } from "@/lib/notification/telegram";
import { generateIndigenousAIResponse } from "@/lib/ai/indigenous-chat-bot";

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

// Tự động lưu Lead khách hàng vào leads_store khi phát hiện có Số Điện Thoại
async function saveLeadFromChat(phone: string, name: string, chatText: string, sessionId: string) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/system_store?id=eq.leads_store&select=data`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      cache: "no-store"
    });
    let leads: any[] = [];
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows[0]?.data)) {
        leads = rows[0].data;
      }
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const existing = leads.find(l => l.phone && l.phone.replace(/[^0-9]/g, "") === cleanPhone);

    if (!existing) {
      const now = new Date();
      const randomSeq = Math.floor(1000 + Math.random() * 9000);
      const leadId = `LEAD-AL-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${randomSeq}`;
      const newLead = {
        leadId: leadId,
        voucherCode: `CAL-VCH-${Math.floor(10000 + Math.random() * 90000)}`,
        placeSlug: "homestay-a-luoi",
        placeName: "Du lịch cộng đồng Chạm A Lưới",
        businessName: "Chạm A Lưới Platform",
        customerName: name && name !== "Khách truy cập" ? name : "Khách để lại SĐT qua Chat",
        phone: phone,
        expectedDate: new Date(Date.now() + 86400000 * 3).toISOString(),
        guests: 2,
        need: `Để lại SĐT trong Live Chat: "${chatText.slice(0, 120)}"`,
        source: "WEBSITE",
        status: "new",
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
        notes: [
          {
            id: `note-${Date.now()}`,
            content: `Khách để lại SĐT trong Live Chat (Mã phiên: ${sessionId}). Cần gọi lại tư vấn chốt phòng/tour sớm!`,
            authorId: "ai_bot",
            authorName: "Trợ lý AI Bản Địa",
            createdAt: now.toISOString()
          }
        ]
      };
      leads.unshift(newLead);

      await fetch(`${SUPABASE_URL}/rest/v1/system_store`, {
        method: "POST",
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates"
        },
        body: JSON.stringify({
          id: "leads_store",
          data: leads,
          updated_at: now.toISOString()
        })
      });
    }
  } catch (err) {
    console.error("[AUTO_LEAD_SAVE_ERR]", err);
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

// POST /api/chat - Gửi tin nhắn mới kèm Trợ lý AI Bản Địa tự động phản hồi
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, sessionId, guestName, guestPhone, role } = body;

    if (!text || !String(text).trim()) {
      return NextResponse.json({ success: false, error: "Nội dung tin nhắn không được để trống." }, { status: 400 });
    }

    const trimmedText = String(text).trim();
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
        lastMessage: trimmedText,
        updatedAt: now,
        unreadByAdmin: !isStaff,
        messages: [
          {
            id: `msg-welcome`,
            role: "staff",
            text: "Xin chào quý khách! Em là Trợ lý AI bản địa Chạm A Lưới. Em có thể hỗ trợ quý khách về giá phòng homestay, đặc sản ẩm thực và lịch trình tour 2N1Đ ạ!",
            createdAt: now
          }
        ]
      };
      currentChats.unshift(session);
    } else {
      if (guestName && guestName !== "Khách truy cập") session.guestName = guestName;
      if (guestPhone) session.guestPhone = guestPhone;
      session.lastMessage = trimmedText;
      session.updatedAt = now;
      if (!isStaff) session.unreadByAdmin = true;
      else session.unreadByAdmin = false;
    }

    // 1. Lưu tin nhắn của khách/nhân viên
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`,
      role: isStaff ? "staff" : "guest",
      text: trimmedText,
      createdAt: now
    };
    session.messages.push(newMsg);

    let aiMsg: ChatMessage | null = null;

    // 2. Nếu là tin nhắn từ khách hàng -> Xử lý AI phản hồi tự động trong 3 giây và phát hiện SĐT
    if (!isStaff) {
      const aiAnalysis = generateIndigenousAIResponse(trimmedText, session.guestName);

      // A. Nếu phát hiện Số Điện Thoại
      if (aiAnalysis.isPhoneDetected && aiAnalysis.detectedPhone) {
        session.guestPhone = aiAnalysis.detectedPhone;

        // Lưu ngay vào danh sách Leads
        await saveLeadFromChat(aiAnalysis.detectedPhone, session.guestName, trimmedText, session.id);

        // Bắn thông báo Telegram Khẩn Cấp
        try {
          const urgentTgMsg = `🔥 <b>KHÁCH ĐÃ ĐỂ LẠI SĐT CẦN GỌI CHỐT NGAY!</b>\n\n` +
            `👤 <b>Khách hàng:</b> ${session.guestName || "Khách quan tâm dịch vụ"}\n` +
            `📞 <b>SĐT / Zalo:</b> <code>${aiAnalysis.detectedPhone}</code>\n` +
            `💬 <b>Tin nhắn khách:</b> "${newMsg.text}"\n` +
            `🏷️ <b>Nhu cầu:</b> Tư vấn Homestay / Tour A Lưới\n` +
            `⏰ <b>Thời gian:</b> ${new Date().toLocaleTimeString("vi-VN")} ${new Date().toLocaleDateString("vi-VN")}\n\n` +
            `👉 <a href="tel:${aiAnalysis.detectedPhone}"><b>📞 BẤM ĐỂ GỌI ĐIỆN NGAY CHO KHÁCH</b></a>\n` +
            `👉 <a href="https://zalo.me/${aiAnalysis.detectedPhone}"><b>💬 NHẮN ZALO CHO KHÁCH</b></a>\n` +
            `👉 <a href="https://chamaluoiadmin.netlify.app/admin/chat"><b>💻 MỞ LIVE CHAT ADMIN</b></a>\n` +
            `──────────────────\n` +
            `👉 <i>Quẹt phải để <b>Trả lời (Reply)</b> tin nhắn này, câu trả lời sẽ gửi thẳng về web của khách!</i>\n` +
            `<code>[SID:${session.id}]</code>`;
          await sendTelegramNotification(urgentTgMsg);
        } catch (e) {
          console.error("[TELEGRAM_URGENT_ERR]", e);
        }
      } else {
        // Bắn thông báo Telegram thông thường
        try {
          const tgMsg = `💬 <b>TIN NHẮN TƯ VẤN MỚI - CHẠM A LƯỚI</b>\n` +
            `👤 <b>Khách:</b> ${session.guestName || "Khách truy cập"}\n` +
            (session.guestPhone ? `📞 <b>SĐT:</b> ${session.guestPhone}\n` : "") +
            `💬 <b>Tin nhắn:</b> "${newMsg.text}"\n` +
            `🤖 <i>Trợ lý AI Bản Địa đã phản hồi sơ bộ.</i>\n` +
            `👉 <a href="https://chamaluoiadmin.netlify.app/admin/chat">Mở hộp chat admin</a>\n` +
            `──────────────────\n` +
            `👉 <i>Quẹt phải để <b>Trả lời (Reply)</b> tin nhắn này, câu trả lời sẽ gửi thẳng về web của khách!</i>\n` +
            `<code>[SID:${session.id}]</code>`;
          await sendTelegramNotification(tgMsg);
        } catch (e) {
          console.error("[TELEGRAM_NORMAL_ERR]", e);
        }
      }

      // B. Tạo tin nhắn phản hồi của Trợ lý AI Bản Địa
      aiMsg = {
        id: `msg-ai-${Date.now()}-${Math.floor(10 + Math.random() * 90)}`,
        role: "staff",
        text: aiAnalysis.replyText,
        createdAt: new Date(Date.now() + 500).toISOString()
      };
      session.messages.push(aiMsg);
      session.lastMessage = aiAnalysis.replyText;
    }

    // Di chuyển session lên đầu danh sách và lưu vào Supabase Cloud
    const updatedChats = [session, ...currentChats.filter(c => c.id !== session!.id)];
    await saveChatsToCloud(updatedChats);

    revalidatePath("/admin/chat");

    return NextResponse.json({
      success: true,
      session,
      message: newMsg,
      aiMessage: aiMsg
    });
  } catch (err: any) {
    console.error("[API_CHAT_ERR]", err);
    return NextResponse.json({ success: false, error: err?.message || "Lỗi gửi tin nhắn." }, { status: 500 });
  }
}
