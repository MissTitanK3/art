"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@workspace/ui/primitives/button";
import { ArrowLeft } from "lucide-react";

export default function AdminBackButton() {
  const pathname = usePathname();
  if (!pathname || pathname === "/admin") return null;
  // Hide on advocacy groups admin page which has its own navigation
  if (pathname.startsWith("/admin/advocacy-groups")) return null;

  return (
    <div className="mb-4">
      <Button asChild variant="ghost" size="sm">
        <Link href="/admin">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Admin
        </Link>
      </Button>
    </div>
  );
}
