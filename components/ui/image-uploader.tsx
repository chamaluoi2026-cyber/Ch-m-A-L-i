"use client";

import { useState, useRef } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Link2,
  Sparkles,
  UploadCloud,
  X
} from "lucide-react";
import { normalizeImageUrl, detectImageSource } from "@/lib/image-helper";
import { AppImage } from "@/components/ui/app-image";
import { Button } from "@/components/ui/button";

export interface ImageUploaderProps {
  label?: string;
  value?: string;
  onChange?: (url: string) => void;
  placeholder?: string;
  helperText?: string;
}

export function ImageUploader({
  label = "Hình ảnh",
  value = "",
  onChange,
  placeholder = "Dán link ảnh (Google Drive, Unsplash, hoặc link web bất kỳ)...",
  helperText = "Hỗ trợ dán link Google Drive chia sẻ công khai, Unsplash hoặc tải ảnh trực tiếp từ máy."
}: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<"link" | "upload">("link");
  const [rawInput, setRawInput] = useState(value);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const normalizedUrl = normalizeImageUrl(rawInput);
  const source = detectImageSource(rawInput);

  function handleInputChange(val: string) {
    setRawInput(val);
    const converted = normalizeImageUrl(val);
    if (onChange) onChange(converted);
  }

  function handleCopy() {
    if (!normalizedUrl) return;
    navigator.clipboard.writeText(normalizedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      });
      const data = await response.json();

      if (data.success && data.url) {
        setRawInput(data.url);
        if (onChange) onChange(data.url);
      } else {
        setUploadError(data.error || "Tải ảnh thất bại.");
      }
    } catch {
      setUploadError("Không thể kết nối đến máy chủ để tải ảnh.");
    } finally {
      setUploading(false);
    }
  }

  const sourceLabels: Record<string, { label: string; color: string }> = {
    "google-drive": { label: "Google Drive (Đã tự động chuyển direct link)", color: "bg-blue-100 text-blue-800" },
    unsplash: { label: "Unsplash CDN", color: "bg-emerald-100 text-emerald-800" },
    dropbox: { label: "Dropbox", color: "bg-sky-100 text-sky-800" },
    local: { label: "Ảnh máy chủ nội bộ", color: "bg-forest/10 text-forest" },
    external: { label: "Link trực tiếp", color: "bg-gray-100 text-gray-800" }
  };

  return (
    <div className="space-y-3 rounded-2xl bg-white p-4 shadow-sm border border-black/5">
      {label ? (
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-ink flex items-center gap-1.5">
            <ImageIcon className="size-3.5 text-forest" />
            {label}
          </label>
          <div className="flex items-center gap-1 text-[11px]">
            <button
              type="button"
              onClick={() => setActiveTab("link")}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                activeTab === "link" ? "bg-forest text-white" : "text-ink/60 hover:bg-beige"
              }`}
            >
              <Link2 className="size-3 inline mr-1" /> Dán link ảnh
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                activeTab === "upload" ? "bg-forest text-white" : "text-ink/60 hover:bg-beige"
              }`}
            >
              <UploadCloud className="size-3 inline mr-1" /> Tải từ máy
            </button>
          </div>
        </div>
      ) : null}

      {/* Tab 1: Paste URL */}
      {activeTab === "link" && (
        <div className="space-y-2">
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder={placeholder}
              value={rawInput}
              onChange={(e) => handleInputChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-forest font-mono pr-16"
            />
            {rawInput ? (
              <button
                type="button"
                onClick={() => handleInputChange("")}
                className="absolute right-2.5 p-1 rounded-md text-ink/40 hover:text-ink hover:bg-black/5"
                title="Xóa link"
              >
                <X className="size-3.5" />
              </button>
            ) : null}
          </div>

          {rawInput && source in sourceLabels ? (
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
              <span className={`px-2 py-0.5 rounded-md font-semibold ${sourceLabels[source].color}`}>
                ✓ Nguồn: {sourceLabels[source].label}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="font-bold text-forest hover:underline inline-flex items-center gap-1"
              >
                {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
                {copied ? "Đã copy link chuẩn" : "Copy link ảnh chuẩn"}
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Tab 2: Upload from Device */}
      {activeTab === "upload" && (
        <div className="space-y-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-forest/30 hover:border-forest rounded-xl p-6 text-center cursor-pointer bg-forest/5 hover:bg-forest/10 transition"
          >
            <UploadCloud className="mx-auto size-8 text-forest/70 mb-2" />
            <p className="text-xs font-bold text-ink">
              {uploading ? "Đang tải ảnh lên máy chủ..." : "Nhấp để chọn file ảnh hoặc kéo thả vào đây"}
            </p>
            <p className="text-[11px] text-ink/50 mt-1">Hỗ trợ JPG, PNG, WebP, AVIF (Tối đa 50MB)</p>
          </div>

          {uploadError ? (
            <p className="text-xs font-semibold text-red-600">{uploadError}</p>
          ) : null}
        </div>
      )}

      {/* Live Preview Card */}
      {normalizedUrl ? (
        <div className="pt-2 border-t border-black/5 flex items-center gap-3">
          <div className="relative size-14 rounded-xl overflow-hidden bg-forest/10 border border-black/10 shrink-0">
            <AppImage src={normalizedUrl} alt="Xem trước ảnh" fill sizes="60px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1 text-xs">
            <p className="font-bold text-ink line-clamp-1">Xem trước hình ảnh</p>
            <p className="text-[11px] text-ink/50 font-mono line-clamp-1 mt-0.5">{normalizedUrl}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleCopy}
              className="p-2 rounded-lg bg-beige hover:bg-forest/10 text-forest transition"
              title="Sao chép link ảnh"
            >
              {copied ? <Check className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
            </button>
            <button
              type="button"
              onClick={() => handleInputChange("")}
              className="p-2 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600 transition"
              title="Xóa / gỡ ảnh này"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      ) : null}

      {helperText ? <p className="text-[11px] text-ink/50 leading-relaxed">{helperText}</p> : null}
    </div>
  );
}
