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
  Check,
  Sparkles,
  Key,
  Eye,
  EyeOff,
  Cpu,
  Database
} from "lucide-react";
import type { SiteSettings } from "@/lib/server-store";

export default function AdminNotificationsPage() {
  const [settings, setSettings] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [testingGemini, setTestingGemini] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [testResult, setTestResult] = useState<{ success?: boolean; error?: string } | null>(null);
  const [geminiTestResult, setGeminiTestResult] = useState<{
    success?: boolean;
    error?: string;
    message?: string;
    model?: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        const s = data.settings || data.data;
        if (s) {
          setSettings(s);
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
        showToast("success", "Đã lưu vĩnh viễn cấu hình vào Supabase Cloud thành công!");
      } else {
        showToast("error", data.error || "Không thể lưu cấu hình.");
      }
    } catch {
      showToast("error", "Lỗi kết nối máy chủ.");
    } finally {
      setSaving(false);
    }
  };

  const handleTestTelegram = async () => {
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
        showToast("success", "Đã gửi tin nhắn thử nghiệm Telegram thành công! Hãy kiểm tra điện thoại của bạn.");
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

  const handleTestGemini = async () => {
    const key = settings.geminiApiKey?.trim();
    if (!key) {
      showToast("error", "Vui lòng nhập Google Gemini API Key trước khi bấm kiểm tra.");
      return;
    }

    setTestingGemini(true);
    setGeminiTestResult(null);

    try {
      const res = await fetch("/api/test-gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: key })
      });
      const data = await res.json();
      if (data.success) {
        setGeminiTestResult({
          success: true,
          message: data.message || "Kết nối Google Gemini AI thành công!",
          model: data.model || "gemini-2.5-flash"
        });
        showToast("success", "Kết nối Google Gemini AI thành công! Mô hình đã sẵn sàng.");
      } else {
        setGeminiTestResult({ error: data.error || "Xác thực API Key thất bại." });
        showToast("error", data.error || "Xác thực API Key thất bại.");
      }
    } catch {
      setGeminiTestResult({ error: "Lỗi kết nối tới máy chủ kiểm tra API." });
      showToast("error", "Lỗi kết nối tới máy chủ.");
    } finally {
      setTestingGemini(false);
    }
  };

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center text-forest gap-3">
        <Loader2 className="size-6 animate-spin" />
        <span className="text-sm font-bold">Đang tải cấu hình hệ thống...</span>
      </div>
    );
  }

  const hasGeminiKey = Boolean(settings.geminiApiKey && settings.geminiApiKey.trim().length > 10);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto pb-28">
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
            <span className="p-2.5 rounded-2xl bg-forest text-white shadow-sm">
              <Bell className="size-6" />
            </span>
            <h1 className="text-2xl md:text-3xl font-black text-ink">Cấu hình Hệ Thống & Thông Báo</h1>
          </div>
          <p className="text-xs md:text-sm text-ink/60 mt-1 max-w-3xl leading-relaxed">
            Quản lý <b>Khóa Trí Tuệ Nhân Tạo Google Gemini AI</b> dùng chung toàn ban quản trị và <b>Thông báo Telegram tức thì</b> cho đơn hàng, khách chat và lead tư vấn. Dữ liệu lưu vĩnh viễn vào Supabase Cloud.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 rounded-2xl bg-forest text-white text-xs font-bold hover:bg-forest/90 transition shadow flex items-center gap-2 self-start md:self-auto disabled:opacity-50"
        >
          {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {saving ? "Đang lưu cấu hình..." : "Lưu Toàn Bộ Cấu Hình"}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: CẤU HÌNH GOOGLE GEMINI AI KEY (DATABASE SITE_SETTINGS)           */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-gradient-to-r from-teal-500 to-emerald-600 text-white">
              <Sparkles className="size-4" />
            </span>
            <h2 className="text-base md:text-lg font-black text-ink">
              1. Trí Tuệ Nhân Tạo (Google Gemini AI Cloud)
            </h2>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
              hasGeminiKey
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            {hasGeminiKey ? (
              <>
                <Check className="size-3 text-emerald-600" />
                Đã Lưu Trong Supabase Cloud
              </>
            ) : (
              <>
                <Cpu className="size-3 text-slate-500" />
                Chưa Cấu Hình (Đang Dùng Động Cơ Độc Lập)
              </>
            )}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form nhập Gemini API Key */}
          <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5 space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-black/5 pb-3">
                <h3 className="text-sm font-black text-ink flex items-center gap-2">
                  <Key className="size-4 text-emerald-600" />
                  Khóa Google Gemini API Key
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">
                  Dùng Chung Toàn Hệ Thống
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink mb-1.5">
                  Google Gemini API Key *
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={settings.geminiApiKey || ""}
                    onChange={(e) => {
                      setSettings((prev) => ({ ...prev, geminiApiKey: e.target.value.trim() }));
                      setGeminiTestResult(null);
                    }}
                    placeholder="Dán mã API Key: AIzaSy..."
                    className="w-full rounded-2xl border border-black/10 bg-[#FBFBFB] pl-4 pr-11 py-2.5 text-xs font-mono text-ink focus:border-forest focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink transition p-1"
                    title={showApiKey ? "Ẩn khóa API" : "Hiện khóa API"}
                  >
                    {showApiKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-ink/60 mt-1.5 leading-relaxed">
                  Khóa API này sẽ được lưu thẳng vào trường <code>geminiApiKey</code> của bảng <code>site_settings</code> trên Supabase Cloud. Tất cả máy của Ban Quản Trị và hệ sinh thái Chạm A Lưới sẽ tự động dùng chung chìa khóa này.
                </p>
              </div>

              {/* Gemini Test Feedback */}
              {geminiTestResult?.success && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-semibold text-emerald-800 space-y-1">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                    Kết nối Google Gemini AI thành công!
                  </div>
                  <p className="text-[11px] text-emerald-700 pl-6">
                    Mô hình hoạt động: <b>{geminiTestResult.model}</b>. Phản hồi thử nghiệm: &ldquo;{geminiTestResult.message}&rdquo;
                  </p>
                </div>
              )}
              {geminiTestResult?.error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-xs font-semibold text-red-800 flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 text-red-600 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <span className="font-bold">Lỗi xác thực:</span> {geminiTestResult.error}
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="pt-2 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleTestGemini}
                disabled={testingGemini || !settings.geminiApiKey}
                className="w-full py-2.5 rounded-2xl border-2 border-emerald-500/30 text-emerald-800 bg-emerald-50/70 text-xs font-bold hover:bg-emerald-100 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {testingGemini ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                {testingGemini ? "Đang gửi yêu cầu kiểm tra tới Google..." : "Kiểm Tra Kết Nối Gemini AI Ngay"}
              </button>

              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="w-full py-2.5 rounded-2xl bg-[#0F382E] text-white text-xs font-bold hover:bg-[#0F382E]/90 transition shadow flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {saving ? "Đang lưu..." : "Lưu Vĩnh Viễn Khóa AI Vào Supabase Cloud"}
              </button>
            </div>
          </div>

          {/* Card Hướng dẫn lấy Gemini API Key */}
          <div className="rounded-3xl bg-[#0F382E] text-white p-6 md:p-7 shadow-card space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-black text-emerald-300 flex items-center gap-2">
                  <Sparkles className="size-5" />
                  Lấy Google Gemini API Key Miễn Phí (100% Free)
                </h3>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 hover:text-white transition bg-white/10 hover:bg-white/20 px-3 py-1 rounded-xl"
                >
                  Mở AI Studio <ExternalLink className="size-3" />
                </a>
              </div>

              <div className="text-xs text-white/85 space-y-3.5 leading-relaxed">
                <div className="flex gap-3">
                  <span className="size-6 rounded-full bg-emerald-400 text-forest font-black grid place-items-center shrink-0 text-xs">1</span>
                  <div>
                    <p className="font-bold text-white">Truy cập Google AI Studio</p>
                    <p className="text-white/70 mt-0.5">
                      Vào địa chỉ <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline text-emerald-300 font-mono">aistudio.google.com/app/apikey</a> và đăng nhập bằng tài khoản Google.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="size-6 rounded-full bg-emerald-400 text-forest font-black grid place-items-center shrink-0 text-xs">2</span>
                  <div>
                    <p className="font-bold text-white">Tạo khóa API mới</p>
                    <p className="text-white/70 mt-0.5">
                      Bấm vào nút màu xanh <b>&ldquo;Create API key&rdquo;</b> (Tạo khóa API), chọn dự án Google Cloud có sẵn hoặc để mặc định.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="size-6 rounded-full bg-emerald-400 text-forest font-black grid place-items-center shrink-0 text-xs">3</span>
                  <div>
                    <p className="font-bold text-white">Sao chép chuỗi mã API Key</p>
                    <p className="text-white/70 mt-0.5">
                      Copy chuỗi ký tự (thường bắt đầu bằng <code>AIzaSy...</code>) và dán vào ô nhập liệu bên cạnh.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <span className="size-6 rounded-full bg-emerald-400 text-forest font-black grid place-items-center shrink-0 text-xs">4</span>
                  <div>
                    <p className="font-bold text-white">Bấm &ldquo;Lưu Vĩnh Viễn&rdquo;</p>
                    <p className="text-white/70 mt-0.5">
                      Dữ liệu sẽ được đồng bộ lên Supabase Cloud, giải phóng hoàn toàn việc phải nhập đi nhập lại trên từng trình duyệt cá nhân.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10 text-xs text-emerald-300/90 flex items-start gap-2.5">
              <Database className="size-4 shrink-0 mt-0.5 text-emerald-300" />
              <span>
                <b>Chia sẻ tập trung:</b> Khóa này tự động kích hoạt tính năng tạo <b>Báo Cáo Phân Tích Kinh Doanh AI</b> (Gemini 2.5 Flash) và hỗ trợ trả lời tự động cho <b>Trợ Lý Bản Địa</b> trên website.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 2: CẤU HÌNH THÔNG BÁO TELEGRAM BOT TỨC THÌ                         */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-4 border-t border-forest/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500 text-white">
              <Smartphone className="size-4" />
            </span>
            <h2 className="text-base md:text-lg font-black text-ink">
              2. Thông Báo Tức Thì (Telegram Bot)
            </h2>
          </div>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold ${
              settings.telegramBotToken && settings.telegramChatId
                ? "bg-sky-50 text-sky-700 border border-sky-200"
                : "bg-slate-100 text-slate-600 border border-slate-200"
            }`}
          >
            {settings.telegramBotToken && settings.telegramChatId ? (
              <>
                <Check className="size-3 text-sky-600" />
                Đã Cấu Hình Telegram Bot
              </>
            ) : (
              "Chưa Cấu Hình Bot"
            )}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Form cấu hình Telegram */}
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
                onClick={handleTestTelegram}
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

          {/* Hướng dẫn chi tiết Telegram */}
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
    </div>
  );
}
