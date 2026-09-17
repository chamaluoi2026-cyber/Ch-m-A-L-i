import { NextResponse } from "next/server";
import {
  getAllBookings,
  getAllLeads,
  getAllTransactions,
  getAllCommissions,
  type BookingRecord
} from "@/lib/server-store";
import type { LeadRecord } from "@/lib/leads";

export const dynamic = "force-dynamic";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcunfovtwbzfatudejfs.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdW5mb3Z0d2J6ZmF0dWRlamZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NTM5OSwiZXhwIjoyMTA0OTcxMzk5fQ.7QwyRHqGXa6UwgbUNAhlWdmGZqpuS8Cxall2v8j7lMU';

async function fetchCloudStore<T>(storeId: string): Promise<T | null> {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/system_store?id=eq.${storeId}&select=data`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
      cache: "no-store"
    });
    if (res.ok) {
      const rows = await res.json();
      if (rows && Array.isArray(rows[0]?.data)) {
        return rows[0].data as T;
      }
    }
  } catch {
    // fallback
  }
  return null;
}

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "bookings";
    const businessId = searchParams.get("businessId");
    const timeRange = searchParams.get("timeRange") || "all";
    const monthParam = searchParams.get("month"); // 'YYYY-MM' or undefined
    const startDate = searchParams.get("startDate"); // 'YYYY-MM-DD'
    const endDate = searchParams.get("endDate"); // 'YYYY-MM-DD'

    // Xác định khoảng thời gian lọc
    const now = new Date();
    const curY = now.getFullYear();
    const curM = now.getMonth() + 1; // 1-12
    const pad = (n: number) => String(n).padStart(2, "0");

    let targetMonth = monthParam && monthParam !== "all" ? monthParam : "";
    let periodSuffix = "";

    if (!targetMonth) {
      if (timeRange === "this_month") {
        targetMonth = `${curY}-${pad(curM)}`;
        periodSuffix = `Thang-${pad(curM)}-${curY}`;
      } else if (timeRange === "last_month") {
        const prevDate = new Date(curY, curM - 2, 1);
        const prevY = prevDate.getFullYear();
        const prevM = prevDate.getMonth() + 1;
        targetMonth = `${prevY}-${pad(prevM)}`;
        periodSuffix = `Thang-${pad(prevM)}-${prevY}`;
      } else if (timeRange === "this_quarter") {
        const q = Math.floor((curM - 1) / 3) + 1;
        periodSuffix = `Quy-${q}-${curY}`;
      } else if (timeRange === "this_year") {
        periodSuffix = `Nam-${curY}`;
      } else if (startDate && endDate) {
        periodSuffix = `${startDate}_den_${endDate}`;
      } else {
        periodSuffix = `Toan-Bo-${now.toISOString().split("T")[0]}`;
      }
    } else {
      periodSuffix = `Thang-${targetMonth}`;
    }

    const dateFilter = (dateStr?: string) => {
      if (!dateStr) return true;
      const cleanDate = dateStr.split("T")[0];

      if (targetMonth) {
        return cleanDate.startsWith(targetMonth);
      }

      if (timeRange === "this_quarter") {
        const q = Math.floor((curM - 1) / 3) + 1;
        const qStartMonth = (q - 1) * 3 + 1;
        const qEndMonth = q * 3;
        const [yStr, mStr] = cleanDate.split("-");
        const y = Number(yStr);
        const m = Number(mStr);
        return y === curY && m >= qStartMonth && m <= qEndMonth;
      }

      if (timeRange === "this_year") {
        return cleanDate.startsWith(String(curY));
      }

      if (startDate && endDate) {
        return cleanDate >= startDate && cleanDate <= endDate;
      }

      return true;
    };

    let filename = "";
    let headers: string[] = [];
    let rows: string[][] = [];

    // 1. XUẤT BOOKINGS
    if (type === "bookings") {
      filename = `ChamALuoi-Bookings-${periodSuffix}.csv`;
      const cloudBookings = await fetchCloudStore<BookingRecord[]>("bookings_store");
      let list = cloudBookings || getAllBookings();

      if (businessId && businessId !== "all") {
        list = list.filter((b) => b.businessId === businessId || b.businessName === businessId);
      }
      list = list.filter((b) => dateFilter(b.createdAt || b.startDate || b.bookingDate));

      headers = [
        "Mã Booking",
        "Ngày Tạo",
        "Ngày Trải Nghiệm",
        "Tên Khách Hàng",
        "Số Điện Thoại",
        "Dịch Vụ / Tour",
        "Cơ Sở Đối Tác",
        "Loại",
        "Số Lượng Khách",
        "Tổng Tiền (VNĐ)",
        "Trạng Thái Đơn",
        "Trạng Thái Thanh Toán",
        "Phương Thức TT",
        "Ghi Chú Khách",
        "Ghi Chú Điều Hành"
      ];

      rows = list.map((b) => [
        escapeCsv(b.id),
        escapeCsv((b.createdAt || "").split("T")[0]),
        escapeCsv(b.experienceDate || b.startDate || ""),
        escapeCsv(b.customerName || ""),
        escapeCsv(b.phone || ""),
        escapeCsv(b.itemTitle || ""),
        escapeCsv(b.businessName || "Chạm A Lưới"),
        escapeCsv(b.type === "product" ? "Sản phẩm" : b.type === "homestay" ? "Homestay" : "Tour"),
        escapeCsv(b.numberOfPeople || b.quantity || 1),
        escapeCsv(b.finalAmount || b.unitPrice || 0),
        escapeCsv(
          b.status === "confirmed"
            ? "Đã xác nhận"
            : b.status === "completed"
            ? "Đã hoàn thành"
            : b.status === "cancelled"
            ? "Đã hủy"
            : "Chờ xác nhận"
        ),
        escapeCsv(
          b.paymentStatus === "PAID" || b.paymentStatus === "paid"
            ? "Đã thanh toán"
            : b.paymentStatus === "REFUNDED"
            ? "Đã hoàn tiền"
            : "Chưa thanh toán"
        ),
        escapeCsv(b.paymentMethod === "vietqr" ? "VietQR" : b.paymentMethod === "bank_transfer" ? "Chuyển khoản" : "Tiền mặt"),
        escapeCsv(b.customerNote || b.notes || ""),
        escapeCsv(b.businessNote || "")
      ]);
    }

    // 2. XUẤT LEADS (KHÁCH TƯ VẤN)
    else if (type === "leads") {
      filename = `ChamALuoi-Leads-${periodSuffix}.csv`;
      const cloudLeads = await fetchCloudStore<LeadRecord[]>("leads_store");
      let list = cloudLeads || (getAllLeads ? getAllLeads() : []);

      if (businessId && businessId !== "all") {
        list = list.filter((l) => l.placeSlug === businessId || l.placeName === businessId);
      }
      list = list.filter((l) => !l.isDeleted && dateFilter(l.createdAt));

      headers = [
        "Mã Lead",
        "Thời Gian Gửi",
        "Tên Khách Hàng",
        "Số Điện Thoại",
        "Zalo",
        "Điểm Đến / Trải Nghiệm",
        "Nhu Cầu Tư Vấn",
        "Số Lượng Khách",
        "Ngày Dự Kiến",
        "Mã Voucher Đã Nhận",
        "Trạng Thái Tư Vấn"
      ];

      rows = list.map((l) => [
        escapeCsv(l.leadId),
        escapeCsv((l.createdAt || "").replace("T", " ").slice(0, 16)),
        escapeCsv(l.customerName || ""),
        escapeCsv(l.phone || ""),
        escapeCsv(l.zalo || l.phone || ""),
        escapeCsv(l.placeName || ""),
        escapeCsv(l.need || ""),
        escapeCsv(l.guests || 1),
        escapeCsv(l.expectedDate || ""),
        escapeCsv(l.voucherCode || ""),
        escapeCsv(
          l.status === "new"
            ? "Mới (Chưa liên hệ)"
            : l.status === "contacted"
            ? "Đã liên hệ"
            : l.status === "consulting"
            ? "Đang tư vấn"
            : l.status === "converted"
            ? "Đã chốt đặt tour"
            : "Không thành công"
        )
      ]);
    }

    // 3. XUẤT GIAO DỊCH (TRANSACTIONS)
    else if (type === "transactions") {
      filename = `ChamALuoi-Transactions-${periodSuffix}.csv`;
      let list = getAllTransactions ? getAllTransactions() : [];

      if (businessId && businessId !== "all") {
        list = list.filter((t) => t.businessId === businessId || t.businessName === businessId);
      }
      list = list.filter((t) => dateFilter(t.confirmedAt || (t as any).createdAt));

      headers = [
        "Mã Giao Dịch",
        "Thời Gian",
        "Mã Lead / Đơn",
        "Cơ Sở Đối Tác",
        "Voucher Sử Dụng",
        "Doanh Thu (GMV)",
        "Tỷ Lệ Hoa Hồng (%)",
        "Hoa Hồng Sàn (VNĐ)",
        "Thực Nhận Cơ Sở (VNĐ)",
        "Trạng Thái Đối Soát",
        "Ghi Chú"
      ];

      rows = list.map((t) => {
        const netPayout = t.orderValue - t.commissionAmount;
        return [
          escapeCsv(t.id),
          escapeCsv((t.confirmedAt || (t as any).createdAt || "").replace("T", " ").slice(0, 16)),
          escapeCsv(t.leadId || ""),
          escapeCsv(t.businessName || (t as any).placeName || ""),
          escapeCsv(t.voucherCode || ""),
          escapeCsv(t.orderValue || 0),
          escapeCsv(`${t.commissionRate || 10}%`),
          escapeCsv(t.commissionAmount || 0),
          escapeCsv(netPayout),
          escapeCsv(t.status === "reconciled" ? "Đã đối soát" : "Chờ đối soát"),
          escapeCsv(t.note || "")
        ];
      });
    }

    // 4. XUẤT HOA HỒNG (COMMISSIONS)
    else if (type === "commissions") {
      filename = `ChamALuoi-Commissions-${periodSuffix}.csv`;
      let list = getAllCommissions ? getAllCommissions() : [];

      if (businessId && businessId !== "all") {
        list = list.filter((c) => c.businessId === businessId || c.businessName === businessId);
      }
      list = list.filter((c) => dateFilter(c.createdAt));

      headers = [
        "Mã Hoa Hồng",
        "Mã Booking",
        "Cơ Sở Đối Tác",
        "Địa Điểm / Dịch Vụ",
        "Doanh Thu Gốc (VNĐ)",
        "Tỷ Lệ Hoa Hồng (%)",
        "Tiền Hoa Hồng (VNĐ)",
        "Cơ Sở Nhận Về (VNĐ)",
        "Trạng Thái",
        "Ngày Tạo"
      ];

      rows = list.map((c) => [
        escapeCsv(c.id),
        escapeCsv(c.bookingId),
        escapeCsv(c.businessName || ""),
        escapeCsv(c.placeName || ""),
        escapeCsv(c.commissionBaseAmount || 0),
        escapeCsv(`${c.commissionRate || 10}%`),
        escapeCsv(c.commissionAmount || 0),
        escapeCsv((c.commissionBaseAmount || 0) - (c.commissionAmount || 0)),
        escapeCsv(
          c.status === "PAID" || (c.status as string) === "paid"
            ? "Đã thanh toán"
            : c.status === "RECONCILED" || (c.status as string) === "reconciled"
            ? "Đã đối soát"
            : c.status === "DISPUTED" || (c.status as string) === "disputed"
            ? "Đang khiếu nại"
            : "Chờ xử lý"
        ),
        escapeCsv((c.createdAt || "").split("T")[0])
      ]);
    }

    // Ghép CSV với BOM UTF-8 (\uFEFF) giúp Excel trên Windows mở không bị lỗi font tiếng Việt
    const csvContent =
      "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Lỗi xuất file dữ liệu" },
      { status: 500 }
    );
  }
}
