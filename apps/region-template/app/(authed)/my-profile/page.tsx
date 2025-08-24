'use client'

// apps/region-template/app/(authed)/my-profile/page.tsx
import Link from "next/link";
import { ProfileDataLayer } from "@/components/dataLayer/profile/ProfileDataLayer";
import { useProfileStore } from "@workspace/store/profileStore";
import { Button } from "@workspace/ui/components/button";

export default function ProfilePage() {
  const profile = useProfileStore((s) => s.profile);
  const restoreDemo = useProfileStore((s) => s.restoreDemo);

  return (
    <div className="max-w-4xl mx-auto p-0 md:p-8">
      <h1 className="text-2xl font-bold mb-2">My Profile</h1>

      <Link
        href="/my-profile/map"
        className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted my-3"
      >
        Select Zones of Operation
      </Link>

      {!profile ? (
        <div className="mt-6 rounded-lg border p-6">
          <h2 className="text-lg font-semibold">No profile found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            For demo purposes, you can restore the seeded example profile.
          </p>
          <div className="mt-4">
            <Button type="button" onClick={restoreDemo}>
              Restore demo profile
            </Button>
          </div>
        </div>
      ) : (
        <ProfileDataLayer />
      )}
    </div>
  );
}
