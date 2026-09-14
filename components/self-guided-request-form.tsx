"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function SelfGuidedRequestForm() {
  const [done, setDone] = useState(false);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDone(true);
  };

  return (
    <>
      <form onSubmit={submit} className="grid gap-5">
        <fieldset className="grid gap-4 md:grid-cols-2">
          <legend className="sr-only">Thông tin khách tự túc</legend>
          <label className="grid gap-2 text-sm font-semibold text-ink">Họ tên<Input required name="name" placeholder="Nhập họ tên" /></label>
          <label className="grid gap-2 text-sm font-semibold text-ink">Điện thoại<Input required name="phone" placeholder="+84..." /></label>
          <label className="grid gap-2 text-sm font-semibold text-ink md:col-span-2">Email<Input required type="email" name="email" placeholder="you@example.com" /></label>
          <label className="grid gap-2 text-sm font-semibold text-ink md:col-span-2">Ghi chú<Textarea name="note" placeholder="Thời gian đến, nhu cầu ăn uống, trải nghiệm muốn ưu tiên..." /></label>
        </fieldset>
        <Button type="submit" size="lg" className="bg-clay hover:bg-brown">Gửi yêu cầu</Button>
      </form>
      {done ? (
        <section role="dialog" aria-modal="true" className="fixed inset-0 z-[80] grid place-items-center bg-ink/55 px-5 backdrop-blur-sm">
          <article className="max-w-md rounded-3xl bg-white p-8 text-center shadow-soft">
            <CheckCircle2 className="mx-auto size-14 text-clay" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-bold text-ink">Đã gửi yêu cầu tự túc</h2>
            <p className="mt-3 text-sm leading-7 text-ink/65">Homestay hoặc người phụ trách dịch vụ địa phương sẽ liên hệ lại trong vòng 24 giờ.</p>
            <Button className="mt-6 bg-clay hover:bg-brown" onClick={() => setDone(false)}>Đóng</Button>
          </article>
        </section>
      ) : null}
    </>
  );
}
