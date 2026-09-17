/**
 * indigenous-chat-bot.ts
 * Trợ lý AI Bản Địa Chạm A Lưới: Tự động phản hồi thông minh, thân thiện và chốt khách trong 3 giây.
 */

export interface AIAnalysisResult {
  replyText: string;
  isPhoneDetected: boolean;
  detectedPhone: string | null;
  intent: "phone_provided" | "homestay" | "cuisine" | "tour" | "voucher" | "places" | "transport" | "general";
}

/**
 * Trích xuất và chuẩn hóa số điện thoại Việt Nam từ văn bản bất kỳ
 * Hỗ trợ các định dạng: 0912345678, 0912 345 678, 0912.345.678, +84912345678...
 */
export function extractVietnamesePhone(text: string): string | null {
  if (!text) return null;

  // Xóa các ký tự phân cách thông dụng giữa các chữ số
  const cleanCandidate = text.replace(/[\s\.\-_]/g, "");

  // Tìm kiếm mẫu số điện thoại Việt Nam: bắt đầu bằng 0 hoặc +84 theo sau bởi 9 chữ số hợp lệ
  const phoneRegex = /(?:\+84|0)(3[2-9]|5[25689]|7[06-9]|8[1-9]|9[0-9])[0-9]{7}/g;
  const match = cleanCandidate.match(phoneRegex);

  if (match && match.length > 0) {
    let phone = match[0];
    if (phone.startsWith("+84")) {
      phone = "0" + phone.slice(3);
    }
    return phone;
  }

  // Quét từng cụm số nếu khách gõ có chữ xen kẽ
  const digitsOnly = text.replace(/[^0-9]/g, "");
  if (digitsOnly.length === 10 && digitsOnly.startsWith("0")) {
    return digitsOnly;
  }
  if (digitsOnly.length === 11 && digitsOnly.startsWith("84")) {
    return "0" + digitsOnly.slice(2);
  }

  return null;
}

/**
 * Xử lý ngữ cảnh và sinh câu trả lời tự động cho khách hàng
 */
