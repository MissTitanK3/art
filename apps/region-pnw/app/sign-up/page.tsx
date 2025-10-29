import type { Metadata } from "next";
import { SignUpCard } from "@/components/client/auth/SignUpCard";

export const metadata: Metadata = {
  title: "Sign up",
};

export default async function SignUpPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl flex-col px-4 pb-12 pt-6">
      <SignUpCard />
    </main>
  );
}

