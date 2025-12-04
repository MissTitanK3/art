"use client";

import * as React from "react";

import { useProfileStore } from "@workspace/store/useProfileStore";
import type { DetaineeIntake } from "@workspace/ui/types/missing-person-intake";
import AdvocacyGroupsAdmin, {
  type AdvocacyGroup,
} from "@workspace/ui/patterns/features/advocacy/advocacy-groups-admin";

export default function AdvocacyGroupsPage() {
  const profile = useProfileStore((s) => s.profile);
  const [groups, setGroups] = React.useState<AdvocacyGroup[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const reload = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/advocacy-groups", {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { groups } = await res.json();
      setGroups(Array.isArray(groups) ? groups : []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    reload();
  }, [reload]);

  const addGroup = React.useCallback(
    async (payload: Partial<AdvocacyGroup> & { contact_emails?: string[] }) => {
      const res = await fetch("/api/admin/advocacy-groups", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await reload();
    },
    [reload]
  );

  const toggleActive = React.useCallback(
    async (g: AdvocacyGroup, next: boolean) => {
      setGroups((prev) =>
        prev.map((x) => (x.id === g.id ? { ...x, active_status: next } : x))
      );
      const res = await fetch(`/api/admin/advocacy-groups/${g.id}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active_status: next }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
    },
    []
  );

  const removeGroup = React.useCallback(async (g: AdvocacyGroup) => {
    const res = await fetch(`/api/admin/advocacy-groups/${g.id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    setGroups((prev) => prev.filter((x) => x.id !== g.id));
  }, []);

  const loadRecords = React.useCallback(async (): Promise<DetaineeIntake[]> => {
    const res = await fetch("/api/admin/missing-persons");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { records } = await res.json();
    const rows = Array.isArray(records) ? records : [];
    const mapped: DetaineeIntake[] = rows
      .map(
        (row: any) =>
          ({
            caseId: row.case_id,
            fullName: row.full_name ?? undefined,
            detentionDateTime: row.detention_datetime ?? undefined,
            detentionLocation: row.detention_location ?? undefined,
            arrestingAgency: row.arresting_agency ?? undefined,
            lastKnownFacility: row.last_known_facility ?? undefined,
            lastKnownCity: row.last_known_city ?? undefined,
            urgentNeeds: Array.isArray(row.urgent_needs)
              ? row.urgent_needs
              : undefined,
            lastUpdated: row.last_updated ?? undefined,
          }) as DetaineeIntake
      )
      .filter((r: DetaineeIntake) => !!r.caseId);
    return mapped;
  }, []);

  return (
    <AdvocacyGroupsAdmin
      groups={groups}
      loading={loading}
      error={error}
      canManage={["admin", "regional_admin", "national_admin"].includes(
        (profile?.access_role ?? "") as string
      )}
      profile={profile}
      onReload={reload}
      onAddGroup={addGroup}
      onToggleActive={toggleActive}
      onRemoveGroup={removeGroup}
      loadRecords={loadRecords}
    />
  );
}
