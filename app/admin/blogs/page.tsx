"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback, Suspense } from "react";
import { uploadImageClient } from "@/lib/upload-client";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Save,
  Eye,
  Send,
  Upload,
  Sparkles,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  Copy,
  ExternalLink,
  MoveUp,
  MoveDown,
  Layers,
  Quote as QuoteIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List as ListIcon,
  Minus,
  Code as CodeIcon,
  Heading2,
  Heading3,
  Calendar,
  User as UserIcon,
  Search,
  Smartphone,
  Monitor,
  X,
  Loader2,
  FileText,
  Clock,
  Globe,
  Settings as SettingsIcon,
  Video,
  Film,
  Play
} from "lucide-react";
import { AppImage } from "@/components/ui/app-image";
import {
  getBlogPostsAction,
  saveBlogPostAction,
  deleteBlogPostAction,
  uploadBlogMediaAction,
  getSystemAssetsAction,
  type BlogPostRecord,
  type BlogContentBlock,
  type SystemAssetRecord
} from "@/app/actions/upload";

// Danh mục mặc định
const CATEGORIES = ["Cẩm nang", "Văn hóa", "Ẩm thực", "Trải nghiệm", "Tin tức", "Sự kiện", "Khám phá"];

// Hàm chuyển đổi tiêu đề thành slug tiếng Việt chuẩn SEO
function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

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

// Tự động tính thời gian đọc dựa trên số từ
function calculateReadingTime(blocks: BlogContentBlock[]): string {
  let wordCount = 0;
  for (const b of blocks) {
    if (b.type === "paragraph") wordCount += b.content.split(/\s+/).filter(Boolean).length;
    else if (b.type === "heading") wordCount += b.content.split(/\s+/).filter(Boolean).length;
    else if (b.type === "quote") wordCount += b.content.split(/\s+/).filter(Boolean).length;
    else if (b.type === "list") wordCount += b.items.join(" ").split(/\s+/).filter(Boolean).length;
    else if (b.type === "image") wordCount += 15;
    else if (b.type === "gallery") wordCount += b.images.length * 15;
    else if (b.type === "video") wordCount += 30;
  }
  const minutes = Math.max(1, Math.ceil(wordCount / 180));
  return `${minutes} phút đọc`;
}

