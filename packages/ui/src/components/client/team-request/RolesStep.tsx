"use client";

import { useState } from "react";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@workspace/ui/components/card";
import { FIELD_ROLE_DETAILS } from "@workspace/store/types/roles.ts";
import { humanize } from "@workspace/ui/lib/utils";
import { SelectableRoleCard } from "@workspace/ui/components/SelectableRoleCard";

interface RolesStepProps {
  initial?: {
    required_roles?: string[];
    required_roles_by_type?: Record<string, number>;
  };
  suggestedRoles?: string[];
  onBack: () => void;
  onNext: (data: RolesStepProps["initial"]) => void;
}

export function RolesStep({ initial, onBack, onNext, suggestedRoles }: RolesStepProps) {
  const [roles, setRoles] = useState<string[]>(() => initial?.required_roles ?? []);

  const [rolesByType, setRolesByType] = useState<Record<string, number>>(
    initial?.required_roles_by_type ?? {}
  );

  const toggleRole = (role: string) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const updateCount = (role: string, count?: number) => {
    setRolesByType((prev) => {
      if (typeof count === "number") {
        return { ...prev, [role]: count };
      } else {
        const { [role]: _, ...rest } = prev;
        return rest;
      }
    });
  };



  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 4: Roles Needed</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {FIELD_ROLE_DETAILS.map((r) => {
          const isSuggested = suggestedRoles?.includes(r.role);
          return (
            <SelectableRoleCard
              key={r.role}
              role={r.role}
              label={humanize(r.role)}
              selected={roles.includes(r.role)}
              suggested={isSuggested}
              count={rolesByType[r.role]} // <-- no ?? 1
              onToggle={() => toggleRole(r.role)}
              onCountChange={(val) => updateCount(r.role, val)}
              color={isSuggested ? "emerald" : "amber"}
            />

          );
        })}


      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={() => onNext({ required_roles: roles, required_roles_by_type: rolesByType })}>
          Next
        </Button>
      </CardFooter>
    </Card>
  );
}
