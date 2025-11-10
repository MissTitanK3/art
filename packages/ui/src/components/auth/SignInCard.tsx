"use client";

import * as React from "react";
import { Button } from "../button";
import { Input } from "../input";
import { Label } from "../label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../card";

export type SignInSubmit = (
  email: string,
  password: string,
) => Promise<void> | void;

export interface SignInCardProps {
  onSubmit: SignInSubmit;
  pendingText?: string;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
}

export function SignInCard({
  onSubmit,
  pendingText = "Signing in…",
  title = "Sign in",
  description = "Use your email and password to sign in.",
  footer,
}: SignInCardProps) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, setPending] = React.useState(false);

  const handleSubmit = React.useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setPending(true);
      try {
        await onSubmit(email.trim(), password);
      } catch (err: any) {
        setError(err?.message ?? "Failed to sign in");
      } finally {
        setPending(false);
      }
    },
    [email, password, onSubmit],
  );

  return (
    <Card className="mx-auto mt-12 w-full max-w-md border-border/60 bg-background/95 backdrop-blur">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-1">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <button
                type="button"
                className="text-xs text-muted-foreground underline"
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error ? (
            <div className="text-sm text-destructive">{error}</div>
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? pendingText : "Sign in"}
          </Button>
        </form>
      </CardContent>
      {footer ? (
        <CardFooter className="justify-between">{footer}</CardFooter>
      ) : null}
    </Card>
  );
}

export default SignInCard;
