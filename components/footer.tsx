import Link from "next/link";
import { Building2, Facebook, Instagram, Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { AppImage } from "@/components/ui/app-image";
import { navItems, siteConfig } from "@/data/site";
import { getSiteSettings } from "@/lib/server-store";

export function Footer() {
  const settings = getSiteSettings();
  const activeLogo = settings.logoDark || settings.logo || siteConfig.logoDark || siteConfig.logo;
  const address = settings.contactAddress || "Huyện A Lưới, Thừa Thiên Huế";
  const phone = settings.contactPhone || "0905 000 118";
  const email = settings.contactEmail || "hotro@chamaluoi.vn";
  const facebookUrl = settings.facebookUrl || "https://facebook.com/chamaluoi";
  const instagramUrl = settings.instagramUrl || "https://instagram.com/chamaluoi";
  const zaloUrl = settings.zaloUrl || "";
  const description = settings.footerDescription || "Nền tảng du lịch cộng đồng trung gian kết nối du khách với các homestay, nhà hàng, hợp tác xã và các điểm du lịch sinh thái tại A Lưới, Huế.";

  return (
    <footer className="bg-ink text-white">
      <section className="section-shell grid gap-10 py-14 md:grid-cols-[1.2fr_0.7fr_0.8fr_0.9fr]">
        <article>
          <div className="relative h-12 w-48 mb-3">
            <AppImage
              src={activeLogo}
              alt="Logo Chạm A Lưới"
              fill
              className="object-contain object-left"
            />
          </div>
          <p className="max-w-md text-xs leading-6 text-white/70">
            {description}
          </p>
          <p className="mt-4 text-xs text-white/50">
            Tất cả dịch vụ được cung cấp trực tiếp bởi các cơ sở địa phương có thẩm định.
          </p>
        </article>

        <nav aria-label="Điều hướng du khách">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Khám phá</h2>
          <ul className="mt-4 grid gap-2.5">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link className="text-xs text-white/75 hover:text-white transition" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Dành cho đối tác">
          <h2 className="text-xs font-bold uppercase tracking-widest text-amber-300">Dành cho Đối tác</h2>
          <ul className="mt-4 grid gap-2.5 text-xs text-white/75">
            <li>
              <Link href="/business" className="hover:text-white transition flex items-center gap-1.5">
                <Building2 className="size-3.5 text-emerald-400" /> Cổng Doanh nghiệp
              </Link>
            </li>
            <li>
              <Link href="/business/vouchers" className="hover:text-white transition flex items-center gap-1.5">
                🎫 Xác nhận Voucher
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-white transition flex items-center gap-1.5">
                <ShieldCheck className="size-3.5 text-amber-300" /> Quản trị Hệ thống
              </Link>
            </li>
            <li>
              <Link href="/admin/commissions" className="hover:text-white transition flex items-center gap-1.5">
                💰 Bảng đối soát hoa hồng
              </Link>
            </li>
          </ul>
        </nav>

        <address className="not-italic">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Liên hệ</h2>
          <ul className="mt-4 grid gap-2.5 text-xs text-white/75">
            <li className="flex gap-2.5 items-center"><MapPin className="size-4 shrink-0 text-clay" aria-hidden="true" /> {address}</li>
            <li className="flex gap-2.5 items-center">
              <Phone className="size-4 shrink-0 text-emerald-400" aria-hidden="true" />
              <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="hover:text-white transition">{phone}</a>
            </li>
            <li className="flex gap-2.5 items-center">
              <Mail className="size-4 shrink-0 text-amber-300" aria-hidden="true" />
              <a href={`mailto:${email}`} className="hover:text-white transition">{email}</a>
            </li>
          </ul>
          <div className="mt-4 flex items-center gap-3 text-white/75">
            {facebookUrl && (
              <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition" aria-label="Facebook">
                <Facebook className="size-4" aria-hidden="true" />
              </a>
            )}
            {instagramUrl && (
              <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white transition" aria-label="Instagram">
                <Instagram className="size-4" aria-hidden="true" />
              </a>
            )}
            {zaloUrl && (
              <a href={zaloUrl} target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold px-2 py-0.5 rounded border border-white/20 hover:border-white hover:text-white transition" aria-label="Zalo">
                Zalo
              </a>
            )}
          </div>
        </address>
      </section>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/50 section-shell flex flex-wrap items-center justify-between gap-2">
        <p>© 2026 Chạm A Lưới. Nền tảng kết nối du lịch cộng đồng.</p>
        <p className="text-white/40 text-[11px]">Bảo mật thông tin • Minh bạch đối soát • Phát triển bền vững</p>
      </div>
    </footer>
  );
}
