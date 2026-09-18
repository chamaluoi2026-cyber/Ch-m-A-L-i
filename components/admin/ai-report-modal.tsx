"use client";

import { useState, useEffect } from "react";
import {
  Sparkles,
  Printer,
  Download,
  ExternalLink,
  X,
  BarChart3,
  RefreshCw,
  SlidersHorizontal,
  Key,
  MessageSquare,
  CloudRain,
  Home,
  ShoppingBag,
  Compass,
  Calendar,
  Clock
} from "lucide-react";

interface AiReportModalProps {
  buttonText?: string;
  variant?: "primary" | "outline" | "compact";
  className?: string;
}

const PRESET_PROMPTS = [
  {
    id: "all",
    label: "🚀 Toàn diện & Tăng trưởng",
    prompt: "Phân tích toàn diện hoạt động kinh doanh Chạm A Lưới, cơ cấu doanh thu và lộ trình tăng trưởng bứt phá."
  },
  {
    id: "chat",
    label: "💬 Chẩn đoán Live Chat & Leads",
    prompt: "Phân tích các câu hỏi khách hỏi trong khung chat và biểu mẫu tư vấn, chỉ rõ điểm nghẽn khiến khách chưa chốt cọc và hướng xử lý."
  },
  {
    id: "rain",
    label: "🌧️ Chiến lược Mùa mưa (T10-T12)",
    prompt: "Đề xuất chiến lược du lịch mùa mưa bão tại A Lưới, giải pháp khắc phục đèo QL49 sương mù và gói trải nghiệm trong nhà/nhà Gươl."
  },
  {
    id: "homestay",
    label: "🏡 Nâng cấp Dịch vụ Homestay",
    prompt: "Đánh giá chất lượng dịch vụ các homestay, nhà vườn và đề xuất chuẩn hóa phòng nghỉ, ẩm thực để nâng cao giá trị mỗi đơn hàng."
  },
  {
    id: "product",
    label: "🧵 Đặc sản OCOP & Thổ cẩm Zèng",
    prompt: "Chiến lược đẩy mạnh doanh số đặc sản bản địa A Lưới (Mật ong rừng, Dệt Zèng, Tiêu rừng, Bánh A Quát) thành sản phẩm quà tặng du lịch."
  }
];

