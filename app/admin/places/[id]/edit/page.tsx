"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { uploadImageClient } from "@/lib/upload-client";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Eye,
  Globe,
  Upload,
  X,
  Plus,
  Image as ImageIcon,
  Map,
  Building2,
  DollarSign,
  FileText,
  Settings,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  ExternalLink,
  ChevronDown,
  Star,
  Phone,
  Mail,
  MapPin,
  Clock,
  Users,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Heading2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Type,
  MessageSquare,
  Camera,
  Video,
  Film
} from "lucide-react";
import {
  getPlaceBySlugAction,
  savePlaceAction,
  uploadPlaceMediaAction,
  getSystemAssetsAction,
  getUploadedImagesAction,
  type PlaceRecord
} from "@/app/actions/upload";
import { placeCategories } from "@/data/places";

// URL thật của website khách hàng (Customer Web trên Vercel)
const CUSTOMER_URL = "https://chamaluoi.vercel.app";

// ─── Video helpers ─────────────────────────────────────────────────────────────
function parseYouTubeId(url: string): string | null {
  if (!url) return null;
  const clean = url.trim();
  const shortMatch = clean.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const watchMatch = clean.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  const embedMatch = clean.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  const shortsMatch = clean.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];
  return null;
}
function parseVimeoId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function generateSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function createEmptyPlace(): PlaceRecord {
  const now = new Date().toISOString();
  return {
    id: "", slug: "", name: "", category: "waterfall-stream", summary: "",
    description: "", status: "hidden", image: "", coverImage: "", imageAlt: "",
    gallery: [], priceLabel: "", priceMin: undefined, priceMax: undefined,
    priceUnit: "người", voucherOffer: "", voucherTerms: "", openingHours: "6:00 - 18:00",
    duration: "", maxGuests: "", businessName: "", businessId: "", phone: "",
    zaloUrl: "", email: "", website: "", businessAddress: "", address: "",
    lat: undefined, lng: undefined, mapEmbedUrl: "", directions: "",
    commissionRate: 10, commissionType: "booking", auditStatus: "active",
    highlights: [], activities: [], services: [], safetyNotes: [],
    suitableFor: [], faq: [], seoTitle: "", seoDescription: "", seoKeywords: "",
    ogImage: "", rating: 4.8, reviewCount: 0, createdAt: now, updatedAt: now
  };
}

// ─── Content Block types ──────────────────────────────────────────────────────
type ContentBlock =
  | { id: string; type: "paragraph"; content: string; align?: "left" | "center" | "right" }
  | { id: string; type: "heading"; level: 2 | 3; content: string }
  | { id: string; type: "image"; url: string; caption?: string; alt?: string }
  | { id: string; type: "gallery"; images: { id: string; url: string; caption?: string }[] }
  | { id: string; type: "quote"; content: string; author?: string }
  | { id: string; type: "divider" }
  | { id: string; type: "list"; style: "bullet" | "number"; items: string[] }
  | { id: string; type: "video"; url: string; caption?: string; aspectRatio?: "16/9" | "9/16" };

function blocksToText(blocks: ContentBlock[]): string {
  return blocks.map(b => {
    if (b.type === "paragraph") return b.content;
    if (b.type === "heading") return b.content;
    if (b.type === "quote") return b.content;
    if (b.type === "list") return b.items.join("\n");
    if (b.type === "video") return b.url;
    if (b.type === "image") return b.url;
    return "";
  }).filter(Boolean).join("\n\n");
}

function textToBlocks(text: string): ContentBlock[] {
  if (!text?.trim()) return [];
  return text.split(/\n\n+/).filter(Boolean).map((para, i) => {
    const trimmed = para.trim();
    if (parseYouTubeId(trimmed) || parseVimeoId(trimmed) || /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(trimmed)) {
      return {
        id: `b-${i}-${Date.now()}`,
        type: "video" as const,
        url: trimmed,
        aspectRatio: "16/9"
      };
    }
    return {
      id: `b-${i}-${Date.now()}`,
      type: "paragraph" as const,
      content: trimmed
    };
  });
}

let _blockId = 0;
function newId() { return `blk-${Date.now()}-${_blockId++}`; }

// ─── Section Nav Items ────────────────────────────────────────────────────────
const SECTIONS = [
  { id: "basic", label: "Thông tin cơ bản", icon: FileText },
  { id: "images", label: "Ảnh địa điểm", icon: ImageIcon },
  { id: "content", label: "Nội dung", icon: Type },
  { id: "pricing", label: "Giá & Ưu đãi", icon: DollarSign },
  { id: "business", label: "Đơn vị cung cấp", icon: Building2 },
  { id: "location", label: "Vị trí", icon: Map },
  { id: "commission", label: "Hoa hồng", icon: Star },
  { id: "seo", label: "SEO", icon: Settings }
];

