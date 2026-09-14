import { getAllBusinesses } from "@/lib/server-store";
import { Building2, Mail, MapPin, Phone, ShieldCheck, UserCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminBusinessesPage() {
  const businesses = getAllBusinesses();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">Quản lý Doanh nghiệp & Cơ sở đối tác</h1>
          <p className="text-xs text-ink/60 mt-1">
            Danh sách các hợp tác xã, homestay, nhà hàng và hộ kinh doanh cung cấp dịch vụ tại A Lưới
          </p>
        </div>
        <div className="rounded-2xl bg-forest/10 px-4 py-2 text-xs font-bold text-forest">
          {businesses.length} cơ sở đang kết nối
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-card border border-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-forest/5 text-ink/70 font-bold uppercase tracking-wider border-b border-black/5">
              <tr>
                <th className="p-4">Tên cơ sở / Hợp tác xã</th>
                <th className="p-4">Người đại diện</th>
                <th className="p-4">Liên hệ (SĐT / Zalo)</th>
                <th className="p-4">Địa chỉ hoạt động</th>
                <th className="p-4 text-center">Tỷ lệ hoa hồng</th>
                <th className="p-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {businesses.map((biz) => (
                <tr key={biz.id} className="hover:bg-beige/40 transition">
                  <td className="p-4">
                    <p className="font-extrabold text-ink text-sm">{biz.name}</p>
                    <p className="text-[11px] text-ink/50 mt-0.5">Mã: {biz.id} • Ngày tham gia: {biz.joinedDate}</p>
                  </td>
                  <td className="p-4 font-semibold text-ink/80">
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="size-3.5 text-forest shrink-0" />
                      {biz.ownerName}
                    </div>
                  </td>
                  <td className="p-4 text-ink/75 space-y-1">
                    <div className="flex items-center gap-1.5 font-mono">
                      <Phone className="size-3.5 text-clay shrink-0" />
                      {biz.phone}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="size-3.5 text-ink/40 shrink-0" />
                      {biz.email}
                    </div>
                  </td>
                  <td className="p-4 text-ink/70 max-w-xs">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="size-3.5 text-forest shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{biz.address}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-block rounded-xl bg-forest/10 px-3 py-1 font-extrabold text-forest text-sm">
                      {biz.commissionRate}%
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-[11px] font-bold">
                      <ShieldCheck className="size-3.5" /> Hoạt động
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
