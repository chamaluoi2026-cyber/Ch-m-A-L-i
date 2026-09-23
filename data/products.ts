export type ProductStatus = "active" | "out_of_stock" | "hidden";

export type ProductRecord = {
  id: string;
  slug: string;
  name: string;
  enName?: string;
  category: string;
  enCategory?: string;
  price: number;
  originalPrice?: number;
  unit?: string;
  image: string;
  coverImage?: string;
  gallery: string[];
  description: string;
  enDescription?: string;
  specs: string[];
  enSpecs?: string[];
  videoUrl?: string;
  status: ProductStatus;
  businessName?: string;
  businessId?: string;
  phone?: string;
  zaloUrl?: string;
  isOcop?: boolean;
  ocopStars?: number;
  weight?: string;
  expiryDate?: string;
  storageGuide?: string;
  origin?: string;
  stock?: number;
  discountPercent?: number;
  variations?: Array<{ name: string; price: number; originalPrice?: number; stock?: number }>;
  seoTitle?: string;
  seoDescription?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
};

export const productCategories = [
  { id: "zeng", label: "Zèng truyền thống", enLabel: "Traditional Brocade" },
  { id: "honey", label: "Mật ong rừng", enLabel: "Wild Forest Honey" },
  { id: "tea", label: "Trà núi", enLabel: "Mountain Herbal Tea" },
  { id: "bamboo", label: "Thủ công tre", enLabel: "Bamboo Crafts" },
  { id: "meat-wine", label: "Thịt bò & Rượu cần", enLabel: "Dried Beef & Traditional Wine" },
  { id: "ocop", label: "OCOP A Lưới", enLabel: "OCOP Certified" },
  { id: "souvenir", label: "Quà lưu niệm", enLabel: "Souvenirs & Crafts" }
];

