import { addDays, addHours, startOfHour, subDays } from 'date-fns';
import {
  CalendarOrgSummary,
  CalendarPodSummary,
  CollectiveCalendarMembership,
  CollectiveCalendarShift,
} from './CollectiveCalendarShared';

const now = new Date();
const todayStart = startOfHour(now);

export const mockPods: CalendarPodSummary[] = [
  { id: 'pod-1', name: 'Alpha Squad', slug: 'alpha-squad', area: 'Downtown' },
  { id: 'pod-2', name: 'Beta Team', slug: 'beta-team', area: 'Uptown' },
  { id: 'pod-3', name: 'Gamma Group', slug: 'gamma-group', area: 'Suburbs' },
];

export const mockOrgs: CalendarOrgSummary[] = [
  { id: 'org-1', name: 'City Safety', description: 'General safety patrols', role: 'admin' },
  { id: 'org-2', name: 'Night Watch', description: 'Late night observation', role: 'member' },
  { id: 'org-3', name: 'Community Aid', description: 'Helping hands', role: null },
];

export const mockMembership: CollectiveCalendarMembership = {
  podIds: ['pod-1'],
  orgIds: ['org-1', 'org-2'],
  profileId: 'user-1',
  userId: 'user-1-uuid',
};

export const mockShifts: CollectiveCalendarShift[] = [
  // Today - Active/Upcoming
  {
    id: 'shift-1',
    start: addHours(todayStart, 2).toISOString(),
    end: addHours(todayStart, 6).toISOString(),
    tz: 'America/Los_Angeles',
    pod: mockPods[0]!,
    organizations: [mockOrgs[0]!],
    label: 'Downtown Patrol',
    location: 'Central Plaza',
    visibility: 'public',
    needed: 3,
    signups: ['user-2', 'user-3'],
    notes: 'Bring extra water.',
  },
  {
    id: 'shift-2',
    start: addHours(todayStart, 4).toISOString(),
    end: addHours(todayStart, 8).toISOString(),
    tz: 'America/Los_Angeles',
    pod: mockPods[1]!,
    organizations: [mockOrgs[1]!],
    label: 'Evening Watch',
    location: 'North Park',
    visibility: 'org',
    needed: 2,
    signups: [],
  },
  // Tomorrow
  {
    id: 'shift-3',
    start: addDays(addHours(todayStart, 10), 1).toISOString(),
    end: addDays(addHours(todayStart, 14), 1).toISOString(),
    tz: 'America/Los_Angeles',
    pod: mockPods[2]!,
    organizations: [mockOrgs[2]!],
    label: 'Community Outreach',
    location: 'Community Center',
    visibility: 'public',
    needed: 5,
    signups: ['user-1', 'user-4', 'user-5'],
  },
  // Yesterday (Past)
  {
    id: 'shift-4',
    start: subDays(addHours(todayStart, 9), 1).toISOString(),
    end: subDays(addHours(todayStart, 13), 1).toISOString(),
    tz: 'America/Los_Angeles',
    pod: mockPods[0]!,
    organizations: [mockOrgs[0]!],
    label: 'Morning Briefing',
    location: 'HQ',
    visibility: 'private',
    needed: 10,
    signups: ['user-1', 'user-2', 'user-3', 'user-4', 'user-5', 'user-6'],
  },
  // Next Week
  {
    id: 'shift-5',
    start: addDays(addHours(todayStart, 12), 5).toISOString(),
    end: addDays(addHours(todayStart, 16), 5).toISOString(),
    tz: 'America/Los_Angeles',
    pod: mockPods[1]!,
    organizations: [],
    label: 'Training Session',
    location: 'Training Grounds',
    visibility: 'org',
    needed: 20,
    signups: [],
    notes: 'Mandatory for new recruits.',
  },
];
