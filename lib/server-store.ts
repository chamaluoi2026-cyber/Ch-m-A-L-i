import fs from "fs";
import path from "path";
import type { LeadRecord, Voucher, TransactionRecord, LeadPayload, LeadStatus, LeadTimelineEvent } from "@/lib/leads";
import { createLeadCode, createVoucherCode, calculateCommission } from "@/lib/leads";
import { places, type PlaceCategory, type Place } from "@/data/places";

export type BusinessRecord = {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  email: string;
  zaloUrl: string;
  address: string;
  commissionRate: number;
  status: "active" | "pending" | "paused";
  joinedDate: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
};

export type NotificationRecord = {
  id: string;
  title: string;
  content: string;
  type: "lead" | "voucher" | "transaction" | "system";
  createdAt: string;
  isRead: boolean;
  link?: string;
};

export type SystemUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: "SUPER_ADMIN" | "ADMIN" | "CONTENT_MANAGER" | "SALES" | "FINANCE" | "SUPPORT" | "BUSINESS" | "CUSTOMER" | "customer" | "business" | "admin";
  businessId?: string;
  createdAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
};

export type SystemAssetRecord = {
  id: string;
  name: string;
  url: string;
  note: string;
  createdAt: string;
};

export type ChatMessage = {
  id: string;
  role: "guest" | "staff";
  text: string;
  createdAt: string;
};

export type ChatSession = {
  id: string;
  guestName: string;
  guestPhone?: string;
  lastMessage: string;
  updatedAt: string;
  unreadByAdmin?: boolean;
  messages: ChatMessage[];
};

export type TeamMemberItem = {
  id: string;
  name: string;
  role: string;
  avatar: string;
  bio: string;
};

export type CoreValueItem = {
  title: string;
  text: string;
};

export type SiteSettings = {
  logo?: string;
  logoDark?: string;
  logoMobile?: string;
  logoHeight?: number;
  logoWidth?: number;
  logoScale?: number;
  favicon?: string;
  heroImage?: string;
  aboutHeroImage?: string;
  contactAddress?: string;
  contactPhone?: string;
  contactEmail?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  zaloUrl?: string;
  footerDescription?: string;
  announcement?: string;

  // Cấu hình Banner Hero Trang Chủ (Homepage Hero)
  heroBadge?: string;
  heroBadgeEn?: string;
  heroTitleLine1?: string;
  heroTitleLine1En?: string;
  heroTitleLine2?: string;
  heroTitleLine2En?: string;
  heroDescription?: string;
  heroDescriptionEn?: string;
  heroPrimaryBtnText?: string;
  heroPrimaryBtnTextEn?: string;
  heroPrimaryBtnLink?: string;
  heroSecondaryBtnText?: string;
  heroSecondaryBtnTextEn?: string;
  heroSecondaryBtnLink?: string;
  heroOverlayOpacity?: number;

  // Cấu hình Layer Giữa (Khung Chữ / Middle Card Layer)
  heroPosition?: "top" | "center" | "bottom";
  heroCardStyle?: "crystal" | "frosted" | "radial" | "gradient" | "custom" | "none";
  heroCardColor?: string;
  heroCardOpacity?: number;
  heroCardBlur?: "none" | "sm" | "md" | "lg" | "xl";

  // Cấu hình Trang Giới thiệu (/about) & Đội ngũ thực hiện
  aboutBadge?: string;
  aboutTitle?: string;
  aboutSubtitle?: string;
  aboutCommitment1?: string;
  aboutCommitment2?: string;
  aboutCoreValues?: CoreValueItem[];
  aboutTeamMembers?: TeamMemberItem[];
  aboutImpactTitle?: string;
  aboutImpactItems?: string[];
  aboutPartnersTitle?: string;
  aboutPartnersText?: string;

  // Cấu hình Tài khoản Ngân hàng nhận tiền VietQR
  bankId?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankAccountName?: string;
  qrTemplate?: string;

  // Cấu hình Thông báo tức thì (Telegram)
  telegramEnabled?: boolean;
  telegramBotToken?: string;
  telegramChatId?: string;
  notificationEmail?: string;
  emailNotificationEnabled?: boolean;

  // Cấu hình Trí tuệ nhân tạo (Google Gemini)
  geminiApiKey?: string;

  updatedAt?: string;
};

export type BlogContentBlock =
  | { id: string; type: "paragraph"; content: string; align?: "left" | "center" | "right" }
  | { id: string; type: "heading"; level: 2 | 3; content: string }
  | { id: string; type: "image"; url: string; caption?: string; alt?: string; width?: "sm" | "md" | "lg" | "full"; align?: "left" | "center" | "right" }
  | { id: string; type: "gallery"; images: { id: string; url: string; caption?: string }[]; layout?: "grid-2" | "grid-3" | "slider" }
  | { id: string; type: "quote"; content: string; author?: string }
  | { id: string; type: "divider" }
  | { id: string; type: "list"; style: "bullet" | "number"; items: string[] }
  | { id: string; type: "code"; code: string; language?: string }
  | { id: string; type: "video"; url: string; caption?: string; provider?: "youtube" | "tiktok" | "facebook" | "vimeo" | "direct"; aspectRatio?: "16/9" | "9/16" };

export type BlogPostRecord = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  status: "draft" | "published" | "hidden";
  date: string;
  readingTime: string;
  image: string;
  videoUrl?: string; // Video giới thiệu / tiêu điểm bài viết
  seoTitle?: string;
  seoDescription?: string;
  blocks: BlogContentBlock[];
  content?: string;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
};


export type PlaceGalleryItem = {
  url: string;
  alt?: string;
  caption?: string;
};

export type PlaceFAQItem = {
  question: string;
  answer: string;
};

export type PlaceRecord = {
  id: string;
  slug: string;
  slugAliases?: string[];
  name: string;
  category: string;
  summary: string;
  description: string;
  status: "active" | "temporarily_closed" | "hidden";
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;

  // Images
  image: string;
  coverImage?: string;
  imageAlt?: string;
  gallery: (string | PlaceGalleryItem)[];
  videoUrl?: string; // Video giới thiệu địa điểm (YouTube/Vimeo/MP4)

  // Pricing & Services
  priceLabel: string;
  priceMin?: number;
  priceMax?: number;
  priceUnit?: string;
  voucherOffer: string;
  voucherTerms?: string;
  openingHours: string;
  duration?: string;
  maxGuests?: string;

  // Provider
  businessName: string;
  businessId?: string;
  phone: string;
  zaloUrl: string;
  email?: string;
  website?: string;
  businessAddress?: string;

  // Location & Map
  address: string;
  lat?: number;
  lng?: number;
  mapEmbedUrl: string;
  directions?: string;

  // Commission & Partner
  commissionRate: number;
  commissionType?: "booking" | "voucher" | "fixed";
  auditStatus?: "pending" | "reconciled" | "active";

  // Content Details
  highlights: string[];
  activities: string[];
  services: string[];
  safetyNotes: string[];
  suitableFor?: string[];
  faq?: PlaceFAQItem[];

  // SEO
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  ogImage?: string;

  // Ratings & Metadata
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
};


export type BookingType = "tour" | "homestay" | "product";
export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type PaymentMethod = "vietqr" | "bank_transfer" | "cash_on_delivery";
export type PaymentStatus = "unpaid" | "paid" | "partially_paid" | "refunded" | "failed" | "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED" | "PARTIALLY_REFUNDED";

export type BookingTimelineEvent = {
  id: string;
  stage: "created" | "confirmed" | "paid" | "partially_paid" | "completed" | "cancelled" | "refunded" | "note_added";
  title: string;
  description: string;
  actor: { id: string; name: string; role: string };
  timestamp: string;
  metadata?: Record<string, any>;
};

export type BookingRecord = {
  id: string; // Booking ID
  leadId?: string; // Lead ID
  customerId?: string; // Customer ID
  userId?: string;
  businessId?: string; // Business ID
  businessName: string;
  placeId?: string; // Place ID
  serviceOrTourId?: string; // Service/Tour ID
  itemTitle: string;
  itemId?: string;
  itemSlug?: string;
  type: BookingType;

  customerName: string;
  phone: string;
  email?: string;

  bookingDate: string; // Ngày đặt
  experienceDate: string; // Ngày trải nghiệm (startDate)
  startDate?: string;
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  experienceTime?: string; // Khung giờ
  numberOfPeople: number; // Số người / số lượng (quantity)
  quantity: number;

  unitPrice: number; // Đơn giá
  subtotal: number; // Tạm tính (totalAmount)
  totalAmount: number;
  discount: number; // Giảm giá (discountAmount)
  discountAmount?: number;
  voucher?: string; // Mã voucher (voucherCode)
  voucherCode?: string;
  finalAmount: number; // Tổng thanh toán sau giảm

  paymentStatus: PaymentStatus; // CHƯA THANH TOÁN, ĐÃ THANH TOÁN, THANH TOÁN MỘT PHẦN, HOÀN TIỀN, THANH TOÁN THẤT BẠI
  paymentMethod: PaymentMethod;
  paidAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  paymentReceiptUrl?: string; // Ảnh chụp màn hình / Biên lai chuyển khoản của khách
  paymentProofUploadedAt?: string; // Thời gian khách tải biên lai
  bankRefCode?: string; // Mã giao dịch ngân hàng / Ref No

  bookingStatus: BookingStatus; // CHỜ XÁC NHẬN, ĐÃ XÁC NHẬN, ĐÃ HOÀN THÀNH, ĐÃ HỦY
  status: BookingStatus;

  commissionRate: number; // Tỷ lệ hoa hồng
  commissionAmount: number; // Tiền hoa hồng

  customerNote?: string; // Ghi chú của khách
  notes?: string;
  businessNote?: string; // Ghi chú điều hành cơ sở
  deliveryAddress?: string;

  source?: string;
  campaign?: string;
  idempotencyKey?: string; // Chống duplicate
  timeline?: BookingTimelineEvent[];
  itineraryDetails?: any; // Chi tiết lịch trình AI/tour riêng (ngày, điểm dừng, homestay)
  metadata?: Record<string, any>;

  createdAt: string;
  updatedAt: string;
};

export type ReviewStatus = "pending" | "approved" | "rejected" | "hidden";

export type ReviewRecord = {
  id: string;
  bookingId: string;
  customerId: string;
  placeId: string;
  placeSlug?: string;
  placeName: string;
  businessId?: string;
  businessName?: string;

  authorName: string;
  authorAvatar?: string;
  authorPhone?: string;
  authorEmail?: string;

  rating: number; // 1 -> 5 sao
  title?: string;
  content: string; // Nội dung đánh giá
  comment?: string; // Fallback
  images: string[]; // Mảng URL ảnh Media
  photos?: string[]; // Fallback

  status: ReviewStatus; // pending -> approved | rejected | hidden
  adminNote?: string; // Ghi chú kiểm duyệt của Admin (không sửa nội dung khách)

  reply?: {
    content: string;
    repliedBy: string;
    repliedAt: string;
  };

  createdAt: string;
  updatedAt: string;
};

export type CommissionStatus =
  | "PENDING"
  | "CALCULATED"
  | "READY_FOR_RECONCILIATION"
  | "RECONCILED"
  | "PAID"
  | "DISPUTED"
  | "CANCELLED";

export type CommissionRecord = {
  id: string; // COMM-XXXXX
  bookingId: string;
  businessId: string;
  businessName: string;
  placeId: string;
  placeName: string;
  serviceId?: string;
  serviceTitle: string;
  commissionRate: number;
  rateSource: "service" | "place" | "business" | "default" | "custom";
  originalAmount: number;
  commissionBaseAmount: number;
  commissionAmount: number;
  status: CommissionStatus;
  reconciliationBatchId?: string;
  dispute?: {
    isDisputed: boolean;
    reason: string;
    note?: string;
    evidence?: string;
    disputedAt: string;
    resolvedAt?: string;
    resolutionNote?: string;
  };
  createdAt: string;
  updatedAt: string;
  calculatedAt?: string;
  reconciledAt?: string;
  paidAt?: string;
};

export type ReconciliationBatchStatus = "DRAFT" | "READY_FOR_REVIEW" | "CONFIRMED" | "PAID" | "DISPUTED";

export type ReconciliationBatchRecord = {
  id: string; // RECON-YYYY-MM-XXX
  batchCode: string;
  businessId: string;
  businessName: string;
  period: string;
  bookingIds: string[];
  commissionIds: string[];
  totalBookings: number;
  totalGMV: number;
  totalCommission: number;
  netPayoutToBusiness: number;
  status: ReconciliationBatchStatus;
  payoutProof?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  paidAt?: string;
};

export type SettlementStatus = "pending_approval" | "approved" | "completed";

export type SettlementBatch = {
  id: string;
  businessId: string;
  businessName: string;
  period: string;
  transactionIds: string[];
  totalOrderValue: number;
  totalCommission: number;
  payoutStatus: SettlementStatus;
  payoutProof?: string;
  notes?: string;
  createdAt: string;
  settledAt?: string;
};

export type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE"
  | "PUBLISH"
  | "UNPUBLISH"
  | "APPROVE"
  | "REJECT"
  | "ASSIGN"
  | "STATUS_CHANGE"
  | "PAYMENT"
  | "REFUND"
  | "COMMISSION_CHANGE"
  | "RECONCILE"
  | string;

export type AuditEntityType =
  | "USER"
  | "PLACE"
  | "BLOG"
  | "LEAD"
  | "BOOKING"
  | "PAYMENT"
  | "VOUCHER"
  | "COMMISSION"
  | "RECONCILIATION"
  | "REVIEW"
  | string;

export type AuditLogRecord = {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityTitle?: string;
  oldValue?: any;
  newValue?: any;
  summary: string;
  ip?: string;
  userAgent?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
};

export type BackupMetadata = {
  id: string;
  filename: string;
  sizeBytes: number;
  recordCount: Record<string, number>;
  createdAt: string;
  note?: string;
};

export type SystemHealthMetrics = {
  status: "healthy" | "degraded" | "error";
  uptimeSeconds: number;
  databaseSizeKb: number;
  counts: {
    places: number;
    blogs: number;
    leads: number;
    vouchers: number;
    bookings: number;
    payments: number;
    reviews: number;
    transactions: number;
    settlements: number;
    users: number;
    auditLogs: number;
  };
  serverTime: string;
};

export type PaymentMethodType = "qr" | "bank_transfer" | "cod" | "gateway";
export type PaymentRecord = {
  id: string; // PAY-XXXXX
  paymentCode: string; // CAL-PAY-XXXXX
  bookingId: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  amount: number;
  currency: string; // "VND"
  method: PaymentMethodType;
  status: "PENDING" | "PROCESSING" | "PAID" | "FAILED" | "CANCELLED" | "REFUNDED" | "PARTIALLY_REFUNDED";
  provider: string; // "vietqr" | "bank_transfer" | "cod" | "gateway" | "momo" | "vnpay"
  providerTransactionId?: string;
  paymentReceiptUrl?: string; // Ảnh biên lai chụp màn hình
  paymentProofUploadedAt?: string;
  paidAt?: string;
  refundedAt?: string;
  refundAmount?: number;
  refundReason?: string;
  callbackLog?: Array<{
    timestamp: string;
    callbackId?: string;
    payloadSnippet?: string;
    success: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
};

type StoreData = {
  payments?: PaymentRecord[];
  places?: PlaceRecord[];
  leads: LeadRecord[];
  vouchers: Voucher[];
  transactions: TransactionRecord[];
  businesses: BusinessRecord[];
  notifications: NotificationRecord[];
  users: SystemUser[];
  customAssets?: SystemAssetRecord[];
  chats?: ChatSession[];
  siteSettings?: SiteSettings;
  blogs?: BlogPostRecord[];

  bookings?: BookingRecord[];
  reviews?: ReviewRecord[];
  settlementBatches?: SettlementBatch[];
  commissions?: CommissionRecord[];
  reconciliationBatches?: ReconciliationBatchRecord[];
  auditLogs?: AuditLogRecord[];
  backups?: BackupMetadata[];

};

// Sử dụng cơ sở dữ liệu dùng chung đặt tại D:\Website\ChamALuoi-Data\.store.json hoặc fallback
function getDataFilePath(): string {
  const possiblePaths = [
    "D:\\Website\\ChamALuoi-Data\\.store.json",
    "D:\\ChamALuoi-Data\\.store.json",
    path.join(process.cwd(), "..", "ChamALuoi-Data", ".store.json"),
    path.join(process.cwd(), "data", ".store.json")
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) return p;
    const dir = path.dirname(p);
    if (fs.existsSync(dir)) return p;
  }
  return path.join(process.cwd(), "data", ".store.json");
}

const DATA_FILE = getDataFilePath();

const initialBusinesses: BusinessRecord[] = [
  {
    id: "biz-a-nor",
    name: "Hợp tác xã Du lịch Cộng đồng A Nôr",
    ownerName: "Hồ Văn Lập",
    phone: "0905 000 118",
    email: "dulichanor@gmail.com",
    zaloUrl: "https://zalo.me/0905000118",
    address: "Thôn A Nôr, xã Hồng Kim, A Lưới, Thừa Thiên Huế",
    commissionRate: 10,
    status: "active",
    joinedDate: "2024-01-15"
  },
  {
    id: "biz-homestay-anor",
    name: "Hộ kinh doanh Homestay Ven Suối A Nôr",
    ownerName: "Nguyễn Thị Hoa",
    phone: "0905 000 118",
    email: "homestayvensuoi@gmail.com",
    zaloUrl: "https://zalo.me/0905000118",
    address: "Thôn A Nôr, xã Hồng Kim, A Lưới, Thừa Thiên Huế",
    commissionRate: 10,
    status: "active",
    joinedDate: "2024-02-01"
  },
  {
    id: "biz-quan-paco",
    name: "Nhà hàng Ẩm thực Bản Mường Pa Cô",
    ownerName: "Quỳnh A Dút",
    phone: "0912 345 678",
    email: "amthucpaco@gmail.com",
    zaloUrl: "https://zalo.me/0912345678",
    address: "Đường Hồ Chí Minh, thị trấn A Lưới, Thừa Thiên Huế",
    commissionRate: 8,
    status: "active",
    joinedDate: "2024-02-15"
  },
  {
    id: "biz-det-zeng",
    name: "Hợp tác xã Nghề Dệt Zèng Truyền thống A Đớt",
    ownerName: "Mai Thị Hợp (Nghệ nhân)",
    phone: "0933 000 118",
    email: "zengtaoi@gmail.com",
    zaloUrl: "https://zalo.me/0933000118",
    address: "Làng A Đớt, A Lưới, Thừa Thiên Huế",
    commissionRate: 12,
    status: "active",
    joinedDate: "2024-01-10"
  },
  {
    id: "biz-a-roang",
    name: "Hội Hướng dẫn viên Khám phá A Roàng",
    ownerName: "Lê Văn Tơ",
    phone: "0977 000 118",
    email: "trekkingaroang@gmail.com",
    zaloUrl: "https://zalo.me/0977000118",
    address: "Xã A Roàng, huyện A Lưới, Thừa Thiên Huế",
    commissionRate: 12,
    status: "active",
    joinedDate: "2024-03-01"
  },
  {
    id: "biz-par-le",
    name: "Khu Du lịch Sinh thái Suối Pâr Le",
    ownerName: "Trần Văn Định",
    phone: "0922 000 118",
    email: "suoiparle@gmail.com",
    zaloUrl: "https://zalo.me/0922000118",
    address: "Xã Hồng Hạ, A Lưới, Thừa Thiên Huế",
    commissionRate: 10,
    status: "active",
    joinedDate: "2024-03-10"
  },
  {
    id: "biz-transfer",
    name: "Công ty Vận tải & Du lịch A Lưới Transfer",
    ownerName: "Phạm Quốc Tuấn",
    phone: "0944 000 118",
    email: "aluoitransfer@gmail.com",
    zaloUrl: "https://zalo.me/0944000118",
    address: "Bến xe trung tâm TP. Huế & Thị trấn A Lưới",
    commissionRate: 8,
    status: "active",
    joinedDate: "2024-02-20"
  },
  {
    id: "biz-nongsan",
    name: "Hợp tác xã Nông Sản Rừng Sạch A Lưới",
    ownerName: "Hồ Thị Nương",
    phone: "0955 000 118",
    email: "matongaluoi@gmail.com",
    zaloUrl: "https://zalo.me/0955000118",
    address: "Thị trấn A Lưới, Thừa Thiên Huế",
    commissionRate: 10,
    status: "active",
    joinedDate: "2024-01-20"
  }
];

