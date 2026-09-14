"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import Link from "next/link";
import { uploadImageClient } from "@/lib/upload-client";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Save,
  Eye,
  Upload,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  MoveUp,
  MoveDown,
  Layers,
  Search,
  Smartphone,
  Monitor,
  X,
  Loader2,
  MapPin,
  Clock,
  Phone,
  Globe,
  Gift,
  AlertTriangle,
  HelpCircle,
  Percent,
  RefreshCw,
  Building2,
  Tag,
  DollarSign
} from "lucide-react";
import { AppImage } from "@/components/ui/app-image";
import { placeCategories, type PlaceCategory } from "@/data/places";
import {
  getPlacesAction,
  savePlaceAction,
  deletePlaceAction,
  uploadPlaceMediaAction,
  getSystemAssetsAction,
  getUploadedImagesAction,
  type PlaceRecord,
  type SystemAssetRecord,
  type UploadedImageItem
} from "@/app/actions/upload";

// Slug generator
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 70);
}

// Tiện ích gợi ý sẵn
const COMMON_AMENITIES = [
  "Wifi miễn phí",
  "Bãi đỗ xe ô tô & xe máy",
  "Vệ sinh sạch sẽ",
  "Nhà tắm nước ngọt",
  "Chòi nghỉ ven suối",
  "Phục vụ ẩm thực bản địa",
  "Áo phao bảo hộ",
  "Hướng dẫn viên địa phương",
  "Cho thuê trang phục truyền thống",
  "Không gian lửa trại đêm",
  "Điểm check-in chụp ảnh đẹp",
  "Khu vực cắm trại dã ngoại"
];

