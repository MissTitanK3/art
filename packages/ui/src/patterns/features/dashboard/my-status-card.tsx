"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { Button } from "@workspace/ui/primitives/button";
import { Badge } from "@workspace/ui/primitives/badge";
import { Switch } from "@workspace/ui/primitives/switch";
import { Label } from "@workspace/ui/primitives/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/primitives/dialog";
import { Textarea } from "@workspace/ui/primitives/textarea";
import { toast } from "@workspace/ui/primitives/sonner";
import {
  UserCheck,
  Clock,
  LifeBuoy,
  GraduationCap,
  Lightbulb,
  Users,
  Activity,
  Flame,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useProfileStore } from "@workspace/store/useProfileStore";
import { resolveScopedStorageKey } from "@workspace/store/utils/storage";
import type { Profile } from "@workspace/store/types/global.ts";

type SupportArea = "admin" | "mentoring" | "workshop" | "cohort";

type SupportAction = {
  key: SupportArea;
  label: string;
  titlePrefix: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

const SUPPORT_ACTIONS: SupportAction[] = [
  {
    key: "admin",
    label: "Admin Support",
    titlePrefix: "Admin Support",
    description: "Flag an issue or ask for urgent admin help.",
    icon: LifeBuoy,
  },
  {
    key: "mentoring",
    label: "Request Mentoring",
    titlePrefix: "Mentoring Request",
    description: "Ask for 1:1 guidance or pairing.",
    icon: GraduationCap,
  },
  {
    key: "workshop",
    label: "Workshop Topic",
    titlePrefix: "Workshop Topic",
    description: "Suggest a workshop you need.",
    icon: Lightbulb,
  },
  {
    key: "cohort",
    label: "Cohort Topic",
    titlePrefix: "Cohort Topic",
    description: "Request a cohort theme or focus area.",
    icon: Users,
  },
];

export function MyStatusCard() {
  const profile = useProfileStore((s) => s.profile);
  const setProfile = useProfileStore((s) => s.setProfile);
  const setProfileSyncedAt = useProfileStore((s) => s.setProfileSyncedAt);
  const clearProfile = useProfileStore((s) => s.clearProfile);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [activeDialog, setActiveDialog] = useState<SupportArea | null>(null);
  const [supportText, setSupportText] = useState("");
  const [supportSubmitting, setSupportSubmitting] = useState(false);
  const [impactSummary, setImpactSummary] = useState<{
    totalMinutes: number;
    totalHours: number;
    progressRatio: number;
    anomalyCount: number;
  } | null>(null);
  const [impactLoading, setImpactLoading] = useState(false);
  const [impactError, setImpactError] = useState<string | null>(null);

  const isAvailable = !!profile?.availability;
  const lastCheckIn = profile?.last_profile_check_in
    ? profile.last_profile_check_in
    : profile?.updated_at;

  const activeAction = useMemo(
    () => SUPPORT_ACTIONS.find((a) => a.key === activeDialog) ?? null,
    [activeDialog]
  );

  const closeDialog = useCallback(() => {
    setActiveDialog(null);
    setSupportText("");
  }, []);

  const updateStatus = useCallback(
    async (payload: { availability?: boolean; checkIn?: boolean }) => {
      const res = await fetch("/api/profile/status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      const data = (await res.json()) as { profile?: Profile };
      if (data?.profile) {
        // Update the profile and set sync timestamp to epoch 0 (Jan 1, 1970)
        // This forces the provider to treat the cached data as stale and refetch on next load
        setProfile(data.profile, 0);

        // Force persist to localStorage immediately
        // The persist middleware may be debounced, so we manually ensure it's saved
        try {
          const storageKey = "profile-store::region-pnw"; // Match the scoped key
          const stateToSave = {
            state: {
              profile: data.profile,
              profileSyncedAt: "1970-01-01T00:00:00.000Z",
            },
            version: 1,
          };
          localStorage.setItem(storageKey, JSON.stringify(stateToSave));
        } catch (e) {
          console.error("[MyStatusCard] Failed to manually persist:", e);
        }
      }
      return data.profile;
    },
    [setProfile]
  );

  const handleAvailabilityChange = useCallback(
    async (next: boolean) => {
      setSavingAvailability(true);
      try {
        await updateStatus({ availability: next });
        toast.success(next ? "Availability set to Active" : "Set to Away");
      } catch (e: any) {
        toast.error("Failed to update availability", {
          description: e?.message ?? "Try again in a moment.",
        });
      } finally {
        setSavingAvailability(false);
      }
    },
    [updateStatus]
  );

  const handleCheckIn = useCallback(async () => {
    setCheckingIn(true);
    try {
      await updateStatus({ checkIn: true });
      toast.success("Checked in");
      // Clear profile from localStorage to force fresh fetch on reload
      try {
        const storageKey = resolveScopedStorageKey("profile-store");
        localStorage.removeItem(storageKey);
      } catch (e) {
        console.error("[MyStatusCard] Failed to clear localStorage:", e);
      }
      // Reload the page to fetch fresh profile data from the database
      setTimeout(() => window.location.reload(), 500);
    } catch (e: any) {
      toast.error("Failed to check in", {
        description: e?.message ?? "Try again in a moment.",
      });
      setCheckingIn(false);
    }
  }, [updateStatus]);

  const submitSupportRequest = useCallback(async () => {
    if (!activeAction) return;
    const trimmed = supportText.trim();
    if (trimmed.length < 5) {
      toast.error("Please add a few more details (min 5 characters).");
      return;
    }
    setSupportSubmitting(true);
    try {
      const title = `${activeAction.titlePrefix}: ${trimmed}`;
      const res = await fetch("/api/bug-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          area: activeAction.key,
        }),
      });
      if (!res.ok) {
        throw new Error(await res.text());
      }
      toast.success("Request sent");
      closeDialog();
    } catch (e: any) {
      toast.error("Failed to send request", {
        description: e?.message ?? "Try again in a moment.",
      });
    } finally {
      setSupportSubmitting(false);
    }
  }, [activeAction, supportText, closeDialog]);

  const profileId = profile?.id ?? null;

  useEffect(() => {
    if (!profileId) return;
    let cancelled = false;
    async function loadImpact() {
      setImpactLoading(true);
      setImpactError(null);
      try {
        const res = await fetch(
          `/api/impact/profiles/${profileId}/volunteer-attributions?period=30d`,
          { cache: "no-store" }
        );
        if (!res.ok) {
          if (res.status === 404 || res.status === 401) {
            if (!cancelled) setImpactSummary(null);
            return;
          }
          const message = (await res.json())?.error;
          throw new Error(message ?? "Unable to load impact");
        }
        const json = await res.json();
        if (!cancelled) {
          setImpactSummary(json?.summary ?? null);
        }
      } catch (error) {
        if (!cancelled) {
          setImpactSummary(null);
          setImpactError(
            error instanceof Error ? error.message : "Unable to load impact"
          );
        }
      } finally {
        if (!cancelled) {
          setImpactLoading(false);
        }
      }
    }
    loadImpact();
    return () => {
      cancelled = true;
    };
  }, [profileId]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">My Status</CardTitle>
        <UserCheck className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="rounded-lg border bg-muted/30 px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Activity className="h-4 w-4 text-muted-foreground" />
                Personal impact (last 30d)
              </div>
              {impactSummary?.anomalyCount ? (
                <Badge
                  variant="destructive"
                  className="flex items-center gap-1"
                >
                  <Flame className="h-3 w-3" />
                  {impactSummary.anomalyCount} alert
                  {impactSummary.anomalyCount > 1 ? "s" : ""}
                </Badge>
              ) : null}
            </div>
            <div className="mt-3 flex flex-wrap items-baseline gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Logged hours
                </p>
                <p className="text-2xl font-semibold">
                  {impactLoading
                    ? "—"
                    : impactSummary
                      ? impactSummary.totalHours.toFixed(1)
                      : "0.0"}
                  <span className="text-base font-normal text-muted-foreground">
                    {" "}
                    hrs
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Minutes
                </p>
                <p className="text-lg font-semibold">
                  {impactLoading
                    ? "—"
                    : impactSummary
                      ? Math.round(impactSummary.totalMinutes)
                      : 0}
                </p>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {impactLoading
                ? "Syncing hours..."
                : impactError
                  ? impactError
                  : impactSummary && impactSummary.totalHours > 0
                    ? "Great work. Keep logging attributions so admins can see your lift."
                    : "No hours logged this month yet. Attribute shifts to see your impact."}
            </p>
          </div>
          <div className="flex flex-col justify-evenly rounded-md border px-3 py-2 w-full space-y-3">
            <div className="flex flex-col justify-evenly items-center gap-2 text-sm w-full">
              <Badge variant={isAvailable ? "default" : "secondary"}>
                {isAvailable ? "Ready" : "Away"}
              </Badge>
            </div>
            <div className="flex flex-col justify-evenly items-center gap-2 text-sm w-full">
              <Label htmlFor="availability-mode" className="font-medium">
                {isAvailable ? "Active & Available" : "Standby / Offline"}
              </Label>
              <Switch
                id="availability-mode"
                checked={isAvailable}
                onCheckedChange={handleAvailabilityChange}
                disabled={savingAvailability}
              />
            </div>
          </div>
          <div className="flex flex-col justify-evenly rounded-md border px-3 py-2 w-full space-y-3">
            <div className="flex flex-col justify-evenly items-center gap-2 text-sm w-full">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col leading-tight">
                <span className="font-medium">Last check-in</span>
                <span className="text-xs text-muted-foreground">
                  {lastCheckIn
                    ? formatDistanceToNow(new Date(lastCheckIn), {
                      addSuffix: true,
                    })
                    : "Not yet recorded"}
                </span>
              </div>
            </div>
            <Button
              size="sm"
              onClick={handleCheckIn}
              disabled={checkingIn}
              variant="outline"
            >
              {checkingIn ? "Checking in..." : "Check in now"}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Support & Learning
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {SUPPORT_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.key}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setActiveDialog(action.key)}
                >
                  <Icon className="h-4 w-4 mr-2 text-muted-foreground" />
                  {action.label}
                </Button>
              );
            })}
          </div>
        </div>
      </CardContent>

      <Dialog
        open={!!activeDialog}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="max-w-xl bg-card text-card-foreground">
          <DialogHeader>
            <DialogTitle>{activeAction?.titlePrefix}</DialogTitle>
            <DialogDescription>
              {activeAction?.description ??
                "Share details so we can route this quickly."}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={supportText}
            onChange={(e) => setSupportText(e.target.value)}
            placeholder="Describe what you need help with..."
            rows={4}
          />
          <DialogFooter className="gap-2">
            <Button
              variant="ghost"
              onClick={closeDialog}
              disabled={supportSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={submitSupportRequest} disabled={supportSubmitting}>
              {supportSubmitting ? "Sending..." : "Send request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