const initialUsers: SystemUser[] = [
  { id: "usr-admin-1", name: "Quản trị viên Chạm A Lưới", email: "admin@chamaluoi.vn", phone: "0905000118", role: "admin", createdAt: "2024-01-01" },
  { id: "usr-biz-1", name: "Hồ Văn Lập (HTX A Nôr)", email: "dulichanor@gmail.com", phone: "0905000118", role: "business", businessId: "biz-a-nor", createdAt: "2024-01-15" },
  { id: "usr-biz-2", name: "Quỳnh A Dút (Quán Pa Cô)", email: "amthucpaco@gmail.com", phone: "0912345678", role: "business", businessId: "biz-quan-paco", createdAt: "2024-02-15" },
  { id: "usr-cust-1", name: "Nguyễn Hoàng Nam", email: "nam.nguyen@gmail.com", phone: "0918112233", role: "customer", createdAt: "2024-05-10" },
  { id: "usr-cust-2", name: "Trần Mai Anh", email: "maianh.tran@gmail.com", phone: "0987654321", role: "customer", createdAt: "2024-05-12" }
];

const initialLeads: LeadRecord[] = [
  {
    leadId: "AL-LD-82104",
    voucherCode: "CAL-VCH-82104",
    placeSlug: "thac-a-nor",
    placeName: "Thác A Nôr",
    businessName: "Hợp tác xã Du lịch Cộng đồng A Nôr",
    businessId: "biz-a-nor",
    customerName: "Nguyễn Hoàng Nam",
    phone: "0918 112 233",
    email: "nam.nguyen@gmail.com",
    expectedDate: "2024-06-15",
    guests: 4,
    need: "Gia đình muốn đặt chòi nghỉ ven thác A Nôr và đặt trước 1 mâm cơm gà nướng ống tre trưa thứ Bảy.",
    status: "voucher_used",
    userId: "usr-cust-1",
    createdAt: "2024-05-20T08:30:00.000Z",
    updatedAt: "2024-05-22T14:15:00.000Z"
  },
  {
    leadId: "AL-LD-59412",
    voucherCode: "CAL-VCH-59412",
    placeSlug: "homestay-ven-suoi-a-nor",
    placeName: "Homestay ven suối A Nôr",
    businessName: "Hộ kinh doanh Homestay Ven Suối A Nôr",
    businessId: "biz-homestay-anor",
    customerName: "Trần Mai Anh",
    phone: "0987 654 321",
    email: "maianh.tran@gmail.com",
    expectedDate: "2024-06-20",
    guests: 2,
    need: "Cặp đôi muốn ở 2 đêm cuối tuần phòng view suối, cần tư vấn thêm về dịch vụ đốt lửa trại buổi tối.",
    status: "consulting",
    userId: "usr-cust-2",
    createdAt: "2024-05-21T10:15:00.000Z",
    updatedAt: "2024-05-21T10:15:00.000Z"
  },
  {
    leadId: "AL-LD-34109",
    voucherCode: "CAL-VCH-34109",
    placeSlug: "rung-nguyen-sinh-a-roang",
    placeName: "Rừng nguyên sinh A Roàng",
    businessName: "Hội Hướng dẫn viên Khám phá A Roàng",
    businessId: "biz-a-roang",
    customerName: "Đặng Tiến Dũng",
    phone: "0934 567 890",
    email: "tiendung.dang@gmail.com",
    expectedDate: "2024-06-25",
    guests: 6,
    need: "Đoàn bạn trẻ muốn trải nghiệm trekking rừng già 1 ngày và ngâm suối nước khoáng ấm.",
    status: "new",
    createdAt: "2024-05-22T16:45:00.000Z",
    updatedAt: "2024-05-22T16:45:00.000Z"
  }
];

const initialVouchers: Voucher[] = [
  {
    voucherCode: "CAL-VCH-82104",
    discountOffer: "Giảm 10% gói hướng dẫn viên & mâm cơm bản địa",
    startDate: "2024-05-20",
    expiresAt: "2024-06-20",
    placeSlug: "thac-a-nor",
    placeName: "Thác A Nôr",
    status: "used",
    leadId: "AL-LD-82104",
    usedAt: "2024-05-22T14:15:00.000Z"
  },
  {
    voucherCode: "CAL-VCH-59412",
    discountOffer: "Giảm 10% tiền phòng khi đặt qua Chạm A Lưới",
    startDate: "2024-05-21",
    expiresAt: "2024-06-21",
    placeSlug: "homestay-ven-suoi-a-nor",
    placeName: "Homestay ven suối A Nôr",
    status: "unused",
    leadId: "AL-LD-59412"
  },
  {
    voucherCode: "CAL-VCH-34109",
    discountOffer: "Giảm 10% phí tour cho nhóm từ 4 khách",
    startDate: "2024-05-22",
    expiresAt: "2024-06-22",
    placeSlug: "rung-nguyen-sinh-a-roang",
    placeName: "Rừng nguyên sinh A Roàng",
    status: "unused",
    leadId: "AL-LD-34109"
  }
];

const initialTransactions: TransactionRecord[] = [
  {
    id: "tx-2024-001",
    leadId: "AL-LD-82104",
    voucherCode: "CAL-VCH-82104",
    placeSlug: "thac-a-nor",
    placeName: "Thác A Nôr",
    businessName: "Hợp tác xã Du lịch Cộng đồng A Nôr",
    businessId: "biz-a-nor",
    orderValue: 1200000,
    commissionRate: 10,
    commissionAmount: 120000,
    confirmedAt: "2024-05-22T14:15:00.000Z",
    status: "pending_reconciliation",
    note: "Đoàn 4 khách dùng mâm gà nướng và tắm thác."
  }
];

const initialNotifications: NotificationRecord[] = [
  {
    id: "notif-1",
    title: "Lead tư vấn mới",
    content: "Khách hàng Đặng Tiến Dũng đã đăng ký tư vấn tại Rừng nguyên sinh A Roàng (Mã: AL-LD-34109)",
    type: "lead",
    createdAt: "2024-05-22T16:45:00.000Z",
    isRead: false,
    link: "/admin/leads"
  },
  {
    id: "notif-2",
    title: "Giao dịch voucher được xác nhận",
    content: "HTX A Nôr đã xác nhận voucher CAL-VCH-82104 với giá trị 1.200.000đ (Hoa hồng: 120.000đ)",
    type: "transaction",
    createdAt: "2024-05-22T14:15:00.000Z",
    isRead: false,
    link: "/admin/commissions"
  }
];

let inMemoryStore: StoreData | null = null;

// =========================================================================
// SUPABASE CLOUD SYNC ENGINE (LIÊN THÔNG 2 CHIỀU ADMIN ↔ CUSTOMER)
// =========================================================================
let lastCloudFetchTime = 0;
const CLOUD_CACHE_TTL_MS = 3000; // 3 giây làm mới một lần

export async function fetchStoreFromSupabaseCloud(): Promise<StoreData | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcunfovtwbzfatudejfs.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdW5mb3Z0d2J6ZmF0dWRlamZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NTM5OSwiZXhwIjoyMTA0OTcxMzk5fQ.7QwyRHqGXa6UwgbUNAhlWdmGZqpuS8Cxall2v8j7lMU';

  if (!url || !key) return null;

  try {
    const res = await fetch(`${url}/rest/v1/system_store?id=eq.main&select=data,updated_at`, {
      method: "GET",
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`
      },
      cache: "no-store"
    });

    if (!res.ok) return null;
    const rows = await res.json();
    if (Array.isArray(rows) && rows.length > 0 && rows[0].data) {
      inMemoryStore = rows[0].data as StoreData;
      lastCloudFetchTime = Date.now();
      return inMemoryStore;
    }
  } catch (err) {
    // Fallback in-memory
  }
  return null;
}

function pushStoreToSupabaseCloud(data: StoreData) {
  if (process.env.NEXT_PHASE === 'phase-production-build') return;
  if (!data || typeof data !== 'object') return;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcunfovtwbzfatudejfs.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdW5mb3Z0d2J6ZmF0dWRlamZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NTM5OSwiZXhwIjoyMTA0OTcxMzk5fQ.7QwyRHqGXa6UwgbUNAhlWdmGZqpuS8Cxall2v8j7lMU';

  if (!url || !key) return;

  const timestamp = new Date().toISOString();
  const headers = {
    "apikey": key,
    "Authorization": `Bearer ${key}`,
    "Content-Type": "application/json",
    "Prefer": "resolution=merge-duplicates"
  };

  try {
    // 1. Luôn lưu vào kho tổng main
    fetch(`${url}/rest/v1/system_store`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        id: "main",
        data: data,
        updated_at: timestamp
      })
    }).catch(() => {});

    // 2. Nếu có danh sách places, đồng bộ sang places_store
    if (Array.isArray(data.places) && data.places.length > 0) {
      fetch(`${url}/rest/v1/system_store`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          id: "places_store",
          data: data.places,
          updated_at: timestamp
        })
      }).catch(() => {});
    }

    // 3. Nếu có danh sách blogs, đồng bộ sang blogs_store
    if (Array.isArray(data.blogs) && data.blogs.length > 0) {
      fetch(`${url}/rest/v1/system_store`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          id: "blogs_store",
          data: data.blogs,
          updated_at: timestamp
        })
      }).catch(() => {});
    }
  } catch {}
}


export function loadStore(): StoreData {
  if (inMemoryStore) {
    if (Date.now() - lastCloudFetchTime > CLOUD_CACHE_TTL_MS) {
      fetchStoreFromSupabaseCloud().catch(() => {});
    }
    return inMemoryStore;
  }

  try {
    const currentFile = getDataFilePath();
    if (fs.existsSync(currentFile)) {
      const raw = fs.readFileSync(currentFile, "utf-8");
      inMemoryStore = JSON.parse(raw) as StoreData;
      return inMemoryStore;
    }
  } catch {}

  inMemoryStore = {
    leads: initialLeads,
    vouchers: initialVouchers,
    transactions: initialTransactions,
    businesses: initialBusinesses,
    notifications: initialNotifications,
    users: initialUsers
  };

  return inMemoryStore;
}

function saveStore(data: StoreData) {
  inMemoryStore = data;
  pushStoreToSupabaseCloud(data);
  try {
    const targetFile = getDataFilePath();
    const dir = path.dirname(targetFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempFile = `${targetFile}.${Date.now()}.${Math.random().toString(36).substring(2, 7)}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
    fs.renameSync(tempFile, targetFile);
  } catch {
    try {
      const targetFile = getDataFilePath();
      fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), "utf-8");
    } catch {}
  }
}

// Leads API (CRM Pipeline)
export function getAllLeads(includeDeleted: boolean = false): LeadRecord[] {
  const leads = loadStore().leads || [];
  if (includeDeleted) return leads;
  return leads.filter((l) => !l.isDeleted);
}

export function getLeadById(leadId: string): LeadRecord | undefined {
  return (loadStore().leads || []).find((l) => l.leadId === leadId);
}

export function getLeadsByBusiness(businessId: string): LeadRecord[] {
  const store = loadStore();
  return (store.leads || []).filter((l) => !l.isDeleted && (l.businessId === businessId || l.assignedBusinessId === businessId));
}

export function getLeadsByUser(userId: string): LeadRecord[] {
  const store = loadStore();
  return (store.leads || []).filter((l) => !l.isDeleted && (l.userId === userId || l.customerId === userId));
}

export function createLead(payload: LeadPayload): { lead: LeadRecord; voucher: Voucher } {
  const store = loadStore();
  const now = new Date();
  const leadId = createLeadCode(now);
  const voucherCode = createVoucherCode();

  const place = places.find((p) => p.slug === payload.placeSlug);
  const businessName = payload.businessName || place?.businessName || "Đối tác Chạm A Lưới";
  const businessId = payload.businessId || place?.businessId;
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const initialTimelineEvent = {
    id: `tl-${Date.now()}-1`,
    stage: "lead_created" as const,
    title: "Lead được tạo",
    description: `Khách hàng ${payload.customerName} gửi yêu cầu tư vấn tại ${payload.placeName} qua nguồn ${payload.source || "WEBSITE"}`,
    actor: {
      id: payload.userId || payload.customerId || "guest",
      name: payload.customerName,
      role: "customer"
    },
    timestamp: now.toISOString(),
    metadata: {
      source: payload.source || "WEBSITE",
      landingPage: payload.landingPage,
      utmSource: payload.utmSource,
      utmMedium: payload.utmMedium,
      utmCampaign: payload.utmCampaign
    }
  };

  const lead: LeadRecord = {
    leadId,
    voucherCode,
    placeSlug: payload.placeSlug,
    placeName: payload.placeName,
    businessName,
    businessId,
    customerId: payload.customerId || payload.userId,
    customerName: payload.customerName,
    phone: payload.phone,
    email: payload.email,
    zalo: payload.zalo || payload.phone,
    expectedDate: payload.expectedDate,
    preferredTime: payload.preferredTime,
    guests: payload.guests || 2,
    need: payload.need,
    serviceOrTour: payload.serviceOrTour,
    budget: payload.budget,
    customerNote: payload.customerNote,
    source: payload.source || "WEBSITE",
    campaign: payload.campaign,
    landingPage: payload.landingPage,
    utmSource: payload.utmSource,
    utmMedium: payload.utmMedium,
    utmCampaign: payload.utmCampaign,
    assignedBusinessId: businessId,
    assignedBusinessName: businessName,
    status: "new",
    isDeleted: false,
    timeline: [initialTimelineEvent],
    notes: [],
    userId: payload.userId,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString()
  };

  const voucher: Voucher = {
    voucherCode,
    discountOffer: place?.voucherOffer || "Ưu đãi đặc biệt từ Chạm A Lưới",
    startDate: now.toISOString().split("T")[0],
    expiresAt,
    placeSlug: payload.placeSlug,
    placeName: payload.placeName,
    status: "unused",
    leadId
  };

  const notif: NotificationRecord = {
    id: `notif-${Date.now()}`,
    title: "Lead tư vấn mới",
    content: `Khách hàng ${lead.customerName} vừa yêu cầu tư vấn tại ${lead.placeName} (Mã: ${lead.leadId})`,
    type: "lead",
    createdAt: now.toISOString(),
    isRead: false,
    link: `/admin/leads/${lead.leadId}`
  };

  if (!store.leads) store.leads = [];
  if (!store.vouchers) store.vouchers = [];
  if (!store.notifications) store.notifications = [];

  store.leads.unshift(lead);
  store.vouchers.unshift(voucher);
  store.notifications.unshift(notif);

  addAuditLogDirect(store, {
    action: "lead.create",
    actor: { id: payload.userId || "guest", name: payload.customerName, role: "customer" },
    target: { type: "lead", id: lead.leadId, title: lead.customerName },
    summary: `Tạo Lead mới từ website: ${lead.customerName} - ${lead.placeName} (Mã: ${lead.leadId})`,
    metadata: { leadId: lead.leadId, source: lead.source, placeSlug: lead.placeSlug }
  });

  saveStore(store);
  return { lead, voucher };
}

