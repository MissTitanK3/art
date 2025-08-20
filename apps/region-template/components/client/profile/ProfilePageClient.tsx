"use client";

import Link from "next/link";
import { ProfileForm } from "./ProfileForm";
import { useProfileStore } from "@/lib/profileStore";

// This deleteAccount should stay client-side for Zustand
export function deleteAccount(): { ok: boolean; err?: string } {
  try {
    useProfileStore.getState().clearProfile();
    return { ok: true };
  } catch (err: any) {
    console.error(err);
    return { ok: false, err: "Failed to delete account" };
  }
}

export default function ProfilePageClient() {
  const profile = useProfileStore((s) => s.profile) ?? {};

  return (
    <div className="max-w-4xl mx-auto p-0 md:p-8">
      <h1 className="text-2xl font-bold mb-2">My Profile</h1>
      <Link
        href="/my-profile/map"
        className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted"
      >
        Pick on map
      </Link>
      <div className="px-2">
        <ProfileForm initial={profile} deleteAccount={deleteAccount} />
      </div>
    </div>
  );
}
