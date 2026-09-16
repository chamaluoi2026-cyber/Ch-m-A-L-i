import { NextRequest, NextResponse } from "next/server";
import {
  type LeadPayload,
  type LeadRecord,
  type LeadStatus,
  type LeadLossReason,
  type Voucher,
  createLeadCode,
  createVoucherCode
} from "@/lib/leads";

import { sendTelegramNotification } from "@/lib/notification/telegram";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcunfovtwbzfatudejfs.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdW5mb3Z0d2J6ZmF0dWRlamZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NTM5OSwiZXhwIjoyMTA0OTcxMzk5fQ.7QwyRHqGXa6UwgbUNAhlWdmGZqpuS8Cxall2v8j7lMU';

async function fetchLeadsFromCloud(): Promise<LeadRecord[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/system_store?id=eq.leads_store&select=data`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      cache: "no-store"
    });
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows[0]?.data)) {
        return rows[0].data as LeadRecord[];
      }
    }
  } catch (e) {
    console.error("[LEADS_CLOUD_FETCH_ERR]", e);
  }
  return [];
}

async function saveLeadsToCloud(leads: LeadRecord[]): Promise<boolean> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/system_store`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates"
      },
      body: JSON.stringify({
        id: "leads_store",
        data: leads,
        updated_at: new Date().toISOString()
      })
    });
    return res.ok;
  } catch (e) {
    console.error("[LEADS_CLOUD_SAVE_ERR]", e);
    return false;
  }
}

// GET /api/leads - Lấy danh sách Leads từ Supabase Cloud
export async function GET(req: NextRequest) {
  try {
    const leads = await fetchLeadsFromCloud();
    return NextResponse.json({
      success: true,
      total: leads.length,
      data: leads
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: "Lỗi tải dữ liệu leads từ hệ thống." },
      { status: 500 }
    );
  }
}

