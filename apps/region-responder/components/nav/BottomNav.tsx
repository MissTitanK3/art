"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MapPinned, NotebookPen } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";

const NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Responses", href: "/region-response", icon: MapPinned },
  { label: "Intakes", href: "/intake", icon: NotebookPen },
];

export function BottomNav() {
  const pathname = usePathname() || "/";

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="mx-auto grid max-w-3xl grid-cols-3">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col h-14 items-center justify-center border-r last:border-r-0 text-sm font-semibold transition-colors gap-2",
                isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
