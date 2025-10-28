import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/auth/supabase/server';

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  try {
    await supabase.auth.signOut();
  } catch {}
  return NextResponse.redirect(new URL('/sign-in', request.url));
}
