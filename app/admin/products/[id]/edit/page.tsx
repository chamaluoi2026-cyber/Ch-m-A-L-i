"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Eye,
  Globe,
  Plus,
  Image as ImageIcon,
  DollarSign,
  Tag,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  ExternalLink,
  Phone,
  Link as LinkIcon,
  Video,
  Award,
  Layers,
  Sparkles,
  Truck,
  ShieldCheck,
  Scale,
  Calendar,
  ThermometerSnowflake,
  Package,
  Check,
  X,
  Building2,
  Percent,
  Search
} from "lucide-react";
import { AppImage } from "@/components/ui/app-image";
import type { ProductRecord, ProductStatus } from "@/data/products";
import { productCategories, defaultProducts } from "@/data/products";
import {
  fetchProductBySlugAction,
  saveProductAction
} from "@/app/actions/products";
import { generateProductAiAction } from "@/app/actions/ai-writer";
import type { AiWritingTone } from "@/lib/ai/product-content-generator";
import { getUploadedImagesAction, type UploadedImageItem } from "@/app/actions/upload";

const CUSTOMER_URL = "https://chamaluoi.vercel.app";

function parseYouTubeId(url: string): string | null {
  if (!url) return null;
  const clean = url.trim();
  const shortMatch = clean.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  const watchMatch = clean.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  const embedMatch = clean.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  return null;
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function createEmptyProduct(): ProductRecord {
  const now = new Date().toISOString();
  return {
    id: "",
    slug: "",
    name: "",
    category: "OCOP A Lưới",
    price: 150000,
    originalPrice: undefined,
    unit: "sản phẩm",
    image: "/images/products/forest-honey.png",
    coverImage: "/images/products/forest-honey.png",
    gallery: ["/images/products/forest-honey.png"],
    description: "",
    specs: [],
    videoUrl: "",
    status: "active",
    businessName: "HTX Nông nghiệp & Dược liệu A Lưới",
    businessId: "biz-aluoi",
    phone: "0905 000 118",
    zaloUrl: "https://zalo.me/0905000118",
    isOcop: true,
    ocopStars: 3,
    weight: "500g",
    expiryDate: "12 tháng kể từ ngày sản xuất",
    storageGuide: "Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp",
    origin: "Huyện A Lưới, Thừa Thiên Huế",
    stock: 100,
    variations: [],
    seoTitle: "",
    seoDescription: "",
    rating: 4.9,
    reviewCount: 1,
    createdAt: now,
    updatedAt: now
  };
}

const SECTIONS = [
  { id: "basic", label: "Thông tin cơ bản", icon: Tag },
  { id: "pricing", label: "Giá & Bán hàng (Shopee)", icon: DollarSign },
  { id: "media", label: "Hình ảnh & Video", icon: ImageIcon },
  { id: "details", label: "Mô tả & Đặc điểm", icon: Layers },
  { id: "quality", label: "Tiêu chuẩn & OCOP", icon: Award },
  { id: "shipping", label: "Vận chuyển & Liên hệ", icon: Truck },
  { id: "seo", label: "Cấu hình SEO", icon: Globe }
];

function ProductEditContent() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;
  const isNew = productId === "new";

  const [product, setProduct] = useState<ProductRecord>(createEmptyProduct());
  const [specsInput, setSpecsInput] = useState("");
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [activeSection, setActiveSection] = useState("basic");
  const [slugManual, setSlugManual] = useState(false);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Media picker modal
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [mediaPickerTarget, setMediaPickerTarget] = useState<"cover" | "gallery">("cover");
  const [uploadedImages, setUploadedImages] = useState<UploadedImageItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);

  // AI Writer
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiTone, setAiTone] = useState<AiWritingTone>("shopee");
  const [aiKeywords, setAiKeywords] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleGenerateAi() {
    if (!product.name.trim()) {
      showToast("error", "Vui lòng nhập tên đặc sản trước để AI hiểu sản phẩm cần viết.");
      return;
    }
    setAiGenerating(true);
    try {
      const res = await generateProductAiAction({
        name: product.name,
        category: product.category,
        origin: product.origin,
        tone: aiTone,
        keywords: aiKeywords,
        existingSpecs: specsInput ? specsInput.split("\n").map((s) => s.trim()).filter(Boolean) : undefined,
      });

      if (res.success && res.data) {
        const d = res.data;
        upd({
          description: d.description,
          weight: d.weight || product.weight,
          expiryDate: d.expiryDate || product.expiryDate,
          storageGuide: d.storageGuide || product.storageGuide,
          origin: d.origin || product.origin,
          seoTitle: d.seoTitle || product.seoTitle,
          seoDescription: d.seoDescription || product.seoDescription,
        });
        if (d.specs && d.specs.length > 0) {
          setSpecsInput(d.specs.join("\n"));
        }
        showToast("success", "✨ AI đã soạn thảo nội dung thành công!");
        setAiModalOpen(false);
      } else {
        showToast("error", res.error || "Không thể tạo nội dung AI.");
      }
    } catch {
      showToast("error", "Lỗi xảy ra trong quá trình gọi AI.");
    } finally {
      setAiGenerating(false);
    }
  }

  useEffect(() => {
    if (isNew) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      const data = await fetchProductBySlugAction(productId);
      if (data) {
        setProduct(data);
        setSpecsInput((data.specs || []).join("\n"));
      } else {
        // Fallback default
        const found = defaultProducts.find((p) => p.slug === productId);
        if (found) {
          setProduct(found);
          setSpecsInput((found.specs || []).join("\n"));
        } else {
          showToast("error", "Không tìm thấy đặc sản này.");
        }
      }
      setLoading(false);
    })();
  }, [productId, isNew]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveSection(e.target.id);
        }),
      { threshold: 0.25, rootMargin: "-80px 0px -60% 0px" }
    );
    Object.values(sectionRefs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, [loading]);

  function upd(patch: Partial<ProductRecord>) {
    setProduct((prev) => {
      const next = { ...prev, ...patch };
      if ("name" in patch && !slugManual && isNew) {
        next.slug = generateSlug(patch.name || "");
      }
      // Tự động tính % giảm giá nếu đổi giá
      if ("price" in patch || "originalPrice" in patch) {
        const p = patch.price !== undefined ? Number(patch.price) : next.price;
        const op = patch.originalPrice !== undefined ? Number(patch.originalPrice) : next.originalPrice;
        if (op && op > p) {
          next.discountPercent = Math.round(((op - p) / op) * 100);
        } else {
          next.discountPercent = undefined;
        }
      }
      return next;
    });
  }

  async function openMediaPicker(target: "cover" | "gallery") {
    setMediaPickerTarget(target);
    setMediaPickerOpen(true);
    if (uploadedImages.length === 0) {
      setLoadingMedia(true);
      try {
        const imgs = await getUploadedImagesAction();
        setUploadedImages(imgs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMedia(false);
      }
    }
  }

  async function handleSave(publish?: boolean) {
    if (!product.name.trim()) {
      showToast("error", "Vui lòng nhập tên đặc sản.");
      return;
    }
    if (!product.slug.trim()) {
      showToast("error", "Vui lòng nhập đường dẫn (slug).");
      return;
    }

    setSaving(true);
    try {
      let targetStatus: ProductStatus = product.status || "active";
      if (publish === false) {
        targetStatus = "hidden";
      } else if (publish === true && isNew && (!product.status || product.status === "hidden")) {
        targetStatus = "active";
      }

      const specs = specsInput
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

      const toSave: ProductRecord = {
        ...product,
        status: targetStatus,
        specs,
        gallery: product.gallery && product.gallery.length > 0 ? product.gallery : [product.image],
        coverImage: product.image,
        seoTitle: product.seoTitle || `${product.name} | Đặc sản A Lưới`,
        seoDescription: product.seoDescription || product.description
      };

      const res = await saveProductAction(toSave);
      if (res.success && res.product) {
        setProduct(res.product);
        const statusMsg =
          targetStatus === "active"
            ? "Đã lưu & Đang mở bán trên website khách!"
            : targetStatus === "out_of_stock"
            ? "Đã lưu trạng thái: Tạm hết hàng!"
            : "Đã lưu bản nháp (Đang ẩn khỏi web)!";
        showToast("success", statusMsg);
        if (isNew && res.product.slug) {
          router.replace(`/admin/products/${res.product.slug}/edit`);
        }
      } else {
        showToast("error", res.error || "Không thể lưu đặc sản.");
      }
    } catch {
      showToast("error", "Lỗi xảy ra khi lưu đặc sản.");
    } finally {
      setSaving(false);
    }
  }

  const sRef = (id: string) => (el: HTMLElement | null) => {
    sectionRefs.current[id] = el;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F4F6F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-ink/60">
          <Loader2 size={36} className="animate-spin text-forest" />
          <p className="text-xs font-semibold">Đang tải thông tin đặc sản...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F5] pb-24 text-ink">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-white text-xs font-bold ${
            toast.type === "success" ? "bg-forest" : "bg-rose-600"
          }`}
        >
          {toast.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* ── Sticky Top Bar ── */}
      <header className="sticky top-0 z-40 bg-white border-b border-black/5 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-4">
          <Link
            href="/admin/products"
            className="flex items-center gap-2 text-xs font-bold text-ink/60 hover:text-forest transition shrink-0"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Quản lý Đặc sản</span>
          </Link>

          <div className="flex-1 min-w-0">
            <h1 className="text-sm md:text-base font-extrabold text-ink truncate">
              {product.name || (isNew ? "Thêm đặc sản mới" : "Chỉnh sửa đặc sản")}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  product.status === "active"
                    ? "bg-emerald-100 text-emerald-800"
                    : product.status === "out_of_stock"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-stone-100 text-stone-600"
                }`}
              >
                {product.status === "active"
                  ? "Đang mở bán"
                  : product.status === "out_of_stock"
                  ? "Tạm hết hàng"
                  : "Đang ẩn"}
              </span>
              {product.slug && (
                <span className="text-[11px] text-ink/40 font-mono">/products/{product.slug}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {product.slug && (
              <a
                href={`${CUSTOMER_URL}/products/${product.slug}?preview=true`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-black/10 text-ink/70 hover:border-forest hover:text-forest transition"
              >
                <Eye size={13} />
                <span className="hidden sm:inline">Xem trước</span>
              </a>
            )}

            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl border border-black/15 text-ink/80 hover:bg-beige/40 transition disabled:opacity-60"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              <span className="hidden sm:inline">Lưu nháp (Ẩn)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving || !product.name.trim() || !product.slug.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl bg-forest text-white hover:bg-forest/90 transition shadow-md shadow-forest/20 disabled:opacity-50"
            >
              {saving ? <Loader2 size={13} className="animate-spin" /> : <Globe size={13} />}
              {isNew ? "Xuất bản" : "Lưu & Cập nhật"}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6">
        {/* Left Nav (Shopee Style Navigation) */}
        <aside className="w-52 shrink-0 hidden lg:block">
          <nav className="sticky top-20 space-y-1 bg-white p-3 rounded-2xl border border-black/5 shadow-sm text-xs font-bold">
            <p className="px-3 py-1.5 text-[10px] text-ink/40 uppercase tracking-wider">Mục chỉnh sửa</p>
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  const el = sectionRefs.current[id];
                  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition ${
                  activeSection === id
                    ? "bg-forest text-white shadow-sm"
                    : "text-ink/65 hover:bg-beige/40 hover:text-forest"
                }`}
              >
                <Icon size={14} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </aside>

        {/* Right Content Form Sections */}
        <div className="flex-1 space-y-6 max-w-4xl min-w-0">
          {/* 1. THÔNG TIN CƠ BẢN */}
          <section
            id="basic"
            ref={sRef("basic")}
            className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-forest" />
                <h2 className="font-extrabold text-ink text-sm">1. Thông tin cơ bản</h2>
              </div>
              <button
                type="button"
                onClick={() => setAiModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 text-white text-xs font-bold shadow-sm hover:opacity-95 hover:shadow-md transition active:scale-95"
              >
                <Sparkles size={14} className="text-amber-200 animate-pulse" />
                <span>✨ AI Viết bài Shopee</span>
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-ink">
                  Tên sản phẩm đặc sản <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-ink/40 font-mono">{product.name.length}/120</span>
              </div>
              <input
                type="text"
                required
                maxLength={120}
                value={product.name}
                onChange={(e) => upd({ name: e.target.value })}
                placeholder="VD: Thịt bò gác bếp A Lưới - Gói 500g gia vị tiêu rừng"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-bold text-ink text-sm"
              />
              <p className="text-[11px] text-ink/50 mt-1">
                Gợi ý công thức đặt tên Shopee: [Tên SP] + [Thương hiệu/Xuất xứ A Lưới] + [Quy cách đóng gói]
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">
                  Đường dẫn (Slug) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={product.slug}
                  onChange={(e) => {
                    setSlugManual(true);
                    upd({ slug: e.target.value });
                  }}
                  placeholder="thit-bo-gac-bep-a-luoi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-mono text-xs text-ink"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Ngành hàng / Danh mục</label>
                <select
                  value={product.category}
                  onChange={(e) => upd({ category: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-semibold text-ink text-xs"
                >
                  {productCategories.map((c) => (
                    <option key={c.id} value={c.label}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">Cơ sở sản xuất / Hợp tác xã</label>
                <input
                  type="text"
                  value={product.businessName || ""}
                  onChange={(e) => upd({ businessName: e.target.value })}
                  placeholder="VD: HTX Dệt Zèng A Roàng"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 text-xs text-ink"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Xuất xứ / Vùng sản xuất</label>
                <input
                  type="text"
                  value={product.origin || ""}
                  onChange={(e) => upd({ origin: e.target.value })}
                  placeholder="Huyện A Lưới, Thừa Thiên Huế"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 text-xs text-ink"
                />
              </div>
            </div>
          </section>

          {/* 2. GIÁ & THÔNG TIN BÁN HÀNG (SHOPEE STYLE) */}
          <section
            id="pricing"
            ref={sRef("pricing")}
            className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-2">
                <DollarSign size={16} className="text-forest" />
                <h2 className="font-extrabold text-ink text-sm">2. Thông tin Bán hàng & Thiết lập Giá (Shopee Style)</h2>
              </div>
              <span className="text-[10px] font-bold text-forest bg-forest/10 px-2 py-0.5 rounded-full">
                Tối ưu chuyển đổi
              </span>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">
                  Giá bán chính thức (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={product.price}
                    onChange={(e) => upd({ price: Number(e.target.value) })}
                    placeholder="220000"
                    className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-extrabold text-forest text-base"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink/40">₫</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">
                  Giá gốc niêm yết (So sánh gạch ngang)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={product.originalPrice || ""}
                    onChange={(e) =>
                      upd({ originalPrice: e.target.value ? Number(e.target.value) : undefined })
                    }
                    placeholder="250000"
                    className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-bold text-ink/60 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink/40">₫</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Đơn vị tính / Quy cách</label>
                <input
                  type="text"
                  value={product.unit || ""}
                  onChange={(e) => upd({ unit: e.target.value })}
                  placeholder="VD: chai 500ml, hũ, kg, tấm, combo..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-semibold text-xs text-ink"
                />
              </div>
            </div>

            {/* Shopee Discount Banner */}
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-xs">
                <span className="font-bold text-rose-800 flex items-center gap-1.5">
                  <Percent size={14} className="text-rose-600" />
                  Mức giảm giá tự động:
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-black text-xs">
                  Tiết kiệm {product.discountPercent || Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              </div>
            )}

            {/* Kho hàng & Trạng thái bán */}
            <div className="grid gap-4 sm:grid-cols-2 pt-2 border-t border-black/5">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">Số lượng tồn kho (Sẵn sàng bán)</label>
                <input
                  type="number"
                  min={0}
                  value={product.stock ?? 100}
                  onChange={(e) => upd({ stock: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-bold text-xs text-ink"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">Trạng thái bán hàng</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "active", label: "Đang bán", cls: "bg-emerald-50 text-emerald-800 border-emerald-500" },
                    { value: "out_of_stock", label: "Tạm hết", cls: "bg-amber-50 text-amber-800 border-amber-500" },
                    { value: "hidden", label: "Ẩn", cls: "bg-stone-100 text-stone-700 border-stone-400" }
                  ].map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => upd({ status: s.value as ProductStatus })}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition ${
                        product.status === s.value
                          ? `${s.cls} shadow-sm border-2`
                          : "border-black/10 text-ink/50 hover:bg-beige/30"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 3. HÌNH ẢNH & VIDEO */}
          <section
            id="media"
            ref={sRef("media")}
            className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-5"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-2">
                <ImageIcon size={16} className="text-forest" />
                <h2 className="font-extrabold text-ink text-sm">3. Quản lý Hình ảnh & Video sản phẩm</h2>
              </div>
              <button
                type="button"
                onClick={() => openMediaPicker("cover")}
                className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
              >
                <ImageIcon size={13} /> Mở kho Media
              </button>
            </div>

            {/* Ảnh bìa (Cover Image - 1:1 chuẩn Shopee) */}
            <div>
              <label className="text-xs font-bold text-ink block mb-1">
                Ảnh đại diện sản phẩm (Tỷ lệ 1:1 hoặc 4:3) <span className="text-rose-500">*</span>
              </label>
              <div className="flex items-center gap-4">
                <div className="relative size-24 rounded-2xl overflow-hidden bg-forest/5 border border-black/10 shrink-0">
                  {product.image ? (
                    <AppImage src={product.image} alt="Cover" fill className="object-cover" />
                  ) : (
                    <ImageIcon size={24} className="text-ink/30 m-auto mt-7" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    required
                    value={product.image}
                    onChange={(e) => upd({ image: e.target.value, coverImage: e.target.value })}
                    placeholder="/images/products/... hoặc https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-mono text-xs text-ink"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openMediaPicker("cover")}
                      className="px-3 py-1.5 rounded-lg border border-forest/30 bg-forest/5 text-forest font-bold text-xs hover:bg-forest/10 transition"
                    >
                      Chọn từ Media
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Thư viện ảnh sản phẩm */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-ink">Thư viện ảnh chi tiết sản phẩm</label>
                <button
                  type="button"
                  onClick={() => openMediaPicker("gallery")}
                  className="text-xs font-bold text-forest hover:underline"
                >
                  + Thêm ảnh từ Media
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5">
                {(product.gallery || []).map((imgUrl, i) => (
                  <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-forest/5 border border-black/10 group">
                    <AppImage src={imgUrl} alt={`gallery-${i}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const nextG = [...(product.gallery || [])].filter((_, idx) => idx !== i);
                        upd({ gallery: nextG });
                      }}
                      className="absolute top-1 right-1 size-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Video sản phẩm */}
            <div className="pt-2 border-t border-black/5">
              <label className="text-xs font-bold text-ink flex items-center gap-1.5 mb-1">
                <Video size={14} className="text-rose-600" />
                Video giới thiệu sản phẩm (YouTube, Shorts, TikTok, MP4)
              </label>
              <input
                type="text"
                value={product.videoUrl || ""}
                onChange={(e) => upd({ videoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=... hoặc https://youtu.be/..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-mono text-xs text-ink"
              />
              {product.videoUrl && parseYouTubeId(product.videoUrl) && (
                <div className="mt-2 aspect-video rounded-2xl overflow-hidden bg-black max-w-sm">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${parseYouTubeId(product.videoUrl)}`}
                    title="Xem trước video sản phẩm"
                    className="size-full border-0"
                    allowFullScreen
                  />
                </div>
              )}
            </div>
          </section>

          {/* 4. MÔ TẢ & ĐẶC ĐIỂM CHI TIẾT */}
          <section
            id="details"
            ref={sRef("details")}
            className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-2">
                <Layers size={16} className="text-forest" />
                <h2 className="font-extrabold text-ink text-sm">4. Mô tả chi tiết & Thông số kỹ thuật</h2>
              </div>
              <button
                type="button"
                onClick={() => setAiModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-forest/30 bg-forest/5 text-forest hover:bg-forest hover:text-white transition font-bold text-xs"
              >
                <Sparkles size={13} />
                <span>AI Soạn mô tả & thông số</span>
              </button>
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">Mô tả sản phẩm</label>
              <textarea
                rows={4}
                value={product.description}
                onChange={(e) => upd({ description: e.target.value })}
                placeholder="Mô tả chi tiết nguyên liệu, hương vị đặc trưng, giá trị văn hóa và công dụng của đặc sản..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 text-xs leading-relaxed text-ink"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">
                Đặc điểm nổi bật & Quy cách đóng gói (Mỗi dòng 1 gạch đầu dòng)
              </label>
              <textarea
                rows={4}
                value={specsInput}
                onChange={(e) => setSpecsInput(e.target.value)}
                placeholder="VD:&#10;Sợi cotton pha tự nhiên dệt tay&#10;Đính cườm thủ công tinh xảo&#10;Sản phẩm OCOP 4 sao tỉnh Thừa Thiên Huế"
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 text-xs leading-relaxed text-ink"
              />
            </div>
          </section>

          {/* 5. TIÊU CHUẨN CHẤT LƯỢNG & OCOP */}
          <section
            id="quality"
            ref={sRef("quality")}
            className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-2">
                <Award size={16} className="text-forest" />
                <h2 className="font-extrabold text-ink text-sm">5. Tiêu chuẩn chất lượng & Chứng nhận OCOP</h2>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-center justify-between gap-4">
              <label className="flex items-center gap-2.5 cursor-pointer font-bold text-amber-900 text-xs">
                <input
                  type="checkbox"
                  checked={product.isOcop || false}
                  onChange={(e) => upd({ isOcop: e.target.checked })}
                  className="size-4 rounded text-amber-600 focus:ring-amber-500 border-amber-300"
                />
                <span>Sản phẩm đạt chứng nhận OCOP A Lưới</span>
              </label>

              {product.isOcop && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-amber-900">Xếp hạng:</span>
                  <select
                    value={product.ocopStars || 3}
                    onChange={(e) => upd({ ocopStars: Number(e.target.value) })}
                    className="px-3 py-1.5 rounded-xl border border-amber-300 bg-white font-bold text-amber-800 text-xs"
                  >
                    <option value={3}>⭐⭐⭐ 3 sao</option>
                    <option value={4}>⭐⭐⭐⭐ 4 sao</option>
                    <option value={5}>⭐⭐⭐⭐⭐ 5 sao</option>
                  </select>
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">
                  <Scale size={13} className="inline mr-1 text-forest" /> Khối lượng / Thể tích
                </label>
                <input
                  type="text"
                  value={product.weight || ""}
                  onChange={(e) => upd({ weight: e.target.value })}
                  placeholder="VD: 500g, 1000ml"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 text-xs text-ink"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">
                  <Calendar size={13} className="inline mr-1 text-forest" /> Hạn sử dụng
                </label>
                <input
                  type="text"
                  value={product.expiryDate || ""}
                  onChange={(e) => upd({ expiryDate: e.target.value })}
                  placeholder="VD: 12 tháng kể từ ngày SX"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 text-xs text-ink"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">
                  <ThermometerSnowflake size={13} className="inline mr-1 text-forest" /> Hướng dẫn bảo quản
                </label>
                <input
                  type="text"
                  value={product.storageGuide || ""}
                  onChange={(e) => upd({ storageGuide: e.target.value })}
                  placeholder="VD: Nơi khô ráo hoặc ngăn đông"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 text-xs text-ink"
                />
              </div>
            </div>
          </section>

          {/* 6. VẬN CHUYỂN & LIÊN HỆ */}
          <section
            id="shipping"
            ref={sRef("shipping")}
            className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-forest" />
                <h2 className="font-extrabold text-ink text-sm">6. Thông tin Vận chuyển & Hotline Tư vấn</h2>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-bold text-ink block mb-1">
                  <Phone size={13} className="inline mr-1 text-forest" /> Số điện thoại đặt hàng
                </label>
                <input
                  type="text"
                  value={product.phone || ""}
                  onChange={(e) => upd({ phone: e.target.value })}
                  placeholder="0905 000 118"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 text-xs text-ink"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1">
                  <LinkIcon size={13} className="inline mr-1 text-forest" /> Link Zalo OA / Chat
                </label>
                <input
                  type="text"
                  value={product.zaloUrl || ""}
                  onChange={(e) => upd({ zaloUrl: e.target.value })}
                  placeholder="https://zalo.me/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 text-xs text-ink"
                />
              </div>
            </div>
          </section>

          {/* 7. CẤU HÌNH SEO */}
          <section
            id="seo"
            ref={sRef("seo")}
            className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-forest" />
                <h2 className="font-extrabold text-ink text-sm">7. Cấu hình SEO Google</h2>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">Tiêu đề SEO</label>
              <input
                type="text"
                value={product.seoTitle || ""}
                onChange={(e) => upd({ seoTitle: e.target.value })}
                placeholder={product.name ? `${product.name} | Đặc sản A Lưới` : "Tiêu đề chuẩn SEO"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 text-xs text-ink"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-ink block mb-1">Mô tả SEO (Meta Description)</label>
              <textarea
                rows={2}
                value={product.seoDescription || ""}
                onChange={(e) => upd({ seoDescription: e.target.value })}
                placeholder="Mô tả xuất hiện trên kết quả tìm kiếm Google..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 text-xs text-ink"
              />
            </div>
          </section>
        </div>
      </div>

      {/* ── Sticky Bottom Action Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-black/10 py-3.5 px-6 shadow-2xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="text-xs text-ink/60 hidden sm:block">
            <span>Đang chỉnh sửa: </span>
            <strong className="text-ink font-bold">{product.name || "Đặc sản mới"}</strong>
          </div>

          <div className="flex items-center gap-2.5 ml-auto">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="px-4 py-2 text-xs font-bold text-ink/60 hover:bg-beige/60 rounded-xl transition"
            >
              Hủy bỏ
            </button>

            <button
              type="button"
              onClick={() => handleSave(false)}
              disabled={saving}
              className="px-4 py-2 text-xs font-bold rounded-xl border border-black/15 text-ink/80 hover:bg-beige/40 transition disabled:opacity-50"
            >
              Lưu nháp (Ẩn)
            </button>

            {product.slug && (
              <a
                href={`${CUSTOMER_URL}/products/${product.slug}?preview=true`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl border border-forest/30 bg-forest/5 text-forest hover:bg-forest/10 transition"
              >
                <Eye size={13} /> Xem trước
              </a>
            )}

            <button
              type="button"
              onClick={() => handleSave(true)}
              disabled={saving || !product.name.trim() || !product.slug.trim()}
              className="flex items-center gap-2 px-6 py-2 text-xs font-bold rounded-xl bg-forest text-white hover:bg-forest/90 transition shadow-md shadow-forest/20 disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Globe size={14} />}
              {isNew ? "Xuất bản ngay" : "Lưu & Cập nhật"}
            </button>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      {mediaPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="font-extrabold text-ink text-sm">
                {mediaPickerTarget === "cover" ? "Chọn ảnh đại diện" : "Chọn ảnh bổ sung vào thư viện"}
              </h3>
              <button
                type="button"
                onClick={() => setMediaPickerOpen(false)}
                className="p-1 rounded-xl text-ink/40 hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 grid grid-cols-3 sm:grid-cols-4 gap-2.5 p-1">
              {loadingMedia ? (
                <div className="col-span-full py-12 text-center text-xs text-ink/40">
                  <Loader2 size={24} className="animate-spin mx-auto text-forest mb-2" />
                  Đang tải thư viện ảnh...
                </div>
              ) : uploadedImages.length === 0 ? (
                <div className="col-span-full py-12 text-center text-xs text-ink/40">
                  Chưa có ảnh tải lên trong kho media.
                </div>
              ) : (
                uploadedImages.map((img) => (
                  <button
                    key={img.url}
                    type="button"
                    onClick={() => {
                      if (mediaPickerTarget === "cover") {
                        upd({ image: img.url, coverImage: img.url });
                      } else {
                        const nextG = [...(product.gallery || []), img.url];
                        upd({ gallery: nextG });
                      }
                      setMediaPickerOpen(false);
                    }}
                    className="relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-forest transition group"
                  >
                    <AppImage src={img.url} alt={img.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-forest/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="bg-forest text-white text-[10px] font-bold px-2 py-1 rounded-md">
                        Chọn ảnh này
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* AI Writer Assistant Modal */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-2.5">
                <div className="size-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-amber-500 text-white grid place-items-center shadow-md">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-black text-ink text-base">Trợ lý AI Soạn Thảo Thông Minh</h3>
                  <p className="text-[11px] text-ink/50">Tự động viết mô tả, gạch đầu dòng thông số, bảo quản & SEO</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                disabled={aiGenerating}
                className="p-1.5 rounded-xl text-ink/40 hover:text-ink hover:bg-black/5 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-ink block mb-1">
                  Sản phẩm đang soạn:
                </label>
                <div className="px-3.5 py-2.5 rounded-xl bg-forest/5 border border-forest/20 font-bold text-forest text-sm flex items-center justify-between">
                  <span>{product.name || "(Chưa nhập tên sản phẩm)"}</span>
                  <span className="text-[11px] font-semibold text-ink/50">{product.category}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1.5">
                  Chọn phong cách bài viết (Tone giọng):
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    {
                      id: "shopee",
                      title: "🚀 Bán hàng Shopee",
                      desc: "Kích thích mua, cam kết chất lượng, hashtag OCOP"
                    },
                    {
                      id: "culture",
                      title: "🌿 Văn hóa Bản địa",
                      desc: "Kể chuyện đồng bào Pa Cô - Tà Ôi, tự nhiên núi rừng"
                    },
                    {
                      id: "concise",
                      title: "⚡ Ngắn gọn & Súc tích",
                      desc: "Tập trung công dụng, thông số, bảo quản nhanh"
                    }
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setAiTone(t.id as AiWritingTone)}
                      className={`p-3 rounded-2xl border text-left transition ${
                        aiTone === t.id
                          ? "border-forest bg-forest/5 ring-2 ring-forest/20 shadow-sm"
                          : "border-black/10 hover:border-black/20 bg-white"
                      }`}
                    >
                      <p className="font-bold text-ink text-xs">{t.title}</p>
                      <p className="text-[10px] text-ink/50 mt-1 leading-snug">{t.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">
                  Từ khóa gợi ý thêm cho AI (Tùy chọn):
                </label>
                <input
                  type="text"
                  value={aiKeywords}
                  onChange={(e) => setAiKeywords(e.target.value)}
                  placeholder="VD: Không chất bảo quản, lên men tự nhiên, thủ công 100%, freeship..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-medium text-xs text-ink"
                />
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 leading-relaxed">
                💡 <strong>AI sẽ tự động điền:</strong> Mô tả chi tiết, Danh sách thông số kỹ thuật, Khối lượng tiêu chuẩn, Hướng dẫn bảo quản, và Tiêu đề/Mô tả chuẩn SEO Google.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-black/5">
              <button
                type="button"
                onClick={() => setAiModalOpen(false)}
                disabled={aiGenerating}
                className="px-4 py-2 rounded-xl text-xs font-bold text-ink/60 hover:bg-black/5 transition"
              >
                Đóng
              </button>

              <button
                type="button"
                onClick={handleGenerateAi}
                disabled={aiGenerating || !product.name.trim()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest text-white font-bold text-xs hover:bg-forest/90 transition shadow-md shadow-forest/20 disabled:opacity-50"
              >
                {aiGenerating ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>AI đang phân tích & viết bài...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} />
                    <span>Tạo nội dung với AI ngay</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductEditPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F4F6F5] flex items-center justify-center">
          <Loader2 size={36} className="animate-spin text-forest" />
        </div>
      }
    >
      <ProductEditContent />
    </Suspense>
  );
}
