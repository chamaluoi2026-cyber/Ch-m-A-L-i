/**
 * BỘ TẠO NỘI DUNG THÔNG MINH CHO ĐẶC SẢN & DU LỊCH A LƯỚI
 * Kết hợp Google Gemini AI và Engine Văn Hóa Bản Địa Chuyên Sâu
 */

export type AiWritingTone = "shopee" | "culture" | "concise";

export interface GenerateProductAiInput {
  name: string;
  category?: string;
  origin?: string;
  keywords?: string;
  tone?: AiWritingTone;
  existingSpecs?: string[];
}

export interface GeneratedProductAiOutput {
  name: string;
  description: string;
  specs: string[];
  weight: string;
  expiryDate: string;
  storageGuide: string;
  seoTitle: string;
  seoDescription: string;
  origin: string;
  source: "gemini" | "local_expert";
}

// ─────────────────────────────────────────────────────────────────────────────
// LOCAL DOMAIN ENGINE (CHUYÊN GIA BẢN ĐỊA A LƯỚI)
// Đảm bảo sinh nội dung xuất sắc 100% không phụ thuộc mạng, phản hồi trong 0.1s
// ─────────────────────────────────────────────────────────────────────────────
export function generateLocalProductContent(
  input: GenerateProductAiInput
): GeneratedProductAiOutput {
  const rawName = input.name.trim();
  const lower = rawName.toLowerCase();
  const tone = input.tone || "shopee";
  const category = input.category || "Đặc sản A Lưới";
  const userKw = input.keywords ? input.keywords.trim() : "";

  // Nhận diện nhóm sản phẩm
  let isZeng = lower.includes("zèng") || lower.includes("thổ cẩm") || lower.includes("khăn") || lower.includes("túi");
  let isHoney = lower.includes("mật ong") || lower.includes("ong rừng") || lower.includes("ong khoái");
  let isTea = lower.includes("trà") || lower.includes("chè") || lower.includes("thảo mộc") || lower.includes("vằng");
  let isBeef = lower.includes("bò") || lower.includes("thịt") || lower.includes("gác bếp") || lower.includes("khô");
  let isWine = lower.includes("rượu") || lower.includes("cần") || lower.includes("men lá");
  let isBamboo = lower.includes("tre") || lower.includes("mây") || lower.includes("đan") || lower.includes("giỏ");
  let isRice = lower.includes("gạo") || lower.includes("ra du") || lower.includes("nếp");

  let generatedName = rawName;
  let description = "";
  let specs: string[] = [];
  let weight = "500g";
  let expiryDate = "12 tháng kể từ ngày sản xuất";
  let storageGuide = "Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp";
  let seoTitle = `${rawName} | Đặc sản A Lưới OCOP`;
  let seoDescription = "";

  if (isZeng) {
    weight = "300g - 600g";
    expiryDate = "Bền đẹp lâu dài theo thời gian";
    storageGuide = "Giặt tay nhẹ nhàng bằng dầu gội hoặc nước giặt loãng, phơi trong bóng râm";
    if (tone === "shopee") {
      generatedName = `${rawName} Dệt Thủ Công Bản Địa - Thổ Cẩm Zèng A Lưới Tinh Xảo`;
      description = `Thổ cẩm Zèng là di sản văn hóa phi vật thể quốc gia tiêu biểu của đồng bào Tà Ôi - A Lưới. Từng đường kim, mũi chỉ và hạt cườm chì được các nghệ nhân dệt thủ công hoàn toàn trên khung cửi truyền thống. Sản phẩm mang vẻ đẹp hoang sơ, đậm chất núi rừng Trường Sơn, thích hợp làm khăn choàng, vải may trang phục cao cấp hoặc quà tặng lưu niệm sang trọng. ${userKw ? `Đặc tính nổi bật: ${userKw}.` : ""}`;
      specs = [
        "100% sợi dệt tự nhiên kết hợp cườm thủ công",
        "Dệt tay bởi nghệ nhân người Tà Ôi - Pa Cô",
        "Hoa văn độc bản mang biểu tượng núi rừng và dòng suối",
        "Sản phẩm đạt chuẩn chứng nhận OCOP du lịch di sản"
      ];
    } else if (tone === "culture") {
      generatedName = `Tấm Zèng Thổ Cẩm Truyền Thống Người Tà Ôi - A Lưới`;
      description = `Mang trong mình linh hồn của đại ngàn Trường Sơn, Zèng A Lưới kết tinh từ sự cần mẫn và đôi bàn tay khéo léo của người phụ nữ Tà Ôi. Từng dải hoa văn sóng nước, ngọn núi và hạt cườm lấp lánh như lời chúc bình an, gắn kết cộng đồng và gìn giữ tinh hoa ngàn đời của nương rẫy vùng cao.`;
      specs = [
        "Di sản văn hóa phi vật thể quốc gia",
        "Khung cửi truyền thống, dệt cườm trực tiếp vào sợi",
        "Màu sắc thiên nhiên bền màu, không gây kích ứng da",
        "Giá trị văn hóa bản địa độc đáo của Thừa Thiên Huế"
      ];
    } else {
      generatedName = `${rawName} Thổ Cẩm Zèng A Lưới`;
      description = `Thổ cẩm Zèng dệt tay thủ công bởi nghệ nhân A Lưới. Hoa văn truyền thống đính cườm bền đẹp, màu sắc mộc mạc tự nhiên, thích hợp làm quà tặng ý nghĩa.`;
      specs = [
        "Chất liệu sợi cotton dệt thủ công",
        "Kích thước chuẩn quà tặng lưu niệm",
        "Dệt cườm truyền thống bản địa"
      ];
    }
  } else if (isHoney) {
    weight = "Chai 500ml / 1000ml";
    expiryDate = "24 tháng kể từ ngày khai thác";
    storageGuide = "Để nơi thoáng mát ở nhiệt độ phòng (25-30°C), không để trong tủ lạnh";
    if (tone === "shopee") {
      generatedName = `${rawName} Nguyên Chất 100% Rừng Già Trường Sơn - Đặc Sản A Lưới`;
      description = `Mật ong rừng già A Lưới được khai thác hoàn toàn tự nhiên từ những tổ ong khoái trên các vách đá và thân cây cổ thụ sâu trong rừng nguyên sinh Trường Sơn. Mật ong có màu vàng óng ánh, đặc sánh tự nhiên, thơm nồng mùi hoa rừng ngát dịu, vị ngọt thanh không gắt cổ. Sản phẩm bồi bổ sức khỏe tuyệt vời, tăng cường đề kháng cho cả gia đình. ${userKw ? `Lưu ý: ${userKw}.` : ""}`;
      specs = [
        "100% mật ong rừng tự nhiên, không pha đường, không chất bảo quản",
        "Khai thác bền vững bởi đồng bào vùng cao A Lưới",
        "Đậm đặc tự nhiên, giàu enzyme sinh học và khoáng chất quý",
        "Đóng chai thủy tinh an toàn, tem niêm phong nguồn gốc rõ ràng"
      ];
    } else if (tone === "culture") {
      generatedName = `Mật Ong Rừng Nguyên Bản Đại Ngàn A Lưới`;
      description = `Những giọt mật chắt chiu từ ngàn hoa đại ngàn Trường Sơn hùng vĩ, được những người thợ săn ong bản địa trèo đèo lội suối thu hoạch theo phương pháp truyền thống. Mật ong A Lưới mang hương vị hoang dã thanh khiết, là món quà quý của đất trời ban tặng cho vùng đất cao nguyên này.`;
      specs = [
        "Thu hoạch từ rừng nguyên sinh A Roàng và Hồng Kim",
        "Hương thơm hoa rừng tự nhiên nồng nàn",
        "Hỗ trợ tiêu hóa, tăng sức đề kháng và thanh lọc cơ thể"
      ];
    } else {
      generatedName = `${rawName} Chai 500ml Tự Nhiên`;
      description = `Mật ong rừng A Lưới nguyên chất, khai thác tự nhiên từ rừng Trường Sơn. Vị ngọt thanh, thơm dịu, giàu dưỡng chất tốt cho sức khỏe.`;
      specs = [
        "Mật ong rừng tự nhiên 100%",
        "Chai thủy tinh 500ml tiện lợi",
        "Không chất bảo quản, không đường pha"
      ];
    }
  } else if (isBeef) {
    weight = "Gói 500g hút chân không";
    expiryDate = "6 tháng (ngăn đông) / 1 tháng (ngăn mát)";
    storageGuide = "Bảo quản trong ngăn đông tủ lạnh (-18°C), rã đông tự nhiên trước khi dùng";
    if (tone === "shopee") {
      generatedName = `${rawName} Gác Bếp Than Củi - Tiêu Rừng & Mắc Khén Đậm Vị A Lưới`;
      description = `Thịt bò vàng gác bếp A Lưới được chọn lọc từ phần bắp và thăn của bò cỏ thả đồi tự nhiên, thớ thịt săn chắc, thơm ngọt. Thịt được tẩm ướp kỳ công với ớt rừng cay nồng, mắc khén thơm nức, hạt dổi và muối hầm, sau đó hun khói chậm rãi trên gác bếp than củi rừng suốt nhiều ngày. Thớ thịt ngoài nâu sẫm đượm khói, trong đỏ hồng mềm ngọt, chấm cùng muối kiến vàng hoặc tương ớt vùng cao là ngon hết ý! ${userKw ? `Thông tin: ${userKw}.` : ""}`;
      specs = [
        "100% thịt bò cỏ chăn thả tự nhiên vùng núi cao A Lưới",
        "Hun khói than củi truyền thống, thớ thịt mềm ngọt đượm vị",
        "Gia vị tiêu rừng, hạt dổi, mắc khén bản địa độc quyền",
        "Đóng gói hút chân không sạch sẽ, tặng kèm muối chấm đặc biệt"
      ];
    } else {
      generatedName = `${rawName} Gác Bếp Bản Địa A Lưới`;
      description = `Món ăn truyền thống đậm chất Trường Sơn. Thịt bò cỏ thả đồi được tẩm ướp gia vị rừng và hun khói than củi tự nhiên, thơm lừng và ngọt thịt. Rất thích hợp làm mồi nhắm cùng rượu cần hoặc làm quà biếu độc đáo.`;
      specs = [
        "Bò cỏ thả đồi tươi ngon",
        "Gói 500g hút chân không tiện lợi",
        "Không phẩm màu, không chất bảo quản công nghiệp"
      ];
    }
  } else if (isTea) {
    weight = "Hộp 120g - 200g";
    expiryDate = "18 tháng kể từ ngày sản xuất";
    storageGuide = "Đậy kín nắp sau khi dùng, để nơi khô ráo, tránh mùi lạ";
    generatedName = `${rawName} Thảo Mộc Tự Nhiên - Thanh Nhiệt & Ngủ Ngon A Lưới`;
    description = `Trà thảo mộc A Lưới được phối trộn tinh tế từ các loại thảo dược quý thu hái tự nhiên trên nương rẫy vùng cao: chè vằng sẻ, sâm cau, cà gai leo và cỏ ngọt. Vị trà tiền chát nhẹ, hậu ngọt sâu lắng, mang lại cảm giác thư thái, giải độc gan, thanh nhiệt cơ thể và hỗ trợ giấc ngủ sâu ngon giấc.`;
    specs = [
      "Nguyên liệu thảo dược rừng tự nhiên 100%",
      "Thanh lọc cơ thể, giải nhiệt, hỗ trợ an thần ngủ ngon",
      "Không chứa chất bảo quản, ít caffeine, phù hợp mọi lứa tuổi",
      "Hộp tiện dụng, dễ bảo quản và pha chế hàng ngày"
    ];
  } else if (isWine) {
    weight = "Bình gốm 4 - 6 lít kèm cần hút";
    expiryDate = "Càng để lâu càng thơm ngon đượm vị";
    storageGuide = "Để nơi râm mát, đậy kín nắp bình trước khi mở cắm cần";
    generatedName = `${rawName} Men Lá Truyền Thống Người Pa Cô - A Lưới`;
    description = `Rượu cần A Lưới được ủ từ nếp nương thơm dẻo cùng men lá rừng bí truyền gồm hơn 20 loại vỏ cây và lá thuốc đại ngàn. Rượu có vị ngọt êm, nồng ấm, thơm mùi men lá tự nhiên mà không gây đau đầu. Thức uống biểu tượng cho sự hiếu khách và tình đoàn kết của đồng bào vùng cao trong các dịp lễ hội.`;
    specs = [
      "Gạo nếp nương rẫy nguyên hạt thơm dẻo",
      "Men lá rừng truyền thống không cồn công nghiệp",
      "Hương vị ngọt thanh, nồng đượm, hậu vị ấm áp",
      "Kèm bộ cần hút trúc tự nhiên"
    ];
  } else if (isBamboo) {
    weight = "300g - 800g";
    expiryDate = "Độ bền trên 5 năm";
    storageGuide = "Để nơi khô thoáng, tránh ngâm nước lâu ngày";
    generatedName = `${rawName} Đan Tay Thủ Công Từ Tre Cật Núi Rừng A Lưới`;
    description = `Sản phẩm thủ công mây tre đan do các nghệ nhân làng nghề A Lưới tỉ mỉ chuốt từng nan tre cật dẻo dai. Sản phẩm được xử lý gác bếp chống mối mọt tự nhiên, bền chắc và thân thiện với môi trường, vừa dùng tiện lợi trong gia đình vừa làm đồ trang trí mộc mạc tinh tế.`;
    specs = [
      "100% tre cật tự nhiên đã qua sấy khói chống mọt",
      "Đan thủ công tỉ mỉ, nan tre bóng mịn đều đặn",
      "Thân thiện môi trường, tái sử dụng bền bỉ"
    ];
  } else {
    // Sản phẩm tổng quát
    generatedName = `${rawName} - Đặc Sản Bản Địa A Lưới OCOP`;
    description = `${rawName} là sản phẩm đặc trưng của vùng cao A Lưới (Thừa Thiên Huế), được nuôi trồng và chế biến theo phương pháp thủ công tự nhiên của bà con đồng bào. Sản phẩm lưu giữ trọn vẹn hương vị mộc mạc của đại ngàn Trường Sơn, an toàn cho sức khỏe và giàu giá trị dinh dưỡng. ${userKw ? `Điểm đặc biệt: ${userKw}.` : ""}`;
    specs = [
      "Đặc sản bản địa vùng cao A Lưới 100%",
      "Quy trình sản xuất tự nhiên, an toàn vệ sinh thực phẩm",
      "Thích hợp dùng cho gia đình và làm quà tặng ý nghĩa"
    ];
  }

  seoTitle = `${generatedName} | Chạm A Lưới`;
  seoDescription = description.substring(0, 155) + "...";

  return {
    name: generatedName,
    description,
    specs,
    weight,
    expiryDate,
    storageGuide,
    seoTitle,
    seoDescription,
    origin: "Huyện A Lưới, Thừa Thiên Huế",
    source: "local_expert"
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// GOOGLE GEMINI AI CALLER
// ─────────────────────────────────────────────────────────────────────────────
export async function generateProductContentWithGemini(
  input: GenerateProductAiInput,
  apiKey: string
): Promise<GeneratedProductAiOutput | null> {
  const model = "gemini-flash-latest"; // Hoặc fallback
  const prompt = `Bạn là chuyên gia Content Marketing thương mại điện tử (Shopee) kiêm nhà nghiên cứu văn hóa du lịch cộng đồng vùng cao A Lưới, Thừa Thiên Huế.
Hãy viết nội dung bán hàng cực kỳ hấp dẫn cho sản phẩm sau:
- Tên sản phẩm: "${input.name}"
- Danh mục: "${input.category || "Đặc sản A Lưới"}"
- Phong cách viết: "${input.tone || "shopee"}" (shopee = cuốn hút, kích thích mua hàng; culture = giàu chất thơ và văn hóa bản địa Pa Cô - Tà Ôi; concise = súc tích)
- Từ khóa bổ sung: "${input.keywords || ""}"

YÊU CẦU TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON (không kèm markdown \`\`\`json):
{
  "name": "Tên sản phẩm chuẩn SEO Shopee có chứa từ khóa hot và xuất xứ A Lưới",
  "description": "Đoạn văn 3-5 câu mô tả chi tiết nguồn gốc núi rừng Trường Sơn, quy trình chế biến thủ công, hương vị và công dụng",
  "specs": ["Đặc tính 1", "Đặc tính 2", "Đặc tính 3", "Đặc tính 4"],
  "weight": "Khối lượng tịnh (VD: 500g hoặc Chai 500ml)",
  "expiryDate": "Hạn sử dụng (VD: 12 tháng kể từ ngày sản xuất)",
  "storageGuide": "Hướng dẫn bảo quản chi tiết",
  "seoTitle": "Tiêu đề chuẩn SEO Google dưới 70 ký tự",
  "seoDescription": "Mô tả SEO dưới 160 ký tự",
  "origin": "Huyện A Lưới, Thừa Thiên Huế"
}`;

  const postData = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json"
    }
  });

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: postData,
      cache: "no-store"
    }
  );

  if (!res.ok) {
    throw new Error(`Gemini API returned status ${res.status}`);
  }

  const json = await res.json();
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) return null;

  const parsed = JSON.parse(text);
  return {
    name: parsed.name || input.name,
    description: parsed.description || "",
    specs: Array.isArray(parsed.specs) ? parsed.specs : [],
    weight: parsed.weight || "500g",
    expiryDate: parsed.expiryDate || "12 tháng",
    storageGuide: parsed.storageGuide || "Nơi khô ráo",
    seoTitle: parsed.seoTitle || input.name,
    seoDescription: parsed.seoDescription || "",
    origin: parsed.origin || "Huyện A Lưới, Thừa Thiên Huế",
    source: "gemini"
  };
}
