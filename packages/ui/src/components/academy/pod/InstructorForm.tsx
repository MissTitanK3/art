"use client";

import * as React from "react";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Button } from "@workspace/ui/components/button";
import { academyCertificationOptions, createCertification } from "@workspace/ui/lib/academy-utils";
import CertificationBadges from "./CertificationBadges";
import type {
  AcademyInstructorDraft,
  AcademyInstructorProfile,
  AcademyInstructorVettingStatus,
} from "@workspace/store/types/academy";
import type { NormalizedCertification } from "@workspace/store/types/pod";
import { UNIQUE_TIMEZONES } from "@workspace/ui/lib/constants/states";

type InstructorFormValues = {
  name: string;
  type: AcademyInstructorProfile["type"] | AcademyInstructorDraft["type"];
  availability: AcademyInstructorProfile["availability"];
  focus: string;
  timezone?: string;
  registrationStatus: AcademyInstructorDraft["registrationStatus"];
  vettingStatus: AcademyInstructorVettingStatus;
  certifications: NormalizedCertification[];
};

export type InstructorFormHandle = {
  requestSubmit: () => void;
};

type Props = {
  initial?: Partial<InstructorFormValues>;
  onSubmit: (values: InstructorFormValues) => void;
  onRemove?: () => void;
};

export const InstructorForm = React.forwardRef<InstructorFormHandle, Props>(
  function InstructorForm({ initial = {}, onSubmit }, ref) {
    const [name, setName] = React.useState(initial.name ?? "");
    const [type, setType] = React.useState<InstructorFormValues["type"]>(
      (initial.type as any) ?? "dispatcher",
    );
    const [availability, setAvailability] = React.useState<InstructorFormValues["availability"]>(
      (initial.availability as any) ?? "available",
    );
    const [focus, setFocus] = React.useState(initial.focus ?? "");
    const [timezone, setTimezone] = React.useState(initial.timezone ?? "");
    const [registrationStatus, setRegistrationStatus] = React.useState<InstructorFormValues["registrationStatus"]>(
      (initial.registrationStatus as any) ?? "registered",
    );
    const [vettingStatus, setVettingStatus] = React.useState<InstructorFormValues["vettingStatus"]>(
      (initial.vettingStatus as any) ?? "awaiting_verification",
    );
    const [certifications, setCertifications] = React.useState<NormalizedCertification[]>(
      initial.certifications ? [...initial.certifications] : [],
    );
    const [customSkill, setCustomSkill] = React.useState("");

    const formRef = React.useRef<HTMLFormElement | null>(null);

    React.useImperativeHandle(ref, () => ({
      requestSubmit: () => {
        if (formRef.current) {
          if (typeof formRef.current.requestSubmit === "function") {
            formRef.current.requestSubmit();
          } else {
            const temp = document.createElement("input");
            temp.type = "submit";
            temp.style.display = "none";
            formRef.current.appendChild(temp);
            temp.click();
            formRef.current.removeChild(temp);
          }
        }
      },
    }));

    function addCertification(cert: NormalizedCertification) {
      setCertifications((cur) => {
        if (cur.some((c) => c.id === cert.id || c.display_name === cert.display_name)) return cur;
        return [...cur, cert];
      });
    }

    function removeCertification(id: string) {
      setCertifications((cur) => cur.filter((c) => c.id !== id));
    }

    function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      console.debug("InstructorForm: submit invoked", { name, focus, certifications });
      // Basic validation
      if (!name.trim() || !focus.trim()) {
        console.debug("InstructorForm: validation failed", { name: name.trim(), focus: focus.trim() });
        return;
      }
      const payload = {
        name: name.trim(),
        type,
        availability,
        focus: focus.trim(),
        timezone: timezone.trim() || undefined,
        registrationStatus,
        vettingStatus,
        certifications,
      };
      console.debug("InstructorForm: calling onSubmit", payload);
      onSubmit(payload);
    }

    return (
      <form ref={formRef} className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="instr-name">Name<span className="text-red-500">*</span></Label>
            <Input id="instr-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instr-type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger id="instr-type">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dispatcher">Dispatcher</SelectItem>
                <SelectItem value="mentor">Mentor</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="instr-availability">Availability</Label>
            <Select value={availability} onValueChange={(v) => setAvailability(v as any)}>
              <SelectTrigger id="instr-availability">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="limited">Limited</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="instr-registration">Registration</Label>
            <Select value={registrationStatus} onValueChange={(v) => setRegistrationStatus(v as any)}>
              <SelectTrigger id="instr-registration">
                <SelectValue placeholder="Registration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="registered">Registered</SelectItem>
                <SelectItem value="unregistered">Unregistered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="instr-vetting">Vetting status</Label>
          <Select value={vettingStatus} onValueChange={(v) => setVettingStatus(v as any)}>
            <SelectTrigger id="instr-vetting">
              <SelectValue placeholder="Vetting status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="awaiting_verification">Awaiting verification</SelectItem>
              <SelectItem value="cleared">Cleared</SelectItem>
              <SelectItem value="needs_review">Needs review</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="instr-focus">Focus area<span className="text-red-500">*</span></Label>
          <Input id="instr-focus" value={focus} onChange={(e) => setFocus(e.target.value)} required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="instr-timezone">Timezone</Label>
          <Select value={timezone} onValueChange={(v) => setTimezone(v)}>
            <SelectTrigger id="instr-timezone">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              {UNIQUE_TIMEZONES.map((tz) => (
                <SelectItem key={tz} value={tz}>{tz}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <Label>Certifications / Skills</Label>
            <p className="text-xs text-muted-foreground">Add from the Academy catalog or enter a custom skill.</p>
          </div>
          <Select
            value={undefined}
            onValueChange={(value) => {
              const option = academyCertificationOptions.find((i) => i.id === value);
              if (!option) return;
              addCertification(createCertification(option.label, option.id, "academy"));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Add from Academy catalog" />
            </SelectTrigger>
            <SelectContent>
              {academyCertificationOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input value={customSkill} onChange={(e) => setCustomSkill(e.target.value)} placeholder="Add custom skill" />
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                if (!customSkill.trim()) return;
                addCertification(createCertification(customSkill));
                setCustomSkill("");
              }}
            >
              Add skill
            </Button>
          </div>

          {certifications.length > 0 ? (
            <CertificationBadges certifications={certifications} onRemove={removeCertification} />
          ) : null}
        </div>
      </form>
    );
  },
);

export default InstructorForm;