// Khởi tạo bài viết trống
function createEmptyPost(): BlogPostRecord {
  const id = `blog-${Date.now()}`;
  const today = new Date().toISOString().split("T")[0];
  return {
    id,
    slug: "",
    title: "",
    excerpt: "",
    category: "Cẩm nang",
    tags: ["A Lưới", "Du lịch cộng đồng"],
    author: "Ban biên tập Chạm",
    status: "draft",
    date: today,
    readingTime: "3 phút đọc",
    image: "/images/home-hero-local.jpg",
    seoTitle: "",
    seoDescription: "",
    blocks: [
      {
        id: `block-${Date.now()}-1`,
        type: "paragraph",
        content: "Bắt đầu viết nội dung bài viết tuyệt vời của bạn tại đây...",
        align: "left"
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function AdminBlogManagementPageContent() {
  // State quản lý danh sách
  const [posts, setPosts] = useState<BlogPostRecord[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // State chế độ xem: 'list' | 'editor'
  const [viewMode, setViewMode] = useState<"list" | "editor">("list");
  const [currentPost, setCurrentPost] = useState<BlogPostRecord>(createEmptyPost());
  const [isSlugManual, setIsSlugManual] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastAutosaveTime, setLastAutosaveTime] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // State Media Library Picker
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<{
    type: "cover" | "block-image" | "gallery";
    blockId?: string;
  } | null>(null);
  const [systemAssets, setSystemAssets] = useState<SystemAssetRecord[]>([]);

  // State Preview Modal
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // State Toast thông báo
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const showToast = (type: "success" | "error" | "info", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast((prev) => (prev?.text === text ? null : prev)), 4000);
  };

  // Uploading block states
  const [uploadingBlockId, setUploadingBlockId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const editId = searchParams?.get("edit");

  useEffect(() => {
    if (editId && posts.length > 0) {
      const target = posts.find((p) => p.id === editId || p.slug === editId);
      if (target) {
        setCurrentPost(target);
        setIsSlugManual(true);
        setHasUnsavedChanges(false);
        setViewMode("editor");
      }
    }
  }, [editId, posts]);

  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const [tagInput, setTagInput] = useState("");

  // Nạp danh sách bài viết
  const loadPosts = useCallback(async () => {
    setIsLoadingList(true);
    try {
      const data = await getBlogPostsAction();
      setPosts(data);
    } catch {
      showToast("error", "Không thể nạp danh sách bài viết.");
    } finally {
      setIsLoadingList(false);
    }
  }, []);

  // Nạp tài nguyên media
  const loadMedia = useCallback(async () => {
    try {
      const assets = await getSystemAssetsAction();
      setSystemAssets(assets);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadPosts();
    loadMedia();
  }, [loadPosts, loadMedia]);

  // =========================================================================
  // AUTOSAVE ENGINE: Tự động lưu bản nháp mỗi 20 giây nếu có thay đổi
  // =========================================================================
  useEffect(() => {
    if (viewMode !== "editor" || !hasUnsavedChanges || !currentPost.title.trim()) return;

    const timer = setTimeout(async () => {
      try {
        const postToSave: BlogPostRecord = {
          ...currentPost,
          readingTime: calculateReadingTime(currentPost.blocks),
          updatedAt: new Date().toISOString()
        };
        const res = await saveBlogPostAction(postToSave);
        if (res.success && res.post) {
          setLastAutosaveTime(new Date().toLocaleTimeString("vi-VN"));
          setHasUnsavedChanges(false);
          setPosts((prev) => {
            const idx = prev.findIndex((p) => p.id === res.post!.id);
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = res.post!;
              return copy;
            }
            return [res.post!, ...prev];
          });
        }
      } catch {
        // autosave silently fails
      }
    }, 20000);

    return () => clearTimeout(timer);
  }, [viewMode, hasUnsavedChanges, currentPost]);

  // Khi thay đổi tiêu đề -> tự động cập nhật slug nếu chưa chỉnh sửa tay
  function handleTitleChange(val: string) {
    setCurrentPost((prev) => {
      const next = { ...prev, title: val };
      if (!isSlugManual) {
        next.slug = slugify(val);
      }
      if (!prev.seoTitle) {
        next.seoTitle = val;
      }
      return next;
    });
    setHasUnsavedChanges(true);
  }

  // =========================================================================
  // QUẢN LÝ KHỐI NỘI DUNG (BLOCK OPERATIONS)
  // =========================================================================

  function addBlock(type: BlogContentBlock["type"], index?: number) {
    const newId = `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    let newBlock: BlogContentBlock;

    switch (type) {
      case "paragraph":
        newBlock = { id: newId, type: "paragraph", content: "", align: "left" };
        break;
      case "heading":
        newBlock = { id: newId, type: "heading", level: 2, content: "" };
        break;
      case "image":
        newBlock = {
          id: newId,
          type: "image",
          url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1000&q=80",
          caption: "Chú thích ảnh minh họa",
          alt: "Hình ảnh du lịch A Lưới",
          width: "full",
          align: "center"
        };
        break;
      case "gallery":
        newBlock = {
          id: newId,
          type: "gallery",
          layout: "grid-3",
          images: [
            {
              id: `img-1-${Date.now()}`,
              url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=800&q=80",
              caption: "Phong cảnh thung lũng"
            },
            {
              id: `img-2-${Date.now()}`,
              url: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=800&q=80",
              caption: "Dệt Zèng Tà Ôi"
            },
            {
              id: `img-3-${Date.now()}`,
              url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
              caption: "Ẩm thực vùng cao"
            }
          ]
        };
        break;
      case "quote":
        newBlock = {
          id: newId,
          type: "quote",
          content: "Trích dẫn cảm hứng về trải nghiệm văn hóa và thiên nhiên nơi đây...",
          author: "Người dẫn đường bản địa"
        };
        break;
      case "list":
        newBlock = {
          id: newId,
          type: "list",
          style: "bullet",
          items: ["Điểm đáng nhớ thứ nhất", "Điểm đáng nhớ thứ hai", "Lưu ý khi đến bản làng"]
        };
        break;
      case "divider":
        newBlock = { id: newId, type: "divider" };
        break;
      case "code":
        newBlock = { id: newId, type: "code", code: "// Ghi chú hoặc thông tin bổ sung\nLịch trình: 08:00 - 17:00" };
        break;
      case "video":
        newBlock = {
          id: newId,
          type: "video",
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          caption: "Video trải nghiệm thực tế tại A Lưới",
          provider: "youtube",
          aspectRatio: "16/9"
        };
        break;
    }

    setCurrentPost((prev) => {
      const nextBlocks = [...prev.blocks];
      if (typeof index === "number" && index >= 0) {
        nextBlocks.splice(index + 1, 0, newBlock);
      } else {
        nextBlocks.push(newBlock);
      }
      return { ...prev, blocks: nextBlocks };
    });
    setHasUnsavedChanges(true);
  }

  function updateBlock(id: string, updates: Partial<BlogContentBlock>) {
    setCurrentPost((prev) => ({
      ...prev,
      blocks: prev.blocks.map((b) => (b.id === id ? ({ ...b, ...updates } as BlogContentBlock) : b))
    }));
    setHasUnsavedChanges(true);
  }

  function moveBlock(index: number, direction: "up" | "down") {
    setCurrentPost((prev) => {
      const copy = [...prev.blocks];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= copy.length) return prev;
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return { ...prev, blocks: copy };
    });
    setHasUnsavedChanges(true);
  }

  function removeBlock(id: string) {
    if (currentPost.blocks.length <= 1) {
      showToast("info", "Bài viết cần tối thiểu 1 khối nội dung.");
      return;
    }
    setCurrentPost((prev) => ({
      ...prev,
      blocks: prev.blocks.filter((b) => b.id !== id)
    }));
    setHasUnsavedChanges(true);
  }

  function duplicateBlock(id: string) {
    const idx = currentPost.blocks.findIndex((b) => b.id === id);
    if (idx < 0) return;
    const target = currentPost.blocks[idx];
    const cloned: BlogContentBlock = {
      ...JSON.parse(JSON.stringify(target)),
      id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    };
    setCurrentPost((prev) => {
      const copy = [...prev.blocks];
      copy.splice(idx + 1, 0, cloned);
      return { ...prev, blocks: copy };
    });
    setHasUnsavedChanges(true);
  }

  // =========================================================================
  // XỬ LÝ UPLOAD ẢNH TỪ MÁY TÍNH & MEDIA PICKER
  // =========================================================================

  async function handleFileUploadForBlock(e: React.ChangeEvent<HTMLInputElement>, blockId?: string) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (blockId) setUploadingBlockId(blockId);
    try {
      const res = await uploadImageClient(file, { category: "blogs" });
      if (res.success && res.url) {
        if (blockId) {
          updateBlock(blockId, { url: res.url });
        }
        showToast("success", "Đã tải ảnh lên thành công!");
        await loadMedia();
      } else {
        showToast("error", res.error || "Không thể tải ảnh.");
      }
    } catch {
      showToast("error", "Lỗi tải ảnh lên hệ thống.");
    } finally {
      if (blockId) setUploadingBlockId(null);
      e.target.value = "";
    }
  }

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    try {
      const res = await uploadImageClient(file, { category: "blogs" });
      if (res.success && res.url) {
        setCurrentPost((prev) => ({ ...prev, image: res.url! }));
        setHasUnsavedChanges(true);
        showToast("success", "Đã tải ảnh bìa mới thành công!");
        await loadMedia();
      } else {
        showToast("error", res.error || "Không thể tải ảnh bìa.");
      }
    } catch {
      showToast("error", "Lỗi tải ảnh bìa.");
    } finally {
      setIsSaving(false);
      e.target.value = "";
    }
  }

  function openMediaPicker(type: "cover" | "block-image" | "gallery", blockId?: string) {
    setPickerTarget({ type, blockId });
    setIsMediaPickerOpen(true);
  }

  function handleSelectFromMediaPicker(url: string) {
    if (!pickerTarget) return;

    if (pickerTarget.type === "cover") {
      setCurrentPost((prev) => ({ ...prev, image: url }));
      setHasUnsavedChanges(true);
    } else if (pickerTarget.type === "block-image" && pickerTarget.blockId) {
      updateBlock(pickerTarget.blockId, { url });
    } else if (pickerTarget.type === "gallery" && pickerTarget.blockId) {
      const block = currentPost.blocks.find((b) => b.id === pickerTarget.blockId);
      if (block && block.type === "gallery") {
        const newImg = {
          id: `img-${Date.now()}`,
          url,
          caption: "Ảnh mới chọn"
        };
        updateBlock(pickerTarget.blockId, {
          images: [...block.images, newImg]
        });
      }
    }
    setIsMediaPickerOpen(false);
    setPickerTarget(null);
    showToast("success", "Đã áp dụng ảnh từ Thư viện Media!");
  }

  // =========================================================================
  // XỬ LÝ LƯU & XUẤT BẢN BÀI VIẾT
  // =========================================================================

  async function handleSave(statusOverride?: "draft" | "published" | "hidden") {
    if (!currentPost.title.trim()) {
      showToast("error", "Vui lòng nhập Tiêu đề bài viết!");
      return;
    }

    const finalSlug = currentPost.slug.trim() ? slugify(currentPost.slug) : slugify(currentPost.title);
    if (!finalSlug) {
      showToast("error", "Slug đường dẫn không hợp lệ!");
      return;
    }

    setIsSaving(true);
    try {
      const statusToSave = statusOverride || currentPost.status;
      const postToSave: BlogPostRecord = {
        ...currentPost,
        slug: finalSlug,
        status: statusToSave,
        readingTime: calculateReadingTime(currentPost.blocks),
        seoTitle: currentPost.seoTitle || currentPost.title,
        seoDescription:
          currentPost.seoDescription ||
          currentPost.excerpt ||
          (currentPost.blocks.find((b) => b.type === "paragraph")?.type === "paragraph"
            ? (currentPost.blocks.find((b) => b.type === "paragraph") as { type: "paragraph"; content: string }).content.slice(0, 150)
            : ""),
        updatedAt: new Date().toISOString()
      };

      const res = await saveBlogPostAction(postToSave);
      if (res.success && res.post) {
        setCurrentPost(res.post);
        setHasUnsavedChanges(false);
        setLastAutosaveTime(new Date().toLocaleTimeString("vi-VN"));

        // Cập nhật danh sách
        setPosts((prev) => {
          const idx = prev.findIndex((p) => p.id === res.post!.id);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = res.post!;
            return copy;
          }
          return [res.post!, ...prev];
        });

        if (statusToSave === "published") {
          showToast("success", `🎉 Bài viết "${res.post.title}" đã được XUẤT BẢN thành công!`);
        } else {
          showToast("success", "Đã lưu bản nháp bài viết thành công!");
        }
      } else {
        showToast("error", res.error || "Không thể lưu bài viết.");
      }
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Lỗi khi lưu bài viết.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn bài viết "${title}"?`)) return;

    try {
      const res = await deleteBlogPostAction(id);
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        showToast("success", `Đã xóa bài viết "${title}" thành công!`);
        if (viewMode === "editor" && currentPost.id === id) {
          setViewMode("list");
        }
      } else {
        showToast("error", res.error || "Không thể xóa bài viết.");
      }
    } catch {
      showToast("error", "Lỗi khi xóa bài viết.");
    }
  }

  // Tags management
  function addTag(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      const val = tagInput.trim();
      if (!currentPost.tags.includes(val)) {
        setCurrentPost((prev) => ({ ...prev, tags: [...prev.tags, val] }));
        setHasUnsavedChanges(true);
      }
      setTagInput("");
    }
  }

  function removeTag(tagToRemove: string) {
    setCurrentPost((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tagToRemove)
    }));
    setHasUnsavedChanges(true);
  }

  // Lọc danh sách bài viết
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (selectedCategory !== "all" && p.category !== selectedCategory) return false;
      if (selectedStatus !== "all" && p.status !== selectedStatus) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const mTitle = p.title.toLowerCase().includes(q);
        const mExcerpt = p.excerpt?.toLowerCase().includes(q) || false;
        const mTags = p.tags.some((t) => t.toLowerCase().includes(q));
        if (!mTitle && !mExcerpt && !mTags) return false;
      }
      return true;
    });
  }, [posts, selectedCategory, selectedStatus, searchQuery]);

  // Thống kê bài viết
  const stats = useMemo(() => {
    return {
      total: posts.length,
      published: posts.filter((p) => p.status === "published").length,
      draft: posts.filter((p) => p.status === "draft").length,
      hidden: posts.filter((p) => p.status === "hidden").length
    };
  }, [posts]);

  // =========================================================================
  // RENDER GIAO DIỆN
  // =========================================================================

  return (
    <div className="space-y-6 pb-24">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-2xl px-5 py-3.5 shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === "success"
              ? "bg-emerald-900 text-white border border-emerald-500/30"
              : toast.type === "error"
              ? "bg-red-900 text-white border border-red-500/30"
              : "bg-ink text-white border border-white/20"
          }`}
        >
          {toast.type === "success" && <CheckCircle2 className="size-5 shrink-0 text-emerald-400" />}
          {toast.type === "error" && <AlertCircle className="size-5 shrink-0 text-red-400" />}
          {toast.type === "info" && <Sparkles className="size-5 shrink-0 text-amber-300" />}
          <span className="text-xs font-semibold leading-relaxed">{toast.text}</span>
          <button onClick={() => setToast(null)} className="ml-2 rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* ===================================================================
          MÀN HÌNH 1: DANH SÁCH BÀI VIẾT (BLOG MANAGER TABLE)
         =================================================================== */}
      {viewMode === "list" && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-ink">Quản lý Bài viết & Blog Chạm A Lưới</h1>
                <span className="rounded-full bg-forest/10 px-3 py-0.5 text-xs font-bold text-forest">
                  Shopee Seller Center Style
                </span>
              </div>
              <p className="text-xs text-ink/60 mt-1">
                Hệ thống quản lý nội dung đa phương tiện, hỗ trợ chèn nhiều ảnh, gallery, kéo thả khối và tối ưu SEO mà không cần biết code.
              </p>
            </div>

            <button
              onClick={() => {
                setCurrentPost(createEmptyPost());
                setIsSlugManual(false);
                setHasUnsavedChanges(false);
                setViewMode("editor");
              }}
              className="flex items-center gap-2 rounded-2xl bg-forest px-5 py-3 text-xs font-black text-white shadow-lg hover:bg-forest/90 hover:scale-105 active:scale-95 transition"
            >
              <Plus className="size-4" />
              Viết Bài Mới (Shopee Editor)
            </button>
          </div>

          {/* Quick Stats Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-3xl bg-white p-4 shadow-card border border-black/5 flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-forest/10 text-forest flex items-center justify-center">
                <FileText className="size-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-ink/50 uppercase tracking-wider">Tổng bài viết</p>
                <p className="text-xl font-black text-ink">{stats.total} bài</p>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-4 shadow-card border border-black/5 flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-ink/50 uppercase tracking-wider">Đã xuất bản</p>
                <p className="text-xl font-black text-emerald-800">{stats.published} bài</p>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-4 shadow-card border border-black/5 flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Clock className="size-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-ink/50 uppercase tracking-wider">Bản nháp</p>
                <p className="text-xl font-black text-amber-800">{stats.draft} bài</p>
              </div>
            </div>

            <div className="rounded-3xl bg-white p-4 shadow-card border border-black/5 flex items-center gap-3">
              <div className="size-11 rounded-2xl bg-gray-100 text-gray-700 flex items-center justify-center">
                <Eye className="size-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-ink/50 uppercase tracking-wider">Đang ẩn</p>
                <p className="text-xl font-black text-gray-700">{stats.hidden} bài</p>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-3xl bg-white p-4 shadow-card border border-black/5">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo tiêu đề, tóm tắt hoặc thẻ tag..."
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-beige/60 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-forest"
              >
                <option value="all">Tất cả danh mục</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs font-semibold text-ink focus:outline-none focus:ring-2 focus:ring-forest"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="published">Đã xuất bản</option>
                <option value="draft">Bản nháp</option>
                <option value="hidden">Đang ẩn</option>
              </select>
            </div>

            <p className="text-xs text-ink/50 font-bold">Hiển thị {filteredPosts.length} / {posts.length} bài viết</p>
          </div>

          {/* Table */}
          <div className="rounded-3xl bg-white shadow-card border border-black/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-forest/5 text-ink/70 font-bold uppercase tracking-wider border-b border-black/5">
                  <tr>
                    <th className="p-4">Ảnh bìa</th>
                    <th className="p-4">Tiêu đề bài viết</th>
                    <th className="p-4">Danh mục & Tags</th>
                    <th className="p-4">Tác giả & Ngày</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {isLoadingList ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-ink/50">
                        <Loader2 className="size-6 animate-spin mx-auto text-forest" />
                        <p className="mt-2 text-xs font-semibold">Đang nạp dữ liệu bài viết...</p>
                      </td>
                    </tr>
                  ) : filteredPosts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-ink/50">
                        <p className="text-sm font-bold">Không tìm thấy bài viết nào phù hợp.</p>
                        <p className="text-xs mt-1">Hãy thử xóa bộ lọc tìm kiếm hoặc tạo bài viết mới.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-beige/30 transition">
                        <td className="p-4">
                          <div className="relative size-16 rounded-xl overflow-hidden bg-forest/5 border border-black/10 shrink-0">
                            <AppImage src={post.image} alt={post.title} fill sizes="70px" className="object-cover" />
                          </div>
                        </td>
                        <td className="p-4 max-w-md">
                          <p className="font-extrabold text-ink text-sm leading-snug">{post.title}</p>
                          <p className="text-[11px] text-ink/50 font-mono mt-0.5">/blog/{post.slug}</p>
                          <p className="text-[11px] text-ink/70 mt-1 line-clamp-1">{post.excerpt}</p>
                          <span className="text-[10px] text-forest font-bold mt-1 inline-block bg-forest/10 px-2 py-0.5 rounded-md">
                            {post.readingTime}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="rounded-full bg-forest/10 px-3 py-1 font-bold text-forest text-[11px] inline-block mb-1.5">
                            {post.category}
                          </span>
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {post.tags.slice(0, 3).map((t, idx) => (
                              <span key={idx} className="rounded-md bg-beige px-1.5 py-0.5 text-[9px] font-bold text-ink/60">
                                #{t}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="font-bold text-ink">{post.author}</p>
                          <p className="text-[11px] text-ink/50 mt-0.5">{post.date}</p>
                        </td>
                        <td className="p-4 text-center">
                          {post.status === "published" ? (
                            <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-[11px] font-extrabold inline-flex items-center gap-1">
                              <CheckCircle2 className="size-3" /> Đã xuất bản
                            </span>
                          ) : post.status === "draft" ? (
                            <span className="rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-[11px] font-extrabold inline-flex items-center gap-1">
                              <Clock className="size-3" /> Bản nháp
                            </span>
                          ) : (
                            <span className="rounded-full bg-gray-100 text-gray-700 px-3 py-1 text-[11px] font-bold">
                              Đang ẩn
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setCurrentPost(post);
                                setIsSlugManual(true);
                                setHasUnsavedChanges(false);
                                setViewMode("editor");
                              }}
                              className="px-3 py-1.5 rounded-xl bg-forest/10 hover:bg-forest hover:text-white text-forest font-bold text-xs transition flex items-center gap-1"
                              title="Mở trình soạn thảo Shopee Editor"
                            >
                              <Edit2 className="size-3" />
                              Sửa
                            </button>

                            <button
                              onClick={() => {
                                setCurrentPost(post);
                                setIsPreviewOpen(true);
                              }}
                              className="p-1.5 rounded-xl bg-beige hover:bg-forest/10 text-forest transition"
                              title="Xem trước giao diện thật"
                            >
                              <Eye className="size-3.5" />
                            </button>

                            <a
                              href={`http://localhost:3000/blog/${post.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-xl bg-beige hover:bg-forest/10 text-forest transition"
                              title="Xem trực tiếp trên trang khách (Port 3000)"
                            >
                              <ExternalLink className="size-3.5" />
                            </a>

                            <button
                              onClick={() => handleDelete(post.id, post.title)}
                              className="p-1.5 rounded-xl bg-red-50 hover:bg-red-600 hover:text-white text-red-600 transition"
                              title="Xóa bài viết"
                            >
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MÀN HÌNH 2: TRÌNH SOẠN THẢO SHOPEE BLOG EDITOR (2 CỘT RỘNG)
         =================================================================== */}
      {viewMode === "editor" && (
        <div className="space-y-6">
          {/* Sticky Top Action Bar */}
          <div className="sticky top-0 z-30 rounded-3xl bg-white/95 backdrop-blur shadow-card border border-black/5 p-4 flex flex-wrap items-center justify-between gap-4">
            {/* Back & Status */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  if (hasUnsavedChanges && !confirm("Bạn có thay đổi chưa lưu. Bạn có chắc muốn quay lại danh sách?")) return;
                  setViewMode("list");
                }}
                className="flex items-center gap-1.5 rounded-2xl bg-beige px-3.5 py-2 text-xs font-bold text-ink hover:bg-forest/10 hover:text-forest transition"
              >
                <ArrowLeft className="size-4" />
                Danh sách bài viết
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-ink/60">Trạng thái:</span>
                <select
                  value={currentPost.status}
                  onChange={(e) => {
                    setCurrentPost({ ...currentPost, status: e.target.value as BlogPostRecord["status"] });
                    setHasUnsavedChanges(true);
                  }}
                  className={`rounded-xl px-3 py-1.5 text-xs font-black ${
                    currentPost.status === "published"
                      ? "bg-emerald-100 text-emerald-800"
                      : currentPost.status === "draft"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <option value="draft">Bản nháp</option>
                  <option value="published">Đã xuất bản</option>
                  <option value="hidden">Đang ẩn</option>
                </select>
              </div>

              {/* Autosave badge */}
              <div className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold text-ink/50">
                <Clock className="size-3" />
                {hasUnsavedChanges ? (
                  <span className="text-amber-600 font-bold">Chưa lưu thay đổi...</span>
                ) : lastAutosaveTime ? (
                  <span className="text-emerald-700">Đã tự động lưu nháp lúc {lastAutosaveTime}</span>
                ) : (
                  <span>Tự động lưu kích hoạt</span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleSave("draft")}
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-2xl border border-black/10 bg-white px-4 py-2.5 text-xs font-bold text-ink hover:bg-beige transition shadow-sm"
              >
                <Save className="size-4 text-forest" />
                {isSaving ? "Đang lưu..." : "Lưu nháp"}
              </button>

              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="flex items-center gap-1.5 rounded-2xl border border-forest/20 bg-forest/5 px-4 py-2.5 text-xs font-bold text-forest hover:bg-forest/10 transition shadow-sm"
              >
                <Eye className="size-4" />
                Xem trước
              </button>

              <button
                type="button"
                onClick={() => handleSave("published")}
                disabled={isSaving}
                className="flex items-center gap-1.5 rounded-2xl bg-forest px-6 py-2.5 text-xs font-black text-white hover:bg-forest/90 shadow-md hover:scale-105 active:scale-95 transition"
              >
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
                {isSaving ? "Đang xử lý..." : "Xuất bản bài viết"}
              </button>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* ===============================================================
                CỘT TRÁI: EDITOR SOẠN THẢO NỘI DUNG (70%)
               =============================================================== */}
            <div className="lg:col-span-2 space-y-6">
              {/* Tiêu đề & Tóm tắt */}
              <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5 space-y-4">
                <div>
                  <label className="text-xs font-bold text-ink/70 uppercase tracking-wider block mb-1">
                    Tiêu đề bài viết <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentPost.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Ví dụ: Cẩm nang trekking Thác A Nôr mùa lúa chín..."
                    className="w-full px-4 py-3.5 rounded-2xl bg-beige/60 text-lg font-black text-ink focus:outline-none focus:ring-2 focus:ring-forest placeholder:text-ink/30"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-ink/70 uppercase tracking-wider block mb-1">
                    Mô tả ngắn (Tóm tắt bài viết hiển thị ở danh sách)
                  </label>
                  <textarea
                    value={currentPost.excerpt}
                    onChange={(e) => {
                      setCurrentPost({ ...currentPost, excerpt: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    rows={2}
                    placeholder="Tóm tắt 1-2 câu ngắn gọn, truyền cảm hứng về chuyến đi hoặc câu chuyện văn hóa..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-beige/60 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-forest resize-none placeholder:text-ink/30"
                  />
                </div>
              </div>

              {/* Shopee Rich Text Toolbar */}
              <div className="rounded-3xl bg-white p-4 shadow-card border border-black/5 space-y-3">
                <div className="flex items-center justify-between border-b border-black/5 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-forest" />
                    <span className="text-xs font-black uppercase tracking-wider text-forest">Thanh Công Cụ Khối Nội Dung (Shopee Block Canvas)</span>
                  </div>
                  <span className="text-[11px] text-ink/50 font-bold">{currentPost.blocks.length} khối nội dung</span>
                </div>

                {/* Quick Add Toolbar */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => addBlock("paragraph")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-beige hover:bg-forest/10 hover:text-forest text-xs font-bold text-ink/80 transition"
                  >
                    <Plus className="size-3.5 text-forest" />
                    Đoạn văn
                  </button>

                  <button
                    type="button"
                    onClick={() => addBlock("heading")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-beige hover:bg-forest/10 hover:text-forest text-xs font-bold text-ink/80 transition"
                  >
                    <Heading2 className="size-3.5 text-forest" />
                    Tiêu đề H2
                  </button>

                  <button
                    type="button"
                    onClick={() => addBlock("image")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-forest/10 hover:bg-forest hover:text-white text-xs font-bold text-forest transition shadow-sm"
                  >
                    <ImageIcon className="size-3.5" />
                    + Chèn Ảnh
                  </button>

                  <button
                    type="button"
                    onClick={() => addBlock("gallery")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-600 hover:text-white text-xs font-bold text-amber-900 transition shadow-sm"
                  >
                    <Layers className="size-3.5" />
                    + Bộ Sưu Tập Gallery
                  </button>

                  <button
                    type="button"
                    onClick={() => addBlock("video")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-600 hover:text-white text-xs font-bold text-rose-900 transition shadow-sm"
                  >
                    <Video className="size-3.5" />
                    + Chèn Video
                  </button>

                  <button
                    type="button"
                    onClick={() => addBlock("quote")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-beige hover:bg-forest/10 hover:text-forest text-xs font-bold text-ink/80 transition"
                  >
                    <QuoteIcon className="size-3.5 text-forest" />
                    Trích dẫn
                  </button>

                  <button
                    type="button"
                    onClick={() => addBlock("list")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-beige hover:bg-forest/10 hover:text-forest text-xs font-bold text-ink/80 transition"
                  >
                    <ListIcon className="size-3.5 text-forest" />
                    Danh sách
                  </button>

                  <button
                    type="button"
                    onClick={() => addBlock("divider")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-beige hover:bg-forest/10 hover:text-forest text-xs font-bold text-ink/80 transition"
                  >
                    <Minus className="size-3.5 text-forest" />
                    Đường kẻ
                  </button>

                  <button
                    type="button"
                    onClick={() => addBlock("code")}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-beige hover:bg-forest/10 hover:text-forest text-xs font-bold text-ink/80 transition"
                  >
                    <CodeIcon className="size-3.5 text-forest" />
                    Ghi chú
                  </button>
                </div>
              </div>

              {/* Dynamic Block Canvas */}
              <div className="space-y-4">
                {currentPost.blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className="group relative rounded-3xl bg-white p-5 shadow-card border border-black/5 hover:border-forest/30 transition duration-200"
                  >
                    {/* Block Header / Action Controls */}
                    <div className="flex items-center justify-between border-b border-black/5 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="size-6 rounded-lg bg-forest/10 text-forest text-[11px] font-black grid place-items-center">
                          {index + 1}
                        </span>
                        <span className="text-xs font-extrabold uppercase tracking-wider text-ink/70">
                          {block.type === "paragraph" && "Khối Đoạn Văn"}
                          {block.type === "heading" && `Tiêu Đề ${block.level === 3 ? "H3" : "H2"}`}
                          {block.type === "image" && "Khối Hình Ảnh Đơn"}
                          {block.type === "gallery" && "Khối Bộ Sưu Tập Ảnh (Gallery)"}
                          {block.type === "quote" && "Khối Trích Dẫn"}
                          {block.type === "list" && "Khối Danh Sách"}
                          {block.type === "divider" && "Đường Phân Tách Nội Dung"}
                          {block.type === "code" && "Khối Ghi Chú Đặc Biệt"}
                        </span>
                      </div>

                      {/* Controls: Move Up, Move Down, Duplicate, Remove */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveBlock(index, "up")}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg bg-beige hover:bg-forest/10 hover:text-forest text-ink/60 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          title="Di chuyển lên trên"
                        >
                          <MoveUp className="size-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => moveBlock(index, "down")}
                          disabled={index === currentPost.blocks.length - 1}
                          className="p-1.5 rounded-lg bg-beige hover:bg-forest/10 hover:text-forest text-ink/60 disabled:opacity-30 disabled:cursor-not-allowed transition"
                          title="Di chuyển xuống dưới"
                        >
                          <MoveDown className="size-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => duplicateBlock(block.id)}
                          className="p-1.5 rounded-lg bg-beige hover:bg-forest/10 hover:text-forest text-ink/60 transition"
                          title="Nhân bản khối này"
                        >
                          <Copy className="size-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => removeBlock(block.id)}
                          className="p-1.5 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600 transition ml-1"
                          title="Xóa khối này"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* 1. Paragraph */}
                    {block.type === "paragraph" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 bg-beige/80 p-1 rounded-xl">
                            <button
                              type="button"
                              onClick={() => updateBlock(block.id, { align: "left" })}
                              className={`p-1 rounded-lg text-xs ${block.align === "left" || !block.align ? "bg-white shadow-sm text-forest font-bold" : "text-ink/60 hover:text-ink"}`}
                              title="Canh lề trái"
                            >
                              <AlignLeft className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => updateBlock(block.id, { align: "center" })}
                              className={`p-1 rounded-lg text-xs ${block.align === "center" ? "bg-white shadow-sm text-forest font-bold" : "text-ink/60 hover:text-ink"}`}
                              title="Canh giữa"
                            >
                              <AlignCenter className="size-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => updateBlock(block.id, { align: "right" })}
                              className={`p-1 rounded-lg text-xs ${block.align === "right" ? "bg-white shadow-sm text-forest font-bold" : "text-ink/60 hover:text-ink"}`}
                              title="Canh lề phải"
                            >
                              <AlignRight className="size-3.5" />
                            </button>
                          </div>
                          <span className="text-[11px] text-ink/40">Hỗ trợ tự do xuống dòng và viết bài dài</span>
                        </div>

                        <textarea
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          rows={4}
                          style={{ textAlign: block.align || "left" }}
                          placeholder="Nhập nội dung đoạn văn của bạn tại đây..."
                          className="w-full px-4 py-3 rounded-2xl bg-beige/40 text-sm text-ink leading-relaxed focus:outline-none focus:ring-2 focus:ring-forest resize-y"
                        />
                      </div>
                    )}

                    {/* 2. Heading */}
                    {block.type === "heading" && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateBlock(block.id, { level: 2 })}
                            className={`px-3 py-1 rounded-xl text-xs font-black transition ${
                              block.level === 2 ? "bg-forest text-white" : "bg-beige text-ink/70 hover:bg-forest/10"
                            }`}
                          >
                            Tiêu đề H2 (Mục lớn)
                          </button>
                          <button
                            type="button"
                            onClick={() => updateBlock(block.id, { level: 3 })}
                            className={`px-3 py-1 rounded-xl text-xs font-black transition ${
                              block.level === 3 ? "bg-forest text-white" : "bg-beige text-ink/70 hover:bg-forest/10"
                            }`}
                          >
                            Tiêu đề H3 (Mục nhỏ)
                          </button>
                        </div>
                        <input
                          type="text"
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          placeholder={block.level === 3 ? "Nhập tiêu đề mục nhỏ H3..." : "Nhập tiêu đề mục lớn H2..."}
                          className={`w-full px-4 py-2.5 rounded-2xl bg-beige/40 font-black text-ink focus:outline-none focus:ring-2 focus:ring-forest ${
                            block.level === 3 ? "text-base text-forest" : "text-xl text-ink"
                          }`}
                        />
                      </div>
                    )}

                    {/* 3. Image Block */}
                    {block.type === "image" && (
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div
                            className={`relative rounded-2xl overflow-hidden border border-black/10 bg-neutral-100 transition-all duration-300 ${
                              block.width === "sm"
                                ? "w-64 aspect-[4/3]"
                                : block.width === "md"
                                ? "w-96 aspect-[16/10]"
                                : block.width === "lg"
                                ? "w-full max-w-xl aspect-[16/9]"
                                : "w-full aspect-[16/9]"
                            }`}
                            style={{
                              marginLeft: block.align === "right" ? "auto" : block.align === "center" ? "auto" : "0",
                              marginRight: block.align === "left" ? "auto" : block.align === "center" ? "auto" : "0"
                            }}
                          >
                            <AppImage src={block.url} alt={block.alt || "Ảnh bài viết"} fill className="object-cover" />
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 bg-beige/50 p-3.5 rounded-2xl border border-black/5">
                          <div className="flex flex-wrap items-center gap-2">
                            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90 cursor-pointer shadow-sm">
                              {uploadingBlockId === block.id ? <Loader2 className="size-3.5 animate-spin" /> : <Upload className="size-3.5" />}
                              Tải từ máy tính
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileUploadForBlock(e, block.id)}
                                className="hidden"
                              />
                            </label>

                            <button
                              type="button"
                              onClick={() => openMediaPicker("block-image", block.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-forest/20 text-forest text-xs font-bold hover:bg-forest/5 shadow-sm"
                            >
                              <ImageIcon className="size-3.5" />
                              Chọn từ Media Library
                            </button>
                          </div>

                          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-black/5">
                            <span className="text-[10px] font-bold text-ink/50 px-1">Cỡ:</span>
                            {(["sm", "md", "lg", "full"] as const).map((sz) => (
                              <button
                                key={sz}
                                type="button"
                                onClick={() => updateBlock(block.id, { width: sz })}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase transition ${
                                  (block.width || "full") === sz ? "bg-forest text-white shadow-sm" : "text-ink/60 hover:text-ink"
                                }`}
                              >
                                {sz}
                              </button>
                            ))}
                          </div>

                          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-black/5">
                            <span className="text-[10px] font-bold text-ink/50 px-1">Căn:</span>
                            {(["left", "center", "right"] as const).map((al) => (
                              <button
                                key={al}
                                type="button"
                                onClick={() => updateBlock(block.id, { align: al })}
                                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold capitalize transition ${
                                  (block.align || "center") === al ? "bg-forest text-white shadow-sm" : "text-ink/60 hover:text-ink"
                                }`}
                              >
                                {al === "left" ? "Trái" : al === "center" ? "Giữa" : "Phải"}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[11px] font-bold text-ink/70 block mb-1">Chú thích ảnh (Caption hiển thị dưới ảnh):</label>
                            <input
                              type="text"
                              value={block.caption || ""}
                              onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                              placeholder="Ví dụ: Suối mát ven rừng nguyên sinh A Lưới..."
                              className="w-full px-3 py-2 rounded-xl bg-beige/40 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                            />
                          </div>

                          <div>
                            <label className="text-[11px] font-bold text-ink/70 block mb-1">Alt text (Mô tả ảnh cho SEO Google):</label>
                            <input
                              type="text"
                              value={block.alt || ""}
                              onChange={(e) => updateBlock(block.id, { alt: e.target.value })}
                              placeholder="Ví dụ: Du khách chụp ảnh tại thác A Nôr..."
                              className="w-full px-3 py-2 rounded-xl bg-beige/40 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-ink/70 block mb-1">Hoặc dán trực tiếp URL ảnh:</label>
                          <input
                            type="text"
                            value={block.url}
                            onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                            placeholder="https://... hoặc /images/..."
                            className="w-full px-3 py-2 rounded-xl bg-beige/40 font-mono text-xs text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                          />
                        </div>
                      </div>
                    )}

                    {/* 4. Gallery Block */}
                    {block.type === "gallery" && (
                      <div className="space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/50">
                          <div>
                            <h4 className="text-xs font-black text-amber-900">Bộ Sưu Tập {block.images.length} Hình Ảnh</h4>
                            <p className="text-[11px] text-amber-800/70">Hiển thị dạng lưới ảnh đẹp mắt, tự động co giãn theo thiết bị.</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-amber-200">
                              <button
                                type="button"
                                onClick={() => updateBlock(block.id, { layout: "grid-2" })}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                  block.layout === "grid-2" ? "bg-amber-800 text-white" : "text-amber-900 hover:bg-amber-100"
                                }`}
                              >
                                2 Cột
                              </button>
                              <button
                                type="button"
                                onClick={() => updateBlock(block.id, { layout: "grid-3" })}
                                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                  block.layout === "grid-3" || !block.layout ? "bg-amber-800 text-white" : "text-amber-900 hover:bg-amber-100"
                                }`}
                              >
                                3 Cột
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => openMediaPicker("gallery", block.id)}
                              className="px-3 py-1.5 rounded-xl bg-amber-800 text-white text-xs font-bold hover:bg-amber-900 shadow-sm flex items-center gap-1"
                            >
                              <Plus className="size-3" />
                              Thêm ảnh vào Gallery
                            </button>
                          </div>
                        </div>

                        <div
                          className={`grid gap-3 ${
                            block.layout === "grid-2" ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"
                          }`}
                        >
                          {block.images.map((img, imgIdx) => (
                            <div key={img.id} className="group/item relative rounded-2xl overflow-hidden border border-black/10 bg-neutral-100 p-2 space-y-2">
                              <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-200">
                                <AppImage src={img.url} alt={img.caption || "Gallery"} fill className="object-cover" />
                              </div>

                              <input
                                type="text"
                                value={img.caption || ""}
                                onChange={(e) => {
                                  const updatedImages = [...block.images];
                                  updatedImages[imgIdx] = { ...updatedImages[imgIdx], caption: e.target.value };
                                  updateBlock(block.id, { images: updatedImages });
                                }}
                                placeholder="Chú thích ảnh này..."
                                className="w-full px-2 py-1 rounded-lg bg-white text-[11px] text-ink focus:outline-none focus:ring-1 focus:ring-forest border border-black/5"
                              />

                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[10px] font-bold text-ink/40">#{imgIdx + 1}</span>
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    disabled={imgIdx === 0}
                                    onClick={() => {
                                      const copy = [...block.images];
                                      const temp = copy[imgIdx];
                                      copy[imgIdx] = copy[imgIdx - 1];
                                      copy[imgIdx - 1] = temp;
                                      updateBlock(block.id, { images: copy });
                                    }}
                                    className="p-1 rounded bg-beige hover:bg-forest/10 text-ink disabled:opacity-30"
                                    title="Di chuyển trước"
                                  >
                                    ←
                                  </button>
                                  <button
                                    type="button"
                                    disabled={imgIdx === block.images.length - 1}
                                    onClick={() => {
                                      const copy = [...block.images];
                                      const temp = copy[imgIdx];
                                      copy[imgIdx] = copy[imgIdx + 1];
                                      copy[imgIdx + 1] = temp;
                                      updateBlock(block.id, { images: copy });
                                    }}
                                    className="p-1 rounded bg-beige hover:bg-forest/10 text-ink disabled:opacity-30"
                                    title="Di chuyển sau"
                                  >
                                    →
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const copy = block.images.filter((_, i) => i !== imgIdx);
                                      updateBlock(block.id, { images: copy });
                                    }}
                                    className="p-1 rounded bg-red-50 hover:bg-red-600 hover:text-white text-red-600"
                                    title="Xóa ảnh khỏi gallery"
                                  >
                                    <Trash2 className="size-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 5. Quote */}
                    {block.type === "quote" && (
                      <div className="space-y-3 bg-forest/5 p-4 rounded-2xl border-l-4 border-forest">
                        <textarea
                          value={block.content}
                          onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          rows={2}
                          placeholder="Nhập nội dung trích dẫn nổi bật..."
                          className="w-full px-3 py-2 rounded-xl bg-white text-sm italic font-serif text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                        />
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-ink/60">— Người trích dẫn:</span>
                          <input
                            type="text"
                            value={block.author || ""}
                            onChange={(e) => updateBlock(block.id, { author: e.target.value })}
                            placeholder="Ví dụ: Già làng Quỳnh Blom..."
                            className="flex-1 px-3 py-1.5 rounded-xl bg-white text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                          />
                        </div>
                      </div>
                    )}

                    {/* 6. List */}
                    {block.type === "list" && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => updateBlock(block.id, { style: "bullet" })}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                              block.style === "bullet" ? "bg-forest text-white" : "bg-beige text-ink/70"
                            }`}
                          >
                            Đầu dòng chấm (•)
                          </button>
                          <button
                            type="button"
                            onClick={() => updateBlock(block.id, { style: "number" })}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                              block.style === "number" ? "bg-forest text-white" : "bg-beige text-ink/70"
                            }`}
                          >
                            Số thứ tự (1, 2, 3...)
                          </button>
                        </div>

                        <div className="space-y-2">
                          {block.items.map((item, itmIdx) => (
                            <div key={itmIdx} className="flex items-center gap-2">
                              <span className="size-6 rounded-lg bg-forest/10 text-forest text-xs font-bold grid place-items-center shrink-0">
                                {block.style === "number" ? itmIdx + 1 : "•"}
                              </span>
                              <input
                                type="text"
                                value={item}
                                onChange={(e) => {
                                  const copy = [...block.items];
                                  copy[itmIdx] = e.target.value;
                                  updateBlock(block.id, { items: copy });
                                }}
                                placeholder="Nội dung dòng..."
                                className="flex-1 px-3 py-2 rounded-xl bg-beige/40 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const copy = block.items.filter((_, i) => i !== itmIdx);
                                  updateBlock(block.id, { items: copy.length ? copy : [""] });
                                }}
                                className="p-2 text-ink/40 hover:text-red-600 transition"
                              >
                                <X className="size-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => updateBlock(block.id, { items: [...block.items, ""] })}
                          className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
                        >
                          <Plus className="size-3" /> Thêm dòng mới
                        </button>
                      </div>
                    )}

                    {/* 7. Divider */}
                    {block.type === "divider" && (
                      <div className="py-4 flex items-center justify-center">
                        <div className="w-full border-t-2 border-dashed border-black/10 flex items-center justify-center">
                          <span className="bg-white px-4 text-xs font-bold text-ink/40 uppercase tracking-widest">
                            --- Đường kẻ phân tách ---
                          </span>
                        </div>
                      </div>
                    )}

                    {/* 8. Code / Note */}
                    {block.type === "code" && (
                      <div className="space-y-2">
                        <textarea
                          value={block.code}
                          onChange={(e) => updateBlock(block.id, { code: e.target.value })}
                          rows={3}
                          placeholder="// Nhập thông tin ghi chú đặc biệt hoặc mã..."
                          className="w-full px-4 py-3 rounded-2xl bg-neutral-900 text-emerald-400 font-mono text-xs focus:outline-none focus:ring-2 focus:ring-forest"
                        />
                      </div>
                    )}

                    {/* 9. Video Block */}
                    {block.type === "video" && (
                      <div className="space-y-4 rounded-2xl bg-rose-50/50 p-4 border border-rose-200/70">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rose-200/50 pb-3">
                          <div className="flex items-center gap-2">
                            <div className="size-8 rounded-xl bg-rose-600 text-white grid place-items-center shadow-sm">
                              <Video className="size-4" />
                            </div>
                            <div>
                              <h4 className="text-xs font-black text-rose-950 uppercase tracking-wider">Khối Video Trực Quan</h4>
                              <p className="text-[11px] text-rose-800/70">Hỗ trợ YouTube, YouTube Shorts, TikTok, Vimeo hoặc link file MP4</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-rose-200">
                            <button
                              type="button"
                              onClick={() => updateBlock(block.id, { aspectRatio: "16/9" })}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                (block.aspectRatio || "16/9") === "16/9"
                                  ? "bg-rose-600 text-white shadow-sm"
                                  : "text-rose-900 hover:bg-rose-50"
                              }`}
                            >
                              16:9 Chuẩn ngang
                            </button>
                            <button
                              type="button"
                              onClick={() => updateBlock(block.id, { aspectRatio: "9/16" })}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                block.aspectRatio === "9/16"
                                  ? "bg-rose-600 text-white shadow-sm"
                                  : "text-rose-900 hover:bg-rose-50"
                              }`}
                            >
                              9:16 Dọc (Shorts/TikTok)
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-ink/70 block mb-1">
                            Đường dẫn Video (URL) <span className="text-rose-600">*</span>:
                          </label>
                          <input
                            type="text"
                            value={block.url}
                            onChange={(e) => updateBlock(block.id, { url: e.target.value })}
                            placeholder="https://www.youtube.com/watch?v=... hoặc https://youtu.be/... hoặc https://youtube.com/shorts/..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white text-xs font-mono text-ink focus:outline-none focus:ring-2 focus:ring-rose-500 border border-black/5"
                          />
                          <p className="text-[10px] text-ink/50 mt-1">
                            💡 Mẹo: Dán bất kỳ link YouTube (kể cả Shorts), Vimeo hoặc liên kết MP4 trực tiếp.
                          </p>
                        </div>

                        <div>
                          <label className="text-[11px] font-bold text-ink/70 block mb-1">
                            Chú thích video (Hiển thị dưới video):
                          </label>
                          <input
                            type="text"
                            value={block.caption || ""}
                            onChange={(e) => updateBlock(block.id, { caption: e.target.value })}
                            placeholder="Ví dụ: Video trải nghiệm khám phá bản làng A Lưới mùa lễ hội..."
                            className="w-full px-3.5 py-2.5 rounded-xl bg-white text-xs text-ink focus:outline-none focus:ring-2 focus:ring-rose-500 border border-black/5"
                          />
                        </div>

                        {/* Live Preview Inside Canvas */}
                        {block.url && (
                          <div className="pt-2">
                            <label className="text-[11px] font-bold text-ink/70 block mb-1.5">
                              Xem trước hiển thị (Live Preview):
                            </label>
                            <div
                              className={`relative overflow-hidden rounded-2xl bg-black border border-black/10 shadow-inner ${
                                block.aspectRatio === "9/16" || block.url.includes("/shorts/")
                                  ? "max-w-[260px] mx-auto aspect-[9/16]"
                                  : "w-full aspect-video"
                              }`}
                            >
                              {parseYouTubeId(block.url) ? (
                                <iframe
                                  src={`https://www.youtube-nocookie.com/embed/${parseYouTubeId(block.url)}?rel=0`}
                                  title={block.caption || "Preview Video"}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="absolute inset-0 h-full w-full border-0"
                                />
                              ) : parseVimeoId(block.url) ? (
                                <iframe
                                  src={`https://player.vimeo.com/video/${parseVimeoId(block.url)}?dnt=1`}
                                  title={block.caption || "Preview Video"}
                                  allow="autoplay; fullscreen; picture-in-picture"
                                  allowFullScreen
                                  className="absolute inset-0 h-full w-full border-0"
                                />
                              ) : /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(block.url) ? (
                                <video
                                  src={block.url}
                                  controls
                                  playsInline
                                  className="h-full w-full object-contain"
                                />
                              ) : (
                                <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-white p-4 text-center">
                                  <Film className="size-8 text-rose-400" />
                                  <p className="text-xs font-bold text-white/90">Video từ liên kết nguồn ngoài</p>
                                  <a
                                    href={block.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] text-rose-300 underline break-all max-w-full"
                                  >
                                    {block.url}
                                  </a>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Add block right beneath this block */}
                    <div className="mt-3 pt-3 border-t border-black/5 flex items-center justify-between text-[11px] text-ink/40">
                      <span>Khối #{index + 1}</span>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition duration-200">
                        <span>Chèn tiếp:</span>
                        <button
                          type="button"
                          onClick={() => addBlock("paragraph", index)}
                          className="px-2 py-0.5 rounded bg-beige hover:bg-forest hover:text-white font-bold text-[10px]"
                        >
                          + Đoạn văn
                        </button>
                        <button
                          type="button"
                          onClick={() => addBlock("image", index)}
                          className="px-2 py-0.5 rounded bg-forest/10 hover:bg-forest hover:text-white text-forest font-bold text-[10px]"
                        >
                          + Ảnh
                        </button>
                        <button
                          type="button"
                          onClick={() => addBlock("video", index)}
                          className="px-2 py-0.5 rounded bg-rose-100 hover:bg-rose-600 hover:text-white text-rose-900 font-bold text-[10px]"
                        >
                          + Video
                        </button>
                        <button
                          type="button"
                          onClick={() => addBlock("heading", index)}
                          className="px-2 py-0.5 rounded bg-beige hover:bg-forest hover:text-white font-bold text-[10px]"
                        >
                          + Tiêu đề
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Big Add Block Bar */}
              <div className="rounded-3xl border-2 border-dashed border-forest/30 p-8 text-center space-y-4 hover:border-forest hover:bg-forest/5 transition duration-200">
                <div>
                  <h3 className="text-sm font-black text-forest">Thêm Khối Nội Dung Mới</h3>
                  <p className="text-xs text-ink/60 mt-0.5">Xây dựng bài viết phong phú theo cấu trúc từng khối chuyên nghiệp</p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-lg mx-auto">
                  <button
                    type="button"
                    onClick={() => addBlock("paragraph")}
                    className="px-4 py-2 rounded-2xl bg-white shadow-sm border border-black/10 text-xs font-bold text-ink hover:bg-forest hover:text-white transition"
                  >
                    + Đoạn văn
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock("heading")}
                    className="px-4 py-2 rounded-2xl bg-white shadow-sm border border-black/10 text-xs font-bold text-ink hover:bg-forest hover:text-white transition"
                  >
                    + Tiêu đề H2/H3
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock("image")}
                    className="px-4 py-2 rounded-2xl bg-forest text-white shadow-sm text-xs font-black hover:bg-forest/90 transition flex items-center gap-1.5"
                  >
                    <ImageIcon className="size-3.5" />
                    + Chèn Ảnh Mới
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock("gallery")}
                    className="px-4 py-2 rounded-2xl bg-amber-800 text-white shadow-sm text-xs font-black hover:bg-amber-900 transition flex items-center gap-1.5"
                  >
                    <Layers className="size-3.5" />
                    + Bộ Sưu Tập Gallery
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock("video")}
                    className="px-4 py-2 rounded-2xl bg-rose-600 text-white shadow-sm text-xs font-black hover:bg-rose-700 transition flex items-center gap-1.5"
                  >
                    <Video className="size-3.5" />
                    + Chèn Video
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock("quote")}
                    className="px-4 py-2 rounded-2xl bg-white shadow-sm border border-black/10 text-xs font-bold text-ink hover:bg-forest hover:text-white transition"
                  >
                    + Trích dẫn
                  </button>
                  <button
                    type="button"
                    onClick={() => addBlock("list")}
                    className="px-4 py-2 rounded-2xl bg-white shadow-sm border border-black/10 text-xs font-bold text-ink hover:bg-forest hover:text-white transition"
                  >
                    + Danh sách
                  </button>
                </div>
              </div>
            </div>

            {/* ===============================================================
                CỘT PHẢI: CÀI ĐẶT BÀI VIẾT, XUẤT BẢN & SEO (30%)
               =============================================================== */}
            <div className="space-y-6">
              {/* Card 1: Ảnh Bìa Đại Diện (Featured Image) */}
              <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-ink flex items-center gap-1.5">
                    <ImageIcon className="size-4 text-forest" />
                    Ảnh Bìa Bài Viết (Cover)
                  </h3>
                  <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-bold text-forest">
                    Bắt buộc
                  </span>
                </div>

                <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-black/10 bg-neutral-100 group">
                  <AppImage src={currentPost.image} alt={currentPost.title || "Ảnh bìa"} fill className="object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-xl bg-white text-forest text-xs font-bold shadow hover:bg-beige transition"
                    >
                      Tải từ máy
                    </button>
                    <button
                      type="button"
                      onClick={() => openMediaPicker("cover")}
                      className="px-3 py-1.5 rounded-xl bg-forest text-white text-xs font-bold shadow hover:bg-forest/90 transition"
                    >
                      Thư viện Media
                    </button>
                  </div>
                </div>

                <input
                  type="file"
                  ref={coverFileInputRef}
                  accept="image/*"
                  onChange={handleCoverUpload}
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    className="flex-1 py-2 rounded-xl bg-beige hover:bg-forest/10 text-xs font-bold text-ink hover:text-forest transition flex items-center justify-center gap-1.5"
                  >
                    <Upload className="size-3.5" />
                    Tải ảnh từ máy
                  </button>
                  <button
                    type="button"
                    onClick={() => openMediaPicker("cover")}
                    className="flex-1 py-2 rounded-xl bg-forest/10 hover:bg-forest text-xs font-bold text-forest hover:text-white transition flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="size-3.5" />
                    Media Picker
                  </button>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink/70 block mb-1">Hoặc dán URL ảnh bìa:</label>
                  <input
                    type="text"
                    value={currentPost.image}
                    onChange={(e) => {
                      setCurrentPost({ ...currentPost, image: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="https://... hoặc /images/..."
                    className="w-full px-3 py-2 rounded-xl bg-beige/60 font-mono text-xs text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>

                <div className="pt-2 border-t border-black/5">
                  <label className="text-[11px] font-bold text-ink/70 block mb-1 flex items-center gap-1.5">
                    <Video className="size-3.5 text-rose-600" />
                    Video tiêu điểm bài viết (Tùy chọn - YouTube/MP4):
                  </label>
                  <input
                    type="text"
                    value={currentPost.videoUrl || ""}
                    onChange={(e) => {
                      setCurrentPost({ ...currentPost, videoUrl: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 rounded-xl bg-beige/60 font-mono text-xs text-ink focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <p className="text-[10px] text-ink/50 mt-1">
                    Nếu có, video này sẽ xuất hiện ở đầu bài viết (thay thế hoặc mở rộng cho ảnh bìa).
                  </p>
                </div>
              </div>

              {/* Card 2: Cài Đặt Xuất Bản (Publish Settings) */}
              <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5 space-y-4">
                <h3 className="font-extrabold text-xs uppercase tracking-wider text-ink flex items-center gap-1.5">
                  <SettingsIcon className="size-4 text-forest" />
                  Cài Đặt Xuất Bản
                </h3>

                {/* Danh mục */}
                <div>
                  <label className="text-xs font-bold text-ink block mb-1">Danh mục bài viết:</label>
                  <select
                    value={currentPost.category}
                    onChange={(e) => {
                      setCurrentPost({ ...currentPost, category: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-beige/60 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tác giả */}
                <div>
                  <label className="text-xs font-bold text-ink block mb-1">Tác giả bài viết:</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink/40" />
                    <input
                      type="text"
                      value={currentPost.author}
                      onChange={(e) => {
                        setCurrentPost({ ...currentPost, author: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      placeholder="Ban biên tập Chạm..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-beige/60 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                    />
                  </div>
                </div>

                {/* Ngày xuất bản */}
                <div>
                  <label className="text-xs font-bold text-ink block mb-1">Ngày xuất bản:</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink/40" />
                    <input
                      type="date"
                      value={currentPost.date}
                      onChange={(e) => {
                        setCurrentPost({ ...currentPost, date: e.target.value });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-beige/60 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                    />
                  </div>
                </div>

                {/* Thẻ Tags */}
                <div>
                  <label className="text-xs font-bold text-ink block mb-1">Thẻ Tags (Gõ xong nhấn Enter):</label>
                  <div className="flex flex-wrap gap-1.5 p-2 rounded-xl bg-beige/40 min-h-[44px] items-center">
                    {currentPost.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-lg bg-forest/10 px-2 py-1 text-xs font-bold text-forest"
                      >
                        #{tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-600">
                          <X className="size-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={addTag}
                      placeholder="Thêm tag..."
                      className="flex-1 min-w-[80px] bg-transparent text-xs text-ink focus:outline-none px-1"
                    />
                  </div>
                </div>

                {/* Đường dẫn URL (Slug) */}
                <div className="pt-2 border-t border-black/5">
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-ink">Đường dẫn tĩnh (URL Slug):</label>
                    <button
                      type="button"
                      onClick={() => setIsSlugManual(!isSlugManual)}
                      className="text-[10px] font-bold text-forest hover:underline"
                    >
                      {isSlugManual ? "Tự động tạo theo tiêu đề" : "Chỉnh sửa tay"}
                    </button>
                  </div>
                  <div className="flex items-center gap-1 bg-beige/60 rounded-xl px-3 py-2">
                    <span className="text-xs text-ink/40 font-mono">/blog/</span>
                    <input
                      type="text"
                      value={currentPost.slug}
                      readOnly={!isSlugManual}
                      onChange={(e) => {
                        setCurrentPost({ ...currentPost, slug: slugify(e.target.value) });
                        setHasUnsavedChanges(true);
                      }}
                      className={`flex-1 bg-transparent text-xs font-mono text-forest font-bold focus:outline-none ${
                        !isSlugManual ? "cursor-default" : ""
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Tối Ưu Hóa SEO Google (SERP Preview) */}
              <div className="rounded-3xl bg-white p-6 shadow-card border border-black/5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-ink flex items-center gap-1.5">
                    <Globe className="size-4 text-forest" />
                    Tối Ưu Hóa SEO Google
                  </h3>
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                    Google Snippet
                  </span>
                </div>

                {/* Google Search Result Mockup */}
                <div className="rounded-2xl bg-neutral-50 p-4 border border-black/10 space-y-1">
                  <p className="text-[11px] text-neutral-600 font-sans line-clamp-1">
                    https://chamaluoi.vn › blog › {currentPost.slug || "bai-viet"}
                  </p>
                  <h4 className="text-sm font-medium text-blue-700 hover:underline line-clamp-1 cursor-pointer">
                    {currentPost.seoTitle || currentPost.title || "Tiêu đề hiển thị trên Google"} | Chạm A Lưới
                  </h4>
                  <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">
                    {currentPost.seoDescription ||
                      currentPost.excerpt ||
                      "Mô tả tóm tắt nội dung bài viết hiển thị trên trang kết quả tìm kiếm của Google..."}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-ink">SEO Title (Tiêu đề Google):</label>
                    <span className={`text-[10px] font-bold ${(currentPost.seoTitle?.length || 0) > 60 ? "text-amber-600" : "text-ink/40"}`}>
                      {currentPost.seoTitle?.length || 0}/60 ký tự
                    </span>
                  </div>
                  <input
                    type="text"
                    value={currentPost.seoTitle || ""}
                    onChange={(e) => {
                      setCurrentPost({ ...currentPost, seoTitle: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Mặc định lấy từ tiêu đề bài viết..."
                    className="w-full px-3 py-2 rounded-xl bg-beige/60 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-forest"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-ink">SEO Meta Description:</label>
                    <span className={`text-[10px] font-bold ${(currentPost.seoDescription?.length || 0) > 160 ? "text-amber-600" : "text-ink/40"}`}>
                      {currentPost.seoDescription?.length || 0}/160 ký tự
                    </span>
                  </div>
                  <textarea
                    value={currentPost.seoDescription || ""}
                    onChange={(e) => {
                      setCurrentPost({ ...currentPost, seoDescription: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    rows={3}
                    placeholder="Đoạn mô tả 120-160 ký tự kích thích người đọc bấm vào bài viết trên Google..."
                    className="w-full px-3 py-2 rounded-xl bg-beige/60 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-forest resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL: LIVE PREVIEW (XEM TRƯỚC GIỐNG WEB KHÁCH HÀNG 100%)
         =================================================================== */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative flex flex-col w-full max-w-5xl h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-beige/60">
              <div className="flex items-center gap-3">
                <span className="size-3 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-black text-ink">Xem Trước Bài Viết (Live Customer Preview)</h3>
                <span className="text-xs text-ink/50">Mô phỏng 100% trang web khách: port 3000/blog/{currentPost.slug}</span>
              </div>

              <div className="flex items-center gap-3">
                {/* Device Switcher */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-black/10 shadow-sm">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                      previewDevice === "desktop" ? "bg-forest text-white" : "text-ink/60 hover:text-ink"
                    }`}
                  >
                    <Monitor className="size-3.5" /> Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition ${
                      previewDevice === "mobile" ? "bg-forest text-white" : "text-ink/60 hover:text-ink"
                    }`}
                  >
                    <Smartphone className="size-3.5" /> Mobile
                  </button>
                </div>


                <a
                  href={`http://localhost:3000/blog/${currentPost.slug}?preview=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest text-white text-xs font-bold shadow-sm hover:bg-forest/90 transition"
                  title="Mở bài viết trực tiếp trên giao diện website khách hàng port 3000"
                >
                  <ExternalLink className="size-3.5" />
                  <span>Mở trên Web khách (Tab mới)</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 rounded-xl bg-black/5 hover:bg-black/10 text-ink/70 transition"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Modal Content Frame */}
            <div className="flex-1 overflow-y-auto bg-neutral-100 p-4 md:p-8 flex justify-center">
              <div
                className={`bg-white rounded-3xl shadow-xl transition-all duration-300 overflow-hidden ${
                  previewDevice === "mobile" ? "w-[390px] min-h-[700px] border-8 border-neutral-800" : "w-full max-w-4xl"
                }`}
              >
                {/* Customer Header Simulation */}
                <div className="p-6 md:p-12 space-y-8">
                  <header className="max-w-3xl mx-auto text-center space-y-3">
                    <span className="inline-block rounded-full bg-forest/10 px-4 py-1 text-xs font-extrabold text-forest uppercase tracking-widest">
                      {currentPost.category}
                    </span>
                    <h1 className="text-2xl md:text-5xl font-extrabold text-ink leading-tight">
                      {currentPost.title || "Tiêu đề bài viết chưa nhập"}
                    </h1>
                    <p className="text-xs md:text-sm text-ink/60">
                      Bởi <strong className="text-ink">{currentPost.author}</strong> · Ngày {currentPost.date} ·{" "}
                      <span className="text-forest font-bold">{calculateReadingTime(currentPost.blocks)}</span>
                    </p>
                  </header>

                  {/* Hero Video or Cover Image */}
                  {currentPost.videoUrl ? (
                    <div className="space-y-2">
                      <div className="relative aspect-video rounded-3xl overflow-hidden shadow-card border border-black/5 bg-black">
                        {parseYouTubeId(currentPost.videoUrl) ? (
                          <iframe
                            src={`https://www.youtube-nocookie.com/embed/${parseYouTubeId(currentPost.videoUrl)}?rel=0`}
                            title={currentPost.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 h-full w-full border-0"
                          />
                        ) : parseVimeoId(currentPost.videoUrl) ? (
                          <iframe
                            src={`https://player.vimeo.com/video/${parseVimeoId(currentPost.videoUrl)}?dnt=1`}
                            title={currentPost.title}
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 h-full w-full border-0"
                          />
                        ) : (
                          <video src={currentPost.videoUrl} controls playsInline className="h-full w-full object-contain" />
                        )}
                      </div>
                    </div>
                  ) : (
                    <figure className="relative aspect-[16/9] rounded-3xl overflow-hidden shadow-card border border-black/5">
                      <AppImage src={currentPost.image} alt={currentPost.title} fill priority className="object-cover" />
                    </figure>
                  )}

                  {/* Excerpt */}
                  {currentPost.excerpt && (
                    <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-forest/5 border-l-4 border-forest text-sm italic text-ink/80 leading-relaxed font-serif">
                      {currentPost.excerpt}
                    </div>
                  )}

                  {/* Sequential Content Blocks */}
                  <div className="max-w-3xl mx-auto space-y-6 text-ink/80 leading-relaxed">
                    {currentPost.blocks.map((b) => (
                      <div key={b.id}>
                        {b.type === "paragraph" && (
                          <p
                            className="text-base md:text-lg leading-8"
                            style={{ textAlign: b.align || "left" }}
                          >
                            {b.content}
                          </p>
                        )}

                        {b.type === "heading" && (
                          b.level === 3 ? (
                            <h3 className="text-xl md:text-2xl font-bold text-forest mt-8 mb-3">
                              {b.content}
                            </h3>
                          ) : (
                            <h2 className="text-2xl md:text-3xl font-extrabold text-ink mt-10 mb-4">
                              {b.content}
                            </h2>
                          )
                        )}

                        {b.type === "image" && (
                          <figure
                            className={`my-6 ${
                              b.align === "center"
                                ? "mx-auto text-center"
                                : b.align === "right"
                                ? "ml-auto text-right"
                                : "mr-auto text-left"
                            }`}
                            style={{
                              maxWidth:
                                b.width === "sm" ? "320px" : b.width === "md" ? "540px" : b.width === "lg" ? "760px" : "100%"
                            }}
                          >
                            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden shadow-card border border-black/5">
                              <AppImage src={b.url} alt={b.alt || "Ảnh bài viết"} fill className="object-cover" />
                            </div>
                            {b.caption && (
                              <figcaption className="mt-2 text-xs italic text-ink/60 text-center">
                                {b.caption}
                              </figcaption>
                            )}
                          </figure>
                        )}

                        {b.type === "gallery" && (
                          <div className="my-8 space-y-3">
                            <div
                              className={`grid gap-3 ${
                                b.layout === "grid-2" ? "grid-cols-2" : "grid-cols-2 md:grid-cols-3"
                              }`}
                            >
                              {b.images.map((img) => (
                                <figure key={img.id} className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-card border border-black/5">
                                  <AppImage src={img.url} alt={img.caption || "Gallery"} fill className="object-cover" />
                                  {img.caption && (
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-white text-[11px] font-semibold text-center truncate">
                                      {img.caption}
                                    </div>
                                  )}
                                </figure>
                              ))}
                            </div>
                          </div>
                        )}

                        {b.type === "quote" && (
                          <blockquote className="my-8 p-6 rounded-2xl bg-forest/5 border-l-4 border-forest">
                            <p className="text-lg italic font-serif text-ink leading-relaxed">
                              "{b.content}"
                            </p>
                            {b.author && (
                              <cite className="block mt-2 text-xs font-bold text-forest not-italic">
                                — {b.author}
                              </cite>
                            )}
                          </blockquote>
                        )}

                        {b.type === "list" && (
                          <ul className={`my-4 space-y-2 pl-6 ${b.style === "number" ? "list-decimal" : "list-disc"}`}>
                            {b.items.map((itm, i) => (
                              <li key={i} className="text-base text-ink/80">
                                {itm}
                              </li>
                            ))}
                          </ul>
                        )}

                        {b.type === "divider" && (
                          <hr className="my-8 border-t-2 border-forest/15" />
                        )}

                        {b.type === "code" && (
                          <pre className="my-6 p-4 rounded-2xl bg-neutral-900 text-emerald-300 font-mono text-xs overflow-x-auto">
                            {b.code}
                          </pre>
                        )}

                        {b.type === "video" && (
                          <figure className="my-8">
                            <div
                              className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border border-black/10 bg-black shadow-card ${
                                b.aspectRatio === "9/16" || b.url.includes("/shorts/")
                                  ? "max-w-xs mx-auto aspect-[9/16]"
                                  : "aspect-video"
                              }`}
                            >
                              {parseYouTubeId(b.url) ? (
                                <iframe
                                  src={`https://www.youtube-nocookie.com/embed/${parseYouTubeId(b.url)}?rel=0`}
                                  title={b.caption || "Video bài viết"}
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                  className="absolute inset-0 h-full w-full border-0"
                                />
                              ) : parseVimeoId(b.url) ? (
                                <iframe
                                  src={`https://player.vimeo.com/video/${parseVimeoId(b.url)}?dnt=1`}
                                  title={b.caption || "Video bài viết"}
                                  allow="autoplay; fullscreen; picture-in-picture"
                                  allowFullScreen
                                  className="absolute inset-0 h-full w-full border-0"
                                />
                              ) : (
                                <video src={b.url} controls playsInline className="h-full w-full object-contain" />
                              )}
                            </div>
                            {b.caption && (
                              <figcaption className="mt-2 text-center text-xs italic text-ink/65">
                                🎥 {b.caption}
                              </figcaption>
                            )}
                          </figure>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Tags */}
                  <footer className="max-w-3xl mx-auto pt-8 border-t border-black/10 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-ink/50">Thẻ bài viết:</span>
                    {currentPost.tags.map((t) => (
                      <span key={t} className="rounded-full bg-beige px-3 py-1 text-xs font-bold text-forest">
                        #{t}
                      </span>
                    ))}
                  </footer>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL: MEDIA PICKER DÙNG CHUNG (TÁI SỬ DỤNG TỪ MEDIA LIBRARY)
         =================================================================== */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative flex flex-col w-full max-w-4xl h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-beige/60">
              <div className="flex items-center gap-2">
                <ImageIcon className="size-5 text-forest" />
                <h3 className="text-sm font-black text-ink">Thư Viện Media Dùng Chung — Chọn Ảnh Cho Blog</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMediaPickerOpen(false);
                  setPickerTarget(null);
                }}
                className="p-1.5 rounded-xl bg-black/5 hover:bg-black/10 text-ink/70"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Grid of Images */}
            <div className="flex-1 overflow-y-auto p-6">
              {systemAssets.length === 0 ? (
                <div className="text-center py-12 text-ink/50 space-y-3">
                  <ImageIcon className="size-10 mx-auto text-ink/30" />
                  <p className="text-sm font-bold">Thư viện chưa có ảnh nào.</p>
                  <p className="text-xs">Hãy tải ảnh lên từ máy tính hoặc vào mục Thư viện Media & Ảnh để nạp thêm.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {systemAssets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => handleSelectFromMediaPicker(asset.url)}
                      className="group cursor-pointer rounded-2xl overflow-hidden border border-black/10 bg-beige/30 hover:border-forest hover:shadow-lg transition flex flex-col"
                    >
                      <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden">
                        <AppImage src={asset.url} alt={asset.name} fill sizes="200px" className="object-cover group-hover:scale-105 transition duration-300" />
                      </div>
                      <div className="p-2.5">
                        <p className="text-xs font-bold text-ink truncate">{asset.name}</p>
                        <p className="text-[10px] text-ink/40 font-mono truncate">{asset.url}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-black/10 bg-beige/30 flex items-center justify-between">
              <span className="text-xs text-ink/50">Nhấp vào bất kỳ ảnh nào để áp dụng ngay vào bài viết</span>
              <button
                type="button"
                onClick={() => {
                  setIsMediaPickerOpen(false);
                  setPickerTarget(null);
                }}
                className="px-4 py-2 rounded-xl bg-beige text-xs font-bold text-ink hover:bg-black/10"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminBlogManagementPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-bold text-ink/60">Đang tải trình quản lý Blog...</div>}>
      <AdminBlogManagementPageContent />
    </Suspense>
  );
}
