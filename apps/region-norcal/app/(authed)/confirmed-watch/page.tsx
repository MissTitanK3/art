import { requireVerifiedAdminAccess } from "@/lib/guards";
import ConfirmedWatchForm from "@/components/client/ConfirmedWatchForm";

export default async function ConfirmedWatchPage() {
  await requireVerifiedAdminAccess();
  return <ConfirmedWatchForm />;
}
