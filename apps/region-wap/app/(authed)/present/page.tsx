import { requireVerifiedAdminAccess } from "@/lib/guards";
import TeleprompterDataLayer from "@/components/dataLayer/present/TeleprompterDataLayer";

export default async function PresentPage() {
  await requireVerifiedAdminAccess();
  return (
    <div className="px-1 py-4" suppressHydrationWarning>
      <TeleprompterDataLayer />
    </div>
  );
}
