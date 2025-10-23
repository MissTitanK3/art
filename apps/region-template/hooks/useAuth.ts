"use client";

import { useAuthContext } from "@/providers/AuthProvider";

export function useAuth() {
  return useAuthContext();
}

export function useAuthUser() {
  const { user } = useAuthContext();
  return user;
}
