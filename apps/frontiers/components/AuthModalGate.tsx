"use client";

import * as React from "react";
import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/primitives/button";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { ResetPasswordRequestForm } from "@/components/auth/ResetPasswordRequestForm";

export function AuthModalGate() {
  const { status } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mode, setMode] = React.useState<"signin" | "signup" | "forgot">(
    "signin"
  );

  // Only show once auth status is known and user is unauthenticated
  const onAuthRoute = pathname?.startsWith("/auth");
  const onPublicRoute = pathname?.startsWith("/ship-demo");
  const open = status === "unauthenticated" && !onAuthRoute && !onPublicRoute;

  // Redirect to home when authenticated
  React.useEffect(() => {
    if (status === "authenticated") {
      if (pathname !== "/" && !pathname?.startsWith("/ship-demo"))
        router.push("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        /* locked until authenticated */
      }}
    >
      <DialogContent
        className="sm:max-w-md bg-card text-card-foreground p-6 rounded-lg shadow-lg"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>
            {mode === "signin" && "Welcome back"}
            {mode === "signup" && "Create your account"}
            {mode === "forgot" && "Reset password"}
          </DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 mb-4">
          <Button
            size="sm"
            variant={mode === "signin" ? "default" : "secondary"}
            onClick={() => setMode("signin")}
          >
            Sign in
          </Button>
          <Button
            size="sm"
            variant={mode === "signup" ? "default" : "secondary"}
            onClick={() => setMode("signup")}
          >
            Sign up
          </Button>
          <div className="ml-auto">
            {mode !== "forgot" && (
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => setMode("forgot")}
              >
                Forgot?
              </Button>
            )}
            {mode === "forgot" && (
              <Button
                size="sm"
                variant="ghost"
                className="text-xs"
                onClick={() => setMode("signin")}
              >
                Back
              </Button>
            )}
          </div>
        </div>
        {mode === "signin" && (
          <SignInForm embedded onForgot={() => setMode("forgot")} />
        )}
        {mode === "signup" && <SignUpForm embedded />}
        {mode === "forgot" && <ResetPasswordRequestForm />}
      </DialogContent>
    </Dialog>
  );
}
