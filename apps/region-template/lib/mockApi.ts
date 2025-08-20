import { useAppStore } from './store';
import type { Dispatch, Id, Volunteer } from './types';

const delay = (ms = 250) => new Promise((r) => setTimeout(r, ms));
const maybeFail = (rate = 0.01) => {
  if (Math.random() < rate) throw new Error('Demo network hiccup');
};

export const MockApi = {
  async listDispatches(): Promise<Dispatch[]> {
    await delay();
    maybeFail();
    return Object.values(useAppStore.getState().dispatches);
  },
  async assignVolunteer(dispatchId: Id, _vol: Volunteer) {
    await delay(150);
    maybeFail();
    const s = useAppStore.getState();
    s.updateDispatch(dispatchId, { status: 'assigned' });
    return s.dispatches[dispatchId];
  },
  async reset(scenario?: string) {
    useAppStore.getState().resetAll(scenario);
    await delay(50);
  },
};
