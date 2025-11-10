"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function RedirectToSignIn() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = searchParams?.toString() ?? "";
  const current = pathname + (query ? `?${query}` : "");
  const target = `/sign-in?redirectTo=${encodeURIComponent(current)}`;

  useEffect(() => {
    router.replace(target);
  }, [router, target]);

  return null;
}
