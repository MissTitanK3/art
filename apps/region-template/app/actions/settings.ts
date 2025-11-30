"use server";

import { updateRegionSettings } from "@/lib/dal/admin";
import { RegionSettings } from "@workspace/store/types/global";
import { revalidatePath } from "next/cache";

export async function saveRegionSettings(settings: RegionSettings) {
  try {
    await updateRegionSettings(settings);
    revalidatePath("/admin/settings");
    return { ok: true };
  } catch (e: any) {
    return { ok: false, error: e.message };
  }
}
