import { useProfileStore, Profile } from './profileStore';

export async function upsertMyProfileDummy(profile: Partial<Profile>) {
  // merge with existing
  const current = useProfileStore.getState().profile ?? { id: 'demo-1' };
  const updated: Profile = { ...current, ...profile } as Profile;
  useProfileStore.getState().setProfile(updated);
  console.log('Saved dummy profile:', updated);
  return { ok: true };
}
