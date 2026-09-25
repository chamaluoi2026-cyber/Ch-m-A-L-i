"use server";

import {
  getSiteSettingsAsync,
  updateSiteSettings,
  type TravelConditions,
  defaultTravelConditions
} from "@/lib/server-store";
import { revalidatePath } from "next/cache";

export async function fetchTravelConditionsAction(): Promise<TravelConditions> {
  try {
    const settings = await getSiteSettingsAsync();
    return settings.travelConditions || defaultTravelConditions;
  } catch (err) {
    console.error("fetchTravelConditionsAction error:", err);
    return defaultTravelConditions;
  }
}

export async function updateTravelConditionsAction(
  conditions: Partial<TravelConditions>
): Promise<{
  success: boolean;
  data?: TravelConditions;
  error?: string;
}> {
  try {
    const current = await getSiteSettingsAsync();
    const merged: TravelConditions = {
      ...(current.travelConditions || defaultTravelConditions),
      ...conditions,
      updatedAt: new Date().toISOString()
    };

    updateSiteSettings({ travelConditions: merged });

    // Sync to Supabase Cloud direct
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://hcunfovtwbzfatudejfs.supabase.co";
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjdW5mb3Z0d2J6ZmF0dWRlamZzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTM5NTM5OSwiZXhwIjoyMTA0OTcxMzk5fQ.7QwyRHqGXa6UwgbUNAhlWdmGZqpuS8Cxall2v8j7lMU";

    if (url && key) {
      await fetch(`${url}/rest/v1/system_store`, {
        method: "POST",
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates"
        },
        body: JSON.stringify({
          id: "site_settings",
          data: {
            ...current,
            travelConditions: merged
          },
          updated_at: new Date().toISOString()
        })
      });
    }

    revalidatePath("/", "layout");
    revalidatePath("/admin");
    return { success: true, data: merged };
  } catch (err: any) {
    console.error("updateTravelConditionsAction error:", err);
    return { success: false, error: err?.message || "Lỗi cập nhật bản tin thực tế" };
  }
}
