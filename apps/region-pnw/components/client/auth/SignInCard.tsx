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

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const target = React.useMemo(
    () => redirectTo ?? searchParams?.get("redirectTo") ?? FALLBACK_REDIRECT,
    [redirectTo, searchParams]
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

        if (providerId === "supabase") {
          const session = await signInWithPassword({ email, password });
          document.cookie = `${SESSION_COOKIE}=${encodeSession(session)}; path=/; max-age=${ONE_WEEK_SECONDS}; SameSite=Lax`;
          setSession(session); // ✅ updates React context immediately
          await refresh();     // ensures provider cookies and context stay in sync
          router.push(target);
          return;
        }

        throw new Error(`Unsupported auth provider: ${providerId}`);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to sign in.");
      } finally {
        setPending(false);
      }
    },
    [email, password, providerId, setSession, signInWithPassword, refresh, router, target]
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
        {providerId === "demo" ? (
          <>
            Demo users are stored locally until the browser is cleared. No data is sent to a server.
          </>
        ) : (
          <>
            Don’t have an account? <a className="underline" href="/sign-up">Create one</a>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
