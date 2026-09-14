import {
  BadgeCheck,
  Camera,
  Flame,
  Leaf,
  Map,
  Mountain,
  Music,
  ShieldCheck,
  Soup,
  TentTree,
  Utensils,
  Waves
} from "lucide-react";

export const navItems = [
  { href: "/", label: "Trang chủ" },
  { href: "/places", label: "Địa điểm" },
  { href: "/blog", label: "Blog" },
  { href: "/products", label: "Sản phẩm" },
  { href: "/book-tour", label: "Đặt tour" },
  { href: "/about", label: "Giới thiệu" }
];

export const imageFor = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=82`;

/**
 * CẤU HÌNH THƯƠNG HIỆU & HÌNH ẢNH TOÀN TRANG (Dễ dàng thay đổi link)
 * Bạn có thể dán trực tiếp:
 * - Link Google Drive (dạng chia sẻ 'Bất kỳ ai có liên kết đều xem được')
 * - Link ảnh cục bộ (ví dụ: '/images/logo.svg', '/images/home-hero-local.jpg')
 * - Link Unsplash, Imgur hoặc bất kỳ link ảnh trực tiếp nào (https://...)
 */
export const siteConfig = {
  name: "Chạm A Lưới",
  tagline: "Nền tảng du lịch cộng đồng trung gian kết nối du khách với A Lưới",
  logo: "/images/logo.svg",           // Logo bản sáng cho Navbar & nền trắng
  logoDark: "/images/logo-white.svg", // Logo bản tối cho Footer & nền đen
  heroImage: "/images/home-hero-local.jpg", // Ảnh banner trang chủ (mặc định ảnh phong cảnh A Lưới thực tế)
  heroFallback: imageFor("photo-1500530855697-b586d89ba3ee"),
  aboutHeroImage: imageFor("photo-1482192505345-5655af888cc4"),
};

export const heroImage = siteConfig.heroImage;

export const packages = [
  {
    id: "short-experience",
    name: "Trải nghiệm ngắn ngày",
    code: "Gói A",
    duration: "1-2 ngày",
    description: "Phù hợp với du khách có ít thời gian.",
    longDescription:
      "Hành trình tinh gọn để chạm vào A Lưới qua thác nước, làng nghề, ẩm thực địa phương và một đêm homestay yên bình.",
    suitableFor: ["Gia đình", "Cặp đôi", "Sinh viên", "Nhóm bạn"],
    difficulty: "Dễ",
    priceFrom: 1850000,
    image: imageFor("photo-1506744038136-46273834b3fb"),
    experiences: [
      "Thác A Nôr",
      "Trekking núi rừng",
      "Dệt Zèng truyền thống",
      "Văn hóa Pa Cô",
      "Bản làng Tà Ôi",
      "Đêm lửa trại",
      "Ẩm thực địa phương",
      "Du lịch cộng đồng"
    ],
    timeline: [
      {
        day: "Ngày 1",
        items: [
          "Đón khách tại Huế",
          "Tham quan thác A Nôr",
          "Dùng bữa trưa truyền thống",
          "Ghé làng dệt Zèng",
          "Lửa trại và âm nhạc địa phương",
          "Nghỉ đêm tại homestay cộng đồng"
        ]
      },
      {
        day: "Ngày 2",
        items: [
          "Trekking buổi sáng",
          "Thăm chợ địa phương",
          "Mua sản phẩm bản địa",
          "Trở về Huế"
        ]
      }
    ]
  },
  {
    id: "deep-experience",
    name: "Trải nghiệm chuyên sâu",
    code: "Gói B",
    duration: "3-4 ngày",
    description: "Lý tưởng cho du khách muốn hòa mình sâu vào văn hóa bản địa.",
    longDescription:
      "Hành trình chậm và sâu hơn qua bản làng miền núi, đường rừng, đêm cắm trại, lớp nấu ăn truyền thống và giao lưu văn hóa.",
    suitableFor: ["Gia đình", "Cặp đôi", "Sinh viên", "Nhóm bạn"],
    difficulty: "Vừa phải",
    priceFrom: 4200000,
    image: imageFor("photo-1511497584788-876760111969"),
    experiences: [
      "Cắm trại",
      "Trải nghiệm bản làng",
      "Đi bộ rừng",
      "Nấu ăn truyền thống",
      "Giao lưu văn hóa",
      "Điểm chụp ảnh",
      "Thác nước",
      "Điểm ngắm núi",
      "Ruộng bậc thang",
      "Điểm ngắm bình minh",
      "Khám phá rừng",
      "Du lịch cộng đồng"
    ],
    timeline: [
      {
        day: "Ngày 1",
        items: [
          "Đón khách tại Huế",
          "Di chuyển qua cung đường núi",
          "Nghi thức chào đón tại bản",
          "Lớp nấu ăn truyền thống",
          "Bữa tối tại homestay"
        ]
      },
      {
        day: "Ngày 2",
        items: [
          "Đi bộ rừng cùng hướng dẫn viên địa phương",
          "Dã ngoại bên thác",
          "Khám phá điểm chụp ảnh",
          "Lửa trại giao lưu văn hóa"
        ]
      },
      {
        day: "Ngày 3",
        items: [
          "Bữa sáng tại điểm cắm trại",
          "Trekking đến điểm ngắm núi",
          "Workshop dệt Zèng",
          "Trải nghiệm bản làng Tà Ôi"
        ]
      },
      {
        day: "Ngày 4",
        items: [
          "Ngắm bình minh",
          "Chợ sản phẩm địa phương",
          "Bữa trưa chia tay",
          "Trở về Huế"
        ]
      }
    ]
  }
];

export const includes = [
  "Phương tiện di chuyển",
  "Hướng dẫn viên chuyên nghiệp",
  "Các bữa ăn",
  "Lưu trú",
  "Bảo hiểm",
  "Vé tham quan",
  "Hoạt động cộng đồng"
];

export const experienceIcons = {
  "Thác A Nôr": Waves,
  "Trekking núi rừng": Mountain,
  "Dệt Zèng truyền thống": BadgeCheck,
  "Văn hóa Pa Cô": Leaf,
  "Bản làng Tà Ôi": Map,
  "Đêm lửa trại": Flame,
  "Âm nhạc truyền thống": Music,
  "Ẩm thực địa phương": Soup,
  "Ruộng bậc thang": Leaf,
  "Điểm ngắm bình minh": Camera,
  "Khám phá rừng": TentTree,
  "Du lịch cộng đồng": ShieldCheck,
  "Cắm trại": TentTree,
  "Trải nghiệm bản làng": Map,
  "Đi bộ rừng": Mountain,
  "Nấu ăn truyền thống": Utensils,
  "Giao lưu văn hóa": Music,
  "Điểm chụp ảnh": Camera,
  "Thác nước": Waves,
  "Điểm ngắm núi": Mountain
};

export const providers = [
  {
    id: "green-valley-travel",
    name: "Green Valley Travel",
    logo: imageFor("photo-1542909168-82c3e7fdca5c"),
    cover: imageFor("photo-1470770841072-f978cf4d019e"),
    description:
      "Đơn vị du lịch cộng đồng tại Huế, làm việc trực tiếp với các chủ nhà Pa Cô và Tà Ôi.",
    years: 9,
    rating: 4.9,
    reviews: 186,
    responseTime: "Trong 1 giờ",
    services: ["Di chuyển", "Hướng dẫn viên", "Bảo hiểm", "Bữa ăn"],
    tours: ["short-experience", "deep-experience"],
    homestays: ["anor-riverside", "ta-oi-mountain-lodge"]
  },
  {
    id: "aluoi-local-journeys",
    name: "A Lưới Local Journeys",
    logo: imageFor("photo-1529333166437-7750a6dd5a70"),
    cover: imageFor("photo-1441974231531-c6227db76b6e"),
    description:
      "Đội ngũ địa phương chuyên về du lịch chậm, diễn giải rừng và kể chuyện bản làng.",
    years: 6,
    rating: 4.8,
    reviews: 124,
    responseTime: "Trong 2 giờ",
    services: ["Di chuyển", "Hướng dẫn viên", "Bảo hiểm", "Bữa ăn"],
    tours: ["short-experience", "deep-experience"],
    homestays: ["pa-co-heritage-home", "cloud-hill-retreat"]
  }
];

export const homestays = [
  {
    id: "anor-riverside",
    providerId: "green-valley-travel",
    name: "Homestay ven suối A Nôr",
    village: "Bản A Nôr",
    image: imageFor("photo-1505693416388-ac5ce068fe85"),
    gallery: [imageFor("photo-1505693416388-ac5ce068fe85"), imageFor("photo-1520250497591-112f2f40a3f4")],
    mountainView: true,
    capacity: "12 khách",
    price: 620000,
    rating: 4.9,
    amenities: ["Bữa sáng", "WiFi", "Phòng tắm riêng", "Lửa trại", "Bữa tối truyền thống"]
  },
  {
    id: "ta-oi-mountain-lodge",
    providerId: "green-valley-travel",
    name: "Nhà nghỉ núi Tà Ôi",
    village: "Bản Tà Ôi",
    image: imageFor("photo-1510798831971-661eb04b3739"),
    gallery: [imageFor("photo-1510798831971-661eb04b3739"), imageFor("photo-1499696010180-025ef6e1a8f9")],
    mountainView: true,
    capacity: "10 khách",
    price: 780000,
    rating: 4.8,
    amenities: ["Bữa sáng", "Thuê xe đạp", "Phòng tắm riêng", "Lửa trại", "Bữa tối truyền thống"]
  },
  {
    id: "pa-co-heritage-home",
    providerId: "aluoi-local-journeys",
    name: "Nhà di sản Pa Cô",
    village: "Bản Pa Cô",
    image: imageFor("photo-1566073771259-6a8506099945"),
    gallery: [imageFor("photo-1566073771259-6a8506099945"), imageFor("photo-1518780664697-55e3ad937233")],
    mountainView: true,
    capacity: "14 khách",
    price: 690000,
    rating: 4.7,
    amenities: ["Bữa sáng", "WiFi", "Lửa trại", "Thuê xe đạp", "Bữa tối truyền thống"]
  },
  {
    id: "cloud-hill-retreat",
    providerId: "aluoi-local-journeys",
    name: "Cloud Hill Retreat",
    village: "Xã Hồng Vân",
    image: imageFor("photo-1500534314209-a25ddb2bd429"),
    gallery: [imageFor("photo-1500534314209-a25ddb2bd429"), imageFor("photo-1501785888041-af3ef285b470")],
    mountainView: true,
    capacity: "8 khách",
    price: 850000,
    rating: 4.9,
    amenities: ["Bữa sáng", "WiFi", "Phòng tắm riêng", "Thuê xe đạp", "Bữa tối truyền thống"]
  }
];

export const products = [
  {
    slug: "traditional-zeng-brocade",
    name: "Thổ cẩm Zèng truyền thống",
    category: "Zèng truyền thống",
    price: 450000,
    image: "/images/products/zeng-brocade.png",
    gallery: ["/images/products/zeng-brocade.png", imageFor("photo-1452860606245-08befc0ff44b")],
    description: "Thổ cẩm dệt tay bởi nghệ nhân Tà Ôi với hoa văn truyền thống.",
    specs: ["Sợi cotton pha", "Hoa văn bản địa", "Dệt thủ công", "Sản phẩm cộng đồng"]
  },
  {
    slug: "forest-honey",
    name: "Mật ong rừng A Lưới",
    category: "Mật ong rừng",
    price: 220000,
    image: "/images/products/forest-honey.png",
    gallery: ["/images/products/forest-honey.png", imageFor("photo-1471943311424-646960669fbc")],
    description: "Mật ong vàng được thu hoạch từ các cộng đồng ven rừng vùng cao A Lưới.",
    specs: ["Chai 500ml", "Mật ong thô", "Không phụ gia", "Thu hoạch theo mùa"]
  },
  {
    slug: "mountain-tea",
    name: "Trà thảo mộc miền núi",
    category: "Trà núi",
    price: 180000,
    image: "/images/products/mountain-tea.png",
    gallery: ["/images/products/mountain-tea.png", imageFor("photo-1544787219-7f47ccb76574")],
    description: "Trà núi thơm nhẹ phối cùng thảo mộc địa phương, hậu vị mộc mạc và thư thái.",
    specs: ["Gói 120g", "Phối thảo mộc", "Ít caffeine", "Chọn lọc thủ công"]
  },
  {
    slug: "bamboo-craft-basket",
    name: "Giỏ thủ công bằng tre",
    category: "Thủ công tre",
    price: 260000,
    image: "/images/products/bamboo-basket.png",
    gallery: ["/images/products/bamboo-basket.png", imageFor("photo-1513519245088-0e12902e5a38")],
    description: "Giỏ tre bền đẹp, phù hợp sử dụng trong gia đình, làm quà du lịch và trang trí.",
    specs: ["Tre tự nhiên", "Hoàn thiện thủ công", "Nhẹ", "Tái sử dụng"]
  }
];

export const blogPosts = [
  {
    slug: "first-time-guide-to-a-luoi",
    title: "Cẩm nang lần đầu du lịch A Lưới",
    category: "Cẩm nang",
    author: "Ban biên tập Chạm",
    date: "2026-04-18",
    readingTime: "6 phút đọc",
    image: imageFor("photo-1500534314209-a25ddb2bd429"),
    excerpt: "Cách lên kế hoạch cho một hành trình nhẹ nhàng, tôn trọng qua thác nước, bản làng và cung đường núi.",
    content:
      "A Lưới dành nhiều điều đẹp cho những ai đi chậm. Hãy bắt đầu với lịch trình do cộng đồng dẫn dắt, chuẩn bị giày thoải mái và dành khoảng trống cho bữa ăn địa phương, những cuộc trò chuyện và workshop thủ công."
  },
  {
    slug: "zeng-weaving-ta-oi-artisans",
    title: "Dệt Zèng và câu chuyện trong từng hoa văn",
    category: "Văn hóa",
    author: "Mai Nguyễn",
    date: "2026-05-02",
    readingTime: "5 phút đọc",
    image: imageFor("photo-1452860606245-08befc0ff44b"),
    excerpt: "Zèng truyền thống lưu giữ ký ức, bản sắc và sự kiên nhẫn của nghệ nhân Tà Ôi.",
    content:
      "Mỗi hoa văn không chỉ là trang trí. Đó là ngôn ngữ thị giác được tạo nên từ đời sống miền núi, ký ức gia đình và niềm tự hào gìn giữ nghề qua nhiều thế hệ."
  },
  {
    slug: "local-cuisine-in-the-highlands",
    title: "Ăn gì ở vùng cao A Lưới",
    category: "Ẩm thực",
    author: "Linh Trần",
    date: "2026-05-22",
    readingTime: "4 phút đọc",
    image: imageFor("photo-1504674900247-0877df9cc836"),
    excerpt: "Món nướng thơm khói, rau rừng, xôi nếp và sự hiếu khách ấm áp của bản làng.",
    content:
      "Bữa ăn ở A Lưới hào sảng và đậm hồn bản địa. Bạn sẽ gặp rau núi, món nướng, xôi nếp, trà thảo mộc và những câu chuyện được chia sẻ quanh mâm cơm."
  }
];

export const testimonials = [
  {
    quote: "Lịch trình được thiết kế rất có chiều sâu. Chúng tôi hiểu văn hóa trước khi chọn các dịch vụ cụ thể.",
    name: "An Phạm",
    role: "Sinh viên du lịch"
  },
  {
    quote: "Cảnh quan đẹp, chủ nhà thân thiện và quy trình đặt tour rất rõ ràng, dễ theo dõi.",
    name: "Minh Lê",
    role: "Khách gia đình"
  },
  {
    quote: "Đêm homestay và workshop dệt Zèng là điểm đáng nhớ nhất trong chuyến đi Huế của chúng tôi.",
    name: "Sarah Collins",
    role: "Du khách yêu văn hóa"
  }
];

/**
 * ĐỘI NGŨ DỰ ÁN & NGHỆ NHÂN ĐỒNG HÀNH ("Ảnh giới thiệu nhóm")
 * Dễ dàng thay đổi ảnh đại diện bằng cách dán link Google Drive hoặc link ảnh bất kỳ vào trường 'image'.
 */
export const teamMembers = [
  {
    id: "team-1",
    name: "Đặng Thị Hoài",
    role: "Trưởng nhóm & Thiết kế Sản phẩm",
    avatar: imageFor("photo-1534528741775-53994a69daeb"),
    bio: "Phụ trách định hướng trải nghiệm số, kết nối nền tảng với các hộ kinh doanh du lịch cộng đồng tại A Lưới."
  },
  {
    id: "team-2",
    name: "Hồ Văn Hạnh",
    role: "Đại diện Cộng đồng & Nghệ nhân Tà Ôi",
    avatar: imageFor("photo-1507003211169-0a1dd7228f2d"),
    bio: "Cố vấn văn hóa bản địa, kết nối các làng nghề dệt Zèng truyền thống và điểm lưu trú homestay."
  },
  {
    id: "team-3",
    name: "Nguyễn Lê Bảo Trâm",
    role: "Nội dung & Truyền thông Bản địa",
    avatar: imageFor("photo-1517841905240-472988babdf9"),
    bio: "Biên tập câu chuyện văn hóa, hỗ trợ các cơ sở địa phương số hóa hình ảnh và tạo voucher ưu đãi."
  },
  {
    id: "team-4",
    name: "Lê Văn Đạt",
    role: "Kỹ thuật Công nghệ & Vận hành",
    avatar: imageFor("photo-1500648767791-00dcc994a43e"),
    bio: "Phát triển hệ thống điều phối Lead ID, đối soát hoa hồng và tích hợp kênh kết nối Zalo trực tiếp."
  }
];
