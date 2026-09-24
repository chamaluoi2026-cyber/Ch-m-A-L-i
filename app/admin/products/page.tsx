"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  ExternalLink,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Eye,
  Loader2,
  RefreshCw,
  ShoppingBag,
  Award,
  Video,
  X,
  Upload,
  Image as ImageIcon,
  DollarSign,
  Tag,
  Phone,
  Building2,
  Flame,
  Check,
  Globe,
  Sparkles
} from "lucide-react";
import { AppImage } from "@/components/ui/app-image";
import type { ProductRecord, ProductStatus } from "@/data/products";
import { productCategories } from "@/data/products";
import {
  fetchProductsAction,
  saveProductAction,
  deleteProductAction,
  toggleProductStatusAction,
  quickUpdatePriceAction
} from "@/app/actions/products";
import { generateProductAiAction } from "@/app/actions/ai-writer";
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

function emptyProduct(): ProductRecord {
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
    businessName: "HTX Bản địa A Lưới",
    phone: "0905 000 118",
    zaloUrl: "https://zalo.me/0905000118",
    isOcop: true,
    ocopStars: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState<"all" | ProductStatus>("all");

  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [specsInput, setSpecsInput] = useState("");
  const [galleryInput, setGalleryInput] = useState("");
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [deleteConfirmSlug, setDeleteConfirmSlug] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Quick price edit modal
  const [quickPriceModal, setQuickPriceModal] = useState<{
    slug: string;
    name: string;
    price: number;
    originalPrice?: number;
    unit: string;
  } | null>(null);
  const [quickPriceSaving, setQuickPriceSaving] = useState(false);

  // Media picker modal
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImageItem[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);

  function showToast(type: "success" | "error", msg: string) {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  }

  async function handleQuickAiWrite() {
    if (!editingProduct?.name?.trim()) {
      showToast("error", "Vui lòng nhập tên đặc sản trước khi gọi AI.");
      return;
    }
    setAiGenerating(true);
    try {
      const res = await generateProductAiAction({
        name: editingProduct.name,
        category: editingProduct.category,
        origin: editingProduct.businessName || "Huyện A Lưới, Thừa Thiên Huế",
        tone: "shopee"
      });
      if (res.success && res.data) {
        setEditingProduct({
          ...editingProduct,
          description: res.data.description,
          weight: res.data.weight || editingProduct.weight,
          expiryDate: res.data.expiryDate || editingProduct.expiryDate,
          storageGuide: res.data.storageGuide || editingProduct.storageGuide
        });
        if (res.data.specs && res.data.specs.length > 0) {
          setSpecsInput(res.data.specs.join("\n"));
        }
        showToast("success", "✨ AI đã viết xong mô tả & thông số!");
      } else {
        showToast("error", res.error || "Không thể sinh nội dung AI.");
      }
    } catch {
      showToast("error", "Lỗi xảy ra khi gọi AI.");
    } finally {
      setAiGenerating(false);
    }
  }

  async function handleSaveQuickPrice(e: React.FormEvent) {
    e.preventDefault();
    if (!quickPriceModal) return;
    setQuickPriceSaving(true);
    try {
      const res = await quickUpdatePriceAction(
        quickPriceModal.slug,
        Number(quickPriceModal.price),
        quickPriceModal.originalPrice ? Number(quickPriceModal.originalPrice) : undefined,
        quickPriceModal.unit
      );
      if (res.success) {
        setProducts((prev) =>
          prev.map((p) =>
            p.slug === quickPriceModal.slug
              ? {
                  ...p,
                  price: Number(quickPriceModal.price),
                  originalPrice: quickPriceModal.originalPrice
                    ? Number(quickPriceModal.originalPrice)
                    : undefined,
                  unit: quickPriceModal.unit
                }
              : p
          )
        );
        showToast("success", `Đã cập nhật giá mới cho: ${quickPriceModal.name}!`);
        setQuickPriceModal(null);
      } else {
        showToast("error", res.error || "Không thể cập nhật giá.");
      }
    } catch {
      showToast("error", "Lỗi xảy ra khi cập nhật giá.");
    } finally {
      setQuickPriceSaving(false);
    }
  }

  async function loadData() {
    setLoading(true);
    try {
      const data = await fetchProductsAction();
      setProducts(data);
    } catch {
      showToast("error", "Không thể tải danh sách sản phẩm.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleOpenCreate() {
    const fresh = emptyProduct();
    setEditingProduct(fresh);
    setIsNew(true);
    setSpecsInput("");
    setGalleryInput(fresh.gallery.join("\n"));
    setIsModalOpen(true);
  }

  function handleOpenEdit(product: ProductRecord) {
    setEditingProduct({ ...product });
    setIsNew(false);
    setSpecsInput((product.specs || []).join("\n"));
    setGalleryInput((product.gallery || []).join("\n"));
    setIsModalOpen(true);
  }

  async function handleToggleStatus(slug: string, newStatus: ProductStatus) {
    startTransition(async () => {
      // Optimistic update
      setProducts((prev) =>
        prev.map((p) => (p.slug === slug ? { ...p, status: newStatus } : p))
      );
      const res = await toggleProductStatusAction(slug, newStatus);
      if (res.success) {
        const text =
          newStatus === "active"
            ? "Đang mở bán công khai"
            : newStatus === "out_of_stock"
            ? "Tạm hết hàng"
            : "Đã ẩn khỏi website";
        showToast("success", `Cập nhật trạng thái: ${text}!`);
      } else {
        showToast("error", res.error || "Lỗi cập nhật trạng thái.");
        loadData(); // rollback
      }
    });
  }

  async function handleDelete(slug: string) {
    setSaving(true);
    try {
      const res = await deleteProductAction(slug);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.slug !== slug));
        showToast("success", "Đã xóa đặc sản thành công!");
        setDeleteConfirmSlug(null);
      } else {
        showToast("error", res.error || "Không thể xóa đặc sản.");
      }
    } catch {
      showToast("error", "Lỗi xảy ra khi xóa.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editingProduct.name.trim()) {
      showToast("error", "Vui lòng nhập tên đặc sản.");
      return;
    }
    if (!editingProduct.slug.trim()) {
      showToast("error", "Vui lòng nhập đường dẫn (slug).");
      return;
    }

    setSaving(true);
    try {
      const specs = specsInput
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      const gallery = galleryInput
        .split("\n")
        .map((g) => g.trim())
        .filter(Boolean);

      const toSave: ProductRecord = {
        ...editingProduct,
        specs,
        gallery: gallery.length > 0 ? gallery : [editingProduct.image],
        coverImage: editingProduct.image,
        price: Number(editingProduct.price) || 0,
        originalPrice: editingProduct.originalPrice ? Number(editingProduct.originalPrice) : undefined
      };

      const res = await saveProductAction(toSave);
      if (res.success && res.product) {
        showToast("success", isNew ? "Đã thêm đặc sản mới!" : "Đã cập nhật đặc sản thành công!");
        setIsModalOpen(false);
        loadData();
      } else {
        showToast("error", res.error || "Không thể lưu đặc sản.");
      }
    } catch {
      showToast("error", "Lỗi hệ thống khi lưu đặc sản.");
    } finally {
      setSaving(false);
    }
  }

  async function openMediaPicker() {
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

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const matchQuery =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.slug.toLowerCase().includes(q) ||
      (p.businessName || "").toLowerCase().includes(q);
    const matchCategory = filterCategory === "all" || p.category === filterCategory;
    const matchStatus = filterStatus === "all" || p.status === filterStatus;
    return matchQuery && matchCategory && matchStatus;
  });

  const countActive = products.filter((p) => p.status === "active").length;
  const countOutOfStock = products.filter((p) => p.status === "out_of_stock").length;
  const countHidden = products.filter((p) => p.status === "hidden").length;

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-white text-sm font-semibold transition ${
            toast.type === "success" ? "bg-forest shadow-forest/20" : "bg-rose-600 shadow-rose-600/20"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-2xl bg-forest/10 text-forest grid place-items-center">
              <ShoppingBag className="size-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-ink">Quản lý Đặc sản & OCOP A Lưới</h1>
              <p className="text-xs text-ink/60">
                Thêm mới, định giá, quản lý tồn kho và đồng bộ tức thì với website khách hàng
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-black/10 bg-white hover:bg-beige/50 text-ink/70 transition shadow-sm"
            title="Đồng bộ lại dữ liệu đám mây"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Đồng bộ Cloud
          </button>

          <a
            href={`${CUSTOMER_URL}/products`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-forest/30 bg-forest/5 text-forest hover:bg-forest/10 transition"
          >
            <ExternalLink size={13} />
            Xem web khách
          </a>

          <Link
            href="/admin/products/new/edit"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-forest text-white hover:bg-forest/90 transition shadow-md shadow-forest/20"
          >
            <Plus size={15} />
            Thêm đặc sản mới (Tab mới)
          </Link>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm">
          <span className="text-[11px] font-bold text-ink/50 uppercase tracking-wider">Tổng đặc sản</span>
          <p className="text-2xl font-black text-ink mt-1">{products.length}</p>
          <span className="text-[11px] text-forest font-semibold">Được nạp vào AI & Cổng khách</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            Đang mở bán
          </span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{countActive}</p>
          <span className="text-[11px] text-emerald-600 font-semibold">Khách có thể xem và đặt</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <span className="size-2 rounded-full bg-amber-500" />
            Tạm hết hàng
          </span>
          <p className="text-2xl font-black text-amber-700 mt-1">{countOutOfStock}</p>
          <span className="text-[11px] text-amber-600 font-semibold">Vẫn hiển thị, gắn nhãn hết hàng</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-sm">
          <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider flex items-center gap-1">
            <span className="size-2 rounded-full bg-stone-400" />
            Đang ẩn
          </span>
          <p className="text-2xl font-black text-stone-600 mt-1">{countHidden}</p>
          <span className="text-[11px] text-stone-400 font-semibold">Không hiển thị ra web khách</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 border border-black/5 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên đặc sản, slug, hoặc đơn vị sản xuất..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/20 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/20 font-semibold text-ink"
          >
            <option value="all">Tất cả danh mục</option>
            {productCategories.map((c) => (
              <option key={c.id} value={c.label}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-2 text-xs rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/20 font-semibold text-ink"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">🟢 Đang bán</option>
            <option value="out_of_stock">🟡 Tạm hết hàng</option>
            <option value="hidden">⚫ Đang ẩn</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-black/5 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-ink/50 space-y-2">
            <Loader2 size={32} className="animate-spin text-forest mx-auto" />
            <p className="text-xs font-semibold">Đang tải danh sách đặc sản từ Cloud...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-16 text-center text-ink/50 space-y-3">
            <Package size={40} className="mx-auto text-ink/20" />
            <p className="text-sm font-bold text-ink">Không tìm thấy đặc sản nào</p>
            <p className="text-xs max-w-sm mx-auto">
              Thử tìm kiếm với từ khóa khác hoặc nhấn &quot;Thêm đặc sản mới&quot; để tạo sản phẩm.
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-forest text-white hover:bg-forest/90 transition shadow-sm"
            >
              <Plus size={14} /> Thêm đặc sản ngay
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-black/5 bg-[#F9FAF9] text-ink/60 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Đặc sản</th>
                  <th className="py-3 px-4">Danh mục & OCOP</th>
                  <th className="py-3 px-4">Giá bán</th>
                  <th className="py-3 px-4">Đơn vị cung cấp</th>
                  <th className="py-3 px-4">Trạng thái bán</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 font-medium">
                {filteredProducts.map((p) => {
                  return (
                    <tr key={p.slug} className="hover:bg-beige/20 transition group">
                      {/* Cột Tên & Ảnh */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 rounded-xl overflow-hidden bg-forest/10 border border-black/5 shrink-0">
                            {p.image ? (
                              <AppImage src={p.image} alt={p.name} fill className="object-cover" />
                            ) : (
                              <Package size={18} className="text-forest m-auto mt-3" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-ink text-sm truncate">{p.name}</p>
                            <p className="text-[11px] text-ink/40 font-mono">/products/{p.slug}</p>
                            {p.videoUrl && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-rose-600 font-bold">
                                <Video size={11} /> Có video giới thiệu
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Cột Danh mục */}
                      <td className="py-3 px-4">
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-beige/60 text-ink text-xs font-semibold">
                          {p.category}
                        </span>
                        {p.isOcop && (
                          <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-amber-700">
                            <Award size={12} className="text-amber-500 fill-amber-500" />
                            OCOP {p.ocopStars || 3} sao
                          </div>
                        )}
                      </td>

                      {/* Cột Giá & Nút Sửa Giá Nhanh */}
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="font-extrabold text-forest text-sm">
                              {Number(p.price).toLocaleString("vi-VN")} đ
                            </p>
                            <p className="text-[11px] text-ink/40 font-normal">
                              / {p.unit || "sản phẩm"}
                              {p.originalPrice && p.originalPrice > p.price && (
                                <span className="ml-1 line-through text-red-400">
                                  {Number(p.originalPrice).toLocaleString("vi-VN")}đ
                                </span>
                              )}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setQuickPriceModal({
                                slug: p.slug,
                                name: p.name,
                                price: p.price,
                                originalPrice: p.originalPrice,
                                unit: p.unit || "sản phẩm"
                              })
                            }
                            className="px-2 py-1 rounded-lg border border-forest/30 bg-forest/5 text-forest hover:bg-forest hover:text-white transition text-[11px] font-bold shrink-0 flex items-center gap-1 shadow-xs"
                            title="Sửa giá bán & giá niêm yết ngay"
                          >
                            <DollarSign size={12} />
                            Sửa giá
                          </button>
                        </div>
                      </td>

                      {/* Cột Đơn vị */}
                      <td className="py-3 px-4">
                        <p className="font-semibold text-ink line-clamp-1">{p.businessName || "Chạm A Lưới"}</p>
                        {p.phone && <p className="text-[11px] text-ink/50">{p.phone}</p>}
                      </td>

                      {/* Cột Trạng thái (Quick Toggle) */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(p.slug, "active")}
                            title="Bật: Đang mở bán công khai"
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                              p.status === "active"
                                ? "bg-emerald-600 text-white shadow-sm"
                                : "bg-black/5 text-ink/40 hover:bg-emerald-50 hover:text-emerald-700"
                            }`}
                          >
                            <span className={`size-1.5 rounded-full ${p.status === "active" ? "bg-white" : "bg-emerald-500"}`} />
                            Đang bán
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(p.slug, "out_of_stock")}
                            title="Tạm hết hàng (khách vẫn xem được thông tin, không bị 404)"
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                              p.status === "out_of_stock"
                                ? "bg-amber-600 text-white shadow-sm"
                                : "bg-black/5 text-ink/40 hover:bg-amber-50 hover:text-amber-700"
                            }`}
                          >
                            <span className={`size-1.5 rounded-full ${p.status === "out_of_stock" ? "bg-white" : "bg-amber-500"}`} />
                            Tạm hết
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleStatus(p.slug, "hidden")}
                            title="Ẩn khỏi website (không gây lỗi 404)"
                            className={`px-2 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                              p.status === "hidden"
                                ? "bg-stone-600 text-white shadow-sm"
                                : "bg-black/5 text-ink/40 hover:bg-stone-100 hover:text-stone-700"
                            }`}
                          >
                            Ẩn
                          </button>
                        </div>
                      </td>

                      {/* Cột Thao tác */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`${CUSTOMER_URL}/products/${p.slug}?preview=true`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl text-ink/50 hover:text-forest hover:bg-forest/5 transition"
                            title="Xem trước trên web khách"
                          >
                            <Eye size={15} />
                          </a>

                          <Link
                            href={`/admin/products/${p.slug}/edit`}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-forest/10 text-forest hover:bg-forest hover:text-white transition font-bold text-xs"
                            title="Mở tab mới chỉnh sửa chi tiết (Shopee style)"
                          >
                            <Edit3 size={13} />
                            <span>Sửa chi tiết</span>
                          </Link>

                          <button
                            type="button"
                            onClick={() => setDeleteConfirmSlug(p.slug)}
                            className="p-2 rounded-xl text-ink/50 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Xóa đặc sản"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmSlug && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-black/5 space-y-4">
            <div className="size-12 rounded-2xl bg-rose-100 text-rose-600 grid place-items-center">
              <AlertCircle size={24} />
            </div>
            <div>
              <h3 className="font-extrabold text-ink text-base">Xác nhận xóa đặc sản?</h3>
              <p className="text-xs text-ink/60 mt-1 leading-relaxed">
                Đặc sản <strong className="text-ink font-mono">{deleteConfirmSlug}</strong> sẽ được đánh dấu đã xóa
                và tự động ẩn khỏi cả Admin và Web khách.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmSlug(null)}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-xs font-bold text-ink/60 hover:bg-beige/60 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleteConfirmSlug)}
                disabled={saving}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition shadow-md shadow-rose-600/20 disabled:opacity-50"
              >
                {saving ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full my-8 shadow-2xl border border-black/5 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-black/5 flex items-center justify-between bg-[#F9FAF9]">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-forest/10 text-forest grid place-items-center">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h2 className="font-extrabold text-ink text-base">
                    {isNew ? "Thêm Đặc Sản Mới" : `Chỉnh sửa: ${editingProduct.name}`}
                  </h2>
                  <p className="text-xs text-ink/50">
                    Dữ liệu sẽ được lưu trực tiếp lên Cloud Supabase và đồng bộ tức thì
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-ink/40 hover:text-ink hover:bg-black/5 transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveProduct} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
              {/* Tên và Slug */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider block mb-1">
                    Tên đặc sản <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setEditingProduct({
                        ...editingProduct,
                        name,
                        slug: isNew ? generateSlug(name) : editingProduct.slug
                      });
                    }}
                    placeholder="VD: Mật ong rừng A Lưới"
                    className="w-full px-3 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-bold text-ink"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider block mb-1">
                    Đường dẫn (Slug) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.slug}
                    onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })}
                    placeholder="mat-ong-rung-a-luoi"
                    className="w-full px-3 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-mono text-ink"
                  />
                </div>
              </div>

              {/* Danh mục và Trạng thái */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider block mb-1">
                    Danh mục đặc sản
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-semibold text-ink"
                  >
                    {productCategories.map((c) => (
                      <option key={c.id} value={c.label}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider block mb-1">
                    Trạng thái hiển thị
                  </label>
                  <select
                    value={editingProduct.status}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, status: e.target.value as ProductStatus })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-bold text-ink"
                  >
                    <option value="active">🟢 Đang mở bán công khai</option>
                    <option value="out_of_stock">🟡 Tạm hết hàng (vẫn hiện)</option>
                    <option value="hidden">⚫ Ẩn khỏi website (không gây 404)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider block mb-1">
                    Đơn vị tính
                  </label>
                  <input
                    type="text"
                    value={editingProduct.unit || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    placeholder="VD: chai 500ml, hũ, kg, tấm..."
                    className="w-full px-3 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-medium text-ink"
                  />
                </div>
              </div>

              {/* Giá bán & Giá gốc */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider block mb-1">
                    Giá bán chính thức (VNĐ) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    placeholder="VD: 220000"
                    className="w-full px-3 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-extrabold text-forest text-sm"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider block mb-1">
                    Giá gốc niêm yết (nếu có khuyến mãi)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={editingProduct.originalPrice || ""}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        originalPrice: e.target.value ? Number(e.target.value) : undefined
                      })
                    }
                    placeholder="VD: 250000"
                    className="w-full px-3 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-medium text-ink/70"
                  />
                </div>
              </div>

              {/* Chứng nhận OCOP */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 flex items-center justify-between gap-4">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-amber-900 text-xs">
                  <input
                    type="checkbox"
                    checked={editingProduct.isOcop || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isOcop: e.target.checked })}
                    className="size-4 rounded text-amber-600 focus:ring-amber-500 border-amber-300"
                  />
                  <span>Sản phẩm đạt chứng nhận OCOP địa phương</span>
                </label>

                {editingProduct.isOcop && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-amber-800">Xếp hạng:</span>
                    <select
                      value={editingProduct.ocopStars || 3}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, ocopStars: Number(e.target.value) })
                      }
                      className="px-2.5 py-1 rounded-lg border border-amber-300 bg-white font-bold text-amber-800 text-xs"
                    >
                      <option value={3}>⭐⭐⭐ 3 sao</option>
                      <option value={4}>⭐⭐⭐⭐ 4 sao</option>
                      <option value={5}>⭐⭐⭐⭐⭐ 5 sao</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Ảnh đại diện & Thư viện ảnh */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider">
                    Ảnh đại diện sản phẩm <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={openMediaPicker}
                    className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
                  >
                    <ImageIcon size={13} /> Chọn từ kho ảnh Media
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative size-16 rounded-2xl overflow-hidden bg-forest/5 border border-black/10 shrink-0">
                    {editingProduct.image ? (
                      <AppImage src={editingProduct.image} alt="Preview" fill className="object-cover" />
                    ) : (
                      <ImageIcon size={20} className="text-ink/30 m-auto mt-4" />
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={editingProduct.image}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        image: e.target.value,
                        coverImage: e.target.value
                      })
                    }
                    placeholder="/images/products/forest-honey.png hoặc https://..."
                    className="flex-1 px-3 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-mono text-ink text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider block mb-1">
                    Thư viện ảnh phụ (Mỗi URL 1 dòng)
                  </label>
                  <textarea
                    rows={2}
                    value={galleryInput}
                    onChange={(e) => setGalleryInput(e.target.value)}
                    placeholder="Dán các link ảnh phụ tại đây, mỗi link 1 dòng..."
                    className="w-full px-3 py-2 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Video giới thiệu sản phẩm */}
              <div>
                <label className="text-[11px] font-bold text-ink uppercase tracking-wider flex items-center gap-1.5 mb-1">
                  <Video size={13} className="text-rose-600" />
                  Video giới thiệu sản phẩm (YouTube, Shorts, TikTok, MP4)
                </label>
                <input
                  type="text"
                  value={editingProduct.videoUrl || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... hoặc https://youtu.be/..."
                  className="w-full px-3 py-2 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-mono text-xs"
                />
                {editingProduct.videoUrl && parseYouTubeId(editingProduct.videoUrl) && (
                  <div className="mt-2 aspect-video rounded-xl overflow-hidden bg-black max-w-sm">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${parseYouTubeId(editingProduct.videoUrl)}`}
                      title="Preview video"
                      className="size-full border-0"
                      allowFullScreen
                    />
                  </div>
                )}
              </div>

              {/* Mô tả ngắn */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider">
                    Mô tả sản phẩm
                  </label>
                  <button
                    type="button"
                    onClick={handleQuickAiWrite}
                    disabled={aiGenerating || !editingProduct.name.trim()}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-amber-600 text-white font-bold text-[10px] shadow-sm hover:opacity-90 disabled:opacity-50 transition"
                  >
                    {aiGenerating ? (
                      <>
                        <Loader2 size={11} className="animate-spin" />
                        <span>AI đang viết...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles size={11} />
                        <span>✨ AI Viết nhanh</span>
                      </>
                    )}
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  placeholder="Mô tả nguồn gốc, hương vị, công dụng, cách sử dụng của đặc sản..."
                  className="w-full px-3 py-2 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 text-xs leading-relaxed"
                />
              </div>

              {/* Thông số kỹ thuật / Đặc điểm */}
              <div>
                <label className="text-[11px] font-bold text-ink uppercase tracking-wider block mb-1">
                  Đặc điểm nổi bật (Mỗi dòng 1 đặc điểm)
                </label>
                <textarea
                  rows={3}
                  value={specsInput}
                  onChange={(e) => setSpecsInput(e.target.value)}
                  placeholder="VD:&#10;Chai thủy tinh 500ml&#10;Mật ong khoái rừng già 100%&#10;Không đường nhân tạo"
                  className="w-full px-3 py-2 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 text-xs"
                />
              </div>

              {/* Thông tin đơn vị cung cấp */}
              <div className="grid gap-4 sm:grid-cols-3 pt-2 border-t border-black/5">
                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider block mb-1">
                    Cơ sở / HTX sản xuất
                  </label>
                  <input
                    type="text"
                    value={editingProduct.businessName || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, businessName: e.target.value })}
                    placeholder="HTX Dệt Zèng A Roàng"
                    className="w-full px-3 py-2 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider block mb-1">
                    Số điện thoại liên hệ
                  </label>
                  <input
                    type="text"
                    value={editingProduct.phone || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, phone: e.target.value })}
                    placeholder="0905 000 118"
                    className="w-full px-3 py-2 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider block mb-1">
                    Link Zalo
                  </label>
                  <input
                    type="text"
                    value={editingProduct.zaloUrl || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, zaloUrl: e.target.value })}
                    placeholder="https://zalo.me/..."
                    className="w-full px-3 py-2 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 text-xs"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-ink/60 hover:bg-beige/60 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-forest text-white hover:bg-forest/90 transition shadow-md shadow-forest/20 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Đang lưu lên Cloud...
                    </>
                  ) : (
                    <>
                      <Check size={14} /> Lưu & Đồng bộ ngay
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Media Picker Modal */}
      {mediaPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <h3 className="font-extrabold text-ink text-sm">Chọn ảnh từ Thư viện Media</h3>
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
                      if (editingProduct) {
                        setEditingProduct({
                          ...editingProduct,
                          image: img.url,
                          coverImage: img.url
                        });
                      }
                      setMediaPickerOpen(false);
                    }}
                    className="relative aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-forest transition group"
                  >
                    <AppImage src={img.url} alt={img.name} fill className="object-cover" />
                    <div className="absolute inset-0 bg-forest/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <span className="bg-forest text-white text-[10px] font-bold px-2 py-1 rounded-md">
                        Chọn ảnh
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Price Edit Modal */}
      {quickPriceModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-black/5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-xl bg-forest/10 text-forest grid place-items-center">
                  <DollarSign size={16} />
                </div>
                <div>
                  <h3 className="font-extrabold text-ink text-sm">Chỉnh sửa giá nhanh</h3>
                  <p className="text-[11px] text-ink/50 truncate max-w-[240px] font-medium">
                    {quickPriceModal.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickPriceModal(null)}
                className="p-1 rounded-xl text-ink/40 hover:text-ink"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveQuickPrice} className="space-y-4 text-xs">
              <div>
                <label className="text-[11px] font-bold text-ink uppercase tracking-wider block mb-1">
                  Giá bán chính thức (VNĐ) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    required
                    value={quickPriceModal.price}
                    onChange={(e) =>
                      setQuickPriceModal({ ...quickPriceModal, price: Number(e.target.value) })
                    }
                    className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-black text-forest text-base"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink/40">₫</span>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-ink uppercase tracking-wider block mb-1">
                  Giá gốc niêm yết (Gạch ngang so sánh)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={quickPriceModal.originalPrice || ""}
                    onChange={(e) =>
                      setQuickPriceModal({
                        ...quickPriceModal,
                        originalPrice: e.target.value ? Number(e.target.value) : undefined
                      })
                    }
                    placeholder="Không bắt buộc"
                    className="w-full pl-3.5 pr-8 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-bold text-ink/60 text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-ink/40">₫</span>
                </div>
              </div>

              {quickPriceModal.originalPrice && quickPriceModal.originalPrice > quickPriceModal.price && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 font-bold text-xs flex items-center justify-between">
                  <span>Mức giảm giá tự động:</span>
                  <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[11px] font-black">
                    -
                    {Math.round(
                      ((quickPriceModal.originalPrice - quickPriceModal.price) /
                        quickPriceModal.originalPrice) *
                        100
                    )}
                    %
                  </span>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-ink uppercase tracking-wider block mb-1">
                  Đơn vị tính / Quy cách
                </label>
                <input
                  type="text"
                  value={quickPriceModal.unit}
                  onChange={(e) =>
                    setQuickPriceModal({ ...quickPriceModal, unit: e.target.value })
                  }
                  placeholder="chai 500ml, hũ, kg, tấm..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-medium text-ink text-xs"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-black/5">
                <Link
                  href={`/admin/products/${quickPriceModal.slug}/edit`}
                  target="_blank"
                  className="text-xs font-bold text-forest hover:underline flex items-center gap-1"
                >
                  <ExternalLink size={12} /> Sửa chi tiết hơn (Tab mới)
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickPriceModal(null)}
                    disabled={quickPriceSaving}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold text-ink/60 hover:bg-beige/60 transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={quickPriceSaving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-forest text-white hover:bg-forest/90 transition shadow-md shadow-forest/20 disabled:opacity-50"
                  >
                    {quickPriceSaving ? (
                      <>
                        <Loader2 size={13} className="animate-spin" /> Đang lưu...
                      </>
                    ) : (
                      <>
                        <Check size={13} /> Lưu giá ngay
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
