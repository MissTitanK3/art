"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { useAuth } from "@/hooks/useAuth";
import {
  createDemoSession,
  encodeSession,
  ONE_WEEK_SECONDS,
  SESSION_COOKIE,
} from "@/lib/auth/providers/demo/common";

type SignInCardProps = { redirectTo?: string };
const FALLBACK_REDIRECT = "/";

export function SignInCard({ redirectTo }: SignInCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { providerId, signInWithPassword, setSession, refresh } = useAuth();

  const [email, setEmail] = React.useState("fake.person@earth.com");
  const [password, setPassword] = React.useState("fakePassword123!");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const target = React.useMemo(
    () => redirectTo ?? searchParams?.get("redirectTo") ?? FALLBACK_REDIRECT,
    [redirectTo, searchParams],
  );

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setError(null);
      setPending(true);

      try {
        // Demo mode: fake session cookie + update context
        if (providerId === "demo") {
          const session = createDemoSession(email);
          const encoded = encodeSession(session);
          document.cookie = `${SESSION_COOKIE}=${encoded}; path=/; max-age=${ONE_WEEK_SECONDS}; SameSite=Lax`;

          setSession(session);
          router.push(target);
          return;
        }

        // Supabase or real provider
        const session = await signInWithPassword({ email, password });
        setSession(session); // ✅ updates React context immediately
        await refresh(); // ensures provider cookies and context stay in sync
        router.push(target);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to sign in.");
      } finally {
        setPending(false);
      }
    },
    [
      email,
      password,
      providerId,
      setSession,
      signInWithPassword,
      refresh,
      router,
      target,
    ],
  );

  const isLoading = pending;

  return (
    <Card className="mx-auto mt-12 w-full max-w-md border-border/60 bg-background/95 backdrop-blur">
      <CardHeader>
        <CardTitle>Sign in to your region</CardTitle>
        <CardDescription>
          {providerId === "demo"
            ? "Demo mode: ANY email/password works and logs you in locally."
            : "Use your regional credentials to access dispatch tools."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm text-muted-foreground">
        {providerId === "demo"
          ? "Demo users are stored locally until the browser is cleared. No data is sent to a server."
          : "Need access? Contact your regional admin."}
      </CardFooter>
    </Card>
  );
}
