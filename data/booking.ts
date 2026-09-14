import { imageFor } from "@/data/site";

export const tourIncludes = [
  "Xe đưa đón",
  "Hướng dẫn viên",
  "Ăn uống",
  "Homestay do đơn vị lữ hành sắp xếp",
  "Vé tham quan",
  "Bảo hiểm"
];

export const tourEnhancements = {
  "short-experience": {
    mapImage: imageFor("photo-1524661135-423995f22d0b"),
    gallery: [
      imageFor("photo-1500534314209-a25ddb2bd429"),
      imageFor("photo-1506744038136-46273834b3fb"),
      imageFor("photo-1470770841072-f978cf4d019e")
    ],
    note: "Lộ trình ngắn, phù hợp với khách muốn khám phá A Lưới trong thời gian giới hạn."
  },
  "deep-experience": {
    mapImage: imageFor("photo-1488646953014-85cb44e25828"),
    gallery: [
      imageFor("photo-1511497584788-876760111969"),
      imageFor("photo-1441974231531-c6227db76b6e"),
      imageFor("photo-1501785888041-af3ef285b470")
    ],
    note: "Lộ trình dài hơn, nhiều hoạt động cộng đồng và thời gian hòa mình vào núi rừng."
  }
};

export const travelCompanies = [
  {
    id: "green-valley-travel",
    name: "Green Valley Travel",
    logo: imageFor("photo-1542909168-82c3e7fdca5c"),
    cover: imageFor("photo-1529156069898-49953e39b3ac"),
    description:
      "Đơn vị lữ hành đối tác chuyên tổ chức tour cộng đồng tại Huế và vùng cao A Lưới.",
    years: 9,
    rating: 4.9,
    operatedTours: 420,
    services: ["Xe đưa đón", "Hướng dẫn viên", "Ăn uống", "Bảo hiểm", "Điều phối homestay"],
    contact: "0905 000 118",
    tours: ["short-experience", "deep-experience"]
  },
  {
    id: "aluoi-local-journeys",
    name: "A Lưới Local Journeys",
    logo: imageFor("photo-1529333166437-7750a6dd5a70"),
    cover: imageFor("photo-1517048676732-d65bc937f952"),
    description:
      "Nhóm điều phối tour địa phương, mạnh về trải nghiệm văn hóa Pa Cô, Tà Ôi và hoạt động cộng đồng.",
    years: 6,
    rating: 4.8,
    operatedTours: 260,
    services: ["Lịch trình", "Hướng dẫn viên", "Bữa ăn địa phương", "Văn nghệ", "Workshop Zèng"],
    contact: "0912 345 678",
    tours: ["short-experience", "deep-experience"]
  },
  {
    id: "hue-highland-tours",
    name: "Hue Highland Tours",
    logo: imageFor("photo-1551836022-deb4988cc6c0"),
    cover: imageFor("photo-1500530855697-b586d89ba3ee"),
    description:
      "Công ty lữ hành tại Huế, phù hợp với đoàn gia đình, sinh viên và nhóm khách cần lịch trình trọn gói.",
    years: 11,
    rating: 4.7,
    operatedTours: 510,
    services: ["Xe du lịch", "Điều hành tour", "Hướng dẫn viên", "Vé tham quan", "Bảo hiểm"],
    contact: "0234 888 2026",
    tours: ["deep-experience"]
  }
];

export const selfGuidedExperiences = [
  {
    id: "forest-trekking",
    name: "Trekking rừng",
    price: 350000,
    duration: "3 giờ",
    image: imageFor("photo-1551632811-561732d1e306")
  },
  {
    id: "anor-waterfall",
    name: "Thác A Nôr",
    price: 220000,
    duration: "Nửa ngày",
    image: imageFor("photo-1506744038136-46273834b3fb")
  },
  {
    id: "zeng-workshop",
    name: "Dệt Zèng",
    price: 280000,
    duration: "2 giờ",
    image: imageFor("photo-1452860606245-08befc0ff44b")
  },
  {
    id: "cooking-class",
    name: "Lớp học nấu ăn",
    price: 320000,
    duration: "2.5 giờ",
    image: imageFor("photo-1504674900247-0877df9cc836")
  },
  {
    id: "traditional-music",
    name: "Văn nghệ truyền thống",
    price: 450000,
    duration: "Buổi tối",
    image: imageFor("photo-1516280440614-37939bbacd81")
  },
  {
    id: "campfire",
    name: "Đốt lửa trại",
    price: 380000,
    duration: "Buổi tối",
    image: imageFor("photo-1478131143081-80f7f84ca84d")
  },
  {
    id: "local-guide",
    name: "Hướng dẫn viên địa phương",
    price: 500000,
    duration: "1 ngày",
    image: imageFor("photo-1529156069898-49953e39b3ac")
  },
  {
    id: "hue-transfer",
    name: "Xe đưa đón Huế - A Lưới",
    price: 900000,
    duration: "Một chiều",
    image: imageFor("photo-1544620347-c4fd4a3d5957")
  }
];
