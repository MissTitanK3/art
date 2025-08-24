// apps/region-template/lib/adapters/supabaseProfileAdapter.ts

import { ProfileAdapter } from '@workspace/store/types/profile.ts';

// const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_KEY!
// );

// export const supabaseProfileAdapter: ProfileAdapter = {
//   async loadProfile(userId: string) {
//     const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
//     return data;
//   },
//   async saveProfile(profile) {
//     await supabase.from("profiles").upsert(profile);
//   },
//   async deleteProfile(userId: string) {
//     await supabase.from("profiles").delete().eq("id", userId);
//   },
// };