export function updateLeadStatus(
  leadId: string,
  status: LeadStatus,
  options?: {
    lossReason?: LeadRecord["lossReason"];
    lossNote?: string;
    actor?: { id: string; name: string; role: string };
  }
): LeadRecord | null {
  const store = loadStore();
  if (!store.leads) return null;
  const leadIndex = store.leads.findIndex((l) => l.leadId === leadId);
  if (leadIndex === -1) return null;

  const lead = store.leads[leadIndex];
  const oldStatus = lead.status;
  lead.status = status;
  lead.updatedAt = new Date().toISOString();

  if (status === "unsuccessful") {
    lead.lossReason = options?.lossReason;
    lead.lossNote = options?.lossNote;
  }

  const actor = options?.actor || { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" };

  let stage: LeadTimelineEvent["stage"] = "customer_consulted";
  let title = "Cập nhật trạng thái";
  let description = `Cập nhật trạng thái từ '${oldStatus}' sang '${status}'`;

  if (status === "contacted") {
    stage = "admin_contacted";
    title = "Đã liên hệ với khách";
    description = "Nhân viên chăm sóc khách hàng đã liên hệ lần đầu qua điện thoại/Zalo.";
    lead.lastContactAt = new Date().toISOString();
  } else if (status === "consulting") {
    stage = "customer_consulted";
    title = "Đang tư vấn chi tiết";
    description = "Đang trao đổi về lịch trình, chi phí và dịch vụ với khách hàng.";
    lead.lastContactAt = new Date().toISOString();
  } else if (status === "converted") {
    stage = "booking_created";
    title = "Chốt đơn thành công";
    description = "Khách hàng đã đồng ý sử dụng dịch vụ và chuyển thành Booking.";
  } else if (status === "unsuccessful") {
    stage = "unsuccessful";
    title = "Không thành công";
    description = `Không thành công. Lý do: ${options?.lossReason || "Khác"}. ${options?.lossNote ? `Ghi chú: ${options.lossNote}` : ""}`;
  }

  if (!lead.timeline) lead.timeline = [];
  lead.timeline.push({
    id: `tl-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    stage,
    title,
    description,
    actor,
    timestamp: new Date().toISOString(),
    metadata: { oldStatus, newStatus: status, lossReason: options?.lossReason, lossNote: options?.lossNote }
  });

  addAuditLogDirect(store, {
    action: "lead.update_status",
    actor,
    target: { type: "lead", id: lead.leadId, title: lead.customerName },
    summary: `Cập nhật trạng thái Lead ${lead.leadId} sang '${status}'`,
    metadata: { oldStatus, newStatus: status, lossReason: options?.lossReason }
  });

  saveStore(store);
  return lead;
}

export function assignLeadBusinessAndStaff(
  leadId: string,
  params: {
    businessId?: string;
    businessName?: string;
    staffId?: string;
    staffName?: string;
    nextFollowUpAt?: string;
    actor?: { id: string; name: string; role: string };
  }
): LeadRecord | null {
  const store = loadStore();
  if (!store.leads) return null;
  const leadIndex = store.leads.findIndex((l) => l.leadId === leadId);
  if (leadIndex === -1) return null;

  const lead = store.leads[leadIndex];
  const actor = params.actor || { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" };

  if (params.businessId) {
    lead.assignedBusinessId = params.businessId;
    lead.assignedBusinessName = params.businessName || params.businessId;
  }
  if (params.staffId) {
    lead.assignedStaffId = params.staffId;
    lead.assignedStaffName = params.staffName || params.staffId;
  }
  if (params.nextFollowUpAt) {
    lead.nextFollowUpAt = params.nextFollowUpAt;
  }

  lead.updatedAt = new Date().toISOString();

  if (!lead.timeline) lead.timeline = [];
  lead.timeline.push({
    id: `tl-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    stage: "assigned_business",
    title: "Phân công xử lý",
    description: `Phân công cho đối tác: ${lead.assignedBusinessName || "Chưa gán"}, Nhân viên: ${lead.assignedStaffName || "Chưa gán"}`,
    actor,
    timestamp: new Date().toISOString(),
    metadata: {
      businessId: lead.assignedBusinessId,
      businessName: lead.assignedBusinessName,
      staffId: lead.assignedStaffId,
      staffName: lead.assignedStaffName,
      nextFollowUpAt: lead.nextFollowUpAt
    }
  });

  addAuditLogDirect(store, {
    action: "lead.assign",
    actor,
    target: { type: "lead", id: lead.leadId, title: lead.customerName },
    summary: `Phân công Lead ${lead.leadId} cho ${lead.assignedBusinessName || "Doanh nghiệp"} - ${lead.assignedStaffName || "Nhân viên"}`,
    metadata: params
  });

  saveStore(store);
  return lead;
}

export function addLeadNote(
  leadId: string,
  content: string,
  actor: { id: string; name: string; role: string }
): LeadRecord | null {
  const store = loadStore();
  if (!store.leads) return null;
  const leadIndex = store.leads.findIndex((l) => l.leadId === leadId);
  if (leadIndex === -1) return null;

  const lead = store.leads[leadIndex];
  const now = new Date().toISOString();
  const note = {
    id: `note-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    content,
    authorId: actor.id,
    authorName: actor.name,
    createdAt: now
  };

  if (!lead.notes) lead.notes = [];
  lead.notes.unshift(note);
  lead.updatedAt = now;

  if (!lead.timeline) lead.timeline = [];
  lead.timeline.push({
    id: `tl-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    stage: "note_added",
    title: "Thêm ghi chú tư vấn",
    description: content,
    actor,
    timestamp: now
  });

  saveStore(store);
  return lead;
}

export function convertLeadToBooking(
  leadId: string,
  bookingDetails: {
    type: BookingType;
    itemTitle: string;
    unitPrice: number;
    quantity: number;
    startDate?: string;
    deliveryAddress?: string;
    notes?: string;
    paymentMethod?: PaymentMethod;
    actor?: { id: string; name: string; role: string };
  }
): { success: boolean; booking?: BookingRecord; lead?: LeadRecord; error?: string } {
  const store = loadStore();
  if (!store.leads) return { success: false, error: "Dữ liệu Leads trống." };
  const leadIndex = store.leads.findIndex((l) => l.leadId === leadId);
  if (leadIndex === -1) return { success: false, error: "Không tìm thấy Lead ID." };

  const lead = store.leads[leadIndex];
  if (lead.status === "converted" && lead.convertedBookingId) {
    return { success: false, error: `Lead này đã được chuyển thành Booking (${lead.convertedBookingId}) trước đó.` };
  }

  const actor = bookingDetails.actor || { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" };

  // Tạo Booking mới liên kết leadId
  const booking = createBooking({
    leadId: lead.leadId,
    placeId: lead.placeSlug,
    source: lead.source || "WEBSITE",
    campaign: lead.campaign,
    type: bookingDetails.type,
    customerName: lead.customerName,
    phone: lead.phone,
    email: lead.email,
    userId: lead.customerId || lead.userId,
    itemTitle: bookingDetails.itemTitle,
    itemSlug: lead.placeSlug,
    businessId: lead.assignedBusinessId || lead.businessId,
    businessName: lead.assignedBusinessName || lead.businessName,
    quantity: bookingDetails.quantity || lead.guests || 1,
    startDate: bookingDetails.startDate || lead.expectedDate,
    deliveryAddress: bookingDetails.deliveryAddress,
    notes: bookingDetails.notes || lead.need,
    unitPrice: bookingDetails.unitPrice,
    voucherCode: lead.voucherCode,
    paymentMethod: bookingDetails.paymentMethod || "vietqr"
  });

  // Cập nhật trạng thái Lead sang "converted"
  const now = new Date().toISOString();
  lead.status = "converted";
  lead.convertedBookingId = booking.id;
  lead.convertedAt = now;
  lead.updatedAt = now;

  if (!lead.timeline) lead.timeline = [];
  lead.timeline.push({
    id: `tl-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    stage: "booking_created",
    title: "Chuyển thành Booking thành công",
    description: `Đã tạo đơn đặt ${booking.id} (${booking.itemTitle}, Tổng: ${booking.finalAmount.toLocaleString("vi-VN")}đ)`,
    actor,
    timestamp: now,
    metadata: {
      bookingId: booking.id,
      finalAmount: booking.finalAmount,
      itemTitle: booking.itemTitle
    }
  });

  addAuditLogDirect(store, {
    action: "lead.convert_to_booking",
    actor,
    target: { type: "lead", id: lead.leadId, title: lead.customerName },
    summary: `Chuyển đổi thành công Lead ${lead.leadId} sang Booking ${booking.id}`,
    metadata: { leadId: lead.leadId, bookingId: booking.id, finalAmount: booking.finalAmount }
  });

  saveStore(store);
  return { success: true, booking, lead };
}

export function softDeleteLead(
  leadId: string,
  actor?: { id: string; name: string; role: string }
): LeadRecord | null {
  const store = loadStore();
  if (!store.leads) return null;
  const leadIndex = store.leads.findIndex((l) => l.leadId === leadId);
  if (leadIndex === -1) return null;

  const lead = store.leads[leadIndex];
  lead.isDeleted = true;
  lead.deletedAt = new Date().toISOString();
  lead.updatedAt = lead.deletedAt;

  addAuditLogDirect(store, {
    action: "lead.soft_delete",
    actor: actor || { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" },
    target: { type: "lead", id: lead.leadId, title: lead.customerName },
    summary: `Đã ẩn (soft delete) Lead ${lead.leadId}`,
    metadata: { leadId: lead.leadId }
  });

  saveStore(store);
  return lead;
}

// Vouchers API
export function getAllVouchers(): Voucher[] {
  return loadStore().vouchers;
}

export function getVoucherByCode(code: string): Voucher | undefined {
  return loadStore().vouchers.find((v) => v.voucherCode.toUpperCase() === code.toUpperCase().trim());
}

export function getVouchersByBusiness(businessId: string): Voucher[] {
  const store = loadStore();
  const businessLeads = store.leads.filter((l) => l.businessId === businessId);
  const codes = new Set(businessLeads.map((l) => l.voucherCode));
  return store.vouchers.filter((v) => codes.has(v.voucherCode));
}

// Transactions & Commission Reconciliation
export function getAllTransactions(): TransactionRecord[] {
  return loadStore().transactions;
}

export function getTransactionsByBusiness(businessId: string): TransactionRecord[] {
  return loadStore().transactions.filter((t) => t.businessId === businessId);
}

export function confirmVoucherTransaction(params: {
  voucherCode: string;
  orderValue: number;
  businessId?: string;
  note?: string;
}): { success: boolean; transaction?: TransactionRecord; message: string } {
  const store = loadStore();
  const voucher = store.vouchers.find((v) => v.voucherCode.toUpperCase() === params.voucherCode.toUpperCase().trim());

  if (!voucher) {
    return { success: false, message: "Không tìm thấy mã voucher này trong hệ thống." };
  }

  if (voucher.status === "used") {
    return { success: false, message: "Voucher này đã được sử dụng trước đó." };
  }

  const lead = store.leads.find((l) => l.voucherCode === voucher.voucherCode);
  const place = places.find((p) => p.slug === voucher.placeSlug);

  const commissionRate = place?.commissionRate || 10;
  const commissionAmount = calculateCommission(params.orderValue, commissionRate);
  const now = new Date().toISOString();

  // Mark voucher as used
  voucher.status = "used";
  voucher.usedAt = now;

  // Update lead status
  if (lead) {
    lead.status = "voucher_used";
    lead.updatedAt = now;
  }

  const transaction: TransactionRecord = {
    id: `tx-${Date.now()}`,
    leadId: voucher.leadId,
    voucherCode: voucher.voucherCode,
    placeSlug: voucher.placeSlug,
    placeName: voucher.placeName,
    businessName: lead?.businessName || place?.businessName || "Đối tác địa phương",
    businessId: params.businessId || lead?.businessId || place?.businessId,
    orderValue: params.orderValue,
    commissionRate,
    commissionAmount,
    confirmedAt: now,
    status: "pending_reconciliation",
    note: params.note || "Khách sử dụng voucher tại điểm"
  };

  const notif: NotificationRecord = {
    id: `notif-${Date.now()}`,
    title: "Giao dịch đối soát mới",
    content: `Cơ sở ${transaction.businessName} vừa xác nhận hóa đơn ${transaction.orderValue.toLocaleString("vi-VN")}đ (Hoa hồng: ${transaction.commissionAmount.toLocaleString("vi-VN")}đ)`,
    type: "transaction",
    createdAt: now,
    isRead: false,
    link: "/admin/commissions"
  };

  store.transactions.unshift(transaction);
  store.notifications.unshift(notif);
  saveStore(store);

  return { success: true, transaction, message: "Xác nhận voucher và ghi nhận giao dịch hoa hồng thành công!" };
}

export function reconcileTransaction(transactionId: string): boolean {
  const store = loadStore();
  const tx = store.transactions.find((t) => t.id === transactionId);
  if (!tx) return false;

  tx.status = "reconciled";
  saveStore(store);
  return true;
}

// Businesses API
export function getAllBusinesses(): BusinessRecord[] {
  return loadStore().businesses;
}

export function getBusinessById(id: string): BusinessRecord | undefined {
  return loadStore().businesses.find((b) => b.id === id);
}

export function updateBusinessProfile(id: string, updates: Partial<BusinessRecord>): BusinessRecord | null {
  const store = loadStore();
  const idx = store.businesses.findIndex((b) => b.id === id);
  if (idx === -1) return null;

  store.businesses[idx] = { ...store.businesses[idx], ...updates };
  saveStore(store);
  return store.businesses[idx];
}

// Stats for Admin
export function getAdminMetrics() {
  const store = loadStore();
  const totalUsers = store.users.length + 18; // base realistic stats
  const totalBusinesses = store.businesses.length;
  const totalPlaces = places.length;
  const totalLeads = store.leads.length;
  const totalVouchers = store.vouchers.length;
  const vouchersUsed = store.vouchers.filter((v) => v.status === "used").length;
  const totalTransactions = store.transactions.length;
  const totalRevenue = store.transactions.reduce((acc, t) => acc + t.orderValue, 0);
  const totalCommission = store.transactions.reduce((acc, t) => acc + t.commissionAmount, 0);
  const pendingReconcileCount = store.transactions.filter((t) => t.status === "pending_reconciliation").length;
  const pendingReconcileAmount = store.transactions
    .filter((t) => t.status === "pending_reconciliation")
    .reduce((acc, t) => acc + t.commissionAmount, 0);

  return {
    totalUsers,
    totalBusinesses,
    totalPlaces,
    totalLeads,
    totalVouchers,
    vouchersUsed,
    totalTransactions,
    totalRevenue,
    totalCommission,
    pendingReconcileCount,
    pendingReconcileAmount
  };
}

// Notifications API
export function getNotifications(): NotificationRecord[] {
  return loadStore().notifications;
}

export function markNotificationRead(id: string): boolean {
  const store = loadStore();
  const notif = store.notifications.find((n) => n.id === id);
  if (!notif) return false;
  notif.isRead = true;
  saveStore(store);
  return true;
}

// System Assets API (Kho ảnh phong cảnh & Đặc sản A Lưới)
const defaultSystemAssets: SystemAssetRecord[] = [
  { id: "asset-1", name: "Thổ cẩm dệt Zèng Tà Ôi", url: "/images/products/zeng-brocade.png", note: "Sản phẩm & Văn hóa", createdAt: "2024-01-01" },
  { id: "asset-2", name: "Mật ong rừng già A Lưới", url: "/images/products/forest-honey.png", note: "Đặc sản địa phương", createdAt: "2024-01-01" },
  { id: "asset-3", name: "Trà núi thảo mộc A Lưới", url: "/images/products/mountain-tea.png", note: "Dược liệu & Quà biếu", createdAt: "2024-01-01" },
  { id: "asset-4", name: "Giỏ đan lát mây tre Pa Cô", url: "/images/products/bamboo-craft-basket.png", note: "Thủ công mỹ nghệ", createdAt: "2024-01-01" },
  { id: "asset-5", name: "Thác A Nôr (Unsplash)", url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=82", note: "Thác & Suối", createdAt: "2024-01-01" },
  { id: "asset-6", name: "Suối Pâr Le Hồng Hạ", url: "https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1600&q=82", note: "Thác & Suối", createdAt: "2024-01-01" },
  { id: "asset-7", name: "Rừng già A Roàng", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1600&q=82", note: "Hoạt động ngoài trời", createdAt: "2024-01-01" }
];

export function getSystemAssets(): SystemAssetRecord[] {
  const store = loadStore();
  if (!store.customAssets) {
    store.customAssets = [...defaultSystemAssets];
    saveStore(store);
  }
  return store.customAssets;
}

export function saveSystemAsset(asset: Omit<SystemAssetRecord, "id" | "createdAt"> & { id?: string }): SystemAssetRecord {
  const store = loadStore();
  if (!store.customAssets) store.customAssets = [...defaultSystemAssets];

  if (asset.id) {
    const idx = store.customAssets.findIndex((a) => a.id === asset.id);
    if (idx !== -1) {
      store.customAssets[idx] = {
        ...store.customAssets[idx],
        ...asset
      };
      saveStore(store);
      return store.customAssets[idx];
    }
  }

  const newAsset: SystemAssetRecord = {
    id: `asset-${Date.now()}`,
    name: asset.name,
    url: asset.url,
    note: asset.note || "Ảnh tư liệu",
    createdAt: new Date().toISOString()
  };

  store.customAssets.unshift(newAsset);
  saveStore(store);
  return newAsset;
}

export function deleteSystemAsset(id: string): boolean {
  const store = loadStore();
  if (!store.customAssets) store.customAssets = [...defaultSystemAssets];

  const initialLength = store.customAssets.length;
  store.customAssets = store.customAssets.filter((a) => a.id !== id);
  if (store.customAssets.length !== initialLength) {
    saveStore(store);
    return true;
  }
  return false;
}

// Live Chat API kết nối giữa Khách và Quản trị Admin
export function getChatSessions(): ChatSession[] {
  const store = loadStore();
  return store.chats || [];
}

export function getChatSessionById(sessionId: string): ChatSession | null {
  const store = loadStore();
  return store.chats?.find((c) => c.id === sessionId) || null;
}

export function sendGuestMessage(data: {
  sessionId?: string;
  guestName?: string;
  guestPhone?: string;
  text: string;
}): { session: ChatSession; message: ChatMessage } {
  const store = loadStore();
  if (!store.chats) store.chats = [];

  const now = new Date().toISOString();
  let session = data.sessionId ? store.chats.find((c) => c.id === data.sessionId) : undefined;

  if (!session) {
    const newSessionId = `chat-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    session = {
      id: newSessionId,
      guestName: data.guestName || "Khách truy cập",
      guestPhone: data.guestPhone || "",
      lastMessage: data.text,
      updatedAt: now,
      unreadByAdmin: true,
      messages: [
        {
          id: `msg-0`,
          role: "staff",
          text: "Xin chào quý khách! Đội ngũ Chạm A Lưới có thể hỗ trợ tư vấn điểm đến, lịch trình hoặc homestay cho bạn.",
          createdAt: now
        }
      ]
    };
    store.chats.unshift(session);
  } else {
    if (data.guestName && data.guestName !== "Khách truy cập") session.guestName = data.guestName;
    if (data.guestPhone) session.guestPhone = data.guestPhone;
    session.lastMessage = data.text;
    session.updatedAt = now;
    session.unreadByAdmin = true;
  }

  const newMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    role: "guest",
    text: data.text,
    createdAt: now
  };

  session.messages.push(newMsg);
  saveStore(store);

  return { session, message: newMsg };
}

export function sendStaffMessage(sessionId: string, text: string): { success: boolean; message?: ChatMessage } {
  const store = loadStore();
  if (!store.chats) return { success: false };

  const session = store.chats.find((c) => c.id === sessionId);
  if (!session) return { success: false };

  const now = new Date().toISOString();
  const staffMsg: ChatMessage = {
    id: `msg-${Date.now()}`,
    role: "staff",
    text,
    createdAt: now
  };

  session.messages.push(staffMsg);
  session.lastMessage = text;
  session.updatedAt = now;
  session.unreadByAdmin = false;

  saveStore(store);
  return { success: true, message: staffMsg };
}

// Cấu hình website đồng bộ giữa Admin và Khách
export function getSiteSettings(): SiteSettings {
  const store = loadStore();
  const defaults: SiteSettings = {
    logo: "/images/logo.svg",
    logoDark: "/images/logo-white.svg",
    logoMobile: "/images/logo.svg",
    favicon: "/favicon.ico",
    heroImage: "/images/home-hero-local.jpg",
    aboutHeroImage: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1600&q=82",
    contactAddress: "Huyện A Lưới, Thừa Thiên Huế",
    contactPhone: "0905 000 118",
    contactEmail: "hotro@chamaluoi.vn",
    facebookUrl: "https://facebook.com/chamaluoi",
    instagramUrl: "https://instagram.com/chamaluoi",
    zaloUrl: "https://zalo.me/0905000118",
    footerDescription: "Nền tảng du lịch cộng đồng kết nối du khách với các homestay, làng nghề truyền thống, ẩm thực bản địa và những điểm đến sinh thái nguyên sơ tại A Lưới, Thừa Thiên Huế.",
    announcement: "Chào mừng quý khách đến với du lịch cộng đồng Chạm A Lưới!",
    heroBadge: "Du lịch cộng đồng tại Huế",
    heroTitleLine1: "Chạm A Lưới",
    heroTitleLine2: "Du lịch cộng đồng",
    heroDescription: "Nơi du khách tìm địa điểm đáng tin cậy, nhận voucher trước khi tư vấn và kết nối trực tiếp với doanh nghiệp địa phương.",
    heroPrimaryBtnText: "Khám phá địa điểm",
    heroPrimaryBtnLink: "/places",
    heroSecondaryBtnText: "Đặt tour",
    heroSecondaryBtnLink: "/book-tour",
    heroOverlayOpacity: 60,
    heroPosition: "top",
    heroCardStyle: "crystal",
    heroCardColor: "#0f382e",
    heroCardOpacity: 20,
    heroCardBlur: "md",
    aboutBadge: "Về chúng tôi",
    aboutTitle: "Cầu nối số cho du lịch cộng đồng",
    aboutSubtitle: "Chạm A Lưới là nền tảng du lịch trung gian giúp kết nối du khách với nét đẹp văn hóa bản địa, các chủ nhà homestay ấm áp, đơn vị dịch vụ trách nhiệm và những nghệ nhân vùng cao kiên trì gìn giữ nghề truyền thống.",
    aboutCommitment1: "Minh bạch đối soát",
    aboutCommitment2: "Đồng hành cùng bà con",
    aboutCoreValues: [
      {
        title: "Sứ mệnh",
        text: "Giúp du lịch cộng đồng A Lưới dễ hiểu hơn, dễ đặt hơn và đem lại nguồn sinh kế thực sự cho người dân địa phương."
      },
      {
        title: "Tầm nhìn",
        text: "Trở thành điểm chạm số uy tín nhất phía Tây Thừa Thiên Huế cho những chuyến đi văn hóa bền vững và giàu cảm xúc."
      },
      {
        title: "Giá trị cốt lõi",
        text: "Đặt con người và bản sắc dân tộc Pa Cô, Tà Ôi, Cơ Tu làm trung tâm, công nghệ đóng vai trò cầu nối tiện lợi."
      }
    ],
    aboutTeamMembers: [
      {
        id: "team-1",
        name: "Đặng Thị Hoài",
        role: "Trưởng nhóm & Thiết kế Sản phẩm",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        bio: "Phụ trách định hướng trải nghiệm số, kết nối nền tảng với các hộ kinh doanh du lịch cộng đồng tại A Lưới."
      },
      {
        id: "team-2",
        name: "Hồ Văn Hạnh",
        role: "Đại diện Cộng đồng & Nghệ nhân Tà Ôi",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
        bio: "Cố vấn văn hóa bản địa, kết nối các làng nghề dệt Zèng truyền thống và điểm lưu trú homestay."
      },
      {
        id: "team-3",
        name: "Nguyễn Lê Bảo Trâm",
        role: "Nội dung & Truyền thông Bản địa",
        avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
        bio: "Biên tập câu chuyện văn hóa, hỗ trợ các cơ sở địa phương số hóa hình ảnh và tạo voucher ưu đãi."
      },
      {
        id: "team-4",
        name: "Lê Văn Đạt",
        role: "Kỹ thuật Công nghệ & Vận hành",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
        bio: "Phát triển hệ thống điều phối Lead ID, đối soát hoa hồng và tích hợp kênh kết nối Zalo trực tiếp."
      }
    ],
    aboutImpactTitle: "Tác động cộng đồng",
    aboutImpactItems: [
      "Tạo thu nhập trực tiếp cho chủ nhà và nghệ nhân địa phương",
      "Bảo tồn văn hóa thông qua trải nghiệm có hướng dẫn",
      "Giáo dục du lịch có trách nhiệm cho du khách",
      "Tăng khả năng tiếp cận thị trường cho sản phẩm vùng cao"
    ],
    aboutPartnersTitle: "Mạng lưới Đối tác",
    aboutPartnersText: "Các gia đình homestay địa phương, hợp tác xã dệt thổ cẩm Zèng A Đớt, các đội trekking rừng nguyên sinh, đơn vị lữ hành Huế và các giảng viên cố vấn phát triển cộng đồng."
  };
  return {
    ...defaults,
    ...(store.siteSettings || {})
  };
}


export async function getSiteSettingsAsync(): Promise<SiteSettings> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcunfovtwbzfatudejfs.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdW5mb3Z0d2J6ZmF0dWRlamZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NTM5OSwiZXhwIjoyMTA0OTcxMzk5fQ.7QwyRHqGXa6UwgbUNAhlWdmGZqpuS8Cxall2v8j7lMU';

  if (url && key) {
    try {
      const res = await fetch(`${url}/rest/v1/system_store?id=eq.site_settings&select=data`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        cache: "no-store"
      });
      if (res.ok) {
        const rows = await res.json();
        const cloudData = rows[0]?.data;
        if (cloudData && typeof cloudData === "object") {
          const defaults = getSiteSettings();
          return {
            ...defaults,
            ...cloudData
          };
        }
      }
    } catch {}
  }
  return getSiteSettings();
}

