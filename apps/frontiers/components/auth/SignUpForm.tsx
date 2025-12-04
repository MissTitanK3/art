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

export function SignUpForm({ embedded = false }: { embedded?: boolean }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  return (
    <Card className="max-w-sm w-full">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>Join the Verse and link your ship.</CardDescription>
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
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="confirm">Confirm password</Label>
            <PasswordInput
              value={confirm}
              onChange={setConfirm}
              name="confirm"
              autoComplete="new-password"
            />
          </div>
          {error ? (
            <p className="text-xs text-destructive/80">{error}</p>
          ) : null}
          <Button className="w-full" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </Button>
          {sent ? (
            <p className="text-xs text-green-600 dark:text-green-400">
              Check your email to confirm your account.
            </p>
          ) : null}
        </form>
      </CardContent>
      {!embedded && (
        <CardFooter className="text-xs">
          Already have an account ?
          <Link href="/auth/signin" className="underline text-muted-foreground">
            Sign in
          </Link>
        </CardFooter>
      )}
    </Card>
  );
}
