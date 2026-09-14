"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

type Experience = {
  id: string;
  name: string;
  price: number;
  duration: string;
  image: string;
};

export function SelfGuidedExperienceSelector({
  homestayId,
  experiences,
  baseQuery,
  guests,
  initialSelectedIds
}: {
  homestayId: string;
  experiences: Experience[];
  baseQuery: string;
  guests: number;
  initialSelectedIds: string[];
}) {
  const selectedIds = new Set(initialSelectedIds);

  const toggleHref = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    const selected = Array.from(next);
    return `/book-tour/self-guided/homestays/${homestayId}/experiences?${baseQuery}${selected.length ? `&experiences=${selected.join(",")}` : ""}`;
  };

  const selectedExperiences = experiences.filter((item) => selectedIds.has(item.id));
  const total = selectedExperiences.reduce((sum, item) => sum + item.price * guests, 0);
  const confirmHref = `/book-tour/self-guided/homestays/${homestayId}/confirm?${baseQuery}${selectedExperiences.length ? `&experiences=${selectedExperiences.map((item) => item.id).join(",")}` : ""}`;

  return (
    <section className="mt-10 grid gap-8 lg:grid-cols-[1fr_340px]">
      <div className="grid gap-5 sm:grid-cols-2">
        {experiences.map((item) => {
          const selected = selectedIds.has(item.id);
          return (
            <article
              key={item.id}
              className={`overflow-hidden rounded-2xl bg-white shadow-card transition hover:-translate-y-1 ${selected ? "ring-2 ring-clay" : ""}`}
            >
              <figure className="relative aspect-[4/3]">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
                {selected ? (
                  <span className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-clay text-white shadow-card">
                    <Check className="size-5" aria-hidden="true" />
                  </span>
                ) : null}
              </figure>
              <section className="p-5">
                <h2 className="text-lg font-bold text-ink">{item.name}</h2>
                <p className="mt-2 text-sm text-ink/55">{item.duration}</p>
                <p className="mt-3 font-bold text-clay">{formatCurrency(item.price)} / khách</p>
                <Button asChild className={`mt-5 w-full ${selected ? "bg-brown hover:bg-ink" : "bg-clay hover:bg-brown"}`}>
                  <Link href={toggleHref(item.id)}>
                    {selected ? "Bỏ chọn" : "Thêm trải nghiệm"}
                    {selected ? <X className="size-4" /> : <Plus className="size-4" />}
                  </Link>
                </Button>
              </section>
            </article>
          );
        })}
      </div>

      <aside className="h-fit rounded-3xl bg-white p-6 shadow-card lg:sticky lg:top-28">
        <p className="text-sm font-bold uppercase tracking-[0.24em] text-clay">Tóm tắt tự túc</p>
        <h2 className="mt-3 text-2xl font-extrabold text-ink">Trải nghiệm đã chọn</h2>
        {selectedExperiences.length ? (
          <ul className="mt-5 grid gap-3">
            {selectedExperiences.map((item) => (
              <li key={item.id} className="flex justify-between gap-4 rounded-2xl bg-beige p-4 text-sm">
                <span className="font-semibold text-ink">{item.name}</span>
                <span className="font-bold text-clay">{formatCurrency(item.price * guests)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-5 rounded-2xl bg-beige p-4 text-sm leading-7 text-ink/65">
            Bạn chưa chọn trải nghiệm nào. Có thể bỏ qua và chỉ gửi yêu cầu đặt homestay.
          </p>
        )}
        <div className="mt-5 rounded-2xl bg-clay p-4 text-white">
          <p className="text-sm text-white/75">Tạm tính trải nghiệm</p>
          <p className="mt-1 text-2xl font-extrabold">{formatCurrency(total)}</p>
        </div>
        <Button asChild size="lg" className="mt-6 w-full bg-clay hover:bg-brown">
          <Link href={confirmHref}>Tiếp tục xác nhận<ArrowRight className="size-5" /></Link>
        </Button>
      </aside>
    </section>
  );
}
