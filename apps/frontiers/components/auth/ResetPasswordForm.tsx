"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@workspace/ui/components/button";
import { Label } from "@workspace/ui/components/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { PasswordInput } from "./PasswordInput";

export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  // Ensure we have a session from the recovery link
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        // Attempt to pick up session from hash parameters is handled internally by supabase-js
        // If still no session, the user needs to click the email link again
      }
    });
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else setOk(true);
  };

  return (
    <Card className="max-w-sm w-full">
      <CardHeader>
        <CardTitle>Set new password</CardTitle>
        <CardDescription>Enter a strong, unique password.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1">
            <Label>New password</Label>
            <PasswordInput
              value={password}
              onChange={setPassword}
              name="new-password"
              autoComplete="new-password"
            />
          </div>
          <div className="space-y-1">
            <Label>Confirm password</Label>
            <PasswordInput
              value={confirm}
              onChange={setConfirm}
              name="confirm-password"
              autoComplete="new-password"
            />
          </div>
          {error ? (
            <p className="text-xs text-destructive/80">{error}</p>
          ) : null}
          <Button className="w-full">Update password</Button>
          {ok ? (
            <p className="text-xs text-green-600 dark:text-green-400">
              Password updated. You can now continue.
            </p>
          ) : null}
        </form>
      </CardContent>
      <CardFooter />
    </Card>
  );
}
