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

  // Nhận diện nhóm sản phẩm chuyên sâu A Lưới
  let isBanana = lower.includes("chuối") || lower.includes("bột chuối") || lower.includes("bột mỳ chuối") || lower.includes("bột mì chuối") || lower.includes("chuối xanh") || lower.includes("tinh bột chuối");
  let isZeng = lower.includes("zèng") || lower.includes("dèng") || lower.includes("thổ cẩm") || lower.includes("khăn") || lower.includes("túi thổ cẩm");
  let isHoney = lower.includes("mật ong") || lower.includes("ong rừng") || lower.includes("ong khoái") || lower.includes("ong ruồi");
  let isTea = lower.includes("trà") || lower.includes("chè") || lower.includes("thảo mộc") || lower.includes("vằng") || lower.includes("cà gai leo") || lower.includes("sâm cau");
  let isBeef = lower.includes("bò") || lower.includes("thịt bò") || lower.includes("gác bếp") || lower.includes("thịt khô") || lower.includes("heo khô");
  let isWine = lower.includes("rượu") || lower.includes("cần") || lower.includes("men lá") || lower.includes("tà vạt") || lower.includes("đoác");
  let isBamboo = lower.includes("tre") || lower.includes("mây") || lower.includes("đan") || lower.includes("giỏ") || lower.includes("gùi");
  let isRice = lower.includes("gạo") || lower.includes("ra du") || lower.includes("ra-dư") || lower.includes("nếp than") || lower.includes("nếp nương");

  let generatedName = rawName;
  let description = "";
  let specs: string[] = [];
  let weight = "500g";
  let expiryDate = "12 tháng kể từ ngày sản xuất";
  let storageGuide = "Bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp";
  let seoTitle = `${rawName} | Đặc sản A Lưới OCOP`;
  let seoDescription = "";

  if (isBanana) {
    weight = "Gói 500g / Hũ 500g";
    expiryDate = "12 tháng kể từ ngày sản xuất";
    storageGuide = "Đậy kín miệng túi/hũ sau khi dùng, để nơi khô ráo, thoáng mát, tránh ẩm mốc";
    generatedName = `${rawName} - Tinh Bột Kháng Tự Nhiên Vùng Cao A Lưới`;
    description = `Bột chuối xanh A Lưới là sản phẩm tinh túy được chế biến từ những buồng chuối tiêu xanh già tươi nguyên, mủ nhựa dồi dào thu hái trực tiếp từ các nương rẫy vùng cao của đồng bào Pa Cô, Tà Ôi tại huyện A Lưới, Thừa Thiên Huế. Với điều kiện khí hậu mát lành quanh năm trên độ cao hơn 600m cùng chất đất đồi núi phì nhiêu hoang sơ, cây chuối sinh trưởng hoàn toàn tự nhiên, không chịu tác động của phân bón hóa học hay thuốc kích thích sinh trưởng.\n\nĐiểm làm nên giá trị vượt trội của sản phẩm là nguồn tinh bột kháng (Resistant Starch Type 2) và chất xơ tự nhiên vô cùng dồi dào. Chuối xanh sau thu hoạch được tuyển chọn kĩ càng, ngâm rửa sạch mủ bằng nước suối nguồn trong lành, gọt vỏ rồi chuyển ngay vào công đoạn sấy lạnh khép kín hiện đại. Phương pháp sấy nhiệt thấp giúp giữ trọn vẹn màu sắc hanh vàng óng ả, hương thơm nhẹ nhàng cùng toàn bộ vitamin, khoáng chất (kali, magie) và dược tính quý giá mà không bị biến chất bởi nhiệt độ cao.\n\nBột chuối xanh A Lưới được xem là 'người bạn vàng' của hệ tiêu hóa: hỗ trợ làm dịu các cơn đau dạ dày, hỗ trợ trào ngược axit thực quản, bảo vệ niêm mạc đại tràng và nuôi dưỡng hệ vi sinh đường ruột khỏe mạnh. Đồng thời, lượng tinh bột kháng không bị phân giải ở ruột non giúp tạo cảm giác no lâu, hỗ trợ duy trì chỉ số đường huyết ổn định, rất thích hợp cho người ăn kiêng lành mạnh (eat-clean) và người cao tuổi.\n\nCách dùng vô cùng đơn giản: Mỗi ngày bạn chỉ cần pha 1-2 muỗng bột (khoảng 15-20g) với 150ml nước ấm (50-60°C), có thể hòa thêm chút mật ong rừng A Lưới hoặc phối trộn cùng sữa hạt, ngũ cốc, sinh tố hoa quả. Sản phẩm đạt chuẩn an toàn vệ sinh thực phẩm, đóng gói tiện dụng và là món quà sức khỏe vô giá từ đại ngàn Trường Sơn gửi trao đến mọi tổ ấm gia đình.`;
    specs = [
      "🌿 Xuất xứ: Vùng cao A Lưới, Thừa Thiên Huế (100% chuối già bản địa)",
      "❄️ Công nghệ chế biến: Sấy lạnh tiệt trùng khép kín, giữ trọn vẹn tinh bột kháng RS2",
      "🧪 Thành phần: 100% bột chuối xanh nguyên chất, không chất bảo quản, không phẩm màu, không pha bột gạo",
      "👅 Hương vị & Thể chất: Bột mịn đều màu hanh vàng ngà, thơm thoang thoảng mùi chuối non, vị thanh dịu",
      "🩺 Lợi ích sức khỏe: Hỗ trợ giảm đau dạ dày, trào ngược thực quản, cân bằng hệ vi sinh đường ruột, hỗ trợ vóc dáng",
      "🥣 Hướng dẫn sử dụng: Pha 1 - 2 thìa với 150ml nước ấm vào mỗi buổi sáng trước bữa ăn hoặc hòa cùng sinh tố/sữa chua",
      "📦 Quy cách đóng gói: Túi zip màng bạc chuyên dụng hoặc hũ nhựa nguyên sinh chống ẩm, bảo quản tiện lợi",
      "⏳ Hạn sử dụng: 12 tháng kể từ ngày sản xuất in rõ trên bao bì",
      "🛡️ Tiêu chuẩn chất lượng: Đạt chứng nhận vệ sinh an toàn thực phẩm, định hướng OCOP bản địa tiêu biểu"
    ];
  } else if (isZeng) {
    weight = "300g - 600g";
    expiryDate = "Bền đẹp lâu dài theo thời gian";
    storageGuide = "Giặt tay nhẹ nhàng bằng dầu gội hoặc nước giặt loãng, phơi trong bóng râm mát, không dùng chất tẩy mạnh";
    generatedName = `${rawName} Dệt Thủ Công Bản Địa - Di Sản Thổ Cẩm Zèng A Lưới`;
    description = `Thổ cẩm Zèng (Dèng) A Lưới là báu vật văn hóa tinh hoa và là Di sản văn hóa phi vật thể Quốc gia của đồng bào dân tộc Tà Ôi, Pa Cô miền tây xứ Huế. Mỗi tấm Zèng không đơn thuần là một tác phẩm dệt may thủ công mà còn là hiện thân của tâm hồn, tình yêu quê hương và bàn tay tài hoa của người phụ nữ vùng cao. Để tạo nên một tác phẩm Zèng hoàn thiện, người nghệ nhân phải miệt mài suốt hàng tuần, thậm chí hàng tháng bên khung cửi truyền thống.\n\nĐiểm độc nhất vô nhị làm nên thương hiệu của Zèng A Lưới chính là kỹ thuật dệt cườm chì và cườm màu trực tiếp vào sợi vải ngay trong lúc dệt, chứ không phải thêu hay đính cườm sau khi hoàn tất. Từng hạt cườm được luồn tỉ mỉ tạo nên những hình khối học, biểu tượng sóng nước, mặt trời, đỉnh núi Trường Sơn kỳ vĩ, cỏ cây muôn thú và khát vọng về cuộc sống ấm no, thanh bình.\n\nChất liệu sợi chỉ tự nhiên kết hợp màu nhuộm từ vỏ cây rừng, củ nâu, lá chàm truyền thống giúp tấm vải vừa dẻo dai, giữ màu bền đẹp qua nhiều năm tháng vừa an toàn dịu nhẹ với làn da. Tấm Zèng thích hợp dùng làm khăn choàng thanh lịch, vải may trang phục dạ hội truyền thống, túi xách thời trang cao cấp hoặc tranh treo tường nghệ thuật độc bản.\n\nSở hữu sản phẩm Zèng A Lưới là bạn đang cùng chúng tôi gìn giữ một di sản văn hóa sống ngàn đời của đồng bào miền núi, đồng thời trực tiếp tiếp sức cho các hợp tác xã làng nghề dệt thủ công bản địa phát triển bền vững.`;
    specs = [
      "🌿 Xuất xứ: Làng nghề dệt thổ cẩm Zèng A Đớt / A Roàng, huyện A Lưới, Thừa Thiên Huế",
      "💎 Danh hiệu: Di sản văn hóa phi vật thể Quốc gia, sản phẩm OCOP du lịch di sản đặc sắc",
      "🧵 Kỹ thuật dệt: Dệt tay thủ công 100% trên khung cửi truyền thống, cài cườm chì trực tiếp vào sợi",
      "🎨 Hoa văn biểu trưng: Họa tiết độc bản miêu tả đại ngàn Trường Sơn, dòng suối nguồn và muông thú",
      "🧵 Chất liệu: Sợi cotton dệt tự nhiên kết hợp cườm hạt chắc chắn, độ bền hàng chục năm",
      "👗 Công dụng đa năng: Làm khăn quàng cổ sang trọng, may y phục cao cấp, phụ kiện thời trang hoặc decor tranh treo",
      "🧼 Hướng dẫn bảo quản: Giặt tay bằng nước lạnh hoặc dầu gội dịu nhẹ, phơi khô trong bóng mát",
      "📦 Quy cách đóng gói: Hộp quà kraft thân thiện môi trường, đính kèm thiệp giới thiệu văn hóa Zèng bản địa"
    ];
  } else if (isHoney) {
    weight = "Chai 500ml / 1000ml";
    expiryDate = "24 tháng kể từ ngày khai thác";
    storageGuide = "Bảo quản ở nhiệt độ phòng thoáng mát (25-30°C), đậy kín nắp chai, không để trong tủ lạnh";
    generatedName = `${rawName} - Mật Ong Rừng Già Nguyên Chất Đại Ngàn A Lưới`;
    description = `Mật ong rừng già A Lưới được khai thác hoàn toàn tự nhiên từ những cánh rừng nguyên sinh bạt ngàn tại vùng đệm Vườn Quốc gia Bạch Mã và dãy Trường Sơn hùng vĩ thuộc huyện A Lưới, Thừa Thiên Huế. Đây là nơi ngàn hoa đua nở quanh năm: hoa tràm rừng, sâm đá, hoa dẻ, chuối rừng và muôn vàn loài thảo dược quý hoang dại, mang đến cho đàn ong khoái nguồn mật hoa tinh khiết và giàu dưỡng chất nhất.\n\nQuy trình săn mật đòi hỏi sự can trường và kinh nghiệm dạn dày của người dân tộc Pa Cô, Cơ Tu. Họ trèo lên những cây đại thụ cao hàng chục mét hoặc các vách đá cheo leo để lấy mật, chỉ thu hoạch phần bầu mật chín và chừa lại phần con nhộng để bảo tồn đàn ong theo phương thức khai thác rừng bền vững. Mật sau khi mang về được lọc thủ công qua lớp vải mịn, giữ nguyên toàn bộ các enzyme sống, vitamin nhóm B, C, phấn hoa và khoáng chất tự nhiên mà không qua xử lý đun nhiệt hay pha trộn.\n\nMật ong rừng A Lưới sở hữu màu vàng cánh gián óng ánh sóng sánh, hương thơm nồng nàn đặc trưng của hoa rừng đại ngàn, vị ngọt thanh sâu lắng đầu lưỡi và không gây cảm giác gắt cổ. Khi mở nắp chai, bạn sẽ cảm nhận ngay bọt khí gas tự nhiên sủi tăm mạnh mẽ – dấu hiệu rõ nét nhất của mật ong rừng hoang dã thứ thiệt.\n\nSản phẩm là món quà đại bổ cho sức khỏe: hỗ trợ tăng sức đề kháng, bổ phế tiêu đờm, hỗ trợ làm êm dịu niêm mạc dạ dày, cải thiện giấc ngủ ngon và chăm sóc làn da mịn màng tươi trẻ.`;
    specs = [
      "🌿 Xuất xứ: Rừng nguyên sinh Hồng Kim, A Roàng, huyện A Lưới, Thừa Thiên Huế",
      "🍯 Loại mật: Mật ong khoái rừng tự nhiên 100%, khai thác theo mùa đúng độ chín",
      "🧪 Tiêu chuẩn chất lượng: Tuyệt đối không pha đường, không chất bảo quản công nghiệp, không hạ thủy phần cưỡng bức",
      "👅 Hương vị & Thể chất: Màu vàng óng hoặc cánh gián đậm đặc quánh, vị ngọt thanh sâu, thơm nồng mùi hoa rừng",
      "🫧 Đặc tính tự nhiên: Lên men tạo ga tự nhiên mạnh theo chu kỳ thời tiết miền núi, giàu enzyme và khoáng vi lượng",
      "🩺 Công dụng nổi bật: Bồi bổ thể lực, tăng sức đề kháng, hỗ trợ hô hấp dạ dày, làm đẹp da tự nhiên",
      "🥣 Hướng dẫn sử dụng: Dùng 1-2 muỗng mật pha cùng 150ml nước ấm uống buổi sáng hoặc ngâm chanh đào, tỏi, đông trùng",
      "📦 Quy cách bao bì: Chai thủy tinh dày dặn, nắp khóa an toàn niêm phong nguồn gốc xuất xứ rõ ràng",
      "⏳ Hạn sử dụng: 24 tháng bảo quản nơi khô ráo thoáng mát ở nhiệt độ phòng"
    ];
  } else if (isBeef) {
    weight = "Gói 500g hút chân không";
    expiryDate = "6 tháng (ngăn đông) / 1 tháng (ngăn mát)";
    storageGuide = "Bảo quản trong ngăn đông tủ lạnh (-18°C), rã đông tự nhiên trước khi dùng";
    generatedName = `${rawName} Gác Bếp Than Củi - Tiêu Rừng & Mắc Khén Đậm Vị A Lưới`;
    description = `Thịt bò vàng gác bếp A Lưới là món ẩm thực trứ danh được chế biến từ những chú bò cỏ địa phương chăn thả tự nhiên trên các triền đồi cỏ xanh ngắt vùng cao A Lưới, Thừa Thiên Huế. Do được vận động liên tục trên địa hình đồi dốc và chỉ ăn cỏ non cùng thảo mộc tự nhiên, từng thớ thịt bò ở đây luôn săn chắc, ngọt đậm đà và giàu hàm lượng sắt cùng protein quý giá.\n\nĐể làm nên hương vị đỉnh cao khó quên, thịt bắp và thăn tươi sau khi mổ được lọc bỏ gân mỡ, cắt thành từng dải bản lớn rồi ướp đẫm các loại gia vị đại ngàn độc quyền: tiêu rừng cay the, hạt dổi, mắc khén thơm lừng, ớt hiểm giã nhuyễn cùng muối hầm truyền thống. Từng xiên thịt sau đó được treo lên giàn bếp than củi rừng hồng rực, hun khói từ từ ngày đêm suốt nhiều ngày ròng rã. Lửa củi tự nhiên từ các loại gỗ rừng thơm đượm giúp miếng thịt se khô từ ngoài vào trong, vỏ ngoài ánh lên màu nâu sẫm của khói bếp mà bên trong vẫn giữ nguyên màu đỏ hồng tươi tắn, mềm mại và ngọt lịm.\n\nKhi thưởng thức, bạn chỉ cần nướng lại trên than hồng hoặc hấp sơ cách thủy, sau đó dùng chày đập nhẹ để thớ thịt bung tơi theo sớ dài. Chấm từng miếng thịt bò thơm nồng cùng muối ớt chanh rừng hoặc muối kiến vàng độc lạ, nhấp thêm ngụm rượu cần ấm nồng, cả phong vị hoang dã của núi rừng Trường Sơn như bừng nở trọn vẹn trong khoang miệng.\n\nSản phẩm được đóng gói hút chân không hiện đại, sạch sẽ, đảm bảo vệ sinh an toàn thực phẩm và là món mồi nhắm thượng hạng, món quà biếu sang trọng dành tặng đối tác, người thân trong các dịp lễ tết đặc biệt.`;
    specs = [
      "🌿 Nguồn gốc: 100% bò cỏ thả đồi tự nhiên vùng núi cao A Lưới, Thừa Thiên Huế",
      "🔥 Quy trình chế biến: Tẩm ướp gia vị rừng và hun khói than củi tự nhiên thủ công suốt 72 giờ",
      "🧪 Gia vị truyền thống: Hạt dổi, mắc khén, tiêu rừng hoang dã, ớt chỉ thiên và muối hầm",
      "🥩 Kết cấu & Thể chất: Thớ thịt dài mềm ngọt, mặt ngoài óng khói nâu sậm, bên trong đỏ hồng tự nhiên",
      "🍽️ Hướng dẫn thưởng thức: Nướng lại trên than hoa, lò vi sóng (1-2 phút) hoặc hấp cách thủy rồi xé sợi chấm muối tiêu chanh",
      "📦 Quy cách đóng gói: Túi 500g hút chân không tiệt trùng 2 lớp, tặng kèm gói muối chấm đặc sản bản địa",
      "⏳ Thời hạn bảo quản: 6 tháng trong ngăn đông tủ lạnh (-18°C), 1 tháng trong ngăn mát sau khi mở túi",
      "🛡️ Tiêu chuẩn VSTP: Không chất bảo quản công nghiệp, không phẩm màu hóa học, an toàn tuyệt đối"
    ];
  } else if (isTea) {
    weight = "Hộp 150g - 250g (Túi lọc / Trà khô)";
    expiryDate = "18 tháng kể từ ngày sản xuất";
    storageGuide = "Đậy kín nắp sau khi mở, để nơi khô ráo, thoáng gió, tránh ánh sáng trực tiếp và các mùi lạ";
    generatedName = `${rawName} Thảo Mộc Rừng Già - Thanh Lọc Cơ Thể & An Thần A Lưới`;
    description = `Trà thảo mộc A Lưới là sự hòa quyện tinh hoa đất trời giữa các loại dược liệu quý thu hái tự nhiên từ sườn núi Trường Sơn hùng vĩ, huyện A Lưới, Thừa Thiên Huế. Vùng đất cao nguyên quanh năm mây mù bao phủ, sương lạnh và nắng vàng tạo nên dược tính đậm đặc cho các loài cây thảo mộc bản địa như chè vằng sẻ, sâm cau, cà gai leo, cỏ ngọt và lá giang rừng.\n\nCác loại thảo mộc sau khi được người dân bản địa thu hái đúng độ tuổi sẽ được rửa sạch bằng nước suối nguồn trong vắt, băm nhỏ và sao sấy thủ công trên chảo gang đượm lửa than rừng. Quá trình sao vàng hạ thổ kỳ công theo phương pháp y học cổ truyền giúp loại bỏ độc tố tự nhiên, đồng thời đánh thức hương thơm mộc mạc thảo dã và giữ trọn các hoạt chất sinh học (flavonoid, saponin, tanin) quý báu.\n\nNước trà khi pha có màu vàng óng sóng sánh như mật, tỏa hương thơm ngát tự nhiên dễ chịu. Nhấp ngụm đầu tiên thấy vị hơi đắng chát dịu, nhưng chỉ vài giây sau vị ngọt thanh mát sâu sắc đã lan tỏa khắp khoang miệng và cuống họng. Trà có tác dụng thanh nhiệt giải độc gan, hạ mỡ máu, ổn định huyết áp, lợi sữa cho phụ nữ sau sinh và đem lại giấc ngủ sâu êm đềm, thư thái sau một ngày dài làm việc căng thẳng.\n\nSản phẩm được chế biến sạch sẽ, đóng gói tiện dụng, không chứa hương liệu nhân tạo, thích hợp để gia đình thưởng thức hàng ngày hoặc làm quà biếu trang nhã, ấm áp nghĩa tình.`;
    specs = [
      "🌿 Xuất xứ: Vùng đồi núi dược liệu huyện A Lưới, tỉnh Thừa Thiên Huế",
      "🍃 Thành phần thảo mộc: 100% thảo mộc tự nhiên: chè vằng, cà gai leo, sâm cau, cỏ ngọt bản địa",
      "🔥 Phương pháp chế biến: Sao vàng hạ thổ truyền thống trên than củi, giữ trọn vẹn dược tính tự nhiên",
      "☕ Cảm quan thưởng thức: Nước trà trong màu vàng hanh, hương thảo dược thanh khiết, tiền chát nhẹ hậu ngọt sâu",
      "🩺 Công dụng sức khỏe: Thanh lọc cơ thể, mát gan giải độc, hỗ trợ giấc ngủ sâu, điều hòa huyết áp",
      "🫖 Hướng dẫn pha trà: Hãm 5-10g trà với 300-500ml nước sôi 95°C trong 5-7 phút, có thể uống nóng hoặc lạnh",
      "📦 Quy cách bao bì: Hộp cao cấp hoặc túi zip chống ẩm kín khí, đảm bảo giữ trọn vẹn hương trà",
      "⏳ Hạn sử dụng: 18 tháng kể từ ngày sản xuất in rõ trên bao bì",
      "🛡️ Tiêu chuẩn chất lượng: Đạt chứng nhận vệ sinh an toàn thực phẩm, định hướng OCOP 3-4 sao"
    ];
  } else if (isWine) {
    weight = "Bình gốm 4 - 6 lít kèm bộ cần hút";
    expiryDate = "Càng ủ lâu càng thơm ngon đượm đà";
    storageGuide = "Để nơi râm mát ở nhiệt độ phòng, đậy kín nắp bình trước khi mở cắm cần uống";
    generatedName = `${rawName} Men Lá Rừng Bản Địa - Nét Đẹp Văn Hóa Người Pa Cô A Lưới`;
    description = `Rượu cần A Lưới là thức uống linh thiêng, kết tinh từ văn hóa ẩm thực và tấm lòng mến khách nồng hậu của đồng bào Pa Cô, Tà Ôi tại miền biên viễn A Lưới, Thừa Thiên Huế. Trong mỗi dịp lễ hội Đâm trâu, mừng lúa mới Aza hay đón khách quý phương xa về bản, ché rượu cần đặt trang trọng giữa gian nhà Gươl luôn là tâm điểm gắn kết tình làng nghĩa xóm và thắt chặt tình bằng hữu.\n\nBí quyết tạo nên sự khác biệt của rượu cần A Lưới nằm ở loại men lá rừng bí truyền được giã từ hơn 20 loại vỏ cây, rễ cây thuốc quý thu hái từ rừng sâu Trường Sơn. Nguyên liệu chính là những hạt gạo nếp nương rẫy tròn mẩy, thơm lừng vừa thu hoạch xong đem đồ chín thành xôi dẻo, để nguội rồi trộn đều cùng bột men lá và trấu sạch đã luộc phơi khô. Hỗn hợp được ủ kín trong chum vò sành suốt nhiều tháng ròng để tinh hoa đại ngàn lên men tự nhiên chậm rãi.\n\nRượu cần khi mở nắp dậy lên mùi hương nồng đượm ngây ngất của men lá và xôi nếp chín. Cắm những chiếc cần trúc dẻo dai vào đáy bình, châm thêm dòng nước suối nguồn mát lạnh, hút một ngụm rượu cần sẽ cảm nhận rõ rệt vị ngọt êm dịu, ấm nồng lan tỏa khắp lồng ngực mà tuyệt đối không gây cảm giác gắt cổ hay đau đầu sau khi thưởng thức.\n\nChé rượu cần được tạo tác trang nghiêm trong bình gốm mộc mạc, kèm đầy đủ cần hút bằng trúc thiên nhiên, là món quà độc nhất vô nhị mang đậm hơi thở bản làng Trường Sơn dành cho những người trân quý văn hóa bản địa.`;
    specs = [
      "🌿 Xuất xứ: Bản làng truyền thống Pa Cô, Tà Ôi, huyện A Lưới, Thừa Thiên Huế",
      "🌾 Nguyên liệu chính: Nếp nương rẫy dẻo thơm, men lá rừng bí truyền từ 20 loại cây thuốc quý",
      "🍶 Phương pháp ủ rượu: Lên men tự nhiên chậm trong chum sành đất nung, không cồn công nghiệp hóa chất",
      "👅 Hương vị & Trải nghiệm: Vị ngọt thanh nồng đượm, hậu vị êm ái thơm ngát, uống êm say men say tình",
      "🎋 Phụ kiện đi kèm: Bình gốm truyền thống tinh tế kèm bộ cần hút bằng trúc rừng tự nhiên",
      "🎉 Thích hợp: Tiệc sum họp gia đình, hội ngộ bạn bè, lễ kỷ niệm và làm quà tặng biếu Tết độc bản",
      "🥣 Hướng dẫn sử dụng: Mở nắp vò, châm nước lọc tinh khiết hoặc nước khoáng lạnh/nước dừa tươi rồi cắm cần thưởng thức",
      "⏳ Thời gian sử dụng: Rượu để càng lâu năm càng ngấu, càng đậm đà thơm ngọt"
    ];
  } else if (isBamboo) {
    weight = "300g - 800g";
    expiryDate = "Độ bền trên 5 năm sử dụng";
    storageGuide = "Để nơi khô thoáng, tránh ngâm nước lâu ngày, vệ sinh bằng khăn ẩm rồi phơi khô tự nhiên";
    generatedName = `${rawName} Đan Tay Thủ Công Từ Tre Cật Núi Rừng A Lưới`;
    description = `Sản phẩm thủ công mây tre đan A Lưới là tinh hoa được tạo tác từ đôi bàn tay khéo léo và khối óc tài hoa của các nghệ nhân làng nghề truyền thống huyện vùng cao A Lưới, Thừa Thiên Huế. Từng nan tre, sợi mây được tuyển chọn từ những bụi tre cật già dẻo dai sinh trưởng trên các đỉnh đồi đá Trường Sơn quanh năm đón gió núi.\n\nĐể tạo nên một sản phẩm bền chắc hoàn hảo, tre sau khi đốn hạ được pha nan, chuốt bóng phẳng phiu bằng tay rồi trải qua công đoạn sấy khói gác bếp tự nhiên suốt nhiều tuần. Khói than củi cật rừng giúp diệt sạch mối mọt tự nhiên, tạo cho sợi mây tre sắc màu nâu hổ phách mộc mạc hoài cổ mà không cần dùng đến bất kỳ loại hóa chất chống mốc độc hại nào.\n\nTừng đường đan nan cài nan đều tăm tắp, kết cấu vững chãi, vừa sở hữu nét đẹp mộc mạc gần gũi với thiên nhiên, vừa tiện dụng trong đời sống sinh hoạt gia đình, vừa là điểm nhấn trang trí nội thất mang phong cách thô mộc (vintage / rustic) tinh tế và thân thiện với môi trường.\n\nSản phẩm thể hiện sự gắn kết bền chặt giữa con người miền sơn cước với thiên nhiên, đồng thời góp phần nâng đỡ đời sống kinh tế cho bà con đồng bào dân tộc thiểu số phát triển nghề truyền thống.`;
    specs = [
      "🌿 Xuất xứ: Làng nghề thủ công mây tre đan A Lưới, Thừa Thiên Huế",
      "🎋 Chất liệu: 100% mây tre cật tự nhiên dẻo dai, chuốt mịn tỉ mỉ không dằm xước",
      "🔥 Xử lý truyền thống: Sấy khói gác bếp than củi chống ẩm mốc và mối mọt tự nhiên",
      "👐 Kỹ thuật chế tác: Đan tay thủ công 100% bởi các nghệ nhân giàu kinh nghiệm",
      "🏡 Ứng dụng: Đựng nông sản, đựng đồ dùng gia đình, phụ kiện chụp ảnh du lịch hoặc trang trí homestay/quán cà phê",
      "🌱 Thân thiện môi trường: Sản phẩm phân hủy sinh học tự nhiên, không độc hại cho sức khỏe",
      "🧼 Hướng dẫn bảo quản: Vệ sinh bằng khăn mềm ẩm, phơi khô trong bóng râm, tránh để nơi ngập nước lâu",
      "⏳ Độ bền vượt trội: Tuổi thọ sử dụng bền đẹp từ 5 đến 10 năm trong điều kiện bảo quản bình thường"
    ];
  } else if (isRice) {
    weight = "Túi 1kg / 2kg / 5kg";
    expiryDate = "12 tháng kể từ ngày thu hoạch đóng gói";
    storageGuide = "Bảo quản nơi khô ráo thoáng mát, đậy kín thùng đựng gạo, tránh ẩm mốc";
    generatedName = `${rawName} - Gạo Ra Dư Đặc Sản Bản Địa Vùng Cao A Lưới`;
    description = `Gạo Ra Dư (Ra-dư) là giống lúa nương cổ truyền quý hiếm được gìn giữ qua nhiều thế hệ đồng bào Pa Cô, Tà Ôi tại thung lũng A Lưới, Thừa Thiên Huế. Giống lúa đặc sản này được gieo trồng hoàn toàn trên sườn nương rẫy dốc cao, đón nhận tinh hoa nguồn nước mát lành từ khe suối đại ngàn và nguồn đất rừng giàu dinh dưỡng mà không hề sử dụng phân bón vô cơ hay thuốc trừ sâu hóa học.\n\nHạt gạo Ra Dư có hình dáng thon tròn, màu trắng đục tự nhiên hoặc ánh tím cẩm đẹp mắt, phôi gạo còn nguyên vẹn lớp cám giàu vitamin nhóm B, kẽm, canxi và các nguyên tố vi lượng tốt cho sức khỏe. Khi nấu chín, cơm tỏa hương thơm ngát tự nhiên lan tỏa khắp gian bếp, hạt cơm dẻo mềm, vị ngọt đậm đà khác biệt hoàn toàn với các loại gạo canh tác công nghiệp đại trà.\n\nCơm nấu từ gạo Ra Dư dẻo dai ngay cả khi để nguội, rất thích hợp dùng cho bữa cơm gia đình đầm ấm, làm món cơm lam ống nứa thơm lừng hoặc nấu cháo dinh dưỡng bồi bổ cho trẻ nhỏ và người lớn tuổi.\n\nSản phẩm được thu hoạch chính vụ, xay xát mộc giữ trọn cám dinh dưỡng, đóng gói cẩn thận và là đặc sản OCOP niềm tự hào của nông nghiệp sinh thái bền vững miền tây xứ Huế.`;
    specs = [
      "🌿 Xuất xứ: Nương rẫy bậc thang huyện A Lưới, tỉnh Thừa Thiên Huế",
      "🌾 Giống lúa: Giống lúa Ra Dư cổ truyền bản địa thuần chủng của người Pa Cô - Tà Ôi",
      "🌱 Tiêu chuẩn canh tác: Nông nghiệp sinh thái tự nhiên, không thuốc trừ sâu, tưới nước suối nguồn",
      "🧪 Giá trị dinh dưỡng: Giàu chất xơ, vitamin nhóm B (B1, B6), khoáng chất vi lượng tăng cường sức đề kháng",
      "🍚 Hương vị cơm: Hạt cơm mềm dẻo, thơm đậm đà, hậu vị ngọt thanh, để nguội vẫn mềm không khô cứng",
      "🥣 Hướng dẫn nấu cơm: Vo nhẹ 1-2 lần để giữ lớp cám, đong nước theo tỉ lệ 1 bát gạo : 1.2 bát nước, nấu bằng nồi cơm điện",
      "📦 Quy cách bao bì: Túi hút chân không 1kg / 2kg / 5kg chống mọt mốc tự nhiên, bảo quản tiện lợi",
      "⏳ Hạn sử dụng: 12 tháng kể từ ngày sản xuất đóng gói",
      "🛡️ Tiêu chuẩn chất lượng: Đạt chuẩn OCOP đặc sản nông nghiệp bản địa Thừa Thiên Huế"
    ];
  } else {
    // Sản phẩm tổng quát / Danh mục khác
    generatedName = `${rawName} - Đặc Sản Bản Địa A Lưới OCOP`;
    description = `${rawName} là sản phẩm đặc trưng tiêu biểu của huyện vùng cao A Lưới (tỉnh Thừa Thiên Huế), được nuôi trồng, thu hái và chế biến theo phương pháp thủ công tự nhiên bởi bà con đồng bào dân tộc Pa Cô, Tà Ôi, Cơ Tu nơi đại ngàn Trường Sơn hùng vĩ. Với điều kiện thổ nhưỡng trù phú và không khí mát lành quanh năm ở độ cao trên 600m, sản phẩm giữ trọn vẹn hương vị hoang sơ thuần khiết của đất trời miền sơn cước.\n\nQuy trình sản xuất tuân thủ nghiêm ngặt các tiêu chuẩn an toàn vệ sinh thực phẩm, lấy chất lượng làm trọng tâm và kiên quyết nói không với các chất phụ gia, chất bảo quản công nghiệp hay phẩm màu độc hại. Từng công đoạn từ chọn lọc nguyên liệu tươi ngon đầu vào đến đóng gói thành phẩm đều được thực hiện tỉ mỉ và tâm huyết, nhằm bảo toàn tối đa giá trị dinh dưỡng tự nhiên và dược tính vốn có của sản phẩm. ${userKw ? `Đặc điểm nổi bật ghi nhận: ${userKw}.\n\n` : "\n\n"}Sản phẩm không chỉ là món ăn, thức uống thơm ngon bổ dưỡng phục vụ đời sống gia đình hàng ngày mà còn là món quà biếu trang trọng, giàu ý nghĩa văn hóa dành tặng bạn bè và đối tác gần xa. Chọn lựa sản phẩm là bạn đang chung tay tiếp sức cho đồng bào vùng cao A Lưới gìn giữ nghề truyền thống, xây dựng nông thôn mới và phát triển kinh tế bền vững.`;
    specs = [
      "🌿 Xuất xứ địa lý: Huyện vùng cao A Lưới, tỉnh Thừa Thiên Huế 100%",
      "🌱 Tiêu chuẩn nguồn nguyên liệu: Canh tác và thu hoạch tự nhiên từ núi rừng Trường Sơn trong lành",
      "🧪 Cam kết chất lượng: 100% nguyên chất, không sử dụng hóa chất độc hại hay chất bảo quản công nghiệp",
      "👅 Hương vị & Thể chất: Hương thơm tự nhiên đặc trưng của nông sản vùng cao, vị đậm đà mộc mạc",
      "🩺 Lợi ích sử dụng: An toàn tuyệt đối cho sức khỏe, giàu dưỡng chất thiên nhiên cho cả gia đình",
      "🥣 Hướng dẫn sử dụng: Sử dụng trực tiếp hoặc chế biến theo hướng dẫn chi tiết in trên bao bì sản phẩm",
      "📦 Quy cách đóng gói: Bao bì chuẩn thương mại tiện dụng, kín khí, chống ẩm và bảo vệ sản phẩm tối đa",
      "⏳ Hạn sử dụng & Bảo quản: Hạn dùng 12 tháng, bảo quản nơi khô ráo, thoáng mát, tránh ánh nắng trực tiếp",
      "🛡️ Tiêu chuẩn chứng nhận: Định hướng sản phẩm OCOP bản địa chất lượng cao của tỉnh Thừa Thiên Huế"
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
  const models = [
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.5-flash-lite",
    "gemini-flash-latest"
  ];

  const prompt = `Bạn là chuyên gia Content Marketing thương mại điện tử cấp cao kiêm nhà nghiên cứu văn hóa ẩm thực và di sản bản địa vùng cao A Lưới, Thừa Thiên Huế.
Hãy viết bài giới thiệu và bán hàng chuyên nghiệp, sâu sắc, hấp dẫn và dài đầy đủ cho sản phẩm sau:
- Tên sản phẩm: "${input.name}"
- Danh mục: "${input.category || "Đặc sản A Lưới"}"
- Phong cách viết: "${input.tone || "shopee"}" (shopee = cuốn hút, kích thích mua hàng, câu từ mượt mà; culture = đậm đà bản sắc núi rừng Trường Sơn, giàu chất thơ và di sản Pa Cô - Tà Ôi; concise = trang trọng, khúc chiết, chuẩn mực)
- Từ khóa/thông tin bổ sung: "${input.keywords || ""}"

QUY TẮC BẮT BUỘC VỀ ĐỘ DÀI & ĐỘ CHI TIẾT:
1. "description" PHẢI LÀ BÀI VIẾT DÀI, CHI TIẾT GỒM 3 ĐẾN 5 ĐOẠN VĂN HOÀN CHỈNH (khoảng 350 - 550 từ, các đoạn phân cách rõ ràng bằng 2 dấu xuống dòng \\n\\n). Tuyệt đối KHÔNG viết ngắn cụt lủn 1-2 câu. Nội dung bài viết phải trải dài qua các khía cạnh:
   - Đoạn 1: Nguồn gốc nguyên liệu tự nhiên từ nương rẫy/rừng già nguyên sinh A Lưới, nơi có khí hậu mát mẻ và thổ nhưỡng trong lành của dải Trường Sơn đại ngàn.
   - Đoạn 2: Quy trình canh tác/thu hái tỉ mỉ và phương thức chế biến thủ công kết hợp kỹ thuật giữ trọn tinh chất, hương vị và dinh dưỡng tự nhiên 100%, không hóa chất.
   - Đoạn 3: Cảm quan thưởng thức (màu sắc, hương thơm, mùi vị đặc trưng) cùng các công dụng, giá trị dinh dưỡng hoặc dược tính tốt cho sức khỏe người dùng.
   - Đoạn 4: Hướng dẫn chi tiết cách dùng/chế biến ngon nhất, mẹo bảo quản và đối tượng sử dụng phù hợp.
   - Đoạn 5: Ý nghĩa nhân văn, cam kết chuẩn sạch an toàn VSTP / định hướng OCOP và đóng góp tạo sinh kế bền vững cho đồng bào dân tộc thiểu số tại A Lưới.
2. "specs" PHẢI LÀ MẢNG GỒM TỪ 7 ĐẾN 10 ĐẶC ĐIỂM NỔI BẬT & QUY CÁCH KỸ THUẬT (Mỗi mục bắt đầu bằng 1 biểu tượng emoji phù hợp như 🌿, 🌾, 💎, 🍯, 🎯, 🥣, 📦, ⏳, 🛡️, ✨...). Phải bao quát: Nguồn gốc xuất xứ, tiêu chuẩn canh tác/thu hái, thành phần tinh khiết, hương vị & kết cấu, lợi ích sức khỏe, hướng dẫn sử dụng, quy cách đóng gói, hạn sử dụng & bảo quản, cam kết chất lượng.

YÊU CẦU TRẢ VỀ ĐÚNG ĐỊNH DẠNG JSON HỢP LỆ (không kèm markdown \`\`\`json):
{
  "name": "Tên sản phẩm chuẩn SEO thương mại điện tử có chứa từ khóa nổi bật và xuất xứ A Lưới",
  "description": "Bài viết chi tiết 3-5 đoạn văn hoàn chỉnh (phân cách bằng \\n\\n), tuyệt đối không viết ngắn",
  "specs": [
    "🌿 Xuất xứ: Vùng núi cao A Lưới, Thừa Thiên Huế...",
    "❄️ Quy trình: Chế biến an toàn tự nhiên...",
    "🧪 Thành phần: 100% nguyên chất...",
    "👅 Hương vị & Thể chất: ...",
    "🩺 Công dụng nổi bật: ...",
    "🥣 Hướng dẫn sử dụng: ...",
    "📦 Quy cách đóng gói: ...",
    "⏳ Hạn sử dụng & Bảo quản: ...",
    "🛡️ Tiêu chuẩn chất lượng: ..."
  ],
  "weight": "Khối lượng tịnh (VD: Gói 500g hoặc Chai 500ml)",
  "expiryDate": "Hạn sử dụng (VD: 12 tháng kể từ ngày sản xuất)",
  "storageGuide": "Hướng dẫn bảo quản chi tiết (nhiệt độ, tránh ẩm/nắng)",
  "seoTitle": "Tiêu đề chuẩn SEO Google dưới 70 ký tự",
  "seoDescription": "Mô tả SEO hấp dẫn dưới 160 ký tự",
  "origin": "Huyện A Lưới, Thừa Thiên Huế"
}`;

  const postData = JSON.stringify({
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.7,
      responseMimeType: "application/json"
    }
  });

  let lastError: any = null;

  for (const model of models) {
    try {
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
        lastError = new Error(`Model ${model} returned status ${res.status}`);
        continue;
      }

      const json = await res.json();
      let text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) continue;

      // Xóa markdown json fence nếu có
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();

      const parsed = JSON.parse(text);
      return {
        name: parsed.name || input.name,
        description: parsed.description || "",
        specs: Array.isArray(parsed.specs) && parsed.specs.length > 0 ? parsed.specs : [],
        weight: parsed.weight || "500g",
        expiryDate: parsed.expiryDate || "12 tháng kể từ ngày sản xuất",
        storageGuide: parsed.storageGuide || "Nơi khô ráo thoáng mát, tránh ánh nắng trực tiếp",
        seoTitle: parsed.seoTitle || `${input.name} | Chạm A Lưới`,
        seoDescription: parsed.seoDescription || "",
        origin: parsed.origin || "Huyện A Lưới, Thừa Thiên Huế",
        source: "gemini"
      };
    } catch (err) {
      lastError = err;
    }
  }

  if (lastError) {
    throw lastError;
  }
  return null;
}
