import { getAllVouchers, getAllLeads } from "@/lib/server-store";
import { CheckCircle2, Clock, Gift, Ticket } from "lucide-react";

export const dynamic = "force-dynamic";

export default function AdminVouchersPage() {
  const vouchers = getAllVouchers();
  const leads = getAllLeads();

  const leadsMap = new Map(leads.map((l) => [l.voucherCode, l]));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">Kho Voucher & Mã Ưu Đãi</h1>
          <p className="text-xs text-ink/60 mt-1">
            Theo dõi tình trạng sử dụng mã giảm giá phát hành cho du khách Chạm A Lưới
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-2xl bg-forest/10 px-3.5 py-2 text-xs font-bold text-forest">
            {vouchers.length} Voucher đã cấp
          </span>
          <span className="rounded-2xl bg-emerald-100 px-3.5 py-2 text-xs font-bold text-emerald-800">
            {vouchers.filter((v) => v.status === "used").length} Đã sử dụng
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-card border border-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-forest/5 text-ink/70 font-bold uppercase tracking-wider border-b border-black/5">
              <tr>
                <th className="p-4">Mã Voucher</th>
                <th className="p-4">Địa điểm áp dụng</th>
                <th className="p-4">Nội dung ưu đãi</th>
                <th className="p-4">Khách hàng (Lead ID)</th>
                <th className="p-4">Thời hạn</th>
                <th className="p-4 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {vouchers.map((v) => {
                const lead = leadsMap.get(v.voucherCode);
                const isUsed = v.status === "used";

                return (
                  <tr key={v.voucherCode} className="hover:bg-beige/40 transition">
                    <td className="p-4">
                      <span className="font-mono font-black text-forest text-sm bg-forest/10 px-2.5 py-1 rounded-lg inline-block">
                        {v.voucherCode}
                      </span>
                    </td>
                    <td className="p-4">
                      <p className="font-extrabold text-ink">{v.placeName}</p>
                    </td>
                    <td className="p-4 max-w-xs">
                      <p className="font-semibold text-ink/80 flex items-center gap-1">
                        <Gift className="size-3.5 text-clay shrink-0" />
                        {v.discountOffer}
                      </p>
                    </td>
                    <td className="p-4">
                      {lead ? (
                        <div>
                          <p className="font-bold text-ink">{lead.customerName}</p>
                          <p className="text-[11px] text-ink/50 font-mono">{lead.leadId}</p>
                        </div>
                      ) : (
                        <span className="text-ink/40">Khách vãng lai</span>
                      )}
                    </td>
                    <td className="p-4 text-ink/65">
                      <div className="flex items-center gap-1.5">
                        <Clock className="size-3.5 text-ink/40" />
                        <span>{v.startDate} → {v.expiresAt}</span>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {isUsed ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-[11px] font-bold">
                          <CheckCircle2 className="size-3" /> Đã sử dụng
                        </span>
                      ) : (
                        <span className="inline-block rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-[11px] font-bold">
                          Chưa dùng
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
