import { imageFor } from "@/data/site";

export type PlaceCategory =
  | "all"
  | "food"
  | "stay"
  | "play"
  | "experience"
  | "waterfall-stream"
  | "outdoor"
  | "campfire"
  | "community-tourism"
  | "visit"
  | "culture"
  | "specialty"
  | "service";

export const placeCategories: { id: PlaceCategory; label: string; description: string }[] = [
  { id: "all", label: "Tất cả", description: "Toàn bộ điểm đến, dịch vụ và trải nghiệm du lịch cộng đồng tại A Lưới." },
  { id: "food", label: "Ăn uống", description: "Quán ăn bản địa, mâm cơm Pa Cô - Tà Ôi, gà đồi nướng và rau rừng." },
  { id: "stay", label: "Lưu trú", description: "Homestay nhà sàn, nhà nghỉ ven suối và không gian nghỉ dưỡng cộng đồng." },
  { id: "play", label: "Vui chơi", description: "Không gian thư giãn, check-in, bơi lội mát lành và giải trí nhẹ nhàng." },
  { id: "experience", label: "Trải nghiệm", description: "Workshop làm bánh A Quát, giã gạo, bắt cá suối và nghề truyền thống." },
  { id: "waterfall-stream", label: "Thác và suối", description: "Thác A Nôr, suối A Lin, suối Pâr Le nước trong xanh mát mẻ giữa đại ngàn." },
  { id: "outdoor", label: "Hoạt động ngoài trời", description: "Trekking đường rừng Trường Sơn, tắm suối sinh thái, cắm trại dã ngoại." },
  { id: "campfire", label: "Lửa trại", description: "Đêm hội cồng chiêng, nhảy sạp, múa Ra Zooc và thưởng thức rượu cần bên bếp lửa." },
  { id: "community-tourism", label: "Khu du lịch cộng đồng", description: "Mô hình hợp tác xã làng du lịch A Nôr, Hồng Hạ, A Roàng gắn kết người dân." },
  { id: "visit", label: "Tham quan", description: "Cầu treo Pi Lung, đèo Pê Ke, đồi A Bia, cảnh quan thiên nhiên kỳ vĩ." },
  { id: "culture", label: "Văn hóa", description: "Nghề dệt Zèng di sản quốc gia, nhà sàn truyền thống và câu chuyện bản địa." },
  { id: "specialty", label: "Đặc sản", description: "Mật ong rừng già, trà núi thảo mộc, thịt bò gác bếp và quà tặng vùng cao." },
  { id: "service", label: "Dịch vụ khác", description: "Xe ô tô đưa đón 2 chiều Huế - A Lưới, hướng dẫn viên bản địa am hiểu địa bàn." }
];

export type Place = {
  slug: string;
  name: string;
  category: PlaceCategory;
  businessName: string;
  businessId?: string;
  summary: string;
  description: string;
  address: string;
  mapEmbedUrl: string;
  priceLabel: string;
  commissionRate: number; // Chỉ hiển thị trong Admin và Business, KHÔNG render ra khách hàng
  rating: number;
  reviewCount: number;
  openingHours: string;
  voucherOffer: string;
  zaloUrl: string;
  phone: string;
  image: string;
  gallery: string[];
  services: string[];
  highlights: string[];
  activities: string[];
  suitableFor: string[];
  safetyNotes: string[];
  status: "active" | "temporarily_closed";
};

