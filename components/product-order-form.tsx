"use client";

import { useState } from "react";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function ProductOrderForm({ productName }: { productName: string }) {
  const [ordered, setOrdered] = useState(false);

  return (
    <>
      <form
        id="dat-hang"
        className="mt-6 grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          setOrdered(true);
        }}
      >
        <fieldset className="grid gap-4">
          <legend className="sr-only">Thông tin đặt hàng</legend>
          <label className="grid gap-2 text-sm font-semibold text-ink">Họ và tên<Input required name="name" placeholder="Nhập họ và tên" /></label>
          <label className="grid gap-2 text-sm font-semibold text-ink">Số điện thoại<Input required name="phone" placeholder="+84..." /></label>
          <label className="grid gap-2 text-sm font-semibold text-ink">Số lượng<Input required type="number" min={1} defaultValue={1} name="quantity" /></label>
          <label className="grid gap-2 text-sm font-semibold text-ink">Địa chỉ nhận hàng<Input required name="address" placeholder="Số nhà, phường/xã, tỉnh/thành" /></label>
          <label className="grid gap-2 text-sm font-semibold text-ink">Ghi chú<Textarea name="note" placeholder="Màu sắc, gói quà, thời gian liên hệ..." /></label>
        </fieldset>
        <Button type="submit" size="lg" className="w-full">
          <ShoppingBag className="size-5" aria-hidden="true" />
          Gửi yêu cầu đặt hàng
        </Button>
      </form>
      {ordered ? (
        <section role="dialog" aria-modal="true" className="fixed inset-0 z-[80] grid place-items-center bg-ink/55 px-5 backdrop-blur-sm">
          <article className="max-w-md rounded-3xl bg-white p-8 text-center shadow-soft">
            <CheckCircle2 className="mx-auto size-14 text-forest" aria-hidden="true" />
            <h2 className="mt-4 text-2xl font-bold text-ink">Đã nhận yêu cầu đặt hàng</h2>
            <p className="mt-3 text-sm leading-7 text-ink/65">
              Cảm ơn bạn đã quan tâm {productName}. Chạm A Lưới sẽ liên hệ xác nhận đơn trong vòng 24 giờ.
            </p>
            <Button className="mt-6" onClick={() => setOrdered(false)}>Đóng</Button>
          </article>
        </section>
      ) : null}
    </>
  );
}
