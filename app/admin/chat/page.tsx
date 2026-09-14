"use client";

import { useEffect, useRef, useState } from "react";
import {
  getChatSessionsAction,
  sendStaffMessageAction
} from "@/app/actions/chat";
import type { ChatSession } from "@/lib/server-store";
import {
  CheckCheck,
  Headphones,
  Loader2,
  MessageSquare,
  Phone,
  Search,
  Send,
  Sparkles
} from "lucide-react";

export default function AdminChatPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [search, setSearch] = useState("");
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const loadSessions = async (keepSelection = true) => {
    try {
      const data = await getChatSessionsAction();
      setSessions(data);
      if (!keepSelection || !selectedId) {
        if (data.length > 0 && !selectedId) {
          setSelectedId(data[0].id);
        }
      }
    } catch (err) {
      console.error("Lỗi tải hội thoại chat:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions(false);
    const interval = setInterval(() => {
      loadSessions(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedId, sessions]);

  const selectedSession = sessions.find((s) => s.id === selectedId) || sessions[0] || null;

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession || !replyText.trim() || isSending) return;

    const textToSend = replyText.trim();
    setReplyText("");
    setIsSending(true);

    try {
      const res = await sendStaffMessageAction(selectedSession.id, textToSend);
      if (res.success) {
        await loadSessions(true);
      }
    } catch (err) {
      console.error("Lỗi gửi tin nhắn:", err);
    } finally {
      setIsSending(false);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      (s.guestName || "").toLowerCase().includes(search.toLowerCase()) ||
      (s.guestPhone || "").includes(search) ||
      (s.lastMessage || "").toLowerCase().includes(search.toLowerCase());
    if (filterUnreadOnly) {
      return matchesSearch && s.unreadByAdmin;
    }
    return matchesSearch;
  });

  const quickReplies = [
    "Dạ chào bạn, Chạm A Lưới có thể hỗ trợ thông tin gì cho bạn ạ?",
    "Hiện tại thác A Nôr nước rất trong và mát lành, rất đẹp để tắm suối và trải nghiệm.",
    "Bên mình có tour ghép trải nghiệm 2N1Đ hoặc xe đưa đón từ Huế lên A Lưới ạ.",
    "Dạ bạn muốn đi vào ngày nào và dự kiến đoàn bao nhiêu người để bên mình báo giá ưu đãi nhất ạ?"
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink flex items-center gap-2.5">
            <span className="p-2 rounded-2xl bg-forest text-white">
              <Headphones className="size-6" />
            </span>
            Trung tâm Tư vấn & Live Chat Khách hàng
          </h1>
          <p className="text-xs text-ink/60 mt-1">
            Đồng bộ tin nhắn 2 chiều thời gian thực giữa Web Khách hàng (Port 3000) và Ban Quản trị (Port 3001)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1.5 text-xs font-bold">
            <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
            Live Polling (3s/lần)
          </span>
          <span className="rounded-2xl bg-forest/10 px-4 py-2 text-xs font-bold text-forest">
            {sessions.length} phiên trò chuyện
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px] bg-white rounded-3xl border border-black/5 shadow-card overflow-hidden">
        <div className="lg:col-span-4 border-r border-black/5 flex flex-col h-full bg-[#FAFBFA]">
          <div className="p-4 border-b border-black/5 space-y-3 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-ink/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm theo tên, SĐT, nội dung..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-beige/60 border border-black/10 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFilterUnreadOnly(false)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                  !filterUnreadOnly
                    ? "bg-forest text-white"
                    : "bg-black/5 text-ink/70 hover:bg-black/10"
                }`}
              >
                Tất cả ({sessions.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterUnreadOnly(true)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                  filterUnreadOnly
                    ? "bg-forest text-white"
                    : "bg-black/5 text-ink/70 hover:bg-black/10"
                }`}
              >
                Cần trả lời ({sessions.filter((s) => s.unreadByAdmin).length})
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-black/5">
            {isLoading ? (
              <div className="p-8 text-center text-xs text-ink/50 flex flex-col items-center gap-2">
                <Loader2 className="size-6 animate-spin text-forest" />
                Đang tải dữ liệu hội thoại...
              </div>
            ) : filteredSessions.length === 0 ? (
              <div className="p-8 text-center text-xs text-ink/50">
                Chưa có cuộc trò chuyện nào phù hợp.
              </div>
            ) : (
              filteredSessions.map((session) => {
                const isSelected = selectedSession?.id === session.id;
                const timeStr = session.updatedAt
                  ? new Date(session.updatedAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit"
                    })
                  : "";

                return (
                  <button
                    key={session.id}
                    type="button"
                    onClick={() => setSelectedId(session.id)}
                    className={`w-full text-left p-4 transition flex items-start gap-3 relative ${
                      isSelected
                        ? "bg-forest/10 border-l-4 border-forest"
                        : "hover:bg-black/[0.02]"
                    }`}
                  >
                    <div className="size-10 rounded-full bg-forest/20 text-forest font-black text-xs grid place-items-center shrink-0">
                      {session.guestName ? session.guestName.charAt(0).toUpperCase() : "K"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-extrabold text-ink text-xs truncate">
                          {session.guestName || "Khách ẩn danh"}
                        </p>
                        <span className="text-[10px] text-ink/40 shrink-0 font-medium">
                          {timeStr}
                        </span>
                      </div>
                      {session.guestPhone && (
                        <p className="text-[11px] text-forest font-semibold flex items-center gap-1 mt-0.5">
                          <Phone className="size-3" /> {session.guestPhone}
                        </p>
                      )}
                      <p className="text-xs text-ink/60 truncate mt-1">
                        {session.lastMessage || "..."}
                      </p>
                    </div>
                    {session.unreadByAdmin && (
                      <span className="size-2.5 rounded-full bg-clay shrink-0 mt-1" title="Khách đang chờ bạn trả lời" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col h-full bg-white">
          {selectedSession ? (
            <>
              <div className="p-4 border-b border-black/5 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-forest text-white font-bold grid place-items-center text-sm">
                    {selectedSession.guestName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="font-extrabold text-sm text-ink flex items-center gap-2">
                      {selectedSession.guestName}
                      {selectedSession.unreadByAdmin ? (
                        <span className="rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 text-[10px] font-bold">
                          Chờ tư vấn
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                          Đã phản hồi
                        </span>
                      )}
                    </h2>
                    <p className="text-[11px] text-ink/50">
                      Mã phiên: <span className="font-mono">{selectedSession.id}</span>
                    </p>
                  </div>
                </div>

                {selectedSession.guestPhone && (
                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${selectedSession.guestPhone}`}
                      className="px-3 py-1.5 rounded-xl border border-black/10 text-xs font-bold text-ink hover:bg-black/5 transition flex items-center gap-1.5"
                    >
                      <Phone className="size-3.5 text-forest" /> Gọi điện
                    </a>
                    <a
                      href={`https://zalo.me/${selectedSession.guestPhone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-[#0068FF] text-white text-xs font-bold hover:bg-blue-600 transition flex items-center gap-1.5"
                    >
                      Nhắn Zalo
                    </a>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F8F9F8]">
                {selectedSession.messages && selectedSession.messages.length > 0 ? (
                  selectedSession.messages.map((msg, idx) => {
                    const isStaff = msg.role === "staff";
                    const time = msg.createdAt
                      ? new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit"
                        })
                      : "";

                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex flex-col ${isStaff ? "items-end" : "items-start"}`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-3 rounded-2xl text-xs leading-relaxed shadow-sm ${
                            isStaff
                              ? "bg-forest text-white rounded-tr-sm"
                              : "bg-white text-ink border border-black/5 rounded-tl-sm"
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="mt-1 text-[10px] text-ink/40 px-1 flex items-center gap-1">
                          {isStaff ? "Bạn (Admin)" : selectedSession.guestName} • {time}
                          {isStaff && <CheckCheck className="size-3 text-emerald-600" />}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-xs text-ink/40 py-10">
                    Chưa có tin nhắn nào trong phiên trò chuyện này.
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-3 border-t border-black/5 bg-white">
                <p className="text-[11px] font-bold text-ink/60 mb-2 flex items-center gap-1">
                  <Sparkles className="size-3 text-clay" /> Tin nhắn mẫu trả lời nhanh:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quickReplies.map((reply, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setReplyText(reply)}
                      className="px-2.5 py-1 rounded-lg bg-beige hover:bg-forest hover:text-white text-[11px] font-medium text-ink/80 transition text-left"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              </div>

              <form
                onSubmit={handleSendReply}
                className="p-4 border-t border-black/5 bg-white flex items-center gap-3"
              >
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Nhập nội dung tư vấn trả lời khách hàng..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-beige/60 border border-black/10 text-xs text-ink placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
                <button
                  type="submit"
                  disabled={isSending || !replyText.trim()}
                  className="px-5 py-3 rounded-2xl bg-forest hover:bg-forest/90 text-white text-xs font-bold transition flex items-center gap-2 disabled:opacity-50"
                >
                  {isSending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  Gửi phản hồi
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-ink/40 p-8">
              <MessageSquare className="size-12 stroke-[1.5] mb-3 text-ink/20" />
              <p className="text-sm font-bold">Chưa chọn phiên trò chuyện</p>
              <p className="text-xs mt-1">Chọn một khách hàng ở danh sách bên trái để bắt đầu tư vấn.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
