"use client";

import { Chrome, KeyRound, Mail, Phone } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import {
  getGoogleLoginUrl,
  sendPhoneOtp,
  signInWithEmail,
  signUpWithEmail,
  verifyPhoneOtp
} from "@/lib/supabase/browser";

type AuthMode = "email-login" | "email-register" | "phone";

export function AuthForm({ next = "/account" }: { next?: string }) {
  const authReady = hasSupabaseConfig();
  const [mode, setMode] = useState<AuthMode>("email-login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function goNext() {
    window.location.href = next;
  }

  function showAuthError(authError: unknown, fallback: string) {
    const message = authError instanceof Error ? authError.message : fallback;

    if (message.includes("Supabase") || message.includes(".env.local") || message.includes("NEXT_PUBLIC_")) {
      setError("Chức năng đăng nhập thật đang chờ kết nối hệ thống tài khoản.");
      return;
    }

    setError(message);
  }

  function handleGoogleLogin() {
    try {
      window.location.href = getGoogleLoginUrl(next);
    } catch (authError) {
      showAuthError(authError, "Chưa thể đăng nhập bằng Google.");
    }
  }

  async function handleEmailSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      if (mode === "email-register") {
        const result = await signUpWithEmail(email, password, fullName);

        if (result.access_token) {
          goNext();
          return;
        }

        setStatus("Đã tạo tài khoản. Nếu Supabase yêu cầu xác nhận email, hãy mở Gmail để xác nhận trước khi đăng nhập.");
      } else {
        await signInWithEmail(email, password);
        goNext();
      }
    } catch (authError) {
      showAuthError(authError, "Không thể đăng nhập bằng email.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePhoneSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setStatus(null);

    try {
      if (!otpSent) {
        await sendPhoneOtp(phone);
        setOtpSent(true);
        setStatus("Mã OTP đã được gửi. Hãy kiểm tra điện thoại và nhập mã để tiếp tục.");
        return;
      }

      await verifyPhoneOtp(phone, otp);
      goNext();
    } catch (authError) {
      showAuthError(authError, "Không thể đăng nhập bằng số điện thoại.");
    } finally {
      setLoading(false);
    }
  }

  if (!authReady) {
    return (
      <div className="rounded-3xl border border-forest/10 bg-beige p-6 text-center">
        <p className="mx-auto flex size-12 items-center justify-center rounded-full bg-forest text-white">
          <KeyRound className="size-5" aria-hidden="true" />
        </p>
        <h2 className="mt-4 text-2xl font-extrabold text-ink">Đăng nhập đang chuẩn bị kết nối</h2>
        <p className="mt-3 text-sm leading-7 text-ink/65">
          Khi kết nối Supabase thật, khách có thể đăng nhập để lưu thông tin cá nhân, mã voucher, lịch sử tư vấn, đặt tour và đơn hàng đã quan tâm.
        </p>
      </div>
    );
  }

  return (
    <div className="text-left">
      <Button type="button" size="lg" className="w-full" onClick={handleGoogleLogin}>
        <Chrome className="size-5" aria-hidden="true" />
        Tiếp tục với Google
      </Button>

      <div className="my-7 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.18em] text-ink/40">
        <span className="h-px flex-1 bg-black/10" />
        hoặc
        <span className="h-px flex-1 bg-black/10" />
      </div>

      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-beige p-1">
        {[
          ["email-login", Mail, "Gmail"],
          ["email-register", KeyRound, "Đăng ký"],
          ["phone", Phone, "Điện thoại"]
        ].map(([value, Icon, label]) => (
          <button
            key={value as string}
            type="button"
            onClick={() => {
              setMode(value as AuthMode);
              setError(null);
              setStatus(null);
            }}
            className={`focus-ring flex min-h-12 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold transition ${
              mode === value ? "bg-white text-forest shadow-sm" : "text-ink/60 hover:bg-white/70"
            }`}
          >
            <Icon className="size-4" aria-hidden="true" />
            {label as string}
          </button>
        ))}
      </div>

      {mode === "phone" ? (
        <form className="mt-6 grid gap-4" onSubmit={handlePhoneSubmit}>
          <label className="grid gap-2 text-sm font-bold text-ink">
            Số điện thoại
            <Input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+84..." required />
          </label>
          {otpSent ? (
            <label className="grid gap-2 text-sm font-bold text-ink">
              Mã OTP
              <Input value={otp} onChange={(event) => setOtp(event.target.value)} placeholder="Nhập mã OTP" required />
            </label>
          ) : null}
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Đang xử lý..." : otpSent ? "Xác nhận OTP" : "Gửi mã OTP"}
          </Button>
        </form>
      ) : (
        <form className="mt-6 grid gap-4" onSubmit={handleEmailSubmit}>
          {mode === "email-register" ? (
            <label className="grid gap-2 text-sm font-bold text-ink">
              Họ và tên
              <Input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Nhập họ và tên" />
            </label>
          ) : null}
          <label className="grid gap-2 text-sm font-bold text-ink">
            Gmail hoặc email
            <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@gmail.com" required />
          </label>
          <label className="grid gap-2 text-sm font-bold text-ink">
            Mật khẩu
            <Input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Tối thiểu 6 ký tự" required minLength={6} />
          </label>
          <Button type="submit" size="lg" disabled={loading}>
            {loading ? "Đang xử lý..." : mode === "email-register" ? "Tạo tài khoản" : "Đăng nhập"}
          </Button>
        </form>
      )}

      {status ? <p className="mt-5 rounded-2xl bg-forest/10 px-4 py-3 text-sm font-semibold text-forest">{status}</p> : null}
      {error ? (
        <div className="mt-5 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700">
          <p>{error}</p>
        </div>
      ) : null}
    </div>
  );
}
