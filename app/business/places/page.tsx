import Image from "next/image";
import Link from "next/link";
import { places } from "@/data/places";
import { CheckCircle2, ExternalLink, Gift, MapPin, Star } from "lucide-react";

export const dynamic = "force-dynamic";

export default function BusinessPlacesPage() {
  const currentBusinessId = "biz-a-nor";
  const myPlaces = places.filter((p) => p.businessId === currentBusinessId);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-ink">Địa điểm & Dịch vụ của Cơ sở</h1>
          <p className="text-xs text-ink/60 mt-1">
            Quản lý thông tin hiển thị, mức giá tham khảo, ưu đãi voucher và dịch vụ đi kèm
          </p>
        </div>
        <span className="rounded-2xl bg-forest/10 px-3.5 py-2 text-xs font-bold text-forest">
          {myPlaces.length} Địa điểm phụ trách
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {myPlaces.map((place) => (
          <article
            key={place.slug}
            className="overflow-hidden rounded-3xl bg-white shadow-card border border-black/5 flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/10] overflow-hidden bg-forest/5">
                <Image src={place.image} alt={place.name} fill className="object-cover" />
                <span className="absolute top-4 left-4 rounded-full bg-emerald-700 text-white px-3 py-1 text-xs font-bold shadow-md">
                  Đang mở cửa đón khách
                </span>
              </div>

              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-extrabold text-ink">{place.name}</h2>
                  <span className="text-xs font-bold text-forest">{place.priceLabel}</span>
                </div>

                <p className="text-xs text-ink/60 flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-forest shrink-0" />
                  {place.address}
                </p>

                <p className="text-xs leading-relaxed text-ink/70 line-clamp-2">{place.summary}</p>

                <div className="rounded-2xl bg-forest/10 p-3 text-xs text-forest font-semibold">
                  🎁 Ưu đãi đang chạy: <strong>{place.voucherOffer}</strong>
                </div>

                <div>
                  <p className="text-[11px] font-bold uppercase text-ink/50 mb-1.5">Dịch vụ cung cấp:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {place.services.map((s) => (
                      <span key={s} className="rounded-lg bg-beige px-2.5 py-1 text-[11px] font-medium text-ink/75">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 pt-0 flex items-center justify-between border-t border-black/5 mt-4 text-xs font-bold">
              <span className="text-forest">Tỷ lệ hoa hồng: {place.commissionRate}%</span>
              <Link
                href={`/places/${place.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 text-ink/70 hover:text-forest"
              >
                Xem trang khách hàng <ExternalLink className="size-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
