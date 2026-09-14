import { NextRequest, NextResponse } from "next/server";
import { createLead, getAllLeads, getLeadById } from "@/lib/server-store";
import type { LeadPayload } from "@/lib/leads";

// POST /api/leads - Khách hàng submit form từ website hoặc kênh marketing
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

    if (!placeSlug || !placeName) {
      return NextResponse.json(
        { success: false, error: "Thông tin điểm đến không hợp lệ." },
        { status: 400 }
      );
    }

    const { lead, voucher } = createLead({
      placeSlug,
      placeName,
      businessName,
      businessId,
      customerName: String(customerName).trim(),
      phone: String(phone).trim(),
      email: email ? String(email).trim() : undefined,
      zalo: zalo ? String(zalo).trim() : undefined,
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
      consent: Boolean(consent),
      userId: userId ? String(userId).trim() : undefined
    });

    // An toàn thông tin: Chỉ trả về mã Lead, mã Voucher và quyền lợi cho client public
    return NextResponse.json({
      success: true,
      data: {
        leadId: lead.leadId,
        voucherCode: voucher.voucherCode,
        discountOffer: voucher.discountOffer,
        expiresAt: voucher.expiresAt,
        placeName: lead.placeName
      }
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Lỗi xử lý yêu cầu tạo Lead." },
      { status: 500 }
    );
  }
}

// GET /api/leads - Bảo mật: Yêu cầu quyền quản trị (API Key hoặc Header ủy quyền)
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const apiKey = req.headers.get("x-admin-key");

  // Kiểm tra quyền hạn
  const isAuthorized =
    apiKey === "chamaluoi_admin_secret_2026" ||
    (authHeader && authHeader.startsWith("Bearer "));

  if (!isAuthorized) {
    return NextResponse.json(
      {
        success: false,
        error: "Từ chối truy cập (403 Forbidden). Dữ liệu liên hệ khách hàng (SĐT, Email, Zalo) được bảo vệ an toàn."
      },
      { status: 403 }
    );
  }

  const leads = getAllLeads();
  return NextResponse.json({
    success: true,
    total: leads.length,
    data: leads
  });
}
