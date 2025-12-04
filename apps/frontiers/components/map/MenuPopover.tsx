"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/primitives/popover";
import { Button } from "@workspace/ui/primitives/button";
import { Menu as MenuIcon } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export function MenuPopover({
  session,
  isMobile,
}: {
  session: any;
  isMobile: boolean;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="secondary"
          className="shadow-md"
          aria-label="Menu"
          title="Menu"
        >
          <MenuIcon className="w-4 h-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side={isMobile ? "top" : "right"}
        align={isMobile ? "start" : "start"}
        sideOffset={8}
        className="w-[min(100vw-1rem,14rem)] sm:w-[14rem] p-2"
      >
        <div className="flex flex-col gap-2 text-sm">
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="justify-start"
          >
            <Link href="/fleet">Fleet & Crew</Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="justify-start"
          >
            <Link href="/ledger">Donation Ledger</Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="justify-start"
          >
            <Link href="/seasons">Seasons</Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant="secondary"
            className="justify-start"
          >
            <Link href="/profile">Profile</Link>
          </Button>
          <div className="h-px bg-border my-1" />
          {!session ? (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/signin"
                className="underline text-muted-foreground"
              >
                Sign in
              </Link>
              <span className="text-muted-foreground/50">/</span>
              <Link
                href="/auth/signup"
                className="underline text-muted-foreground"
              >
                Sign up
              </Link>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => supabase.auth.signOut()}
            >
              Sign out
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
