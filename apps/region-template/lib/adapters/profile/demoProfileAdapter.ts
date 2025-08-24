// apps/region-template/lib/adapters/demoProfileAdapter.ts

import { ProfileAdapter } from '@workspace/store/types/profile.ts';

let DEMO_PROFILE: any | null = {
  id: 'demo-1',
  user_id: '',
  display_name: 'Demo User',
  access_role: 'dispatcher_basic',
  verified_by: 'self',
  field_roles: ['translator', 'logistics'],
  state: 'active',
  availability: true,
  self_risk_acknowledged: false,
  affiliation: 'Always Ready Tools',
  contact_signal: '@demo_user',
  coordination_zone: 'PNW-Region-1',
  city: 'Seattle',
  weekly_availability: { blocks: {} },
  coverage_zones: ['Seattle', 'Tacoma'],
  operating_counties: [],
  inserted_at: '',
};

export const demoProfileAdapter: ProfileAdapter = {
  async loadProfile() {
    return DEMO_PROFILE;
  },
  async saveProfile(profile) {
    DEMO_PROFILE = profile;
  },
  async deleteProfile() {
    DEMO_PROFILE = null;
  },
};
