"use client";

import { getOptionalSupabasePublicConfig } from "@/lib/supabase/config";

const ACCESS_TOKEN_KEY = "cham_a_luoi_supabase_access_token";
const REFRESH_TOKEN_KEY = "cham_a_luoi_supabase_refresh_token";
const EXPIRES_AT_KEY = "cham_a_luoi_supabase_expires_at";
const USER_CACHE_KEY = "cham_a_luoi_auth_user";

export type AuthUser = {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
    [key: string]: unknown;
  };
};

type AuthSessionPayload = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  user?: AuthUser;
  msg?: string;
  error?: string;
  error_description?: string;
};

function saveSession(payload: AuthSessionPayload) {
  if (!payload.access_token) return false;

  window.localStorage.setItem(ACCESS_TOKEN_KEY, payload.access_token);

  if (payload.refresh_token) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, payload.refresh_token);
  }

  if (payload.expires_in) {
    window.localStorage.setItem(EXPIRES_AT_KEY, String(Date.now() + payload.expires_in * 1000));
  }

  if (payload.user) {
    window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(payload.user));
  }

  return true;
}

async function requestAuth(path: string, body: Record<string, unknown>) {
  const config = getOptionalSupabasePublicConfig();

  if (!config) {
    throw new Error("Chưa cấu hình Supabase.");
  }

  const response = await fetch(`${config.url}/auth/v1/${path}`, {
    method: "POST",
    headers: {
      apikey: config.anonKey,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const payload = (await response.json().catch(() => ({}))) as AuthSessionPayload;

  if (!response.ok) {
    throw new Error(payload.error_description ?? payload.msg ?? payload.error ?? "Không thể xử lý đăng nhập.");
  }

  return payload;
}

export function getGoogleLoginUrl(next = "/account") {
  const config = getOptionalSupabasePublicConfig();

  if (!config) {
    throw new Error("Chưa cấu hình Supabase. Hãy điền NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local.");
  }

  const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
  const params = new URLSearchParams({
    provider: "google",
    redirect_to: redirectTo
  });

  return `${config.url}/auth/v1/authorize?${params.toString()}`;
}

export function saveSessionFromHash(hash: string) {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const expiresIn = Number(params.get("expires_in") ?? 0);

  if (!accessToken) return false;

  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);

  if (refreshToken) {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  if (expiresIn) {
    window.localStorage.setItem(EXPIRES_AT_KEY, String(Date.now() + expiresIn * 1000));
  }

  return true;
}

export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  const config = getOptionalSupabasePublicConfig();

  if (!config) {
    throw new Error("Chưa cấu hình Supabase. Không thể tạo tài khoản thật khi thiếu .env.local.");
  }

  const payload = await requestAuth("signup", {
    email,
    password,
    data: {
      full_name: fullName
    }
  });

  saveSession(payload);
  return payload;
}

export async function signInWithEmail(email: string, password: string) {
  const config = getOptionalSupabasePublicConfig();

  if (!config) {
    throw new Error("Chưa cấu hình Supabase. Không thể đăng nhập thật khi thiếu .env.local.");
  }

  const payload = await requestAuth("token?grant_type=password", {
    email,
    password
  });

  saveSession(payload);
  return payload;
}

export async function sendPhoneOtp(phone: string) {
  const config = getOptionalSupabasePublicConfig();

  if (!config) {
    throw new Error("Chưa cấu hình Supabase. Không thể gửi OTP thật khi thiếu .env.local.");
  }

  return requestAuth("otp", {
    phone
  });
}

export async function verifyPhoneOtp(phone: string, token: string) {
  const config = getOptionalSupabasePublicConfig();

  if (!config) {
    throw new Error("Chưa cấu hình Supabase. Không thể xác nhận OTP thật khi thiếu .env.local.");
  }

  const payload = await requestAuth("verify", {
    phone,
    token,
    type: "sms"
  });

  saveSession(payload);
  return payload;
}

export function getAccessToken() {
  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearLocalSession() {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(EXPIRES_AT_KEY);
  window.localStorage.removeItem(USER_CACHE_KEY);
  window.localStorage.removeItem("cham_a_luoi_demo_user");
  window.localStorage.removeItem("cham_a_luoi_demo_otp");
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = getAccessToken();
  const config = getOptionalSupabasePublicConfig();
  if (!token || !config) return null;

  const response = await fetch(`${config.url}/auth/v1/user`, {
    headers: {
      apikey: config.anonKey,
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    clearLocalSession();
    return null;
  }

  const user = (await response.json()) as AuthUser;
  window.localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
  return user;
}
