"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@workspace/ui/primitives/button";
import { Input } from "@workspace/ui/primitives/input";
import { Label } from "@workspace/ui/primitives/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { PasswordInput } from "./PasswordInput";
import Link from "next/link";

export function SignInForm({
  embedded = false,
  onForgot,
}: {
  embedded?: boolean;
  onForgot?: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <Card className="max-w-sm w-full">
      <CardHeader>
        <CardTitle>Sign in</CardTitle>
        <CardDescription>Link your ship to the network.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Password</Label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              name="password"
              autoComplete="current-password"
            />
          </div>
          {embedded && (
            <div className="flex justify-end -mt-2">
              <button
                type="button"
                className="text-xs underline text-muted-foreground hover:text-foreground"
                onClick={() => onForgot?.()}
              >
                Forgot password?
              </button>
            </div>
          )}
          {error ? (
            <p className="text-xs text-destructive/80">{error}</p>
          ) : null}
          <Button className="w-full" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      </CardContent>
      {!embedded && (
        <CardFooter className="flex items-center justify-between text-xs">
          <Link
            href="/auth/forgot-password"
            className="underline text-muted-foreground"
          >
            Forgot password?
          </Link>
          <Link href="/auth/signup" className="underline text-muted-foreground">
            Create account
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
