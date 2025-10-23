import { loadClientAdapter } from "./adapter";
import type { AuthClientAdapter } from "./types";

let clientPromise: Promise<AuthClientAdapter> | null = null;

export async function getAuthClient(): Promise<AuthClientAdapter> {
  if (!clientPromise) {
    clientPromise = loadClientAdapter();
  }
  return clientPromise;
}
