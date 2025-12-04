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

export function ResetPasswordRequestForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const redirectTo = `${location.origin}/auth/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <Card className="max-w-sm w-full">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>Request a password reset link.</CardDescription>
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
          {error ? (
            <p className="text-xs text-destructive/80">{error}</p>
          ) : null}
          <Button className="w-full">Send link</Button>
          {sent ? (
            <p className="text-xs text-green-600 dark:text-green-400">
              Check your email for the reset link.
            </p>
          ) : null}
        </form>
      </CardContent>
      <CardFooter />
    </Card>
  );
}
