"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@workspace/ui/components/card";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRegionAdapters } from "@/providers/RegionProvider";
import { Checkbox } from "@workspace/ui/components/checkbox";
import type { Profile } from "@workspace/store/types/global.ts";
import { FIELD_ROLE_OPTIONS, type FieldRole } from "@workspace/store/types/roles.ts";

const PENDING_PROFILE_KEY = "pending-profile";

export function SignUpCard() {
  const router = useRouter();
  const { providerId, signUpWithPassword, refresh, setSession } = useAuth();
  const { profileAdapter } = useRegionAdapters();

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [displayName, setDisplayName] = React.useState("");
  const [affiliation, setAffiliation] = React.useState("");
  const [city, setCity] = React.useState("");
  const [state, setState] = React.useState("");
  const [contactSignal, setContactSignal] = React.useState("");
  const [coordinationZone, setCoordinationZone] = React.useState("");
  const [fieldRoles, setFieldRoles] = React.useState<FieldRole[]>([]);
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

  // Simple client-side validation for required fields
  const contactSignalValid = React.useMemo(
    () => /^@[A-Za-z0-9._-]+\.[0-9]{2,}$/.test(contactSignal),
    [contactSignal]
  );
  const coordinationZoneValid = React.useMemo(
    () => coordinationZone.trim().length > 0,
    [coordinationZone]
  );

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setInfo(null);
      setPending(true);

      try {
        if (providerId !== "supabase") {
          throw new Error("Sign-up is only available with Supabase");
        }

        if (!passwordRules.valid) {
          throw new Error("Password does not meet requirements");
        }
        // Required field checks
        if (!contactSignalValid) {
          throw new Error(
            "Signal username is required and must match @name.12 (ends with at least two digits)."
          );
        }
        if (!coordinationZoneValid) {
          throw new Error("Coordination zone is required.");
        }

        const session = await signUpWithPassword({ email, password });

        const now = new Date().toISOString();
        const baseProfile: Partial<Profile> = {
          display_name: displayName || email.split("@")[0],
          affiliation: affiliation || "",
          city: city || "",
          state: state || "",
          contact_signal: contactSignal,
          coordination_zone: coordinationZone,
          field_roles: fieldRoles,
          coverage_zones: [],
          weekly_availability: { blocks: {} },
          access_role: "team_member",
          verified_by: "self",
          inserted_at: now,
        } as Partial<Profile>;

        if (session) {
          // Ensure React auth context and provider state are fully synced
          try {
            setSession(session);
            await refresh();
          } catch {
            // ignore sync errors; supabase-js will have persisted to localStorage
          }

          // Save profile immediately if session is available
          const profile: Profile = {
            id: (typeof crypto !== "undefined" && crypto.randomUUID)
              ? crypto.randomUUID()
              : `${session.user.id}-${Date.now()}`,
            user_id: session.user.id,
            coverage_zones: [],
            operating_counties: [],
            ...baseProfile,
            access_role: (baseProfile.access_role as any) || "team_member",
            verified_by: (baseProfile.verified_by as any) || "self",
            availability: baseProfile.availability ?? true,
            self_risk_acknowledged: baseProfile.self_risk_acknowledged ?? false,
            weekly_availability: baseProfile.weekly_availability ?? { blocks: {} },
            inserted_at: baseProfile.inserted_at || now,
          } as Profile;
          try {
            await profileAdapter.saveProfile(profile);
          } catch (e) {
            // If DB write fails, stash as pending so AutoCreateProfile can retry
            try {
              const raw = localStorage.getItem(PENDING_PROFILE_KEY);
              const map = raw ? (JSON.parse(raw) as Record<string, Partial<Profile>>) : {};
              map[email] = { ...baseProfile };
              localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(map));
            } catch {
              // ignore
            }
          }
          router.push("/");
        } else {
          // Store pending profile for later auto-create after email confirmation
          try {
            const raw = localStorage.getItem(PENDING_PROFILE_KEY);
            const map = raw ? (JSON.parse(raw) as Record<string, Partial<Profile>>) : {};
            map[email] = baseProfile;
            localStorage.setItem(PENDING_PROFILE_KEY, JSON.stringify(map));
          } catch {
            // ignore storage errors
          }
          setInfo(
            "Check your email to confirm your account. We will finish creating your profile after you sign in."
          );
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to sign up.");
      } finally {
        setPending(false);
      }
    },
    [email, password, providerId, signUpWithPassword, router, displayName, affiliation, city, state, contactSignal, coordinationZone, fieldRoles, passwordRules, profileAdapter, refresh, setSession]
  );

  return (
    <Card className="mx-auto mt-12 w-full max-w-md border-border/60 bg-background/95 backdrop-blur">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Use your email and a password to sign up.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <Label htmlFor="displayName">Display name</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Ada"
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute inset-y-0 right-2 my-auto rounded px-2 text-sm text-muted-foreground hover:bg-muted"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
              <li className={password ? (passwordRules.length ? "text-emerald-600" : "text-destructive") : ""}>• 8+ characters</li>
              <li className={password ? (passwordRules.lower ? "text-emerald-600" : "text-destructive") : ""}>• At least one lowercase letter</li>
              <li className={password ? (passwordRules.upper ? "text-emerald-600" : "text-destructive") : ""}>• At least one uppercase letter</li>
              <li className={password ? (passwordRules.number ? "text-emerald-600" : "text-destructive") : ""}>• At least one number</li>
              <li className={password ? (passwordRules.special ? "text-emerald-600" : "text-destructive") : ""}>• At least one symbol</li>
            </ul>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="affiliation">Affiliation (optional)</Label>
            <Input
              id="affiliation"
              type="text"
              value={affiliation}
              onChange={(e) => setAffiliation(e.target.value)}
              placeholder="Community org, team, etc."
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label htmlFor="city">City</Label>
              <Input id="city" type="text" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="state">State</Label>
              <Input id="state" type="text" value={state} onChange={(e) => setState(e.target.value)} placeholder="WA" />
            </div>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="contactSignal">Signal username</Label>
            <Input
              id="contactSignal"
              type="text"
              value={contactSignal}
              onChange={(e) => setContactSignal(e.target.value)}
              required
              pattern="^@[A-Za-z0-9._-]+\\.[0-9]{2,}$"
              placeholder="@yourname.12"
            />
            <p className="text-xs text-muted-foreground">Format: @name.12 and ends with at least two digits.</p>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="coordinationZone">Coordination zone</Label>
            <Input
              id="coordinationZone"
              type="text"
              value={coordinationZone}
              onChange={(e) => setCoordinationZone(e.target.value)}
              required
              placeholder="e.g. Seattle Metro"
            />
          </div>
          <div className="grid gap-2">
            <Label>Field roles (select any)</Label>
            <div className="grid grid-cols-2 gap-2">
              {FIELD_ROLE_OPTIONS.map((role) => {
                const checked = fieldRoles.includes(role);
                return (
                  <label key={role} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) => {
                        const next = Boolean(v)
                          ? [...new Set([...fieldRoles, role])]
                          : fieldRoles.filter((r) => r !== role);
                        setFieldRoles(next);
                      }}
                    />
                    <span className="capitalize">{role.replaceAll('_', ' ')}</span>
                  </label>
                );
              })}
            </div>
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">{error}</p>
          )}
          {info && (
            <p className="text-sm text-muted-foreground" role="status">{info}</p>
          )}
          <Button
            type="submit"
            className="w-full"
            disabled={
              pending ||
              !passwordRules.valid ||
              !contactSignalValid ||
              !coordinationZoneValid
            }
          >
            {pending ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm text-muted-foreground">
        Already have an account? <Link href="/sign-in" className="underline">Sign in</Link>
      </CardFooter>
    </Card>
  );
}
