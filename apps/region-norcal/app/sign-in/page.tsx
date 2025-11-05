import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { SignInCard } from "@/components/client/auth/SignInCard";

export const metadata: Metadata = {
  title: "Sign in",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SignInPage({
  searchParams,
}: {
  // Next.js 15 passes searchParams as a Promise
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const supabase = await createSupabaseServerClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (userRes?.user) {
    const redirectTo = Array.isArray(sp?.redirectTo)
      ? sp?.redirectTo?.[0]
      : sp?.redirectTo;
    const target = (redirectTo && typeof redirectTo === "string")
      ? redirectTo
      : "/";
    redirect(target);
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl flex-col px-4 pb-12 pt-6">
      <Suspense fallback={null}>
        <SignInCard />
      </Suspense>
    </main>
  );
}
