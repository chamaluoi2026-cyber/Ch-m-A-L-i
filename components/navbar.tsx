"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { AuthNavLink } from "@/components/auth/auth-nav-link";
import { Button } from "@/components/ui/button";
import { AppImage } from "@/components/ui/app-image";
import { navItems, siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-forest/10 bg-beige/95 shadow-[0_12px_40px_rgba(22,33,30,0.10)] backdrop-blur-xl">
      <nav className="section-shell flex h-20 items-center justify-between" aria-label="Điều hướng chính">
        <Link href="/" className="focus-ring flex items-center gap-2.5 rounded-xl transition hover:opacity-90">
          <div className="relative h-11 w-44">
            <AppImage
              src={siteConfig.logo}
              alt="Logo Chạm A Lưới"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>
        <ul className="hidden items-center gap-1 rounded-full bg-white/75 p-1 shadow-sm md:flex">
          {navItems.map((item) => {
            const active = isActive(item.href);

            return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "focus-ring rounded-full px-4 py-2 text-sm font-semibold transition",
                  active
                    ? "bg-forest text-white shadow-[0_10px_24px_rgba(15,92,74,0.24)]"
                    : "text-ink/75 hover:bg-forest hover:text-white"
                )}
              >
                {item.label}
              </Link>
            </li>
            );
          })}
        </ul>
        <div className="hidden items-center gap-2 md:flex">
          <AuthNavLink />
          <Button asChild>
            <Link href="/book-tour">Đặt tour</Link>
          </Button>
        </div>
        <button
          type="button"
          aria-label="Mở menu di động"
          className="focus-ring rounded-full bg-white p-2 text-ink shadow-sm md:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
      </nav>
      {open ? (
        <nav className="section-shell pb-5 md:hidden" aria-label="Điều hướng di động">
          <ul className="grid gap-2 rounded-2xl border border-forest/10 bg-white p-3 shadow-card">
            {navItems.map((item) => {
              const active = isActive(item.href);

              return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "focus-ring block rounded-xl px-4 py-3 text-sm font-semibold",
                    active ? "bg-forest text-white" : "text-ink hover:bg-beige"
                  )}
                >
                  {item.label}
                </Link>
              </li>
              );
            })}
            <li>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="focus-ring block rounded-xl px-4 py-3 text-sm font-semibold text-forest hover:bg-beige"
              >
                Đăng nhập
              </Link>
            </li>
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