export function updateSiteSettings(settings: Partial<SiteSettings>): SiteSettings {
  const store = loadStore();
  const current = getSiteSettings();
  store.siteSettings = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString()
  };
  saveStore(store);
  return store.siteSettings;
}

// =========================================================================
// QUẢN LÝ BÀI VIẾT BLOG THEO KHỐI (SHOPEE SELLER CENTER STYLE)
// =========================================================================

export const defaultBlogPosts: BlogPostRecord[] = [
  {
    id: "blog-first-time-guide-to-a-luoi",
    slug: "first-time-guide-to-a-luoi",
    title: "Cẩm nang lần đầu du lịch A Lưới",
    category: "Cẩm nang",
    tags: ["A Lưới", "Cẩm nang", "Du lịch cộng đồng", "Khám phá"],
    author: "Ban biên tập Chạm",
    status: "published",
    date: "2026-04-18",
    readingTime: "6 phút đọc",
    image: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
    excerpt: "Cách lên kế hoạch cho một hành trình nhẹ nhàng, tôn trọng qua thác nước, bản làng và cung đường núi.",
    content: "A Lưới dành nhiều điều đẹp cho những ai đi chậm. Hãy bắt đầu với lịch trình do cộng đồng dẫn dắt, chuẩn bị giày thoải mái và dành khoảng trống cho bữa ăn địa phương, những cuộc trò chuyện và workshop thủ công.",
    blocks: [
      {
        id: "b-1",
        type: "paragraph",
        content: "A Lưới dành nhiều điều đẹp cho những ai đi chậm. Hãy bắt đầu với lịch trình do cộng đồng dẫn dắt, chuẩn bị giày thoải mái và dành khoảng trống cho bữa ăn địa phương, những cuộc trò chuyện và workshop thủ công."
      },
      {
        id: "b-2",
        type: "heading",
        level: 2,
        content: "1. Thời điểm lý tưởng nhất trong năm"
      },
      {
        id: "b-3",
        type: "paragraph",
        content: "Mùa khô từ tháng 3 đến tháng 8 là thời điểm tuyệt vời nhất để băng rừng, tắm thác và tham gia các hoạt động ngoài trời. Không khí vùng cao trong lành, đêm mát mẻ dễ chịu."
      },
      {
        id: "b-4",
        type: "image",
        url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=1200&q=80",
        caption: "Cung đường đèo xanh ngát hướng về thung lũng A Lưới",
        alt: "Phong cảnh thung lũng A Lưới",
        width: "full",
        align: "center"
      },
      {
        id: "b-5",
        type: "quote",
        content: "Du lịch cộng đồng phát huy giá trị cao nhất khi du khách đến với lòng tò mò chân thành và sự kiên nhẫn lắng nghe.",
        author: "Người dẫn đường bản địa"
      }
    ],
    seoTitle: "Cẩm nang lần đầu du lịch A Lưới | Chạm A Lưới",
    seoDescription: "Kinh nghiệm du lịch A Lưới chi tiết: cung đường, thác nước, bản làng Tà Ôi - Pa Cô và lịch trình sinh thái trọn vẹn.",
    createdAt: "2026-04-18T08:00:00.000Z",
    updatedAt: "2026-04-18T08:00:00.000Z"
  },
  {
    id: "blog-zeng-weaving-ta-oi-artisans",
    slug: "zeng-weaving-ta-oi-artisans",
    title: "Dệt Zèng và câu chuyện trong từng hoa văn",
    category: "Văn hóa",
    tags: ["Dệt Zèng", "Văn hóa", "Nghệ nhân", "Tà Ôi"],
    author: "Mai Nguyễn",
    status: "published",
    date: "2026-05-02",
    readingTime: "5 phút đọc",
    image: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=80",
    excerpt: "Zèng truyền thống lưu giữ ký ức, bản sắc và sự kiên nhẫn của nghệ nhân Tà Ôi.",
    content: "Mỗi hoa văn không chỉ là trang trí. Đó là ngôn ngữ thị giác được tạo nên từ đời sống miền núi, ký ức gia đình và niềm tự hào gìn giữ nghề qua nhiều thế hệ của đồng bào Tà Ôi.",
    blocks: [
      {
        id: "b-1",
        type: "paragraph",
        content: "Mỗi hoa văn không chỉ là trang trí. Đó là ngôn ngữ thị giác được tạo nên từ đời sống miền núi, ký ức gia đình và niềm tự hào gìn giữ nghề qua nhiều thế hệ của đồng bào Tà Ôi."
      },
      {
        id: "b-2",
        type: "image",
        url: "https://images.unsplash.com/photo-1452860606245-08befc0ff44b?auto=format&fit=crop&w=1200&q=80",
        caption: "Nghệ nhân Tà Ôi cẩn trọng luồn từng hạt cườm vào khung dệt Zèng truyền thống",
        alt: "Khung cửi dệt Zèng truyền thống",
        width: "lg",
        align: "center"
      },
      {
        id: "b-3",
        type: "heading",
        level: 2,
        content: "Kỹ thuật đính cườm độc đáo"
      },
      {
        id: "b-4",
        type: "paragraph",
        content: "Điểm đặc biệt nhất của Zèng A Lưới là các hạt cườm chì hoặc cườm thủy tinh được đính trực tiếp vào sợi chỉ trong quá trình dệt, tạo nên độ nổi khối và bền chắc hàng chục năm."
      }
    ],
    seoTitle: "Nghệ thuật Dệt Zèng của người Tà Ôi | Chạm A Lưới",
    seoDescription: "Tìm hiểu ý nghĩa các họa tiết hoa văn dệt Zèng cổ truyền của người Tà Ôi tại vùng cao A Lưới, Thừa Thiên Huế.",
    createdAt: "2026-05-02T09:00:00.000Z",
    updatedAt: "2026-05-02T09:00:00.000Z"
  },
  {
    id: "blog-local-cuisine-in-the-highlands",
    slug: "local-cuisine-in-the-highlands",
    title: "Ăn gì ở vùng cao A Lưới",
    category: "Ẩm thực",
    tags: ["Ẩm thực", "Đặc sản", "Rau rừng", "Món nướng"],
    author: "Linh Trần",
    status: "published",
    date: "2026-05-22",
    readingTime: "4 phút đọc",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    excerpt: "Món nướng thơm khói, rau rừng, xôi nếp và sự hiếu khách ấm áp của bản làng.",
    content: "Bữa ăn ở A Lưới hào sảng và đậm hồn bản địa. Bạn sẽ gặp rau núi, món nướng, xôi nếp, trà thảo mộc và những câu chuyện được chia sẻ quanh mâm cơm.",
    blocks: [
      {
        id: "b-1",
        type: "paragraph",
        content: "Bữa ăn ở A Lưới hào sảng và đậm hồn bản địa. Bạn sẽ gặp rau núi, cá suối nướng ống nứa, thịt gác bếp thơm nồng tiêu rừng, xôi ngũ sắc dẻo thơm và những ly rượu đoác sủi bọt trắng."
      },
      {
        id: "b-2",
        type: "image",
        url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
        caption: "Mâm cơm truyền thống ấm cúng bên bếp lửa nhà sàn",
        alt: "Ẩm thực A Lưới",
        width: "lg",
        align: "center"
      },
      {
        id: "b-3",
        type: "heading",
        level: 2,
        content: "Hương vị thiên nhiên không lẫn với bất kỳ nơi nào"
      },
      {
        id: "b-4",
        type: "paragraph",
        content: "Các loại gia vị như hạt rừng, ớt bay, tiêu rừng cùng cách chế biến thô mộc giữ nguyên vị ngọt tự nhiên của từng nguyên liệu."
      }
    ],
    seoTitle: "Khám phá ẩm thực truyền thống A Lưới | Chạm A Lưới",
    seoDescription: "Cùng thưởng thức món nướng ống nứa, xôi nếp than, rau dớn xào tỏi và rượu đoác độc đáo của đồng bào vùng cao A Lưới.",
    createdAt: "2026-05-22T10:00:00.000Z",
    updatedAt: "2026-05-22T10:00:00.000Z"
  }
];

export function getBlogPosts(includeDeleted: boolean = false): BlogPostRecord[] {
  const store = loadStore();
  if (!store.blogs || store.blogs.length === 0) {
    store.blogs = [...defaultBlogPosts];
    saveStore(store);
  }
  if (includeDeleted) return store.blogs;
  return store.blogs.filter((b) => !b.isDeleted);
}

export function getBlogPostBySlug(slug: string): BlogPostRecord | undefined {
  const posts = getBlogPosts();
  return posts.find((p) => p.slug === slug);
}

export function getBlogPostById(id: string): BlogPostRecord | undefined {
  const posts = getBlogPosts();
  return posts.find((p) => p.id === id);
}

export function saveBlogPost(post: BlogPostRecord): BlogPostRecord {
  const store = loadStore();
  if (!store.blogs) store.blogs = [...defaultBlogPosts];

  const now = new Date().toISOString();
  const existingIndex = store.blogs.findIndex((p) => p.id === post.id || p.slug === post.slug);

  const updatedPost: BlogPostRecord = {
    ...post,
    updatedAt: now,
    createdAt: post.createdAt || now
  };

  const isNew = existingIndex < 0;
  const oldBlog = isNew ? null : store.blogs[existingIndex];

  if (isNew) {
    store.blogs.unshift(updatedPost);
  } else {
    store.blogs[existingIndex] = updatedPost;
  }

  const blogAction = isNew ? "CREATE" : (oldBlog && oldBlog.status !== updatedPost.status) ? (updatedPost.status === "published" ? "PUBLISH" : "UNPUBLISH") : "UPDATE";

  addAuditLogDirect(store, {
    action: blogAction,
    entityType: "BLOG",
    entityId: updatedPost.id,
    entityTitle: updatedPost.title,
    oldValue: oldBlog ? { title: oldBlog.title, status: oldBlog.status, category: oldBlog.category } : null,
    newValue: { title: updatedPost.title, status: updatedPost.status, category: updatedPost.category },
    summary: isNew ? `Tạo bài viết mới: '${updatedPost.title}'` : `Cập nhật bài viết: '${updatedPost.title}' (Trạng thái: ${updatedPost.status})`
  });

  saveStore(store);
  return updatedPost;
}

