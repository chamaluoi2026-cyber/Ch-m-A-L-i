"use client";

import { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, Calendar, Clock, BarChart2 } from "lucide-react";

interface ExportExcelDropdownProps {
  type: "bookings" | "leads" | "transactions" | "commissions";
  businessId?: string;
  className?: string;
  buttonLabel?: string;
}

export function ExportExcelDropdown({
  type,
  businessId,
  className = "",
  buttonLabel = "Xuất Excel"
}: ExportExcelDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const now = new Date();
  const curY = now.getFullYear();
  const curM = now.getMonth() + 1; // 1-12
  const prevDate = new Date(curY, curM - 2, 1);
  const prevY = prevDate.getFullYear();
  const prevM = prevDate.getMonth() + 1;
  const currentQuarter = Math.floor((curM - 1) / 3) + 1;

  const pad = (n: number) => String(n).padStart(2, "0");

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getExportUrl = (timeRange: string, month?: string) => {
    const params = new URLSearchParams();
    params.set("type", type);
    params.set("timeRange", timeRange);
    if (month) params.set("month", month);
    if (businessId && businessId !== "all") params.set("businessId", businessId);
    return `/api/export?${params.toString()}`;
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold text-forest bg-white border border-forest/20 shadow-sm hover:bg-forest/5 hover:border-forest/40 transition active:scale-95"
        title="Chọn khoảng thời gian để tải bảng tính Excel / CSV"
      >
        <Download className="size-3.5 text-emerald-600" />
        <span>{buttonLabel}</span>
        <ChevronDown className={`size-3 text-ink/40 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-64 rounded-2xl bg-white border border-black/10 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1.5 border-b border-black/5 text-[11px] font-bold text-ink/50 uppercase tracking-wider">
            Chọn kỳ đối soát / thời gian
          </div>

          <a
            href={getExportUrl("this_month")}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-ink hover:bg-forest/10 hover:text-forest transition"
          >
            <Calendar className="size-3.5 text-emerald-600" />
            <div className="flex flex-col">
              <span>Tháng Này (Tháng {pad(curM)}/{curY})</span>
              <span className="text-[10px] text-ink/50 font-normal">Dữ liệu từ ngày 01 đến hôm nay</span>
            </div>
          </a>

          <a
            href={getExportUrl("last_month")}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-ink hover:bg-forest/10 hover:text-forest transition"
          >
            <Clock className="size-3.5 text-amber-600" />
            <div className="flex flex-col">
              <span>Tháng Trước (Tháng {pad(prevM)}/{prevY})</span>
              <span className="text-[10px] text-ink/50 font-normal">Phục vụ chốt sổ đối soát tháng vừa qua</span>
            </div>
          </a>

          <a
            href={getExportUrl("this_quarter")}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-ink hover:bg-forest/10 hover:text-forest transition"
          >
            <BarChart2 className="size-3.5 text-blue-600" />
            <div className="flex flex-col">
              <span>Quý Này (Quý {currentQuarter}/{curY})</span>
              <span className="text-[10px] text-ink/50 font-normal">Báo cáo tổng kết theo quý</span>
            </div>
          </a>

          <div className="my-1 border-t border-black/5" />

          <a
            href={getExportUrl("all")}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-forest hover:bg-forest/10 transition"
          >
            <Download className="size-3.5 text-forest" />
            <div className="flex flex-col">
              <span>Toàn Bộ Thời Gian (Tất cả)</span>
              <span className="text-[10px] text-ink/50 font-normal">Toàn bộ dữ liệu lịch sử trên sàn</span>
            </div>
          </a>
        </div>
      )}
    </div>
  );
}