export const defaultProducts: ProductRecord[] = [
  {
    id: "prod-traditional-zeng-brocade",
    slug: "traditional-zeng-brocade",
    name: "Thổ cẩm Zèng truyền thống",
    enName: "Traditional Zeng Brocade",
    category: "Zèng truyền thống",
    enCategory: "Traditional Brocade",
    price: 450000,
    originalPrice: 500000,
    unit: "tấm",
    image: "/images/products/zeng-brocade.png",
    coverImage: "/images/products/zeng-brocade.png",
    gallery: [
      "/images/products/zeng-brocade.png",
      "/images/aluoi/product/Thổ cầm Zèng truyền thống/DSC09159.jpg",
      "/images/aluoi/product/Thổ cầm Zèng truyền thống/DSC09669.jpg",
      "/images/aluoi/product/Thổ cầm Zèng truyền thống/DSC09716.jpg"
    ],
    description: "Thổ cẩm dệt tay bởi nghệ nhân Tà Ôi với hoa văn truyền thống tinh xảo, cườm chì và sợi bông tự nhiên đượm bản sắc văn hóa di sản quốc gia.",
    enDescription: "Hand-woven brocade crafted by Ta Oi artisans with traditional indigenous beadwork patterns.",
    specs: ["Sợi cotton pha tự nhiên", "Đính cườm thủ công", "Dệt khung cửi truyền thống", "Sản phẩm OCOP 4 sao"],
    enSpecs: ["Natural cotton blend", "Hand-beaded patterns", "Handloom woven", "4-star OCOP certified"],
    videoUrl: "",
    status: "active",
    businessName: "HTX Dệt Zèng A Roàng",
    businessId: "biz-zeng-aroang",
    phone: "0905 000 118",
    zaloUrl: "https://zalo.me/0905000118",
    isOcop: true,
    ocopStars: 4,
    rating: 4.9,
    reviewCount: 68,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "prod-forest-honey",
    slug: "forest-honey",
    name: "Mật ong rừng A Lưới",
    enName: "A Luoi Wild Forest Honey",
    category: "Mật ong rừng",
    enCategory: "Wild Forest Honey",
    price: 220000,
    originalPrice: 250000,
    unit: "chai 500ml",
    image: "/images/products/forest-honey.png",
    coverImage: "/images/products/forest-honey.png",
    gallery: [
      "/images/products/forest-honey.png",
      "/images/aluoi/ho-sinh-thai-a-luoi.jpg"
    ],
    description: "Mật ong vàng óng được khai thác tự nhiên từ các cánh rừng nguyên sinh đại ngàn Trường Sơn, vị ngọt thanh đượm hương hoa rừng tinh khiết.",
    enDescription: "Raw wild honey harvested sustainably from virgin rainforests of the Truong Son range.",
    specs: ["Chai thủy tinh 500ml", "Mật ong khoái rừng già 100%", "Không đường nhân tạo, không chất bảo quản", "Thu hoạch theo mùa"],
    enSpecs: ["500ml glass bottle", "100% pure wild honey", "No additives or preservatives", "Seasonal harvest"],
    videoUrl: "",
    status: "active",
    businessName: "Tổ hợp tác Khai thác Mật ong Rừng A Lưới",
    businessId: "biz-mat-ong",
    phone: "0905 000 118",
    zaloUrl: "https://zalo.me/0905000118",
    isOcop: true,
    ocopStars: 3,
    rating: 4.8,
    reviewCount: 94,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "prod-mountain-tea",
    slug: "mountain-tea",
    name: "Trà thảo mộc miền núi",
    enName: "Highland Herbal Tea",
    category: "Trà núi",
    enCategory: "Mountain Herbal Tea",
    price: 180000,
    originalPrice: 200000,
    unit: "hộp 120g",
    image: "/images/products/mountain-tea.png",
    coverImage: "/images/products/mountain-tea.png",
    gallery: [
      "/images/products/mountain-tea.png",
      "/images/aluoi/checkin-nong-trai.jpg"
    ],
    description: "Trà núi thơm nhẹ phối cùng thảo mộc quý địa phương (chè vằng, sâm cau, cà gai leo), hậu vị ngọt mộc mạc giúp thanh nhiệt giải độc và thư thái tinh thần.",
    enDescription: "Soothing highland tea blended with wild mountain herbs, offering calming herbal notes.",
    specs: ["Hộp 120g tiện dụng", "Phối thảo mộc thiên nhiên", "Hàm lượng caffeine thấp", "Thu hái thủ công từ nương rẫy sạch"],
    enSpecs: ["120g box", "Natural mountain herbs blend", "Low caffeine", "Sustainably wild-harvested"],
    videoUrl: "",
    status: "active",
    businessName: "Cơ sở Chế biến Dược liệu Vùng cao",
    businessId: "biz-tra-thao-moc",
    phone: "0905 000 118",
    zaloUrl: "https://zalo.me/0905000118",
    isOcop: true,
    ocopStars: 3,
    rating: 4.7,
    reviewCount: 52,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "prod-bamboo-craft-basket",
    slug: "bamboo-craft-basket",
    name: "Giỏ thủ công bằng tre",
    enName: "Handcrafted Bamboo Basket",
    category: "Thủ công tre",
    enCategory: "Bamboo Crafts",
    price: 260000,
    originalPrice: 290000,
    unit: "chiếc",
    image: "/images/products/bamboo-basket.png",
    coverImage: "/images/products/bamboo-basket.png",
    gallery: [
      "/images/products/bamboo-basket.png",
      "/images/aluoi/nha-san-truyen-thong.jpg"
    ],
    description: "Giỏ tre đan tay tỉ mỉ từ những dải tre cật dẻo dai của núi rừng A Lưới, bền chắc và thân thiện với môi trường, lý tưởng để làm quà lưu niệm.",
    enDescription: "Meticulously handwoven bamboo basket made by indigenous artisans from highland bamboo.",
    specs: ["Tre cật tự nhiên qua xử lý khói", "Đan tay thủ công 100%", "Trọng lượng nhẹ, độ bền cao", "Thân thiện với môi trường"],
    enSpecs: ["Natural smoked bamboo", "100% handwoven", "Lightweight and durable", "Eco-friendly"],
    videoUrl: "",
    status: "active",
    businessName: "Làng nghề Đan lát Thủ công A Lưới",
    businessId: "biz-dan-lat",
    phone: "0905 000 118",
    zaloUrl: "https://zalo.me/0905000118",
    isOcop: false,
    rating: 4.6,
    reviewCount: 38,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "prod-thit-bo-gac-bep-ruou-can",
    slug: "thit-bo-gac-bep-ruou-can",
    name: "Thịt bò gác bếp & Rượu cần A Lưới",
    enName: "Smoked Beef & Traditional Highland Wine",
    category: "Thịt bò & Rượu cần",
    enCategory: "Dried Beef & Traditional Wine",
    price: 420000,
    originalPrice: 480000,
    unit: "combo",
    image: "/images/aluoi/am-thuc-nha-san.jpg",
    coverImage: "/images/aluoi/am-thuc-nha-san.jpg",
    gallery: [
      "/images/aluoi/am-thuc-nha-san.jpg",
      "/images/aluoi/checkin-nong-trai.jpg",
      "/images/aluoi/nha-san-truyen-thong.jpg"
    ],
    description: "Thịt bò vàng gác bếp than củi thơm lừng đượm khói, chấm muối kiến vàng kèm ghè rượu cần men lá nồng ấm tình người vùng cao.",
    enDescription: "Traditional woodsmoke cured hill-beef paired with indigenous leaf-yeast fermented wine.",
    specs: ["Bò cỏ thả đồi tươi ngon", "Gói 500g hút chân không", "Gia vị tiêu rừng & mắc khén", "Tặng kèm cần hút truyền thống"],
    enSpecs: ["Grass-fed highland beef", "500g vacuum sealed pack", "Wild mountain pepper spices", "Includes traditional bamboo reed"],
    videoUrl: "",
    status: "active",
    businessName: "Ẩm thực Sinh thái Bản địa A Lưới",
    businessId: "biz-am-thuc",
    phone: "0905 000 118",
    zaloUrl: "https://zalo.me/0905000118",
    isOcop: true,
    ocopStars: 3,
    rating: 4.9,
    reviewCount: 112,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  }
];
