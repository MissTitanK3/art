import type { NextRequest } from 'next/server';
import { updateSession } from './lib/auth/supabase/middleware';

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

// Exclude Next.js internals and static assets
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg)).*)'],
};
