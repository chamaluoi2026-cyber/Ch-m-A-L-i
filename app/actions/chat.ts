"use server";

import {
  getChatSessions,
  getChatSessionById,
  sendGuestMessage,
  sendStaffMessage,
  type ChatSession,
  type ChatMessage
} from "@/lib/server-store";
import { revalidatePath } from "next/cache";

export async function getChatSessionsAction(): Promise<ChatSession[]> {
  return getChatSessions();
}

export async function getChatSessionAction(sessionId: string): Promise<ChatSession | null> {
  return getChatSessionById(sessionId);
}

export async function sendGuestMessageAction(data: {
  sessionId?: string;
  guestName?: string;
  guestPhone?: string;
  text: string;
}): Promise<{ success: boolean; session?: ChatSession; error?: string }> {
  try {
    if (!data.text || !data.text.trim()) {
      return { success: false, error: "Nội dung tin nhắn không được để trống." };
    }
    const result = sendGuestMessage(data);
    revalidatePath("/admin/chat");
    return { success: true, session: result.session };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Không thể gửi tin nhắn." };
  }
}

export async function sendStaffMessageAction(
  sessionId: string,
  text: string
): Promise<{ success: boolean; message?: ChatMessage; error?: string }> {
  try {
    if (!sessionId || !text.trim()) {
      return { success: false, error: "Thiếu thông tin tin nhắn." };
    }
    const result = sendStaffMessage(sessionId, text);
    revalidatePath("/admin/chat");
    return result;
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Không thể gửi phản hồi." };
  }
}
