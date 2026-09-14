"use client";

import { useEffect, useState } from "react";
import { fetchBusinessByIdAction, updateBusinessAction } from "@/app/actions/business";
import type { BusinessRecord } from "@/lib/server-store";
import { Building2, Check, Mail, MapPin, Phone, Save, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BusinessProfilePage() {
  const currentBusinessId = "biz-a-nor";
  const [business, setBusiness] = useState<BusinessRecord | null>(null);
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [zaloUrl, setZaloUrl] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchBusinessByIdAction(currentBusinessId).then((b) => {
      if (b) {
        setBusiness(b);
        setOwnerName(b.ownerName);
        setPhone(b.phone);
        setEmail(b.email);
        setZaloUrl(b.zaloUrl);
        setAddress(b.address);
      }
    });
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const res = await updateBusinessAction(currentBusinessId, {
      ownerName,
      phone,
      email,
      zaloUrl,
      address
    });

    setSaving(false);
    if (res.success && res.business) {
      setBusiness(res.business);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }

  if (!business) {
    return <div className="p-8 text-center text-ink/50">Đang tải thông tin cơ sở...</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-ink">Hồ sơ Doanh nghiệp & Cơ sở</h1>
        <p className="text-xs text-ink/60 mt-1">
          Cập nhật số điện thoại, đường link Zalo để du khách kết nối tư vấn trực tiếp sau khi nhận voucher
        </p>
      </div>

      <form onSubmit={handleSave} className="rounded-3xl bg-white p-6 md:p-8 shadow-card border border-black/5 space-y-5">
        <div className="flex items-center justify-between pb-4 border-b border-black/5">
          <div>
            <span className="text-[10px] uppercase font-bold text-ink/50">Tên đơn vị đăng ký</span>
            <h2 className="text-xl font-extrabold text-ink">{business.name}</h2>
          </div>
          <span className="rounded-full bg-forest/10 px-3 py-1 text-xs font-bold text-forest">
            Tỷ lệ hoa hồng: {business.commissionRate}%
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-xs font-bold text-ink">
            Người đại diện / Giám đốc HTX
            <Input
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Họ tên người đại diện"
              required
            />
          </label>

          <label className="grid gap-1.5 text-xs font-bold text-ink">
            Số điện thoại Hotline
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="09xx xxx xxx"
              required
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-xs font-bold text-ink">
            Email liên hệ
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@gmail.com"
              required
            />
          </label>

          <label className="grid gap-1.5 text-xs font-bold text-ink">
            Đường link Zalo chính thức (https://zalo.me/...)
            <Input
              value={zaloUrl}
              onChange={(e) => setZaloUrl(e.target.value)}
              placeholder="https://zalo.me/0905000118"
              required
            />
          </label>
        </div>

        <label className="grid gap-1.5 text-xs font-bold text-ink">
          Địa chỉ cơ sở đón khách tại A Lưới
          <Input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Địa chỉ cụ thể tại xã Hồng Kim, Hồng Hạ, A Roàng..."
            required
          />
        </label>

        {saved ? (
          <div className="rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
            <Check className="size-4" /> Đã lưu thông tin cơ sở thành công!
          </div>
        ) : null}

        <div className="pt-3">
          <Button type="submit" disabled={saving} className="px-6 font-bold">
            <Save className="size-4 mr-2" />
            {saving ? "Đang lưu..." : "Lưu thay đổi hồ sơ"}
          </Button>
        </div>
      </form>
    </div>
  );
}