export function generateIndigenousAIResponse(
  userText: string,
  guestName?: string
): AIAnalysisResult {
  const normalized = userText.toLowerCase().trim();
  const detectedPhone = extractVietnamesePhone(userText);
  const displayName = guestName && guestName !== "Khách truy cập" ? guestName : "anh/chị";

  // 1. Trường hợp khách để lại SĐT
  if (detectedPhone) {
    return {
      isPhoneDetected: true,
      detectedPhone,
      intent: "phone_provided",
      replyText: `Dạ em đã nhận được số Zalo/Điện thoại **${detectedPhone}** của ${displayName} rồi ạ! 🎉\n\nChuyên viên tư vấn bản địa của Chạm A Lưới đang chuẩn bị hình ảnh phòng thực tế, thực đơn chi tiết và gửi kèm mã ưu đãi qua Zalo cho mình ngay đây ạ. Nếu ${displayName} có dặn dò gì đặc biệt về số người hay giờ đến cứ nhắn em nhé!`
    };
  }

  // 2. Ý định: Giá phòng / Homestay
  if (
    normalized.includes("giá phòng") ||
    normalized.includes("homestay") ||
    normalized.includes("thuê phòng") ||
    normalized.includes("bao nhiêu một đêm") ||
    normalized.includes("ở đâu") ||
    normalized.includes("chỗ ở") ||
    normalized.includes("nghỉ đêm") ||
    normalized.includes("đặt phòng")
  ) {
    return {
      isPhoneDetected: false,
      detectedPhone: null,
      intent: "homestay",
      replyText: `Dạ chào ${displayName}! Giá phòng homestay tại A Lưới rất mộc mạc và thân thiện với túi tiền ạ:\n\n` +
        `• 🏡 **Phòng đơn / đôi riêng tư:** dao động từ **250.000đ - 350.000đ/đêm** (đầy đủ chăn nệm thơm tho, vệ sinh khép kín).\n` +
        `• 🌿 **Bungalow gỗ view suối:** từ **400.000đ - 450.000đ/đêm** (không gian cực chill, thoáng đãng).\n` +
        `• 🎋 **Nhà sàn cộng đồng (đi đoàn):** từ **80.000đ - 120.000đ/người**.\n\n` +
        `Tất cả các homestay đều nằm sát suối mát, sáng thức dậy nghe chim hót và được bà con Pa Cô - Tà Ôi đón tiếp cực kỳ ấm áp ạ!\n\n` +
        `📲 **Dạ để em gửi ảnh phòng thực tế và vị trí kèm ưu đãi giảm 10% qua Zalo, ${displayName} cho em xin số điện thoại/Zalo nhé ạ!**`
    };
  }

  // 3. Ý định: Đặc sản / Ăn uống / Menu
  if (
    normalized.includes("đặc sản") ||
    normalized.includes("ăn gì") ||
    normalized.includes("món ngon") ||
    normalized.includes("gà nướng") ||
    normalized.includes("cơm lam") ||
    normalized.includes("menu") ||
    normalized.includes("thực đơn") ||
    normalized.includes("ẩm thực") ||
    normalized.includes("ăn uống") ||
    normalized.includes("rượu đoác")
  ) {
    return {
      isPhoneDetected: false,
      detectedPhone: null,
      intent: "cuisine",
      replyText: `Dạ ở A Lưới có những món ẩm thực trứ danh của đại ngàn Trường Sơn nhất định phải thử ${displayName} nhé:\n\n` +
        `• 🍗 **Gà nướng than củi chấm muối tiêu rừng:** 280.000đ/con (gà thả đồi thịt chắc, da giòn thơm nức).\n` +
        `• 🎋 **Cơm lam ống tre dẻo bùi:** 25.000đ - 30.000đ/ống thơm mùi nếp rẫy.\n` +
        `• 🐟 **Cá suối nướng lá dong & Lợn bản nướng ống tre** đậm đà gia vị thảo mộc.\n` +
        `• 🍶 **Rượu Đoác (bia rừng tự nhiên):** Men nước từ cây đoác rừng ngọt thanh, tê đầu lưỡi.\n\n` +
        `📲 **Dạ để em gửi trọn bộ Menu thực đơn kèm báo giá từng mâm cỗ cho đoàn qua Zalo, ${displayName} cho em xin số điện thoại/Zalo nhé ạ!**`
    };
  }

  // 4. Ý định: Tour 2N1Đ / Lịch trình trải nghiệm
  if (
    normalized.includes("tour") ||
    normalized.includes("2n1đ") ||
    normalized.includes("2 ngày") ||
    normalized.includes("lịch trình") ||
    normalized.includes("kế hoạch") ||
    normalized.includes("trọn gói") ||
    normalized.includes("hướng dẫn viên")
  ) {
    return {
      isPhoneDetected: false,
      detectedPhone: null,
      intent: "tour",
      replyText: `Dạ **Tour Trải Nghiệm Chạm A Lưới 2N1Đ** là lịch trình được nhiều du khách yêu thích nhất ạ:\n\n` +
        `• 🌿 **Ngày 1:** Đón khách tại A Lưới ➔ Tắm mát suối Pâr Le / Suối khoáng nóng A Roàng ➔ Thưởng thức gà nướng cơm lam bên suối ➔ Tối giao lưu lửa trại, văn hóa cồng chiêng và thưởng thức rượu Đoác cùng bà con Pa Cô.\n` +
        `• 🌲 **Ngày 2:** Săn mây bình minh Đồi thông A Ngo ➔ Chinh phục Thác A Nôr hùng vĩ ➔ Khám phá nghề dệt Dèng zèng thổ cẩm và mua thịt bò gàng đặc sản ➔ Kết thúc tour.\n` +
        `• 💰 **Chi phí trọn gói:** Chỉ từ **890.000đ - 1.250.000đ/người** (đã bao gồm ăn uống 4 bữa, homestay, vé tham quan và người địa phương dẫn đường).\n\n` +
        `📲 **Dạ ${displayName} cho em xin số điện thoại/Zalo để em gửi cẩm nang lịch trình chi tiết từng giờ và ưu đãi cho đoàn mình nhé ạ!**`
    };
  }

  // 5. Ý định: Voucher / Mã giảm giá / Ưu đãi
  if (
    normalized.includes("voucher") ||
    normalized.includes("giảm giá") ||
    normalized.includes("ưu đãi") ||
    normalized.includes("khuyến mãi") ||
    normalized.includes("mã giảm") ||
    normalized.includes("discount") ||
    normalized.includes("code")
  ) {
    return {
      isPhoneDetected: false,
      detectedPhone: null,
      intent: "voucher",
      replyText: `Dạ Chạm A Lưới đang dành tặng chương trình **Voucher Ưu Đãi 10%** áp dụng cho mọi dịch vụ Homestay, Ăn uống và Tour sinh thái khi đặt trước trên nền tảng ạ! 🎁\n\n` +
        `• Giảm 10% trực tiếp trên tổng hóa đơn.\n` +
        `• Tặng kèm 1 bình Rượu Đoác khai vị khi đặt mâm gà nướng cơm lam.\n\n` +
        `📲 **Dạ ${displayName} cho em xin số điện thoại/Zalo để hệ thống tự động kích hoạt và gửi mã Voucher riêng qua Zalo cho mình ngay nhé ạ!**`
    };
  }

  // 6. Ý định: Địa điểm tham quan (Pâr Le, A Nôr, A Roàng, Đồi thông...)
  if (
    normalized.includes("pâr le") ||
    normalized.includes("par le") ||
    normalized.includes("a nôr") ||
    normalized.includes("a nor") ||
    normalized.includes("a roàng") ||
    normalized.includes("suối") ||
    normalized.includes("thác") ||
    normalized.includes("đồi thông") ||
    normalized.includes("a ngo") ||
    normalized.includes("chơi gì") ||
    normalized.includes("điểm đến")
  ) {
    return {
      isPhoneDetected: false,
      detectedPhone: null,
      intent: "places",
      replyText: `Dạ A Lưới mùa này khí hậu mát lành, có những tuyệt cảnh thiên nhiên cực đẹp đang chờ ${displayName} khám phá ạ:\n\n` +
        `• 💦 **Thác A Nôr (Hồng Kim):** 3 tầng thác bọt tung trắng xóa, có máng trượt đá tự nhiên bơi lội cực đã.\n` +
        `• 🎋 **Suối Pâr Le (Hồng Hạ):** Dòng suối trong vắt nhìn thấy sỏi đá, chòi tre bên suối ăn cơm lam gà nướng.\n` +
        `• ♨️ **Suối khoáng nóng A Roàng:** Suối nước nóng tự nhiên giữa thung lũng, tắm thư giãn hồi phục sức khỏe.\n` +
        `• 🌲 **Đồi thông A Ngo & Rừng nguyên sinh:** Góc sống ảo săn mây ngỡ như Đà Lạt giữa lòng miền Trung.\n\n` +
        `📲 **Dạ để em gửi bộ ảnh thực tế, định vị Google Maps và cẩm nang đường đi qua Zalo, ${displayName} cho em xin số điện thoại/Zalo nhé ạ!**`
    };
  }

  // 7. Ý định: Đường đi / Phương tiện di chuyển
  if (
    normalized.includes("đường đi") ||
    normalized.includes("từ huế") ||
    normalized.includes("bao xa") ||
    normalized.includes("xe khách") ||
    normalized.includes("xe máy") ||
    normalized.includes("ô tô") ||
    normalized.includes("di chuyển") ||
    normalized.includes("đón")
  ) {
    return {
      isPhoneDetected: false,
      detectedPhone: null,
      intent: "transport",
      replyText: `Dạ từ TP. Huế lên trung tâm thị trấn A Lưới khoảng **65km** theo Quốc lộ 49, mất khoảng 1.5 - 2 giờ di chuyển ạ:\n\n` +
        `• 🛵 **Xe máy / Ô tô riêng:** Đường đã rải nhựa đẹp, đèo dốc uốn lượn phong cảnh rừng núi rất hùng vĩ (chú ý chạy đúng tốc độ).\n` +
        `• 🚐 **Xe khách / Xe limousine đón tận nơi:** Chạy liên tục từ bến xe phía Tây hoặc đón trong nội thành Huế (giá vé 70k - 100k/người).\n` +
        `• 🚗 Bên em cũng có dịch vụ xe đưa đón trọn gói 4 chỗ, 7 chỗ hoặc 16 chỗ từ sân bay Phú Bài / Huế lên tận Homestay.\n\n` +
        `📲 **Dạ ${displayName} cho em xin số điện thoại/Zalo để em gửi danh sách số nhà xe uy tín hoặc hỗ trợ book xe đón mình nhé ạ!**`
    };
  }

  // 8. Chào hỏi / Tư vấn tổng quát
  return {
    isPhoneDetected: false,
    detectedPhone: null,
    intent: "general",
    replyText: `Dạ Chạm A Lưới xin chào ${displayName}! Rất vui được đón tiếp mình ạ 🌿\n\n` +
      `Bọn em là hợp tác xã kết nối du lịch cộng đồng bản địa Pa Cô - Tà Ôi tại huyện A Lưới, chuyên cung cấp:\n` +
      `• 🏡 **Homestay nhà sàn & Bungalow view suối** (chỉ từ 250k/đêm).\n` +
      `• 🍗 **Đặc sản gà nướng, cơm lam, cá suối, rượu Đoác**.\n` +
      `• 🌿 **Tour trải nghiệm thác suối, trekking rừng, săn mây 2N1Đ trọn gói**.\n\n` +
      `📲 **Dạ để em gửi thông tin chi tiết và voucher giảm 10% cho chuyến đi, ${displayName} cho em xin số điện thoại hoặc Zalo nhé ạ! Nhân viên sẽ nhắn hỗ trợ mình ngay sau 1 phút ạ.**`
  };
}
