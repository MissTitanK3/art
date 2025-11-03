"use client";

import * as React from "react";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import { Checkbox } from "../checkbox";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../card";

export interface SignUpValues {
  email: string;
  password: string;
  displayName: string;
  affiliation?: string;
  city?: string;
  state?: string;
  contactSignal: string;
  coordinationZone: string;
  fieldRoles: string[];
}

export type SignUpSubmit = (values: SignUpValues) => Promise<{ info?: string } | void>;

export interface SignUpCardProps {
  onSubmit: SignUpSubmit;
  pendingText?: string;
  title?: string;
  description?: string;
  roleOptions?: string[]; // optional list for checkboxes
}

export function SignUpCard({ onSubmit, pendingText = "Creating account…", title = "Create your account", description = "Use your email and a password to sign up.", roleOptions = [] }: SignUpCardProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [displayName, setDisplayName] = React.useState("");
  const [affiliation, setAffiliation] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [contactSignal, setContactSignal] = React.useState("");
  const [coordinationZone, setCoordinationZone] = React.useState("");
  const [fieldRoles, setFieldRoles] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const passwordRules = React.useMemo(() => {
    const length = password.length >= 8;
    const lower = /[a-z]/.test(password);
    const upper = /[A-Z]/.test(password);
    const number = /\d/.test(password);
    const special = /[^A-Za-z0-9]/.test(password);
    const valid = length && lower && upper && number && special;
    return { length, lower, upper, number, special, valid };
  }, [password]);

  const normalizeSignalUsername = React.useCallback((s: string) => s.replace(/[\u200B-\u200D\uFEFF]/g, "").trim(), []);
  const contactSignalClean = React.useMemo(() => normalizeSignalUsername(contactSignal), [contactSignal, normalizeSignalUsername]);
  const contactSignalValid = React.useMemo(() => /^@[A-Za-z_][A-Za-z0-9_]{2,31}\.(?:0[1-9]|[1-9][0-9]{0,8}|1000000000)$/.test(contactSignalClean), [contactSignalClean]);
  const displayNameValid = React.useMemo(() => displayName.trim().length > 0, [displayName]);
  const coordinationZoneValid = React.useMemo(() => coordinationZone.trim().length > 0, [coordinationZone]);

  const toggleRole = React.useCallback((role: string) => {
    setFieldRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]));
  }, []);

  const handleSubmit = React.useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setPending(true);
    try {
      if (!passwordRules.valid) throw new Error("Password does not meet requirements");
      if (!displayNameValid) throw new Error("Display name is required.");
      if (!contactSignalValid) throw new Error("Signal username must match @name.12 (ends with at least two digits).");
      if (!coordinationZoneValid) throw new Error("Coordination zone is required.");

      const result = await onSubmit({ email, password, displayName, affiliation, city, state, contactSignal: contactSignalClean, coordinationZone, fieldRoles });
      if (result && result.info) setInfo(result.info);
    } catch (err: any) {
      setError(err?.message ?? "Failed to sign up");
    } finally {
      setPending(false);
    }
  }, [email, password, displayName, affiliation, city, state, contactSignalClean, coordinationZone, fieldRoles, onSubmit, passwordRules.valid, displayNameValid, contactSignalValid, coordinationZoneValid]);

  return (
    <Card className="mx-auto mt-12 w-full max-w-md border-border/60 bg-background/95 backdrop-blur">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <Label htmlFor="displayName">Display name<span aria-hidden="true" className="text-destructive"> *</span></Label>
            <Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} required />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="grid gap-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button type="button" className="text-xs text-muted-foreground underline" onClick={() => setShowPassword((v) => !v)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <Input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <div className="text-xs text-muted-foreground">
              <ul className="list-disc ml-4">
                <li className={passwordRules.length ? "text-muted-foreground" : "text-destructive"}>At least 8 characters</li>
                <li className={passwordRules.lower ? "text-muted-foreground" : "text-destructive"}>Contains lowercase</li>
                <li className={passwordRules.upper ? "text-muted-foreground" : "text-destructive"}>Contains uppercase</li>
                <li className={passwordRules.number ? "text-muted-foreground" : "text-destructive"}>Contains a number</li>
                <li className={passwordRules.special ? "text-muted-foreground" : "text-destructive"}>Contains a special character</li>
              </ul>
            </div>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="coordinationZone">Coordination Zone<span aria-hidden> *</span></Label>
            <Input id="coordinationZone" value={coordinationZone} onChange={(e) => setCoordinationZone(e.target.value)} required />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="contactSignal">Signal Username<span aria-hidden> *</span></Label>
            <Input id="contactSignal" value={contactSignal} onChange={(e) => setContactSignal(e.target.value)} placeholder="@nickname.12" required />
            {!contactSignalValid && contactSignal.length > 0 ? (
              <div className="text-xs text-destructive">Must look like @name.12 and end in 2+ digits</div>
            ) : null}
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <div className="grid gap-1">
              <Label htmlFor="city">City</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="state">State</Label>
              <Input id="state" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="affiliation">Affiliation</Label>
            <Input id="affiliation" value={affiliation} onChange={(e) => setAffiliation(e.target.value)} placeholder="Org, pod, etc." />
          </div>
          {roleOptions && roleOptions.length > 0 ? (
            <div className="grid gap-2">
              <Label>Field roles</Label>
              <div className="grid grid-cols-2 gap-2">
                {roleOptions.map((r) => (
                  <label key={r} className="flex items-center gap-2 text-sm">
                    <Checkbox checked={fieldRoles.includes(r)} onCheckedChange={() => toggleRole(r)} />
                    <span>{r}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}
          {error ? <div className="text-sm text-destructive">{error}</div> : null}
          {info ? <div className="text-sm text-muted-foreground">{info}</div> : null}
          <Button type="submit" disabled={pending}>{pending ? pendingText : "Create account"}</Button>
        </form>
      </CardContent>
      <CardFooter className="justify-between text-sm text-muted-foreground">
        <span>Already have an account?</span>
        {/* Let the app render a link next to this component if desired */}
      </CardFooter>
    </Card>
  );
}

export default SignUpCard;

