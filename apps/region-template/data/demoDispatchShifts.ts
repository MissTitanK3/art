import { DispatchShift } from '@workspace/store/useDispatchStore';

const now = new Date();
const oneHour = 60 * 60 * 1000;

export const demoDispatchShifts: DispatchShift[] = [
  {
    id: 'r1',
    podId: 'c3f7b0dc-6c2a-4a9f-82c5-001',
    volunteerId: 'r1',
    startsAt: new Date(now.getTime() - oneHour).toISOString(),
    endsAt: new Date(now.getTime() + oneHour).toISOString(),
    notes: 'Covering morning dispatch',
  },
  {
    id: 'r2',
    podId: '7d1d1c9f-3a22-47e2-9b0f-002',
    volunteerId: 'r3',
    startsAt: new Date(now.getTime() + oneHour).toISOString(),
    endsAt: new Date(now.getTime() + 3 * oneHour).toISOString(),
    notes: 'Scheduled afternoon shift',
  },
  {
    id: 'r3',
    podId: 'a2b94fbe-91b1-4b6a-9923-003',
    volunteerId: 'r5',
    startsAt: new Date(now.getTime() + 4 * oneHour).toISOString(),
    endsAt: new Date(now.getTime() + 6 * oneHour).toISOString(),
    notes: 'Evening coverage',
  },
];
