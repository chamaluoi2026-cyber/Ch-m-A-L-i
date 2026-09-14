"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { clearLocalSession } from "@/lib/supabase/browser";

export function SignOutButton() {
  async function handleSignOut() {
    clearLocalSession();
    window.location.href = "/";
  }

  return (
    <Button type="button" variant="outline" onClick={handleSignOut}>
      <LogOut className="size-4" aria-hidden="true" />
      Đăng xuất
    </Button>
  );
}
