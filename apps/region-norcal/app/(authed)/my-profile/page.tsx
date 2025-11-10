"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProfileDataLayer } from "@/components/dataLayer/profile/ProfileDataLayer";
import { useProfileStore } from "@workspace/store/useProfileStore";

function ReasonBanner() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [hidden, setHidden] = useState(false);

  const reason = searchParams.get("reason");

  const message = useMemo(() => {
    switch (reason) {
      case "profile-required":
        return {
          title: "Complete your profile",
          text: "We brought you here to complete your profile before proceeding.",
        };
      case "suspended":
        return {
          title: "Account suspended",
          text: "Your access is temporarily suspended. Contact a region admin for help.",
        };
      case "awaiting_verification":
        return {
          title: "Verification needed",
          text: "Your account needs verification before you can access that area.",
        };
      case "forbidden-admin":
        return {
          title: "Admin access required",
          text: "You tried to access an admin-only area. If this is a mistake, contact an admin.",
        };
      case "forbidden-dispatch":
        return {
          title: "Dispatch privileges required",
          text: "You need elevated dispatch privileges to view that page.",
        };
      case "forbidden-schedules":
        return {
          title: "Schedules restricted",
          text: "Only local or dispatch admins can manage coverage schedules.",
        };
      case "forbidden-elevated":
        return {
          title: "Elevated role required",
          text: "That action is restricted to elevated roles (pod leaders, trainers, or admins).",
        };
      default:
        return reason
          ? {
              title: "Access limited",
              text: "You were redirected due to access restrictions.",
            }
          : null;
    }
  }, [reason]);

  useEffect(() => {
    setHidden(false);
  }, [reason]);

  if (!message || hidden) return null;

  return (
    <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-amber-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-semibold">{message.title}</div>
          <div className="text-sm opacity-90">{message.text}</div>
        </div>
        <button
          type="button"
          aria-label="Dismiss"
          className="rounded-md px-2 py-1 text-sm text-amber-900 hover:bg-amber-100"
          onClick={() => {
            setHidden(true);
            const params = new URLSearchParams(searchParams.toString());
            params.delete("reason");
            router.replace(
              `${pathname}${params.size ? `?${params.toString()}` : ""}`,
            );
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}

function ProfilePageContent() {
  const profile = useProfileStore((s) => s.profile);

  const needsVerificationHint = useMemo(() => {
    if (!profile) return false;
    const unverified = !profile.verified_by || profile.verified_by === "self";
    const riskNotAck = !profile.self_risk_acknowledged;
    return unverified || riskNotAck;
  }, [profile]);

  return (
    <div className="max-w-5xl mx-auto p-0 md:p-8">
      {/* Always mount the data layer so it can hydrate from Supabase */}
      <ReasonBanner />
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
            You don&apos;t have a profile yet. After signing in, create your
            profile to continue.
          </p>
        </div>
      ) : (
        <>
          {needsVerificationHint ? (
            <div className="my-4 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-emerald-900">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="text-sm">
                  <div className="font-semibold">Complete verification</div>
                  <div className="opacity-90">
                    Your account may require verification and risk
                    acknowledgement.
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {/* Profile is present; editor below reflects current store state */}
        </>
      )}
      <ProfileDataLayer />
    </div>
  );
}

export default function ProfilePage() {
  return <ProfilePageContent />;
}