// Mẫu địa điểm rỗng mặc định
function createEmptyPlace(): PlaceRecord {
  return {
    id: "place-" + Date.now(),
    slug: "",
    name: "",
    category: "waterfall-stream",
    summary: "",
    description: "",
    status: "active",
    image: "/images/places/thac-a-nor-1.jpg",
    coverImage: "/images/places/thac-a-nor-1.jpg",
    imageAlt: "",
    gallery: [
      "/images/places/thac-a-nor-1.jpg",
      "/images/places/thac-a-nor-2.jpg",
      "/images/places/thac-a-nor-3.jpg"
    ],
    priceLabel: "Dịch vụ từ 200.000đ/người",
    priceMin: 200000,
    priceMax: 350000,
    priceUnit: "người",
    voucherOffer: "Giảm 10% khi đặt trước qua Chạm A Lưới",
    voucherTerms: "Áp dụng cho đoàn từ 2 người, liên hệ trước ít nhất 12 giờ",
    openingHours: "07:30 - 17:30 hằng ngày",
    duration: "2 - 4 tiếng",
    maxGuests: "50 - 100 khách",
    businessName: "Hợp tác xã Du lịch Cộng đồng A Lưới",
    businessId: "biz-" + Date.now(),
    phone: "0912 345 678",
    zaloUrl: "https://zalo.me/0912345678",
    email: "contact@chamaluoi.vn",
    website: "https://chamaluoi.vn",
    businessAddress: "Huyện A Lưới, Thừa Thiên Huế",
    address: "Xã Hồng Kim, huyện A Lưới, Thừa Thiên Huế",
    lat: 16.2345,
    lng: 107.2567,
    mapEmbedUrl: "https://www.google.com/maps?q=A+Luoi+Thua+Thien+Hue&output=embed",
    directions: "Từ thị trấn A Lưới đi theo đường Quốc lộ 14 hoặc theo bảng chỉ dẫn du lịch.",
    commissionRate: 10,
    commissionType: "booking",
    auditStatus: "active",
    highlights: [
      "Không gian thiên nhiên trong lành, mát mẻ quanh năm",
      "Được phục vụ bởi chính bà con đồng bào bản địa hiền hậu",
      "Hồ tắm nước suối tự nhiên trong vắt"
    ],
    activities: [
      "Tắm suối sinh thái và thư giãn bên chòi nghỉ",
      "Thưởng thức gà đồi nướng mọi, cơm lam và rau dớn xào tỏi",
      "Chụp ảnh check-in thiên nhiên kỳ vĩ"
    ],
    services: [
      "Wifi miễn phí",
      "Bãi đỗ xe ô tô & xe máy",
      "Vệ sinh sạch sẽ",
      "Phục vụ ẩm thực bản địa"
    ],
    safetyNotes: [
      "Nên mang dép chống trượt khi di chuyển qua các mỏm đá suối",
      "Trẻ em tắm suối bắt buộc phải mặc áo phao và có người lớn đi kèm",
      "Giữ gìn vệ sinh chung, không vứt rác xuống lòng suối"
    ],
    suitableFor: [
      "Gia đình có trẻ nhỏ",
      "Nhóm bạn trẻ yêu thiên nhiên",
      "Đoàn khách du lịch trải nghiệm"
    ],
    faq: [
      {
        question: "Đến địa điểm này cần chuẩn bị những trang phục gì?",
        answer: "Nên mang trang phục gọn nhẹ, đồ bơi/thay dự phòng nếu tắm suối, thuốc chống côn trùng và giày/dép có độ bám tốt."
      },
      {
        question: "Có cần đặt trước để nhận ưu đãi không?",
        answer: "Bạn nên bấm 'Nhận voucher' trên website hoặc liên hệ trước để cơ sở chuẩn bị tiếp đón và giữ giá ưu đãi tốt nhất."
      }
    ],
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    ogImage: "",
    rating: 4.9,
    reviewCount: 150,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function AdminPlacesPageContent() {
  const searchParams = useSearchParams();
  const editSlug = searchParams?.get("edit");

  // Danh sách địa điểm
  const [places, setPlaces] = useState<PlaceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // View state: 'list' | 'editor'
  const [viewMode, setViewMode] = useState<"list" | "editor">("list");
  const [activeTab, setActiveTab] = useState<
    "basic" | "media" | "pricing" | "business" | "location" | "commission" | "content" | "seo"
  >("basic");

  // State địa điểm đang chỉnh sửa
  const [currentPlace, setCurrentPlace] = useState<PlaceRecord>(createEmptyPlace());
  const [isSlugManual, setIsSlugManual] = useState(false);

  // Filter & Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Preview modal state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  // Media Picker state
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"thumbnail" | "cover" | "gallery" | "og">("thumbnail");
  const [systemAssets, setSystemAssets] = useState<SystemAssetRecord[]>([]);
  const [uploadedImages, setUploadedImages] = useState<UploadedImageItem[]>([]);
  const [mediaPickerTab, setMediaPickerTab] = useState<"library" | "upload" | "url">("library");
  const [pickerUrlInput, setPickerUrlInput] = useState("");

  // Toast notification
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const showToast = (type: "success" | "error" | "info", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast((prev) => (prev?.text === text ? null : prev)), 4000);
  };

  // Temp inputs for dynamic arrays
  const [newHighlight, setNewHighlight] = useState("");
  const [newActivity, setNewActivity] = useState("");
  const [newSafetyNote, setNewSafetyNote] = useState("");
  const [newFaqQ, setNewFaqQ] = useState("");
  const [newFaqA, setNewFaqA] = useState("");

  // Tải danh sách địa điểm
  const loadPlaces = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getPlacesAction();
      setPlaces(data);
    } catch {
      showToast("error", "Không thể tải danh sách địa điểm.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Tải kho ảnh
  const loadMediaAssets = useCallback(async () => {
    try {
      const [assets, uploads] = await Promise.all([
        getSystemAssetsAction(),
        getUploadedImagesAction()
      ]);
      setSystemAssets(assets);
      setUploadedImages(uploads);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadPlaces();
    loadMediaAssets();
  }, [loadPlaces, loadMediaAssets]);

  // Xử lý query param ?edit=slug
  useEffect(() => {
    if (editSlug && places.length > 0) {
      const target = places.find((p) => p.slug === editSlug || p.id === editSlug);
      if (target) {
        setCurrentPlace(target);
        setIsSlugManual(true);
        setViewMode("editor");
      }
    }
  }, [editSlug, places]);

  // Lọc địa điểm
  const filteredPlaces = useMemo(() => {
    return places.filter((item) => {
      const matchSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCategory = filterCategory === "all" || item.category === filterCategory;
      const matchStatus = filterStatus === "all" || item.status === filterStatus;

      return matchSearch && matchCategory && matchStatus;
    });
  }, [places, searchQuery, filterCategory, filterStatus]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = places.length;
    const active = places.filter((p) => p.status === "active").length;
    const paused = places.filter((p) => p.status === "temporarily_closed").length;
    const hidden = places.filter((p) => p.status === "hidden").length;
    const avgCommission =
      total > 0 ? (places.reduce((acc, p) => acc + (p.commissionRate || 0), 0) / total).toFixed(1) : "0";
    return { total, active, paused, hidden, avgCommission };
  }, [places]);

  // Xử lý tạo mới
  const handleCreateNew = () => {
    const newPlace = createEmptyPlace();
    setCurrentPlace(newPlace);
    setIsSlugManual(false);
    setActiveTab("basic");
    setViewMode("editor");
  };

  // Xử lý chỉnh sửa
  const handleEdit = (place: PlaceRecord) => {
    setCurrentPlace({ ...place });
    setIsSlugManual(true);
    setActiveTab("basic");
    setViewMode("editor");
  };

  // Xử lý lưu địa điểm
  const handleSavePlace = async () => {
    if (!currentPlace.name.trim()) {
      showToast("error", "Vui lòng nhập tên địa điểm!");
      setActiveTab("basic");
      return;
    }

    const finalSlug = currentPlace.slug.trim() || generateSlug(currentPlace.name);
    if (!finalSlug) {
      showToast("error", "Vui lòng nhập slug hợp lệ!");
      setActiveTab("basic");
      return;
    }

    const placeToSave: PlaceRecord = {
      ...currentPlace,
      slug: finalSlug,
      seoTitle: currentPlace.seoTitle?.trim() || `${currentPlace.name} | Du lịch cộng đồng A Lưới`,
      seoDescription: currentPlace.seoDescription?.trim() || currentPlace.summary,
      ogImage: currentPlace.ogImage || currentPlace.coverImage || currentPlace.image,
      updatedAt: new Date().toISOString()
    };

    setIsSaving(true);
    try {
      const res = await savePlaceAction(placeToSave);
      if (res.success && res.place) {
        showToast("success", `Đã lưu thành công địa điểm "${res.place.name}"!`);
        setCurrentPlace(res.place);
        await loadPlaces();
      } else {
        showToast("error", res.error || "Không thể lưu địa điểm.");
      }
    } catch (e) {
      showToast("error", e instanceof Error ? e.message : "Đã xảy ra lỗi khi lưu.");
    } finally {
      setIsSaving(false);
    }
  };

  // Xử lý xóa địa điểm
  const handleDeletePlace = async (place: PlaceRecord) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa địa điểm "${place.name}" khỏi hệ thống?\nThao tác này không thể hoàn tác.`)) {
      return;
    }

    try {
      const res = await deletePlaceAction(place.id || place.slug);
      if (res.success) {
        showToast("success", `Đã xóa địa điểm "${place.name}".`);
        if (viewMode === "editor" && currentPlace.slug === place.slug) {
          setViewMode("list");
        }
        await loadPlaces();
      } else {
        showToast("error", res.error || "Không thể xóa địa điểm.");
      }
    } catch {
      showToast("error", "Lỗi khi xóa địa điểm.");
    }
  };

  // Xử lý đổi trạng thái nhanh từ danh sách
  const handleQuickStatusChange = async (place: PlaceRecord, newStatus: "active" | "temporarily_closed" | "hidden") => {
    const updated = { ...place, status: newStatus };
    try {
      const res = await savePlaceAction(updated);
      if (res.success) {
        showToast("success", `Đã cập nhật trạng thái của "${place.name}"`);
        await loadPlaces();
      }
    } catch {
      showToast("error", "Không thể đổi trạng thái.");
    }
  };

  // Upload file từ máy tính
  const handleDirectUpload = async (file: File) => {
    try {
      const res = await uploadImageClient(file, { category: "places" });
      if (res.success && res.url) {
        applyImageToTarget(res.url);
        showToast("success", "Đã tải ảnh lên thành công!");
        loadMediaAssets();
      } else {
        showToast("error", res.error || "Tải ảnh thất bại.");
      }
    } catch {
      showToast("error", "Lỗi khi tải ảnh.");
    }
  };

  // Áp dụng ảnh vào target đang chọn
  const applyImageToTarget = (url: string) => {
    if (pickerTarget === "thumbnail") {
      setCurrentPlace((prev) => ({ ...prev, image: url }));
    } else if (pickerTarget === "cover") {
      setCurrentPlace((prev) => ({ ...prev, coverImage: url }));
    } else if (pickerTarget === "og") {
      setCurrentPlace((prev) => ({ ...prev, ogImage: url }));
    } else if (pickerTarget === "gallery") {
      setCurrentPlace((prev) => ({
        ...prev,
        gallery: [...prev.gallery, url]
      }));
    }
    setIsMediaPickerOpen(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold text-white transition-all transform animate-in slide-in-from-top ${
            toast.type === "success"
              ? "bg-emerald-600"
              : toast.type === "error"
              ? "bg-rose-600"
              : "bg-forest"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="size-4" />
          ) : (
            <AlertCircle className="size-4" />
          )}
          <span>{toast.text}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-75"
            title="Đóng"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* VIEW 1: DANH SÁCH ĐỊA ĐIỂM (LIST VIEW) */}
      {viewMode === "list" && (
        <div className="space-y-6">
          {/* Header & Quick Stats */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-ink">Quản lý Địa điểm Du lịch</h1>
              <p className="text-xs text-ink/60 mt-1">
                Tạo, biên tập nội dung, xem trước và mở trang thực tế của từng điểm đến tại A Lưới
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadPlaces}
                className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white border border-black/10 text-xs font-bold text-ink/75 hover:bg-beige transition shadow-sm"
                title="Làm mới dữ liệu"
              >
                <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin text-forest" : ""}`} />
                <span>Làm mới</span>
              </button>

              <Link
                href="/admin/media"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-black/10 text-xs font-bold text-ink/80 hover:bg-beige transition shadow-sm"
              >
                <ImageIcon className="size-3.5 text-forest" />
                <span>Kho ảnh Media</span>
              </Link>

              <Link
                href="/admin/places/new/edit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-forest text-white text-xs font-bold hover:bg-forest/90 transition shadow-md"
              >
                <Plus className="size-4" />
                <span>Thêm địa điểm mới</span>
              </Link>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-4 rounded-3xl border border-black/5 shadow-card">
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink/50">Tổng số điểm đến</p>
              <p className="text-2xl font-black text-ink mt-1">{stats.total}</p>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-black/5 shadow-card">
              <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">Đang mở cửa</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">{stats.active}</p>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-black/5 shadow-card">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600">Tạm ngưng</p>
              <p className="text-2xl font-black text-amber-600 mt-1">{stats.paused}</p>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-black/5 shadow-card">
              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500">Bản nháp / Ẩn</p>
              <p className="text-2xl font-black text-stone-600 mt-1">{stats.hidden}</p>
            </div>
            <div className="bg-white p-4 rounded-3xl border border-black/5 shadow-card">
              <p className="text-[11px] font-bold uppercase tracking-wider text-clay">Hoa hồng trung bình</p>
              <p className="text-2xl font-black text-clay mt-1">{stats.avgCommission}%</p>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-black/5 shadow-card">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên địa điểm, cơ sở chủ quản, đường dẫn slug..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-beige/50 border border-black/5 text-xs text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl bg-beige/50 border border-black/5 text-xs font-bold text-ink/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest/20"
              >
                <option value="all">Tất cả danh mục</option>
                {placeCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3.5 py-2.5 rounded-2xl bg-beige/50 border border-black/5 text-xs font-bold text-ink/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest/20"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đang mở cửa</option>
                <option value="temporarily_closed">Tạm ngưng</option>
                <option value="hidden">Ẩn / Bản nháp</option>
              </select>
            </div>
          </div>

          {/* Place Table */}
          <div className="overflow-hidden rounded-3xl bg-white shadow-card border border-black/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-forest/5 text-ink/70 font-bold uppercase tracking-wider border-b border-black/5">
                  <tr>
                    <th className="p-4">Địa điểm</th>
                    <th className="p-4">Danh mục</th>
                    <th className="p-4">Cơ sở chủ quản</th>
                    <th className="p-4">Mức giá & Ưu đãi</th>
                    <th className="p-4 text-center">Hoa hồng</th>
                    <th className="p-4 text-center">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5 font-medium">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-ink/50">
                        <Loader2 className="size-6 animate-spin mx-auto mb-2 text-forest" />
                        Đang nạp dữ liệu địa điểm...
                      </td>
                    </tr>
                  ) : filteredPlaces.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-ink/50">
                        Không tìm thấy địa điểm nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredPlaces.map((place) => {
                      const category = placeCategories.find((c) => c.id === place.category);
                      return (
                        <tr key={place.slug} className="hover:bg-beige/40 transition">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative size-14 rounded-2xl overflow-hidden bg-forest/10 shrink-0 border border-black/5">
                                <AppImage
                                  src={place.image || place.coverImage || "/images/places/thac-a-nor-1.jpg"}
                                  alt={place.name}
                                  fill
                                  sizes="56px"
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0">
                                <span className="font-extrabold text-ink text-sm block truncate">
                                  {place.name}
                                </span>
                                <span className="text-[11px] text-ink/50 font-mono block truncate">
                                  /{place.slug}
                                </span>
                                <span className="text-[11px] text-ink/65 flex items-center gap-1 mt-0.5 truncate">
                                  <MapPin className="size-3 text-forest shrink-0" />
                                  <span className="truncate">{place.address}</span>
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="inline-block rounded-xl bg-forest/10 px-2.5 py-1 text-[11px] font-bold text-forest">
                              {category?.label || place.category}
                            </span>
                          </td>

                          <td className="p-4">
                            <p className="font-bold text-ink">{place.businessName}</p>
                            <p className="text-[11px] text-ink/60 mt-0.5">{place.phone}</p>
                          </td>

                          <td className="p-4">
                            <p className="font-bold text-forest">{place.priceLabel}</p>
                            <p className="text-[11px] text-clay font-medium mt-0.5 flex items-center gap-1">
                              <Gift className="size-3" />
                              <span className="truncate max-w-[200px]">{place.voucherOffer}</span>
                            </p>
                          </td>

                          <td className="p-4 text-center">
                            <span className="font-extrabold text-forest text-sm">{place.commissionRate}%</span>
                            <span className="block text-[10px] text-ink/45 uppercase tracking-wider">
                              {place.commissionType === "voucher" ? "Voucher" : "Đặt chỗ"}
                            </span>
                          </td>

                          <td className="p-4 text-center">
                            <div className="inline-flex items-center gap-1">
                              {place.status === "active" ? (
                                <button
                                  onClick={() => handleQuickStatusChange(place, "temporarily_closed")}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold hover:bg-emerald-200 transition"
                                  title="Bấm để chuyển sang Tạm ngưng"
                                >
                                  <CheckCircle2 className="size-3 text-emerald-600" />
                                  Đang mở
                                </button>
                              ) : place.status === "temporarily_closed" ? (
                                <button
                                  onClick={() => handleQuickStatusChange(place, "active")}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold hover:bg-amber-200 transition"
                                  title="Bấm để chuyển sang Đang mở cửa"
                                >
                                  <Clock className="size-3 text-amber-600" />
                                  Tạm ngưng
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleQuickStatusChange(place, "active")}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[11px] font-bold hover:bg-stone-200 transition"
                                  title="Bấm để kích hoạt xuất bản"
                                >
                                  Đang ẩn
                                </button>
                              )}
                            </div>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Xem trước Live Preview */}
                              <button
                                onClick={() => {
                                  setCurrentPlace(place);
                                  setIsPreviewOpen(true);
                                }}
                                className="p-2 rounded-xl bg-forest/10 hover:bg-forest hover:text-white text-forest font-bold transition"
                                title="Xem trước bản nháp (Preview Modal)"
                              >
                                <Eye className="size-3.5" />
                              </button>

                              {/* Mở trang public đúng port 3000 KHÔNG 404 */}
                              <a
                                href={`http://localhost:3000/places/${place.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 font-bold transition"
                                title="Mở trang thật trên web khách hàng (Port 3000)"
                              >
                                <ExternalLink className="size-3.5" />
                              </a>

                              {/* Chỉnh sửa — mở CMS editor riêng */}
                              <Link
                                href={`/admin/places/${place.slug}/edit`}
                                className="px-3 py-1.5 rounded-xl bg-forest/10 hover:bg-forest hover:text-white text-forest font-bold text-xs transition flex items-center gap-1"
                              >
                                <Edit2 className="size-3" />
                                Sửa
                              </Link>

                              {/* Xóa */}
                              <button
                                onClick={() => handleDeletePlace(place)}
                                className="p-2 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 font-bold transition"
                                title="Xóa địa điểm"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: TRÌNH BIÊN TẬP CMS ĐỊA ĐIỂM (PLACE CMS EDITOR) */}
      {viewMode === "editor" && (
        <div className="space-y-6 animate-in fade-in">
          {/* Top Bar Trình biên tập */}
          <div className="sticky top-16 z-30 flex flex-wrap items-center justify-between gap-3 bg-white/95 backdrop-blur px-6 py-3.5 rounded-3xl border border-black/10 shadow-card">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode("list")}
                className="p-2 rounded-xl bg-beige hover:bg-black/10 text-ink/75 transition"
                title="Quay lại danh sách"
              >
                <ArrowLeft className="size-4" />
              </button>
              <div>
                <h2 className="text-base font-black text-ink flex items-center gap-2">
                  <span>{currentPlace.name || "Biên tập Địa điểm mới"}</span>
                  <span className="text-xs px-2 py-0.5 rounded-lg bg-beige font-mono text-ink/60">
                    /{currentPlace.slug || "slug-tu-dong"}
                  </span>
                </h2>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Status Picker */}
              <select
                value={currentPlace.status}
                onChange={(e) =>
                  setCurrentPlace((prev) => ({
                    ...prev,
                    status: e.target.value as "active" | "temporarily_closed" | "hidden"
                  }))
                }
                className="px-3 py-1.5 rounded-xl border border-black/10 text-xs font-bold text-ink bg-beige/50 focus:bg-white focus:outline-none"
              >
                <option value="active">🟢 Đang mở cửa</option>
                <option value="temporarily_closed">🟡 Tạm ngưng đón khách</option>
                <option value="hidden">⚪ Bản nháp / Đang ẩn</option>
              </select>

              {/* Nút Xem trước */}
              <button
                onClick={() => setIsPreviewOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white border border-forest/30 text-forest text-xs font-bold hover:bg-forest/5 transition shadow-sm"
              >
                <Eye className="size-3.5" />
                <span>Xem trước</span>
              </button>

              {/* Mở trang public port 3000 */}
              <a
                href={`http://localhost:3000/places/${currentPlace.slug || ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition border border-blue-200"
                title="Mở trên web khách (Port 3000)"
              >
                <ExternalLink className="size-3.5" />
                <span>Mở trang public</span>
              </a>

              {/* Nút Lưu */}
              <button
                onClick={handleSavePlace}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-5 py-1.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90 transition shadow-md disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Save className="size-3.5" />
                )}
                <span>Lưu địa điểm</span>
              </button>
            </div>
          </div>

          {/* 8 Navigation Tabs */}
          <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl border border-black/5 shadow-card overflow-x-auto">
            {[
              { id: "basic", label: "1. Thông tin cơ bản", icon: Tag },
              { id: "media", label: "2. Hình ảnh & Gallery", icon: ImageIcon },
              { id: "pricing", label: "3. Dịch vụ & Giá", icon: DollarSign },
              { id: "business", label: "4. Cơ sở chủ quản", icon: Building2 },
              { id: "location", label: "5. Vị trí & Bản đồ", icon: MapPin },
              { id: "commission", label: "6. Hoa hồng & Đối tác", icon: Percent },
              { id: "content", label: "7. Nội dung & FAQ", icon: Layers },
              { id: "seo", label: "8. Cấu hình SEO", icon: Globe }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    isActive
                      ? "bg-forest text-white shadow-sm"
                      : "text-ink/65 hover:text-ink hover:bg-beige"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: THÔNG TIN CƠ BẢN */}
          {activeTab === "basic" && (
            <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-card space-y-6">
              <h3 className="text-base font-black text-ink flex items-center gap-2">
                <Tag className="size-4 text-forest" />
                1. Thông tin cơ bản của điểm đến
              </h3>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-ink block mb-1.5">
                    Tên địa điểm <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentPlace.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setCurrentPlace((prev) => ({
                        ...prev,
                        name,
                        slug: isSlugManual ? prev.slug : generateSlug(name)
                      }));
                    }}
                    placeholder="Ví dụ: Thác A Nôr, Làng dệt Zèng A Roàng..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest/20 font-bold"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-ink">
                      Đường dẫn tĩnh (Slug URL) <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsSlugManual(!isSlugManual)}
                      className="text-[11px] text-forest hover:underline font-bold"
                    >
                      {isSlugManual ? "Tự động sinh từ tên" : "Tùy chỉnh slug"}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={currentPlace.slug}
                    readOnly={!isSlugManual}
                    onChange={(e) =>
                      setCurrentPlace((prev) => ({ ...prev, slug: generateSlug(e.target.value) }))
                    }
                    placeholder="thac-a-nor"
                    className={`w-full px-4 py-2.5 rounded-2xl border text-xs font-mono ${
                      isSlugManual
                        ? "bg-white border-forest text-forest focus:outline-none"
                        : "bg-black/5 border-black/10 text-ink/60 cursor-not-allowed"
                    }`}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-ink block mb-1.5">
                    Danh mục phân loại <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={currentPlace.category}
                    onChange={(e) =>
                      setCurrentPlace((prev) => ({ ...prev, category: e.target.value as PlaceCategory }))
                    }
                    className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs font-bold text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest/20"
                  >
                    {placeCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.label} ({cat.description.slice(0, 35)}...)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-ink block mb-1.5">
                    Trạng thái hoạt động
                  </label>
                  <select
                    value={currentPlace.status}
                    onChange={(e) =>
                      setCurrentPlace((prev) => ({
                        ...prev,
                        status: e.target.value as "active" | "temporarily_closed" | "hidden"
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs font-bold text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest/20"
                  >
                    <option value="active">Đang mở cửa đón khách</option>
                    <option value="temporarily_closed">Tạm ngưng đón khách (bảo trì / mùa mưa)</option>
                    <option value="hidden">Bản nháp / Đang ẩn (chỉ Admin xem được)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1.5">
                  Mô tả ngắn (Hiển thị thẻ card và đầu trang)
                </label>
                <textarea
                  rows={3}
                  value={currentPlace.summary}
                  onChange={(e) => setCurrentPlace((prev) => ({ ...prev, summary: e.target.value }))}
                  placeholder="Tóm tắt nét đặc sắc của địa điểm trong 1-2 câu..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1.5">
                  Giới thiệu chi tiết điểm đến
                </label>
                <textarea
                  rows={6}
                  value={currentPlace.description}
                  onChange={(e) => setCurrentPlace((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Viết bài giới thiệu đầy đủ về địa điểm, lịch sử, văn hóa, không gian và những nét lôi cuốn..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs text-ink focus:bg-white focus:outline-none focus:ring-2 focus:ring-forest/20 leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 2: HÌNH ẢNH & GALLERY */}
          {activeTab === "media" && (
            <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-card space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-black text-ink flex items-center gap-2">
                  <ImageIcon className="size-4 text-forest" />
                  2. Quản lý Hình ảnh & Thư viện Gallery
                </h3>
              </div>

              {/* 2 Main Images: Thumbnail & Cover */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Thumbnail / Ảnh đại diện */}
                <div className="rounded-3xl border border-black/10 p-5 bg-beige/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink">Ảnh đại diện (Thumbnail)</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPickerTarget("thumbnail");
                        setIsMediaPickerOpen(true);
                      }}
                      className="text-[11px] font-bold text-forest hover:underline"
                    >
                      Chọn từ Kho ảnh
                    </button>
                  </div>

                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-white border border-black/10 shadow-sm">
                    <AppImage
                      src={currentPlace.image || "/images/places/thac-a-nor-1.jpg"}
                      alt={currentPlace.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <input
                    type="text"
                    value={currentPlace.image}
                    onChange={(e) => setCurrentPlace((prev) => ({ ...prev, image: e.target.value }))}
                    placeholder="URL ảnh đại diện..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-black/10 text-xs font-mono text-ink/75"
                  />

                  <input
                    type="text"
                    value={currentPlace.imageAlt || ""}
                    onChange={(e) => setCurrentPlace((prev) => ({ ...prev, imageAlt: e.target.value }))}
                    placeholder="Alt text mô tả ảnh đại diện cho SEO..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-black/10 text-xs text-ink/75"
                  />
                </div>

                {/* Cover Image / Ảnh bìa Hero */}
                <div className="rounded-3xl border border-black/10 p-5 bg-beige/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink">Ảnh bìa chi tiết (Cover Image)</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPickerTarget("cover");
                        setIsMediaPickerOpen(true);
                      }}
                      className="text-[11px] font-bold text-forest hover:underline"
                    >
                      Chọn từ Kho ảnh
                    </button>
                  </div>

                  <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-white border border-black/10 shadow-sm">
                    <AppImage
                      src={currentPlace.coverImage || currentPlace.image || "/images/places/thac-a-nor-1.jpg"}
                      alt={currentPlace.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <input
                    type="text"
                    value={currentPlace.coverImage || ""}
                    onChange={(e) => setCurrentPlace((prev) => ({ ...prev, coverImage: e.target.value }))}
                    placeholder="URL ảnh bìa banner chi tiết..."
                    className="w-full px-3 py-2 rounded-xl bg-white border border-black/10 text-xs font-mono text-ink/75"
                  />
                  <p className="text-[11px] text-ink/50">Ảnh hiển thị tràn viền ở đầu trang chi tiết của địa điểm.</p>
                </div>
              </div>

              {/* Multi-Image Gallery */}
              <div className="rounded-3xl border border-black/10 p-5 bg-beige/20 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black text-ink uppercase tracking-wider">
                      Thư viện ảnh điểm đến (Gallery - {currentPlace.gallery?.length || 0} ảnh)
                    </h4>
                    <p className="text-[11px] text-ink/60">
                      Du khách có thể xem toàn bộ kho ảnh này trên trang chi tiết địa điểm
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setPickerTarget("gallery");
                        setIsMediaPickerOpen(true);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90 transition shadow-sm"
                    >
                      <Plus className="size-3.5" />
                      <span>Thêm ảnh từ Media Library</span>
                    </button>
                  </div>
                </div>

                {/* Gallery Items Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {(currentPlace.gallery || []).map((item, index) => {
                    const imgUrl = typeof item === "string" ? item : item.url;
                    return (
                      <div
                        key={index}
                        className="group relative rounded-2xl overflow-hidden bg-white border border-black/10 shadow-sm flex flex-col"
                      >
                        <div className="relative aspect-[4/3] bg-black/5">
                          <AppImage src={imgUrl} alt={`Ảnh ${index + 1}`} fill className="object-cover" />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px] font-bold backdrop-blur">
                            #{index + 1}
                          </div>
                        </div>

                        {/* Reorder & Delete controls */}
                        <div className="p-2 flex items-center justify-between bg-white border-t border-black/5">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => {
                                const arr = [...currentPlace.gallery];
                                const temp = arr[index];
                                arr[index] = arr[index - 1];
                                arr[index - 1] = temp;
                                setCurrentPlace((prev) => ({ ...prev, gallery: arr }));
                              }}
                              className="p-1 rounded bg-black/5 hover:bg-black/10 text-ink/75 disabled:opacity-30"
                              title="Di chuyển sang trái"
                            >
                              <MoveUp className="size-3 -rotate-90" />
                            </button>

                            <button
                              type="button"
                              disabled={index === currentPlace.gallery.length - 1}
                              onClick={() => {
                                const arr = [...currentPlace.gallery];
                                const temp = arr[index];
                                arr[index] = arr[index + 1];
                                arr[index + 1] = temp;
                                setCurrentPlace((prev) => ({ ...prev, gallery: arr }));
                              }}
                              className="p-1 rounded bg-black/5 hover:bg-black/10 text-ink/75 disabled:opacity-30"
                              title="Di chuyển sang phải"
                            >
                              <MoveDown className="size-3 -rotate-90" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const arr = currentPlace.gallery.filter((_, i) => i !== index);
                              setCurrentPlace((prev) => ({ ...prev, gallery: arr }));
                            }}
                            className="p-1 rounded bg-rose-50 text-rose-600 hover:bg-rose-100"
                            title="Xóa ảnh này khỏi gallery"
                          >
                            <Trash2 className="size-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DỊCH VỤ & GIÁ */}
          {activeTab === "pricing" && (
            <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-card space-y-6">
              <h3 className="text-base font-black text-ink flex items-center gap-2">
                <DollarSign className="size-4 text-forest" />
                3. Bảng giá, Dịch vụ & Ưu đãi Voucher
              </h3>

              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs font-bold text-ink block mb-1.5">
                    Nhãn mức giá hiển thị <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentPlace.priceLabel}
                    onChange={(e) => setCurrentPlace((prev) => ({ ...prev, priceLabel: e.target.value }))}
                    placeholder="Ví dụ: Dịch vụ từ 220.000đ/người"
                    className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs font-bold text-forest focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-ink block mb-1.5">
                    Đơn vị tính
                  </label>
                  <input
                    type="text"
                    value={currentPlace.priceUnit || "người"}
                    onChange={(e) => setCurrentPlace((prev) => ({ ...prev, priceUnit: e.target.value }))}
                    placeholder="người, lượt, combo, vé, phòng/đêm..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs text-ink focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-ink block mb-1.5">
                    Giờ mở cửa
                  </label>
                  <input
                    type="text"
                    value={currentPlace.openingHours}
                    onChange={(e) => setCurrentPlace((prev) => ({ ...prev, openingHours: e.target.value }))}
                    placeholder="07:30 - 17:30 hằng ngày"
                    className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs text-ink focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-ink block mb-1.5">
                    Thời gian trải nghiệm gợi ý
                  </label>
                  <input
                    type="text"
                    value={currentPlace.duration || ""}
                    onChange={(e) => setCurrentPlace((prev) => ({ ...prev, duration: e.target.value }))}
                    placeholder="2 - 4 tiếng, Nửa ngày, 1 ngày..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs text-ink focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-ink block mb-1.5">
                    Sức chứa / Số lượng khách tối đa
                  </label>
                  <input
                    type="text"
                    value={currentPlace.maxGuests || ""}
                    onChange={(e) => setCurrentPlace((prev) => ({ ...prev, maxGuests: e.target.value }))}
                    placeholder="50 - 100 khách / đoàn"
                    className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs text-ink focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Voucher Offers */}
              <div className="p-5 rounded-2xl bg-forest/5 border border-forest/15 space-y-4">
                <div className="flex items-center gap-2 text-forest">
                  <Gift className="size-4" />
                  <h4 className="text-xs font-black uppercase tracking-wider">Chính sách ưu đãi Voucher</h4>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-ink block mb-1">
                      Nội dung ưu đãi voucher
                    </label>
                    <input
                      type="text"
                      value={currentPlace.voucherOffer}
                      onChange={(e) => setCurrentPlace((prev) => ({ ...prev, voucherOffer: e.target.value }))}
                      placeholder="Giảm 10% khi nhận mã qua Chạm A Lưới"
                      className="w-full px-4 py-2.5 rounded-2xl bg-white border border-forest/20 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-forest/20"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-ink block mb-1">
                      Điều kiện áp dụng voucher
                    </label>
                    <input
                      type="text"
                      value={currentPlace.voucherTerms || ""}
                      onChange={(e) => setCurrentPlace((prev) => ({ ...prev, voucherTerms: e.target.value }))}
                      placeholder="Áp dụng đoàn từ 4 khách, liên hệ trước 12h..."
                      className="w-full px-4 py-2.5 rounded-2xl bg-white border border-forest/20 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-forest/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ĐƠN VỊ / CƠ SỞ */}
          {activeTab === "business" && (
            <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-card space-y-6">
              <h3 className="text-base font-black text-ink flex items-center gap-2">
                <Building2 className="size-4 text-forest" />
                4. Thông tin Đơn vị / Cơ sở chủ quản
              </h3>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-ink block mb-1.5">
                    Tên cơ sở / Hợp tác xã / Hộ kinh doanh <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentPlace.businessName}
                    onChange={(e) => setCurrentPlace((prev) => ({ ...prev, businessName: e.target.value }))}
                    placeholder="HTX Du lịch Cộng đồng A Nôr..."
                    className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs font-bold text-ink focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-ink block mb-1.5">
                    Mã đối tác (Business ID)
                  </label>
                  <input
                    type="text"
                    value={currentPlace.businessId || ""}
                    onChange={(e) => setCurrentPlace((prev) => ({ ...prev, businessId: e.target.value }))}
                    placeholder="biz-a-nor"
                    className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs font-mono text-ink/75 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-ink block mb-1.5">
                    Số điện thoại liên hệ <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={currentPlace.phone}
                    onChange={(e) => setCurrentPlace((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="0912 345 678"
                    className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs font-bold text-ink focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-ink block mb-1.5">
                    Đường dẫn Chat Zalo (Zalo URL)
                  </label>
                  <input
                    type="text"
                    value={currentPlace.zaloUrl}
                    onChange={(e) => setCurrentPlace((prev) => ({ ...prev, zaloUrl: e.target.value }))}
                    placeholder="https://zalo.me/0912345678"
                    className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs text-ink focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-ink block mb-1.5">
                    Email liên hệ
                  </label>
                  <input
                    type="email"
                    value={currentPlace.email || ""}
                    onChange={(e) => setCurrentPlace((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="info@a-nor.vn"
                    className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs text-ink focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-ink block mb-1.5">
                    Website / Trang Fanpage Facebook
                  </label>
                  <input
                    type="text"
                    value={currentPlace.website || ""}
                    onChange={(e) => setCurrentPlace((prev) => ({ ...prev, website: e.target.value }))}
                    placeholder="https://facebook.com/thac.a.nor"
                    className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs text-ink focus:bg-white focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: VỊ TRÍ & BẢN ĐỒ */}
          {activeTab === "location" && (
            <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-card space-y-6">
              <h3 className="text-base font-black text-ink flex items-center gap-2">
                <MapPin className="size-4 text-forest" />
                5. Vị trí địa lý & Bản đồ Google Maps
              </h3>

              <div>
                <label className="text-xs font-bold text-ink block mb-1.5">
                  Địa chỉ chi tiết tại A Lưới <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentPlace.address}
                  onChange={(e) => setCurrentPlace((prev) => ({ ...prev, address: e.target.value }))}
                  placeholder="Làng A Nôr, xã Hồng Kim, huyện A Lưới, Thừa Thiên Huế"
                  className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs font-bold text-ink focus:bg-white focus:outline-none"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-ink block mb-1.5">
                    Tọa độ Vĩ độ (Latitude)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={currentPlace.lat ?? 16.234}
                    onChange={(e) =>
                      setCurrentPlace((prev) => ({ ...prev, lat: parseFloat(e.target.value) || 0 }))
                    }
                    placeholder="16.2345"
                    className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs font-mono text-ink focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-ink block mb-1.5">
                    Tọa độ Kinh độ (Longitude)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={currentPlace.lng ?? 107.256}
                    onChange={(e) =>
                      setCurrentPlace((prev) => ({ ...prev, lng: parseFloat(e.target.value) || 0 }))
                    }
                    placeholder="107.2567"
                    className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs font-mono text-ink focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1.5">
                  Link nhúng Google Maps (Embed URL hoặc Link xem bản đồ) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={currentPlace.mapEmbedUrl}
                  onChange={(e) => setCurrentPlace((prev) => ({ ...prev, mapEmbedUrl: e.target.value }))}
                  placeholder="https://www.google.com/maps?q=Thac+A+Nor&output=embed"
                  className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs font-mono text-ink focus:bg-white focus:outline-none"
                />
                <p className="text-[11px] text-ink/50 mt-1">
                  Mẹo: Dùng link Google Maps có đuôi &output=embed để hiển thị trực tiếp khung bản đồ tương tác.
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1.5">
                  Hướng dẫn đường đi ngắn gọn
                </label>
                <textarea
                  rows={2}
                  value={currentPlace.directions || ""}
                  onChange={(e) => setCurrentPlace((prev) => ({ ...prev, directions: e.target.value }))}
                  placeholder="Từ bến xe A Lưới đi về hướng Bắc khoảng 3km theo Quốc lộ 14, rẽ phải theo biển chỉ dẫn vào thôn A Nôr..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs text-ink focus:bg-white focus:outline-none"
                />
              </div>

              {/* Map Preview */}
              {currentPlace.mapEmbedUrl && (
                <div className="rounded-2xl overflow-hidden border border-black/10 shadow-sm h-64 bg-black/5">
                  <iframe
                    title="Bản đồ xem trước"
                    src={currentPlace.mapEmbedUrl}
                    className="w-full h-full border-0"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          )}

          {/* TAB 6: HOA HỒNG & ĐỐI TÁC */}
          {activeTab === "commission" && (
            <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-card space-y-6">
              <div className="flex items-center gap-2 text-clay">
                <Percent className="size-5" />
                <h3 className="text-base font-black text-ink">
                  6. Chính sách Hoa hồng & Quản lý Đối tác
                </h3>
              </div>
              <p className="text-xs text-ink/60">
                Thông tin này CHỈ hiển thị trong Admin và bảng kê đối tác, hoàn toàn bảo mật với khách hàng.
              </p>

              <div className="grid md:grid-cols-3 gap-5">
                <div>
                  <label className="text-xs font-bold text-ink block mb-1.5">
                    Tỷ lệ hoa hồng (%) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={currentPlace.commissionRate}
                      onChange={(e) =>
                        setCurrentPlace((prev) => ({
                          ...prev,
                          commissionRate: parseFloat(e.target.value) || 0
                        }))
                      }
                      className="w-full pl-4 pr-10 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs font-extrabold text-forest focus:bg-white focus:outline-none text-base"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-ink/50">%</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-ink block mb-1.5">
                    Hình thức chiết khấu
                  </label>
                  <select
                    value={currentPlace.commissionType || "booking"}
                    onChange={(e) =>
                      setCurrentPlace((prev) => ({
                        ...prev,
                        commissionType: e.target.value as "booking" | "voucher" | "fixed"
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs font-bold text-ink focus:bg-white focus:outline-none"
                  >
                    <option value="booking">Hoa hồng theo đơn đặt chỗ</option>
                    <option value="voucher">Hoa hồng theo lượt đổi Voucher</option>
                    <option value="fixed">Mức phí kết nối cố định</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-ink block mb-1.5">
                    Trạng thái đối soát
                  </label>
                  <select
                    value={currentPlace.auditStatus || "active"}
                    onChange={(e) =>
                      setCurrentPlace((prev) => ({
                        ...prev,
                        auditStatus: e.target.value as "active" | "pending" | "reconciled"
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs font-bold text-ink focus:bg-white focus:outline-none"
                  >
                    <option value="active">Đang kích hoạt đối soát</option>
                    <option value="pending">Chờ đối soát cuối kỳ</option>
                    <option value="reconciled">Đã đối soát xong</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: NỘI DUNG & FAQ */}
          {activeTab === "content" && (
            <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-card space-y-8">
              <h3 className="text-base font-black text-ink flex items-center gap-2">
                <Layers className="size-4 text-forest" />
                7. Chi tiết trải nghiệm, Tiện ích, Quy định & FAQ
              </h3>

              {/* Highlights */}
              <div className="space-y-3">
                <label className="text-xs font-black text-ink uppercase tracking-wider block">
                  Điểm nổi bật (Highlights)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newHighlight}
                    onChange={(e) => setNewHighlight(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newHighlight.trim()) {
                        e.preventDefault();
                        setCurrentPlace((prev) => ({
                          ...prev,
                          highlights: [...(prev.highlights || []), newHighlight.trim()]
                        }));
                        setNewHighlight("");
                      }
                    }}
                    placeholder="Nhập điểm nổi bật rồi nhấn Thêm..."
                    className="flex-1 px-4 py-2 rounded-2xl bg-beige/50 border border-black/10 text-xs text-ink focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newHighlight.trim()) {
                        setCurrentPlace((prev) => ({
                          ...prev,
                          highlights: [...(prev.highlights || []), newHighlight.trim()]
                        }));
                        setNewHighlight("");
                      }
                    }}
                    className="px-4 py-2 rounded-2xl bg-forest text-white text-xs font-bold hover:bg-forest/90"
                  >
                    Thêm
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-2">
                  {(currentPlace.highlights || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-beige/60 border border-black/5 text-xs text-ink"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="size-2 rounded-full bg-forest shrink-0" />
                        <span className="truncate">{item}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPlace((prev) => ({
                            ...prev,
                            highlights: prev.highlights.filter((_, i) => i !== idx)
                          }))
                        }
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activities */}
              <div className="space-y-3 pt-4 border-t border-black/5">
                <label className="text-xs font-black text-ink uppercase tracking-wider block">
                  Hoạt động trải nghiệm tại điểm (Activities)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && newActivity.trim()) {
                        e.preventDefault();
                        setCurrentPlace((prev) => ({
                          ...prev,
                          activities: [...(prev.activities || []), newActivity.trim()]
                        }));
                        setNewActivity("");
                      }
                    }}
                    placeholder="Ví dụ: Tắm suối sinh thái, nướng cá suối, dệt Zèng..."
                    className="flex-1 px-4 py-2 rounded-2xl bg-beige/50 border border-black/10 text-xs text-ink focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newActivity.trim()) {
                        setCurrentPlace((prev) => ({
                          ...prev,
                          activities: [...(prev.activities || []), newActivity.trim()]
                        }));
                        setNewActivity("");
                      }
                    }}
                    className="px-4 py-2 rounded-2xl bg-forest text-white text-xs font-bold hover:bg-forest/90"
                  >
                    Thêm
                  </button>
                </div>

                <div className="grid sm:grid-cols-2 gap-2">
                  {(currentPlace.activities || []).map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-beige/60 border border-black/5 text-xs text-ink"
                    >
                      <span className="truncate">
                        {idx + 1}. {item}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPlace((prev) => ({
                            ...prev,
                            activities: prev.activities.filter((_, i) => i !== idx)
                          }))
                        }
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Amenities / Services */}
              <div className="space-y-3 pt-4 border-t border-black/5">
                <label className="text-xs font-black text-ink uppercase tracking-wider block">
                  Tiện ích có sẵn (Services / Amenities)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COMMON_AMENITIES.map((amenity) => {
                    const isChecked = (currentPlace.services || []).includes(amenity);
                    return (
                      <label
                        key={amenity}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium cursor-pointer transition ${
                          isChecked
                            ? "bg-forest/10 border-forest text-forest font-bold"
                            : "bg-white border-black/10 text-ink/75 hover:bg-beige"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            if (isChecked) {
                              setCurrentPlace((prev) => ({
                                ...prev,
                                services: prev.services.filter((s) => s !== amenity)
                              }));
                            } else {
                              setCurrentPlace((prev) => ({
                                ...prev,
                                services: [...(prev.services || []), amenity]
                              }));
                            }
                          }}
                          className="rounded text-forest focus:ring-forest"
                        />
                        <span>{amenity}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Safety Notes */}
              <div className="space-y-3 pt-4 border-t border-black/5">
                <label className="text-xs font-black text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle className="size-3.5 text-amber-600" />
                  Quy định / Lưu ý an toàn (Safety Notes)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSafetyNote}
                    onChange={(e) => setNewSafetyNote(e.target.value)}
                    placeholder="Thêm lưu ý quan trọng cho du khách..."
                    className="flex-1 px-4 py-2 rounded-2xl bg-amber-50/50 border border-amber-200 text-xs text-ink focus:bg-white focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSafetyNote.trim()) {
                        setCurrentPlace((prev) => ({
                          ...prev,
                          safetyNotes: [...(prev.safetyNotes || []), newSafetyNote.trim()]
                        }));
                        setNewSafetyNote("");
                      }
                    }}
                    className="px-4 py-2 rounded-2xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700"
                  >
                    Thêm
                  </button>
                </div>

                <div className="space-y-2">
                  {(currentPlace.safetyNotes || []).map((note, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900"
                    >
                      <span className="truncate">⚠️ {note}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPlace((prev) => ({
                            ...prev,
                            safetyNotes: prev.safetyNotes.filter((_, i) => i !== idx)
                          }))
                        }
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* FAQ Questions */}
              <div className="space-y-3 pt-4 border-t border-black/5">
                <label className="text-xs font-black text-ink uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="size-3.5 text-forest" />
                  Câu hỏi thường gặp (FAQ)
                </label>

                <div className="p-4 rounded-2xl bg-beige/40 border border-black/10 space-y-3">
                  <input
                    type="text"
                    value={newFaqQ}
                    onChange={(e) => setNewFaqQ(e.target.value)}
                    placeholder="Câu hỏi: Ví dụ Có cần đặt chỗ trước không?"
                    className="w-full px-4 py-2 rounded-xl bg-white border border-black/10 text-xs text-ink font-bold focus:outline-none"
                  />
                  <textarea
                    rows={2}
                    value={newFaqA}
                    onChange={(e) => setNewFaqA(e.target.value)}
                    placeholder="Câu trả lời giải đáp..."
                    className="w-full px-4 py-2 rounded-xl bg-white border border-black/10 text-xs text-ink focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newFaqQ.trim() && newFaqA.trim()) {
                        setCurrentPlace((prev) => ({
                          ...prev,
                          faq: [...(prev.faq || []), { question: newFaqQ.trim(), answer: newFaqA.trim() }]
                        }));
                        setNewFaqQ("");
                        setNewFaqA("");
                      }
                    }}
                    className="px-4 py-1.5 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90"
                  >
                    + Thêm câu hỏi FAQ
                  </button>
                </div>

                <div className="space-y-2">
                  {(currentPlace.faq || []).map((faq, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-white border border-black/10 shadow-sm flex items-start justify-between gap-3"
                    >
                      <div className="space-y-1 min-w-0">
                        <p className="font-bold text-xs text-ink">Q: {faq.question}</p>
                        <p className="text-xs text-ink/70 leading-relaxed">A: {faq.answer}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPlace((prev) => ({
                            ...prev,
                            faq: prev.faq?.filter((_, i) => i !== idx)
                          }))
                        }
                        className="text-rose-500 hover:text-rose-700 p-1"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: CẤU HÌNH SEO */}
          {activeTab === "seo" && (
            <div className="bg-white p-6 rounded-3xl border border-black/5 shadow-card space-y-6">
              <h3 className="text-base font-black text-ink flex items-center gap-2">
                <Globe className="size-4 text-forest" />
                8. Cấu hình Tối ưu Tìm kiếm (SEO & OpenGraph)
              </h3>

              {/* Google Snippet Simulator */}
              <div className="p-4 rounded-2xl bg-beige/30 border border-black/10 space-y-1">
                <span className="text-[10px] font-bold text-ink/40 uppercase tracking-wider block">
                  Mô phỏng kết quả tìm kiếm Google
                </span>
                <p className="text-[#1a0dab] font-medium text-sm hover:underline cursor-pointer truncate">
                  {currentPlace.seoTitle || `${currentPlace.name} | Du lịch cộng đồng A Lưới`}
                </p>
                <p className="text-[#006621] text-xs font-mono truncate">
                  https://chamaluoi.vn/places/{currentPlace.slug}
                </p>
                <p className="text-xs text-ink/75 line-clamp-2">
                  {currentPlace.seoDescription || currentPlace.summary || "Khám phá điểm đến đặc sắc..."}
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1.5">
                  Tiêu đề SEO (SEO Title)
                </label>
                <input
                  type="text"
                  value={currentPlace.seoTitle || ""}
                  onChange={(e) => setCurrentPlace((prev) => ({ ...prev, seoTitle: e.target.value }))}
                  placeholder={`${currentPlace.name || "Tên địa điểm"} | Du lịch cộng đồng A Lưới`}
                  className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs text-ink focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1.5">
                  Mô tả SEO (Meta Description)
                </label>
                <textarea
                  rows={3}
                  value={currentPlace.seoDescription || ""}
                  onChange={(e) => setCurrentPlace((prev) => ({ ...prev, seoDescription: e.target.value }))}
                  placeholder="Mô tả chuẩn SEO từ 120-160 ký tự..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs text-ink focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-ink block mb-1.5">
                  Từ khóa SEO (Keywords)
                </label>
                <input
                  type="text"
                  value={currentPlace.seoKeywords || ""}
                  onChange={(e) => setCurrentPlace((prev) => ({ ...prev, seoKeywords: e.target.value }))}
                  placeholder="thác a nôr, du lịch a lưới, huế du lịch, du lịch sinh thái"
                  className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs text-ink focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-ink">
                    Ảnh chia sẻ mạng xã hội (OG Image)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setPickerTarget("og");
                      setIsMediaPickerOpen(true);
                    }}
                    className="text-[11px] font-bold text-forest hover:underline"
                  >
                    Chọn từ Kho ảnh
                  </button>
                </div>
                <input
                  type="text"
                  value={currentPlace.ogImage || ""}
                  onChange={(e) => setCurrentPlace((prev) => ({ ...prev, ogImage: e.target.value }))}
                  placeholder="Để trống sẽ tự dùng Ảnh bìa hoặc Ảnh đại diện..."
                  className="w-full px-4 py-2.5 rounded-2xl bg-beige/50 border border-black/10 text-xs font-mono text-ink focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* LIVE PREVIEW MODAL (DESKTOP & MOBILE) */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative flex flex-col w-full max-w-5xl h-[92vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            {/* Header Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-beige/60">
              <div className="flex items-center gap-3">
                <span className="size-3 rounded-full bg-emerald-500 animate-pulse" />
                <h3 className="text-sm font-black text-ink">Xem Trước Địa Điểm (Live Preview)</h3>
                <span className="text-xs text-ink/50">Mô phỏng 1:1 trang web khách: port 3000/places/{currentPlace.slug}</span>
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

                {/* Direct Link to port 3000 customer preview */}
                <a
                  href={`http://localhost:3000/places/${currentPlace.slug}?preview=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest text-white text-xs font-bold shadow-sm hover:bg-forest/90 transition"
                >
                  <ExternalLink className="size-3.5" />
                  <span>Mở trên Web khách (Tab mới)</span>
                </a>

                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="p-2 rounded-xl bg-black/5 hover:bg-black/10 text-ink/75 transition"
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            {/* Body Modal: Live preview representation */}
            <div className="flex-1 overflow-y-auto bg-stone-100 p-4 md:p-8 flex justify-center">
              <div
                className={`bg-white shadow-xl rounded-3xl overflow-hidden transition-all duration-300 ${
                  previewDevice === "mobile"
                    ? "w-[390px] border-[10px] border-black rounded-[40px] shadow-2xl h-fit min-h-[750px]"
                    : "w-full max-w-4xl"
                }`}
              >
                {/* Draft Badge Bar */}
                <div className="bg-amber-500 text-ink px-4 py-2 text-xs font-bold flex items-center justify-between">
                  <span>Chế độ Xem Trước Bản Nháp (Draft Preview)</span>
                  <span className="rounded bg-black/15 px-2 py-0.5 text-[10px]">
                    {currentPlace.status === "active"
                      ? "Đang mở cửa"
                      : currentPlace.status === "temporarily_closed"
                      ? "Tạm ngưng"
                      : "Bản nháp / Đang ẩn"}
                  </span>
                </div>

                {/* Hero section */}
                <div className="relative aspect-[16/10] bg-forest/10 overflow-hidden">
                  <AppImage
                    src={currentPlace.coverImage || currentPlace.image || "/images/places/thac-a-nor-1.jpg"}
                    alt={currentPlace.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/95 via-ink/40 to-transparent p-6 text-white">
                    <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur mb-2">
                      {placeCategories.find((c) => c.id === currentPlace.category)?.label || currentPlace.category}
                    </span>
                    <h1 className="text-2xl md:text-3xl font-black">{currentPlace.name || "Tên địa điểm"}</h1>
                    <p className="text-xs text-white/80 mt-1 line-clamp-2">{currentPlace.summary}</p>
                  </div>
                </div>

                {/* Content preview */}
                <div className="p-6 space-y-6">
                  {/* Price & Voucher bar */}
                  <div className="p-4 rounded-2xl bg-forest/5 border border-forest/15 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-ink/60 uppercase font-bold tracking-wider">Mức giá tham khảo:</p>
                      <p className="text-lg font-black text-forest">{currentPlace.priceLabel}</p>
                    </div>
                    <div className="bg-white px-3.5 py-2 rounded-xl border border-forest/20 text-xs font-bold text-clay flex items-center gap-1.5 shadow-sm">
                      <Gift className="size-4" />
                      <span>{currentPlace.voucherOffer}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-forest mb-2">Giới thiệu chi tiết</h3>
                    <p className="text-xs leading-relaxed text-ink/80 whitespace-pre-line">
                      {currentPlace.description || "Chưa có mô tả chi tiết..."}
                    </p>
                  </div>

                  {/* Highlights */}
                  {currentPlace.highlights && currentPlace.highlights.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-forest mb-2">Điểm nổi bật:</h3>
                      <div className="grid sm:grid-cols-2 gap-2">
                        {currentPlace.highlights.map((h, i) => (
                          <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-beige text-xs text-ink font-medium">
                            <span className="size-2 rounded-full bg-forest shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gallery */}
                  {currentPlace.gallery && currentPlace.gallery.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-forest mb-2">Thư viện ảnh ({currentPlace.gallery.length}):</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {currentPlace.gallery.map((img, i) => {
                          const url = typeof img === "string" ? img : img.url;
                          return (
                            <div key={i} className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/5">
                              <AppImage src={url} alt={`Ảnh ${i + 1}`} fill className="object-cover" />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Location & Contact */}
                  <div className="p-4 rounded-2xl bg-beige/40 border border-black/5 space-y-2 text-xs">
                    <p className="font-bold text-ink flex items-center gap-1.5">
                      <MapPin className="size-4 text-forest" />
                      <span>{currentPlace.address}</span>
                    </p>
                    <p className="text-ink/75 flex items-center gap-1.5">
                      <Phone className="size-4 text-forest" />
                      <span>{currentPlace.phone} - {currentPlace.businessName}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEDIA PICKER MODAL */}
      {isMediaPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative flex flex-col w-full max-w-3xl h-[85vh] bg-white rounded-3xl shadow-2xl overflow-hidden border border-white/20">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/10 bg-beige/60">
              <div className="flex items-center gap-2">
                <ImageIcon className="size-5 text-forest" />
                <h3 className="text-sm font-black text-ink">
                  Chọn ảnh từ Media Library ({pickerTarget === "thumbnail" ? "Ảnh đại diện" : pickerTarget === "cover" ? "Ảnh bìa" : pickerTarget === "og" ? "Ảnh SEO" : "Thư viện Gallery"})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMediaPickerOpen(false)}
                className="p-1.5 rounded-xl bg-black/5 hover:bg-black/10 text-ink/75"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-black/10 bg-beige/20">
              <button
                type="button"
                onClick={() => setMediaPickerTab("library")}
                className={`px-4 py-2 border-b-2 text-xs font-bold transition ${
                  mediaPickerTab === "library"
                    ? "border-forest text-forest"
                    : "border-transparent text-ink/60 hover:text-ink"
                }`}
              >
                Kho ảnh có sẵn ({systemAssets.length + uploadedImages.length})
              </button>
              <button
                type="button"
                onClick={() => setMediaPickerTab("upload")}
                className={`px-4 py-2 border-b-2 text-xs font-bold transition ${
                  mediaPickerTab === "upload"
                    ? "border-forest text-forest"
                    : "border-transparent text-ink/60 hover:text-ink"
                }`}
              >
                Tải ảnh mới từ máy tính
              </button>
              <button
                type="button"
                onClick={() => setMediaPickerTab("url")}
                className={`px-4 py-2 border-b-2 text-xs font-bold transition ${
                  mediaPickerTab === "url"
                    ? "border-forest text-forest"
                    : "border-transparent text-ink/60 hover:text-ink"
                }`}
              >
                Dán đường dẫn URL
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Tab: Library */}
              {mediaPickerTab === "library" && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {[...uploadedImages.map((u) => ({ name: u.name, url: u.url })), ...systemAssets].map((asset, idx) => (
                    <div
                      key={idx}
                      onClick={() => applyImageToTarget(asset.url)}
                      className="group relative aspect-square rounded-2xl overflow-hidden bg-black/5 border border-black/10 cursor-pointer hover:ring-2 hover:ring-forest transition"
                    >
                      <AppImage src={asset.url} alt={asset.name} fill className="object-cover group-hover:scale-105 transition" />
                      <div className="absolute inset-x-0 bottom-0 bg-black/60 p-1.5 text-white text-[10px] truncate opacity-0 group-hover:opacity-100 transition">
                        {asset.name}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tab: Direct Upload */}
              {mediaPickerTab === "upload" && (
                <div className="flex flex-col items-center justify-center h-full p-8 border-2 border-dashed border-forest/30 rounded-3xl bg-forest/5">
                  <Upload className="size-12 text-forest mb-3 animate-bounce" />
                  <p className="text-sm font-bold text-ink">Kéo thả file ảnh vào đây hoặc bấm chọn file</p>
                  <p className="text-xs text-ink/50 mt-1">Hỗ trợ JPG, PNG, WEBP lên đến 50MB</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDirectUpload(file);
                    }}
                    className="mt-4 text-xs"
                  />
                </div>
              )}

              {/* Tab: URL Input */}
              {mediaPickerTab === "url" && (
                <div className="space-y-4 max-w-lg mx-auto py-8">
                  <label className="text-xs font-bold text-ink block">Nhập đường dẫn URL ảnh (Unsplash, Google Drive, CDN...):</label>
                  <input
                    type="text"
                    value={pickerUrlInput}
                    onChange={(e) => setPickerUrlInput(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-2.5 rounded-2xl border border-black/10 text-xs text-ink"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (pickerUrlInput.trim()) {
                        applyImageToTarget(pickerUrlInput.trim());
                        setPickerUrlInput("");
                      }
                    }}
                    className="px-5 py-2 rounded-xl bg-forest text-white text-xs font-bold hover:bg-forest/90"
                  >
                    Sử dụng ảnh này
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPlacesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-sm font-bold text-ink/60">Đang tải module Quản lý Địa điểm...</div>}>
      <AdminPlacesPageContent />
    </Suspense>
  );
}