export const places: Place[] = [
  {
    slug: "thac-a-nor",
    name: "Thác A Nôr",
    category: "waterfall-stream",
    businessName: "Hợp tác xã Du lịch Cộng đồng A Nôr",
    businessId: "biz-a-nor",
    summary: "Thác nước tự nhiên 3 tầng hùng vĩ giữa rừng nguyên sinh, điểm tắm mát và nghỉ dưỡng nổi tiếng bậc nhất A Lưới.",
    description:
      "Thác A Nôr thuộc xã Hồng Kim, cách trung tâm thị trấn A Lưới chừng 3km. Con thác đổ xuống qua 3 tầng nước trắng xóa tạo thành hồ tắm tự nhiên trong vắt và mát lạnh. Du khách đến đây không chỉ được tắm suối thư giãn mà còn có thể thưởng thức các món ăn nướng dân dã của đồng bào Pa Cô ngay tại chòi nghỉ ven suối.",
    address: "Làng A Nôr, xã Hồng Kim, huyện A Lưới, Thừa Thiên Huế",
    mapEmbedUrl: "https://www.google.com/maps?q=Th%C3%A1c%20A%20N%C3%B4r%20A%20L%C6%B0%E1%BB%9Bi&output=embed",
    priceLabel: "Dịch vụ từ 220.000đ/người",
    commissionRate: 10,
    rating: 4.9,
    reviewCount: 245,
    openingHours: "07:00 - 17:30 hằng ngày",
    voucherOffer: "Giảm 10% gói hướng dẫn viên & mâm cơm bản địa",
    zaloUrl: "https://zalo.me/0905000118",
    phone: "0905 000 118",
    image: imageFor("photo-1506744038136-46273834b3fb"),
    gallery: [
      imageFor("photo-1506744038136-46273834b3fb"),
      imageFor("photo-1433086966358-54859d0ed716"),
      imageFor("photo-1500534314209-a25ddb2bd429")
    ],
    services: ["Thuê chòi nghỉ", "Tắm thác tự nhiên", "Mâm cơm Pa Cô", "Cho thuê áo phao", "Hướng dẫn viên bản địa"],
    highlights: ["Thác nước 3 tầng tuyệt đẹp", "Nước suối mát lạnh tự nhiên", "Bãi tắm an toàn có người giám sát", "Có chòi nghỉ ngơi ven suối"],
    activities: ["Tắm suối và chụp ảnh ngọn thác", "Thưởng thức cá nướng ống tre", "Đi bộ đường rừng quanh thác", "Giao lưu cùng người bản địa"],
    suitableFor: ["Gia đình", "Nhóm bạn trẻ", "Đoàn tham quan dã ngoại", "Cặp đôi thích thiên nhiên"],
    safetyNotes: ["Luôn mặc áo phao khi xuống vùng nước sâu", "Cẩn thận trơn trượt trên các mỏm đá ướt", "Không tắm khi có mưa to đầu nguồn rừng già"],
    status: "active"
  },
  {
    slug: "suoi-a-lin",
    name: "Suối A Lin",
    category: "waterfall-stream",
    businessName: "Tổ hợp Dịch vụ Sinh thái A Lin",
    businessId: "biz-a-lin",
    summary: "Dòng suối thơ mộng với những tảng đá phẳng, làn nước trong vắt cùng những vạt rừng xanh mát bao bọc.",
    description:
      "Suối A Lin nằm trên địa bàn xã Hồng Trung, nép mình dưới bóng cây rợp mát của đại ngàn Trường Sơn. Suối nổi tiếng với các vụng tắm nước êm ả, đáy trải sỏi sạch sẽ rất an toàn. Đây là địa điểm lý tưởng để tổ chức các buổi picnic cuối tuần, nướng thịt ven bờ và thả mình trong làn nước thanh khiết.",
    address: "Xã Hồng Trung, huyện A Lưới, Thừa Thiên Huế",
    mapEmbedUrl: "https://www.google.com/maps?q=Su%E1%BB%91i%20A%20Lin%20A%20L%C6%B0%E1%BB%9Bi&output=embed",
    priceLabel: "Từ 150.000đ/người",
    commissionRate: 8,
    rating: 4.7,
    reviewCount: 118,
    openingHours: "07:30 - 17:00 hằng ngày",
    voucherOffer: "Giảm 50.000đ cho đoàn từ 5 khách",
    zaloUrl: "https://zalo.me/0966000118",
    phone: "0966 000 118",
    image: imageFor("photo-1500534314209-a25ddb2bd429"),
    gallery: [
      imageFor("photo-1500534314209-a25ddb2bd429"),
      imageFor("photo-1433086966358-54859d0ed716"),
      imageFor("photo-1506744038136-46273834b3fb")
    ],
    services: ["Chòi dừng chân", "Bếp than & dụng cụ nướng", "Tắm suối sinh thái", "Hỗ trợ xe đưa đón"],
    highlights: ["Lòng suối nông và nhiều phiến đá rộng", "Không gian tĩnh mịch hoang sơ", "Rất thích hợp cho dã ngoại gia đình"],
    activities: ["Tắm mát thư giãn", "Nướng gà đồi và thịt ba chỉ bên suối", "Đọc sách nghe tiếng róc rách giữa rừng", "Chụp ảnh check-in suối đá"],
    suitableFor: ["Gia đình có trẻ nhỏ", "Nhóm bạn thích cắm trại", "Khách du lịch tự túc"],
    safetyNotes: ["Thu dọn toàn bộ rác thải sau bữa ăn", "Không bước ra khỏi khu vực suối được chỉ định", "Nên mang dép chống trơn"],
    status: "active"
  },
  {
    slug: "suoi-par-le",
    name: "Suối Pâr Le",
    category: "waterfall-stream",
    businessName: "Khu Du lịch Sinh thái Suối Pâr Le",
    businessId: "biz-par-le",
    summary: "Viên ngọc xanh tại Hồng Hạ với bãi đá tự nhiên rộng lớn, có vách đá nhảy nước mạo hiểm và làn nước ngọc bích.",
    description:
      "Suối Pâr Le toạ lạc tại xã Hồng Hạ, cửa ngõ vào huyện A Lưới. Suối có hai vịnh tắm lớn với sức chứa hàng trăm du khách cùng lúc. Nước suối trong thấu đáy mát lạnh, bao bọc bởi những cánh rừng rậm rạp. Tại đây có cả khu vực nước êm cho trẻ em và vịnh nước sâu cho những ai yêu thích cảm giác nhảy vách mạo hiểm.",
    address: "Xã Hồng Hạ, huyện A Lưới, Thừa Thiên Huế",
    mapEmbedUrl: "https://www.google.com/maps?q=Su%E1%BB%91i%20P%C3%A2r%20Le%20A%20L%C6%B0%E1%BB%9Bi&output=embed",
    priceLabel: "Vé & dịch vụ từ 180.000đ/người",
    commissionRate: 10,
    rating: 4.8,
    reviewCount: 194,
    openingHours: "07:30 - 17:30 (đẹp nhất mùa nắng)",
    voucherOffer: "Giảm 10% gói combo vé + mâm nướng ven suối",
    zaloUrl: "https://zalo.me/0922000118",
    phone: "0922 000 118",
    image: imageFor("photo-1432405972618-c60b0225b8f9"),
    gallery: [
      imageFor("photo-1432405972618-c60b0225b8f9"),
      imageFor("photo-1500534314209-a25ddb2bd429"),
      imageFor("photo-1501785888041-af3ef285b470")
    ],
    services: ["Vé vào cổng", "Cho thuê sạp gỗ", "Bữa trưa đặc sản vùng cao", "Phao bơi", "Cứu hộ chuyên trách"],
    highlights: ["Vịnh tắm rộng nước trong xanh", "Vị trí gần đèo Tà Lương thuận tiện đi lại", "Món cá suối nướng muối ớt đặc biệt ngon"],
    activities: ["Bơi lội và lặn ngắm sỏi suối", "Nhảy vách đá mạo hiểm (có phao)", "Thưởng thức cơm lam và rượu cần", "Trekking men theo mép suối"],
    suitableFor: ["Đoàn thanh niên", "Phượt thủ", "Gia đình yêu thích thiên nhiên", "Công ty dã ngoại"],
    safetyNotes: ["Tuân thủ bảng chỉ dẫn độ sâu của ban quản lý", "Mặc áo phao khi bơi ra vịnh sâu", "Tránh di chuyển khi trời nổi giông lốc"],
    status: "active"
  },
  {
    slug: "rung-nguyen-sinh-a-roang",
    name: "Rừng nguyên sinh A Roàng",
    category: "outdoor",
    businessName: "Hội Hướng dẫn viên Khám phá A Roàng",
    businessId: "biz-a-roang",
    summary: "Hành trình trekking xuyên rừng già Trường Sơn, khám phá thảm thực vật nhiệt đới quý hiếm và ngâm mình tại suối khoáng nóng tự nhiên.",
    description:
      "Khu bảo tồn thiên nhiên và rừng nguyên sinh A Roàng là nơi cư ngụ của nhiều loài động thực vật quý hiếm cùng thảm rêu phong cổ thụ. Chuyến đi đưa du khách men theo lối mòn của đồng bào, băng qua những con suối róc rách để đến điểm ngâm chân nước khoáng nóng tự nhiên phun trào giữa đại ngàn xanh biếc.",
    address: "Xã A Roàng, huyện A Lưới, Thừa Thiên Huế",
    mapEmbedUrl: "https://www.google.com/maps?q=A%20Ro%C3%A0ng%20A%20L%C6%B0%E1%BB%9Bi&output=embed",
    priceLabel: "Tour trekking từ 450.000đ/người",
    commissionRate: 12,
    rating: 4.9,
    reviewCount: 96,
    openingHours: "Đón khách theo lịch đặt trước (07:00 - 16:30)",
    voucherOffer: "Giảm 10% phí tour cho nhóm từ 4 khách",
    zaloUrl: "https://zalo.me/0977000118",
    phone: "0977 000 118",
    image: imageFor("photo-1441974231531-c6227db76b6e"),
    gallery: [
      imageFor("photo-1441974231531-c6227db76b6e"),
      imageFor("photo-1511497584788-876760111969"),
      imageFor("photo-1500534314209-a25ddb2bd429")
    ],
    services: ["Hướng dẫn viên kiểm lâm & người bản địa", "Bữa ăn đi rừng đóng gói lá chuối", "Gậy trekking & túi cứu thương", "Ngâm suối khoáng nóng"],
    highlights: ["Hệ sinh thái rừng Trường Sơn nguyên vẹn", "Suối nước khoáng ấm tự nhiên", "Được học kỹ năng sinh tồn trong rừng"],
    activities: ["Đi bộ việt dã dưới tán cây cổ thụ", "Quan sát chim rừng và thực vật nhiệt đới", "Tắm ngâm suối nước khoáng phục hồi sức khoẻ", "Uống nước chè vằng tươi nấu tại chỗ"],
    suitableFor: ["Du khách đam mê thể thao", "Người thích trekking khám phá", "Chuyên gia sinh thái học", "Đoàn sinh viên thực tế"],
    safetyNotes: ["Bắt buộc phải có hướng dẫn viên địa phương dẫn đường", "Mang giày leo núi bám dính tốt", "Mặc quần áo dài tay phòng chống vắt và côn trùng"],
    status: "active"
  },
  {
    slug: "lang-du-lich-cong-dong-a-nor",
    name: "Làng du lịch cộng đồng A Nôr",
    category: "community-tourism",
    businessName: "Hợp tác xã Làng Văn hóa A Nôr",
    businessId: "biz-a-nor",
    summary: "Trung tâm du lịch cộng đồng tiêu biểu của A Lưới, kết hợp giữa ăn ở tại nhà sàn, tham quan ngọn thác và hòa nhập nếp sống người Pa Cô.",
    description:
      "Được vinh danh là một trong những làng du lịch cộng đồng kiểu mẫu của tỉnh Thừa Thiên Huế, Làng A Nôr mang đến cho khách trải nghiệm sống chân thực nhất: ngủ nhà sàn truyền thống, cùng người dân vào rừng hái rau, gói bánh A Quát, giã cối chày đôi và ngồi quây quần nghe già làng kể chuyện nguồn cội bên ánh lửa bập bùng.",
    address: "Thôn A Nôr, xã Hồng Kim, huyện A Lưới, Thừa Thiên Huế",
    mapEmbedUrl: "https://www.google.com/maps?q=L%C3%A0ng%20du%20l%E1%BB%8Bch%20c%E1%BB%99ng%20%C4%91%E1%BB%93ng%20A%20N%C3%B4r&output=embed",
    priceLabel: "Gói trọn gói từ 380.000đ/người",
    commissionRate: 12,
    rating: 4.9,
    reviewCount: 312,
    openingHours: "Mở cửa đón khách 24/7 (vui lòng đặt trước)",
    voucherOffer: "Giảm 10% gói trải nghiệm trọn gói văn hóa + ăn ở",
    zaloUrl: "https://zalo.me/0905000118",
    phone: "0905 000 118",
    image: imageFor("photo-1511497584788-876760111969"),
    gallery: [
      imageFor("photo-1511497584788-876760111969"),
      imageFor("photo-1506744038136-46273834b3fb"),
      imageFor("photo-1520250497591-112f2f40a3f4")
    ],
    services: ["Lưu trú nhà sàn tập thể & phòng riêng", "Phục vụ ẩm thực truyền thống", "Workshop nghề thủ công", "Đón tiếp văn nghệ", "Đạp xe ngắm bản"],
    highlights: ["Mô hình du lịch bền vững vì cộng đồng", "Môi trường trong lành, sạch sẽ", "Bà con thân thiện hiếu khách", "Đa dạng hoạt động cho mọi lứa tuổi"],
    activities: ["Học gói bánh A Quát ba sừng", "Tham gia giã gạo bằng cối chân", "Tối đốt lửa trại giao lưu cồng chiêng", "Thưởng thức rượu đoác lên men tự nhiên"],
    suitableFor: ["Đoàn trường học", "Khách du lịch quốc tế", "Gia đình đa thế hệ", "Đoàn hội thảo dã ngoại"],
    safetyNotes: ["Tôn trọng phong tục tập quán của bản làng", "Không tự ý sờ vào các vật phẩm linh thiêng trong nhà Gươl khi chưa hỏi già làng"],
    status: "active"
  },
  {
    slug: "lua-trai-van-nghe-a-nor",
    name: "Lửa trại và văn nghệ địa phương",
    category: "campfire",
    businessName: "Đội Văn nghệ Nghệ nhân Dân gian A Lưới",
    businessId: "biz-a-nor",
    summary: "Đêm hội cồng chiêng rộn rã, vũ điệu Ra Zooc huyền ảo, tiếng khèn bè và hương vị rượu cần bên ngọn lửa bập bùng giữa cao nguyên.",
    description:
      "Khi màn đêm buông xuống trên thung lũng A Lưới, ngọn lửa hồng được thắp lên cũng là lúc tiếng cồng chiêng ngân vang xé tan màn sương mù. Nghệ nhân và thanh niên Pa Cô, Tà Ôi trong trang phục Zèng lộng lẫy sẽ dắt tay du khách cùng hòa nhịp bước nhảy sạp, lắng nghe những điệu hát Tà Oải cổ xưa và nhâm nhi ngụm rượu cần ngọt thơm men lá rừng.",
    address: "Sân sinh hoạt cộng đồng A Nôr, xã Hồng Kim, A Lưới, Thừa Thiên Huế",
    mapEmbedUrl: "https://www.google.com/maps?q=A%20N%C3%B4r%20A%20L%C6%B0%E1%BB%9Bi&output=embed",
    priceLabel: "Từ 1.500.000đ/chương trình đoàn",
    commissionRate: 10,
    rating: 4.8,
    reviewCount: 142,
    openingHours: "18:30 - 21:30 hằng đêm (theo yêu cầu đoàn)",
    voucherOffer: "Tặng 1 bình rượu cần lớn cho đoàn từ 10 khách",
    zaloUrl: "https://zalo.me/0905000118",
    phone: "0905 000 118",
    image: imageFor("photo-1470225620780-dba8ba36b745"),
    gallery: [
      imageFor("photo-1470225620780-dba8ba36b745"),
      imageFor("photo-1514525253161-7a46d19cd819"),
      imageFor("photo-1500534314209-a25ddb2bd429")
    ],
    services: ["Đốt củi lửa trại lớn", "Biểu diễn cồng chiêng & đàn Ta Lư", "Bình rượu cần đặc biệt", "MC bản địa kết nối trò chơi dân gian", "Khoai ngô nướng than"],
    highlights: ["Không khí giao lưu gắn kết ấm cúng", "Được tận mắt xem biểu diễn nhạc cụ cổ truyền", "Trải nghiệm đặc sắc nhất về đêm ở vùng cao"],
    activities: ["Nắm tay nhảy múa quanh lửa trại", "Học thổi khèn bè và gõ chiêng", "Uống rượu cần bằng cần trúc", "Kể chuyện huyền thoại núi Trường Sơn"],
    suitableFor: ["Đoàn công ty teambuilding", "Nhóm bạn học sinh - sinh viên", "Đoàn khách gia đình đông thành viên"],
    safetyNotes: ["Giữ khoảng cách an toàn với đống lửa", "Trẻ em cần có phụ huynh đi kèm", "Không vứt tàn lửa ra khu vực cỏ khô"],
    status: "active"
  },
  {
    slug: "homestay-ven-suoi-a-nor",
    name: "Homestay ven suối A Nôr",
    category: "stay",
    businessName: "Hộ kinh doanh Homestay Ven Suối A Nôr",
    businessId: "biz-homestay-anor",
    summary: "Homestay nhà sàn gỗ mát mẻ nằm ngay sát triền suối reo, không gian yên bình cho giấc ngủ thư thái giữa đại ngàn.",
    description:
      "Homestay Ven Suối A Nôr được dựng theo lối kiến trúc nhà sàn truyền thống của người Pa Cô nhưng được trang bị đệm êm, màn chống muỗi, vệ sinh khép kín sạch sẽ. Buổi sáng thức dậy trong tiếng suối chảy róc rách và tiếng chim hót véo von, du khách sẽ được thưởng thức tách trà núi thơm lừng và bữa sáng xôi nếp dẻo quánh.",
    address: "Thôn A Nôr, xã Hồng Kim, huyện A Lưới, Thừa Thiên Huế",
    mapEmbedUrl: "https://www.google.com/maps?q=A%20N%C3%B4r%20A%20L%C6%B0%E1%BB%9Bi&output=embed",
    priceLabel: "Từ 620.000đ/đêm (phòng 2-4 khách)",
    commissionRate: 10,
    rating: 4.9,
    reviewCount: 220,
    openingHours: "Nhận phòng 14:00 - Trả phòng 12:00",
    voucherOffer: "Giảm 10% tiền phòng khi đặt qua Chạm A Lưới",
    zaloUrl: "https://zalo.me/0905000118",
    phone: "0905 000 118",
    image: imageFor("photo-1505693416388-ac5ce068fe85"),
    gallery: [
      imageFor("photo-1505693416388-ac5ce068fe85"),
      imageFor("photo-1520250497591-112f2f40a3f4"),
      imageFor("photo-1506744038136-46273834b3fb")
    ],
    services: ["Phòng ngủ tiện nghi thoáng mát", "Ăn sáng bản địa miễn phí", "Cho thuê xe máy khám phá đèo dốc", "Phục vụ cơm gia đình", "Wifi tốc độ cao"],
    highlights: ["Sát bờ suối không khí cực kỳ trong lành", "Chủ nhà nồng hậu chu đáo", "Vị trí gần thác A Nôr chỉ 5 phút đi bộ"],
    activities: ["Tản bộ ngắm vườn cây ven suối", "Thưởng thức cơm tối nhà sàn", "Nghe chủ nhà tâm tình văn hóa Pa Cô", "Thư giãn đọc sách ngắm mây núi"],
    suitableFor: ["Cặp đôi nghỉ dưỡng", "Gia đình nhỏ", "Du khách đi du lịch chậm (slow travel)"],
    safetyNotes: ["Khóa then cửa cẩn thận khi rời phòng", "Tránh đi sát mép suối vào ban đêm khi thiếu ánh sáng"],
    status: "active"
  },
  {
    slug: "quan-com-pa-co",
    name: "Quán cơm bản Pa Cô & Ẩm thực địa phương",
    category: "food",
    businessName: "Nhà hàng Ẩm thực Bản Mường Pa Cô",
    businessId: "biz-quan-paco",
    summary: "Bữa cơm mộc mạc đậm chất vùng cao với cơm lam ống tre, gà nướng hạt sẻn, cá suối nướng muối ớt và rau dớn xào tỏi.",
    description:
      "Tọa lạc ngay trung tâm thị trấn A Lưới, Quán cơm Pa Cô là điểm dừng chân ẩm thực không thể bỏ lỡ. Các nguyên liệu đều được thu gom tươi mới mỗi ngày từ đồng bào: cá bắt dưới suối A Nôr, gà thả trên đồi nương, măng non trên rừng già và đọt rau dớn xanh non. Không gian mộc mạc ấm cúng mang lại cảm giác thân quen như bữa cơm gia đình.",
    address: "Đường Hồ Chí Minh, thị trấn A Lưới, Thừa Thiên Huế",
    mapEmbedUrl: "https://www.google.com/maps?q=A%20L%C6%B0%E1%BB%9Bi%20Hu%E1%BA%BF&output=embed",
    priceLabel: "Mâm cơm từ 120.000đ - 250.000đ/người",
    commissionRate: 8,
    rating: 4.8,
    reviewCount: 165,
    openingHours: "09:00 - 21:00 hằng ngày",
    voucherOffer: "Tặng ấm trà thảo mộc núi & đĩa hoa quả tráng miệng",
    zaloUrl: "https://zalo.me/0912345678",
    phone: "0912 345 678",
    image: imageFor("photo-1504674900247-0877df9cc836"),
    gallery: [
      imageFor("photo-1504674900247-0877df9cc836"),
      imageFor("photo-1544025162-d76694265947"),
      imageFor("photo-1543353071-873f17a7a088")
    ],
    services: ["Đặt tiệc cơm đoàn", "Gà đồi nướng than hoa", "Cơm lam ống nứa", "Rau rừng theo mùa", "Đóng gói mang về"],
    highlights: ["Hương vị nướng hạt tiêu rừng đặc sắc", "Nguyên liệu hữu cơ hái lượm tự nhiên", "Phục vụ nhanh nhẹn chu đáo"],
    activities: ["Trải nghiệm bóc cơm lam nóng hổi", "Thử thách ăn ớt rừng xiêm cay nồng", "Tìm hiểu bí quyết ướp thịt nướng bằng lá rừng"],
    suitableFor: ["Đoàn khách du lịch", "Gia đình dùng bữa", "Phượt thủ nạp năng lượng sau chặng đèo"],
    safetyNotes: ["Thông báo trước nếu quý khách có tiền sử dị ứng măng rừng hoặc đồ cay nóng"],
    status: "active"
  },
  {
    slug: "workshop-det-zeng-ta-oi",
    name: "Trải nghiệm dệt Zèng Tà Ôi",
    category: "culture",
    businessName: "Hợp tác xã Nghề Dệt Zèng Truyền thống A Đớt",
    businessId: "biz-det-zeng",
    summary: "Chiêm ngưỡng và tự tay luồn từng sợi chỉ, đính từng hạt cườm chì vào tấm vải Zèng - Di sản Văn hóa Phi vật thể Quốc gia.",
    description:
      "Nghề dệt thổ cẩm Zèng của người Tà Ôi tại A Lưới đã được công nhận là Di sản văn hóa phi vật thể cấp quốc gia. Tại workshop này, du khách sẽ được các nghệ nhân lớn tuổi hướng dẫn từng bước dệt bằng khung dệt gắn vào thắt lưng, học cách đính cườm tạo nên các hoa văn hình học tượng trưng cho núi non, muông thú và tấm lòng son sắt của người miền biên ải.",
    address: "Làng nghề dệt Zèng, xã A Đớt (nay là Lâm Đớt), A Lưới, Huế",
    mapEmbedUrl: "https://www.google.com/maps?q=T%C3%A0%20%C3%94i%20A%20L%C6%B0%E1%BB%9Bi&output=embed",
    priceLabel: "Vé trải nghiệm từ 180.000đ/người",
    commissionRate: 12,
    rating: 4.9,
    reviewCount: 178,
    openingHours: "08:00 - 17:00 (vui lòng liên hệ trước)",
    voucherOffer: "Giảm 10% khi mua các sản phẩm khăn, túi Zèng tại xưởng",
    zaloUrl: "https://zalo.me/0933000118",
    phone: "0933 000 118",
    image: "/images/products/zeng-brocade.png",
    gallery: [
      "/images/products/zeng-brocade.png",
      imageFor("photo-1452860606245-08befc0ff44b"),
      imageFor("photo-1513519245088-0e12902e5a38")
    ],
    services: ["Tham quan không gian dệt Zèng", "Thực hành dệt trực tiếp cùng nghệ nhân", "Mặc trang phục truyền thống chụp ảnh", "Cửa hàng lưu niệm thổ cẩm"],
    highlights: ["Gặp gỡ những nghệ nhân ưu tú lưu giữ di sản", "Tự tay làm nên món quà kỷ niệm độc nhất", "Ủng hộ sinh kế cho phụ nữ dân tộc thiểu số"],
    activities: ["Học thao tác luồn thoi dệt khung cạp", "Đính hạt cườm chì tạo hoa văn mặt trời", "Mặc áo Zèng chụp ảnh lưu niệm", "Mua sắm khăn quàng, túi xách thổ cẩm"],
    suitableFor: ["Du khách yêu văn hóa nghệ thuật", "Đoàn học sinh - sinh viên tìm hiểu di sản", "Khách quốc tế thích thủ công mỹ nghệ"],
    safetyNotes: ["Cẩn thận không làm thất lạc hạt cườm chì nhỏ", "Giữ gìn khung dệt truyền thống theo hướng dẫn"],
    status: "active"
  },
  {
    slug: "cau-treo-pi-lung",
    name: "Cầu treo Pi Lung & Điểm check-in đèo Pê Ke",
    category: "visit",
    businessName: "Tổ Hướng dẫn Điểm Check-in Khám phá Pi Lung",
    businessId: "biz-pilung",
    summary: "Cây cầu treo duyên dáng nối nhịp đôi bờ sông giữa núi rừng hoang sơ, điểm săn mây ngắm hoàng hôn ngoạn mục.",
    description:
      "Cầu treo Pi Lung nằm vắt vẻo qua dòng suối mát rượi tại xã A Roàng, bao bọc bởi những cánh rừng tre nứa và dãy Trường Sơn mờ sương. Cầu đung đưa nhẹ theo từng nhịp chân, mang lại cảm giác thích thú cho những ai yêu thích phiêu lưu và chụp ảnh check-in phong cảnh thiên nhiên hùng vĩ của dải biên cương.",
    address: "Khu vực Pi Lung, xã A Roàng, huyện A Lưới, Thừa Thiên Huế",
    mapEmbedUrl: "https://www.google.com/maps?q=Pi%20Lung%20A%20Ro%C3%A0ng%20A%20L%C6%B0%E1%BB%9Bi&output=embed",
    priceLabel: "Dịch vụ ghép tuyến từ 120.000đ/người",
    commissionRate: 8,
    rating: 4.7,
    reviewCount: 88,
    openingHours: "06:00 - 18:00 (đẹp nhất lúc ban mai và hoàng hôn)",
    voucherOffer: "Tặng gói hỗ trợ chụp ảnh flycam/máy cơ cho đoàn từ 6 người",
    zaloUrl: "https://zalo.me/0977000118",
    phone: "0977 000 118",
    image: imageFor("photo-1500530855697-b586d89ba3ee"),
    gallery: [
      imageFor("photo-1500530855697-b586d89ba3ee"),
      imageFor("photo-1501785888041-af3ef285b470"),
      imageFor("photo-1482192505345-5655af888cc4")
    ],
    services: ["Hướng dẫn viên tuyến ảnh", "Cho thuê trang phục dân tộc chụp hình", "Nước uống giải khát tại chỗ", "Ghép tour rừng nguyên sinh"],
    highlights: ["Cảnh sắc cầu treo bắc qua thung lũng thơ mộng", "Góc máy chụp phong cảnh tuyệt đẹp", "Dễ kết hợp cùng suối A Lin và rừng A Roàng"],
    activities: ["Đi dạo săn mây sáng sớm trên cầu", "Chụp bộ ảnh phong cách du mục miền cao", "Ngắm hoàng hôn nhuộm đỏ đại ngàn"],
    suitableFor: ["Các bạn trẻ mê chụp ảnh", "Cặp đôi chụp ảnh cưới phong cảnh", "Phượt thủ trên cung đường Hồ Chí Minh"],
    safetyNotes: ["Không rung lắc mạnh cầu khi có nhiều người đang di chuyển", "Không trèo lên thành lan can cầu"],
    status: "active"
  },
  {
    slug: "xe-dua-don-hue-a-luoi",
    name: "Dịch vụ xe đưa đón 2 chiều Huế - A Lưới",
    category: "service",
    businessName: "Công ty Vận tải & Du lịch A Lưới Transfer",
    businessId: "biz-transfer",
    summary: "Đội xe 7 chỗ - 16 chỗ tiện nghi, tài xế bản địa vững vàng tay lái vượt đèo dốc an toàn, đón trả tận nơi tại Huế.",
    description:
      "Cung đường từ TP. Huế lên A Lưới dài khoảng 70km qua đèo Tà Lương với nhiều khúc cua uốn lượn tuyệt đẹp nhưng đòi hỏi tài xế dày dạn kinh nghiệm. A Lưới Transfer cung cấp dịch vụ xe riêng và xe ghép đón trả tận cửa khách sạn tại Huế, đưa khách đến thẳng homestay hoặc các điểm du lịch tại A Lưới với sự an tâm tối đa.",
    address: "Bến xe trung tâm TP. Huế & Thị trấn A Lưới",
    mapEmbedUrl: "https://www.google.com/maps?q=Hu%E1%BA%BF%20A%20L%C6%B0%E1%BB%9Bi&output=embed",
    priceLabel: "Xe riêng từ 850.000đ/chuyến, vé ghép 120.000đ/ghế",
    commissionRate: 8,
    rating: 4.8,
    reviewCount: 156,
    openingHours: "06:00 - 20:00 hằng ngày",
    voucherOffer: "Giảm 50.000đ cho chuyến khứ hồi đầu tiên đặt qua web",
    zaloUrl: "https://zalo.me/0944000118",
    phone: "0944 000 118",
    image: imageFor("photo-1544620347-c4fd4a3d5957"),
    gallery: [
      imageFor("photo-1544620347-c4fd4a3d5957"),
      imageFor("photo-1500530855697-b586d89ba3ee"),
      imageFor("photo-1488646953014-85cb44e25828")
    ],
    services: ["Xe 7 chỗ Xpander, Innova đời mới", "Xe 16 chỗ Ford Transit du lịch", "Đón trả sân bay Phú Bài", "Nhận chở hàng đặc sản gửi về xuôi"],
    highlights: ["Tài xế dân địa phương vui tính, am hiểu tuyến điểm", "Xe sạch sẽ máy lạnh mát mẻ", "Đúng giờ hẹn, không bắt khách dọc đường"],
    activities: ["Nghỉ chân ngắm toàn cảnh đèo Tà Lương", "Được tài xế tư vấn các điểm ăn ngon rẻ tại A Lưới"],
    suitableFor: ["Du khách không tự lái xe máy đường đèo", "Gia đình có người lớn tuổi và trẻ nhỏ", "Đoàn công tác và du lịch nhóm"],
    safetyNotes: ["Hành khách luôn thắt dây an toàn trong suốt hành trình vượt đèo"],
    status: "active"
  },
  {
    slug: "mat-ong-rung-a-luoi",
    name: "Mật ong rừng A Lưới nguyên chất",
    category: "specialty",
    businessName: "Hợp tác xã Nông Sản Rừng Sạch A Lưới",
    businessId: "biz-nongsan",
    summary: "Mật ong khoái khai thác tự nhiên từ các vách đá và ngọn cây cao trong rừng già Trường Sơn, vị ngọt thanh sánh đặc.",
    description:
      "Mật ong rừng già A Lưới được bà con người Pa Cô lặn lội tìm kiếm vào độ tháng 3 đến tháng 6 âm lịch - thời điểm hoa rừng nở rộ ngát hương. Mật có màu vàng óng ánh ngả cánh gián, đặc sánh, vị ngọt dịu thanh tao không gắt cổ và chứa dồi dào khoáng chất bồi bổ sức khỏe.",
    address: "Chợ trung tâm A Lưới, thị trấn A Lưới, Thừa Thiên Huế",
    mapEmbedUrl: "https://www.google.com/maps?q=Ch%E1%BB%A3%20A%20L%C6%B0%E1%BB%9Bi&output=embed",
    priceLabel: "240.000đ/chai 500ml - 450.000đ/lít",
    commissionRate: 10,
    rating: 4.9,
    reviewCount: 189,
    openingHours: "07:30 - 20:00 hằng ngày (có giao hàng tận nơi)",
    voucherOffer: "Giảm 10% khi mua từ 2 chai mật ong trở lên",
    zaloUrl: "https://zalo.me/0955000118",
    phone: "0955 000 118",
    image: "/images/products/forest-honey.png",
    gallery: [
      "/images/products/forest-honey.png",
      imageFor("photo-1471943311424-646960669fbc"),
      imageFor("photo-1587049352851-8d4e89133924")
    ],
    services: ["Thử mật trực tiếp trước khi mua", "Đóng chai thủy tinh đóng seal vệ sinh", "Hộp quà biếu sang trọng", "Ship hàng COD toàn quốc"],
    highlights: ["Cam kết 100% mật rừng tự nhiên nói không với mật nuôi đường", "Có tem truy xuất nguồn gốc hợp tác xã", "Món quà quý giá cho sức khỏe"],
    activities: ["Thử mật bằng cọng hành tươi hoặc giọt nước", "Nghe câu chuyện nghề săn mật mạo hiểm của người đi rừng"],
    suitableFor: ["Mua làm quà biếu ông bà, cha mẹ", "Người chăm sóc sức khỏe, thanh lọc cơ thể"],
    safetyNotes: ["Bảo quản nơi khô ráo thoáng mát, không để trong tủ lạnh làm kết tinh đường tự nhiên"],
    status: "active"
  },
  {
    slug: "tra-nui-thao-moc-a-luoi",
    name: "Trà núi thảo mộc A Lưới (Trà dây & Sâm cau)",
    category: "specialty",
    businessName: "Tổ Sản xuất Dược liệu Vùng cao A Lưới",
    businessId: "biz-tra-nui",
    summary: "Thức uống thảo dược quý hái từ đỉnh núi cao gồm trà dây rừng thanh nhiệt dạ dày và sâm cau bồi bổ sinh lực.",
    description:
      "Vùng núi cao A Lưới quanh năm sương phủ là cái nôi của nhiều cây thuốc nam quý. Sản phẩm trà núi thảo mộc được chế biến thủ công từ búp trà dây rừng hoang dã kết hợp cùng sâm cau đỏ, chè vằng và cỏ ngọt. Nước trà có vị đắng nhẹ ban đầu rồi ngọt hậu lắng sâu, giúp an thần, ngủ ngon và hỗ trợ tiêu hóa tuyệt vời.",
    address: "Xã A Ngo, huyện A Lưới, Thừa Thiên Huế",
    mapEmbedUrl: "https://www.google.com/maps?q=A%20Ngo%20A%20L%C6%B0%E1%BB%9Bi&output=embed",
    priceLabel: "140.000đ/gói 300g",
    commissionRate: 10,
    rating: 4.8,
    reviewCount: 112,
    openingHours: "08:00 - 19:00 hằng ngày",
    voucherOffer: "Mua 3 gói trà tặng ngay 1 gói trà thảo mộc túi lọc mini",
    zaloUrl: "https://zalo.me/0935000118",
    phone: "0935 000 118",
    image: "/images/products/mountain-tea.png",
    gallery: [
      "/images/products/mountain-tea.png",
      imageFor("photo-1544787219-7f47ccb76574"),
      imageFor("photo-1576092768241-dec231879fc3")
    ],
    services: ["Pha trà tiếp khách dùng thử miễn phí", "Đóng gói hút chân không bảo quản lâu dài", "Tư vấn công dụng thảo dược"],
    highlights: ["Nguyên liệu thảo mộc thu hái tự nhiên sạch 100%", "Giúp ngủ sâu giấc và giảm ợ chua dạ dày", "Giá cả mộc mạc đúng giá bản địa"],
    activities: ["Thưởng trà ấm giữa tiết trời se lạnh", "Học cách hãm trà dây giữ trọn hương vị núi rừng"],
    suitableFor: ["Người lớn tuổi khó ngủ", "Nhân viên văn phòng thường xuyên căng thẳng", "Làm quà tặng thanh nhã"],
    safetyNotes: ["Không uống trà quá đặc khi bụng đang đói cồn cào"],
    status: "active"
  },
  {
    slug: "dac-san-thit-bo-ruou-can-a-luoi",
    name: "Đặc sản thịt bò gác bếp & Rượu cần A Lưới",
    category: "specialty",
    businessName: "Cơ sở Sản xuất Đặc sản Cội Nguồn A Lưới",
    businessId: "biz-thit-bo",
    summary: "Thịt bò vàng thảo nguyên gác bếp than củi đượm khói thơm lừng cùng ghè rượu cần ủ men lá cổ truyền đậm đà men say.",
    description:
      "Thịt bò gác bếp A Lưới được làm từ bắp thịt của giống bò cỏ chăn thả tự nhiên trên sườn đồi. Thịt được tẩm ướp tiêu rừng, gừng núi, ớt hiểm rồi treo trên giàn bếp lửa đun củi suốt nhiều tuần lễ. Khi ăn, xé từng thớ thịt đỏ hồng chấm cùng muối kiến vàng hoặc chẩm chéo, nhấp thêm ngụm rượu cần men lá nồng nàn, cảm nhận trọn vẹn hồn cốt của núi rừng miền Tây xứ Huế.",
    address: "Thị trấn A Lưới, huyện A Lưới, Thừa Thiên Huế",
    mapEmbedUrl: "https://www.google.com/maps?q=Th%E1%BB%8B%20tr%E1%BA%A5n%20A%20L%C6%B0%E1%BB%9Bi&output=embed",
    priceLabel: "Thịt bò gác bếp từ 420.000đ/500g, Rượu cần từ 220.000đ/ghè",
    commissionRate: 10,
    rating: 4.9,
    reviewCount: 205,
    openingHours: "07:30 - 21:00 hằng ngày",
    voucherOffer: "Giảm 10% cho đơn combo từ 1kg thịt bò + 1 ghè rượu cần",
    zaloUrl: "https://zalo.me/0988000118",
    phone: "0988 000 118",
    image: imageFor("photo-1544025162-d76694265947"),
    gallery: [
      imageFor("photo-1544025162-d76694265947"),
      imageFor("photo-1504674900247-0877df9cc836"),
      imageFor("photo-1470225620780-dba8ba36b745")
    ],
    services: ["Đóng gói hút chân không tiêu chuẩn", "Cung cấp cần trúc uống rượu cần", "Giao hàng nhanh toàn quốc"],
    highlights: ["Hương vị hun khói củi rừng tự nhiên độc đáo", "Thịt bò mềm dai ngọt bùi càng nhai càng thơm", "Rượu cần men lá ủ truyền thống không đau đầu"],
    activities: ["Thử thịt bò nướng qua than hồng tại quán", "Học cách châm nước suối vào ghè rượu cần đúng phong tục"],
    suitableFor: ["Tiệc sum họp gia đình, bạn bè", "Làm quà biếu đặc sản cao cấp ngày lễ tết"],
    safetyNotes: ["Bảo quản ngăn đông tủ lạnh để giữ độ mềm và hương vị thịt ngon nhất"],
    status: "active"
  }
];
