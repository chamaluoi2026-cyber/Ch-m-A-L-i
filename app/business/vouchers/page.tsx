"use client";

import { useEffect, useState } from "react";
import { checkVoucherAction, confirmVoucherAction } from "@/app/actions/transactions";
import { fetchBusinessLeadsAction } from "@/app/actions/leads";
import type { Voucher } from "@/lib/leads";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
  Gift,
  Search,
  Sparkles,
  Ticket,
  TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function BusinessVouchersPage() {
  const currentBusinessId = "biz-a-nor";
  const commissionRate = 10; // 10% for HTX A Nor

  const [inputCode, setInputCode] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkedVoucher, setCheckedVoucher] = useState<Voucher | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  // Form input for confirming
  const [orderValue, setOrderValue] = useState<number>(500000);
  const [note, setNote] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [confirmedTransaction, setConfirmedTransaction] = useState<any>(null);

  async function handleCheck(e: React.FormEvent) {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setChecking(true);
    setCheckError(null);
    setCheckedVoucher(null);
    setSuccessMessage(null);
    setConfirmedTransaction(null);

    const res = await checkVoucherAction(inputCode.trim());
    setChecking(false);

    if (res.success && res.voucher) {
      setCheckedVoucher(res.voucher);
    } else {
      setCheckError(res.error || "Không tìm thấy mã voucher này trong hệ thống.");
    }
  }

  async function handleConfirm() {
    if (!checkedVoucher) return;
    if (orderValue <= 0) {
      alert("Vui lòng nhập giá trị đơn hàng lớn hơn 0đ.");
      return;
    }

    setConfirming(true);
    const res = await confirmVoucherAction({
      voucherCode: checkedVoucher.voucherCode,
      orderValue,
      businessId: currentBusinessId,
      note: note || "Khách sử dụng dịch vụ tại cơ sở"
    });
    setConfirming(false);

    if (res.success && res.transaction) {
      setSuccessMessage("Xác nhận voucher thành công! Giao dịch đối soát đã được lưu vào hệ thống.");
      setConfirmedTransaction(res.transaction);
      setCheckedVoucher((prev) => (prev ? { ...prev, status: "used" } : null));
    } else {
      alert(res.error || "Không thể xác nhận voucher.");
    }
  }

  const calculatedCommission = Math.round((orderValue * commissionRate) / 100);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-black text-ink">Xác nhận Khách Dùng Voucher & Hóa Đơn</h1>
        <p className="text-xs text-ink/60 mt-1">
          Nhập mã voucher do du khách xuất trình để xác thực ưu đãi, nhập doanh số hóa đơn và tự động tính hoa hồng đối soát
        </p>
      </div>

      {/* Main Action Tool Card */}
      <div className="rounded-3xl bg-white p-6 md:p-8 shadow-card border border-black/5">
        <h2 className="text-lg font-extrabold text-ink flex items-center gap-2">
          <Ticket className="size-5 text-forest" />
          Bước 1: Tra cứu & Thẩm định Mã Voucher
        </h2>
        <p className="text-xs text-ink/60 mt-1">
          Nhập mã voucher khách cung cấp (ví dụ: <code className="bg-beige px-1.5 py-0.5 rounded font-bold font-mono">CAL-VCH-59412</code> hoặc <code className="bg-beige px-1.5 py-0.5 rounded font-bold font-mono">CAL-VCH-34109</code>)
        </p>

        <form onSubmit={handleCheck} className="mt-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <input
              type="text"
              placeholder="Nhập mã CAL-VCH-XXXXX..."
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 rounded-2xl bg-beige/60 font-mono text-sm font-bold text-ink uppercase focus:outline-none focus:ring-2 focus:ring-forest"
              required
            />
          </div>
          <Button type="submit" size="lg" disabled={checking} className="px-6 font-bold">
            {checking ? "Đang kiểm tra..." : "Kiểm tra mã"}
          </Button>
        </form>

        {checkError ? (
          <div className="mt-4 rounded-2xl bg-red-50 p-4 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            {checkError}
          </div>
        ) : null}

        {/* Voucher Info Panel */}
        {checkedVoucher ? (
          <div className="mt-6 rounded-3xl border-2 border-dashed border-forest/30 bg-forest/5 p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-ink/50">Mã voucher hợp lệ:</span>
                <p className="text-2xl font-black font-mono text-forest">{checkedVoucher.voucherCode}</p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  checkedVoucher.status === "used"
                    ? "bg-gray-200 text-gray-700"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {checkedVoucher.status === "used" ? "ĐÃ SỬ DỤNG" : "HỢP LỆ (CHƯA DÙNG)"}
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 text-xs">
              <div className="rounded-xl bg-white p-3.5 shadow-sm">
                <p className="text-ink/50 font-semibold">Ưu đãi áp dụng:</p>
                <p className="font-extrabold text-ink mt-0.5 text-sm">🎁 {checkedVoucher.discountOffer}</p>
              </div>
              <div className="rounded-xl bg-white p-3.5 shadow-sm">
                <p className="text-ink/50 font-semibold">Địa điểm áp dụng:</p>
                <p className="font-extrabold text-ink mt-0.5 text-sm">{checkedVoucher.placeName}</p>
              </div>
            </div>

            {checkedVoucher.status === "used" ? (
              <div className="rounded-2xl bg-amber-50 p-4 border border-amber-200 text-xs text-amber-900 font-semibold">
                ⚠️ Voucher này đã được xác nhận sử dụng trước đó. Không thể áp dụng thêm lần nữa.
              </div>
            ) : (
              /* Step 2: Confirm order value & Calculate Commission */
              <div className="mt-6 pt-6 border-t border-forest/20 space-y-4">
                <h3 className="text-base font-extrabold text-ink flex items-center gap-2">
                  <DollarSign className="size-5 text-clay" />
                  Bước 2: Nhập Hóa Đơn & Xác Nhận Giao Dịch
                </h3>
                <p className="text-xs text-ink/60">
                  Nhập tổng số tiền khách thanh toán thực tế (sau khi đã trừ voucher ưu đãi)
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="grid gap-1.5 text-xs font-bold text-ink">
                    Tổng tiền hóa đơn thực tế (VNĐ) <span className="text-red-500">*</span>
                    <input
                      type="number"
                      min={10000}
                      step={10000}
                      value={orderValue}
                      onChange={(e) => setOrderValue(Number(e.target.value) || 0)}
                      className="px-4 py-2.5 rounded-xl border border-black/10 text-sm font-black text-ink font-mono focus:ring-1 focus:ring-forest"
                    />
                  </label>

                  <label className="grid gap-1.5 text-xs font-bold text-ink">
                    Ghi chú món ăn / dịch vụ đã dùng
                    <input
                      type="text"
                      placeholder="Ví dụ: Mâm cơm gà nướng + tắm suối"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="px-4 py-2.5 rounded-xl border border-black/10 text-xs text-ink focus:ring-1 focus:ring-forest"
                    />
                  </label>
                </div>

                {/* Calculation breakdown */}
                <div className="rounded-2xl bg-white p-4 shadow-sm border border-forest/15 grid gap-3 sm:grid-cols-3 text-xs">
                  <div>
                    <span className="text-ink/50">Hóa đơn:</span>
                    <p className="font-extrabold text-ink text-sm mt-0.5">{orderValue.toLocaleString("vi-VN")}đ</p>
                  </div>
                  <div>
                    <span className="text-ink/50">Tỷ lệ hoa hồng thỏa thuận:</span>
                    <p className="font-extrabold text-forest text-sm mt-0.5">{commissionRate}%</p>
                  </div>
                  <div>
                    <span className="text-amber-700 font-semibold">Hoa hồng website ghi nhận:</span>
                    <p className="font-black text-clay text-base mt-0.5">
                      {calculatedCommission.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  size="lg"
                  disabled={confirming || orderValue <= 0}
                  onClick={handleConfirm}
                  className="w-full text-base font-extrabold bg-forest hover:bg-forest/90 text-white"
                >
                  {confirming ? "Đang ghi nhận..." : "Xác nhận đã dùng Voucher & Tạo bản ghi đối soát"}
                </Button>
              </div>
            )}
          </div>
        ) : null}

        {/* Success Confirmation Panel */}
        {confirmedTransaction ? (
          <div className="mt-6 rounded-3xl bg-emerald-50 border border-emerald-300 p-6 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-base">
              <CheckCircle2 className="size-5 text-emerald-600" />
              Giao dịch đã được ghi nhận vào đối soát thành công!
            </div>
            <div className="text-xs text-emerald-900 grid gap-2 sm:grid-cols-3 bg-white/70 p-3.5 rounded-xl">
              <div>
                <span className="text-ink/50">Mã giao dịch:</span>
                <p className="font-mono font-bold">{confirmedTransaction.id}</p>
              </div>
              <div>
                <span className="text-ink/50">Hóa đơn:</span>
                <p className="font-bold">{confirmedTransaction.orderValue.toLocaleString("vi-VN")}đ</p>
              </div>
              <div>
                <span className="text-ink/50">Tiền hoa hồng:</span>
                <p className="font-bold text-clay">{confirmedTransaction.commissionAmount.toLocaleString("vi-VN")}đ</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
