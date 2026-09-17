"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Headphones,
  Loader2,
  MessageCircle,
  Phone,
  Send,
  User,
  X
} from "lucide-react";
import {
  getChatSessionAction,
  sendGuestMessageAction
} from "@/app/actions/chat";

type Message = {
  id: string;
  role: "staff" | "guest";
  text: string;
  createdAt: string;
};

const STORAGE_KEY = "cham_aluoi_chat_session_id";
const GUEST_INFO_KEY = "cham_aluoi_guest_info";
const MESSAGES_CACHE_KEY = "cham_aluoi_chat_messages_cache";
const CHAT_OPEN_KEY = "cham_aluoi_chat_open_state";

const DEFAULT_WELCOME_MSG: Message = {
  id: "welcome-1",
  role: "staff",
  text: "Xin chào quý khách! Em là nhân viên hỗ trợ du lịch Chạm A Lưới. Quý khách cần tư vấn điểm đến, homestay hay nhận mã ưu đãi giảm giá cứ nhắn em nhé!",
  createdAt: new Date().toISOString()
};

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(STORAGE_KEY);
  if (!id) {
    id = `chat-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
  }
  return id;
}

export function CustomerChatbox() {
  const [open, setOpen] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [showInfoInputs, setShowInfoInputs] = useState(false);
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<Message[]>([DEFAULT_WELCOME_MSG]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // 1. Khởi tạo: Nạp sessionId, thông tin khách và lịch sử tin nhắn từ LocalStorage ngay khi tải trang
  useEffect(() => {
    if (typeof window !== "undefined") {
      const activeSessionId = getOrCreateSessionId();
      setSessionId(activeSessionId);

      // Đọc trạng thái mở chatbox khi chuyển trang
      const savedOpenState = sessionStorage.getItem(CHAT_OPEN_KEY);
      if (savedOpenState === "true") {
        setOpen(true);
      }

      // Nạp thông tin khách đã nhập trước đó
      try {
        const savedInfo = localStorage.getItem(GUEST_INFO_KEY);
        if (savedInfo) {
          const parsed = JSON.parse(savedInfo);
          if (parsed.name) setGuestName(parsed.name);
          if (parsed.phone) setGuestPhone(parsed.phone);
        }
      } catch {
        // ignore
      }

      // Nạp tin nhắn đã lưu trước từ LocalStorage để hiển thị tức thì (Zero-latency)
      try {
        const cached = localStorage.getItem(MESSAGES_CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setMessages(parsed);
          }
        }
      } catch {
        // ignore
      }

      // Đồng bộ ngay với Database Supabase PostgreSQL ở chế độ nền
      if (activeSessionId) {
        syncMessagesFromDatabase(activeSessionId);
      }
    }
  }, []);

  // Hàm đồng bộ tin nhắn từ Database PostgreSQL (Supabase)
  async function syncMessagesFromDatabase(targetSessionId: string) {
    if (!targetSessionId) return;
    try {
      const res = await fetch(`/api/chat?sessionId=${targetSessionId}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.session && Array.isArray(data.session.messages) && data.session.messages.length > 0) {
          setMessages(data.session.messages);
          try {
            localStorage.setItem(MESSAGES_CACHE_KEY, JSON.stringify(data.session.messages));
          } catch {
            // ignore
          }
          return;
        }
      }

      // Fallback Server Action nếu API route bận
      const session = await getChatSessionAction(targetSessionId);
      if (session && Array.isArray(session.messages) && session.messages.length > 0) {
        setMessages(session.messages);
        try {
          localStorage.setItem(MESSAGES_CACHE_KEY, JSON.stringify(session.messages));
        } catch {
          // ignore
        }
      }
    } catch (err) {
      console.error("[CHAT_SYNC_ERR]", err);
    }
  }

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  // Polling định kỳ lấy phản hồi của Admin khi đang mở hộp chat
  useEffect(() => {
    if (!open || !sessionId) return;

    // Fetch ngay khi người dùng mở hộp chat
    syncMessagesFromDatabase(sessionId);

    // Lắng nghe phản hồi từ Admin mỗi 3.5 giây
    const timer = setInterval(() => {
      syncMessagesFromDatabase(sessionId);
    }, 3500);

    return () => clearInterval(timer);
  }, [open, sessionId]);

  // Lưu trạng thái mở/đóng vào SessionStorage khi người dùng click
  const handleToggleOpen = (newOpen: boolean) => {
    setOpen(newOpen);
    if (typeof window !== "undefined") {
      sessionStorage.setItem(CHAT_OPEN_KEY, String(newOpen));
    }
  };

  // Gửi tin nhắn mới
  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isSending) return;

    const currentSessionId = sessionId || getOrCreateSessionId();
    if (!sessionId) setSessionId(currentSessionId);

    // Lưu thông tin khách hàng nếu có nhập
    if (guestName || guestPhone) {
      try {
        localStorage.setItem(
          GUEST_INFO_KEY,
          JSON.stringify({ name: guestName, phone: guestPhone })
        );
      } catch {
        // ignore
      }
    }

    const tempGuestMsg: Message = {
      id: `temp-${Date.now()}`,
      role: "guest",
      text: trimmed,
      createdAt: new Date().toISOString()
    };

    // Optimistic UI: Hiển thị ngay lập tức trên màn hình
    const updatedMessages = [...messages, tempGuestMsg];
    setMessages(updatedMessages);
    setMessage("");
    setIsSending(true);

    try {
      localStorage.setItem(MESSAGES_CACHE_KEY, JSON.stringify(updatedMessages));
    } catch {
      // ignore
    }

    try {
      // Lưu vào Database PostgreSQL qua API /api/chat
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: currentSessionId,
          guestName: guestName.trim() || "Khách truy cập",
          guestPhone: guestPhone.trim() || undefined,
          text: trimmed,
          role: "guest"
        })
      });

      const data = await res.json();
      if (data.success && data.session) {
        if (Array.isArray(data.session.messages)) {
          setMessages(data.session.messages);
          try {
            localStorage.setItem(MESSAGES_CACHE_KEY, JSON.stringify(data.session.messages));
          } catch {
            // ignore
          }
        }
      } else {
        // Fallback Server Action
        const fallbackRes = await sendGuestMessageAction({
          sessionId: currentSessionId,
          guestName: guestName.trim() || "Khách truy cập",
          guestPhone: guestPhone.trim() || undefined,
          text: trimmed
        });
        if (fallbackRes.success && fallbackRes.session?.messages) {
          setMessages(fallbackRes.session.messages);
          try {
            localStorage.setItem(MESSAGES_CACHE_KEY, JSON.stringify(fallbackRes.session.messages));
          } catch {
            // ignore
          }
        }
      }
    } catch (err) {
      console.error("Không thể lưu tin nhắn vào Database:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <aside className="fixed bottom-5 right-5 z-[60]" aria-label="Chat hỗ trợ khách hàng">
      {open ? (
        <section className="mb-4 flex h-[520px] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden rounded-3xl border border-forest/15 bg-white shadow-2xl transition-all">
          {/* Header */}
          <header className="flex items-center justify-between bg-forest px-5 py-4 text-white">
            <div className="flex items-center gap-3">
              <div className="relative grid size-10 place-items-center rounded-full bg-white/20">
                <Headphones className="size-5" aria-hidden="true" />
                <span className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-400 ring-2 ring-forest" />
              </div>
              <div>
                <strong className="block text-sm font-bold">Tư vấn Chạm A Lưới</strong>
                <p className="flex items-center gap-1.5 text-[11px] text-white/80">
                  <span className="size-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  Đang trực tuyến • Sẵn sàng hỗ trợ
                </p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Đóng chat"
              onClick={() => handleToggleOpen(false)}
              className="rounded-full p-2 text-white/80 hover:bg-white/15 hover:text-white transition"
            >
              <X className="size-5" aria-hidden="true" />
            </button>
          </header>

          {/* Guest info toggle (optional name/phone) */}
          <div className="border-b border-black/5 bg-beige/40 px-4 py-2">
            <button
              type="button"
              onClick={() => setShowInfoInputs(!showInfoInputs)}
              className="flex w-full items-center justify-between text-[11px] font-semibold text-ink/70 hover:text-forest"
            >
              <span>
                {guestPhone
                  ? `SĐT liên hệ: ${guestPhone} ${guestName ? `(${guestName})` : ""}`
                  : "💡 Để lại Tên & SĐT để được gọi lại tư vấn chi tiết"}
              </span>
              {showInfoInputs ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
            </button>

            {showInfoInputs && (
              <div className="mt-2 grid grid-cols-2 gap-2 pb-1">
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 size-3.5 text-ink/40" />
                  <input
                    type="text"
                    placeholder="Tên của bạn"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full rounded-xl bg-white pl-8 pr-2 py-1.5 text-xs text-ink border border-black/10 focus:outline-none focus:border-forest"
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-2.5 top-2.5 size-3.5 text-ink/40" />
                  <input
                    type="tel"
                    placeholder="Số điện thoại / Zalo"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full rounded-xl bg-white pl-8 pr-2 py-1.5 text-xs text-ink border border-black/10 focus:outline-none focus:border-forest"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Messages list */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-[#F7F8F7] p-4">
            {messages.map((item, index) => {
              const isGuest = item.role === "guest";
              const timeStr = item.createdAt
                ? new Date(item.createdAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit"
                  })
                : "";

              return (
                <div
                  key={item.id || `${item.role}-${index}`}
                  className={`flex flex-col ${isGuest ? "items-end" : "items-start"}`}
                >
                  <div
                    className={
                      isGuest
                        ? "max-w-[85%] rounded-2xl rounded-tr-sm bg-forest px-4 py-2.5 text-xs leading-5 text-white shadow-sm"
                        : "max-w-[85%] rounded-2xl rounded-tl-sm bg-white border border-black/5 px-4 py-2.5 text-xs leading-5 text-ink shadow-sm"
                    }
                  >
                    {item.text}
                  </div>
                  {timeStr && (
                    <span className="mt-1 text-[10px] text-ink/40 px-1">
                      {isGuest ? "Bạn • " : "Nhân viên • "}
                      {timeStr}
                    </span>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick prompt suggestions */}
          <div className="flex gap-1.5 overflow-x-auto bg-white px-3 py-2 border-t border-black/5 no-scrollbar">
            {[
              "Tư vấn tour 2N1Đ",
              "Giá phòng homestay?",
              "Đặc sản có gì ngon?",
              "Lấy mã giảm giá"
            ].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setMessage(tag)}
                className="shrink-0 rounded-full bg-beige/80 px-2.5 py-1 text-[11px] font-medium text-ink/80 hover:bg-forest hover:text-white transition"
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 border-t border-black/10 bg-white p-3">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Nhập tin nhắn hoặc câu hỏi..."
              className="min-w-0 flex-1 rounded-full bg-beige/60 px-4 py-2.5 text-xs text-ink placeholder:text-ink/50 focus:outline-none focus:ring-2 focus:ring-forest/30"
            />
            <button
              type="submit"
              disabled={isSending || !message.trim()}
              aria-label="Gửi tin nhắn"
              className="grid size-10 place-items-center rounded-full bg-forest text-white hover:bg-ink transition disabled:opacity-50 shrink-0"
            >
              {isSending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Send className="size-4" aria-hidden="true" />
              )}
            </button>
          </form>
        </section>
      ) : null}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => handleToggleOpen(!open)}
        className="group relative ml-auto flex items-center gap-3 rounded-full bg-forest px-5 py-3.5 font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-ink hover:shadow-xl"
        aria-label="Mở chat hỗ trợ khách hàng"
      >
        <span className="relative">
          <MessageCircle className="size-5 transition group-hover:scale-110" aria-hidden="true" />
          <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-emerald-400 ring-2 ring-forest" />
        </span>
        <span className="text-sm">Tư vấn trực tuyến</span>
      </button>
    </aside>
  );
}
