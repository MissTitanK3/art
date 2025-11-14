"use client";

import * as React from "react";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import type { AcademyInstructorProfile, AcademyInstructorVettingStatus } from "@workspace/store/types/academy";
import {
  availabilityLabels,
  instructorTypeLabels,
  instructorVettingClasses,
  instructorVettingLabels,
  instructorVettingMessages,
} from "./utils";
import CertificationBadges from "./CertificationBadges";

type Props = {
  instructor: AcademyInstructorProfile;
  onManage?: (instructorId: string) => void;
  canManage?: boolean;
};

export default function InstructorCard({ instructor, onManage, canManage = false }: Props) {
  const registrationStatus = instructor.registrationStatus ?? "registered";
  const registrationLabel = registrationStatus === "unregistered" ? "Unregistered" : "Registered";
  const isGuestInstructor = registrationStatus === "unregistered";
  const vettingStatus: AcademyInstructorVettingStatus = instructor.vettingStatus ?? "awaiting_verification";
  const vettingLabel = instructorVettingLabels[vettingStatus];
  const vettingClass = instructorVettingClasses[vettingStatus];
  const vettingMessage = instructorVettingMessages[vettingStatus];

  return (
    <Card className="border border-border/70 shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base font-semibold">{instructor.name}</CardTitle>
            <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
              {instructorTypeLabels[instructor.type]}
            </CardDescription>
            {isGuestInstructor ? (
              <p className="mt-1 text-xs text-muted-foreground">Guest SME not yet registered in Dispatch.</p>
            ) : null}
          </div>
          <Badge variant={isGuestInstructor ? "outline" : "secondary"} className="text-[10px] font-medium uppercase tracking-wide">
            {registrationLabel}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between text-xs">
          <Badge
            variant={
              instructor.availability === "available"
                ? "default"
                : instructor.availability === "limited"
                  ? "secondary"
                  : "outline"
            }
          >
            {availabilityLabels[instructor.availability]}
          </Badge>
          {instructor.timezone ? <span className="text-muted-foreground">{instructor.timezone}</span> : null}
        </div>

        <div>
          <p className="text-sm font-medium">Focus</p>
          <p className="text-xs text-muted-foreground">{instructor.focus}</p>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Certifications</p>
          </div>
          <CertificationBadges certifications={instructor.certifications} />
          <span className="text-[11px] font-medium uppercase text-muted-foreground">Vetting status</span>
          <p className="text-xs text-muted-foreground"><span className={`font-semibold ${vettingClass}`}>{vettingLabel}</span> · {vettingMessage}</p>
        </div>
      </CardContent>
      {canManage ? (
        <CardFooter className="pt-0 flex justify-end">
          <Button
            size="sm"
            variant="outline"
            type="button"
            onClick={() => onManage?.(instructor.id)}
          >
            Manage
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
