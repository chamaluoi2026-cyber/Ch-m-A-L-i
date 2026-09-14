"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Upload,
  Layers,
  Link as LinkIcon,
  Trash2,
  Check,
  Sparkles,
  Loader2,
  ExternalLink,
  Search,
  X,
  Image as ImageIcon
} from "lucide-react";
import { uploadImageClient } from "@/lib/upload-client";
import { getUploadedImagesAction, UploadedImageItem } from "@/app/actions/upload";
import { normalizeImageUrl } from "@/lib/image-helper";

export interface UnifiedImagePickerProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspectRatio?: "square" | "video" | "hero" | "card" | "wide" | "contain";
  category?: string;
  placeholder?: string;
  helperText?: string;
  onSaveImmediate?: (url: string) => Promise<void>;
  immediateSaveLabel?: string;
}

export function UnifiedImagePicker({
  label,
  value,
  onChange,
  aspectRatio = "video",
  category = "general",
  placeholder = "https://images.unsplash.com/...",
  helperText,
  onSaveImmediate,
  immediateSaveLabel = "Lưu ngay"
}: UnifiedImagePickerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [mediaList, setMediaList] = useState<UploadedImageItem[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  const [mediaSearch, setMediaSearch] = useState("");
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Aspect ratio classes
  const aspectClasses: Record<string, string> = {
    square: "aspect-square max-w-[180px]",
    card: "aspect-[4/3]",
    video: "aspect-video",
    hero: "aspect-[16/7]",
    wide: "aspect-[21/9]",
    contain: "aspect-[3/1] bg-stone-100/60"
  };

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const res = await uploadImageClient(file, { category });
      if (res.success && res.url) {
        onChange(res.url);
        if (onSaveImmediate) {
          setIsSaving(true);
          await onSaveImmediate(res.url);
          setIsSaving(false);
        }
      } else {
        alert(res.error || "Không thể tải ảnh lên.");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi khi tải ảnh.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  async function openMediaLibrary() {
    setIsMediaLibraryOpen(true);
    setIsLoadingMedia(true);
    try {
      const items = await getUploadedImagesAction();
      setMediaList(items || []);
    } catch {
      setMediaList([]);
    } finally {
      setIsLoadingMedia(false);
    }
  }

  function handleSelectFromMedia(url: string) {
    onChange(url);
    setIsMediaLibraryOpen(false);
    if (onSaveImmediate) {
      onSaveImmediate(url);
    }
  }

  function handleApplyUrl() {
    if (!urlInput.trim()) return;
    const normalized = normalizeImageUrl(urlInput.trim());
    onChange(normalized);
    setIsUrlModalOpen(false);
    setUrlInput("");
    if (onSaveImmediate) {
      onSaveImmediate(normalized);
    }
  }

  const filteredMedia = mediaList.filter((m) =>
    m.name.toLowerCase().includes(mediaSearch.toLowerCase())
  );

  return (
    <div className="space-y-3 rounded-2xl bg-white p-4 md:p-5 border border-black/5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
          <ImageIcon className="size-4 text-[#0F5C4A]" />
          {label}
        </label>
        {value && (
          <span className="text-[11px] font-mono text-stone-400 truncate max-w-[200px]">
            {value.startsWith("/") ? "Đã lưu nội bộ" : "Link CDN/Web"}
          </span>
        )}
      </div>

      {/* Image Preview Box */}
      <div className="relative rounded-2xl overflow-hidden border border-black/10 bg-stone-900 shadow-inner group">
        <div className={`w-full relative flex items-center justify-center ${aspectClasses[aspectRatio] || "aspect-video"}`}>
          {value ? (
            <img
              src={value}
              alt={label}
              className={`w-full h-full ${aspectRatio === "contain" ? "object-contain p-4" : "object-cover"} transition group-hover:scale-105 duration-300`}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-stone-400 p-6 text-center space-y-2">
              <Upload className="size-8 text-stone-500 animate-pulse" />
              <p className="text-xs font-semibold">Chưa có hình ảnh</p>
              <p className="text-[11px] text-stone-500">Tải ảnh từ máy tính hoặc chọn từ Kho Media</p>
            </div>
          )}

          {isUploading && (
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-2 z-10">
              <Loader2 className="size-8 animate-spin text-emerald-400" />
              <p className="text-xs font-bold">Đang tải và tối ưu ảnh...</p>
            </div>
          )}

          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute top-2.5 right-2.5 size-8 rounded-full bg-black/60 hover:bg-rose-600 text-white grid place-items-center transition shadow-md opacity-0 group-hover:opacity-100"
              title="Gỡ ảnh này"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* URL display or input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-3.5 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0F5C4A]"
        />
        {onSaveImmediate && (
          <button
            type="button"
            onClick={() => onSaveImmediate(value)}
            disabled={isSaving}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition flex items-center gap-1.5 flex-shrink-0"
          >
            {isSaving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
            {immediateSaveLabel}
          </button>
        )}
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelected}
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="flex-1 min-w-[130px] py-2 px-3 rounded-xl bg-[#0F5C4A] hover:bg-[#0F5C4A]/90 text-white text-xs font-bold shadow-sm transition flex items-center justify-center gap-1.5"
        >
          {isUploading ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
          Tải ảnh từ máy
        </button>

        <button
          type="button"
          onClick={openMediaLibrary}
          className="py-2 px-3.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold shadow-sm transition flex items-center gap-1.5"
        >
          <Layers className="size-3.5 text-[#0F5C4A]" />
          Kho Media
        </button>

        <button
          type="button"
          onClick={() => {
            setUrlInput(value || "");
            setIsUrlModalOpen(true);
          }}
          className="py-2 px-3.5 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold shadow-sm transition flex items-center gap-1.5"
        >
          <LinkIcon className="size-3.5 text-stone-500" />
          Dán URL
        </button>
      </div>

      {helperText && (
        <p className="text-[11px] text-stone-400 leading-relaxed">{helperText}</p>
      )}

      {/* Media Library Modal */}
      {isMediaLibraryOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-black/10 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Layers className="size-5 text-[#0F5C4A]" />
                  Kho Thư Viện Media
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">Chọn một ảnh có sẵn trên hệ thống để gán vào mục này</p>
              </div>
              <button
                type="button"
                onClick={() => setIsMediaLibraryOpen(false)}
                className="size-8 rounded-full bg-stone-100 hover:bg-stone-200 grid place-items-center text-stone-600 transition"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Search bar */}
            <div className="p-4 border-b border-stone-100 bg-stone-50/70 flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="size-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={mediaSearch}
                  onChange={(e) => setMediaSearch(e.target.value)}
                  placeholder="Tìm kiếm theo tên file..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-stone-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0F5C4A]"
                />
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 rounded-xl bg-[#0F5C4A] text-white text-xs font-bold hover:bg-[#0F5C4A]/90 transition flex items-center gap-1.5 flex-shrink-0"
              >
                <Upload className="size-3.5" />
                Tải ảnh mới
              </button>
            </div>

            {/* Grid Images */}
            <div className="p-5 flex-1 overflow-y-auto min-h-[300px]">
              {isLoadingMedia ? (
                <div className="h-64 flex flex-col items-center justify-center text-stone-400 space-y-3">
                  <Loader2 className="size-8 animate-spin text-[#0F5C4A]" />
                  <p className="text-xs">Đang nạp danh sách ảnh...</p>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-stone-400 space-y-2">
                  <ImageIcon className="size-10 text-stone-300" />
                  <p className="text-xs font-bold text-stone-600">Chưa tìm thấy ảnh phù hợp</p>
                  <p className="text-[11px] text-stone-400">Hãy tải ảnh mới từ máy tính</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {filteredMedia.map((item) => (
                    <div
                      key={item.url}
                      onClick={() => handleSelectFromMedia(item.url)}
                      className="group relative aspect-square rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 cursor-pointer hover:border-[#0F5C4A] hover:shadow-md transition"
                    >
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-2.5">
                        <p className="text-[11px] font-bold text-white truncate">{item.name}</p>
                        <span className="text-[10px] text-emerald-300 font-bold mt-0.5">Click để chọn</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-stone-100 bg-stone-50 flex items-center justify-between text-xs text-stone-500">
              <span>Tổng số: {mediaList.length} hình ảnh</span>
              <button
                type="button"
                onClick={() => setIsMediaLibraryOpen(false)}
                className="px-4 py-1.5 rounded-xl border border-stone-200 hover:bg-white text-stone-700 font-bold transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* URL Input Modal */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-black/10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <LinkIcon className="size-4 text-[#0F5C4A]" />
                Nhập liên kết ảnh
              </h3>
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(false)}
                className="size-7 rounded-full bg-stone-100 hover:bg-stone-200 grid place-items-center text-stone-500 transition"
              >
                <X className="size-3.5" />
              </button>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              Hỗ trợ link Unsplash, Google Drive (chia sẻ công khai), hoặc link ảnh trực tiếp từ bất kỳ website nào.
            </p>

            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-mono text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#0F5C4A]"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-700 text-xs font-bold transition"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleApplyUrl}
                disabled={!urlInput.trim()}
                className="px-4 py-2 rounded-xl bg-[#0F5C4A] hover:bg-[#0F5C4A]/90 text-white text-xs font-bold transition shadow-sm"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
