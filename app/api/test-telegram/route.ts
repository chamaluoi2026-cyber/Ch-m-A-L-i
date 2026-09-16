import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { token, chatId } = await req.json();
    if (!token || !chatId) {
      return NextResponse.json({ success: false, error: "Vui lòng cung cấp Bot Token và Chat ID." }, { status: 400 });
    }

    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "🔔 <b>KẾT NỐI THÀNH CÔNG!</b>\n\nĐây là tin nhắn thử nghiệm từ hệ thống <b>Chạm A Lưới</b>.\nTừ bây giờ, bạn sẽ nhận được thông báo ting ting ngay trên điện thoại khi có:\n• Khách đặt Tour mới\n• Khách đặt mua đặc sản\n• Khách nhắn tin Live Chat\n• Khách yêu cầu tư vấn & nhận Voucher!",
        parse_mode: "HTML"
      })
    });

    if (res.ok) {
      return NextResponse.json({ success: true });
    } else {
      const errData = await res.json();
      return NextResponse.json({ success: false, error: errData.description || "Telegram từ chối gửi tin nhắn. Vui lòng kiểm tra lại Token và Chat ID." }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Lỗi kết nối tới máy chủ Telegram." }, { status: 500 });
  }
}
