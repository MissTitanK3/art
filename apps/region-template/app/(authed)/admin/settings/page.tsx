import SettingsClient from "@workspace/ui/layout/admin/settings/settings";
import { getRegionSettings } from "@/lib/dal/admin";
import { saveRegionSettings } from "@/app/actions/settings";

export default async function AdminSettingsPage() {
  const settings = await getRegionSettings();
  return <SettingsClient initialSettings={settings} onSave={saveRegionSettings} />;
}
