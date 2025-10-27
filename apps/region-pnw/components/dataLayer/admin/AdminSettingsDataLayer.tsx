// apps/region-pnw/components/dataLayer/admin/AdminSettingsDataLayer.tsx
import SettingsClient from "@workspace/ui/layout/admin/settings/settings";
import { getRegionSettings } from "@/lib/dal/admin";

export default async function AdminSettingsDataLayer() {
  const settings = await getRegionSettings();
  return <SettingsClient initialSettings={settings} />;
}

