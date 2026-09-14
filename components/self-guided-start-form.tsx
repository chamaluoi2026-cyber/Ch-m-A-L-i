"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SelfGuidedStartForm() {
  const router = useRouter();
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState(2);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams({
      checkin,
      checkout,
      guests: String(Math.max(1, guests))
    });
    router.push(`/book-tour/self-guided/homestays?${params.toString()}`);
  };

  return (
    <form onSubmit={submit} className="grid gap-5 rounded-3xl bg-white p-6 shadow-card md:grid-cols-[1fr_1fr_0.8fr_auto] md:items-end">
      <label className="grid gap-2 text-sm font-semibold text-ink">Ngày nhận phòng<Input required type="date" value={checkin} onChange={(event) => setCheckin(event.target.value)} /></label>
      <label className="grid gap-2 text-sm font-semibold text-ink">Ngày trả phòng<Input required type="date" value={checkout} onChange={(event) => setCheckout(event.target.value)} /></label>
      <label className="grid gap-2 text-sm font-semibold text-ink">Số khách<Input required type="number" min={1} value={guests} onChange={(event) => setGuests(Number(event.target.value))} /></label>
      <Button type="submit" size="lg">Tìm homestay</Button>
    </form>
  );
}
