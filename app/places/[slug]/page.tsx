import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Edit2,
  CheckCircle2,
  Clock,
  Compass,
  Gift,
  HelpCircle,
  MapPin,
  Navigation,
  Phone,
  ShieldCheck,
  Star,
  Users
} from "lucide-react";
import { getPlaceBySlug, getPlaces, type PlaceRecord } from "@/lib/server-store";
import { placeCategories } from "@/data/places";
import { AppImage } from "@/components/ui/app-image";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
export const revalidate = 0;

export default async function AdminPlaceDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const place = getPlaceBySlug(slug);

  if (!place) {
    notFound();
  }

  if (place.slug !== slug) {
    redirect(`/places/${place.slug}`);
  }

  const category = placeCategories.find((c) => c.id === place.category);
  const isActive = place.status === "active";

  return (
    <div className="min-h-screen bg-[#f8f5f0] text-ink">
      <header className="sticky top-0 z-50 bg-[#0F382E] text-white shadow-xl px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/places"
            className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Quản lý địa điểm</span>
          </Link>
          <span className="text-white/30">|</span>
          <div className="flex items-center gap-2">
            <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Chế Độ Xem Chi Tiết
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              isActive ? "bg-emerald-800 text-emerald-100" : place.status === "temporarily_closed" ? "bg-amber-800 text-amber-100" : "bg-stone-800 text-stone-300"
            }`}>
              {isActive ? "Đang mở cửa" : place.status === "temporarily_closed" ? "Tạm đóng" : "Ẩn (Nháp)"}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href={`/admin/places/${place.slug}/edit`}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold text-white transition shadow-sm"
          >
            <Edit2 className="size-3.5" />
            Chỉnh sửa CMS
          </Link>
          <a
            href={`https://chamaluoi.vercel.app/places/${place.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition shadow-sm"
          >
            <ExternalLink className="size-3.5" />
            Mở trên Web khách
          </a>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
        <article className="rounded-3xl overflow-hidden bg-white shadow-md border border-black/5">
          <div className="relative aspect-[16/8] w-full bg-stone-100">
            <AppImage
              src={place.coverImage || place.image}
              alt={place.imageAlt || place.name}
              fill
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-6 md:p-10 flex flex-col justify-end text-white">
              <span className="rounded-full bg-white/20 px-3.5 py-1 text-xs font-bold backdrop-blur w-fit mb-3">
                {category?.label || "Địa điểm"}
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight">{place.name}</h1>
              <p className="mt-2 max-w-2xl text-white/80 text-sm md:text-base">{place.summary}</p>
            </div>
          </div>
        </article>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-[#B86F3C]">Thông tin chính</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Star className="size-4 text-amber-500 fill-amber-500" />
                <span className="font-bold">{place.rating} / 5.0</span>
                <span className="text-xs text-ink/50">({place.reviewCount} đánh giá)</span>
              </div>
              <div className="flex items-center gap-3 text-ink/80">
                <Clock className="size-4 text-forest" />
                <span>{place.openingHours}</span>
              </div>
              <div className="flex items-center gap-3 text-ink/80">
                <MapPin className="size-4 text-forest" />
                <span className="text-xs">{place.address}</span>
              </div>
              {place.phone && (
                <div className="flex items-center gap-3 text-ink/80">
                  <Phone className="size-4 text-forest" />
                  <a href={`tel:${place.phone}`} className="hover:underline font-semibold">{place.phone}</a>
                </div>
              )}
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <p className="text-xs font-bold text-forest uppercase tracking-wider">Mức giá hiển thị</p>
              <p className="text-xl font-extrabold text-forest mt-1">{place.priceLabel}</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <p className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                <Gift className="size-4" /> Ưu đãi Voucher
              </p>
              <p className="text-sm font-bold text-amber-950 mt-1">{place.voucherOffer}</p>
              {place.voucherTerms && (
                <p className="text-xs text-amber-800/80 mt-1 italic">* {place.voucherTerms}</p>
              )}
            </div>
          </div>
          <div className="md:col-span-2 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-black/5 space-y-6">
            <div>
              <h2 className="text-xs font-black uppercase tracking-wider text-[#0F5C4A]">Giới thiệu chi tiết</h2>
              <div className="mt-3 text-sm md:text-base leading-relaxed text-ink/80 whitespace-pre-line">
                {place.description}
              </div>
            </div>
            {place.highlights && place.highlights.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink/60 mb-3">Điểm nổi bật</h3>
                <div className="flex flex-wrap gap-2">
                  {place.highlights.map((h, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-xl bg-emerald-50 text-forest text-xs font-bold">
                      ✓ {h}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {place.activities && place.activities.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink/60 mb-3">Hoạt động trải nghiệm</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {place.activities.map((a, i) => (
                    <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-stone-50 text-xs font-semibold text-ink/80">
                      <Compass className="size-4 text-clay shrink-0" />
                      <span>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        {place.gallery && place.gallery.length > 0 && (
          <section className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-black/5 space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-ink/60">
              Thư viện ảnh ({place.gallery.length} ảnh)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {place.gallery.map((item, idx) => {
                const url = typeof item === "string" ? item : item.url;
                const alt = typeof item === "string" ? `Ảnh ${idx + 1}` : (item.alt || place.name);
                return (
                  <div key={idx} className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-sm bg-stone-100">
                    <AppImage src={url} alt={alt} fill className="object-cover hover:scale-105 transition duration-500" />
                  </div>
                );
              })}
            </div>
          </section>
        )}
        {place.mapEmbedUrl && (
          <section className="bg-white p-6 rounded-3xl shadow-sm border border-black/5 space-y-3">
            <h2 className="text-xs font-black uppercase tracking-wider text-ink/60">Vị trí trên bản đồ</h2>
            <div className="rounded-2xl overflow-hidden h-72 border border-black/5">
              <iframe
                title={place.name}
                src={place.mapEmbedUrl}
                className="w-full h-full border-0"
                loading="lazy"
              />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
