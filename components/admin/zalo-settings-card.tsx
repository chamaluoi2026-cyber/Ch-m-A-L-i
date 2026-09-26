"use client";

import { useState, useEffect, useTransition } from "react";
import {
  MessageSquare,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Save,
  RotateCcw,
  Check,
  Power
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_CONFIG } from "@/lib/brand.config";
import { resolveZaloCoordinator } from "@/lib/zalo-helper";
import type { SiteSettings } from "@/lib/server-store";

interface ZaloSettingsCardProps {
  initialSettings?: SiteSettings;
  onSaved?: (settings: SiteSettings) => void;
}

export function ZaloSettingsCard({ initialSettings, onSaved }: ZaloSettingsCardProps) {
  const [settings, setSettings] = useState<Partial<SiteSettings>>({
    zaloPhone: "0825497468",
    zaloCoordinatorName: "Võ Quang Huy – Điều phối viên Chạm A Lưới",
    zaloActive: true,
    zaloUrl: "",
    contactPhone: BRAND_CONFIG.contact.hotline,
    ...initialSettings
  });

  const [loading, setLoading] = useState(!initialSettings);
  const [isPending, startTransition] = useTransition();
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ isSuccess: boolean; msg: string } | null>(null);

  useEffect(() => {
    if (!initialSettings) {
      fetch("/api/settings")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.settings) {
            setSettings((prev) => ({
              ...prev,
              ...data.settings
            }));
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [initialSettings]);

  const resolved = resolveZaloCoordinator(settings as SiteSettings);

  const handleSave = () => {
    setErrorMsg(null);
    setSaveSuccess(false);

    // Validation
    const cleanPhone = (settings.zaloPhone || "").replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMsg("Số điện thoại Zalo không hợp lệ (phải từ 9 đến 11 chữ số).");
      return;
    }
    if (cleanPhone === "0905000118") {
      setErrorMsg("Số điện thoại 0905000118 là số mẫu không có thực. Vui lòng sử dụng số Zalo điều phối viên thực tế.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            zaloPhone: cleanPhone,
            zaloCoordinatorName: settings.zaloCoordinatorName?.trim() || "Điều phối viên Chạm A Lưới",
            zaloActive: settings.zaloActive ?? true,
            zaloUrl: settings.zaloUrl?.trim() || undefined,
            contactPhone: settings.contactPhone?.trim() || BRAND_CONFIG.contact.hotline
          })
        });

        const data = await res.json();
        if (data.success) {
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 4000);
          if (onSaved) onSaved(data.settings || settings);
        } else {
          setErrorMsg(data.error || "Không thể lưu cấu hình Zalo.");
        }
      } catch (err: any) {
        setErrorMsg(err?.message || "Lỗi kết nối khi lưu cấu hình Zalo.");
      }
    });
  };

  const handleTestConnection = () => {
    if (!resolved.isAvailable) {
      setTestResult({
        isSuccess: false,
        msg: `Zalo hiện đang tắt hoặc không khả dụng. Hệ thống sẽ tự động chuyển hướng khách hàng sang Hotline: ${resolved.fallbackHotline}`
      });
      return;
    }

    setTestResult({
      isSuccess: true,
      msg: `Kết nối hợp lệ! Đang mở liên kết: ${resolved.zaloUrl}`
    });

    if (typeof window !== "undefined") {
      window.open(resolved.zaloUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="rounded-3xl bg-white p-6 shadow-card border border-forest/15 space-y-5 text-ink">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-4">
        <div className="flex items-center gap-3">
          <div className="size-11 rounded-2xl bg-[#0068FF]/10 text-[#0068FF] flex items-center justify-center font-bold">
            <MessageSquare className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-ink">Cấu hình Zalo Điều Phối Viên</h3>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                settings.zaloActive ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700"
              }`}>
                {settings.zaloActive ? "Đang kích hoạt" : "Tạm ngắt Zalo"}
              </span>
            </div>
            <p className="text-xs text-ink/60 mt-0.5">
              Nguồn điều hướng duy nhất cho toàn bộ nút tư vấn, xác nhận booking và chat trên website
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleTestConnection}
            className="border-blue-200 text-blue-700 hover:bg-blue-50 text-xs font-bold"
          >
            <ExternalLink className="size-3.5 mr-1.5" />
            Kiểm tra link Zalo (Test)
          </Button>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-800 flex items-start gap-2">
          <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <span>Đã lưu thành công cấu hình Zalo vào hệ thống và đồng bộ toàn website!</span>
        </div>
      )}

      {testResult && (
        <div className={`rounded-2xl p-3 text-xs border ${
          testResult.isSuccess
            ? "bg-blue-50 border-blue-200 text-blue-900"
            : "bg-amber-50 border-amber-200 text-amber-900"
        }`}>
          {testResult.msg}
        </div>
      )}

      {/* Form Fields */}
      <div className="grid gap-4 sm:grid-cols-2 text-xs">
        <div className="space-y-1.5">
          <label className="font-bold text-ink">Số điện thoại Zalo chính thức *</label>
          <input
            type="text"
            value={settings.zaloPhone || ""}
            onChange={(e) => setSettings({ ...settings, zaloPhone: e.target.value })}
            placeholder="0825497468"
            className="w-full rounded-2xl bg-beige/60 border border-forest/20 p-3 font-mono font-bold text-ink text-xs focus:ring-2 focus:ring-forest"
          />
          <p className="text-[11px] text-ink/50">
            Số điện thoại đã kích hoạt tài khoản Zalo nhận tin nhắn từ người lạ.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-ink">Tên hiển thị Điều phối viên</label>
          <input
            type="text"
            value={settings.zaloCoordinatorName || ""}
            onChange={(e) => setSettings({ ...settings, zaloCoordinatorName: e.target.value })}
            placeholder="Võ Quang Huy – Điều phối viên Chạm A Lưới"
            className="w-full rounded-2xl bg-beige/60 border border-forest/20 p-3 font-bold text-ink text-xs focus:ring-2 focus:ring-forest"
          />
          <p className="text-[11px] text-ink/50">
            Hiển thị trong hộp thoại và thông tin liên lạc cho du khách.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 text-xs">
        <div className="space-y-1.5">
          <label className="font-bold text-ink">Link Zalo OA / Đường dẫn tùy chỉnh (Tùy chọn)</label>
          <input
            type="url"
            value={settings.zaloUrl || ""}
            onChange={(e) => setSettings({ ...settings, zaloUrl: e.target.value })}
            placeholder="https://zalo.me/0825497468 hoặc link OA"
            className="w-full rounded-2xl bg-beige/60 border border-forest/20 p-3 font-mono text-ink text-xs focus:ring-2 focus:ring-forest"
          />
          <p className="text-[11px] text-ink/50">
            Để trống nếu sử dụng đường dẫn tiêu chuẩn https://zalo.me/&lt;SĐT&gt;.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="font-bold text-ink">Hotline dự phòng (Fallback Hotline)</label>
          <input
            type="text"
            value={settings.contactPhone || ""}
            onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })}
            placeholder="0825 497 468"
            className="w-full rounded-2xl bg-beige/60 border border-forest/20 p-3 font-mono font-bold text-ink text-xs focus:ring-2 focus:ring-forest"
          />
          <p className="text-[11px] text-ink/50">
            Hệ thống tự động chuyển khách bấm gọi khi kết nối Zalo bảo trì.
          </p>
        </div>
      </div>

      {/* Toggle active switch */}
      <div className="rounded-2xl bg-[#F8F7F2] p-4 border border-forest/10 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-ink">Kích hoạt nút Zalo trên toàn hệ thống</p>
          <p className="text-[11px] text-ink/60">
            Khi tắt, toàn bộ các nút Zalo trên website sẽ tự động chuyển thành gọi Hotline hoặc gửi Email.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSettings({ ...settings, zaloActive: !settings.zaloActive })}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            settings.zaloActive ? "bg-emerald-600" : "bg-stone-300"
          }`}
        >
          <span
            className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              settings.zaloActive ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Save Action */}
      <div className="flex justify-end pt-2">
        <Button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className="bg-forest hover:bg-forest/90 text-white font-bold text-xs px-6 py-2.5 rounded-2xl shadow-sm"
        >
          {isPending ? "Đang lưu..." : "Lưu Cấu Hình Zalo"}
        </Button>
      </div>
    </div>
  );
}
