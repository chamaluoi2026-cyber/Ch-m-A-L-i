"use server";

import {
  confirmVoucherTransaction,
  getAllTransactions,
  getTransactionsByBusiness,
  reconcileTransaction,
  getVoucherByCode
} from "@/lib/server-store";
import { revalidatePath } from "next/cache";

export async function checkVoucherAction(code: string) {
  const voucher = getVoucherByCode(code);
  if (!voucher) {
    return { success: false, error: "Mã voucher không tồn tại." };
  }
  return { success: true, voucher };
}

export async function confirmVoucherAction(params: {
  voucherCode: string;
  orderValue: number;
  businessId?: string;
  note?: string;
}) {
  if (!params.voucherCode || !params.orderValue || params.orderValue <= 0) {
    return { success: false, error: "Vui lòng nhập đúng mã voucher và giá trị đơn hàng (> 0đ)." };
  }

  const result = confirmVoucherTransaction(params);

  if (result.success) {
    revalidatePath("/business/vouchers");
    revalidatePath("/business/transactions");
    revalidatePath("/admin/vouchers");
    revalidatePath("/admin/transactions");
    revalidatePath("/admin/commissions");
    revalidatePath("/admin");
    return { success: true, transaction: result.transaction, message: result.message };
  }

  return { success: false, error: result.message };
}

export async function reconcileTransactionAction(transactionId: string) {
  const ok = reconcileTransaction(transactionId);
  if (ok) {
    revalidatePath("/admin/commissions");
    revalidatePath("/admin/transactions");
    revalidatePath("/admin");
    return { success: true };
  }
  return { success: false, error: "Không tìm thấy giao dịch." };
}

export async function fetchAllTransactionsAction() {
  return getAllTransactions();
}

export async function fetchBusinessTransactionsAction(businessId: string) {
  return getTransactionsByBusiness(businessId);
}
