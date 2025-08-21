// apps/region-template/app/my-profile/page.tsx
import Link from "next/link";
import { ProfileDataLayer } from "@/components/dataLayer/profile/ProfileDataLayer";

export default async function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto p-0 md:p-8">
      <h1 className="text-2xl font-bold mb-2">My Profile</h1>

      <Link
        href="/my-profile/map"
        className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted my-3"
      >
        Select Zones of Operation
      </Link>

      <div className="px-2">
        <ProfileDataLayer />
      </div>

      {/* Example: server action usage boundary (optional) */}
      {/* This <form> must live in a Server Component; the button can be a client child */}
      {/* <form action={deleteAccount}>
        <button type="submit" className="mt-6 inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted">
          Delete my account
        </button>
      </form> */}
    </div>
  );
}

// ---- server action defined below, NOT EXPORTED
async function deleteAccount(): Promise<{ ok: boolean; err?: string }> {
  "use server";
  try {
    // TODO: perform real server-side deletion (e.g., DB + auth).
    return { ok: true };
  } catch (err) {
    console.error(err);
    return { ok: false, err: "Failed to delete account" };
  }
}