export function deleteBlogPost(
  id: string,
  actor?: { id: string; name: string; role: string }
): boolean {
  const store = loadStore();
  if (!store.blogs) return false;
  const post = store.blogs.find((p) => p.id === id || p.slug === id);
  if (!post) return false;

  post.isDeleted = true;
  post.deletedAt = new Date().toISOString();
  if (actor) post.deletedBy = actor.name;

  addAuditLogDirect(store, {
    action: "DELETE",
    actor: actor || { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" },
    entityType: "BLOG",
    entityId: post.id,
    summary: `Xóa (soft-delete) bài viết: ${post.title}`
  });
  saveStore(store);
  return true;
}

export function getPlaces(includeDeleted: boolean = false): PlaceRecord[] {
  const store = loadStore();
  if (!store.places || store.places.length === 0) {
    store.places = places.map((p) => ({
      id: p.slug,
      slug: p.slug,
      name: p.name,
      category: p.category,
      summary: p.summary,
      description: p.description,
      status: (p.status === "temporarily_closed" ? "temporarily_closed" : "active") as "active" | "temporarily_closed" | "hidden",
      image: p.image,
      coverImage: p.image,
      imageAlt: p.name,
      gallery: p.gallery || [],
      priceLabel: p.priceLabel,
      priceUnit: "người",
      voucherOffer: p.voucherOffer,
      voucherTerms: "Áp dụng khi đặt chỗ hoặc nhận mã trước qua Chạm A Lưới",
      openingHours: p.openingHours,
      duration: "2 - 4 tiếng",
      maxGuests: "50 - 100 khách",
      businessName: p.businessName,
      businessId: p.businessId || ("biz-" + p.slug),
      phone: p.phone,
      zaloUrl: p.zaloUrl,
      email: "",
      website: "",
      businessAddress: p.address,
      address: p.address,
      lat: 16.234,
      lng: 107.256,
      mapEmbedUrl: p.mapEmbedUrl,
      directions: "Di chuyển từ trung tâm A Lưới theo bảng chỉ dẫn giao thông.",
      commissionRate: p.commissionRate || 10,
      commissionType: "booking",
      auditStatus: "active",
      highlights: p.highlights || [],
      activities: p.activities || [],
      services: p.services || [],
      safetyNotes: p.safetyNotes || [],
      suitableFor: p.suitableFor || [],
      faq: [
        {
          question: "Đến " + p.name + " cần chuẩn bị những gì?",
          answer: "Nên mang theo trang phục gọn nhẹ, đồ bơi/thay nếu tắm suối, thuốc chống côn trùng và giày thể thao hoặc dép quai hậu chống trượt."
        },
        {
          question: "Có cần đặt chỗ trước không?",
          answer: "Vào các dịp cuối tuần hoặc lễ hội, bạn nên nhận voucher và liên hệ đặt chỗ trước ít nhất 24 giờ để được chuẩn bị chu đáo."
        }
      ],
      seoTitle: p.name + " | Du lịch cộng đồng A Lưới",
      seoDescription: p.summary,
      seoKeywords: p.name + ", du lịch a lưới, du lịch huế, trải nghiệm a lưới",
      ogImage: p.image,
      rating: p.rating || 4.8,
      reviewCount: p.reviewCount || 120,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: new Date().toISOString()
    }));
    saveStore(store);
  }
  if (includeDeleted) return store.places;
  return store.places.filter((p) => !p.isDeleted);
}

export function getPlaceBySlug(slug: string): PlaceRecord | undefined {
  const all = getPlaces();
  return all.find((p) => p.slug === slug || p.slugAliases?.includes(slug));
}

export function getPlaceById(id: string): PlaceRecord | undefined {
  const all = getPlaces();
  return all.find((p) => p.id === id || p.slug === id);
}

export function savePlace(place: Place | PlaceRecord): PlaceRecord {
  const store = loadStore();
  if (!store.places) store.places = [];

  const now = new Date().toISOString();
  const existingIdx = store.places.findIndex((p) => p.id === (place as PlaceRecord).id || p.slug === place.slug);
  const existing = existingIdx >= 0 ? store.places[existingIdx] : undefined;

  const recordInput = place as Partial<PlaceRecord>;
  const aliases = new Set<string>(existing?.slugAliases || []);
  if (recordInput.slugAliases) {
    recordInput.slugAliases.forEach((a: string) => aliases.add(a));
  }
  if (existing && existing.slug && existing.slug !== place.slug) {
    aliases.add(existing.slug);
  }
  aliases.delete(place.slug);

  const updated: PlaceRecord = {
    ...((existing || {}) as PlaceRecord),
    ...(recordInput as PlaceRecord),
    id: recordInput.id || place.slug,
    slugAliases: Array.from(aliases),
    updatedAt: now,
    createdAt: recordInput.createdAt || existing?.createdAt || now
  };

  const isNew = existingIdx < 0;
  const oldPlace = isNew ? null : store.places[existingIdx];

  if (isNew) {
    store.places.unshift(updated);
  } else {
    store.places[existingIdx] = updated;
  }

  let placeAction = isNew ? "CREATE" : "UPDATE";
  let placeReason = "";
  if (oldPlace && oldPlace.commissionRate !== updated.commissionRate) {
    placeAction = "COMMISSION_CHANGE";
    placeReason = `Cập nhật tỷ lệ hoa hồng địa điểm từ ${oldPlace.commissionRate}% sang ${updated.commissionRate}%`;
  }

  addAuditLogDirect(store, {
    action: placeAction,
    entityType: "PLACE",
    entityId: updated.id,
    entityTitle: updated.name,
    oldValue: oldPlace ? { name: oldPlace.name, commissionRate: oldPlace.commissionRate, status: oldPlace.status } : null,
    newValue: { name: updated.name, commissionRate: updated.commissionRate, status: updated.status },
    reason: placeReason,
    summary: isNew ? `Tạo địa điểm mới: '${updated.name}'` : (placeAction === "COMMISSION_CHANGE" ? placeReason : `Cập nhật thông tin địa điểm '${updated.name}'`)
  });

  saveStore(store);
  return updated;
}

export function deletePlace(
  idOrSlug: string,
  actor?: { id: string; name: string; role: string }
): boolean {
  const store = loadStore();
  if (!store.places) return false;
  const place = store.places.find((p) => p.id === idOrSlug || p.slug === idOrSlug);
  if (!place) return false;

  place.isDeleted = true;
  place.deletedAt = new Date().toISOString();
  if (actor) place.deletedBy = actor.name;

  addAuditLogDirect(store, {
    action: "DELETE",
    actor: actor || { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" },
    entityType: "PLACE",
    entityId: place.id,
    summary: `Xóa (soft-delete) địa điểm: ${place.name}`
  });
  saveStore(store);
  return true;
}


// =========================================================================
// TẦNG 3: BOOKINGS & ORDERS MANAGEMENT
// =========================================================================

export function getAllBookings(): BookingRecord[] {
  return loadStore().bookings || [];
}

export function getBookingById(id: string): BookingRecord | undefined {
  return (loadStore().bookings || []).find((b) => b.id === id);
}

export function getBookingsByUser(userId: string): BookingRecord[] {
  return (loadStore().bookings || []).filter((b) => b.userId === userId || b.customerId === userId);
}

export function getBookingsByBusiness(businessId: string): BookingRecord[] {
  return (loadStore().bookings || []).filter((b) => b.businessId === businessId);
}

export function createBooking(payload: {
  leadId?: string;
  placeId?: string;
  source?: string;
  campaign?: string;
  commissionRate?: number;
  type: BookingType;
  customerName: string;
  phone: string;
  email?: string;
  userId?: string;
  customerId?: string;
  itemTitle: string;
  itemId?: string;
  itemSlug?: string;
  serviceOrTourId?: string;
  businessId?: string;
  businessName?: string;
  quantity?: number;
  numberOfPeople?: number;
  startDate?: string;
  experienceDate?: string;
  experienceTime?: string;
  deliveryAddress?: string;
  notes?: string;
  customerNote?: string;
  businessNote?: string;
  unitPrice?: number;
  voucherCode?: string;
  voucher?: string;
  paymentMethod?: PaymentMethod;
  idempotencyKey?: string;
  itineraryDetails?: any;
  metadata?: Record<string, any>;
  actor?: { id: string; name: string; role: string };
}): BookingRecord {
  const store = loadStore();
  if (!store.bookings) store.bookings = [];

  // IDEMPOTENCY CHECK: Tránh tạo trùng booking nếu cùng idempotencyKey hoặc cùng leadId đã có booking
  if (payload.idempotencyKey) {
    const existing = store.bookings.find(b => b.idempotencyKey === payload.idempotencyKey);
    if (existing) return existing;
  }
  if (payload.leadId) {
    const existingLeadBooking = store.bookings.find(b => b.leadId === payload.leadId);
    if (existingLeadBooking) return existingLeadBooking;
  }

  const now = new Date().toISOString();
  const number = Math.floor(10000 + Math.random() * 90000);
  const prefix = payload.type === "product" ? "ORD" : "BK";
  const id = `${prefix}-${number}`;

  const qty = (payload.quantity && payload.quantity > 0) ? payload.quantity : ((payload.numberOfPeople && payload.numberOfPeople > 0) ? payload.numberOfPeople : 1);
  const unitPrice = payload.unitPrice || 0;
  const totalAmount = (payload as any).finalAmount && !(payload.quantity || payload.unitPrice) ? (payload as any).finalAmount : unitPrice * qty;

  let discountAmount = 0;
  if (payload.voucherCode) {
    const voucher = (store.vouchers || []).find(
      (v) => v.voucherCode.toUpperCase() === payload.voucherCode?.toUpperCase().trim() && v.status === "unused"
    );
    if (voucher) {
      discountAmount = Math.round(totalAmount * 0.1); // Giảm 10% nếu có voucher
    }
  }

  const finalAmount = Math.max(0, totalAmount - discountAmount);

  const allPlacesForBooking = (store.places && store.places.length > 0) ? store.places : places;
  const bookingPlace = payload.itemSlug 
    ? allPlacesForBooking.find((p: any) => p.slug === payload.itemSlug || p.id === payload.itemSlug) 
    : (payload.placeId ? allPlacesForBooking.find((p: any) => p.id === payload.placeId || p.slug === payload.placeId) : undefined);
  const rate = payload.commissionRate ?? (bookingPlace?.commissionRate || 10);
  const commAmount = Math.round((finalAmount * rate) / 100);
  const effectiveDate = payload.experienceDate || payload.startDate || now.split("T")[0];
  const effectiveGuests = payload.numberOfPeople || payload.quantity || qty;

  const initialTimeline: BookingTimelineEvent[] = [
    {
      id: `btl-${Date.now()}-1`,
      stage: "created",
      title: "Đơn đặt dịch vụ được tạo",
      description: `Khách hàng ${payload.customerName} đặt ${payload.itemTitle} (${finalAmount.toLocaleString("vi-VN")} đ)`,
      actor: payload.actor || { id: payload.userId || "guest", name: payload.customerName, role: "customer" },
      timestamp: now,
      metadata: { leadId: payload.leadId, source: payload.source }
    }
  ];

  const booking: BookingRecord = {
    id,
    leadId: payload.leadId,
    customerId: payload.customerId || payload.userId,
    userId: payload.userId,
    placeId: payload.placeId || payload.itemSlug,
    serviceOrTourId: payload.serviceOrTourId || payload.itemId,
    itemTitle: payload.itemTitle,
    itemId: payload.itemId,
    itemSlug: payload.itemSlug,
    type: payload.type,
    businessId: payload.businessId,
    businessName: payload.businessName || "Chạm A Lưới",

    customerName: payload.customerName,
    phone: payload.phone,
    email: payload.email,

    bookingDate: now.split("T")[0],
    experienceDate: effectiveDate,
    experienceTime: payload.experienceTime,
    numberOfPeople: effectiveGuests,
    quantity: effectiveGuests,
    startDate: effectiveDate,

    unitPrice,
    subtotal: totalAmount,
    totalAmount,
    discount: discountAmount,
    discountAmount,
    voucher: payload.voucher || payload.voucherCode,
    voucherCode: payload.voucher || payload.voucherCode,
    finalAmount,

    paymentStatus: "unpaid",
    paymentMethod: payload.paymentMethod || "vietqr",

    bookingStatus: "pending",
    status: "pending",

    commissionRate: rate,
    commissionAmount: commAmount,

    customerNote: payload.customerNote || payload.notes,
    notes: payload.customerNote || payload.notes,
    businessNote: payload.businessNote,
    deliveryAddress: payload.deliveryAddress,

    source: payload.source || "WEBSITE",
    campaign: payload.campaign,
    idempotencyKey: payload.idempotencyKey,
    timeline: initialTimeline,
    itineraryDetails: payload.itineraryDetails || (payload as any).metadata?.itinerary,
    metadata: payload.metadata,

    createdAt: now,
    updatedAt: now
  };

  store.bookings.unshift(booking);

  // Tạo thông báo Admin
  const notif: NotificationRecord = {
    id: `notif-${Date.now()}`,
    title: payload.type === "product" ? "Đơn đặt đặc sản mới" : "Đơn đặt tour/homestay mới",
    content: `Khách hàng ${booking.customerName} vừa đặt ${booking.itemTitle} (Mã: ${booking.id}, Tổng: ${booking.finalAmount.toLocaleString("vi-VN")}đ)`,
    type: "system",
    createdAt: now,
    isRead: false,
    link: "/admin/orders"
  };
  store.notifications.unshift(notif);

  // Ghi Audit Log
  addAuditLogDirect(store, {
    action: "booking.create",
    actor: { id: payload.userId || "guest", name: payload.customerName, role: "customer" },
    target: { type: "booking", id: booking.id, title: booking.itemTitle },
    summary: `Khách hàng đặt ${payload.type}: ${booking.itemTitle} (${booking.finalAmount.toLocaleString("vi-VN")}đ)`,
    metadata: { bookingId: booking.id, finalAmount: booking.finalAmount, paymentMethod: booking.paymentMethod }
  });

  saveStore(store);
  // Tự động khởi tạo bản ghi Commission PENDING
  syncBookingCommission(booking.id, { id: payload.userId || "guest", name: payload.customerName, role: "customer" });
  return booking;
}

export function updateBookingStatus(
  id: string,
  status: BookingStatus,
  actor?: { id: string; name: string; role: string },
  cancelReason?: string
): BookingRecord | null {
  const store = loadStore();
  if (!store.bookings) return null;
  const idx = store.bookings.findIndex((b) => b.id === id);
  if (idx === -1) return null;

  const b = store.bookings[idx];
  const oldStatus = b.bookingStatus || b.status;
  if (oldStatus === status) return b; // Idempotent: bỏ qua nếu trùng status

  const now = new Date().toISOString();
  b.bookingStatus = status;
  b.status = status;
  b.updatedAt = now;

  const effectiveActor = actor || { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" };

  let stage: BookingTimelineEvent["stage"] = "confirmed";
  let title = "Cập nhật trạng thái đơn";
  let description = `Chuyển trạng thái từ '${oldStatus}' sang '${status}'`;

  if (status === "confirmed") {
    stage = "confirmed";
    title = "Đã xác nhận đặt chỗ";
    description = "Cơ sở dịch vụ đã xác nhận giữ chỗ và chuẩn bị đón khách.";
  } else if (status === "completed") {
    stage = "completed";
    title = "Đã hoàn thành chuyến đi";
    description = "Khách hàng đã trải nghiệm xong dịch vụ thành công.";
  } else if (status === "cancelled") {
    stage = "cancelled";
    title = "Đã hủy đơn đặt";
    description = cancelReason ? `Đã hủy đơn. Lý do: ${cancelReason}` : "Đã hủy đơn đặt dịch vụ.";
    // Nếu khách đã thanh toán trước mà hủy, đánh dấu cần hoàn tiền
    if (b.paymentStatus === "paid" || b.paymentStatus === "partially_paid") {
      b.paymentStatus = "refunded";
      b.refundedAt = now;
      b.refundAmount = b.finalAmount;
    }
  }

  if (!b.timeline) b.timeline = [];
  b.timeline.push({
    id: `btl-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    stage,
    title,
    description,
    actor: effectiveActor,
    timestamp: now,
    metadata: { oldStatus, newStatus: status, cancelReason }
  });

  addAuditLogDirect(store, {
    action: "booking.update_status",
    actor: effectiveActor,
    target: { type: "booking", id, title: b.itemTitle },
    summary: `Cập nhật trạng thái đơn ${id} từ '${oldStatus}' sang '${status}'`,
    metadata: { oldStatus, newStatus: status, cancelReason }
  });

  saveStore(store);
  // Đồng bộ Commission theo vòng đời Booking (COMPLETED -> CALCULATED, CANCELLED -> CANCELLED)
  syncBookingCommission(id, effectiveActor);
  return b;
}

export function updateBookingPayment(
  id: string,
  paymentStatus: PaymentStatus,
  options?: {
    transactionRef?: string;
    refundAmount?: number;
    actor?: { id: string; name: string; role: string };
    callbackId?: string; // Idempotency check cho payment callback
  }
): BookingRecord | null {
  const store = loadStore();
  if (!store.bookings) return null;
  const idx = store.bookings.findIndex((b) => b.id === id);
  if (idx === -1) return null;

  const b = store.bookings[idx];
  const oldPaymentStatus = b.paymentStatus;
  // Idempotency: nếu cùng paymentStatus và đã paid thì bỏ qua không lặp lại timeline
  if (oldPaymentStatus === paymentStatus && paymentStatus === "paid") {
    return b;
  }

  const now = new Date().toISOString();
  b.paymentStatus = paymentStatus;
  b.updatedAt = now;

  const effectiveActor = options?.actor || { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" };

  let stage: BookingTimelineEvent["stage"] = "paid";
  let title = "Thanh toán";
  let description = `Trạng thái thanh toán: ${paymentStatus}`;

  if (paymentStatus === "paid") {
    b.paidAt = now;
    stage = "paid";
    title = "Đã thanh toán đủ";
    description = `Đã ghi nhận thanh toán ${b.finalAmount.toLocaleString("vi-VN")} đ qua ${b.paymentMethod || "VietQR"}`;
    if (b.status === "pending") {
      b.status = "confirmed";
      b.bookingStatus = "confirmed";
    }
  } else if (paymentStatus === "partially_paid") {
    stage = "partially_paid";
    title = "Thanh toán một phần (Đặt cọc)";
    description = `Đã ghi nhận tiền cọc cho đơn hàng ${b.id}`;
  } else if (paymentStatus === "refunded") {
    b.refundedAt = now;
    b.refundAmount = options?.refundAmount || b.finalAmount;
    stage = "refunded";
    title = "Đã hoàn tiền";
    description = `Đã hoàn trả ${b.refundAmount?.toLocaleString("vi-VN")} đ cho khách hàng`;
  } else if (paymentStatus === "failed") {
    stage = "cancelled";
    title = "Thanh toán thất bại";
    description = "Giao dịch thanh toán không thành công hoặc bị từ chối.";
  }

  if (!b.timeline) b.timeline = [];
  b.timeline.push({
    id: `btl-${Date.now()}-${Math.floor(Math.random()*1000)}`,
    stage,
    title,
    description,
    actor: effectiveActor,
    timestamp: now,
    metadata: { oldPaymentStatus, newPaymentStatus: paymentStatus, transactionRef: options?.transactionRef }
  });

  addAuditLogDirect(store, {
    action: "booking.update_payment",
    actor: effectiveActor,
    target: { type: "booking", id, title: b.itemTitle },
    summary: `Cập nhật thanh toán đơn ${id}: '${paymentStatus}'`,
    metadata: { paymentStatus, finalAmount: b.finalAmount, transactionRef: options?.transactionRef }
  });

  saveStore(store);
  return b;
}

// =========================================================================
// TẦNG 3: REVIEWS & RATINGS MANAGEMENT (CHỈ KHÁCH CÓ BOOKING COMPLETED ĐƯỢC ĐÁNH GIÁ)
// =========================================================================

export function getAllReviews(): ReviewRecord[] {
  return loadStore().reviews || [];
}

export function getReviewsByPlace(placeSlugOrId: string, onlyApproved = true): ReviewRecord[] {
  const reviews = loadStore().reviews || [];
  return reviews.filter(
    (r) =>
      (r.placeSlug === placeSlugOrId || r.placeId === placeSlugOrId) &&
      (!onlyApproved || r.status === "approved")
  );
}

export function getReviewByBookingId(bookingId: string): ReviewRecord | undefined {
  return (loadStore().reviews || []).find((r) => r.bookingId === bookingId);
}

export function canUserReviewBooking(
  bookingId: string,
  customerId?: string,
  customerPhone?: string
): { eligible: boolean; error?: string; booking?: BookingRecord } {
  const store = loadStore();
  const booking = (store.bookings || []).find((b) => b.id === bookingId);

  if (!booking) {
    return { eligible: false, error: "Không tìm thấy mã đơn đặt dịch vụ." };
  }

  // 1. Kiểm tra trạng thái Booking: Chỉ COMPLETED mới được review
  const bStatus = booking.bookingStatus || booking.status;
  if (bStatus !== "completed") {
    return {
      eligible: false,
      error: "Chỉ đơn đặt dịch vụ đã hoàn thành (COMPLETED) mới có thể gửi đánh giá.",
      booking
    };
  }

  // 2. Kiểm tra quyền sở hữu Booking (Booking Ownership)
  if (customerId) {
    const isOwner =
      booking.customerId === customerId ||
      booking.userId === customerId ||
      (customerPhone && booking.phone === customerPhone);
    if (!isOwner) {
      return {
        eligible: false,
        error: "Bạn không phải là người sở hữu đơn đặt dịch vụ này.",
        booking
      };
    }
  }

  // 3. Kiểm tra xem booking đã có review trước đó chưa (1 booking = tối đa 1 review)
  const existingReview = (store.reviews || []).find((r) => r.bookingId === bookingId);
  if (existingReview) {
    return {
      eligible: false,
      error: "Đơn đặt này đã được gửi đánh giá trước đó.",
      booking
    };
  }

  return { eligible: true, booking };
}

export function createReview(payload: {
  bookingId: string;
  customerId?: string;
  authorName?: string;
  authorAvatar?: string;
  authorPhone?: string;
  authorEmail?: string;
  rating: number;
  content: string;
  title?: string;
  images?: string[];
}): { success: boolean; review?: ReviewRecord; error?: string } {
  const store = loadStore();
  if (!store.reviews) store.reviews = [];

  // Validation: Rating 1 -> 5
  const rating = Math.min(5, Math.max(1, Math.round(Number(payload.rating) || 5)));

  // Validation: Content length
  const content = String(payload.content || "").trim();
  if (content.length < 5) {
    return { success: false, error: "Nội dung đánh giá cần tối thiểu 5 ký tự." };
  }
  if (content.length > 2000) {
    return { success: false, error: "Nội dung đánh giá không vượt quá 2000 ký tự." };
  }

  // Kiểm tra tính hợp lệ (Eligibility)
  const check = canUserReviewBooking(payload.bookingId, payload.customerId, payload.authorPhone);
  if (!check.eligible || !check.booking) {
    return { success: false, error: check.error || "Không đủ điều kiện đánh giá." };
  }

  const booking = check.booking;
  const now = new Date().toISOString();
  const id = `REV-${Math.floor(10000 + Math.random() * 90000)}`;

  // Lọc và chuẩn hóa danh sách ảnh (tối đa 5 ảnh)
  const safeImages = Array.isArray(payload.images)
    ? payload.images.filter((img) => typeof img === "string" && img.startsWith("/images/uploads/")).slice(0, 5)
    : [];

  const customerName = payload.authorName || booking.customerName || "Du khách Chạm A Lưới";
  const placeId = booking.placeId || booking.itemSlug || "diem-den";
  const placeSlug = booking.itemSlug || booking.placeId || "diem-den";
  const allPlacesForReview = (store.places && store.places.length > 0) ? store.places : places;
  const targetPlace = allPlacesForReview.find((p: any) => p.id === placeId || p.slug === placeSlug || p.slug === booking.itemSlug);
  const placeName = targetPlace?.name || booking.itemTitle || "Điểm đến A Lưới";

  const review: ReviewRecord = {
    id,
    bookingId: booking.id,
    customerId: payload.customerId || booking.customerId || booking.userId || "guest",
    placeId,
    placeSlug,
    placeName,
    businessId: booking.businessId,
    businessName: booking.businessName,

    authorName: customerName,
    authorAvatar: payload.authorAvatar,
    authorPhone: payload.authorPhone || booking.phone,
    authorEmail: payload.authorEmail || booking.email,

    rating,
    title: payload.title || "Trải nghiệm tại " + (booking.itemTitle || "A Lưới"),
    content,
    comment: content,
    images: safeImages,
    photos: safeImages,

    status: "pending", // Theo yêu cầu: Mặc định PENDING -> Admin duyệt mới APPROVED -> PUBLIC
    createdAt: now,
    updatedAt: now
  };

  store.reviews.unshift(review);

  // Tạo thông báo Admin
  store.notifications.unshift({
    id: `notif-${Date.now()}`,
    title: "Đánh giá mới chờ duyệt",
    content: `Khách hàng ${review.authorName} vừa gửi đánh giá ${review.rating}★ cho ${review.placeName} (Mã đơn: ${booking.id})`,
    type: "system",
    createdAt: now,
    isRead: false,
    link: "/admin/reviews"
  });

  // Ghi Audit Log
  addAuditLogDirect(store, {
    action: "review.create",
    actor: { id: review.customerId, name: review.authorName, role: "customer" },
    target: { type: "review", id: review.id, title: review.placeName },
    summary: `Gửi đánh giá ${review.rating}★ cho đơn ${booking.id}`,
    metadata: { rating: review.rating, bookingId: booking.id, placeId }
  });

  saveStore(store);
  return { success: true, review };
}

export function updateReviewStatus(
  id: string,
  status: ReviewStatus,
  actor?: { id: string; name: string; role: string },
  adminNote?: string
): ReviewRecord | null {
  const store = loadStore();
  if (!store.reviews) return null;
  const idx = store.reviews.findIndex((r) => r.id === id);
  if (idx === -1) return null;

  const r = store.reviews[idx];
  const oldStatus = r.status;
  r.status = status;
  r.updatedAt = new Date().toISOString();
  if (adminNote !== undefined) {
    r.adminNote = adminNote;
  }

  // Tự động tính toán lại điểm rating cho địa điểm nếu chuyển sang hoặc rời khỏi approved
  recalculatePlaceRatingDirect(store, r.placeSlug || r.placeId);

  addAuditLogDirect(store, {
    action: "review.update_status",
    actor: actor || { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" },
    target: { type: "review", id, title: r.placeName },
    summary: `Chuyển trạng thái đánh giá ${id} từ '${oldStatus}' sang '${status}'`,
    metadata: { reviewId: id, oldStatus, newStatus: status, adminNote }
  });

  saveStore(store);
  return r;
}

export function recalculatePlaceRatingDirect(store: StoreData, placeSlugOrId: string) {
  if (!store.places || store.places.length === 0) {
    store.places = JSON.parse(JSON.stringify(places));
  }
  const placeList = store.places;
  if (!placeList) return;
  const place = placeList.find((p: any) => p.slug === placeSlugOrId || p.id === placeSlugOrId);
  if (!place) return;

  // CHỈ LẤY CÁC REVIEW ĐÃ APPROVED
  const approvedReviews = (store.reviews || []).filter(
    (r) =>
      (r.placeSlug === place.slug || r.placeId === place.id || r.placeSlug === place.id) &&
      r.status === "approved"
  );

  if (approvedReviews.length > 0) {
    const sum = approvedReviews.reduce((acc, r) => acc + r.rating, 0);
    place.rating = Number((sum / approvedReviews.length).toFixed(1));
    place.reviewCount = approvedReviews.length;
  } else {
    // Nếu không còn review nào approved, giữ điểm cơ bản 5.0 và 0 count
    place.rating = 5.0;
    place.reviewCount = 0;
  }
}


// =========================================================================

// =========================================================================
// TẦNG 4: PAYMENT MANAGEMENT & VERIFICATION (IDEMPOTENT & SECURE)
// =========================================================================

export function getAllPayments(): PaymentRecord[] {
  return loadStore().payments || [];
}

export function getPaymentById(id: string): PaymentRecord | undefined {
  return (loadStore().payments || []).find((p) => p.id === id || p.paymentCode === id);
}

export function getPaymentsByBookingId(bookingId: string): PaymentRecord[] {
  return (loadStore().payments || []).filter((p) => p.bookingId === bookingId);
}

export function createPayment(params: {
  bookingId: string;
  method: PaymentMethodType;
  provider?: string;
  amount?: number;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
}): { success: boolean; payment?: PaymentRecord; error?: string } {
  const store = loadStore();
  if (!store.payments) store.payments = [];

  const booking = (store.bookings || []).find((b) => b.id === params.bookingId);
  if (!booking) {
    return { success: false, error: "Không tìm thấy đơn đặt (Booking ID)." };
  }

  // Kiểm tra booking không bị hủy
  const bStatus = booking.bookingStatus || booking.status;
  if (bStatus === "cancelled") {
    return { success: false, error: "Đơn đặt này đã bị hủy, không thể tạo yêu cầu thanh toán." };
  }

  // Verify Amount: Số tiền phải khớp chính xác với booking.finalAmount trừ khi có chỉ định cọc
  const targetAmount = params.amount !== undefined ? params.amount : booking.finalAmount;
  if (targetAmount <= 0) {
    return { success: false, error: "Số tiền thanh toán phải lớn hơn 0." };
  }

  // Idempotency: Nếu đã có payment PENDING hoặc PROCESSING cùng bookingId và method, trả về payment đó
  const existing = store.payments.find(
    (p) => p.bookingId === booking.id && (p.status === "PENDING" || p.status === "PROCESSING") && p.method === params.method
  );
  if (existing) {
    return { success: true, payment: existing };
  }

  const now = new Date().toISOString();
  const randNum = Math.floor(10000 + Math.random() * 90000);
  const id = `PAY-${randNum}`;
  const paymentCode = `CAL-${booking.id.replace(/[^A-Za-z0-9]/g, "")}-${randNum}`;

  const provider = params.provider || (params.method === "qr" ? "vietqr" : params.method === "bank_transfer" ? "vietcombank" : params.method === "cod" ? "cod" : "gateway");

  const payment: PaymentRecord = {
    id,
    paymentCode,
    bookingId: booking.id,
    customerId: params.customerId || booking.customerId || booking.userId || "guest",
    customerName: params.customerName || booking.customerName || "Du khách Chạm A Lưới",
    customerPhone: params.customerPhone || booking.phone,
    amount: targetAmount,
    currency: "VND",
    method: params.method,
    status: params.method === "cod" ? "PROCESSING" : "PENDING",
    provider,
    createdAt: now,
    updatedAt: now
  };

  store.payments.unshift(payment);

  addAuditLogDirect(store, {
    action: "payment.create",
    actor: { id: payment.customerId, name: payment.customerName, role: "customer" },
    target: { type: "payment", id: payment.id, title: payment.paymentCode },
    summary: `Tạo yêu cầu thanh toán ${payment.amount.toLocaleString("vi-VN")} đ (${payment.method.toUpperCase()})`,
    metadata: { paymentId: payment.id, bookingId: booking.id, amount: payment.amount }
  });

  saveStore(store);
  return { success: true, payment };
}

export function verifyAndConfirmPayment(params: {
  paymentIdOrCode: string;
  receivedAmount: number;
  providerTransactionId?: string;
  actor?: { id: string; name: string; role: string };
  callbackId?: string;
}): { success: boolean; payment?: PaymentRecord; error?: string; isDuplicate?: boolean } {
  const store = loadStore();
  if (!store.payments) return { success: false, error: "Hệ thống thanh toán chưa sẵn sàng." };

  const payment = store.payments.find(
    (p) => p.id === params.paymentIdOrCode || p.paymentCode === params.paymentIdOrCode
  );
  if (!payment) {
    return { success: false, error: "Không tìm thấy mã giao dịch thanh toán." };
  }

  // IDEMPOTENCY CHECK: Nếu giao dịch đã PAID từ trước
  if (payment.status === "PAID") {
    // Ghi nhận callback log idempotency
    if (!payment.callbackLog) payment.callbackLog = [];
    payment.callbackLog.push({
      timestamp: new Date().toISOString(),
      callbackId: params.callbackId,
      payloadSnippet: `Received: ${params.receivedAmount}`,
      success: true
    });
    saveStore(store);
    return { success: true, payment, isDuplicate: true };
  }

  // SERVER-SIDE SECURITY VERIFICATION: Xác thực số tiền
  if (params.receivedAmount < payment.amount) {
    payment.status = "FAILED";
    payment.updatedAt = new Date().toISOString();
    saveStore(store);
    return {
      success: false,
      error: `Số tiền thanh toán (${params.receivedAmount.toLocaleString("vi-VN")} đ) không đủ so với yêu cầu (${payment.amount.toLocaleString("vi-VN")} đ).`,
      payment
    };
  }

  const now = new Date().toISOString();
  payment.status = "PAID";
  payment.paidAt = now;
  payment.updatedAt = now;
  payment.providerTransactionId = params.providerTransactionId || `TXN-${Date.now()}`;

  if (!payment.callbackLog) payment.callbackLog = [];
  payment.callbackLog.push({
    timestamp: now,
    callbackId: params.callbackId,
    payloadSnippet: `Paid: ${params.receivedAmount}`,
    success: true
  });

  // TỰ ĐỘNG ĐỒNG BỘ VÀO BOOKING: Booking CONFIRMED & Payment PAID
  const booking = (store.bookings || []).find((b) => b.id === payment.bookingId);
  if (booking) {
    booking.paymentStatus = "paid";
    if (booking.bookingStatus === "pending" || booking.status === "pending") {
      booking.bookingStatus = "confirmed";
      booking.status = "confirmed";
    }
    booking.paidAt = now;
    booking.updatedAt = now;

    if (!booking.timeline) booking.timeline = [];
    booking.timeline.push({
      id: `btl-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      stage: "paid",
      title: "Thanh toán thành công",
      description: `Đã xác thực thanh toán ${payment.amount.toLocaleString("vi-VN")} đ qua ${payment.provider.toUpperCase()} (Mã GD: ${payment.providerTransactionId})`,
      actor: params.actor || { id: "payment-system", name: "Hệ thống Thanh toán", role: "system" },
      timestamp: now,
      metadata: { paymentId: payment.id, providerTransactionId: payment.providerTransactionId }
    });
  }

  // Thông báo Admin
  store.notifications.unshift({
    id: `notif-${Date.now()}`,
    title: "Thanh toán đơn đặt thành công",
    content: `Giao dịch ${payment.paymentCode} (${payment.amount.toLocaleString("vi-VN")} đ) đã được thanh toán thành công qua ${payment.provider.toUpperCase()}.`,
    type: "transaction",
    createdAt: now,
    isRead: false,
    link: "/admin/payments"
  });

  addAuditLogDirect(store, {
    action: "payment.paid",
    actor: params.actor || { id: "payment-system", name: "Hệ thống Thanh toán", role: "system" },
    target: { type: "payment", id: payment.id, title: payment.paymentCode },
    summary: `Xác thực thanh toán thành công ${payment.amount.toLocaleString("vi-VN")} đ cho đơn ${payment.bookingId}`,
    metadata: { paymentId: payment.id, bookingId: payment.bookingId, amount: payment.amount, providerTransactionId: payment.providerTransactionId }
  });

  saveStore(store);
  return { success: true, payment, isDuplicate: false };
}

export function processPaymentRefund(params: {
  paymentIdOrCode: string;
  refundAmount?: number;
  reason: string;
  actor: { id: string; name: string; role: string };
}): { success: boolean; payment?: PaymentRecord; error?: string } {
  const store = loadStore();
  if (!store.payments) return { success: false, error: "Hệ thống thanh toán chưa sẵn sàng." };

  const payment = store.payments.find(
    (p) => p.id === params.paymentIdOrCode || p.paymentCode === params.paymentIdOrCode
  );
  if (!payment) {
    return { success: false, error: "Không tìm thấy giao dịch thanh toán." };
  }

  if (payment.status !== "PAID" && payment.status !== "PARTIALLY_REFUNDED") {
    return { success: false, error: "Chỉ giao dịch đã thanh toán (PAID) mới có thể thực hiện hoàn tiền." };
  }

  const now = new Date().toISOString();
  const refundAmount = params.refundAmount && params.refundAmount > 0 ? params.refundAmount : payment.amount;

  if (refundAmount > payment.amount) {
    return { success: false, error: "Số tiền hoàn lại không được vượt quá số tiền thanh toán ban đầu." };
  }

  const isFullRefund = refundAmount >= payment.amount;
  payment.status = isFullRefund ? "REFUNDED" : "PARTIALLY_REFUNDED";
  payment.refundAmount = refundAmount;
  payment.refundReason = params.reason;
  payment.refundedAt = now;
  payment.updatedAt = now;

  // Cập nhật booking sang refunded
  const booking = (store.bookings || []).find((b) => b.id === payment.bookingId);
  if (booking) {
    booking.paymentStatus = "refunded";
    booking.refundAmount = refundAmount;
    booking.refundedAt = now;
    booking.updatedAt = now;

    if (!booking.timeline) booking.timeline = [];
    booking.timeline.push({
      id: `btl-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      stage: "refunded",
      title: isFullRefund ? "Đã hoàn tiền toàn phần" : "Đã hoàn tiền một phần",
      description: `Đã hoàn trả ${refundAmount.toLocaleString("vi-VN")} đ. Lý do: ${params.reason}`,
      actor: params.actor,
      timestamp: now,
      metadata: { paymentId: payment.id, refundAmount, reason: params.reason }
    });
  }

  addAuditLogDirect(store, {
    action: "payment.refund",
    actor: params.actor,
    target: { type: "payment", id: payment.id, title: payment.paymentCode },
    summary: `Hoàn tiền ${refundAmount.toLocaleString("vi-VN")} đ cho giao dịch ${payment.paymentCode}`,
    metadata: { paymentId: payment.id, refundAmount, reason: params.reason }
  });

  saveStore(store);
  // Đồng bộ hoa hồng khi có sự kiện hoàn tiền (Refund)
  if (payment.bookingId) {
    syncBookingCommission(payment.bookingId, params.actor);
  }
  return { success: true, payment };
}

export function cancelPayment(paymentIdOrCode: string, reason?: string): { success: boolean; payment?: PaymentRecord; error?: string } {
  const store = loadStore();
  if (!store.payments) return { success: false, error: "Không tìm thấy bảng payments." };

  const payment = store.payments.find(
    (p) => p.id === paymentIdOrCode || p.paymentCode === paymentIdOrCode
  );
  if (!payment) return { success: false, error: "Không tìm thấy giao dịch." };

  if (payment.status === "PAID") {
    return { success: false, error: "Giao dịch đã thanh toán không thể hủy, vui lòng dùng tính năng hoàn tiền (Refund)." };
  }

  payment.status = "CANCELLED";
  payment.updatedAt = new Date().toISOString();
  saveStore(store);
  return { success: true, payment };
}


// TẦNG 4: COMMISSION SETTLEMENT BATCHES (ĐỐI SOÁT THEO KỲ)
// =========================================================================

export function getAllSettlementBatches(): SettlementBatch[] {
  return loadStore().settlementBatches || [];
}

export function createSettlementBatch(params: {
  businessId: string;
  businessName: string;
  period: string;
  transactionIds: string[];
  notes?: string;
  actor?: { id: string; name: string; role: string };
}): SettlementBatch {
  const store = loadStore();
  if (!store.settlementBatches) store.settlementBatches = [];

  const txs = (store.transactions || []).filter((t) => params.transactionIds.includes(t.id));
  const totalOrderValue = txs.reduce((acc, t) => acc + t.orderValue, 0);
  const totalCommission = txs.reduce((acc, t) => acc + t.commissionAmount, 0);

  const now = new Date().toISOString();
  const id = `STL-${Date.now()}`;

  const batch: SettlementBatch = {
    id,
    businessId: params.businessId,
    businessName: params.businessName,
    period: params.period,
    transactionIds: params.transactionIds,
    totalOrderValue,
    totalCommission,
    payoutStatus: "pending_approval",
    notes: params.notes,
    createdAt: now
  };

  store.settlementBatches.unshift(batch);

  addAuditLogDirect(store, {
    action: "settlement.create",
    actor: params.actor || { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" },
    target: { type: "settlement", id: batch.id, title: params.period },
    summary: `Tạo kỳ đối soát hoa hồng cho ${params.businessName} (Tổng hoa hồng: ${totalCommission.toLocaleString("vi-VN")}đ)`,
    metadata: { batchId: batch.id, totalCommission, transactionCount: txs.length }
  });

  saveStore(store);
  return batch;
}

export function updateSettlementStatus(
  id: string,
  payoutStatus: SettlementStatus,
  payoutProof?: string,
  actor?: { id: string; name: string; role: string }
): SettlementBatch | null {
  const store = loadStore();
  if (!store.settlementBatches) return null;
  const idx = store.settlementBatches.findIndex((s) => s.id === id);
  if (idx === -1) return null;

  const batch = store.settlementBatches[idx];
  batch.payoutStatus = payoutStatus;
  if (payoutProof) batch.payoutProof = payoutProof;
  if (payoutStatus === "completed") {
    batch.settledAt = new Date().toISOString();
    // Đánh dấu các transaction liên quan thành "reconciled"
    (store.transactions || []).forEach((t) => {
      if (batch.transactionIds.includes(t.id)) {
        t.status = "reconciled";
      }
    });
  }

  addAuditLogDirect(store, {
    action: "settlement.update_status",
    actor: actor || { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" },
    target: { type: "settlement", id, title: batch.period },
    summary: `Cập nhật trạng thái đối soát ${id} sang '${payoutStatus}'`,
    metadata: { batchId: id, payoutStatus }
  });

  saveStore(store);
  return batch;
}

// =========================================================================
// TẦNG 4: COMMISSION & RECONCILIATION ENGINE (CHẠM A LƯỚI)
// =========================================================================

/**
 * 2. COMMISSION RATE RESOLUTION HIERARCHY
 * Thứ tự ưu tiên logic: Service -> Place -> Business -> Default sàn (10%)
 */
export function resolveCommissionRate(params: {
  serviceId?: string;
  placeId?: string;
  placeSlug?: string;
  businessId?: string;
}): { rate: number; source: "service" | "place" | "business" | "default" } {
  const store = loadStore();

  // 1. Service/Tour Level (Packages in site.ts or places.activities)
  if (params.serviceId) {
    if (params.serviceId === "short-experience" || params.serviceId === "deep-experience") {
      return { rate: 12, source: "service" };
    }
  }

  // 2. Place Level
  if (params.placeId || params.placeSlug) {
    const p = (store.places || places).find(
      (item: any) => item.id === params.placeId || item.slug === params.placeSlug || item.slug === params.placeId
    );
    if (p && typeof p.commissionRate === "number" && p.commissionRate > 0) {
      return { rate: p.commissionRate, source: "place" };
    }
  }

  // 3. Business Level
  if (params.businessId) {
    const biz = (store.businesses || []).find((b) => b.id === params.businessId);
    if (biz && typeof biz.commissionRate === "number" && biz.commissionRate > 0) {
      return { rate: biz.commissionRate, source: "business" };
    }
  }

  // 4. Default System Sàn
  return { rate: 10, source: "default" };
}

export function getAllCommissions(): CommissionRecord[] {
  const store = loadStore();
  return store.commissions || [];
}

export function getCommissionById(id: string): CommissionRecord | undefined {
  const store = loadStore();
  return (store.commissions || []).find((c) => c.id === id || c.bookingId === id);
}

export function getCommissionsByBusiness(businessId: string): CommissionRecord[] {
  const store = loadStore();
  return (store.commissions || []).filter((c) => c.businessId === businessId);
}

/**
 * 3. KHÔNG TÍNH HOA HỒNG KHI CHƯA HOÀN THÀNH
 * Đồng bộ hoa hồng theo vòng đời Booking (Booking -> Completed -> Calculation -> Pending -> Reconciled)
 * Đảm bảo IDEMPOTENT: Không tạo trùng duplicate commission
 */
export function syncBookingCommission(
  bookingId: string,
  actor?: { id: string; name: string; role: string }
): CommissionRecord | null {
  const store = loadStore();
  if (!store.commissions) store.commissions = [];

  const booking = (store.bookings || []).find((b) => b.id === bookingId);
  if (!booking) return null;

  const now = new Date().toISOString();
  const existingIdx = store.commissions.findIndex((c) => c.bookingId === bookingId);
  let commission = existingIdx >= 0 ? store.commissions[existingIdx] : null;

  const bookingSt = (booking.bookingStatus || booking.status || "pending").toLowerCase();
  const paymentSt = (booking.paymentStatus || "unpaid").toLowerCase();

  // Xác định số tiền cơ sở tính hoa hồng (sau khi trừ refund nếu có)
  const gmv = booking.finalAmount || 0;
  const refunded = booking.refundAmount || 0;
  const commissionBaseAmount = Math.max(0, gmv - refunded);

  // Xác định tỷ lệ hoa hồng
  const rateInfo = resolveCommissionRate({
    serviceId: booking.serviceOrTourId || booking.itemId,
    placeId: booking.placeId,
    placeSlug: booking.itemSlug,
    businessId: booking.businessId
  });

  const rate = commission ? commission.commissionRate : (booking.commissionRate || rateInfo.rate);
  const rateSource = commission ? commission.rateSource : rateInfo.source;
  const commissionAmount = Math.round((commissionBaseAmount * rate) / 100);

  // Xác định status theo quy định mục 3 & 4
  let status: CommissionStatus = "PENDING";

  if (bookingSt === "cancelled" || paymentSt === "failed") {
    status = "CANCELLED";
  } else if (paymentSt === "refunded" && commissionBaseAmount === 0) {
    status = "CANCELLED";
  } else if (bookingSt === "completed") {
    if (commission?.status === "PAID") {
      status = "PAID";
    } else if (commission?.status === "RECONCILED") {
      status = "RECONCILED";
    } else if (commission?.status === "DISPUTED") {
      status = "DISPUTED";
    } else {
      status = "CALCULATED"; // Hoặc READY_FOR_RECONCILIATION
    }
  } else {
    // pending, confirmed: chưa coi là doanh thu cuối cùng
    status = "PENDING";
  }

  if (commission) {
    // Cập nhật record hiện tại
    const oldStatus = commission.status;
    const oldAmount = commission.commissionAmount;

    commission.commissionBaseAmount = commissionBaseAmount;
    commission.commissionAmount = status === "CANCELLED" ? 0 : commissionAmount;
    commission.status = status;
    commission.updatedAt = now;
    if (status === "CALCULATED" && !commission.calculatedAt) {
      commission.calculatedAt = now;
    }

    if (oldStatus !== status || oldAmount !== commission.commissionAmount) {
      addAuditLogDirect(store, {
        action: "commission.sync",
        actor: actor || { id: "system", name: "Hệ thống Tự động", role: "system" },
        target: { type: "commission", id: commission.id, title: booking.id },
        summary: `Đồng bộ hoa hồng đơn ${booking.id}: ${oldStatus} -> ${status} (Giá trị: ${commission.commissionAmount.toLocaleString("vi-VN")}đ)`,
        metadata: { bookingId, oldStatus, newStatus: status, oldAmount, newAmount: commission.commissionAmount }
      });
    }
  } else {
    // Tạo record mới (Idempotent)
    const id = `COMM-${booking.id.replace(/[^A-Za-z0-9]/g, "")}`;
    commission = {
      id,
      bookingId: booking.id,
      businessId: booking.businessId || "biz-general",
      businessName: booking.businessName || "Cơ sở đối tác Chạm A Lưới",
      placeId: booking.placeId || booking.itemSlug || "place-general",
      placeName: booking.itemTitle || "Dịch vụ Chạm A Lưới",
      serviceId: booking.serviceOrTourId || booking.itemId,
      serviceTitle: booking.itemTitle,
      commissionRate: rate,
      rateSource,
      originalAmount: gmv,
      commissionBaseAmount,
      commissionAmount: status === "CANCELLED" ? 0 : commissionAmount,
      status,
      createdAt: now,
      updatedAt: now,
      calculatedAt: status === "CALCULATED" ? now : undefined
    };

    store.commissions.unshift(commission);

    addAuditLogDirect(store, {
      action: "commission.create",
      actor: actor || { id: "system", name: "Hệ thống Tự động", role: "system" },
      target: { type: "commission", id: commission.id, title: booking.id },
      summary: `Khởi tạo bản ghi hoa hồng ${rate}% cho đơn ${booking.id} (Trạng thái: ${status})`,
      metadata: { bookingId, rate, rateSource, status, commissionAmount: commission.commissionAmount }
    });
  }

  saveStore(store);
  return commission;
}

/**
 * 8. DISPUTE COMMISSION
 * Cho phép doanh nghiệp / Admin khiếu nại hoa hồng, lưu vết reason, note, evidence
 */
export function disputeCommission(
  commissionId: string,
  params: {
    reason: string;
    note?: string;
    evidence?: string;
    actor: { id: string; name: string; role: string };
  }
): { success: boolean; commission?: CommissionRecord; error?: string } {
  const store = loadStore();
  if (!store.commissions) return { success: false, error: "Chưa có dữ liệu hoa hồng." };

  const comm = store.commissions.find((c) => c.id === commissionId || c.bookingId === commissionId);
  if (!comm) return { success: false, error: "Không tìm thấy mã hoa hồng." };

  const now = new Date().toISOString();
  const oldStatus = comm.status;
  comm.status = "DISPUTED";
  comm.updatedAt = now;
  comm.dispute = {
    isDisputed: true,
    reason: params.reason,
    note: params.note,
    evidence: params.evidence,
    disputedAt: now
  };

  addAuditLogDirect(store, {
    action: "commission.dispute",
    actor: params.actor,
    target: { type: "commission", id: comm.id, title: comm.bookingId },
    summary: `Khiếu nại hoa hồng đơn ${comm.bookingId}. Lý do: ${params.reason}`,
    metadata: {
      commissionId: comm.id,
      bookingId: comm.bookingId,
      oldStatus,
      newStatus: "DISPUTED",
      reason: params.reason,
      note: params.note,
      evidence: params.evidence
    }
  });

  saveStore(store);
  return { success: true, commission: comm };
}

/**
 * RESOLVE DISPUTE COMMISSION
 */
export function resolveCommissionDispute(
  commissionId: string,
  params: {
    resolution: "accept_original" | "adjusted" | "cancelled";
    adjustedRate?: number;
    adjustedAmount?: number;
    resolutionNote: string;
    actor: { id: string; name: string; role: string };
  }
): { success: boolean; commission?: CommissionRecord; error?: string } {
  const store = loadStore();
  if (!store.commissions) return { success: false, error: "Chưa có dữ liệu hoa hồng." };

  const comm = store.commissions.find((c) => c.id === commissionId || c.bookingId === commissionId);
  if (!comm) return { success: false, error: "Không tìm thấy mã hoa hồng." };

  const now = new Date().toISOString();
  const oldRate = comm.commissionRate;
  const oldAmount = comm.commissionAmount;

  if (params.resolution === "adjusted") {
    if (typeof params.adjustedRate === "number") {
      comm.commissionRate = params.adjustedRate;
      comm.rateSource = "custom";
      comm.commissionAmount = Math.round((comm.commissionBaseAmount * params.adjustedRate) / 100);
    } else if (typeof params.adjustedAmount === "number") {
      comm.commissionAmount = params.adjustedAmount;
    }
    comm.status = "CALCULATED";
  } else if (params.resolution === "cancelled") {
    comm.commissionAmount = 0;
    comm.status = "CANCELLED";
  } else {
    comm.status = "CALCULATED";
  }

  if (comm.dispute) {
    comm.dispute.isDisputed = false;
    comm.dispute.resolvedAt = now;
    comm.dispute.resolutionNote = params.resolutionNote;
  }

  comm.updatedAt = now;

  addAuditLogDirect(store, {
    action: "commission.resolve_dispute",
    actor: params.actor,
    target: { type: "commission", id: comm.id, title: comm.bookingId },
    summary: `Giải quyết khiếu nại hoa hồng đơn ${comm.bookingId}: ${params.resolution} (${params.resolutionNote})`,
    metadata: {
      commissionId: comm.id,
      oldRate,
      newRate: comm.commissionRate,
      oldAmount,
      newAmount: comm.commissionAmount,
      resolution: params.resolution,
      note: params.resolutionNote
    }
  });

  saveStore(store);
  return { success: true, commission: comm };
}

/**
 * 9. AUDIT COMMISSION RATE CHANGE
 * Mọi thay đổi commission rate (vd: 10% -> 12%) phải ghi who, when, old value, new value, reason
 */
export function updateCommissionRateDirect(
  commissionId: string,
  newRate: number,
  reason: string,
  actor: { id: string; name: string; role: string }
): { success: boolean; commission?: CommissionRecord; error?: string } {
  const store = loadStore();
  if (!store.commissions) return { success: false, error: "Chưa có dữ liệu hoa hồng." };

  const comm = store.commissions.find((c) => c.id === commissionId || c.bookingId === commissionId);
  if (!comm) return { success: false, error: "Không tìm thấy mã hoa hồng." };

  if (newRate < 0 || newRate > 100) {
    return { success: false, error: "Tỷ lệ hoa hồng phải từ 0% đến 100%." };
  }

  const oldRate = comm.commissionRate;
  const oldAmount = comm.commissionAmount;
  const now = new Date().toISOString();

  comm.commissionRate = newRate;
  comm.rateSource = "custom";
  comm.commissionAmount = Math.round((comm.commissionBaseAmount * newRate) / 100);
  comm.updatedAt = now;

  addAuditLogDirect(store, {
    action: "commission.rate_change",
    actor,
    target: { type: "commission", id: comm.id, title: comm.bookingId },
    summary: `Điều chỉnh tỷ lệ hoa hồng đơn ${comm.bookingId} từ ${oldRate}% -> ${newRate}%. Lý do: ${reason}`,
    metadata: {
      commissionId: comm.id,
      bookingId: comm.bookingId,
      oldRate,
      newRate,
      oldAmount,
      newAmount: comm.commissionAmount,
      reason,
      who: actor.name,
      when: now
    }
  });

  saveStore(store);
  return { success: true, commission: comm };
}

/**
 * 7. RECONCILIATION BATCH
 * Cho phép tạo batch: RECON-YYYY-MM-XXX (vd RECON-2026-09-001)
 * Gom nhiều booking, tính GMV, Commission, chuyển trạng thái sang RECONCILED
 */
export function getAllReconciliationBatches(): ReconciliationBatchRecord[] {
  const store = loadStore();
  return store.reconciliationBatches || [];
}

export function getReconciliationBatchById(id: string): ReconciliationBatchRecord | undefined {
  const store = loadStore();
  return (store.reconciliationBatches || []).find((b) => b.id === id || b.batchCode === id);
}

export function createReconciliationBatch(params: {
  businessId: string;
  period: string;
  bookingIds: string[];
  notes?: string;
  actor: { id: string; name: string; role: string };
}): { success: boolean; batch?: ReconciliationBatchRecord; error?: string } {
  const store = loadStore();
  if (!store.reconciliationBatches) store.reconciliationBatches = [];
  if (!store.commissions) store.commissions = [];

  const biz = (store.businesses || []).find((b) => b.id === params.businessId);
  const businessName = biz?.name || "Cơ sở đối tác Chạm A Lưới";

  // Lọc các commissions tương ứng với bookingIds
  const targetComms = store.commissions.filter(
    (c) => params.bookingIds.includes(c.bookingId) && c.status !== "CANCELLED"
  );

  if (targetComms.length === 0) {
    return { success: false, error: "Không tìm thấy booking hoặc hoa hồng hợp lệ để tạo đối soát." };
  }

  const now = new Date().toISOString();
  const dateObj = new Date();
  const yearStr = dateObj.getFullYear();
  const monthStr = String(dateObj.getMonth() + 1).padStart(2, "0");

  const existingCountInMonth = store.reconciliationBatches.filter((b) =>
    b.id.startsWith(`RECON-${yearStr}-${monthStr}`)
  ).length;
  const seq = String(existingCountInMonth + 1).padStart(3, "0");
  const batchId = `RECON-${yearStr}-${monthStr}-${seq}`;

  const totalGMV = targetComms.reduce((sum, c) => sum + c.commissionBaseAmount, 0);
  const totalCommission = targetComms.reduce((sum, c) => sum + c.commissionAmount, 0);
  const netPayoutToBusiness = Math.max(0, totalGMV - totalCommission);

  const batch: ReconciliationBatchRecord = {
    id: batchId,
    batchCode: batchId,
    businessId: params.businessId,
    businessName,
    period: params.period,
    bookingIds: targetComms.map((c) => c.bookingId),
    commissionIds: targetComms.map((c) => c.id),
    totalBookings: targetComms.length,
    totalGMV,
    totalCommission,
    netPayoutToBusiness,
    status: "READY_FOR_REVIEW",
    notes: params.notes,
    createdAt: now,
    updatedAt: now
  };

  // Đánh dấu các commission đã gắn vào đợt đối soát
  targetComms.forEach((c) => {
    c.reconciliationBatchId = batchId;
    c.status = "READY_FOR_RECONCILIATION";
    c.updatedAt = now;
  });

  store.reconciliationBatches.unshift(batch);

  addAuditLogDirect(store, {
    action: "reconciliation.create_batch",
    actor: params.actor,
    target: { type: "reconciliation", id: batch.id, title: batch.batchCode },
    summary: `Tạo đợt đối soát ${batch.id} gồm ${batch.totalBookings} đơn (GMV: ${batch.totalGMV.toLocaleString("vi-VN")}đ, Hoa hồng: ${batch.totalCommission.toLocaleString("vi-VN")}đ)`,
    metadata: {
      batchId: batch.id,
      businessId: params.businessId,
      totalGMV,
      totalCommission,
      bookingCount: batch.totalBookings
    }
  });

  saveStore(store);
  return { success: true, batch };
}

/**
 * Admin xác nhận đối soát (CONFIRMED -> RECONCILED)
 */
export function confirmReconciliationBatch(
  batchId: string,
  actor: { id: string; name: string; role: string }
): { success: boolean; batch?: ReconciliationBatchRecord; error?: string } {
  const store = loadStore();
  if (!store.reconciliationBatches) return { success: false, error: "Chưa có đợt đối soát." };

  const batch = store.reconciliationBatches.find((b) => b.id === batchId || b.batchCode === batchId);
  if (!batch) return { success: false, error: "Không tìm thấy đợt đối soát." };

  const now = new Date().toISOString();
  batch.status = "CONFIRMED";
  batch.confirmedAt = now;
  batch.updatedAt = now;

  // Cập nhật các commission thành RECONCILED
  if (store.commissions) {
    store.commissions.forEach((c) => {
      if (batch.commissionIds.includes(c.id) || (c.reconciliationBatchId === batch.id)) {
        if (c.status !== "CANCELLED" && c.status !== "PAID") {
          c.status = "RECONCILED";
          c.reconciledAt = now;
          c.updatedAt = now;
        }
      }
    });
  }

  addAuditLogDirect(store, {
    action: "reconciliation.confirm",
    actor,
    target: { type: "reconciliation", id: batch.id, title: batch.batchCode },
    summary: `Xác nhận hoàn tất đối soát đợt ${batch.batchCode} cho ${batch.businessName}`,
    metadata: { batchId: batch.id, totalCommission: batch.totalCommission }
  });

  saveStore(store);
  return { success: true, batch };
}

/**
 * Thanh toán quyết toán đợt đối soát (PAID)
 */
export function payoutReconciliationBatch(
  batchId: string,
  params: {
    payoutProof?: string;
    notes?: string;
    actor: { id: string; name: string; role: string };
  }
): { success: boolean; batch?: ReconciliationBatchRecord; error?: string } {
  const store = loadStore();
  if (!store.reconciliationBatches) return { success: false, error: "Chưa có đợt đối soát." };

  const batch = store.reconciliationBatches.find((b) => b.id === batchId || b.batchCode === batchId);
  if (!batch) return { success: false, error: "Không tìm thấy đợt đối soát." };

  const now = new Date().toISOString();
  batch.status = "PAID";
  batch.paidAt = now;
  batch.updatedAt = now;
  if (params.payoutProof) batch.payoutProof = params.payoutProof;
  if (params.notes) batch.notes = (batch.notes ? `${batch.notes}. ` : "") + params.notes;

  // Cập nhật các commission thành PAID
  if (store.commissions) {
    store.commissions.forEach((c) => {
      if (batch.commissionIds.includes(c.id) || (c.reconciliationBatchId === batch.id)) {
        if (c.status !== "CANCELLED") {
          c.status = "PAID";
          c.paidAt = now;
          c.updatedAt = now;
        }
      }
    });
  }

  addAuditLogDirect(store, {
    action: "reconciliation.payout",
    actor: params.actor,
    target: { type: "reconciliation", id: batch.id, title: batch.batchCode },
    summary: `Quyết toán chi trả đối soát đợt ${batch.batchCode} cho ${batch.businessName} (Thực nhận: ${batch.netPayoutToBusiness.toLocaleString("vi-VN")}đ)`,
    metadata: { batchId: batch.id, payoutProof: params.payoutProof, netPayout: batch.netPayoutToBusiness }
  });

  saveStore(store);
  return { success: true, batch };
}

/**
 * 5. ADMIN DASHBOARD KPI METRICS
 * GMV, Commission dự kiến, Commission đã ghi nhận, Commission đã đối soát, Commission đã thanh toán, Commission còn phải thu
 */
export function getCommissionDashboardMetrics() {
  const store = loadStore();
  const bookings = store.bookings || [];
  const commissions = store.commissions || [];

  // Tổng GMV toàn sàn
  const totalGMV = bookings
    .filter((b) => (b.bookingStatus || b.status) !== "cancelled")
    .reduce((sum, b) => sum + (b.finalAmount || 0), 0);

  // Commission dự kiến: các booking đang PENDING hoặc CONFIRMED (chưa COMPLETED)
  const pendingExpectedCommission = commissions
    .filter((c) => c.status === "PENDING")
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  // Commission đã ghi nhận: các booking đã COMPLETED (CALCULATED, READY_FOR_RECONCILIATION, RECONCILED, PAID, DISPUTED)
  const recognizedCommission = commissions
    .filter((c) => ["CALCULATED", "READY_FOR_RECONCILIATION", "RECONCILED", "PAID", "DISPUTED"].includes(c.status))
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  // Commission đã đối soát: đã qua bước xác nhận đối soát (RECONCILED, PAID)
  const reconciledCommission = commissions
    .filter((c) => ["RECONCILED", "PAID"].includes(c.status))
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  // Commission đã thanh toán: PAID
  const paidCommission = commissions
    .filter((c) => c.status === "PAID")
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  // Commission còn phải thu / chờ thanh toán: đã ghi nhận nhưng chưa PAID
  const pendingCollectCommission = commissions
    .filter((c) => ["CALCULATED", "READY_FOR_RECONCILIATION", "RECONCILED", "DISPUTED"].includes(c.status))
    .reduce((sum, c) => sum + c.commissionAmount, 0);

  // Số lượng đơn khiếu nại
  const disputedCount = commissions.filter((c) => c.status === "DISPUTED").length;

  return {
    totalGMV,
    pendingExpectedCommission,
    recognizedCommission,
    reconciledCommission,
    paidCommission,
    pendingCollectCommission,
    disputedCount,
    totalCommissionsCount: commissions.length,
    totalBatchesCount: (store.reconciliationBatches || []).length
  };
}


// =========================================================================
// TẦNG 5: USERS & RBAC MANAGEMENT
// =========================================================================

export function getAllUsers(): SystemUser[] {
  return loadStore().users || [];
}

export function createUser(payload: {
  name: string;
  email: string;
  phone?: string;
  role: "customer" | "business" | "admin";
  businessId?: string;
  actor?: { id: string; name: string; role: string };
}): SystemUser {
  const store = loadStore();
  if (!store.users) store.users = [];

  const id = `usr-${payload.role.slice(0, 4)}-${Date.now().toString().slice(-4)}`;
  const user: SystemUser = {
    id,
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    role: payload.role,
    businessId: payload.businessId,
    createdAt: new Date().toISOString().split("T")[0]
  };

  store.users.unshift(user);

  addAuditLogDirect(store, {
    action: "user.create",
    actor: payload.actor || { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" },
    target: { type: "user", id: user.id, title: user.name },
    summary: `Tạo tài khoản người dùng mới: ${user.name} (${user.role})`,
    metadata: { userId: user.id, role: user.role }
  });

  saveStore(store);
  return user;
}

export function updateUser(
  id: string,
  updates: Partial<SystemUser>,
  actor?: { id: string; name: string; role: string }
): SystemUser | null {
  const store = loadStore();
  if (!store.users) return null;
  const idx = store.users.findIndex((u) => u.id === id);
  if (idx === -1) return null;

  store.users[idx] = { ...store.users[idx], ...updates };

  addAuditLogDirect(store, {
    action: "user.update",
    actor: actor || { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" },
    target: { type: "user", id, title: store.users[idx].name },
    summary: `Cập nhật thông tin tài khoản: ${store.users[idx].name}`,
    metadata: updates
  });

  saveStore(store);
  return store.users[idx];
}

export function deleteUser(
  id: string,
  actor?: { id: string; name: string; role: string }
): boolean {
  const store = loadStore();
  if (!store.users) return false;
  const user = store.users.find((u) => u.id === id);
  if (!user) return false;

  user.isDeleted = true;
  user.deletedAt = new Date().toISOString();
  if (actor) user.deletedBy = actor.name;

  addAuditLogDirect(store, {
    action: "user.delete",
    actor: actor || { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" },
    target: { type: "user", id, title: user.name },
    summary: `Xóa (soft-delete) tài khoản người dùng: ${user.name}`,
    metadata: { userId: id }
  });

  saveStore(store);
  return true;
}

// =========================================================================
// TẦNG 5: AUDIT LOGS
// =========================================================================

function addAuditLogDirect(
  store: StoreData,
  log: any
) {
  if (!store.auditLogs) store.auditLogs = [];
  const now = new Date().toISOString();
  
  // Chuẩn hóa bản ghi Audit theo format chuẩn nghiệp vụ
  const entry: AuditLogRecord = {
    id: `LOG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    actorId: log.actorId || log.actor?.id || "system",
    actorName: log.actorName || log.actor?.name || "Hệ thống",
    actorRole: (log.actorRole || log.actor?.role || "ADMIN").toUpperCase(),
    action: (log.action || "UPDATE").toUpperCase(),
    entityType: (log.entityType || log.target?.type || "SYSTEM").toUpperCase(),
    entityId: log.entityId || log.target?.id || "N/A",
    entityTitle: log.entityTitle || log.target?.title || log.title || "",
    oldValue: log.oldValue !== undefined ? log.oldValue : null,
    newValue: log.newValue !== undefined ? log.newValue : null,
    summary: log.summary || `Thao tác ${log.action} trên ${log.entityType || log.target?.type}`,
    ip: log.ip || "127.0.0.1",
    userAgent: log.userAgent || "ChamALuoi CMS/2026",
    reason: log.reason || log.metadata?.reason || "",
    metadata: log.metadata || {},
    timestamp: now
  };

  // APPEND-ONLY: ghi nhận mới nhất vào đầu danh sách
  store.auditLogs.unshift(entry);
  if (store.auditLogs.length > 2000) {
    store.auditLogs = store.auditLogs.slice(0, 2000); // Lưu trữ tới 2000 sự kiện kiểm toán
  }
}

export function addAuditLog(log: any): AuditLogRecord {
  const store = loadStore();
  if (!store.auditLogs) store.auditLogs = [];
  const now = new Date().toISOString();

  const entry: AuditLogRecord = {
    id: `LOG-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    actorId: log.actorId || log.actor?.id || "system",
    actorName: log.actorName || log.actor?.name || "Hệ thống",
    actorRole: (log.actorRole || log.actor?.role || "ADMIN").toUpperCase(),
    action: (log.action || "UPDATE").toUpperCase(),
    entityType: (log.entityType || log.target?.type || "SYSTEM").toUpperCase(),
    entityId: log.entityId || log.target?.id || "N/A",
    entityTitle: log.entityTitle || log.target?.title || log.title || "",
    oldValue: log.oldValue !== undefined ? log.oldValue : null,
    newValue: log.newValue !== undefined ? log.newValue : null,
    summary: log.summary || `Thao tác ${log.action} trên ${log.entityType || log.target?.type}`,
    ip: log.ip || "127.0.0.1",
    userAgent: log.userAgent || "ChamALuoi CMS/2026",
    reason: log.reason || log.metadata?.reason || "",
    metadata: log.metadata || {},
    timestamp: now
  };

  store.auditLogs.unshift(entry);
  if (store.auditLogs.length > 2000) store.auditLogs = store.auditLogs.slice(0, 2000);
  saveStore(store);
  return entry;
}

export function getAllAuditLogs(): AuditLogRecord[] {
  return loadStore().auditLogs || [];
}

// =========================================================================
// TẦNG 5: BACKUP & RECOVERY
// =========================================================================

export function createBackupSnapshot(note?: string): BackupMetadata {
  const store = loadStore();
  if (!store.backups) store.backups = [];

  const now = new Date();
  const dateStr = now.toISOString().replace(/[:.]/g, "-");
  const filename = `backup-cal-store-${dateStr}.json`;
  const backupDir = path.join(path.dirname(getDataFilePath()), "backups");

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupFilePath = path.join(backupDir, filename);
  fs.writeFileSync(backupFilePath, JSON.stringify(store, null, 2), "utf8");

  const meta: BackupMetadata = {
    id: `BAK-${Date.now()}`,
    filename,
    sizeBytes: fs.statSync(backupFilePath).size,
    recordCount: {
      places: store.places?.length || 0,
      blogs: store.blogs?.length || 0,
      leads: store.leads?.length || 0,
      vouchers: store.vouchers?.length || 0,
      bookings: store.bookings?.length || 0,
      payments: store.payments?.length || 0,
      reviews: store.reviews?.length || 0,
      transactions: store.transactions?.length || 0,
      users: store.users?.length || 0
    },
    createdAt: now.toISOString(),
    note: note || "Sao lưu thủ công từ Admin"
  };

  store.backups.unshift(meta);
  const MAX_BACKUPS = 30;
  if (store.backups.length > MAX_BACKUPS) {
    const toRemove = store.backups.slice(MAX_BACKUPS);
    store.backups = store.backups.slice(0, MAX_BACKUPS);
    toRemove.forEach((old) => {
      try {
        const oldPath = path.join(backupDir, old.filename);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      } catch {}
    });
  }
  addAuditLogDirect(store, {
    action: "backup.create",
    actor: { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" },
    target: { type: "backup", id: meta.id, title: filename },
    summary: `Tạo bản sao lưu dữ liệu snapshot ${filename}`,
    metadata: { backupId: meta.id, sizeBytes: meta.sizeBytes }
  });

  saveStore(store);
  return meta;
}

export function getAllBackups(): BackupMetadata[] {
  return loadStore().backups || [];
}

export function restoreBackup(backupId: string): boolean {
  const store = loadStore();
  const meta = (store.backups || []).find((b) => b.id === backupId);
  if (!meta) return false;

  const backupDir = path.join(path.dirname(getDataFilePath()), "backups");
  const backupFilePath = path.join(backupDir, meta.filename);
  if (!fs.existsSync(backupFilePath)) return false;

  const raw = fs.readFileSync(backupFilePath, "utf8");
  const restored = JSON.parse(raw) as StoreData;

  saveStore(restored);

  addAuditLog({
    action: "backup.restore",
    actor: { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" },
    target: { type: "backup", id: meta.id, title: meta.filename },
    summary: `Khôi phục hệ thống từ bản sao lưu ${meta.filename}`,
    metadata: { backupId }
  });

  return true;
}

// =========================================================================
// TẦNG 5: SYSTEM HEALTH MONITORING
// =========================================================================

export function getSystemHealthMetrics(): SystemHealthMetrics {
  const store = loadStore();
  const dataFile = getDataFilePath();
  let sizeBytes = 0;
  try {
    sizeBytes = fs.statSync(dataFile).size;
  } catch {}

  return {
    status: "healthy",
    uptimeSeconds: Math.round(process.uptime()),
    databaseSizeKb: Math.round(sizeBytes / 1024),
    counts: {
      places: store.places?.length || 0,
      blogs: store.blogs?.length || 0,
      leads: store.leads?.length || 0,
      vouchers: store.vouchers?.length || 0,
      bookings: store.bookings?.length || 0,
      payments: store.payments?.length || 0,
      reviews: store.reviews?.length || 0,
      transactions: store.transactions?.length || 0,
      settlements: store.settlementBatches?.length || 0,
      users: store.users?.length || 0,
      auditLogs: store.auditLogs?.length || 0
    },
    serverTime: new Date().toISOString()
  };
}


export function deleteBusiness(
  id: string,
  actor?: { id: string; name: string; role: string }
): boolean {
  const store = loadStore();
  if (!store.businesses) return false;
  const biz = store.businesses.find((b) => b.id === id);
  if (!biz) return false;

  biz.isDeleted = true;
  biz.deletedAt = new Date().toISOString();
  if (actor) biz.deletedBy = actor.name;

  addAuditLogDirect(store, {
    action: "DELETE",
    actor: actor || { id: "usr-admin-1", name: "Ban Quản Trị", role: "admin" },
    entityType: "BUSINESS",
    entityId: id,
    summary: `Xóa (soft-delete) cơ sở đối tác: ${biz.name}`
  });

  saveStore(store);
  return true;
}


export function validateDatabaseIntegrity(): {
  isValid: boolean;
  issues: string[];
  stats: {
    orphanedReviews: number;
    orphanedBookings: number;
    orphanedCommissions: number;
    softDeletedCounts: Record<string, number>;
  };
} {
  const store = loadStore();
  const issues: string[] = [];
  const bookings = store.bookings || [];
  const reviews = store.reviews || [];
  const commissions = store.commissions || [];
  const places = store.places || [];
  const users = store.users || [];

  const bookingIds = new Set(bookings.map((b) => b.id));
  const userIds = new Set(users.map((u) => u.id));

  let orphanedReviews = 0;
  reviews.forEach((r) => {
    if (r.bookingId && !bookingIds.has(r.bookingId)) {
      orphanedReviews++;
      issues.push(`Đánh giá ${r.id} trỏ tới booking ${r.bookingId} không tồn tại.`);
    }
  });

  let orphanedBookings = 0;
  bookings.forEach((b) => {
    if (b.customerId && !userIds.has(b.customerId) && !userIds.has(b.userId || "")) {
      orphanedBookings++;
    }
  });

  let orphanedCommissions = 0;
  commissions.forEach((c) => {
    if (c.bookingId && !bookingIds.has(c.bookingId)) {
      orphanedCommissions++;
      issues.push(`Hoa hồng ${c.id} trỏ tới booking ${c.bookingId} không tồn tại.`);
    }
  });

  const softDeletedCounts = {
    places: (store.places || []).filter((p) => p.isDeleted).length,
    blogs: (store.blogs || []).filter((b) => b.isDeleted).length,
    businesses: (store.businesses || []).filter((b) => b.isDeleted).length,
    users: (store.users || []).filter((u) => u.isDeleted).length,
    bookings: (store.bookings || []).filter((b) => b.isDeleted).length,
    leads: (store.leads || []).filter((l) => l.isDeleted).length
  };

  return {
    isValid: issues.length === 0,
    issues,
    stats: {
      orphanedReviews,
      orphanedBookings,
      orphanedCommissions,
      softDeletedCounts
    }
  };
}

export function getAllPlaces(): Place[] {
  const records = getPlaces(false);
  return records.map((r) => ({
    name: r.name,
    slug: r.slug,
    category: r.category as PlaceCategory,
    businessName: r.businessName,
    summary: r.summary,
    description: r.description,
    address: r.address,
    mapEmbedUrl: r.mapEmbedUrl,
    priceLabel: r.priceLabel,
    voucherOffer: r.voucherOffer,
    commissionRate: r.commissionRate,
    rating: r.rating,
    reviewCount: r.reviewCount,
    openingHours: r.openingHours,
    phone: r.phone,
    zaloUrl: r.zaloUrl,
    image: r.image,
    gallery: (r.gallery || []).map((g) => typeof g === "string" ? g : g.url),
    services: r.services || [],
    highlights: r.highlights || [],
    activities: r.activities || [],
    suitableFor: r.suitableFor || [],
    safetyNotes: r.safetyNotes || [],
    status: (r.status === "temporarily_closed" ? "temporarily_closed" : "active") as "active" | "temporarily_closed"
  }));
}

export function getActivePlaces(): Place[] {
  return getAllPlaces().filter((p) => p.status === "active");
}

export function getDynamicPlaceBySlug(slug: string): Place | undefined {
  return getAllPlaces().find((p) => p.slug === slug);
}

