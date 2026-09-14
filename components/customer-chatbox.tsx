"use client";

import { FormEvent, useState } from "react";
import { Headphones, MessageCircle, Send, X } from "lucide-react";

type ChatMessage = {
  role: "staff" | "guest";
  text: string;
};

export function CustomerChatbox() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "staff",
      text: "Xin chào! Chạm A Lưới có thể hỗ trợ bạn chọn tour, homestay hoặc sản phẩm địa phương."
    }
  ]);

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    setMessages((current) => [
      ...current,
      { role: "guest", text: trimmed },
      { role: "staff", text: "Cảm ơn bạn. Nhân viên tư vấn sẽ phản hồi trong ít phút. Bạn có thể để lại số điện thoại nếu cần hỗ trợ nhanh." }
    ]);
    setMessage("");
  };

  return (
    <aside className="fixed bottom-5 right-5 z-[60]" aria-label="Chat hỗ trợ khách hàng">
      {open ? (
        <section className="mb-4 w-[min(360px,calc(100vw-2.5rem))] overflow-hidden rounded-3xl border border-forest/10 bg-white shadow-soft">
          <header className="flex items-center justify-between bg-forest px-5 py-4 text-white">
            <span className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-white/15">
                <Headphones className="size-5" aria-hidden="true" />
              </span>
              <span>
                <strong className="block text-sm">Tư vấn Chạm A Lưới</strong>
                <small className="text-white/70">Thường phản hồi trong vài phút</small>
              </span>
            </span>
            <button type="button" aria-label="Đóng chat" onClick={() => setOpen(false)} className="rounded-full p-2 hover:bg-white/15">
              <X className="size-5" aria-hidden="true" />
            </button>
          </header>
          <div className="grid max-h-80 gap-3 overflow-y-auto bg-beige/60 p-4">
            {messages.map((item, index) => (
              <p
                key={`${item.role}-${index}`}
                className={
                  item.role === "guest"
                    ? "ml-auto max-w-[82%] rounded-2xl bg-forest px-4 py-3 text-sm leading-6 text-white"
                    : "mr-auto max-w-[82%] rounded-2xl bg-white px-4 py-3 text-sm leading-6 text-ink shadow-sm"
                }
              >
                {item.text}
              </p>
            ))}
          </div>
          <form onSubmit={sendMessage} className="flex gap-2 border-t border-black/10 p-3">
            <input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Nhập câu hỏi..."
              className="focus-ring min-w-0 flex-1 rounded-full bg-beige px-4 py-3 text-sm text-ink"
            />
            <button type="submit" aria-label="Gửi tin nhắn" className="focus-ring grid size-12 place-items-center rounded-full bg-forest text-white">
              <Send className="size-5" aria-hidden="true" />
            </button>
          </form>
        </section>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="focus-ring ml-auto flex items-center gap-3 rounded-full bg-forest px-5 py-4 font-bold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-ink"
        aria-label="Mở chat hỗ trợ khách hàng"
      >
        <MessageCircle className="size-5" aria-hidden="true" />
        Hỏi nhân viên
      </button>
    </aside>
  );
}
