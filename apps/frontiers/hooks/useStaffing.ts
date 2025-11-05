'use client';

import * as React from 'react';
import { toast } from 'sonner';
import type { PositionTemplate, Assignment } from '@/schemas/positions';

export function useStaffing(profileId: string | null, currentShip: any | null) {
  const [positionTemplates, setPositionTemplates] = React.useState<PositionTemplate[]>([]);
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);

  // load positions + assignments
  React.useEffect(() => {
    const run = async () => {
      const shipId = currentShip?.ship_id || currentShip?.ship?.id;
      if (!shipId) {
        setPositionTemplates([]);
        setAssignments([]);
        return;
      }
      try {
        const u = new URL(window.location.href);
        u.pathname = `/api/ships/${shipId}/positions`;
        if (profileId) u.searchParams.set('profile_id', profileId);
        const res = await fetch(u.toString(), { cache: 'no-store' });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to load positions');
        setPositionTemplates(Array.isArray(json.template) ? json.template : []);
        setAssignments(Array.isArray(json.assignments) ? json.assignments : []);
      } catch (e: any) {
        console.warn(e);
        setPositionTemplates([]);
        setAssignments([]);
      }
    };
    run();
  }, [currentShip?.ship_id, (currentShip as any)?.ship?.id, profileId]);

  const saveAssignment = React.useCallback(
    async (position_id: string, slot_index: number, shift: number, crew_id: string | null) => {
      try {
        const shipId = currentShip?.ship_id || currentShip?.ship?.id;
        if (!shipId || !profileId) return;
        const res = await fetch(`/api/ships/${shipId}/positions`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ profile_id: profileId, position_id, slot_index, shift, crew_id }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to save assignment');
        setAssignments((prev) => {
          const next = prev.filter(
            (a) => !(a.position_id === position_id && a.slot_index === slot_index && a.shift === shift),
          );
          next.push({ position_id, slot_index, shift, crew_id });
          return next;
        });
        toast.success('Assignment saved');
      } catch (e: any) {
        toast.error(e?.message || 'Failed to save assignment');
      }
    },
    [profileId, currentShip],
  );

  const autoAssign = React.useCallback(
    async (strategy: 'balanced' | 'max-repair' | 'max-signal' | 'max-morale') => {
      try {
        const shipId = currentShip?.ship_id || currentShip?.ship?.id;
        if (!shipId || !profileId) return;
        const res = await fetch(`/api/ships/${shipId}/auto-assign`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ profile_id: profileId, strategy }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || 'Failed to auto-assign');
        const u = new URL(window.location.href);
        u.pathname = `/api/ships/${shipId}/positions`;
        u.searchParams.set('profile_id', profileId);
        const r2 = await fetch(u.toString(), { cache: 'no-store' });
        const j2 = await r2.json();
        setAssignments(Array.isArray(j2.assignments) ? j2.assignments : []);
        toast.success(`Auto-assigned ${json.assigned ?? 0} seat(s)`);
      } catch (e: any) {
        toast.error(e?.message || 'Failed to auto-assign');
      }
    },
    [profileId, currentShip],
  );

  return { positionTemplates, assignments, setAssignments, saveAssignment, autoAssign };
}
