import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "Hệ thống Quản trị & Điều hành | Chạm A Lưới",
    template: "%s | Quản trị Chạm A Lưới"
  },
  description: "Cổng quản trị trung tâm và điều phối du lịch cộng đồng Chạm A Lưới, Thừa Thiên Huế.",
  robots: {
    index: false,
    follow: false
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body className="font-sans antialiased bg-[#F4F6F5] text-ink">
        {children}
      </body>
    </html>
  );
}
