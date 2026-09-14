import type { PaymentRecord, BookingRecord } from "@/lib/server-store";

export interface PaymentInitiateResult {
  paymentCode: string;
  qrUrl?: string;
  bankAccount?: {
    bankName: string;
    bankId: string;
    accountNumber: string;
    accountName: string;
  };
  checkoutUrl?: string;
  instructions: string;
}

export interface PaymentVerificationResult {
  verified: boolean;
  amount?: number;
  providerTransactionId?: string;
  paidAt?: string;
  error?: string;
}

export interface IPaymentProvider {
  readonly providerName: string;
  initiatePayment(payment: PaymentRecord, booking: BookingRecord): Promise<PaymentInitiateResult>;
  verifyPayment(payment: PaymentRecord, callbackPayload: any): Promise<PaymentVerificationResult>;
  processRefund(payment: PaymentRecord, amount: number, reason: string): Promise<{ success: boolean; error?: string }>;
}

// 1. VietQR Provider (Chuẩn Napas247 chuyển tiền nhanh)
export class VietQRProvider implements IPaymentProvider {
  readonly providerName = "vietqr";

  private defaultBank = {
    bankId: "VCB", // Vietcombank
    bankName: "Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)",
    accountNumber: "1028899889",
    accountName: "HTX DU LICH CONG DONG A LUOI"
  };

  async initiatePayment(payment: PaymentRecord, booking: BookingRecord): Promise<PaymentInitiateResult> {
    const memo = payment.paymentCode;
    // URL chuẩn sinh mã VietQR động
    const qrUrl = `https://img.vietqr.io/image/${this.defaultBank.bankId}-${this.defaultBank.accountNumber}-compact2.png?amount=${payment.amount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(this.defaultBank.accountName)}`;

    return {
      paymentCode: payment.paymentCode,
      qrUrl,
      bankAccount: this.defaultBank,
      instructions: `Vui lòng quét mã QR bằng ứng dụng ngân hàng hoặc chuyển khoản chính xác số tiền ${payment.amount.toLocaleString("vi-VN")} đ với nội dung: ${memo}`
    };
  }

  async verifyPayment(payment: PaymentRecord, callbackPayload: any): Promise<PaymentVerificationResult> {
    const receivedAmount = Number(callbackPayload.amount || callbackPayload.transferAmount || 0);
    const content = String(callbackPayload.content || callbackPayload.description || "");

    if (receivedAmount < payment.amount) {
      return {
        verified: false,
        amount: receivedAmount,
        error: `Số tiền thực nhận (${receivedAmount.toLocaleString("vi-VN")} đ) không khớp với số tiền đơn (${payment.amount.toLocaleString("vi-VN")} đ).`
      };
    }

    return {
      verified: true,
      amount: receivedAmount,
      providerTransactionId: callbackPayload.transactionId || callbackPayload.refNo || `VQR-${Date.now()}`,
      paidAt: new Date().toISOString()
    };
  }

  async processRefund(payment: PaymentRecord, amount: number, reason: string): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }
}

// 2. Chuyển khoản ngân hàng truyền thống (Bank Transfer)
export class BankTransferProvider implements IPaymentProvider {
  readonly providerName = "bank_transfer";

  private bank = {
    bankId: "BIDV",
    bankName: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam (BIDV)",
    accountNumber: "55110002345678",
    accountName: "BAN QUAN TRI CHAM A LUOI"
  };

  async initiatePayment(payment: PaymentRecord, booking: BookingRecord): Promise<PaymentInitiateResult> {
    return {
      paymentCode: payment.paymentCode,
      bankAccount: this.bank,
      instructions: `Chuyển khoản tới số tài khoản ${this.bank.accountNumber} (${this.bank.bankName}) - Chủ tài khoản: ${this.bank.accountName}. Nội dung chuyển tiền: ${payment.paymentCode}`
    };
  }

  async verifyPayment(payment: PaymentRecord, callbackPayload: any): Promise<PaymentVerificationResult> {
    const receivedAmount = Number(callbackPayload.amount || 0);
    if (receivedAmount < payment.amount) {
      return { verified: false, error: "Số tiền chuyển khoản không đủ." };
    }
    return {
      verified: true,
      amount: receivedAmount,
      providerTransactionId: callbackPayload.transactionId || `BT-${Date.now()}`,
      paidAt: new Date().toISOString()
    };
  }

  async processRefund(payment: PaymentRecord, amount: number, reason: string): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }
}

// 3. Thanh toán tiền mặt tại điểm / khi giao hàng (COD)
export class CodProvider implements IPaymentProvider {
  readonly providerName = "cod";

  async initiatePayment(payment: PaymentRecord, booking: BookingRecord): Promise<PaymentInitiateResult> {
    return {
      paymentCode: payment.paymentCode,
      instructions: "Quý khách thanh toán tiền mặt trực tiếp cho nhân viên phụ trách tại điểm đến hoặc khi nhận hàng đặc sản."
    };
  }

  async verifyPayment(payment: PaymentRecord, callbackPayload: any): Promise<PaymentVerificationResult> {
    const receivedAmount = Number(callbackPayload.amount || payment.amount);
    return {
      verified: true,
      amount: receivedAmount,
      providerTransactionId: `COD-${Date.now()}`,
      paidAt: new Date().toISOString()
    };
  }

  async processRefund(payment: PaymentRecord, amount: number, reason: string): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }
}

// 4. Payment Gateway Adapter (MoMo, VNPAY, ZaloPay...)
export class GatewayProvider implements IPaymentProvider {
  readonly providerName = "gateway";

  async initiatePayment(payment: PaymentRecord, booking: BookingRecord): Promise<PaymentInitiateResult> {
    const checkoutUrl = `/payment/${payment.id}?gateway=online`;
    return {
      paymentCode: payment.paymentCode,
      checkoutUrl,
      instructions: "Hệ thống đang chuyển hướng bạn tới cổng thanh toán an toàn trực tuyến."
    };
  }

  async verifyPayment(payment: PaymentRecord, callbackPayload: any): Promise<PaymentVerificationResult> {
    // Giả lập verify chữ ký HMAC và số tiền
    const signature = callbackPayload.signature;
    const receivedAmount = Number(callbackPayload.amount || 0);

    if (receivedAmount < payment.amount) {
      return { verified: false, error: "Số tiền từ cổng thanh toán không khớp." };
    }

    return {
      verified: true,
      amount: receivedAmount,
      providerTransactionId: callbackPayload.gatewayTransId || `GW-${Date.now()}`,
      paidAt: new Date().toISOString()
    };
  }

  async processRefund(payment: PaymentRecord, amount: number, reason: string): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }
}

// Factory quản lý Provider Abstraction
export class PaymentProviderFactory {
  private static providers: Record<string, IPaymentProvider> = {
    qr: new VietQRProvider(),
    vietqr: new VietQRProvider(),
    bank_transfer: new BankTransferProvider(),
    cod: new CodProvider(),
    gateway: new GatewayProvider()
  };

  static getProvider(methodOrName: string): IPaymentProvider {
    const normalized = (methodOrName || "qr").toLowerCase();
    return this.providers[normalized] || this.providers.qr;
  }
}
