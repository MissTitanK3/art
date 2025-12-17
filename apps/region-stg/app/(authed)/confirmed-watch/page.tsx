import { requireVerifiedAdminAccess } from "@/lib/guards";
import ConfirmedWatchForm from "./form.client";

export default async function ConfirmedWatchPage() {
  await requireVerifiedAdminAccess();
  return <ConfirmedWatchForm />;
}
