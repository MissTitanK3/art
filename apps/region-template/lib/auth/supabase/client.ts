// apps/region-template/lib/auth/supabase/client.ts
'use client';

// Compatibility shim: several components import from "@/lib/auth/supabase/client"
// but the actual implementation lives at "@/lib/supabase/client".
// Re-export to keep both paths working.
export { getSupabaseBrowserClient } from '@/lib/supabase/client';
