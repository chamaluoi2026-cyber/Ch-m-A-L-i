import {
  getAllBookings,
  getAllLeads,
  getChatSessions,
  getAllReviews,
  getAllPayments,
  getNotifications,
  getAllCommissions,
  getAllTransactions,
  getAllReconciliationBatches,
  type BookingRecord,
  type ChatSession
} from "@/lib/server-store";
import type { LeadRecord } from "@/lib/leads";

export interface AdminLatestAlert {
  id: string;
  type: "chat" | "booking" | "order" | "lead";
  title: string;
  description: string;
  link: string;
  timestamp: string;
}

export type AdminBadgeKey =
  | "chat"
  | "leads"
  | "bookings"
  | "payments"
  | "reviews"
  | "vouchers"
  | "transactions"
  | "commissions"
  | "reconciliation"
  | "orders"
  | "notifications";

export interface AdminBadgeCounts {
  chat: number;
  leads: number;
  bookings: number;
  payments: number;
  reviews: number;
  vouchers: number;
  transactions: number;
  commissions: number;
  reconciliation: number;
  orders: number;
  notifications: number;
  latestAlert?: AdminLatestAlert | null;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcunfovtwbzfatudejfs.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdW5mb3Z0d2J6ZmF0dWRlamZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NTM5OSwiZXhwIjoyMTA0OTcxMzk5fQ.7QwyRHqGXa6UwgbUNAhlWdmGZqpuS8Cxall2v8j7lMU';

async function fetchStoreFromCloud<T>(storeId: string): Promise<T | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/system_store?id=eq.${storeId}&select=data`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      cache: "no-store"
    });
    if (res.ok) {
      const rows = await res.json();
      if (rows && rows[0]?.data) {
        return rows[0].data as T;
      }
    }
  } catch (e) {
    // Fallback silent error
  }
  return null;
}

export async function getAdminSidebarBadgeCounts(): Promise<AdminBadgeCounts> {
  // 1. Fetch Cloud or fallback for Bookings, Leads, Chats
  const [cloudBookings, cloudLeads, cloudChats] = await Promise.all([
    fetchStoreFromCloud<BookingRecord[]>("bookings_store"),
    fetchStoreFromCloud<LeadRecord[]>("leads_store"),
    fetchStoreFromCloud<ChatSession[]>("chats_store")
  ]);

  const bookings = cloudBookings || getAllBookings();
  const leads = cloudLeads || (getAllLeads ? getAllLeads() : []);
  const chats = cloudChats || getChatSessions();
  const reviews = getAllReviews ? getAllReviews() : [];
  const payments = getAllPayments ? getAllPayments() : [];
  const notifs = getNotifications ? getNotifications() : [];
  const commissions = getAllCommissions ? getAllCommissions() : [];
  const transactions = getAllTransactions ? getAllTransactions() : [];
  const reconciliations = getAllReconciliationBatches ? getAllReconciliationBatches() : [];

  // Calculate counts
  const pendingBookings = bookings.filter((b) => b.status === "pending" && b.type !== "product").length;
  const pendingOrders = bookings.filter((b) => b.status === "pending" && b.type === "product").length;
  const newLeads = leads.filter((l) => l.status === "new" && !l.isDeleted).length;
  const waitingChats = chats.filter(
    (c) => Boolean(c.unreadByAdmin) || Boolean((c as any).unreadCount && (c as any).unreadCount > 0) || (c as any).status === "waiting"
  ).length;
  const pendingReviews = reviews.filter((r) => r.status === "pending").length;
  const pendingPayments = payments.filter(
    (p) => p.status === "PENDING" || p.status === "PROCESSING" || (p.status as string) === "pending"
  ).length;
  const pendingCommissions = commissions.filter(
    (c) => (c.status as string) === "pending" || (c.status as string) === "disputed"
  ).length;
  const pendingTransactions = transactions.filter(
    (t) => t.status === "pending_reconciliation"
  ).length;
  const pendingReconciliation = reconciliations.filter(
    (r) => (r.status as string) === "pending" || (r.status as string) === "waiting_approval"
  ).length;
  const unreadNotifs = notifs.filter((n) => !n.isRead).length;

  // 2. Tìm sự kiện cảnh báo mới nhất cần xử lý gấp
  let latestAlert: AdminLatestAlert | null = null;
  const candidateAlerts: AdminLatestAlert[] = [];

  // Chat chờ phản hồi
  const unreadChats = chats.filter(
    (c) => Boolean(c.unreadByAdmin) || Boolean((c as any).unreadCount && (c as any).unreadCount > 0) || (c as any).status === "waiting"
  );
  if (unreadChats.length > 0) {
    const sortedChats = [...unreadChats].sort(
      (a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime()
    );
    const c = sortedChats[0];
    candidateAlerts.push({
      id: c.id,
      type: "chat",
      title: "Khách mới nhắn tin!",
      description: `${c.guestName || "Khách truy cập"}: "${c.lastMessage || "Khách cần hỗ trợ tư vấn..."}"`,
      link: `/admin/chat?session=${c.id}`,
      timestamp: c.updatedAt || (c as any).createdAt || new Date().toISOString()
    });
  }

  // Đơn Tour chờ duyệt
  const pendingTours = bookings.filter((b) => b.status === "pending" && b.type !== "product");
  if (pendingTours.length > 0) {
    const sortedTours = [...pendingTours].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    const b = sortedTours[0];
    candidateAlerts.push({
      id: b.id,
      type: "booking",
      title: "Có đơn Tour mới!",
      description: `${b.customerName} đặt tour ${(b as any).tourName || (b as any).serviceName || "Chạm A Lưới"}`,
      link: `/admin/bookings/${b.id}`,
      timestamp: b.createdAt || new Date().toISOString()
    });
  }

  // Đơn hàng Đặc sản chờ duyệt
  const pendingProducts = bookings.filter((b) => b.status === "pending" && b.type === "product");
  if (pendingProducts.length > 0) {
    const sortedProducts = [...pendingProducts].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    const p = sortedProducts[0];
    candidateAlerts.push({
      id: p.id,
      type: "order",
      title: "Có đơn Đặc sản mới!",
      description: `${p.customerName} đặt mua đặc sản A Lưới`,
      link: `/admin/bookings/${p.id}`,
      timestamp: p.createdAt || new Date().toISOString()
    });
  }

  // Khách để lại SĐT tư vấn
  const newLeadsList = leads.filter((l) => l.status === "new" && !l.isDeleted);
  if (newLeadsList.length > 0) {
    const sortedLeads = [...newLeadsList].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
    const l = sortedLeads[0];
    candidateAlerts.push({
      id: l.leadId,
      type: "lead",
      title: "Khách để lại SĐT!",
      description: `${l.customerName}: ${l.phone || ""}`,
      link: "/admin/leads",
      timestamp: l.createdAt || new Date().toISOString()
    });
  }

  if (candidateAlerts.length > 0) {
    candidateAlerts.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    latestAlert = candidateAlerts[0];
  }

  return {
    chat: waitingChats,
    leads: newLeads,
    bookings: pendingBookings,
    orders: pendingOrders,
    payments: pendingPayments,
    reviews: pendingReviews,
    vouchers: 0,
    transactions: pendingTransactions,
    commissions: pendingCommissions,
    reconciliation: pendingReconciliation,
    notifications: unreadNotifs,
    latestAlert
  };
}
