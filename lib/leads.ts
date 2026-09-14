import type { Place } from "@/data/places";

export type LeadStatus =
  | "new"
  | "contacted"
  | "consulting"
  | "converted"
  | "unsuccessful"
  | "voucher_used"
  | "expired"
  | "cancelled";

export type LeadLossReason =
  | "unreachable"
  | "plan_changed"
  | "price_unfit"
  | "fully_booked"
  | "chose_competitor"
  | "other";

export type LeadSource =
  | "WEBSITE"
  | "FACEBOOK"
  | "TIKTOK"
  | "ZALO"
  | "DIRECT"
  | "OTHER";

export type VoucherStatus = "unused" | "used" | "expired";

export type LeadTimelineEvent = {
  id: string;
  stage:
    | "lead_created"
    | "admin_contacted"
    | "assigned_business"
    | "business_contacted"
    | "customer_consulted"
    | "booking_created"
    | "completed"
    | "unsuccessful"
    | "note_added";
  title: string;
  description: string;
  actor: {
    id: string;
    name: string;
    role: string;
  };
  timestamp: string;
  metadata?: Record<string, any>;
};

export type LeadNote = {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
};

export type LeadPayload = {
  placeSlug: string;
  placeName: string;
  businessName?: string;
  businessId?: string;
  customerId?: string;
  customerName: string;
  phone: string;
  email?: string;
  zalo?: string;
  expectedDate: string;
  preferredTime?: string;
  guests: number;
  need: string;
  serviceOrTour?: string;
  budget?: string;
  customerNote?: string;
  source?: LeadSource;
  campaign?: string;
  landingPage?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  consent?: boolean;
  userId?: string;
};

export type Voucher = {
  voucherCode: string;
  discountOffer: string;
  startDate: string;
  expiresAt: string;
  placeSlug: string;
  placeName: string;
  status: VoucherStatus;
  leadId: string;
  usedAt?: string;
};

export type LeadRecord = {
  leadId: string;
  voucherCode: string;
  placeSlug: string;
  placeName: string;
  businessName: string;
  businessId?: string;
  customerId?: string;
  customerName: string;
  phone: string;
  email?: string;
  zalo?: string;
  expectedDate: string;
  preferredTime?: string;
  guests: number;
  need: string;
  serviceOrTour?: string;
  budget?: string;
  customerNote?: string;
  source?: LeadSource;
  campaign?: string;
  landingPage?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  assignedBusinessId?: string;
  assignedBusinessName?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  lastContactAt?: string;
  nextFollowUpAt?: string;
  status: LeadStatus;
  lossReason?: LeadLossReason;
  lossNote?: string;
  convertedBookingId?: string;
  convertedAt?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  timeline?: LeadTimelineEvent[];
  notes?: LeadNote[];
  userId?: string;
  createdAt: string;
  updatedAt: string;
};

export type TransactionRecord = {
  id: string;
  leadId: string;
  voucherCode: string;
  placeSlug: string;
  placeName: string;
  businessName: string;
  businessId?: string;
  orderValue: number;
  commissionRate: number;
  commissionAmount: number;
  confirmedAt: string;
  status: "reconciled" | "pending_reconciliation";
  note?: string;
};

export function createLeadCode(date?: Date): string {
  const d = date || new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const randomSeq = Math.floor(1000 + Math.random() * 9000);
  return "LEAD-AL-" + yyyy + mm + dd + "-" + randomSeq;
}

export function createVoucherCode(): string {
  const number = Math.floor(10000 + Math.random() * 90000);
  return "CAL-VCH-" + number;
}

export function calculateCommission(orderValue: number, commissionRate: number): number {
  return Math.round((orderValue * commissionRate) / 100);
}

export function getCommissionAmount(orderValue: number, place: Place): number {
  return calculateCommission(orderValue, place.commissionRate);
}
