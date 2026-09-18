import fs from "fs";
import path from "path";
import type { LeadRecord, Voucher, TransactionRecord, LeadPayload, LeadStatus } from "@/lib/leads";
import { createLeadCode, createVoucherCode, calculateCommission } from "@/lib/leads";
import { places, type Place } from "@/data/places";

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
  role: "customer" | "business" | "admin";
  businessId?: string;
  createdAt: string;
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

export type SiteSettings = {
  logo?: string;
  logoDark?: string;
  logoMobile?: string;
  favicon?: string;
  heroImage?: string;
  aboutHeroImage?: string;
  contactPhone?: string;
  contactEmail?: string;
  announcement?: string;
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
  | { id: string; type: "code"; code: string; language?: string };

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
  seoTitle?: string;
  seoDescription?: string;
  blocks: BlogContentBlock[];
  content?: string;
  createdAt: string;
  updatedAt: string;
};

type StoreData = {
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
  places?: Place[];
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

function loadStore(): StoreData {
  try {
    const currentFile = getDataFilePath();
    if (fs.existsSync(currentFile)) {
      const raw = fs.readFileSync(currentFile, "utf-8");
      inMemoryStore = JSON.parse(raw) as StoreData;
      if (!inMemoryStore.places || inMemoryStore.places.length === 0) {
        inMemoryStore.places = [...places];
        saveStore(inMemoryStore);
      }
      return inMemoryStore;
    }
  } catch {
    if (inMemoryStore) return inMemoryStore;
  }

  if (inMemoryStore) return inMemoryStore;

  inMemoryStore = {
    leads: initialLeads,
    vouchers: initialVouchers,
    transactions: initialTransactions,
    businesses: initialBusinesses,
    notifications: initialNotifications,
    users: initialUsers,
    places: [...places]
  };

  saveStore(inMemoryStore);
  return inMemoryStore;
}

function saveStore(data: StoreData) {
  inMemoryStore = data;
  try {
    const targetFile = getDataFilePath();
    const dir = path.dirname(targetFile);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(targetFile, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // ignore
  }
}

// Leads API
export function getAllLeads(): LeadRecord[] {
  return loadStore().leads;
}

export function getLeadById(leadId: string): LeadRecord | undefined {
  return loadStore().leads.find((l) => l.leadId === leadId);
}

export function getLeadsByBusiness(businessId: string): LeadRecord[] {
  const store = loadStore();
  return store.leads.filter((l) => l.businessId === businessId);
}

export function getLeadsByUser(userId: string): LeadRecord[] {
  const store = loadStore();
  return store.leads.filter((l) => l.userId === userId);
}

export function createLead(payload: LeadPayload): { lead: LeadRecord; voucher: Voucher } {
  const store = loadStore();
  const leadId = createLeadCode();
  const voucherCode = createVoucherCode();

  const place = places.find((p) => p.slug === payload.placeSlug);
  const businessName = payload.businessName || place?.businessName || "Đối tác Chạm A Lưới";
  const businessId = payload.businessId || place?.businessId;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const lead: LeadRecord = {
    leadId,
    voucherCode,
    placeSlug: payload.placeSlug,
    placeName: payload.placeName,
    businessName,
    businessId,
    customerName: payload.customerName,
    phone: payload.phone,
    email: payload.email,
    expectedDate: payload.expectedDate,
    guests: payload.guests,
    need: payload.need,
    status: "new",
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
    link: "/admin/leads"
  };

  store.leads.unshift(lead);
  store.vouchers.unshift(voucher);
  store.notifications.unshift(notif);
  saveStore(store);

  return { lead, voucher };
}

export function updateLeadStatus(leadId: string, status: LeadStatus): LeadRecord | null {
  const store = loadStore();
  const leadIndex = store.leads.findIndex((l) => l.leadId === leadId);
  if (leadIndex === -1) return null;

  store.leads[leadIndex].status = status;
  store.leads[leadIndex].updatedAt = new Date().toISOString();
  saveStore(store);
  return store.leads[leadIndex];
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
  return (
    store.siteSettings || {
      logo: "/images/logo.svg",
      logoDark: "/images/logo-white.svg",
      logoMobile: "/images/logo.svg",
      favicon: "/favicon.ico",
      heroImage: "/images/home-hero-local.jpg",
      aboutHeroImage: "https://images.unsplash.com/photo-1482192505345-5655af888cc4?auto=format&fit=crop&w=1600&q=82",
      contactPhone: "0912 345 678",
      contactEmail: "lienhe@chamaluoi.vn",
      announcement: "Chào mừng quý khách đến với du lịch cộng đồng Chạm A Lưới!"
    }
  );
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

export function getBlogPosts(): BlogPostRecord[] {
  const store = loadStore();
  if (!store.blogs || store.blogs.length === 0) {
    store.blogs = [...defaultBlogPosts];
    saveStore(store);
  }
  return store.blogs;
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

  if (existingIndex >= 0) {
    store.blogs[existingIndex] = updatedPost;
  } else {
    store.blogs.unshift(updatedPost);
  }

  saveStore(store);
  return updatedPost;
}

export function deleteBlogPost(id: string): boolean {
  const store = loadStore();
  if (!store.blogs) return false;
  const initialLen = store.blogs.length;
  store.blogs = store.blogs.filter((p) => p.id !== id && p.slug !== id);
  if (store.blogs.length !== initialLen) {
    saveStore(store);
    return true;
  }
  return false;
}

// =========================================================================
// PLACES DYNAMIC API (Hỗ trợ nạp dữ liệu động vào AI & Website)
// =========================================================================
export function getAllPlaces(): Place[] {
  const store = loadStore();
  if (!store.places || store.places.length === 0) {
    store.places = [...places];
    saveStore(store);
  }
  return store.places;
}

export function getActivePlaces(): Place[] {
  return getAllPlaces().filter((p) => p.status === "active");
}

export function getPlaceBySlug(slug: string): Place | undefined {
  return getAllPlaces().find((p) => p.slug === slug);
}

export function savePlace(placeData: Place): Place {
  const store = loadStore();
  if (!store.places) store.places = [...places];

  const existingIdx = store.places.findIndex((p) => p.slug === placeData.slug);
  if (existingIdx >= 0) {
    store.places[existingIdx] = { ...store.places[existingIdx], ...placeData };
  } else {
    store.places.unshift(placeData);
  }
  saveStore(store);
  return placeData;
}

export function deletePlace(slug: string): boolean {
  const store = loadStore();
  if (!store.places) return false;
  const initialLen = store.places.length;
  store.places = store.places.filter((p) => p.slug !== slug);
  if (store.places.length !== initialLen) {
    saveStore(store);
    return true;
  }
  return false;
}

