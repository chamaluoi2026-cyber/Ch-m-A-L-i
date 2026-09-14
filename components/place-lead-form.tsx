"use client";

import {
  CalendarDays,
  Check,
  Copy,
  Gift,
  Lock,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  Users
} from "lucide-react";
import { FormEvent, useState } from "react";
import type { Place } from "@/data/places";
import { submitLeadAction } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type LeadResult = {
  leadId: string;
  voucherCode: string;
  discountOffer: string;
  expiresAt: string;
  placeName: string;
};

export function PlaceLeadForm({ place }: { place: Place }) {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [guests, setGuests] = useState(2);
  const [need, setNeed] = useState("");
  const [consent, setConsent] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<LeadResult | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!consent) {
      setError("Vui lòng đồng ý để Chạm A Lưới lưu trữ thông tin và kết nối với cơ sở dịch vụ.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const res = await submitLeadAction({
      placeSlug: place.slug,
      placeName: place.name,
      businessName: place.businessName,
      businessId: place.businessId,
      customerName,
      phone,
      email: email.trim() || undefined,
      expectedDate,
      guests,
      need,
      consent
    });

    setSubmitting(false);

    if (res.success && res.leadId && res.voucherCode) {
      setResult({
        leadId: res.leadId,
        voucherCode: res.voucherCode,
        discountOffer: res.discountOffer || place.voucherOffer,
        expiresAt: res.expiresAt || "30 ngày",
        placeName: res.placeName || place.name
      });
    } else {
      setError(res.error || "Không thể gửi thông tin. Vui lòng thử lại.");
    }
  }

  function handleCopy() {
    if (!result) return;
    navigator.clipboard.writeText(result.voucherCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const zaloChatUrl = result
    ? `${place.zaloUrl}?text=${encodeURIComponent(
        `Xin chào ${place.businessName}, tôi là ${customerName} (SĐT: ${phone}), có mã Voucher [${result.voucherCode}] và Lead ID [${result.leadId}] từ Chạm A Lưới. Tôi dự kiến đến vào ngày ${expectedDate} (${guests} người) và muốn được tư vấn: ${need || "các dịch vụ tại cơ sở"}.`
      )}`
    : "#";

  if (result) {
    return (
      <section id="nhan-voucher" className="rounded-3xl bg-white p-6 shadow-card md:p-8 border-2 border-forest/20">
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-emerald-700 text-white shadow-md">
            <TicketCheck className="size-6" aria-hidden="true" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-forest">Đăng ký thành công</p>
            <h2 className="text-2xl font-extrabold text-ink">Voucher của bạn đã sẵn sàng!</h2>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border-2 border-dashed border-forest/40 bg-forest/5 p-6 text-center relative overflow-hidden">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-forest tracking-wider">
            <span>Mã Lead: {result.leadId}</span>
            <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">Chưa sử dụng</span>
          </div>

          <p className="mt-4 text-xs font-semibold text-ink/60 uppercase">Mã voucher độc quyền</p>
          <div className="mt-1 flex items-center justify-center gap-3">
            <span className="text-3xl md:text-4xl font-black tracking-tight text-forest font-mono">{result.voucherCode}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="focus-ring rounded-lg bg-white p-2 text-forest shadow-sm hover:bg-forest hover:text-white transition"
              title="Sao chép mã"
            >
              {copied ? <Check className="size-5 text-emerald-600" /> : <Copy className="size-5" />}
            </button>
          </div>

          <div className="mt-4 rounded-xl bg-white/80 p-3 text-sm font-semibold text-ink/80 border border-forest/10">
            🎁 {result.discountOffer}
          </div>

          <p className="mt-3 text-xs text-ink/55">
            Hạn dùng: 30 ngày (đến {result.expiresAt}) • Áp dụng tại: {result.placeName}
          </p>
        </div>

        <div className="mt-6 rounded-2xl bg-beige p-4 text-xs leading-6 text-ink/75">
          <p className="font-bold text-forest flex items-center gap-1.5">
            <Sparkles className="size-4" /> Hướng dẫn nhận ưu đãi:
          </p>
          <ol className="mt-1.5 list-decimal pl-4 space-y-1">
            <li>Bấm nút <strong>Chat với cơ sở trên Zalo</strong> bên dưới để kết nối trực tiếp.</li>
            <li>Gửi kèm mã voucher <strong>{result.voucherCode}</strong> khi trao đổi hoặc đặt cọc.</li>
            <li>Khi đến sử dụng dịch vụ, xuất trình mã cho cơ sở để được áp dụng giảm giá trực tiếp.</li>
          </ol>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Button asChild size="lg" className="w-full bg-[#0068FF] hover:bg-[#0052cc] text-white">
            <a href={zaloChatUrl} target="_blank" rel="noreferrer">
              <MessageCircle className="size-5 mr-2" aria-hidden="true" />
              Chat với cơ sở qua Zalo
            </a>
          </Button>

          <Button asChild size="lg" variant="outline" className="w-full border-forest text-forest hover:bg-forest/5">
            <a href={`tel:${place.phone}`}>
              <Phone className="size-5 mr-2" aria-hidden="true" />
              Gọi hotline ({place.phone})
            </a>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section id="nhan-voucher" className="rounded-3xl bg-white p-6 shadow-card md:p-8">
      <div className="flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-full bg-clay text-white shadow-md">
          <Gift className="size-6" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-clay">Ưu đãi độc quyền</p>
          <h2 className="text-2xl font-extrabold text-ink">Nhận voucher & Tư vấn trực tiếp</h2>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-amber-50 border border-amber-200 p-4 text-xs leading-6 text-amber-900">
        <p className="font-bold flex items-center gap-1.5">
          <Lock className="size-3.5 text-amber-700" /> Nút Chat Zalo sẽ được mở sau khi bạn điền form:
        </p>
        <p className="mt-0.5 text-amber-800/90">
          Website sẽ cấp cho bạn một <strong>Mã Voucher</strong> và <strong>Lead ID</strong> để cơ sở nhận diện và áp dụng đúng ưu đãi: <em>&quot;{place.voucherOffer}&quot;</em>.
        </p>
      </div>

      <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
        <label className="grid gap-1.5 text-sm font-bold text-ink">
          Họ và tên của bạn <span className="text-red-500">*</span>
          <Input
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Ví dụ: Nguyễn Văn An"
            required
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-bold text-ink">
            Số điện thoại Zalo <span className="text-red-500">*</span>
            <Input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="09xx xxx xxx"
              required
            />
          </label>

          <label className="grid gap-1.5 text-sm font-bold text-ink">
            Email nhận thông tin <span className="text-xs text-ink/40 font-normal">(không bắt buộc)</span>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="ban@gmail.com"
            />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-bold text-ink">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="size-4 text-clay" />
              Ngày dự kiến sử dụng dịch vụ <span className="text-red-500">*</span>
            </span>
            <Input
              type="date"
              value={expectedDate}
              onChange={(event) => setExpectedDate(event.target.value)}
              required
            />
          </label>

          <label className="grid gap-1.5 text-sm font-bold text-ink">
            <span className="flex items-center gap-1.5">
              <Users className="size-4 text-clay" />
              Số lượng khách (người) <span className="text-red-500">*</span>
            </span>
            <Input
              type="number"
              min={1}
              value={guests}
              onChange={(event) => setGuests(Math.max(1, Number(event.target.value) || 1))}
              required
            />
          </label>
        </div>

        <label className="grid gap-1.5 text-sm font-bold text-ink">
          Nhu cầu tư vấn cụ thể
          <Textarea
            value={need}
            onChange={(event) => setNeed(event.target.value)}
            placeholder="Ví dụ: Cần tư vấn giá phòng cuối tuần, đặt bữa trưa mâm cơm nướng, hướng dẫn viên tắm thác, dịch vụ đưa đón..."
            rows={3}
          />
        </label>

        <label className="flex items-start gap-2.5 text-xs text-ink/75 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5 rounded border-forest text-forest focus:ring-forest size-4"
          />
          <span>
            Tôi đồng ý cho Chạm A Lưới lưu thông tin để chuyển đến <strong>{place.businessName}</strong> nhằm mục đích hỗ trợ tư vấn và áp dụng voucher ưu đãi.
          </span>
        </label>

        {error ? (
          <div className="rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-700 border border-red-200">
            {error}
          </div>
        ) : null}

        <Button type="submit" size="lg" disabled={submitting} className="w-full text-base font-bold">
          {submitting ? "Đang tạo mã voucher..." : "Nhận voucher & Mở chat Zalo"}
        </Button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-ink/50">
          <ShieldCheck className="size-4 text-forest" />
          Bảo mật thông tin • Cam kết không làm phiền du khách
        </p>
      </form>
    </section>
  );
}
