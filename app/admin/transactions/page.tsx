import { getAllTransactions } from "@/lib/server-store";
import { CheckCircle2, Clock, DollarSign, Download, FileCheck } from "lucide-react";
import Link from "next/link";
import { ExportExcelDropdown } from "@/components/admin/export-excel-dropdown";

export const dynamic = "force-dynamic";

export default function AdminTransactionsPage() {
  const transactions = getAllTransactions();
  const totalRevenue = transactions.reduce((acc, t) => acc + t.orderValue, 0);
  const totalCommission = transactions.reduce((acc, t) => acc + t.commissionAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">Nhật ký Giao dịch Dịch vụ</h1>
          <p className="text-xs text-ink/60 mt-1">
            Giao dịch phát sinh khi du khách sử dụng voucher tại các cơ sở trên địa bàn A Lưới
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportExcelDropdown type="transactions" className="mr-1" />
          <div className="text-right">
            <p className="text-[10px] uppercase font-bold text-ink/40">Tổng doanh thu</p>
            <p className="text-base font-black text-ink">{totalRevenue.toLocaleString("vi-VN")}đ</p>
          </div>
          <div className="text-right pl-3 border-l border-black/10">
            <p className="text-[10px] uppercase font-bold text-forest">Tổng hoa hồng</p>
            <p className="text-base font-black text-forest">{totalCommission.toLocaleString("vi-VN")}đ</p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-card border border-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-forest/5 text-ink/70 font-bold uppercase tracking-wider border-b border-black/5">
              <tr>
                <th className="p-4">Mã Giao dịch</th>
                <th className="p-4">Mã Voucher / Lead</th>
                <th className="p-4">Cơ sở & Địa điểm</th>
                <th className="p-4 text-right">Giá trị hóa đơn</th>
                <th className="p-4 text-center">Tỷ lệ</th>
                <th className="p-4 text-right">Tiền hoa hồng</th>
                <th className="p-4 text-center">Trạng thái đối soát</th>
                <th className="p-4">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-ink/50">
                    Chưa có giao dịch nào được ghi nhận.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-beige/40 transition">
                    <td className="p-4 font-mono font-bold text-ink">{tx.id}</td>
                    <td className="p-4">
                      <span className="font-mono font-bold text-forest bg-forest/10 px-2 py-0.5 rounded">
                        {tx.voucherCode}
                      </span>
                      <p className="font-mono text-[10px] text-ink/40 mt-1">{tx.leadId}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-extrabold text-ink">{tx.businessName}</p>
                      <p className="text-[11px] text-ink/50">{tx.placeName}</p>
                    </td>
                    <td className="p-4 text-right font-extrabold text-ink text-sm">
                      {tx.orderValue.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="p-4 text-center">
                      <span className="rounded-md bg-beige px-2 py-0.5 font-bold text-ink/80">
                        {tx.commissionRate}%
                      </span>
                    </td>
                    <td className="p-4 text-right font-black text-clay text-sm">
                      +{tx.commissionAmount.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="p-4 text-center">
                      {tx.status === "reconciled" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-1 text-[11px] font-bold">
                          <CheckCircle2 className="size-3" /> Đã đối soát
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2.5 py-1 text-[11px] font-bold">
                          <Clock className="size-3" /> Chờ đối soát
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-ink/50 text-[11px]">
                      {new Date(tx.confirmedAt).toLocaleDateString("vi-VN")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
