"use client";

import React, { useState, useEffect, useTransition, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle2,
  ExternalLink,
  MapPin,
  Star,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Sparkles,
  Save,
  Loader2,
  Filter,
  Eye,
  Upload,
  BedDouble
} from "lucide-react";
import { placeCategories, type Place, type PlaceCategory } from "@/data/places";
import { fetchAllPlacesAction, savePlaceAction, deletePlaceAction } from "@/app/actions/places";
import { uploadImageAction } from "@/app/actions/upload";

export default function AdminPlacesPage() {
  const [placesList, setPlacesList] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<Place>>({
    name: "",
    slug: "",
    category: "waterfall-stream",
    businessName: "Hợp tác xã Du lịch Cộng đồng A Lưới",
    summary: "",
    description: "",
    address: "Huyện A Lưới, Thừa Thiên Huế",
    mapEmbedUrl: "",
    priceLabel: "Miễn phí vé vào cổng",
    voucherOffer: "Giảm 10% khi đặt trước",
    commissionRate: 10,
    rating: 4.8,
    reviewCount: 12,
    openingHours: "07:00 - 17:30 hàng ngày",
    phone: "0905 000 118",
    zaloUrl: "https://zalo.me/0905000118",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    highlights: ["Cảnh quan hoang sơ", "Nước suối trong lành"],
    activities: ["Tắm suối ngắm cảnh", "Chụp ảnh check-in"],
    suitableFor: ["Gia đình", "Bạn bè", "Cặp đôi"],
    safetyNotes: ["Đi giày chống trơn trượt", "Chú ý khi trời mưa"],
    status: "active"
  });

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const form = new FormData();
    form.append("file", file);

    const res = await uploadImageAction(form);
    setIsUploading(false);

    if (res.success && res.url) {
      setFormData((prev) => ({ ...prev, image: res.url }));
      setStatusMessage({ type: "success", text: "Đã tải ảnh lên thành công!" });
    } else {
      setStatusMessage({ type: "error", text: res.error || "Không thể tải ảnh lên" });
    }
  };

  const loadPlaces = async () => {
    setLoading(true);
    const data = await fetchAllPlacesAction();
    setPlacesList(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPlaces();
  }, []);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  const handleOpenCreate = () => {
    setEditingPlace(null);
    setFormData({
      name: "",
      slug: "",
      category: "waterfall-stream",
      businessName: "Hợp tác xã Du lịch Cộng đồng A Lưới",
      summary: "",
      description: "",
      address: "Huyện A Lưới, Thừa Thiên Huế",
      mapEmbedUrl: "",
      priceLabel: "Miễn phí vé vào cổng",
      voucherOffer: "Giảm 10% khi đặt trước",
      commissionRate: 10,
      rating: 4.8,
      reviewCount: 5,
      openingHours: "07:00 - 17:30 hàng ngày",
      phone: "0905 000 118",
      zaloUrl: "https://zalo.me/0905000118",
      image: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80",
      highlights: ["Điểm đến hoang sơ", "Không khí trong lành"],
      activities: ["Tắm suối", "Check-in thiên nhiên"],
      suitableFor: ["Người yêu thiên nhiên", "Bạn trẻ phượt"],
      safetyNotes: ["Mang trang phục gọn gàng"],
      status: "active"
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (place: Place) => {
    setEditingPlace(place);
    setFormData({ ...place });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      setStatusMessage({ type: "error", text: "Vui lòng nhập tên địa điểm" });
      return;
    }

    const slug = formData.slug?.trim() || generateSlug(formData.name);

    const placeToSave: Place = {
      slug,
      name: formData.name.trim(),
      category: (formData.category as PlaceCategory) || "waterfall-stream",
      businessName: formData.businessName?.trim() || "Cơ sở địa phương A Lưới",
      businessId: formData.businessId || "biz-local",
      summary: formData.summary?.trim() || `Khám phá ${formData.name} tại đại ngàn A Lưới.`,
      description: formData.description?.trim() || formData.summary?.trim() || "",
      address: formData.address?.trim() || "A Lưới, Thừa Thiên Huế",
      mapEmbedUrl: formData.mapEmbedUrl || "",
      priceLabel: formData.priceLabel?.trim() || "Liên hệ cơ sở",
      voucherOffer: formData.voucherOffer?.trim() || "Ưu đãi đặt trước",
      commissionRate: Number(formData.commissionRate) || 10,
      rating: Number(formData.rating) || 4.8,
      reviewCount: Number(formData.reviewCount) || 1,
      openingHours: formData.openingHours?.trim() || "07:00 - 17:30",
      phone: formData.phone?.trim() || "0905 000 118",
      zaloUrl: formData.zaloUrl?.trim() || "https://zalo.me/0905000118",
      image: formData.image?.trim() || "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80",
      gallery: formData.gallery || [formData.image || ""],
      services: formData.services || ["Tham quan"],
      highlights: Array.isArray(formData.highlights) ? formData.highlights : [],
      activities: Array.isArray(formData.activities) ? formData.activities : [],
      suitableFor: Array.isArray(formData.suitableFor) ? formData.suitableFor : [],
      safetyNotes: Array.isArray(formData.safetyNotes) ? formData.safetyNotes : [],
      status: (formData.status as "active" | "temporarily_closed") || "active",
      availabilityStatus: formData.availabilityStatus || "available",
      availabilityNote: formData.availabilityNote || "",
      availabilityUpdatedAt: new Date().toISOString()
    };

    startTransition(async () => {
      const res = await savePlaceAction(placeToSave);
      if (res.success) {
        setStatusMessage({
          type: "success",
          text: `Đã lưu thành công địa điểm "${placeToSave.name}". AI và website đã tự động cập nhật!`
        });
        setIsModalOpen(false);
        await loadPlaces();
      } else {
        setStatusMessage({ type: "error", text: res.error || "Có lỗi xảy ra khi lưu" });
      }
    });
  };

  const handleDelete = async (slug: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa địa điểm "${name}"?`)) return;
    startTransition(async () => {
      const res = await deletePlaceAction(slug);
      if (res.success) {
        setStatusMessage({ type: "success", text: `Đã xóa địa điểm "${name}"` });
        await loadPlaces();
      } else {
        setStatusMessage({ type: "error", text: "Không thể xóa địa điểm này" });
      }
    });
  };

  const filteredPlaces = placesList.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = selectedCategory === "all" || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">Quản lý Danh mục Địa điểm</h1>
          <p className="text-xs text-ink/60 mt-1">
            Dữ liệu địa điểm tại đây được <strong>nạp trực tiếp vào AI Gemini</strong> để tự động đề xuất lịch trình cho khách du lịch.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-forest/10 px-4 py-2 text-xs font-bold text-forest">
            {placesList.length} địa điểm trong hệ thống
          </div>
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-forest px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-forest/90 transition"
          >
            <Plus className="size-4" /> Thêm địa điểm mới
          </button>
        </div>
      </div>

      {/* Thông báo */}
      {statusMessage && (
        <div
          className={`flex items-center justify-between rounded-2xl p-4 text-xs font-semibold ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className="size-4 shrink-0 text-amber-500" />
            <span>{statusMessage.text}</span>
          </div>
          <button onClick={() => setStatusMessage(null)} className="text-ink/40 hover:text-ink">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Bộ lọc và Tìm kiếm */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-3 rounded-2xl border border-black/5 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink/40" />
          <input
            type="text"
            placeholder="Tìm theo tên địa điểm, cơ sở, hoạt động..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-beige/30 border border-black/5 focus:outline-none focus:border-forest"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="size-4 text-ink/40" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-2 px-3 rounded-xl text-xs bg-beige/30 border border-black/5 focus:outline-none focus:border-forest text-ink font-semibold"
          >
            <option value="all">Tất cả danh mục</option>
            {placeCategories
              .filter((c) => c.id !== "all")
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Bảng danh sách */}
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
            <tbody className="divide-y divide-black/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-ink/40">
                    <Loader2 className="size-6 animate-spin mx-auto mb-2 text-forest" />
                    Đang nạp dữ liệu địa điểm...
                  </td>
                </tr>
              ) : filteredPlaces.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-ink/40">
                    Không tìm thấy địa điểm nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredPlaces.map((place) => {
                  const cat = placeCategories.find((c) => c.id === place.category);
                  const isActive = place.status === "active";

                  return (
                    <tr key={place.slug} className="hover:bg-beige/40 transition">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="relative size-12 rounded-xl overflow-hidden bg-forest/10 shrink-0">
                            {place.image ? (
                              <Image src={place.image} alt={place.name} fill className="object-cover" />
                            ) : (
                              <div className="size-full flex items-center justify-center bg-forest/10 text-forest">
                                <MapPin className="size-5" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-extrabold text-ink text-sm">{place.name}</p>
                            <p className="text-[11px] text-ink/50 flex items-center gap-1 mt-0.5">
                              <Star className="size-3 fill-current text-clay" /> {place.rating} ({place.reviewCount} đánh giá)
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-beige px-3 py-1 font-bold text-ink/80 text-[11px]">
                          {cat?.label || place.category}
                        </span>
                        {place.category === "stay" && (
                          <div className="mt-1.5">
                            {place.availabilityStatus === "sold_out" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 px-2 py-0.5 text-[10px] font-bold">
                                🔴 Hết phòng
                              </span>
                            ) : place.availabilityStatus === "few_left" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
                                ⚡ Còn 1-2 phòng
                              </span>
                            ) : place.availabilityStatus === "on_request" ? (
                              <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 text-blue-800 px-2 py-0.5 text-[10px] font-bold">
                                📞 Liên hệ
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5 text-[10px] font-bold">
                                🟢 Còn phòng
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-ink/80">{place.businessName}</td>
                      <td className="p-4 max-w-xs">
                        <p className="font-extrabold text-forest">{place.priceLabel}</p>
                        <p className="text-[11px] text-ink/60 mt-0.5 line-clamp-1">🎁 {place.voucherOffer}</p>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-block rounded-xl bg-forest/10 px-2.5 py-1 font-bold text-forest">
                          {place.commissionRate}%
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-[11px] font-bold">
                            <CheckCircle2 className="size-3" /> Đang mở
                          </span>
                        ) : (
                          <span className="rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-[11px] font-bold">
                            Tạm ngưng
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/places/${place.slug}`}
                            target="_blank"
                            title="Xem trang web của khách"
                            className="p-1.5 rounded-lg text-ink/60 hover:text-forest hover:bg-forest/10 transition"
                          >
                            <Eye className="size-4" />
                          </Link>
                          <Link
                            href={`/admin/places/${place.slug}/edit`}
                            target="_blank"
                            title="Chỉnh sửa đầy đủ (tab mới) — nhiều ảnh, nội dung, SEO"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-white bg-forest hover:bg-forest/90 transition"
                          >
                            <Edit2 className="size-3.5" />
                            Chỉnh sửa đầy đủ
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(place)}
                            title="Chỉnh sửa nhanh (modal)"
                            className="p-1.5 rounded-lg text-ink/60 hover:text-amber-600 hover:bg-amber-50 transition"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(place.slug, place.name)}
                            title="Xóa"
                            className="p-1.5 rounded-lg text-ink/60 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="size-4" />
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

      {/* Modal Thêm / Chỉnh sửa Địa điểm */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl border border-black/10 my-8">
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <div>
                <h3 className="text-lg font-black text-ink">
                  {editingPlace ? "Chỉnh sửa Địa điểm" : "Thêm Địa điểm Mới vào Hệ Thống & AI"}
                </h3>
                <p className="text-xs text-ink/60 mt-0.5">
                  Dữ liệu này sẽ lập tức được AI Gemini nhận diện và đề xuất cho khách tạo lịch trình.
                </p>
                {editingPlace && (
                  <Link
                    href={`/admin/places/${editingPlace.slug}/edit`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-forest hover:underline"
                  >
                    <ExternalLink className="size-3.5" />
                    Mở trang chỉnh sửa đầy đủ (nhiều ảnh, nội dung, SEO) →
                  </Link>
                )}
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl p-2 text-ink/40 hover:bg-beige/60 hover:text-ink"
              >
                <X className="size-5" />
              </button>
            </div>


            <form onSubmit={handleSubmit} className="mt-4 space-y-4 max-h-[75vh] overflow-y-auto pr-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider">Tên địa điểm *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ""}
                    onChange={(e) => {
                      const name = e.target.value;
                      setFormData({
                        ...formData,
                        name,
                        slug: editingPlace ? formData.slug : generateSlug(name)
                      });
                    }}
                    placeholder="Ví dụ: Thác Búp Sen Rừng Sâu"
                    className="w-full mt-1 px-3 py-2 rounded-xl text-xs border border-black/10 focus:border-forest focus:outline-none bg-beige/20 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider">Đường dẫn tĩnh (Slug)</label>
                  <input
                    type="text"
                    value={formData.slug || ""}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="thac-bup-sen-rung-sau"
                    className="w-full mt-1 px-3 py-2 rounded-xl text-xs border border-black/10 focus:border-forest focus:outline-none bg-beige/20 font-mono text-ink/70"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider">Danh mục thể loại</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as PlaceCategory })}
                    className="w-full mt-1 px-3 py-2 rounded-xl text-xs border border-black/10 focus:border-forest focus:outline-none bg-beige/20 font-semibold"
                  >
                    {placeCategories
                      .filter((c) => c.id !== "all")
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider">Cơ sở / Hộ chủ quản</label>
                  <input
                    type="text"
                    value={formData.businessName || ""}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    placeholder="Ví dụ: Hợp tác xã Du lịch A Lưới"
                    className="w-full mt-1 px-3 py-2 rounded-xl text-xs border border-black/10 focus:border-forest focus:outline-none bg-beige/20 font-semibold"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider">Mức giá hiển thị</label>
                  <input
                    type="text"
                    value={formData.priceLabel || ""}
                    onChange={(e) => setFormData({ ...formData, priceLabel: e.target.value })}
                    placeholder="50.000đ - 100.000đ/người"
                    className="w-full mt-1 px-3 py-2 rounded-xl text-xs border border-black/10 focus:border-forest focus:outline-none bg-beige/20 font-semibold text-forest"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider">Ưu đãi voucher khách</label>
                  <input
                    type="text"
                    value={formData.voucherOffer || ""}
                    onChange={(e) => setFormData({ ...formData, voucherOffer: e.target.value })}
                    placeholder="Giảm 15% mâm cơm"
                    className="w-full mt-1 px-3 py-2 rounded-xl text-xs border border-black/10 focus:border-forest focus:outline-none bg-beige/20 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider">Hoa hồng đối soát (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={formData.commissionRate ?? 10}
                    onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 rounded-xl text-xs border border-black/10 focus:border-forest focus:outline-none bg-beige/20 font-semibold"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider">Ảnh đại diện</label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:text-forest/80 transition"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" /> Đang tải ảnh...
                      </>
                    ) : (
                      <>
                        <Upload className="size-3.5" /> Chọn ảnh từ máy / điện thoại
                      </>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </div>

                <div className="mt-2 flex items-center gap-3">
                  {formData.image && (
                    <div className="relative size-14 rounded-xl overflow-hidden bg-forest/10 border border-black/10 shrink-0 shadow-sm">
                      <Image src={formData.image} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                  <input
                    type="text"
                    value={formData.image || ""}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="Dán link ảnh hoặc bấm nút 'Chọn ảnh từ máy' ở trên..."
                    className="w-full px-3 py-2 rounded-xl text-xs border border-black/10 focus:border-forest focus:outline-none bg-beige/20"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-ink uppercase tracking-wider">Tóm tắt ngắn (1-2 câu)</label>
                <textarea
                  rows={2}
                  value={formData.summary || ""}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  placeholder="Mô tả nổi bật ngắn gọn để khách đọc nhanh và AI nắm bắt ý chính..."
                  className="w-full mt-1 px-3 py-2 rounded-xl text-xs border border-black/10 focus:border-forest focus:outline-none bg-beige/20"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider">Điểm nổi bật (Cách nhau bởi dấu phẩy)</label>
                  <input
                    type="text"
                    value={formData.highlights?.join(", ") || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        highlights: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                      })
                    }
                    placeholder="Suối trong xanh, Hoang sơ, Check-in đẹp"
                    className="w-full mt-1 px-3 py-2 rounded-xl text-xs border border-black/10 focus:border-forest focus:outline-none bg-beige/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider">Hoạt động tại điểm (Cách nhau bởi dấu phẩy)</label>
                  <input
                    type="text"
                    value={formData.activities?.join(", ") || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        activities: e.target.value.split(",").map((s) => s.trim()).filter(Boolean)
                      })
                    }
                    placeholder="Tắm thác, Nướng gà suối, Cắm trại"
                    className="w-full mt-1 px-3 py-2 rounded-xl text-xs border border-black/10 focus:border-forest focus:outline-none bg-beige/20"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider">Trạng thái mở cửa</label>
                  <select
                    value={formData.status || "active"}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "temporarily_closed" })}
                    className="w-full mt-1 px-3 py-2 rounded-xl text-xs border border-black/10 focus:border-forest focus:outline-none bg-beige/20 font-semibold"
                  >
                    <option value="active">Đang mở cửa đón khách</option>
                    <option value="temporarily_closed">Tạm ngưng đón khách</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider">Số điện thoại liên hệ</label>
                  <input
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="0905 000 118"
                    className="w-full mt-1 px-3 py-2 rounded-xl text-xs border border-black/10 focus:border-forest focus:outline-none bg-beige/20"
                  />
                </div>
              </div>

              {formData.category === "stay" && (
                <div className="rounded-2xl border-2 border-forest/20 bg-forest/5 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-forest uppercase tracking-wider flex items-center gap-1.5">
                      <BedDouble className="size-4" /> Tình trạng phòng hôm nay (Availability)
                    </label>
                    <span className="text-[10px] text-ink/60 bg-white px-2 py-0.5 rounded-full border border-forest/10">
                      Tự động cập nhật huy hiệu cho khách
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: "available", label: "🟢 Còn phòng", desc: "Đón khách bình thường" },
                      { value: "few_left", label: "⚡ Còn 1-2 phòng", desc: "Tạo hiệu ứng gấp" },
                      { value: "sold_out", label: "🔴 Hết phòng", desc: "Báo kín lịch" },
                      { value: "on_request", label: "📞 Liên hệ trước", desc: "Cần gọi xác nhận" }
                    ].map((opt) => {
                      const isSelected = (formData.availabilityStatus || "available") === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, availabilityStatus: opt.value as any })}
                          className={`p-2.5 rounded-xl text-left border text-xs transition ${
                            isSelected
                              ? "bg-white border-forest shadow-sm ring-2 ring-forest/20 font-bold text-forest"
                              : "bg-white/60 border-black/5 hover:bg-white text-ink/70"
                          }`}
                        >
                          <div className="font-bold">{opt.label}</div>
                          <div className="text-[10px] text-ink/50 mt-0.5">{opt.desc}</div>
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-ink/80">Ghi chú phòng (tùy chọn)</label>
                    <input
                      type="text"
                      value={formData.availabilityNote || ""}
                      onChange={(e) => setFormData({ ...formData, availabilityNote: e.target.value })}
                      placeholder="Ví dụ: Chỉ còn phòng đôi view suối, phòng tập thể đã kín..."
                      className="w-full mt-1 px-3 py-2 rounded-xl text-xs border border-black/10 focus:border-forest focus:outline-none bg-white font-medium"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5">
                {editingPlace && (
                  <Link
                    href={`/admin/places/${editingPlace.slug}/edit`}
                    target="_blank"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold text-forest border border-forest/30 hover:bg-forest/5 transition"
                  >
                    <ExternalLink className="size-3.5" />
                    Mở trang chỉnh sửa đầy đủ
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-ink/70 hover:bg-beige/60 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-forest hover:bg-forest/90 transition shadow-md disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" /> Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="size-4" /> Lưu Địa Điểm & Nạp Vào AI
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}

