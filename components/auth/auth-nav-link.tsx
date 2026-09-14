"use client";

import Link from "next/link";
import { UserCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getCurrentUser, type AuthUser } from "@/lib/supabase/browser";

export function AuthNavLink() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  return (
    <Button asChild variant={user ? "outline" : "secondary"} className="hidden md:inline-flex">
      <Link href={user ? "/account" : "/login"} aria-label={user ? "Mở tài khoản" : "Đăng nhập"}>
        <UserCircle className="size-4" aria-hidden="true" />
        {user ? "Tài khoản" : "Đăng nhập"}
      </Link>
    </Button>
  );
}
