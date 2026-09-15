import { NextRequest, NextResponse } from "next/server";
import { getSiteSettings, updateSiteSettings, loadStore, type SiteSettings } from "@/lib/server-store";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function pushToSupabaseDirect(storeData: any): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcunfovtwbzfatudejfs.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdW5mb3Z0d2J6ZmF0dWRlamZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NTM5OSwiZXhwIjoyMTA0OTcxMzk5fQ.7QwyRHqGXa6UwgbUNAhlWdmGZqpuS8Cxall2v8j7lMU';

  if (!url || !key) return false;

  try {
    const res = await fetch(`${url}/rest/v1/system_store`, {
      method: "POST",
      headers: {
        "apikey": key,
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates"
      },
      body: JSON.stringify({
        id: "main",
        data: storeData,
        updated_at: new Date().toISOString()
      })
    });
    return res.ok;
  } catch (err) {
    console.error("[API_SETTINGS] Supabase direct push error:", err);
    return false;
  }
}

async function fetchFromSupabaseDirect(): Promise<SiteSettings | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hcunfovtwbzfatudejfs.supabase.co';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdW5mb3Z0d2J6ZmF0dWRlamZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NTM5OSwiZXhwIjoyMTA0OTcxMzk5fQ.7QwyRHqGXa6UwgbUNAhlWdmGZqpuS8Cxall2v8j7lMU';

  if (!url || !key) return null;

  try {
    const res = await fetch(`${url}/rest/v1/system_store?id=eq.main&select=data`, {
      headers: { "apikey": key, "Authorization": `Bearer ${key}` },
      cache: "no-store"
    });
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0]?.data?.siteSettings || null;
  } catch {
    return null;
  }
}

export async function GET() {
  const cloudSettings = await fetchFromSupabaseDirect();
  const currentSettings = cloudSettings || getSiteSettings();
  return NextResponse.json({ success: true, settings: currentSettings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ success: false, error: "Dữ liệu cấu hình không hợp lệ." }, { status: 400 });
    }

    const updated = updateSiteSettings(body);
    const store = loadStore();
    store.siteSettings = updated;

    // Await cloud sync trực tiếp đảm bảo lưu thành công vào Supabase
    await pushToSupabaseDirect(store);

    revalidatePath("/admin/media");
    revalidatePath("/", "layout");

    return NextResponse.json({
      success: true,
      settings: updated
    });
  } catch (err: any) {
    console.error("[API_SETTINGS_ERR]:", err);
    return NextResponse.json({ success: false, error: err?.message || "Lỗi lưu cấu hình máy chủ." }, { status: 500 });
  }
}
