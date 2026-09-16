"use server";

import {
  createLead,
  getAllLeads,
  getLeadById,
  getLeadsByBusiness,
  getLeadsByUser,
  updateLeadStatus,
  assignLeadBusinessAndStaff,
  addLeadNote,
  convertLeadToBooking,
  softDeleteLead,
  type BookingRecord
} from "@/lib/server-store";
import type { LeadPayload, LeadStatus, LeadRecord, LeadLossReason, LeadSource } from "@/lib/leads";
import { revalidatePath } from "next/cache";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcunfovtwbzfatudejfs.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdW5mb3Z0d2J6ZmF0dWRlamZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NTM5OSwiZXhwIjoyMTA0OTcxMzk5fQ.7QwyRHqGXa6UwgbUNAhlWdmGZqpuS8Cxall2v8j7lMU';

async function syncLeadToCloud(lead: LeadRecord) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/system_store?id=eq.leads_store&select=data`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      cache: "no-store"
    });
    let all: LeadRecord[] = [];
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows[0]?.data)) all = rows[0].data;
    }
    const updated = [lead, ...all.filter(l => l.leadId !== lead.leadId)];
    await fetch(`${SUPABASE_URL}/rest/v1/system_store`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates"
      },
      body: JSON.stringify({
        id: "leads_store",
        data: updated,
        updated_at: new Date().toISOString()
      })
    });
  } catch (e) {
    console.error("[SYNC_LEAD_CLOUD_ERR]", e);
  }
}


export async function submitLeadAction(payload: LeadPayload) {
  try {
    if (!payload.customerName || !payload.phone || !payload.expectedDate) {
      return { success: false, error: "Vui lòng điền đầy đủ họ tên, số điện thoại và ngày dự kiến." };
    }

    const { lead, voucher } = createLead({
      ...payload,
      source: payload.source || "WEBSITE"
    });

    await syncLeadToCloud(lead);
    revalidatePath("/places");
    revalidatePath("/places/" + payload.placeSlug);
    revalidatePath("/account");
    revalidatePath("/admin");
    revalidatePath("/admin/leads");
    revalidatePath("/business/leads");

    return {
      success: true,
      leadId: lead.leadId,
      voucherCode: voucher.voucherCode,
      discountOffer: voucher.discountOffer,
      expiresAt: voucher.expiresAt,
      placeName: lead.placeName
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Đã có lỗi xảy ra khi tạo yêu cầu tư vấn."
    };
  }
}

export async function fetchAllLeadsAction(includeDeleted: boolean = false): Promise<LeadRecord[]> {
  return getAllLeads(includeDeleted);
}

export async function fetchLeadByIdAction(leadId: string): Promise<LeadRecord | null> {
  const lead = getLeadById(leadId);
  return lead || null;
}

export async function updateLeadStatusAction(
  leadId: string,
  status: LeadStatus,
  options?: {
    lossReason?: LeadLossReason;
    lossNote?: string;
    actor?: { id: string; name: string; role: string };
  }
) {
  try {
    const updated = updateLeadStatus(leadId, status, options);
    if (!updated) {
      return { success: false, error: "Không tìm thấy Lead ID." };
    }

    revalidatePath("/admin/leads");
    revalidatePath("/admin/leads/" + leadId);
    revalidatePath("/business/leads");
    revalidatePath("/account");

    return { success: true, lead: updated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi khi cập nhật trạng thái."
    };
  }
}

export async function assignLeadAction(
  leadId: string,
  params: {
    businessId?: string;
    businessName?: string;
    staffId?: string;
    staffName?: string;
    nextFollowUpAt?: string;
    actor?: { id: string; name: string; role: string };
  }
) {
  try {
    const updated = assignLeadBusinessAndStaff(leadId, params);
    if (!updated) {
      return { success: false, error: "Không tìm thấy Lead ID." };
    }

    revalidatePath("/admin/leads");
    revalidatePath("/admin/leads/" + leadId);
    revalidatePath("/business/leads");

    return { success: true, lead: updated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi khi phân công xử lý Lead."
    };
  }
}

export async function addLeadNoteAction(
  leadId: string,
  content: string,
  actor: { id: string; name: string; role: string }
) {
  try {
    if (!content.trim()) {
      return { success: false, error: "Nội dung ghi chú không được để trống." };
    }
    const updated = addLeadNote(leadId, content.trim(), actor);
    if (!updated) {
      return { success: false, error: "Không tìm thấy Lead ID." };
    }

    revalidatePath("/admin/leads/" + leadId);
    return { success: true, lead: updated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi khi thêm ghi chú tư vấn."
    };
  }
}

export async function convertLeadToBookingAction(
  leadId: string,
  bookingDetails: {
    type: "tour" | "homestay" | "product";
    itemTitle: string;
    unitPrice: number;
    quantity: number;
    startDate?: string;
    deliveryAddress?: string;
    notes?: string;
    actor?: { id: string; name: string; role: string };
  }
) {
  try {
    const result = convertLeadToBooking(leadId, bookingDetails);
    if (!result.success) {
      return { success: false, error: result.error || "Không thể chuyển Lead thành Booking." };
    }

    revalidatePath("/admin/leads");
    revalidatePath("/admin/leads/" + leadId);
    revalidatePath("/admin/orders");
    revalidatePath("/business/leads");
    revalidatePath("/account");

    return {
      success: true,
      booking: result.booking,
      lead: result.lead
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi khi chuyển đổi Lead sang Booking."
    };
  }
}

export async function softDeleteLeadAction(
  leadId: string,
  actor?: { id: string; name: string; role: string }
) {
  try {
    const deleted = softDeleteLead(leadId, actor);
    if (!deleted) {
      return { success: false, error: "Không tìm thấy Lead ID." };
    }

    revalidatePath("/admin/leads");
    return { success: true, lead: deleted };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Lỗi khi ẩn Lead."
    };
  }
}

export async function fetchBusinessLeadsAction(businessId: string) {
  return getLeadsByBusiness(businessId);
}

export async function fetchUserLeadsAction(userId: string) {
  return getLeadsByUser(userId);
}
