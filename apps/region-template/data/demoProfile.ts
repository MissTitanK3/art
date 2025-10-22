import { fakeUUID } from '@workspace/ui/lib/utils';
import type { Profile } from '@workspace/store/types/global.ts';

export function createDemoProfile(): Profile {
  return {
    id: fakeUUID(),
    user_id: fakeUUID(),
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
    inserted_at: new Date().toISOString(),
  };
}