export function AiReportModal({
  buttonText = "✨ Phân tích AI & Báo cáo HTML",
  variant = "primary",
  className = ""
}: AiReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("all");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("all");
  const [apiKey, setApiKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportKey, setReportKey] = useState(Date.now());

  const now = new Date();
  const curY = now.getFullYear();
  const curM = now.getMonth() + 1;
  const prevDate = new Date(curY, curM - 2, 1);
  const prevY = prevDate.getFullYear();
  const prevM = prevDate.getMonth() + 1;
  const currentQuarter = Math.floor((curM - 1) / 3) + 1;
  const pad = (n: number) => String(n).padStart(2, "0");

  const [cloudApiKeyLoaded, setCloudApiKeyLoaded] = useState(false);

  // Tải Gemini API key từ Supabase Cloud (site_settings) hoặc fallback localStorage
  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data) => {
        const s = data.settings || data.data;
        if (s?.geminiApiKey?.trim()) {
          setApiKey(s.geminiApiKey.trim());
          setCloudApiKeyLoaded(true);
        } else if (typeof window !== "undefined") {
          const savedKey = localStorage.getItem("cal_gemini_api_key");
          if (savedKey) setApiKey(savedKey);
        }
      })
      .catch(() => {
        if (typeof window !== "undefined") {
          const savedKey = localStorage.getItem("cal_gemini_api_key");
          if (savedKey) setApiKey(savedKey);
        }
      });
  }, []);

  const handleSaveApiKey = async (key: string) => {
    const trimmed = key.trim();
    setApiKey(trimmed);
    if (typeof window !== "undefined") {
      if (trimmed) {
        localStorage.setItem("cal_gemini_api_key", trimmed);
      } else {
        localStorage.removeItem("cal_gemini_api_key");
      }
    }
    // Tự động đồng bộ lên Database để mọi máy dùng chung
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ geminiApiKey: trimmed })
      });
      if (trimmed) setCloudApiKeyLoaded(true);
      else setCloudApiKeyLoaded(false);
    } catch {}
  };

  const [useFastMode, setUseFastMode] = useState(false);
  const activePrompt = customPrompt.trim() || PRESET_PROMPTS.find(p => p.id === selectedPreset)?.prompt || "";

  const getReportUrl = (download = false) => {
    const params = new URLSearchParams();
    if (activePrompt) params.set("prompt", activePrompt);
    if (selectedPreset) params.set("focus", selectedPreset);
    if (!useFastMode && apiKey.trim()) params.set("apiKey", apiKey.trim());
    if (useFastMode) params.set("fast", "true");
    if (selectedTimeRange && selectedTimeRange !== "all") params.set("timeRange", selectedTimeRange);
    if (download) params.set("download", "true");
    params.set("_t", reportKey.toString());
    return `/api/analytics/report?${params.toString()}`;
  };

  const handleTriggerAnalysis = () => {
    setIsGenerating(true);
    setReportKey(Date.now());
    // Safe timeout fallback
    setTimeout(() => {
      setIsGenerating(false);
    }, 45000);
  };

  return (
    <>
      {/* Trigger Button */}
      {variant === "primary" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-sm transition hover:shadow-md ${className}`}
        >
          <Sparkles className="size-4 animate-pulse text-amber-300" />
          <span>{buttonText}</span>
        </button>
      )}

      {variant === "outline" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs text-forest bg-forest/10 hover:bg-forest/20 border border-forest/20 transition ${className}`}
        >
          <Sparkles className="size-3.5 text-amber-500" />
          <span>{buttonText}</span>
        </button>
      )}

      {variant === "compact" && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 transition ${className}`}
          title="Xem phân tích kinh doanh AI"
        >
          <Sparkles className="size-3 text-amber-600" />
          <span>Báo cáo AI</span>
        </button>
      )}

      {/* Modal Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="relative flex flex-col w-full max-w-6xl h-[95vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-black/10">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3 bg-[#06231C] text-white border-b border-white/10 shrink-0">
              <div className="flex items-center gap-3">
                <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <BarChart3 className="size-5" />
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-bold leading-tight flex items-center gap-2">
                    Trung Tâm Cố Vấn Chiến Lược AI Chạm A Lưới
                    <span className="text-[10px] bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-2.5 py-0.5 rounded-full font-bold shadow-sm">
                      Autonomous Intelligence
                    </span>
                  </h3>
                  <p className="text-[11px] text-white/70">
                    Phân tích không đóng khung • Đọc dữ liệu chats, leads, bookings thực tế & thời vụ A Lưới
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={() => setShowKeyInput(!showKeyInput)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    apiKey.trim()
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-white/10 text-white/80 hover:bg-white/20"
                  }`}
                  title="Cấu hình Google Gemini API Key"
                >
                  <Key className="size-3.5" />
                  <span className="hidden md:inline">
                    {apiKey.trim() ? (cloudApiKeyLoaded ? "Gemini Key: Đã kết nối Cloud" : "Gemini Key: Đã bật") : "Cấu hình Gemini"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const iframe = document.getElementById("ai-report-frame") as HTMLIFrameElement;
                    if (iframe && iframe.contentWindow) {
                      iframe.contentWindow.print();
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition"
                  title="In trực tiếp hoặc Lưu file PDF"
                >
                  <Printer className="size-3.5" />
                  <span className="hidden sm:inline">In / PDF</span>
                </button>

                <a
                  href={getReportUrl(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow-sm"
                  title="Tải file HTML độc lập về máy"
                >
                  <Download className="size-3.5" />
                  <span className="hidden sm:inline">Tải HTML</span>
                </a>

                <a
                  href={getReportUrl(false)}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition"
                  title="Mở toàn màn hình trong tab mới"
                >
                  <ExternalLink className="size-4" />
                </a>

                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500 text-white/80 hover:text-white transition ml-1"
                  aria-label="Đóng"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* AI Customization & Prompt Bar */}
            <div className="bg-[#0A2F26] text-white px-5 py-3 border-b border-white/10 flex flex-col gap-2.5 shrink-0 shadow-inner">
              {/* Optional Gemini API Key Box */}
              {showKeyInput && (
                <div className="flex flex-wrap items-center gap-3 p-2.5 rounded-xl bg-black/30 border border-emerald-500/20 text-xs animate-in slide-in-from-top-2">
                  <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Key className="size-3.5" /> Google Gemini API Key:
                  </span>
                  <input
                    type="password"
                    placeholder="Dán mã API Key của bạn (Google AI Studio)..."
                    value={apiKey}
                    onChange={(e) => handleSaveApiKey(e.target.value)}
                    className="flex-1 min-w-[240px] px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-xs placeholder:text-white/40 focus:outline-none focus:border-emerald-400"
                  />
                  <span className="text-[11px] text-white/60">
                    {apiKey ? (cloudApiKeyLoaded ? "✓ Đang dùng Gemini 2.5 Flash từ Cấu hình Hệ Thống (Supabase Cloud)" : "✓ Sẽ dùng trực tiếp Gemini 2.5 Flash") : "Để trống sẽ dùng Động cơ Phân tích Tự Động độc lập"}
                  </span>
                </div>
              )}

              {/* Time Range Selector Bar */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 text-xs no-scrollbar border-b border-white/10">
                <span className="text-amber-300/90 text-[11px] font-bold mr-1 shrink-0 flex items-center gap-1">
                  <Calendar className="size-3" /> Kỳ đối soát:
                </span>
                {[
                  { id: "all", label: "Toàn bộ thời gian" },
                  { id: "this_month", label: `Tháng này (T${pad(curM)}/${curY})` },
                  { id: "last_month", label: `Tháng trước (T${pad(prevM)}/${prevY})` },
                  { id: "this_quarter", label: `Quý ${currentQuarter}/${curY}` }
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setSelectedTimeRange(t.id);
                      setIsGenerating(true);
                      setReportKey(Date.now());
                      setTimeout(() => setIsGenerating(false), 1200);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                      selectedTimeRange === t.id
                        ? "bg-amber-400 text-[#06231C] shadow-sm font-bold"
                        : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Preset Quick Focus Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                <span className="text-white/60 text-[11px] font-medium mr-1 shrink-0 flex items-center gap-1">
                  <SlidersHorizontal className="size-3" /> Góc nhìn:
                </span>
                {PRESET_PROMPTS.map((p) => {
                  const isActive = selectedPreset === p.id && !customPrompt.trim();
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedPreset(p.id);
                        setCustomPrompt("");
                        handleTriggerAnalysis();
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                        isActive
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>

              {/* Free-form Custom Prompt Input */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleTriggerAnalysis();
                    }}
                    placeholder="Nhập câu hỏi hoặc yêu cầu phân tích riêng cho AI (Ví dụ: Vì sao khách hỏi giá không cọc? Chiến lược mùa mưa bão?)..."
                    className="w-full px-3.5 py-2 pl-9 rounded-xl bg-white/10 border border-white/20 text-white text-xs placeholder:text-white/45 focus:outline-none focus:border-emerald-400 focus:bg-white/15 transition"
                  />
                  <Sparkles className="absolute left-3 top-2.5 size-3.5 text-amber-300 pointer-events-none" />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setUseFastMode(!useFastMode);
                    setIsGenerating(true);
                    setReportKey(Date.now());
                  }}
                  className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold border transition shrink-0 ${
                    useFastMode
                      ? "bg-amber-400 text-black border-amber-300 font-bold"
                      : "bg-white/10 text-white/90 border-white/20 hover:bg-white/20"
                  }`}
                  title="Chuyển chế độ phân tích tức thì trong 1 giây hoặc phân tích chuyên sâu qua Gemini"
                >
                  {useFastMode ? "⚡ Chế độ Tức thì (1s)" : "🤖 Google Gemini AI"}
                </button>

                <button
                  type="button"
                  onClick={handleTriggerAnalysis}
                  disabled={isGenerating}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-xs font-bold shadow transition disabled:opacity-50 shrink-0"
                >
                  <RefreshCw className={`size-3.5 ${isGenerating ? "animate-spin" : ""}`} />
                  <span>{isGenerating ? "Đang phân tích..." : "Phân Tích Ngay"}</span>
                </button>
              </div>
            </div>

            {/* Iframe Content with Loading Overlay */}
            <div className="relative flex-1 bg-[#F4F6F5] p-2 overflow-hidden">
              {isGenerating && (
                <div className="absolute inset-0 z-10 bg-white/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-6 text-center">
                  <div className="size-12 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-emerald-950">
                      {useFastMode
                        ? "Đang tổng hợp dữ liệu thời gian thực Chạm A Lưới..."
                        : "Google Gemini 3.6 Flash đang phân tích sâu dữ liệu..."}
                    </p>
                    <p className="text-xs text-ink/70 max-w-md">
                      {useFastMode
                        ? "Động cơ nội bộ phân tích ngay trong 1 giây."
                        : "AI đang quét cơ sở dữ liệu bookings, leads, hội thoại khách và thời vụ A Lưới (khoảng 10-20 giây)."}
                    </p>
                  </div>
                  {!useFastMode && (
                    <button
                      type="button"
                      onClick={() => {
                        setUseFastMode(true);
                        setIsGenerating(true);
                        setReportKey(Date.now());
                      }}
                      className="mt-2 text-xs font-bold text-emerald-800 underline hover:text-emerald-950"
                    >
                      Bấm vào đây nếu muốn xem nhanh tức thì (không cần đợi AI) →
                    </button>
                  )}
                </div>
              )}
              <iframe
                id="ai-report-frame"
                src={getReportUrl(false)}
                onLoad={() => setIsGenerating(false)}
                title="Báo cáo phân tích chiến lược AI"
                className="w-full h-full rounded-xl bg-white border border-black/5 shadow-inner"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

