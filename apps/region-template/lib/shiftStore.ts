// lib/shiftStore.ts
import { Shift } from '@workspace/ui/components/client/shifts/shifts';
import { create } from 'zustand';

type ShiftStore = {
  shifts: Shift[];
  addShift: (shift: Shift) => void;
  updateShift: (id: string, data: Partial<Shift>) => void;
  removeShift: (id: string) => void;
};

export const useShiftStore = create<ShiftStore>((set) => ({
  shifts: [],
  addShift: (shift) => set((s) => ({ shifts: [...s.shifts, shift] })),
  updateShift: (id, data) =>
    set((s) => ({
      shifts: s.shifts.map((sh) => (sh.id === id ? { ...sh, ...data } : sh)),
    })),
  removeShift: (id) =>
    set((s) => ({
      shifts: s.shifts.filter((sh) => sh.id !== id),
    })),
}));
