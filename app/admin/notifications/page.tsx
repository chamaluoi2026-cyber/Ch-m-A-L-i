"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Send,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ShieldCheck,
  Smartphone,
  Info,
  Check
} from "lucide-react";
import type { SiteSettings } from "@/lib/server-store";

export default function AdminNotificationsPage() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [testResult, setTestResult] = useState<{ success?: boolean; error?: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setSettings(data.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const showToast = (type: "success" | "error" | "info", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 5000);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Đã lưu cấu hình thông báo Telegram thành công!");
      } else {
        showToast("error", data.error || "Không thể lưu cấu hình.");
      }
    } catch {
      showToast("error", "Lỗi kết nối máy chủ.");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!settings.telegramBotToken?.trim() || !settings.telegramChatId?.trim()) {
      showToast("error", "Vui lòng nhập đầy đủ Bot Token và Chat ID trước khi bấm gửi thử nghiệm.");
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/test-telegram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: settings.telegramBotToken.trim(),
          chatId: settings.telegramChatId.trim()
        })
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({ success: true });
        showToast("success", "Đã gửi tin nhắn thử nghiệm thành công! Hãy kiểm tra điện thoại của bạn.");
      } else {
        setTestResult({ error: data.error || "Gửi thất bại" });
        showToast("error", data.error || "Gửi thất bại. Vui lòng kiểm tra lại Token và Chat ID.");
      }
    } catch {
      setTestResult({ error: "Lỗi kết nối máy chủ" });
      showToast("error", "Lỗi kết nối tới máy chủ.");
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center text-forest gap-3">
        <Loader2 className="size-6 animate-spin" />
        <span className="text-sm font-bold">Đang tải cấu hình thông báo...</span>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto pb-24">
      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-2xl transition-all duration-300 ${
            toast.type === "success"
              ? "bg-emerald-900 text-white border border-emerald-500/30"
              : toast.type === "error"
              ? "bg-red-900 text-white border border-red-500/30"
              : "bg-ink text-white border border-white/20"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />}
          {toast.type === "error" && <AlertCircle className="size-5 shrink-0 text-red-400" />}
          {toast.type === "info" && <Info className="size-5 shrink-0 text-amber-300" />}
          <span className="text-xs font-semibold">{toast.text}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-forest/10 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-forest text-white">
              <Bell className="size-6" />
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-ink">Cấu hình Thông Báo Tức Thì (Telegram)</h1>
          </div>
          <p className="text-xs md:text-sm text-ink/60 mt-1 max-w-3xl leading-relaxed">
            Hệ thống sẽ tự động gửi tin nhắn ting ting về điện thoại Telegram của Ban Quản Lý ngay khi có:
            <b> Đơn đặt Tour mới</b>, <b>Đơn mua Đặc sản</b>, <b>Khách nhắn tin Live Chat</b> hoặc <b>Khách gửi form Tư vấn</b>.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-2xl bg-forest text-white text-xs font-bold hover:bg-forest/90 transition shadow flex items-center gap-2 self-start md:self-auto disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? "Đang lưu..." : "Lưu Cấu Hình"}
        </button>
      </div>

      {/* Main Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Form cấu hình */}
        <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5 space-y-5">
          <div className="flex items-center justify-between border-b border-black/5 pb-3">
            <h3 className="text-sm font-black text-ink flex items-center gap-2">
              <Smartphone className="size-4 text-sky-500" />
              Thông tin kết nối Telegram Bot
            </h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.telegramEnabled !== false}
                onChange={(e) => setSettings((prev) => ({ ...prev, telegramEnabled: e.target.checked }))}
                className="size-4 rounded accent-forest"
              />
              <span className="text-xs font-bold text-ink">Bật thông báo</span>
            </label>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                Telegram Bot Token *
              </label>
              <input
                type="text"
                value={settings.telegramBotToken || ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, telegramBotToken: e.target.value.trim() }))}
                placeholder="Ví dụ: 1234567890:ABCdefGhIJKlmNoPQRstuvWXyz..."
                className="w-full rounded-2xl border border-black/10 bg-[#FBFBFB] px-4 py-2.5 text-xs font-mono text-ink focus:border-forest focus:outline-none"
              />
              <p className="text-[10px] text-ink/50 mt-1">
                Lấy Token bằng cách chat với bot <b>@BotFather</b> trên Telegram và gõ lệnh <code>/newbot</code>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                Telegram Chat ID (Cá nhân hoặc Nhóm) *
              </label>
              <input
                type="text"
                value={settings.telegramChatId || ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, telegramChatId: e.target.value.trim() }))}
                placeholder="Ví dụ: 987654321 (cá nhân) hoặc -1001234567890 (nhóm)"
                className="w-full rounded-2xl border border-black/10 bg-[#FBFBFB] px-4 py-2.5 text-xs font-mono text-ink focus:border-forest focus:outline-none"
              />
              <p className="text-[10px] text-ink/50 mt-1">
                Lấy Chat ID của bạn bằng cách chat với bot <b>@userinfobot</b> trên Telegram. Nếu muốn gửi vào nhóm, thêm bot vào nhóm và lấy ID của nhóm đó.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                Email nhận thông báo phụ trợ (Tùy chọn)
              </label>
              <input
                type="email"
                value={settings.notificationEmail || ""}
                onChange={(e) => setSettings((prev) => ({ ...prev, notificationEmail: e.target.value.trim() }))}
                placeholder="admin@chamaluoi.vn"
                className="w-full rounded-2xl border border-black/10 bg-[#FBFBFB] px-4 py-2.5 text-xs text-ink focus:border-forest focus:outline-none"
              />
            </div>
          </div>

          {/* Test & Save buttons */}
          <div className="pt-2 flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="w-full py-3 rounded-2xl border-2 border-sky-500/30 text-sky-700 bg-sky-50 text-xs font-bold hover:bg-sky-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {testing ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              {testing ? "Đang gửi thử nghiệm..." : "Bấm vào đây để Gửi Tin Nhắn Thử Nghiệm về Điện Thoại"}
            </button>

            {testResult?.success && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                Đã gửi thành công! Hãy mở ứng dụng Telegram trên điện thoại để kiểm tra tin nhắn.
              </div>
            )}
            {testResult?.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs font-semibold text-red-800 flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0 text-red-600" />
                Lỗi: {testResult.error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full py-3 rounded-2xl bg-forest text-white text-xs font-bold hover:bg-forest/90 transition shadow flex items-center justify-center gap-2"
            >
              {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {saving ? "Đang lưu cấu hình..." : "Lưu Cấu Hình Thông Báo"}
            </button>
          </div>
        </div>

        {/* Hướng dẫn chi tiết */}
        <div className="rounded-3xl bg-[#0F382E] text-white p-6 md:p-8 shadow-card space-y-5">
          <h3 className="text-base font-black text-emerald-300 flex items-center gap-2">
            <HelpCircle className="size-5" />
            Hướng dẫn kết nối Telegram trong 1 phút
          </h3>

          <div className="text-xs text-white/85 space-y-4 leading-relaxed">
            <div className="flex gap-3">
              <span className="size-6 rounded-full bg-emerald-400 text-forest font-black grid place-items-center shrink-0 text-xs">1</span>
              <div>
                <p className="font-bold text-white">Mở Telegram và tìm @BotFather</p>
                <p className="text-white/70 mt-0.5">Tìm kiếm tài khoản <b>@BotFather</b> (có dấu tích xanh chính thức của Telegram).</p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="size-6 rounded-full bg-emerald-400 text-forest font-black grid place-items-center shrink-0 text-xs">2</span>
              <div>
                <p className="font-bold text-white">Tạo bot mới</p>
                <p className="text-white/70 mt-0.5">
                  Gõ lệnh <code>/newbot</code>, đặt tên hiển thị cho bot (ví dụ: <i>Chạm A Lưới Bot</i>), sau đó đặt username kết thúc bằng <i>_bot</i> (ví dụ: <i>chamaluoi_order_bot</i>).
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="size-6 rounded-full bg-emerald-400 text-forest font-black grid place-items-center shrink-0 text-xs">3</span>
              <div>
                <p className="font-bold text-white">Lấy Bot Token</p>
                <p className="text-white/70 mt-0.5">
                  BotFather sẽ trả về chuỗi <b>HTTP API Token</b> (dạng <code>123456789:ABCdefGh...</code>). Hãy copy và dán vào ô <b>Telegram Bot Token</b> ở bên trái.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="size-6 rounded-full bg-emerald-400 text-forest font-black grid place-items-center shrink-0 text-xs">4</span>
              <div>
                <p className="font-bold text-white">Lấy Chat ID của bạn</p>
                <p className="text-white/70 mt-0.5">
                  Tìm bot <b>@userinfobot</b> trên Telegram và bấm <code>/start</code>. Bạn sẽ thấy dòng <b>Id</b> (ví dụ: <code>987654321</code>). Dán số này vào ô <b>Telegram Chat ID</b>.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <span className="size-6 rounded-full bg-emerald-400 text-forest font-black grid place-items-center shrink-0 text-xs">5</span>
              <div>
                <p className="font-bold text-white">Quan trọng: Kích hoạt Bot</p>
                <p className="text-white/70 mt-0.5">
                  Hãy mở cuộc trò chuyện với chính con bot bạn vừa tạo và bấm <b>/start</b> một lần để bot có quyền gửi tin nhắn cho bạn!
                </p>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 text-xs text-emerald-300 flex items-center gap-2">
            <ShieldCheck className="size-4 shrink-0" />
            Thông báo qua Telegram hoàn toàn miễn phí 100%, bảo mật cao và tức thời 24/7.
          </div>
        </div>
      </div>
    </div>
  );
}
