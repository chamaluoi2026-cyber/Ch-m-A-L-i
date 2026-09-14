import { getTransactionsByBusiness } from "@/lib/server-store";
import { CheckCircle2, Clock, DollarSign, TrendingUp } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function BusinessTransactionsPage() {
  const currentBusinessId = "biz-a-nor";
  const transactions = getTransactionsByBusiness(currentBusinessId);

  const totalRevenue = transactions.reduce((acc, t) => acc + t.orderValue, 0);
  const totalCommissionDue = transactions
    .filter((t) => t.status === "pending_reconciliation")
    .reduce((acc, t) => acc + t.commissionAmount, 0);
  const totalCommissionPaid = transactions
    .filter((t) => t.status === "reconciled")
    .reduce((acc, t) => acc + t.commissionAmount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">Giao dịch & Hoa hồng Cần thanh toán</h1>
          <p className="text-xs text-ink/60 mt-1">
            Minh bạch từng hóa đơn du khách sử dụng voucher và mức hoa hồng 10% gửi lại nền tảng
          </p>
        </div>
        <Link
          href="/business/vouchers"
          className="rounded-xl bg-forest px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-forest/90 transition"
        >
          + Thêm giao dịch mới
        </Link>
      </div>

      {/* Summary Banner */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-white p-5 shadow-card border border-black/5">
          <p className="text-xs font-bold uppercase tracking-wider text-ink/50">Tổng doanh thu thực tế</p>
          <p className="mt-2 text-2xl font-black text-ink">
            {totalRevenue.toLocaleString("vi-VN")} <span className="text-sm font-normal text-ink/40">đ</span>
          </p>
          <p className="mt-1 text-xs text-ink/50">{transactions.length} giao dịch qua Chạm A Lưới</p>
        </div>

        <div className="rounded-3xl bg-[#16211E] p-5 text-white shadow-card">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-300">Hoa hồng cần thanh toán</p>
          <p className="mt-2 text-2xl font-black text-amber-300">
            {totalCommissionDue.toLocaleString("vi-VN")} <span className="text-sm font-normal text-white/60">đ</span>
          </p>
          <p className="mt-1 text-xs text-white/70">Đang chờ đối soát chốt tháng</p>
        </div>

        <div className="rounded-3xl bg-forest p-5 text-white shadow-card">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">Hoa hồng đã quyết toán</p>
          <p className="mt-2 text-2xl font-black">
            {totalCommissionPaid.toLocaleString("vi-VN")} <span className="text-sm font-normal text-white/60">đ</span>
          </p>
          <p className="mt-1 text-xs text-emerald-100/70">Đã hoàn tất thanh toán cho ban quản trị</p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl bg-white shadow-card border border-black/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-forest/5 text-ink/70 font-bold uppercase tracking-wider border-b border-black/5">
              <tr>
                <th className="p-4">Mã GD</th>
                <th className="p-4">Mã Voucher</th>
                <th className="p-4">Dịch vụ tại</th>
                <th className="p-4 text-right">Tổng hóa đơn</th>
                <th className="p-4 text-center">Tỷ lệ</th>
                <th className="p-4 text-right">Hoa hồng phải nộp</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4">Thời gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-ink/50">
                    Chưa có giao dịch voucher nào được xác nhận.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-beige/40">
                    <td className="p-4 font-mono font-bold text-ink">{tx.id}</td>
                    <td className="p-4">
                      <span className="font-mono font-bold text-forest bg-forest/10 px-2 py-0.5 rounded">
                        {tx.voucherCode}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-ink">{tx.placeName}</td>
                    <td className="p-4 text-right font-extrabold text-ink text-sm">
                      {tx.orderValue.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="p-4 text-center font-bold text-ink/70">{tx.commissionRate}%</td>
                    <td className="p-4 text-right font-black text-clay text-sm">
                      {tx.commissionAmount.toLocaleString("vi-VN")}đ
                    </td>
                    <td className="p-4 text-center">
                      {tx.status === "reconciled" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-2.5 py-0.5 text-[11px] font-bold">
                          <CheckCircle2 className="size-3" /> Đã quyết toán
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-800 px-2.5 py-0.5 text-[11px] font-bold">
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
