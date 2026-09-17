import { NextRequest, NextResponse } from "next/server";
import {
  createBooking,
  getAllBookings,
  type BookingRecord,
  type BookingType,
  type BookingStatus,
  type PaymentStatus
} from "@/lib/server-store";
import { revalidatePath } from "next/cache";
import { sendTelegramNotification } from "@/lib/notification/telegram";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcunfovtwbzfatudejfs.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdW5mb3Z0d2J6ZmF0dWRlamZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NTM5OSwiZXhwIjoyMTA0OTcxMzk5fQ.7QwyRHqGXa6UwgbUNAhlWdmGZqpuS8Cxall2v8j7lMU';

async function fetchBookingsFromCloud(): Promise<BookingRecord[]> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/system_store?id=eq.bookings_store&select=data`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      cache: "no-store"
    });
    if (res.ok) {
      const rows = await res.json();
      if (Array.isArray(rows[0]?.data)) {
        return rows[0].data as BookingRecord[];
      }
    }
  } catch (e) {
    console.error("[BOOKINGS_CLOUD_FETCH_ERR]", e);
  }
  return getAllBookings();
}

async function saveBookingsToCloud(bookings: BookingRecord[]): Promise<boolean> {
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
        id: "bookings_store",
        data: bookings,
        updated_at: new Date().toISOString()
      })
    });
    return res.ok;
  } catch (e) {
    console.error("[BOOKINGS_CLOUD_SAVE_ERR]", e);
    return false;
  }
}

// GET /api/bookings - Lấy danh sách đơn đặt từ Supabase Cloud
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("userId");
    const customerView = searchParams.get("customerView");

    const all = await fetchBookingsFromCloud();

    if (id) {
      const found = all.find(b => b.id === id);
      if (!found) {
        return NextResponse.json({ success: false, error: "Không tìm thấy đơn đặt." }, { status: 404 });
      }
      return NextResponse.json({ success: true, booking: found });
    }

    if (userId || customerView) {
      const filtered = userId ? all.filter(b => b.customerId === userId || b.userId === userId) : all;
      const sanitized = filtered.map(b => ({
        id: b.id,
        leadId: b.leadId,
        itemTitle: b.itemTitle,
        itemSlug: b.itemSlug,
        placeId: b.placeId,
        businessName: b.businessName,
        type: b.type,
        bookingDate: b.bookingDate,
        experienceDate: b.experienceDate,
        experienceTime: b.experienceTime,
        numberOfPeople: b.numberOfPeople,
        quantity: b.quantity,
        unitPrice: b.unitPrice,
        subtotal: b.subtotal,
        discount: b.discount,
        finalAmount: b.finalAmount,
        paymentStatus: b.paymentStatus,
        paymentMethod: b.paymentMethod,
        bookingStatus: b.bookingStatus || b.status,
        customerNote: b.customerNote || b.notes,
        createdAt: b.createdAt
      }));
      return NextResponse.json({ success: true, bookings: sanitized });
    }

    return NextResponse.json({ success: true, bookings: all });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// POST /api/bookings - Tạo đơn đặt mới từ Web Khách và lưu ngay vào Supabase
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.customerName || !body.phone) {
      return NextResponse.json(
        { success: false, error: "Vui lòng cung cấp họ tên và số điện thoại liên hệ." },
        { status: 400 }
      );
    }
    const itemTitle = body.itemTitle || body.productName || body.tourName || "Dịch vụ du lịch Chạm A Lưới";
    const type: BookingType = (body.type as BookingType) || "tour";

    const number = Math.floor(10000 + Math.random() * 90000);
    const prefix = type === "product" ? "ORD" : "BK";
    const bookingId = `${prefix}-${number}`;
    const now = new Date().toISOString();

    const qty = Number(body.quantity) || Number(body.numberOfPeople) || 1;
    const unitPrice = Number(body.unitPrice) || 0;
    const finalAmount = Number(body.finalAmount) || (unitPrice > 0 ? unitPrice * qty : 0);

    const newBooking: BookingRecord = {
      id: bookingId,
      leadId: body.leadId,
      customerId: body.customerId || body.userId || "guest",
      customerName: String(body.customerName).trim(),
      phone: String(body.phone).trim(),
      email: body.email ? String(body.email).trim() : undefined,
      type,
      itemTitle,
      itemId: body.itemId,
      itemSlug: body.itemSlug,
      placeId: body.placeId,
      businessId: body.businessId,
      businessName: body.businessName || (type === "product" ? "Cơ sở đặc sản A Lưới" : "Đối tác du lịch A Lưới"),
      bookingDate: now,
      experienceDate: body.startDate || body.experienceDate,
      experienceTime: body.experienceTime,
      numberOfPeople: qty,
      quantity: qty,
      deliveryAddress: body.address || body.deliveryAddress,
      unitPrice,
      subtotal: unitPrice * qty,
      totalAmount: unitPrice * qty,
      discount: body.discount || 0,
      finalAmount,
      commissionRate: body.commissionRate || 10,
      commissionAmount: Math.round(finalAmount * 0.1),
      paymentStatus: (body.paymentStatus as PaymentStatus) || "pending",
      paymentMethod: body.paymentMethod || "cod",
      bookingStatus: "pending",
      status: "pending",
      customerNote: body.note || body.customerNote,
      createdAt: now,
      updatedAt: now
    };

    // 1. Lưu vào danh sách bookings trên Supabase Cloud
    const currentList = await fetchBookingsFromCloud();
    const updatedList = [newBooking, ...currentList.filter(b => b.id !== newBooking.id)];
    await saveBookingsToCloud(updatedList);

    // Bắn thông báo tức thì về Telegram của Ban quản lý/Admin
    try {
      const typeLabel = newBooking.type === "product" ? "ĐƠN ĐẶT ĐẶC SẢN MỚI" : "ĐƠN ĐẶT TOUR MỚI";
      const tgMsg = `🔔 <b>${typeLabel} - CHẠM A LƯỚI</b>\n` +
        `🆔 <b>Mã đơn:</b> <code>${newBooking.id}</code>\n` +
        `👤 <b>Khách hàng:</b> ${newBooking.customerName}\n` +
        `📞 <b>Điện thoại:</b> ${newBooking.phone}\n` +
        `📦 <b>Sản phẩm/Tour:</b> ${newBooking.itemTitle}\n` +
        `💰 <b>Tổng tiền:</b> ${newBooking.finalAmount.toLocaleString("vi-VN")} đ\n` +
        `📅 <b>Ngày:</b> ${newBooking.experienceDate || newBooking.bookingDate}\n` +
        `💬 <b>Ghi chú:</b> ${newBooking.customerNote || "Không có"}\n` +
        `👉 <a href="https://chamaluoiadmin.netlify.app/admin/bookings">Xem trên Trang Quản Trị</a>`;
      await sendTelegramNotification(tgMsg);
    } catch {}

    // 2. Đồng bộ song song vào store cục bộ
    try {
      createBooking({
        ...body,
        itemTitle,
        type,
        customerName: newBooking.customerName,
        phone: newBooking.phone
      });
    } catch {}

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/orders");
    revalidatePath("/account");

    return NextResponse.json({
      success: true,
      booking: newBooking
    });
  } catch (err: any) {
    console.error("[API_BOOKING_CREATE_ERR]", err);
    return NextResponse.json({ success: false, error: err?.message || "Lỗi tạo đơn đặt." }, { status: 500 });
  }
}

// PATCH /api/bookings - Cập nhật trạng thái đơn đặt (Duyệt đơn, Hoàn tất, Hủy đơn)
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, bookingStatus, paymentStatus, businessNote } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "Thiếu mã đơn đặt (id)." }, { status: 400 });
    }

    const currentList = await fetchBookingsFromCloud();
    const booking = currentList.find(b => b.id === id);
    if (!booking) {
      return NextResponse.json({ success: false, error: "Không tìm thấy đơn đặt." }, { status: 404 });
    }

    if (bookingStatus) {
      booking.bookingStatus = bookingStatus;
      booking.status = bookingStatus;
    }
    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }
    if (businessNote !== undefined) {
      booking.businessNote = businessNote;
    }
    booking.updatedAt = new Date().toISOString();

    await saveBookingsToCloud(currentList);

    revalidatePath("/admin/bookings");
    revalidatePath("/admin/orders");
    revalidatePath("/account");

    return NextResponse.json({ success: true, booking });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Lỗi cập nhật đơn." }, { status: 500 });
  }
}
