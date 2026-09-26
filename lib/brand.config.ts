/**
 * SINGLE SOURCE OF TRUTH — BRAND IDENTITY
 * Cấu hình thương hiệu duy nhất toàn hệ thống Chạm A Lưới / Lên Bản.
 */

export interface BrandConfig {
  name: string;
  shortName: string;
  tagline: string;
  enTagline: string;
  campaignName: string;
  officialDomain: string;
  siteUrl: string;
  logoLight: string;
  logoDark: string;
  favicon: string;
  colors: {
    forest: string;
    clay: string;
    beige: string;
  };
  contact: {
    address: string;
    hotline: string;
    email: string;
    supportHours: string;
  };
  social: {
    facebook: string;
    instagram: string;
  };
}

export const BRAND_CONFIG: BrandConfig = {
  name: "Chạm A Lưới",
  shortName: "Chạm A Lưới",
  tagline: "Lên Bản – Du lịch cộng đồng tại Huế",
  enTagline: "Community Tourism in A Luoi, Hue",
  campaignName: "Lên Bản",
  officialDomain: "chamaluoi.vn",
  siteUrl: "https://chamaluoi.vn",
  logoLight: "/images/logo.svg",
  logoDark: "/images/logo-white.svg",
  favicon: "/favicon.ico",
  colors: {
    forest: "#0F382E",
    clay: "#B86F3C",
    beige: "#F9F6F0"
  },
  contact: {
    address: "Huyện A Lưới, Tỉnh Thừa Thiên Huế, Việt Nam",
    hotline: "0825 497 468",
    email: "chamaluoi2026@gmail.com",
    supportHours: "07:30 – 21:30 hàng ngày"
  },
  social: {
    facebook: "https://facebook.com/chamaluoi",
    instagram: "https://instagram.com/chamaluoi"
  }
};
