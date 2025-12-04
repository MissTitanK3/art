"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import UiSignInCard from "@workspace/ui/patterns/features/auth/sign-in-card";
import { useAuth } from "@/hooks/useAuth";

type SignInCardProps = { redirectTo?: string };
const FALLBACK_REDIRECT = "/";

export function SignInCard({ redirectTo }: SignInCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithPassword, setSession, refresh } = useAuth();

  const target = React.useMemo(
    () => redirectTo ?? searchParams?.get("redirectTo") ?? FALLBACK_REDIRECT,
    [redirectTo, searchParams]
  );

  const onSubmit = React.useCallback(
    async (email: string, password: string) => {
      const session = await signInWithPassword({ email, password });
      setSession(session);
      try {
        await fetch("/auth/callback", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            event: "SIGNED_IN",
            session: {
              access_token: session.accessToken,
              refresh_token: session.refreshToken,
            },
          }),
          keepalive: true,
        });
      } catch {
        /* ignore session sync errors */
      }
      await refresh();
      router.push(target);
    },
    [signInWithPassword, setSession, refresh, router, target]
  );

  return (
    <UiSignInCard
      onSubmit={onSubmit}
      title="Sign in to your region"
      description="Use your regional credentials to access dispatch tools."
      footer={
        <div className="flex w-full flex-col items-center justify-between gap-2 text-foreground">
          <span>
            Don’t have an account?{" "}
            <a className="underline" href="/sign-up">
              Create one
            </a>
          </span>
          <a className="underline" href="/forgot-password">
            Forgot password?
          </a>
        </div>
      }
    />
  );
}
