import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/auth/supabase/server";
import { SignUpCard } from "@/components/client/auth/SignUpCard";

export const metadata: Metadata = {
  title: "Sign up",
};

export default async function SignUpPage() {
  const supabase = await createSupabaseServerClient();
  const { data: userRes } = await supabase.auth.getUser();
  if (userRes?.user) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl flex-col px-4 pb-12 pt-6">
      <SignUpCard />
    </main>
  );
}

