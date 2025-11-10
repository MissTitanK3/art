"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navbar";

export function NavbarGate() {
  const pathname = usePathname();
  // Hide global navbar on the fullscreen map (home route)
  if (pathname === "/") return null;
  return <Navbar />;
}