// ─── TagInput ────────────────────────────────────────────────────────────────
function TagInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");
  function add() {
    const t = input.trim();
    if (t && !values.includes(t)) onChange([...values, t]);
    setInput("");
  }
  return (
    <div className="border border-gray-200 rounded-xl p-3 focus-within:border-forest transition">
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map(v => (
          <span key={v} className="flex items-center gap-1 bg-forest/10 text-forest px-2.5 py-1 rounded-full text-xs font-medium">
            {v}
            <button onClick={() => onChange(values.filter(x => x !== v))} type="button"><X size={11} /></button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text" value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); } }}
          className="flex-1 text-sm focus:outline-none text-gray-700"
          placeholder={placeholder || "Nhập rồi Enter..."}
        />
        <button onClick={add} type="button" className="text-xs text-forest hover:underline font-medium">Thêm</button>
      </div>
    </div>
  );
}

// ─── MediaPickerModal ────────────────────────────────────────────────────────
function MediaPickerModal({ onSelect, onClose, multiple = false }: {
  onSelect: (urls: string[]) => void;
  onClose: () => void;
  multiple?: boolean;
}) {
  const [assets, setAssets] = useState<{ id: string; url: string; name: string }[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [tab, setTab] = useState<"library" | "upload">("library");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const sys = (await getSystemAssetsAction() || []).map((a: { id: string; url: string; name: string }) => ({ id: a.id, url: a.url, name: a.name }));
        const up = (await getUploadedImagesAction() || []).map((a: { url: string; name: string }) => ({ id: a.url, url: a.url, name: a.name }));
        const seen = new Set<string>();
        setAssets([...sys, ...up].filter(a => { if (seen.has(a.url)) return false; seen.add(a.url); return true; }));
      } catch { setAssets([]); }
    })();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of files) {
      try {
        const res = await uploadImageClient(file, { category: "places" });
        if (res.success && res.url) newUrls.push(res.url);
      } catch (err) {
        console.error("Lỗi tải ảnh:", err);
      }
    }
    if (newUrls.length) {
      setAssets(prev => [...newUrls.map(url => ({ id: url, url, name: url.split("/").pop() || url })), ...prev]);
      if (!multiple) { onSelect([newUrls[0]]); onClose(); return; }
      setSelected(prev => [...prev, ...newUrls]);
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function toggle(url: string) {
    if (!multiple) { onSelect([url]); onClose(); return; }
    setSelected(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="font-bold text-lg text-gray-800">Chọn ảnh</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500"><X size={20} /></button>
        </div>
        <div className="flex gap-2 px-5 pt-4">
          {(["library", "upload"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${tab === t ? "bg-forest text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              {t === "library" ? "Thư viện ảnh" : "Tải ảnh lên"}
            </button>
          ))}
        </div>
        {tab === "upload" ? (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-forest transition w-full max-w-md" onClick={() => fileRef.current?.click()}>
              {uploading ? <Loader2 className="mx-auto text-forest animate-spin mb-3" size={40} /> : <Upload className="mx-auto text-gray-400 mb-3" size={40} />}
              <p className="text-gray-600 font-medium">Nhấn để chọn ảnh tải lên</p>
              <p className="text-sm text-gray-400 mt-1">PNG, JPG, WEBP — tối đa 100MB</p>
              <input ref={fileRef} type="file" accept="image/*" multiple={multiple} onChange={handleUpload} className="hidden" />
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5">
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
              {assets.map(asset => (
                <div key={asset.id} onClick={() => toggle(asset.url)}
                  className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition ${selected.includes(asset.url) ? "border-forest ring-2 ring-forest" : "border-transparent hover:border-gray-300"}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                  {selected.includes(asset.url) && (
                    <div className="absolute top-1 right-1 bg-forest rounded-full p-0.5"><CheckCircle size={16} className="text-white" /></div>
                  )}
                </div>
              ))}
              {!assets.length && (
                <div className="col-span-5 text-center py-12 text-gray-400">
                  <ImageIcon size={48} className="mx-auto mb-3 opacity-30" /><p>Chưa có ảnh</p>
                </div>
              )}
            </div>
          </div>
        )}
        {multiple && (
          <div className="flex items-center justify-between p-5 border-t bg-gray-50">
            <span className="text-sm text-gray-600">Đã chọn: <strong>{selected.length}</strong> ảnh</span>
            <div className="flex gap-3">
              <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-100">Hủy</button>
              <button onClick={() => { onSelect(selected); onClose(); }} disabled={!selected.length}
                className="px-4 py-2 text-sm rounded-lg bg-forest text-white font-medium hover:bg-forest/90 disabled:opacity-40">
                Thêm {selected.length} ảnh
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Block Editor Atom ────────────────────────────────────────────────────────
function BlockEditor({ block, idx, total, onUpdate, onRemove, onMove, onPicker }: {
  block: ContentBlock; idx: number; total: number;
  onUpdate: (p: Partial<ContentBlock>) => void;
  onRemove: () => void;
  onMove: (d: "up" | "down") => void;
  onPicker: (cb: (urls: string[]) => void, multi?: boolean) => void;
}) {
  const [hover, setHover] = useState(false);
  return (
    <div className="group relative border border-transparent hover:border-gray-200 rounded-xl p-1 transition" onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <div className={`absolute -left-8 top-3 flex flex-col gap-1 transition-opacity ${hover ? "opacity-100" : "opacity-0"}`}>
        <button onClick={() => onMove("up")} disabled={idx === 0} className="p-1 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-30"><ChevronDown size={12} className="rotate-180" /></button>
        <button onClick={() => onMove("down")} disabled={idx === total - 1} className="p-1 rounded hover:bg-gray-100 text-gray-400 disabled:opacity-30"><ChevronDown size={12} /></button>
      </div>
      <div className={`absolute -right-8 top-3 transition-opacity ${hover ? "opacity-100" : "opacity-0"}`}>
        <button onClick={onRemove} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500"><X size={14} /></button>
      </div>

      {block.type === "paragraph" && (
        <div>
          <div className="flex gap-2 mb-1">
            {(["left","center","right"] as const).map(a => (
              <button key={a} type="button" onClick={() => onUpdate({ align: a })}
                className={`p-1 rounded text-xs ${block.align === a ? "bg-forest text-white" : "text-gray-400 hover:bg-gray-100"}`}>
                {a === "left" ? <AlignLeft size={12} /> : a === "center" ? <AlignCenter size={12} /> : <AlignRight size={12} />}
              </button>
            ))}
          </div>
          <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm resize-none focus:outline-none focus:border-forest"
            rows={4} value={block.content} onChange={e => onUpdate({ content: e.target.value })} placeholder="Nhập đoạn văn..." />
        </div>
      )}

      {block.type === "heading" && (
        <div className="flex gap-2">
          <select value={block.level} onChange={e => onUpdate({ level: Number(e.target.value) as 2|3 })}
            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs shrink-0 focus:outline-none focus:border-forest">
            <option value={2}>H2</option><option value={3}>H3</option>
          </select>
          <input type="text" value={block.content} onChange={e => onUpdate({ content: e.target.value })}
            className={`flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:border-forest ${block.level === 2 ? "text-lg font-bold" : "text-base font-semibold"}`}
            placeholder="Tiêu đề..." />
        </div>
      )}

      {block.type === "quote" && (
        <div className="border-l-4 border-forest/40 pl-4 space-y-2">
          <textarea className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm italic resize-none focus:outline-none focus:border-forest"
            rows={3} value={block.content} onChange={e => onUpdate({ content: e.target.value })} placeholder="Trích dẫn..." />
          <input type="text" value={block.author || ""} onChange={e => onUpdate({ author: e.target.value })}
            className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-forest" placeholder="Tác giả (tuỳ chọn)" />
        </div>
      )}

      {block.type === "list" && (
        <div>
          <div className="flex gap-2 mb-2">
            {(["bullet","number"] as const).map(s => (
              <button key={s} type="button" onClick={() => onUpdate({ style: s })}
                className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs border ${block.style === s ? "border-forest bg-forest/10 text-forest" : "border-gray-200 text-gray-500"}`}>
                {s === "bullet" ? <><List size={12} /> Bullet</> : <><ListOrdered size={12} /> Số TT</>}
              </button>
            ))}
          </div>
          <div className="space-y-1.5">
            {block.items.map((item, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-gray-400 text-xs shrink-0 w-5 text-right">{block.style === "bullet" ? "•" : `${i + 1}.`}</span>
                <input type="text" value={item}
                  onChange={e => { const it = [...block.items]; it[i] = e.target.value; onUpdate({ items: it }); }}
                  onKeyDown={e => {
                    if (e.key === "Enter") { e.preventDefault(); const it = [...block.items]; it.splice(i+1,0,""); onUpdate({ items: it }); }
                    if (e.key === "Backspace" && item === "" && block.items.length > 1) onUpdate({ items: block.items.filter((_,j)=>j!==i) });
                  }}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-forest" placeholder={`Mục ${i+1}...`} />
                {block.items.length > 1 && (
                  <button type="button" onClick={() => onUpdate({ items: block.items.filter((_,j)=>j!==i) })} className="p-1 text-gray-400 hover:text-red-400"><X size={14} /></button>
                )}
              </div>
            ))}
            <button type="button" onClick={() => onUpdate({ items: [...block.items, ""] })} className="flex items-center gap-1 text-xs text-forest hover:underline mt-1">
              <Plus size={12} /> Thêm mục
            </button>
          </div>
        </div>
      )}

      {block.type === "divider" && (
        <div className="flex items-center gap-3 py-3">
          <div className="flex-1 border-t border-dashed border-gray-300" />
          <span className="text-xs text-gray-400">— Phân cách —</span>
          <div className="flex-1 border-t border-dashed border-gray-300" />
        </div>
      )}

      {block.type === "image" && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          {block.url ? (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={block.url} alt={block.alt || ""} className="w-full max-h-80 object-contain bg-gray-50" />
              <button type="button" onClick={() => onUpdate({ url: "" })} className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5 shadow hover:bg-red-50 text-gray-600 hover:text-red-500"><X size={14} /></button>
            </div>
          ) : (
            <button type="button" onClick={() => onPicker(([url]) => onUpdate({ url }))}
              className="w-full py-12 flex flex-col items-center gap-2 text-gray-400 hover:bg-gray-50 transition">
              <ImageIcon size={36} className="opacity-40" /><span className="text-sm">Nhấn để chọn ảnh</span>
            </button>
          )}
          <div className="p-3 bg-white border-t border-gray-100">
            <input type="text" value={block.caption || ""} onChange={e => onUpdate({ caption: e.target.value })}
              className="w-full text-xs text-center border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:border-forest text-gray-600" placeholder="Chú thích ảnh (tuỳ chọn)" />
          </div>
        </div>
      )}

      {block.type === "gallery" && (
        <div className="border border-gray-200 rounded-xl p-4">
          <div className="grid grid-cols-3 gap-3 mb-3">
            {block.images.map((img, i) => (
              <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group/img">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.caption || ""} className="w-full h-full object-cover" />
                <button type="button" onClick={() => onUpdate({ images: block.images.filter((_,j)=>j!==i) })}
                  className="absolute top-1 right-1 bg-white/90 rounded-full p-1 opacity-0 group-hover/img:opacity-100 transition"><X size={12} className="text-red-500" /></button>
              </div>
            ))}
              <button type="button" onClick={() => onPicker(urls => onUpdate({ images: [...block.images, ...urls.map(url=>({id:newId(),url,caption:""}))] }), true)}
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-forest hover:text-forest transition">
              <Plus size={24} /><span className="text-xs mt-1">Thêm ảnh</span>
            </button>
          </div>
        </div>
      )}

      {block.type === "video" && (
        <div className="border border-rose-200 rounded-xl bg-rose-50/40 p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Video size={15} className="text-rose-600" />
            <span className="text-xs font-semibold text-rose-800 uppercase tracking-wide">Khối Video</span>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Đường dẫn video (URL):</label>
            <input type="text" value={block.url} onChange={e => onUpdate({ url: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-rose-400 bg-white"
              placeholder="https://youtube.com/watch?v=... hoặc https://youtu.be/..." />
            <p className="text-[11px] text-gray-400 mt-0.5">Hỗ trợ YouTube (kể cả Shorts), Vimeo, MP4 trực tiếp</p>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">Chú thích video (Tùy chọn):</label>
            <input type="text" value={block.caption || ""} onChange={e => onUpdate({ caption: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-rose-400 bg-white" placeholder="Mô tả ngắn về video..." />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-medium">Tỉ lệ:</span>
            {(["16/9", "9/16"] as const).map(ar => (
              <button key={ar} type="button" onClick={() => onUpdate({ aspectRatio: ar })}
                className={`px-2.5 py-1 rounded text-xs font-bold border transition ${block.aspectRatio === ar || (!block.aspectRatio && ar === "16/9") ? "border-rose-500 bg-rose-500 text-white" : "border-gray-200 text-gray-500 hover:border-rose-400"}`}>
                {ar === "16/9" ? "16:9 Ngang" : "9:16 Dọc"}
              </button>
            ))}
          </div>
          {block.url && (
            <div className={`relative overflow-hidden rounded-xl bg-black border border-black/10 ${block.aspectRatio === "9/16" || block.url.includes("/shorts/") ? "max-w-[200px] mx-auto aspect-[9/16]" : "w-full aspect-video"}`}>
              {parseYouTubeId(block.url) ? (
                <iframe src={`https://www.youtube-nocookie.com/embed/${parseYouTubeId(block.url)}?rel=0`}
                  title={block.caption || "Video"} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen className="absolute inset-0 h-full w-full border-0" />
              ) : parseVimeoId(block.url) ? (
                <iframe src={`https://player.vimeo.com/video/${parseVimeoId(block.url)}?dnt=1`}
                  title={block.caption || "Video"} allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen className="absolute inset-0 h-full w-full border-0" />
              ) : /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(block.url) ? (
                <video src={block.url} controls playsInline className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white p-3 text-center">
                  <Film size={24} className="text-rose-400" />
                  <a href={block.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-rose-300 underline break-all">{block.url}</a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── RichEditor ───────────────────────────────────────────────────────────────
function RichEditor({ blocks, onChange, onPicker }: {
  blocks: ContentBlock[];
  onChange: (b: ContentBlock[]) => void;
  onPicker: (cb: (urls: string[]) => void, multi?: boolean) => void;
}) {
  function upd(id: string, patch: Partial<ContentBlock>) {
    onChange(blocks.map(b => b.id === id ? { ...b, ...patch } as ContentBlock : b));
  }
  function remove(id: string) { onChange(blocks.filter(b => b.id !== id)); }
  function add(type: ContentBlock["type"]) {
    const id = newId();
    let nb: ContentBlock;
    if (type === "paragraph") nb = { id, type, content: "" };
    else if (type === "heading") nb = { id, type, level: 2, content: "" };
    else if (type === "quote") nb = { id, type, content: "", author: "" };
    else if (type === "list") nb = { id, type, style: "bullet", items: [""] };
    else if (type === "divider") nb = { id, type };
    else if (type === "image") nb = { id, type, url: "", caption: "" };
    else if (type === "gallery") nb = { id, type, images: [] };
    else if (type === "video") nb = { id, type, url: "", caption: "", aspectRatio: "16/9" };
    else nb = { id, type: "paragraph", content: "" };
    onChange([...blocks, nb]);
  }
  function move(id: string, dir: "up" | "down") {
    const i = blocks.findIndex(b => b.id === id);
    if ((dir==="up"&&i===0)||(dir==="down"&&i===blocks.length-1)) return;
    const nb = [...blocks];
    const sw = dir==="up"?i-1:i+1;
    [nb[i],nb[sw]] = [nb[sw],nb[i]];
    onChange(nb);
  }
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => (
        <BlockEditor key={b.id} block={b} idx={i} total={blocks.length}
          onUpdate={p => upd(b.id, p)} onRemove={() => remove(b.id)} onMove={d => move(b.id, d)} onPicker={onPicker} />
      ))}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed border-gray-200">
        <span className="text-xs text-gray-400 w-full mb-1">Thêm khối nội dung:</span>
        {[
          { type: "paragraph", icon: AlignLeft, label: "Đoạn văn" },
          { type: "heading", icon: Heading2, label: "Tiêu đề" },
          { type: "image", icon: ImageIcon, label: "Hình ảnh" },
          { type: "gallery", icon: Camera, label: "Bộ sưu tập" },
          { type: "quote", icon: Quote, label: "Trích dẫn" },
          { type: "list", icon: List, label: "Danh sách" },
          { type: "divider", icon: Minus, label: "Phân cách" },
          { type: "video", icon: Video, label: "Video" }
        ].map(({ type, icon: Icon, label }) => (
          <button key={type} type="button" onClick={() => add(type as ContentBlock["type"])}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border transition ${type === "video" ? "border-rose-300 text-rose-700 hover:border-rose-500 hover:bg-rose-50" : "border-gray-200 text-gray-600 hover:border-forest hover:text-forest hover:bg-forest/5"}`}>
            <Icon size={13} />{label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
function PlaceEditPageContent() {
  const params = useParams();
  const router = useRouter();
  const placeId = params?.id as string;
  const isNew = placeId === "new";

  const [place, setPlace] = useState<PlaceRecord>(createEmptyPlace());
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success"|"error"; msg: string } | null>(null);
  const [pickerCb, setPickerCb] = useState<{ cb: (u: string[]) => void; multi: boolean } | null>(null);
  const [activeSection, setActiveSection] = useState("basic");
  const [slugManual, setSlugManual] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  function showToast(type: "success"|"error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  useEffect(() => {
    if (isNew) { setLoading(false); return; }
    (async () => {
      setLoading(true);
      const data = await getPlaceBySlugAction(placeId);
      if (data) { setPlace(data); if (data.description) setContentBlocks(textToBlocks(data.description)); }
      setLoading(false);
    })();
  }, [placeId, isNew]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { threshold: 0.25, rootMargin: "-80px 0px -60% 0px" }
    );
    Object.values(sectionRefs.current).forEach(el => el && obs.observe(el));
    return () => obs.disconnect();
  }, [loading]);

  function upd(patch: Partial<PlaceRecord>) {
    setPlace(prev => {
      const next = { ...prev, ...patch };
      if ("name" in patch && !slugManual && isNew) next.slug = generateSlug(patch.name || "");
      return next;
    });
  }

  function openPicker(cb: (urls: string[]) => void, multi = false) {
    setPickerCb({ cb, multi });
  }

  async function handleSave(publish: boolean) {
    setSaving(true);
    try {
      const toSave: PlaceRecord = {
        ...place,
        description: blocksToText(contentBlocks),
        status: publish ? "active" : (place.status === "active" ? "active" : "hidden"),
        id: place.id || place.slug,
        seoTitle: place.seoTitle || place.name,
        seoDescription: place.seoDescription || place.summary
      };
      const res = await savePlaceAction(toSave);
      if (res.success && res.place) {
        setPlace(res.place);
        showToast("success", publish ? "Đã xuất bản địa điểm!" : "Đã lưu bản nháp!");
        if (isNew && res.place.slug) router.replace(`/admin/places/${res.place.slug}/edit`);
      } else {
        showToast("error", res.error || "Không thể lưu.");
      }
    } catch { showToast("error", "Lỗi không xác định."); }
    setSaving(false);
  }

  function getGalleryUrl(item: string | { url: string }) { return typeof item === "string" ? item : item.url; }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 size={40} className="animate-spin text-forest" />
          <p className="text-sm">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const sRef = (id: string) => (el: HTMLElement | null) => { sectionRefs.current[id] = el; };

  return (
    <div className="min-h-screen bg-[#f8f5f0]">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-white text-sm font-medium ${toast.type === "success" ? "bg-forest" : "bg-red-500"}`}>
          {toast.type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* ── Sticky Top Bar ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center gap-4">
          <Link href="/admin/places" className="flex items-center gap-2 text-sm text-gray-500 hover:text-forest transition shrink-0">
            <ArrowLeft size={16} /><span className="hidden sm:inline">Quản lý địa điểm</span>
          </Link>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-gray-800 truncate">{place.name || (isNew ? "Địa điểm mới" : "Chỉnh sửa")}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${place.status === "active" ? "bg-green-100 text-green-700" : place.status === "temporarily_closed" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>
                {place.status === "active" ? "Đang hoạt động" : place.status === "temporarily_closed" ? "Tạm đóng" : "Ẩn"}
              </span>
              {place.slug && <span className="text-xs text-gray-400">/places/{place.slug}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {place.slug && place.status === "active" && (
              <a href={`${CUSTOMER_URL}/places/${place.slug}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:border-forest hover:text-forest transition">
                <ExternalLink size={13} /><span className="hidden sm:inline">Xem trang</span>
              </a>
            )}
            {place.slug && (
              <a href={`${CUSTOMER_URL}/places/${place.slug}?preview=true`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 text-xs rounded-lg border border-gray-200 text-gray-600 hover:border-forest hover:text-forest transition">
                <Eye size={13} /><span className="hidden sm:inline">Xem trước</span>
              </a>
            )}
            <button onClick={() => handleSave(false)} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              <span className="hidden sm:inline">Lưu nháp</span>
            </button>
            <button onClick={() => handleSave(true)} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg bg-forest text-white hover:bg-forest/90 transition font-medium disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
              {place.status === "active" ? "Cập nhật" : "Xuất bản"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="max-w-[1400px] mx-auto px-6 py-6 flex gap-6">
        {/* Left Nav */}
        <aside className="w-48 shrink-0 hidden lg:block">
          <nav className="sticky top-24 space-y-1">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button key={id} type="button"
                onClick={() => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm transition ${activeSection === id ? "bg-forest text-white font-medium shadow-sm" : "text-gray-600 hover:bg-white hover:text-gray-900"}`}>
                <Icon size={15} /><span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Sections */}
        <div className="flex-1 space-y-6 min-w-0">

          {/* ── THÔNG TIN CƠ BẢN ── */}
          <section id="basic" ref={sRef("basic")} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <FileText size={16} className="text-forest" />
              <h2 className="font-semibold text-gray-800">Thông tin cơ bản</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên địa điểm <span className="text-red-400">*</span></label>
                <input type="text" value={place.name} onChange={e => upd({ name: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-base font-medium focus:outline-none focus:border-forest transition" placeholder="Vd: Thác A Nôr" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Đường dẫn (Slug)</label>
                <div className="flex gap-2">
                  <span className="flex items-center px-3 py-2.5 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-400 shrink-0">/places/</span>
                  <input type="text" value={place.slug}
                    onChange={e => { setSlugManual(true); upd({ slug: e.target.value }); }}
                    className="flex-1 border border-gray-200 rounded-r-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-forest transition" placeholder="ten-dia-diem" />
                </div>
                {!slugManual && isNew && <p className="text-xs text-gray-400 mt-1">Tự động từ tên. Nhấn để chỉnh sửa.</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Danh mục</label>
                <select value={place.category} onChange={e => upd({ category: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest transition">
                  {placeCategories.filter(c => c.id !== "all").map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mô tả ngắn</label>
                <textarea value={place.summary} onChange={e => upd({ summary: e.target.value })} rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-forest transition" placeholder="Tóm tắt 1–2 câu..." />
                <div className="text-right text-xs text-gray-400 mt-1">{place.summary.length}/300</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Trạng thái</label>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { value: "active", label: "Hoạt động", cls: "border-green-500 bg-green-50 text-green-700" },
                    { value: "temporarily_closed", label: "Tạm đóng", cls: "border-yellow-500 bg-yellow-50 text-yellow-700" },
                    { value: "hidden", label: "Ẩn", cls: "border-gray-400 bg-gray-100 text-gray-700" }
                  ].map(s => (
                    <label key={s.value} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition text-sm ${place.status === s.value ? s.cls : "border-gray-200 text-gray-500 hover:border-gray-300"}`}>
                      <input type="radio" name="status" value={s.value} checked={place.status === s.value} onChange={() => upd({ status: s.value as PlaceRecord["status"] })} className="hidden" />
                      {s.label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5"><Clock size={13} className="inline mr-1" />Giờ mở cửa</label>
                  <input type="text" value={place.openingHours} onChange={e => upd({ openingHours: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest transition" placeholder="6:00 - 18:00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5"><Clock size={13} className="inline mr-1" />Thời lượng</label>
                  <input type="text" value={place.duration || ""} onChange={e => upd({ duration: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest transition" placeholder="2 - 4 tiếng" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5"><Users size={13} className="inline mr-1" />Sức chứa tối đa</label>
                <input type="text" value={place.maxGuests || ""} onChange={e => upd({ maxGuests: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest transition" placeholder="50 - 100 khách" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Điểm nổi bật</label><TagInput values={place.highlights} onChange={v => upd({ highlights: v })} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Hoạt động</label><TagInput values={place.activities} onChange={v => upd({ activities: v })} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Dịch vụ</label><TagInput values={place.services} onChange={v => upd({ services: v })} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1.5">Lưu ý an toàn</label><TagInput values={place.safetyNotes} onChange={v => upd({ safetyNotes: v })} /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phù hợp với</label>
                <TagInput values={place.suitableFor || []} onChange={v => upd({ suitableFor: v })} placeholder="Gia đình, Cặp đôi..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2"><MessageSquare size={13} className="inline mr-1" />Câu hỏi thường gặp (FAQ)</label>
                <div className="space-y-3">
                  {(place.faq || []).map((faq, i) => (
                    <div key={i} className="border border-gray-200 rounded-xl p-4 relative group">
                      <button type="button" onClick={() => upd({ faq: (place.faq || []).filter((_,j)=>j!==i) })}
                        className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition"><X size={14} /></button>
                      <input type="text" value={faq.question}
                        onChange={e => { const f=[...(place.faq||[])]; f[i]={...f[i],question:e.target.value}; upd({faq:f}); }}
                        className="w-full font-medium text-sm border-none outline-none mb-2 text-gray-800" placeholder="Câu hỏi..." />
                      <textarea value={faq.answer}
                        onChange={e => { const f=[...(place.faq||[])]; f[i]={...f[i],answer:e.target.value}; upd({faq:f}); }}
                        rows={2} className="w-full text-sm border-none outline-none resize-none text-gray-600" placeholder="Câu trả lời..." />
                    </div>
                  ))}
                  <button type="button" onClick={() => upd({ faq: [...(place.faq||[]), {question:"",answer:""}] })}
                    className="flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-forest hover:text-forest transition w-full justify-center">
                    <Plus size={15} />Thêm câu hỏi
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* ── ẢNH ĐỊA ĐIỂM ── */}
          <section id="images" ref={sRef("images")} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <ImageIcon size={16} className="text-forest" />
              <h2 className="font-semibold text-gray-800">Ảnh địa điểm</h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh bìa (cover)</label>
                <div className="relative rounded-2xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50 hover:border-forest transition cursor-pointer group"
                  style={{ aspectRatio: "16/7" }}
                  onClick={() => !place.image && openPicker(([url]) => upd({ image: url, coverImage: url }))}>
                  {place.image ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={place.image} alt={place.name} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3">
                        <button type="button" onClick={e => { e.stopPropagation(); openPicker(([url]) => upd({ image: url, coverImage: url })); }}
                          className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-sm font-medium text-gray-800 hover:bg-gray-100">
                          <Upload size={14} />Đổi ảnh bìa
                        </button>
                        <button type="button" onClick={e => { e.stopPropagation(); upd({ image: "", coverImage: "" }); }}
                          className="p-2 bg-white/80 rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-500"><Trash2 size={14} /></button>
                      </div>
                    </>
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400">
                      <ImageIcon size={48} className="opacity-30" />
                      <p className="text-sm font-medium">Nhấn để chọn ảnh bìa</p>
                      <p className="text-xs opacity-70">Tỷ lệ lý tưởng: 16:7</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thư viện ảnh <span className="text-gray-400 font-normal">({(place.gallery||[]).length} ảnh)</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                  {(place.gallery||[]).map((item, i) => {
                    const url = getGalleryUrl(item);
                    return (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => { const g=[...(place.gallery||[])]; g.splice(i,1); upd({gallery:g}); }}
                          className="absolute top-1 right-1 bg-white/90 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition shadow">
                          <X size={12} className="text-red-500" />
                        </button>
                      </div>
                    );
                  })}
                  <button type="button" onClick={() => openPicker(urls => upd({ gallery: [...(place.gallery||[]), ...urls.map(url=>({url,alt:"",caption:""}))]}), true)}
                    className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:border-forest hover:text-forest hover:bg-forest/5 transition">
                    <Plus size={24} /><span className="text-xs mt-1">Thêm ảnh</span>
                  </button>
                </div>
              </div>
              {/* Video giới thiệu địa điểm */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-2">
                  <Video size={14} className="text-rose-600" />
                  Video giới thiệu địa điểm <span className="font-normal text-gray-400">(Tùy chọn)</span>
                </label>
                <input
                  type="text"
                  value={place.videoUrl || ""}
                  onChange={e => upd({ videoUrl: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-rose-400 transition"
                  placeholder="https://youtube.com/watch?v=... hoặc https://youtu.be/..."
                />
                <p className="text-xs text-gray-400 mt-1.5">Hỗ trợ YouTube (kể cả Shorts), Vimeo, và file MP4 trực tiếp. Video sẽ hiển thị nổi bật trên trang chi tiết địa điểm.</p>
                {place.videoUrl && parseYouTubeId(place.videoUrl) && (
                  <div className="mt-3 aspect-video rounded-xl overflow-hidden bg-black border border-black/10 max-w-md">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${parseYouTubeId(place.videoUrl)}?rel=0`}
                      title="Xem trước video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full border-0"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── NỘI DUNG CHI TIẾT ── */}
          <section id="content" ref={sRef("content")} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2"><Type size={16} className="text-forest" /><h2 className="font-semibold text-gray-800">Nội dung chi tiết</h2></div>
              <span className="text-xs text-gray-400">{contentBlocks.length} khối</span>
            </div>
            <div className="p-6 pl-14">
              <RichEditor blocks={contentBlocks} onChange={setContentBlocks} onPicker={openPicker} />
            </div>
          </section>

          {/* ── GIÁ & ƯU ĐÃI ── */}
          <section id="pricing" ref={sRef("pricing")} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <DollarSign size={16} className="text-forest" /><h2 className="font-semibold text-gray-800">Giá & Ưu đãi</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nhãn giá (hiển thị)</label>
                <input type="text" value={place.priceLabel} onChange={e => upd({ priceLabel: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest transition" placeholder="Từ 150.000đ/người" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Giá từ (VNĐ)</label>
                  <input type="number" value={place.priceMin ?? ""} onChange={e => upd({ priceMin: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest transition" placeholder="150000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Giá đến (VNĐ)</label>
                  <input type="number" value={place.priceMax ?? ""} onChange={e => upd({ priceMax: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest transition" placeholder="500000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Đơn vị</label>
                  <input type="text" value={place.priceUnit || ""} onChange={e => upd({ priceUnit: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest transition" placeholder="người" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ưu đãi Voucher</label>
                <input type="text" value={place.voucherOffer} onChange={e => upd({ voucherOffer: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest transition" placeholder="Giảm 10% khi đặt qua Chạm A Lưới" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Điều kiện áp dụng</label>
                <textarea value={place.voucherTerms || ""} onChange={e => upd({ voucherTerms: e.target.value })} rows={2}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-forest transition" placeholder="Áp dụng khi đặt chỗ trước..." />
              </div>
            </div>
          </section>

          {/* ── ĐƠN VỊ CUNG CẤP ── */}
          <section id="business" ref={sRef("business")} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Building2 size={16} className="text-forest" /><h2 className="font-semibold text-gray-800">Đơn vị cung cấp</h2>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tên đơn vị</label>
                  <input type="text" value={place.businessName} onChange={e => upd({ businessName: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest transition" placeholder="HTX Du lịch A Nôr" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5"><Phone size={12} className="inline mr-1" />Số điện thoại</label>
                  <input type="text" value={place.phone} onChange={e => upd({ phone: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest transition" placeholder="0905 000 118" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5"><Mail size={12} className="inline mr-1" />Email</label>
                  <input type="email" value={place.email || ""} onChange={e => upd({ email: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest transition" placeholder="contact@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5"><LinkIcon size={12} className="inline mr-1" />Zalo</label>
                  <input type="url" value={place.zaloUrl} onChange={e => upd({ zaloUrl: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest transition" placeholder="https://zalo.me/..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Website</label>
                  <input type="url" value={place.website || ""} onChange={e => upd({ website: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest transition" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5"><MapPin size={12} className="inline mr-1" />Địa chỉ đơn vị</label>
                  <input type="text" value={place.businessAddress || ""} onChange={e => upd({ businessAddress: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest transition" placeholder="Thôn A Nôr, xã Hồng Kim..." />
                </div>
              </div>
            </div>
          </section>

          {/* ── VỊ TRÍ ── */}
          <section id="location" ref={sRef("location")} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Map size={16} className="text-forest" /><h2 className="font-semibold text-gray-800">Vị trí</h2>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Địa chỉ đầy đủ</label>
                <input type="text" value={place.address} onChange={e => upd({ address: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest transition" placeholder="Thôn A Nôr, xã Hồng Kim, huyện A Lưới..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Vĩ độ (Latitude)</label>
                  <input type="number" step="0.0001" value={place.lat ?? ""} onChange={e => upd({ lat: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-forest transition" placeholder="16.2340" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kinh độ (Longitude)</label>
                  <input type="number" step="0.0001" value={place.lng ?? ""} onChange={e => upd({ lng: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-forest transition" placeholder="107.2560" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Google Maps Embed URL</label>
                <input type="url" value={place.mapEmbedUrl} onChange={e => upd({ mapEmbedUrl: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-forest transition" placeholder="https://www.google.com/maps/embed?pb=..." />
                <p className="text-xs text-gray-400 mt-1">Google Maps → Chia sẻ → Nhúng bản đồ → Sao chép link src</p>
              </div>
              {place.mapEmbedUrl && (
                <div className="rounded-xl overflow-hidden border border-gray-200 h-64">
                  <iframe src={place.mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Hướng dẫn đường đi</label>
                <textarea value={place.directions || ""} onChange={e => upd({ directions: e.target.value })} rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-forest transition" placeholder="Từ trung tâm A Lưới..." />
              </div>
            </div>
          </section>

          {/* ── HOA HỒNG ── */}
          <section id="commission" ref={sRef("commission")} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Star size={16} className="text-forest" /><h2 className="font-semibold text-gray-800">Hoa hồng & Đánh giá</h2>
            </div>
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Tỷ lệ hoa hồng (%)</label>
                  <input type="number" min={0} max={100} value={place.commissionRate} onChange={e => upd({ commissionRate: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Loại hoa hồng</label>
                  <select value={place.commissionType || "booking"} onChange={e => upd({ commissionType: e.target.value as PlaceRecord["commissionType"] })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest transition">
                    <option value="booking">Theo đặt chỗ</option>
                    <option value="voucher">Theo voucher</option>
                    <option value="fixed">Cố định</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Trạng thái kiểm toán</label>
                  <select value={place.auditStatus || "active"} onChange={e => upd({ auditStatus: e.target.value as PlaceRecord["auditStatus"] })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest transition">
                    <option value="active">Đang hoạt động</option>
                    <option value="pending">Chờ xác nhận</option>
                    <option value="reconciled">Đã đối soát</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Đánh giá (0–5)</label>
                  <input type="number" min={0} max={5} step={0.1} value={place.rating} onChange={e => upd({ rating: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest transition" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Số lượt đánh giá</label>
                  <input type="number" min={0} value={place.reviewCount} onChange={e => upd({ reviewCount: Number(e.target.value) })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest transition" />
                </div>
              </div>
            </div>
          </section>

          {/* ── SEO ── */}
          <section id="seo" ref={sRef("seo")} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
              <Settings size={16} className="text-forest" /><h2 className="font-semibold text-gray-800">SEO</h2>
            </div>
            <div className="p-6 space-y-5">
              {(place.seoTitle || place.name) && (
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <p className="text-xs text-gray-400 mb-2 font-medium">Xem trước kết quả Google:</p>
                  <p className="text-blue-600 text-base font-medium">{place.seoTitle || `${place.name} | Du lịch cộng đồng A Lưới`}</p>
                  <p className="text-green-700 text-xs mt-0.5">chamaluoi.vn/places/{place.slug}</p>
                  <p className="text-sm text-gray-600 mt-1">{place.seoDescription || place.summary || "Mô tả SEO..."}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">SEO Title</label>
                <input type="text" value={place.seoTitle || ""} onChange={e => upd({ seoTitle: e.target.value })} maxLength={70}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest transition"
                  placeholder={`${place.name} | Du lịch cộng đồng A Lưới`} />
                <div className="text-right text-xs mt-1">
                  <span className={(place.seoTitle?.length||0) > 60 ? "text-red-400" : "text-gray-400"}>{place.seoTitle?.length||0}/70</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">SEO Description</label>
                <textarea value={place.seoDescription || ""} onChange={e => upd({ seoDescription: e.target.value })} rows={3} maxLength={165}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-forest transition"
                  placeholder={place.summary || "Mô tả cho công cụ tìm kiếm..."} />
                <div className="text-right text-xs mt-1">
                  <span className={(place.seoDescription?.length||0) > 155 ? "text-red-400" : "text-gray-400"}>{place.seoDescription?.length||0}/165</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Từ khóa SEO</label>
                <input type="text" value={place.seoKeywords || ""} onChange={e => upd({ seoKeywords: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-forest transition"
                  placeholder="du lịch a lưới, thác nước huế, ..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ảnh OG (Open Graph)</label>
                <div className="flex gap-3 items-start">
                  <input type="text" value={place.ogImage || ""} onChange={e => upd({ ogImage: e.target.value })}
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-forest transition" placeholder="/images/uploads/..." />
                  <button type="button" onClick={() => openPicker(([url]) => upd({ ogImage: url }))}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:border-forest hover:text-forest transition shrink-0">Chọn ảnh</button>
                </div>
                {(place.ogImage || place.image) && (
                  <div className="mt-3 rounded-xl overflow-hidden border border-gray-200 h-32 bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={place.ogImage || place.image} alt="OG preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </section>

          <div className="h-24" />
        </div>
      </div>

      {/* ── Sticky Bottom Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-[1400px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {place.updatedAt && `Lưu lần cuối: ${new Date(place.updatedAt).toLocaleString("vi-VN")}`}
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => router.push("/admin/places")}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition">Hủy</button>
            <button type="button" onClick={() => handleSave(false)} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Lưu nháp
            </button>
            {place.slug && (
              <a href={`${CUSTOMER_URL}/places/${place.slug}?preview=true`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition">
                <Eye size={14} />Xem trước
              </a>
            )}
            <button type="button" onClick={() => handleSave(true)} disabled={saving || !place.name.trim() || !place.slug.trim()}
              className="flex items-center gap-1.5 px-5 py-2 text-sm rounded-lg bg-forest text-white font-medium hover:bg-forest/90 transition disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
              {place.status === "active" ? "Cập nhật" : "Xuất bản"}
            </button>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      {pickerCb && (
        <MediaPickerModal multiple={pickerCb.multi} onSelect={pickerCb.cb} onClose={() => setPickerCb(null)} />
      )}
    </div>
  );
}

export default function PlaceEditPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f8f5f0] flex items-center justify-center">
        <Loader2 size={36} className="animate-spin text-forest" />
      </div>
    }>
      <PlaceEditPageContent />
    </Suspense>
  );
}
