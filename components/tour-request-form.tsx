"use client";

import { useRouter } from "next/navigation";
import { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function TourRequestForm({ successHref }: { successHref: string }) {
  const router = useRouter();

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    router.push(successHref);
  };

  return (
    <form className="grid gap-5" onSubmit={submit}>
      <fieldset className="grid gap-4 md:grid-cols-2">
        <legend className="sr-only">Thông tin đặt tour</legend>
        <label className="grid gap-2 text-sm font-semibold text-ink">Họ tên<Input required name="name" placeholder="Nhập họ tên" /></label>
        <label className="grid gap-2 text-sm font-semibold text-ink">Số điện thoại<Input required name="phone" placeholder="+84..." /></label>
        <label className="grid gap-2 text-sm font-semibold text-ink md:col-span-2">Email<Input required type="email" name="email" placeholder="you@example.com" /></label>
        <label className="grid gap-2 text-sm font-semibold text-ink">Ngày khởi hành<Input required type="date" name="startDate" /></label>
        <label className="grid gap-2 text-sm font-semibold text-ink">Số lượng khách<Input required type="number" min={1} defaultValue={2} name="guests" /></label>
        <label className="grid gap-2 text-sm font-semibold text-ink md:col-span-2">Yêu cầu thêm<Textarea name="note" placeholder="Nhu cầu ăn uống, người lớn/trẻ em, điểm đón..." /></label>
      </fieldset>
      <Button type="submit" size="lg">Gửi yêu cầu đặt tour</Button>
    </form>
  );
}
