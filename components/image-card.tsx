"use client";

import { AppImage } from "@/components/ui/app-image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export function ImageCard({
  href,
  image,
  alt,
  title,
  subtitle,
  meta,
  price,
  cta = "Xem chi tiết"
}: {
  href: string;
  image: string;
  alt: string;
  title: string;
  subtitle: string;
  meta?: string;
  price?: number;
  cta?: string;
}) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <Link href={href} className="relative block aspect-[4/3] w-full overflow-hidden bg-stone-100">
        <AppImage
          src={image}
          alt={alt}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        {meta ? (
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay truncate" title={meta}>
            {meta}
          </p>
        ) : (
          <div className="h-4" aria-hidden="true" />
        )}
        <Link href={href} className="block mt-1.5">
          <h3 className="text-base md:text-lg font-bold text-ink line-clamp-1 group-hover:text-forest transition-colors" title={title}>
            {title}
          </h3>
        </Link>
        <p className="mt-2 text-sm leading-relaxed text-ink/65 line-clamp-3 min-h-[3.75rem]" title={subtitle}>
          {subtitle}
        </p>
        <footer className="mt-auto pt-4 flex items-center justify-between gap-2 border-t border-stone-100">
          <div className="min-w-0 flex-1">
            {price ? (
              <p className="truncate text-base font-extrabold text-forest">{formatCurrency(price)}</p>
            ) : (
              <span aria-hidden="true" />
            )}
          </div>
          <Button asChild variant="outline" size="sm" className="shrink-0 rounded-full border-forest/30 text-xs font-bold text-forest hover:bg-forest hover:text-white px-3.5 py-1.5 h-8 whitespace-nowrap transition-colors shadow-none">
            <Link href={href}>
              {cta}
              <ArrowRight className="size-3.5 ml-1 shrink-0" aria-hidden="true" />
            </Link>
          </Button>
        </footer>
      </div>
    </Card>
  );
}
