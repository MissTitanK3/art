import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/server";
import { SignUpCard } from "@/components/client/auth/SignUpCard";

export const metadata: Metadata = {
  title: "Sign up",
};

export default async function SignUpPage() {
  const session = await getServerSession();
  if (session) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl flex-col px-4 pb-12 pt-6">
      <SignUpCard />
    </main>
  );
}
