"use client";

import React, { useState, useTransition } from "react";
import {
  Building2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Clock,
  PauseCircle,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import type { BusinessRecord } from "@/lib/server-store";
import {
  createBusinessAction,
  updateBusinessAction,
  deleteBusinessAction,
  fetchBusinessesAction
} from "@/app/actions/business";

interface Props {
  initialBusinesses: BusinessRecord[];
}

export default function BusinessesClient({ initialBusinesses }: Props) {
  const [businesses, setBusinesses] = useState<BusinessRecord[]>(initialBusinesses);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending" | "paused">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState<BusinessRecord | null>(null);
  const [deletingBusiness, setDeletingBusiness] = useState<BusinessRecord | null>(null);
  const [isPending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<BusinessRecord>>({
    id: "",
    name: "",
    ownerName: "",
    phone: "",
    email: "",
    zaloUrl: "",
    address: "A Lưới, Thừa Thiên Huế",
    commissionRate: 10,
    status: "active"
  });

  // Calculate stats
  const totalCount = businesses.length;
  const activeCount = businesses.filter((b) => b.status === "active").length;
  const pausedOrPendingCount = businesses.filter((b) => b.status !== "active").length;
  const avgCommission = totalCount > 0
    ? (businesses.reduce((sum, b) => sum + (b.commissionRate || 0), 0) / totalCount).toFixed(1)
    : "10";

  // Filter list
  const filteredBusinesses = businesses.filter((biz) => {
    const matchSearch =
      biz.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      biz.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      biz.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      biz.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (biz.address && biz.address.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStatus = statusFilter === "all" || biz.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Open Modal Add
  const handleOpenAdd = () => {
    setEditingBusiness(null);
    setFormData({
      id: "",
      name: "",
      ownerName: "",
      phone: "",
      email: "",
      zaloUrl: "",
      address: "Huyện A Lưới, Thừa Thiên Huế",
      commissionRate: 10,
      status: "active"
    });
    setIsModalOpen(true);
    setStatusMessage(null);
  };

  // Open Modal Edit
  const handleOpenEdit = (biz: BusinessRecord) => {
    setEditingBusiness(biz);
    setFormData({
      id: biz.id,
      name: biz.name,
      ownerName: biz.ownerName,
      phone: biz.phone,
      email: biz.email,
      zaloUrl: biz.zaloUrl,
      address: biz.address,
      commissionRate: biz.commissionRate,
      status: biz.status
    });
    setIsModalOpen(true);
    setStatusMessage(null);
  };

  // Auto-slug ID on name change when adding
  const handleNameChange = (name: string) => {
    if (!editingBusiness) {
      const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 24);
      setFormData((prev) => ({
        ...prev,
        name,
        id: slug ? `biz-${slug}` : ""
      }));
    } else {
      setFormData((prev) => ({ ...prev, name }));
    }
  };

  // Auto set Zalo URL when phone changes if empty
  const handlePhoneChange = (phone: string) => {
    setFormData((prev) => {
      const cleanPhone = phone.replace(/\D/g, "");
      const currentZalo = prev.zaloUrl || "";
      const isAutoZalo = !currentZalo || currentZalo.startsWith("https://zalo.me/");
      return {
        ...prev,
        phone,
        zaloUrl: isAutoZalo && cleanPhone ? `https://zalo.me/${cleanPhone}` : prev.zaloUrl
      };
    });
  };

  // Save / Update Handler
  const handleSave = () => {
    if (!formData.name?.trim()) {
      setStatusMessage({ type: "error", text: "Vui lòng nhập tên cơ sở / hợp tác xã!" });
      return;
    }
    if (!formData.ownerName?.trim()) {
      setStatusMessage({ type: "error", text: "Vui lòng nhập họ tên người đại diện!" });
      return;
    }
    if (!formData.phone?.trim()) {
      setStatusMessage({ type: "error", text: "Vui lòng nhập số điện thoại liên hệ!" });
      return;
    }

    startTransition(async () => {
      try {
        if (editingBusiness) {
          // Update existing
          const res = await updateBusinessAction(editingBusiness.id, {
            name: formData.name?.trim(),
            ownerName: formData.ownerName?.trim(),
            phone: formData.phone?.trim(),
            email: formData.email?.trim() || "",
            zaloUrl: formData.zaloUrl?.trim() || "",
            address: formData.address?.trim() || "",
            commissionRate: Number(formData.commissionRate) || 10,
            status: formData.status || "active"
          });

          if (!res.success) {
            setStatusMessage({ type: "error", text: res.error || "Cập nhật cơ sở thất bại!" });
            return;
          }

          // Update local state
          setBusinesses((prev) =>
            prev.map((b) => (b.id === editingBusiness.id ? { ...b, ...formData } as BusinessRecord : b))
          );
          setStatusMessage({ type: "success", text: `Đã cập nhật cơ sở "${formData.name}" thành công!` });
        } else {
          // Create new
          const res = await createBusinessAction({
            id: formData.id?.trim() || undefined,
            name: formData.name!.trim(),
            ownerName: formData.ownerName!.trim(),
            phone: formData.phone!.trim(),
            email: formData.email?.trim() || "",
            zaloUrl: formData.zaloUrl?.trim() || "",
            address: formData.address?.trim() || "",
            commissionRate: Number(formData.commissionRate) || 10,
            status: formData.status || "active"
          });

          if (!res.success || !res.business) {
            setStatusMessage({ type: "error", text: res.error || "Thêm mới cơ sở thất bại!" });
            return;
          }

          // Add to local state
          setBusinesses((prev) => [res.business!, ...prev]);
          setStatusMessage({ type: "success", text: `Đã thêm mới cơ sở đối tác "${formData.name}" thành công!` });
        }

        setIsModalOpen(false);

        // Auto refresh in background
        const refreshed = await fetchBusinessesAction();
        setBusinesses(refreshed);
      } catch (err: any) {
        setStatusMessage({ type: "error", text: err?.message || "Đã xảy ra lỗi khi lưu thông tin!" });
      }
    });
  };

  // Delete Handler
  const handleDeleteConfirm = () => {
    if (!deletingBusiness) return;
    const targetId = deletingBusiness.id;
    const targetName = deletingBusiness.name;

    startTransition(async () => {
      try {
        const res = await deleteBusinessAction(targetId);
        if (!res.success) {
          setStatusMessage({ type: "error", text: res.error || "Không thể xóa cơ sở này." });
          return;
        }

        setBusinesses((prev) => prev.filter((b) => b.id !== targetId));
        setStatusMessage({ type: "success", text: `Đã xóa cơ sở đối tác "${targetName}" thành công!` });
        setDeletingBusiness(null);

        const refreshed = await fetchBusinessesAction();
        setBusinesses(refreshed);
      } catch (err: any) {
        setStatusMessage({ type: "error", text: err?.message || "Lỗi khi xóa cơ sở!" });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {statusMessage && (
        <div
          className={`flex items-center justify-between gap-3 p-4 rounded-2xl text-xs font-bold transition shadow-sm ${
            statusMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="size-4 text-rose-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-ink/40 hover:text-ink transition p-1"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Header & Main Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">Quản lý Doanh nghiệp & Cơ sở đối tác</h1>
          <p className="text-xs text-ink/60 mt-1 max-w-2xl leading-relaxed">
            Hệ sinh thái đối tác bản địa A Lưới: HTX cộng đồng, homestay, nhà hàng ẩm thực, làng nghề dệt Zèng, đơn vị vận tải.
            Quản lý tỷ lệ hoa hồng hợp đồng, thông tin liên hệ và đối soát doanh thu.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 rounded-2xl bg-forest px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-forest/90 transition active:scale-95"
        >
          <Plus className="size-4" />
          + Thêm cơ sở đối tác mới
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-ink/50 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tổng cơ sở</span>
            <Building2 className="size-4 text-forest" />
          </div>
          <p className="text-2xl font-black text-ink">{totalCount}</p>
          <p className="text-[11px] text-ink/50 mt-0.5">Đối tác kết nối</p>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50">Đang hoạt động</span>
            <ShieldCheck className="size-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700">{activeCount}</p>
          <p className="text-[11px] text-emerald-600/80 mt-0.5">Sẵn sàng nhận khách</p>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50">Tạm dừng / Chờ</span>
            <Clock className="size-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700">{pausedOrPendingCount}</p>
          <p className="text-[11px] text-amber-600/80 mt-0.5">Đang cập nhật</p>
        </div>

        <div className="rounded-2xl border border-black/5 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between text-forest mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50">Hoa hồng TB</span>
            <Percent className="size-4 text-forest" />
          </div>
          <p className="text-2xl font-black text-forest">{avgCommission}%</p>
          <p className="text-[11px] text-ink/50 mt-0.5">Mức chiết khấu sàn</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3 border border-black/5 shadow-sm">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-ink/40" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên cơ sở, người đại diện, SĐT, mã ID..."
            className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-beige/30 border border-black/10 focus:border-forest focus:outline-none placeholder:text-ink/40 font-medium"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { key: "all", label: `Tất cả (${totalCount})` },
              { key: "active", label: `Hoạt động (${activeCount})` },
              { key: "pending", label: "Chờ ký kết" },
              { key: "paused", label: "Tạm dừng" }
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition whitespace-nowrap ${
                statusFilter === tab.key
                  ? "bg-forest text-white shadow-sm"
                  : "bg-beige/40 text-ink/60 hover:bg-beige hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-card border border-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-forest/5 text-ink/70 font-bold uppercase tracking-wider border-b border-black/5">
              <tr>
                <th className="p-4">Tên cơ sở / Hợp tác xã</th>
                <th className="p-4">Người đại diện</th>
                <th className="p-4">Liên hệ (SĐT / Zalo / Email)</th>
                <th className="p-4">Địa bàn hoạt động</th>
                <th className="p-4 text-center">Hoa hồng</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {filteredBusinesses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-ink/50 font-medium">
                    Không tìm thấy cơ sở nào phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredBusinesses.map((biz) => {
                  const isPaused = biz.status === "paused";
                  const isPending = biz.status === "pending";

                  return (
                    <tr key={biz.id} className="hover:bg-beige/30 transition">
                      <td className="p-4">
                        <p className="font-extrabold text-ink text-sm flex items-center gap-1.5">
                          <Building2 className="size-4 text-forest shrink-0" />
                          {biz.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-ink/50 mt-1">
                          <span className="font-mono bg-black/5 px-2 py-0.5 rounded-md font-bold text-ink/70">
                            {biz.id}
                          </span>
                          <span>• Ngày kết nối: {biz.joinedDate || "Đã xác minh"}</span>
                        </div>
                      </td>

                      <td className="p-4 font-semibold text-ink/80">
                        <div className="flex items-center gap-1.5">
                          <UserCheck className="size-3.5 text-forest shrink-0" />
                          <span className="font-bold">{biz.ownerName}</span>
                        </div>
                      </td>

                      <td className="p-4 text-ink/75 space-y-1">
                        <div className="flex items-center gap-2 font-mono">
                          <a
                            href={`tel:${biz.phone}`}
                            className="inline-flex items-center gap-1 font-bold text-forest hover:underline"
                            title="Gọi điện thoại"
                          >
                            <Phone className="size-3.5 text-clay shrink-0" />
                            {biz.phone}
                          </a>
                          {biz.zaloUrl && (
                            <a
                              href={biz.zaloUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-200 hover:bg-blue-100 transition"
                              title="Mở Zalo"
                            >
                              <MessageSquare className="size-2.5" /> Zalo
                            </a>
                          )}
                        </div>
                        {biz.email && (
                          <div className="flex items-center gap-1.5 text-ink/50 text-[11px]">
                            <Mail className="size-3 text-ink/40 shrink-0" />
                            <span className="truncate max-w-[180px]">{biz.email}</span>
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-ink/70 max-w-xs">
                        <div className="flex items-start gap-1.5">
                          <MapPin className="size-3.5 text-forest shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{biz.address || "Huyện A Lưới, Thừa Thiên Huế"}</span>
                        </div>
                      </td>

                      <td className="p-4 text-center">
                        <span className="inline-block rounded-xl bg-forest/10 px-3 py-1 font-extrabold text-forest text-sm">
                          {biz.commissionRate ?? 10}%
                        </span>
                      </td>

                      <td className="p-4 text-center">
                        {isPaused ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 text-rose-800 px-2.5 py-1 text-[11px] font-bold">
                            <PauseCircle className="size-3.5" /> Tạm dừng
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2.5 py-1 text-[11px] font-bold">
                            <Clock className="size-3.5" /> Chờ ký kết
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1 text-[11px] font-bold">
                            <ShieldCheck className="size-3.5" /> Hoạt động
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(biz)}
                            className="p-1.5 text-ink/60 hover:text-forest hover:bg-forest/10 rounded-lg transition"
                            title="Chỉnh sửa thông tin"
                          >
                            <Edit2 className="size-4" />
                          </button>
                          <button
                            onClick={() => setDeletingBusiness(biz)}
                            className="p-1.5 text-ink/60 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Xóa cơ sở"
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

      {/* Modal Add / Edit Business */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl border border-black/5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-black/5 pb-4">
              <div>
                <h2 className="text-lg font-black text-ink">
                  {editingBusiness ? "Chỉnh sửa cơ sở đối tác" : "Thêm mới cơ sở đối tác"}
                </h2>
                <p className="text-xs text-ink/50 mt-0.5">
                  {editingBusiness
                    ? `Cập nhật thông tin cho "${editingBusiness.name}"`
                    : "Đăng ký cơ sở kinh doanh, HTX hoặc hộ dịch vụ mới tại A Lưới"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-ink/40 hover:text-ink rounded-full hover:bg-black/5 transition"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Modal Form */}
            <div className="space-y-4 py-4">
              <div>
                <label className="text-[11px] font-bold text-ink uppercase tracking-wider">
                  Tên cơ sở / Hợp tác xã <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name || ""}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ví dụ: Hợp tác xã Du lịch Sinh thái A Roàng"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl text-xs border border-black/10 focus:border-forest focus:outline-none bg-beige/20 font-bold text-ink"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider">
                    Mã định danh (ID)
                  </label>
                  <input
                    type="text"
                    disabled={!!editingBusiness}
                    value={formData.id || ""}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    placeholder="biz-a-roang"
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl text-xs border border-black/10 focus:border-forest focus:outline-none bg-beige/30 font-mono text-ink/70 disabled:opacity-60"
                  />
                  <p className="text-[10px] text-ink/40 mt-1">Dùng để liên kết với Địa điểm du lịch</p>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider">
                    Người đại diện / Phụ trách <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName || ""}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    placeholder="Ví dụ: Hồ Văn Hạnh"
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl text-xs border border-black/10 focus:border-forest focus:outline-none bg-beige/20 font-semibold"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider">
                    Số điện thoại / Hotline <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.phone || ""}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    placeholder="Ví dụ: 0905 123 456"
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl text-xs border border-black/10 focus:border-forest focus:outline-none bg-beige/20 font-mono font-bold text-forest"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider">
                    Link Zalo tư vấn
                  </label>
                  <input
                    type="text"
                    value={formData.zaloUrl || ""}
                    onChange={(e) => setFormData({ ...formData, zaloUrl: e.target.value })}
                    placeholder="https://zalo.me/0905123456"
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl text-xs border border-black/10 focus:border-forest focus:outline-none bg-beige/20 font-mono text-ink/70"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider">
                    Email liên hệ
                  </label>
                  <input
                    type="email"
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="doitac@gmail.com"
                    className="w-full mt-1 px-3.5 py-2.5 rounded-xl text-xs border border-black/10 focus:border-forest focus:outline-none bg-beige/20"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-ink uppercase tracking-wider">
                    Tỷ lệ hoa hồng sàn (%)
                  </label>
                  <div className="flex items-center gap-3 mt-1">
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={formData.commissionRate ?? 10}
                      onChange={(e) => setFormData({ ...formData, commissionRate: Number(e.target.value) })}
                      className="w-24 px-3.5 py-2.5 rounded-xl text-xs border border-black/10 focus:border-forest focus:outline-none bg-beige/20 font-bold text-forest"
                    />
                    <span className="text-xs text-ink/50 font-medium">
                      Mức trích nộp khi có khách đặt thành công
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-ink uppercase tracking-wider">
                  Địa chỉ hoạt động tại A Lưới
                </label>
                <input
                  type="text"
                  value={formData.address || ""}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Thôn A Nôr, xã Hồng Kim, A Lưới, Thừa Thiên Huế"
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl text-xs border border-black/10 focus:border-forest focus:outline-none bg-beige/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-ink uppercase tracking-wider">
                  Trạng thái hoạt động
                </label>
                <select
                  value={formData.status || "active"}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full mt-1 px-3.5 py-2.5 rounded-xl text-xs border border-black/10 focus:border-forest focus:outline-none bg-beige/20 font-bold"
                >
                  <option value="active">🟢 Đang hoạt động (Nhận khách & Đối soát)</option>
                  <option value="pending">🟡 Chờ xác minh / Ký kết hợp đồng</option>
                  <option value="paused">🔴 Tạm dừng hoạt động</option>
                </select>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 border-t border-black/5 pt-4">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                disabled={isPending}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-ink/60 hover:bg-black/5 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-forest/90 transition active:scale-95 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" /> Đang lưu dữ liệu...
                  </>
                ) : (
                  <>
                    <Save className="size-4" /> {editingBusiness ? "Lưu thay đổi" : "Tạo cơ sở mới"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirm Delete */}
      {deletingBusiness && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-black/5">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2.5 rounded-2xl bg-rose-100">
                <AlertTriangle className="size-6 text-rose-600" />
              </div>
              <div>
                <h3 className="text-base font-black text-ink">Xác nhận xóa cơ sở?</h3>
                <p className="text-xs text-ink/50">Thao tác này sẽ ẩn cơ sở khỏi hệ thống</p>
              </div>
            </div>

            <p className="text-xs text-ink/70 leading-relaxed bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100 mb-5">
              Bạn có chắc chắn muốn xóa cơ sở đối tác{" "}
              <strong className="text-rose-700">{deletingBusiness.name}</strong> (Mã:{" "}
              <code className="font-mono font-bold text-ink">{deletingBusiness.id}</code>)?
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingBusiness(null)}
                disabled={isPending}
                className="px-4 py-2 rounded-xl text-xs font-bold text-ink/60 hover:bg-black/5 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isPending}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-rose-700 transition active:scale-95 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" /> Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5" /> Xác nhận xóa
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
