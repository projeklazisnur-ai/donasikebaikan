"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveSiteSettings(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const updates: { key: string; value: string }[] = [];

  const fields: Record<string, string> = {
    hero_headline: formData.get("hero_headline") as string ?? "",
    hero_subtitle: formData.get("hero_subtitle") as string ?? "",
  };

  for (const [key, value] of Object.entries(fields)) {
    updates.push({ key, value });
  }

  const optionalStringFields = ["hero_banner_url", "hero_banner_mobile_url", "qris_image_url", "bank_accounts"];
  for (const key of optionalStringFields) {
    const value = formData.get(key) as string | null;
    if (value !== null) updates.push({ key, value });
  }

  for (const { key, value } of updates) {
    const { error } = await supabase
      .from("site_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

    if (error) return { error: `Gagal simpan ${key}: ${error.message}` };
  }

  revalidatePath("/");
  revalidatePath("/dashboard/admin/settings");

  return { success: true };
}

export async function getSiteSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*");

  const settings: Record<string, string> = {};
  for (const row of data ?? []) {
    settings[row.key] = row.value;
  }
  return settings;
}
