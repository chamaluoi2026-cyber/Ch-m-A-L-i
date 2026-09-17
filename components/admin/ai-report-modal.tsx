"use client";

import { useState } from "react";
import {
  Sparkles,
  Printer,
  Download,
  ExternalLink,
  X,
  FileText,
  BarChart3
} from "lucide-react";

interface AiReportModalProps {
  buttonText?: string;
  variant?: "primary" | "outline" | "compact";
  className?: string;
}

export function AiReportModal({
  buttonText = "✨ Phân tích AI & Báo cáo HTML",
  variant = "primary",
  className = ""
}: AiReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const reportUrl = "/api/analytics/report";
  const downloadUrl = "/api/analytics/report?download=true";

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="relative flex flex-col w-full max-w-5xl h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-black/10">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-3.5 bg-[#09261F] text-white border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <BarChart3 className="size-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold leading-tight flex items-center gap-2">
                    Báo Cáo Phân Tích Kinh Doanh Du Lịch Chạm A Lưới
                    <span className="text-[10px] bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      AI Generated
                    </span>
                  </h3>
                  <p className="text-[11px] text-white/60">
                    Bao gồm nhận xét đối tác, phân bổ doanh thu & đề xuất chiến lược phát triển
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
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
                  <span className="hidden sm:inline">In / Xuất PDF</span>
                </button>

                <a
                  href={downloadUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition"
                  title="Tải file HTML độc lập về máy"
                >
                  <Download className="size-3.5" />
                  <span className="hidden sm:inline">Tải File HTML</span>
                </a>

                <a
                  href={reportUrl}
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
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-rose-500/80 text-white/80 hover:text-white transition ml-2"
                  aria-label="Đóng"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Iframe content */}
            <div className="flex-1 bg-[#F4F6F5] p-2 overflow-hidden">
              <iframe
                id="ai-report-frame"
                src={reportUrl}
                title="Báo cáo phân tích AI"
                className="w-full h-full rounded-xl bg-white border border-black/5 shadow-inner"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
