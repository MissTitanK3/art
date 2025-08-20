// apps/region-template/app/my-profile/page.tsx
import Link from "next/link";
import { ProfileDataLayer } from "@/components/dataLayer/ProfileDataLayer";

// Optional: keep this if you'll later wire account deletion to your backend.
// Just don't pass it to a client component.
export async function deleteAccount(): Promise<{ ok: boolean; err?: string }> {
  "use server";
  try {
    // TODO: perform real server-side deletion (e.g., DB + auth).
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { ok: false, err: "Failed to delete account" };
  }
}

export default async function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto p-0 md:p-8">
      <h1 className="text-2xl font-bold mb-2">My Profile</h1>

      <Link
        href="/my-profile/map"
        className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
      >
        Select Zones of Operation
      </Link>

      <div className="px-2">
        {/* Client-side adapter that reads/writes the zustand store and renders ProfileForm */}
        <ProfileDataLayer />
      </div>
    </div>
  );
}
