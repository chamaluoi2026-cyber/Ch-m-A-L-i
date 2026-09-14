import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" }
        ]
      }
    ];
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "100mb"
    }
  },
  compress: true,
  poweredByHeader: false,
  images: {
    // Cho phép nạp ảnh từ bất kỳ domain nào trên internet một cách an toàn và tối ưu hóa
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**"
      },
      {
        protocol: "http",
        hostname: "**"
      }
    ],
    // Tự động chuyển đổi sang định dạng thế hệ mới dung lượng nhẹ hơn 50% - 70%
    formats: ["image/avif", "image/webp"],
    // Thời gian lưu bộ nhớ đệm hình ảnh (30 ngày)
    minimumCacheTTL: 2592000,
    // Kích thước thiết bị tối ưu khi co giãn ảnh tự động
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384]
  }
};

export default nextConfig;
