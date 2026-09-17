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
    notifications: unreadNotifs
  };
}
