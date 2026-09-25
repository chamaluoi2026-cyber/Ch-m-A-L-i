"use client";

import React, { useState } from "react";
import {
  CloudSun,
  Thermometer,
  Navigation,
  Waves,
  Flame,
  AlertCircle,
  Clock,
  Sparkles,
  Edit3,
  CheckCircle2,
  X,
  Loader2
} from "lucide-react";
import type { TravelConditions } from "@/lib/server-store";
import { updateTravelConditionsAction } from "@/app/actions/travel-conditions";

interface TravelConditionsCardProps {
  initialData: TravelConditions;
}

export function TravelConditionsCard({ initialData }: TravelConditionsCardProps) {
  const [data, setData] = useState<TravelConditions>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Form State
  const [form, setForm] = useState<TravelConditions>(initialData);

  const handleOpen = () => {
    setForm(data);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateTravelConditionsAction(form);
      if (res.success && res.data) {
        setData(res.data);
        setIsModalOpen(false);
        setToast("✨ Đã cập nhật bản tin thực địa và đồng bộ đến website khách hàng!");
        setTimeout(() => setToast(null), 4000);
      } else {
        alert(res.error || "Không thể cập nhật.");
      }
    } catch {
      alert("Lỗi kết nối khi cập nhật.");
    } finally {
      setSaving(false);
    }
  };

  const getWeatherIcon = (state: string) => {
    switch (state) {
      case "sunny":
        return "☀️ Nắng ráo ấm áp";
      case "cloudy":
        return "⛅ Nhiều mây, mát dịu";
      case "cool":
        return "🍃 Se lạnh, sương sớm";
      case "light_rain":
        return "🌦️ Mưa nhẹ bay bay";
      case "rainy":
        return "🌧️ Mưa rừng, cần lưu ý";
      default:
        return "🌤️ Thời tiết mát mẻ";
    }
  };

  const getRoadBadge = (status: string) => {
    switch (status) {
      case "normal":
        return { text: "Thông thoáng, an toàn", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
      case "foggy":
        return { text: "Sương mù nhẹ, đi chậm", color: "bg-amber-100 text-amber-800 border-amber-300" };
      case "slippery":
        return { text: "Mưa trơn trượt, cẩn thận", color: "bg-orange-100 text-orange-800 border-orange-300" };
      case "maintenance":
        return { text: "Đang sửa chữa đoạn ngắn", color: "bg-red-100 text-red-800 border-red-300" };
      default:
        return { text: "Bình thường", color: "bg-emerald-100 text-emerald-800 border-emerald-300" };
    }
  };

  const formatUpdateDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")} - ${d.getDate()}/${d.getMonth() + 1}`;
    } catch {
      return "Hôm nay";
    }
  };

  const roadBadge = getRoadBadge(data.roadStatus);

  return (
    <>
      <div className="rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 via-white to-amber-50/50 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-gradient-to-br from-forest to-emerald-700 text-white grid place-items-center shadow-md">
              <CloudSun size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-ink text-base">Bản Tin Thực Địa A Lưới Hôm Nay</h3>
                <span className="rounded-full bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 animate-pulse">
                  LIVE REALTIME
                </span>
              </div>
              <p className="text-xs text-ink/60 mt-0.5">
                Đồng bộ trực tiếp lên Trang chủ Khách hàng & Cố vấn Lịch trình AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-ink/50 flex items-center gap-1 font-mono">
              <Clock size={12} /> Cập nhật: {formatUpdateDate(data.updatedAt)}
            </span>
            <button
              type="button"
              onClick={handleOpen}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-forest text-white text-xs font-bold shadow-sm hover:bg-forest/90 transition active:scale-95"
            >
              <Edit3 size={13} />
              <span>Cập nhật nhanh (30s)</span>
            </button>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {/* Thời tiết */}
          <div className="p-3.5 rounded-2xl bg-white border border-black/5 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50 flex items-center gap-1">
              <Thermometer size={12} className="text-rose-500" /> Thời tiết & Nhiệt độ
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-ink">{data.temperature}</span>
              <span className="text-xs font-bold text-emerald-700">{getWeatherIcon(data.weatherState)}</span>
            </div>
            <p className="text-[11px] text-ink/70 line-clamp-1">{data.weatherLabel}</p>
          </div>

          {/* Đèo QL49 */}
          <div className="p-3.5 rounded-2xl bg-white border border-black/5 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50 flex items-center gap-1">
              <Navigation size={12} className="text-blue-500" /> Tuyến đèo QL49
            </span>
            <div>
              <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${roadBadge.color}`}>
                {roadBadge.text}
              </span>
            </div>
            <p className="text-[11px] text-ink/70 line-clamp-1">{data.roadLabel}</p>
          </div>

          {/* Thác A Nôr */}
          <div className="p-3.5 rounded-2xl bg-white border border-black/5 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50 flex items-center gap-1">
              <Waves size={12} className="text-teal-500" /> Thác A Nôr & Pâr Le
            </span>
            <div>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  data.waterfallStatus === "open"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-amber-100 text-amber-800 border-amber-300"
                }`}
              >
                {data.waterfallStatus === "open" ? "🌊 Mở cửa đón khách" : "⚠️ Cảnh báo nước lớn"}
              </span>
            </div>
            <p className="text-[11px] text-ink/70 line-clamp-1">{data.waterfallLabel}</p>
          </div>

          {/* Suối khoáng A Roàng */}
          <div className="p-3.5 rounded-2xl bg-white border border-black/5 shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink/50 flex items-center gap-1">
              <Flame size={12} className="text-amber-500" /> Suối nước nóng A Roàng
            </span>
            <div>
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  data.hotSpringStatus === "active"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                    : "bg-amber-100 text-amber-800 border-amber-300"
                }`}
              >
                {data.hotSpringStatus === "active" ? "♨️ Đang hoạt động" : "🛠️ Tạm bảo trì"}
              </span>
            </div>
            <p className="text-[11px] text-ink/70 line-clamp-1">{data.hotSpringLabel}</p>
          </div>
        </div>

        {/* Lời khuyên bản địa */}
        <div className="mt-3.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5 text-xs text-amber-950 font-medium">
          <AlertCircle size={15} className="text-amber-600 shrink-0" />
          <span>
            <strong>Khuyến cáo hôm nay:</strong> {data.advisoryNote}
          </span>
        </div>
      </div>

      {/* Modal Cập nhật nhanh */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-black/5">
              <div className="flex items-center gap-2.5">
                <div className="size-9 rounded-xl bg-forest text-white grid place-items-center">
                  <Sparkles size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-ink text-base">Cập Nhật Thực Địa A Lưới Hôm Nay</h3>
                  <p className="text-[11px] text-ink/50">Mất 30 giây để khách cả nước nắm bắt tình hình thực tế</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl text-ink/40 hover:text-ink hover:bg-black/5"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* Nhiệt độ & Thời tiết */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Nhiệt độ hiện tại:</label>
                  <input
                    type="text"
                    required
                    value={form.temperature}
                    onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                    placeholder="VD: 24°C"
                    className="w-full px-3 py-2 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Kiểu thời tiết:</label>
                  <select
                    value={form.weatherState}
                    onChange={(e) => setForm({ ...form, weatherState: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-medium"
                  >
                    <option value="sunny">☀️ Nắng ráo ấm áp</option>
                    <option value="cool">🍃 Se lạnh, sương sớm</option>
                    <option value="cloudy">⛅ Nhiều mây, mát dịu</option>
                    <option value="light_rain">🌦️ Mưa nhẹ bay bay</option>
                    <option value="rainy">🌧️ Mưa rừng to</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Mô tả thời tiết ngắn gọn:</label>
                <input
                  type="text"
                  value={form.weatherLabel}
                  onChange={(e) => setForm({ ...form, weatherLabel: e.target.value })}
                  placeholder="VD: Tiết trời mát mẻ vùng cao, se lạnh về đêm"
                  className="w-full px-3 py-2 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10"
                />
              </div>

              {/* Tình trạng QL49 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Tuyến đèo QL49 Huế - A Lưới:</label>
                  <select
                    value={form.roadStatus}
                    onChange={(e) => setForm({ ...form, roadStatus: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-medium"
                  >
                    <option value="normal">🟢 Thông thoáng, an toàn</option>
                    <option value="foggy">🟡 Sương mù nhẹ, đi chậm</option>
                    <option value="slippery">🟠 Mưa trơn trượt</option>
                    <option value="maintenance">🔴 Đang sửa chữa đường</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Chi tiết đường đi:</label>
                  <input
                    type="text"
                    value={form.roadLabel}
                    onChange={(e) => setForm({ ...form, roadLabel: e.target.value })}
                    placeholder="VD: Đường khô ráo, chạy tốt"
                    className="w-full px-3 py-2 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10"
                  />
                </div>
              </div>

              {/* Thác & Suối khoáng */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-ink block mb-1">Thác A Nôr / Pâr Le:</label>
                  <select
                    value={form.waterfallStatus}
                    onChange={(e) => setForm({ ...form, waterfallStatus: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-medium"
                  >
                    <option value="open">🌊 Mở cửa đón khách bình thường</option>
                    <option value="caution">⚠️ Cảnh báo nước nguồn lớn</option>
                    <option value="closed">⛔ Tạm ngừng đón khách</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-ink block mb-1">Suối nước nóng A Roàng:</label>
                  <select
                    value={form.hotSpringStatus}
                    onChange={(e) => setForm({ ...form, hotSpringStatus: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-medium"
                  >
                    <option value="active">♨️ Đang hoạt động bình thường</option>
                    <option value="maintenance">🛠️ Đang bảo trì</option>
                  </select>
                </div>
              </div>

              {/* Lời khuyên */}
              <div>
                <label className="font-bold text-ink block mb-1">Khuyến nghị người bản địa gửi du khách:</label>
                <input
                  type="text"
                  required
                  value={form.advisoryNote}
                  onChange={(e) => setForm({ ...form, advisoryNote: e.target.value })}
                  placeholder="VD: Nên mang theo áo khoác mỏng và dép chống trượt khi tắm suối"
                  className="w-full px-3 py-2 rounded-xl border border-black/10 focus:border-forest focus:outline-none bg-beige/10 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-black/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-ink/60 hover:bg-black/5"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-forest text-white font-bold text-xs hover:bg-forest/90 transition shadow-md disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Đang lưu Supabase...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={14} />
                      <span>Lưu & Đồng bộ ngay</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-forest text-white px-4 py-3 text-xs font-bold shadow-2xl flex items-center gap-2 border border-white/20 animate-in fade-in">
          <CheckCircle2 size={16} className="text-amber-300" />
          <span>{toast}</span>
        </div>
      )}
    </>
  );
}
