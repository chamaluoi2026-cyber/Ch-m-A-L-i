"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveSessionFromHash } from "@/lib/supabase/browser";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const next = searchParams.get("next")?.startsWith("/") ? searchParams.get("next")! : "/account";
    const error = searchParams.get("error_description") ?? searchParams.get("error");

    if (error) {
      router.replace(`/login?error=${encodeURIComponent(error)}`);
      return;
    }

    const hasSession = saveSessionFromHash(window.location.hash);
    router.replace(hasSession ? next : "/login?error=Không thể hoàn tất đăng nhập Google.");
  }, [router, searchParams]);

  return (
    <main className="pt-24">
      <section className="section-shell grid min-h-[60vh] place-items-center py-16">
        <article className="rounded-3xl bg-white p-8 text-center shadow-card">
          <p className="text-sm font-bold uppercase tracking-[0.24em] text-forest">Đăng nhập</p>
          <h1 className="mt-3 text-3xl font-extrabold text-ink">Đang xác nhận tài khoản Google...</h1>
        </article>
      </section>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="pt-24">
          <section className="section-shell grid min-h-[60vh] place-items-center py-16">
            <article className="rounded-3xl bg-white p-8 text-center shadow-card">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-forest">Đăng nhập</p>
              <h1 className="mt-3 text-3xl font-extrabold text-ink">Đang xác nhận tài khoản Google...</h1>
            </article>
          </section>
        </main>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
