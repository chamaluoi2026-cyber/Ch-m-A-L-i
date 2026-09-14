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
    <Card className="overflow-hidden">
      <Link href={href} className="group block">
        <figure className="relative aspect-[4/3] overflow-hidden">
          <AppImage
            src={image}
            alt={alt}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
        </figure>
      </Link>
      <section className="p-5">
        {meta ? <p className="text-xs font-bold uppercase tracking-[0.18em] text-clay">{meta}</p> : null}
        <h3 className="mt-2 text-xl font-bold text-ink">{title}</h3>
        <p className="mt-2 min-h-12 text-sm leading-6 text-ink/65">{subtitle}</p>
        <footer className="mt-5 flex items-center justify-between gap-3">
          {price ? <p className="text-sm font-bold text-forest">{formatCurrency(price)}</p> : <span aria-hidden="true" />}
          <Button asChild variant="outline" size="default">
            <Link href={href}>{cta}<ArrowRight className="size-4" aria-hidden="true" /></Link>
          </Button>
        </footer>
      </section>
    </Card>
  );
}
