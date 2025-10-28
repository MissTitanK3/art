import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/server";
import { SignInCard } from "@/components/client/auth/SignInCard";

export const metadata: Metadata = {
  title: "Sign in",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SignInPage() {
  const session = await getServerSession();
  if (session) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl flex-col px-4 pb-12 pt-6">
      <Suspense fallback={null}>
        <SignInCard />
      </Suspense>
    </main>
  );
}
