export type SupabasePublicConfig = {
  url: string;
  anonKey: string;
};

export function getOptionalSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey || url.includes("your-project-ref") || anonKey.includes("your-supabase-anon-key")) {
    return null;
  }

  return { url, anonKey };
}

export function hasSupabaseConfig() {
  return Boolean(getOptionalSupabasePublicConfig());
}

export function getSupabasePublicConfig(): SupabasePublicConfig {
  const config = getOptionalSupabasePublicConfig();

  if (!config) {
    throw new Error("Chưa cấu hình Supabase. Hãy điền NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local.");
  }

  return config;
}

export function getSupabaseServiceRoleKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY.");
  }

  return key;
}
