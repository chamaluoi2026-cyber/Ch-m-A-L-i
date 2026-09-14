"use client";

import { Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getGoogleLoginUrl } from "@/lib/supabase/browser";

export function GoogleLoginButton({ next = "/account" }: { next?: string }) {
  async function handleLogin() {
    window.location.href = getGoogleLoginUrl(next);
  }

  return (
    <Button type="button" size="lg" className="w-full" onClick={handleLogin}>
      <Chrome className="size-5" aria-hidden="true" />
      Đăng nhập bằng Google
    </Button>
  );
}
