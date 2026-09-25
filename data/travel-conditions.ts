export interface TravelConditions {
  temperature: string;
  weatherState: "sunny" | "cloudy" | "cool" | "light_rain" | "rainy";
  weatherLabel: string;
  roadStatus: "normal" | "foggy" | "slippery" | "maintenance";
  roadLabel: string;
  waterfallStatus: "open" | "closed" | "caution";
  waterfallLabel: string;
  hotSpringStatus: "active" | "maintenance";
  hotSpringLabel: string;
  advisoryNote: string;
  updatedAt: string;
}

export const defaultTravelConditions: TravelConditions = {
  temperature: "24°C",
  weatherState: "cool",
  weatherLabel: "Tiết trời mát mẻ vùng cao, se lạnh về đêm",
  roadStatus: "normal",
  roadLabel: "Đèo QL49 thông thoáng, mặt đường khô ráo, chạy tốt",
  waterfallStatus: "open",
  waterfallLabel: "Thác A Nôr & Pâr Le mở cửa, nước trong mát",
  hotSpringStatus: "active",
  hotSpringLabel: "Suối khoáng nóng A Roàng đang hoạt động bình thường",
  advisoryNote: "Nên mang theo áo khoác mỏng và dép chống trượt khi tắm suối",
  updatedAt: new Date().toISOString()
};