// POST /api/leads - Khách hàng gửi yêu cầu tư vấn & nhận mã ưu đãi
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      placeSlug,
      placeName,
      businessName,
      businessId,
      customerName,
      phone,
      email,
      zalo,
      expectedDate,
      preferredTime,
      guests,
      need,
      serviceOrTour,
      budget,
      source,
      campaign,
      landingPage,
      utmSource,
      utmMedium,
      utmCampaign,
      consent,
      userId
    } = body;

    if (!customerName || !phone || !expectedDate) {
      return NextResponse.json(
        { success: false, error: "Vui lòng cung cấp đầy đủ họ tên, số điện thoại và ngày dự kiến." },
        { status: 400 }
      );
    }

    const now = new Date();
    const leadId = createLeadCode(now);
    const voucherCode = createVoucherCode();

    const voucher: Voucher = {
      voucherCode,
      discountOffer: "Ưu đãi trải nghiệm 10% tại điểm đến A Lưới",
      startDate: now.toISOString(),
      expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      placeSlug: placeSlug || "a-luoi",
      placeName: placeName || "Điểm đến A Lưới",
      status: "unused",
      leadId
    };

    const newLead: LeadRecord = {
      leadId,
      voucherCode,
      placeSlug: placeSlug || "a-luoi",
      placeName: placeName || "Điểm đến A Lưới",
      businessName: businessName || "Đối tác Chạm A Lưới",
      businessId,
      customerId: userId || "CUST-GUEST",
      customerName: String(customerName).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim() : undefined,
      zalo: zalo ? String(zalo).trim() : String(phone).trim(),
      expectedDate: String(expectedDate).trim(),
      preferredTime: preferredTime ? String(preferredTime).trim() : undefined,
      guests: Number(guests) || 2,
      need: need ? String(need).trim() : "Tư vấn trải nghiệm tại điểm đến",
      serviceOrTour: serviceOrTour ? String(serviceOrTour).trim() : undefined,
      budget: budget ? String(budget).trim() : undefined,
      source: source || "WEBSITE",
      campaign: campaign ? String(campaign).trim() : undefined,
      landingPage: landingPage ? String(landingPage).trim() : undefined,
      utmSource: utmSource ? String(utmSource).trim() : undefined,
      utmMedium: utmMedium ? String(utmMedium).trim() : undefined,
      utmCampaign: utmCampaign ? String(utmCampaign).trim() : undefined,
      status: "new",
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      timeline: [
        {
          id: `TL-${Date.now()}`,
          stage: "lead_created",
          title: "Khách hàng gửi yêu cầu tư vấn",
          description: `Khách hàng ${customerName} để lại thông tin quan tâm đến ${placeName || 'điểm đến'}. Đã cấp mã voucher: ${voucherCode}`,
          actor: { id: userId || "system", name: customerName, role: "customer" },
          timestamp: now.toISOString()
        }
      ],
      notes: []
    };

    // Lưu vào Cloud
    const existing = await fetchLeadsFromCloud();
    const updated = [newLead, ...existing.filter(l => l.leadId !== leadId)];
    await saveLeadsToCloud(updated);

    // Bắn thông báo Telegram về điện thoại ban điều hành
    try {
      const tgMsg = `🎁 <b>YÊU CẦU TƯ VẤN & NHẬN VOUCHER - CHẠM A LƯỚI</b>\n` +
        `🆔 <b>Mã Lead:</b> <code>${newLead.leadId}</code>\n` +
        `🎟️ <b>Mã Voucher:</b> <code>${voucher.voucherCode}</code>\n` +
        `👤 <b>Khách:</b> ${newLead.customerName}\n` +
        `📞 <b>Điện thoại:</b> ${newLead.phone}\n` +
        `📍 <b>Điểm đến:</b> ${newLead.placeName}\n` +
        `📅 <b>Ngày dự kiến:</b> ${newLead.expectedDate} (${newLead.guests} khách)\n` +
        `💬 <b>Nhu cầu:</b> ${newLead.need}\n` +
        `👉 <a href="https://chamaluoiadmin.netlify.app/admin/leads">Xem CRM Leads trên Admin</a>`;
      await sendTelegramNotification(tgMsg);
    } catch {}

    return NextResponse.json({
      success: true,
      leadId: newLead.leadId,
      voucherCode: voucher.voucherCode,
      discountOffer: voucher.discountOffer,
      expiresAt: voucher.expiresAt,
      placeName: newLead.placeName
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Lỗi xử lý yêu cầu tạo Lead." },
      { status: 500 }
    );
  }
}

// PATCH /api/leads - Cập nhật trạng thái, ghi chú của Lead
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { leadId, status, lossReason, lossNote, noteContent, assignedStaff, assignedBusiness, actor } = body;

    if (!leadId) {
      return NextResponse.json({ success: false, error: "Thiếu leadId" }, { status: 400 });
    }

    const all = await fetchLeadsFromCloud();
    const index = all.findIndex(l => l.leadId === leadId);
    if (index === -1) {
      return NextResponse.json({ success: false, error: "Không tìm thấy Lead" }, { status: 404 });
    }

    const lead = { ...all[index] };
    const now = new Date().toISOString();

    if (status) {
      lead.status = status as LeadStatus;
      if (lossReason) lead.lossReason = lossReason as LeadLossReason;
      if (lossNote) lead.lossNote = lossNote;
    }

    if (assignedStaff) {
      (lead as any).assignedStaffId = assignedStaff.id;
      (lead as any).assignedStaffName = assignedStaff.name;
    }

    if (assignedBusiness) {
      lead.businessId = assignedBusiness.id;
      lead.businessName = assignedBusiness.name;
    }

    if (noteContent) {
      lead.notes = lead.notes || [];
      lead.notes.push({
        id: `NOTE-${Date.now()}`,
        content: noteContent,
        authorId: actor?.id || "admin",
        authorName: actor?.name || "Quản trị viên",
        createdAt: now
      });
    }

    lead.updatedAt = now;
    all[index] = lead;

    await saveLeadsToCloud(all);
    return NextResponse.json({ success: true, lead });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Lỗi cập nhật Lead." },
      { status: 500 }
    );
  }
}
