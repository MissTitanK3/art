"use client";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/primitives/tabs";
import { Button } from "@workspace/ui/primitives/button";
import AddShiftDrawer from "@workspace/ui/patterns/features/shifts/add-shift-drawer";
import ShiftCard from "@workspace/ui/patterns/features/shifts/shift-card";
import type { DispatchShift } from "@workspace/store/useDispatchStore";
import type { Pod, RosterEntry } from "@workspace/store/types/pod.ts";
import { Plus } from "lucide-react";
export type DispatchShiftsLayoutProps = {
  shifts: DispatchShift[];
  activeShifts: DispatchShift[];
  upcomingShifts: DispatchShift[];
  pods: Pod[];
  roster: RosterEntry[];
  onRemoveShift: (shiftId: string) => void;
  onAddShift: (shift: Omit<DispatchShift, "id">) => void;
  onUpdateShift: (id: string, updates: Partial<DispatchShift>) => void;
  isShiftActive: (shift: DispatchShift) => boolean;
  onCreateShift?: () => void;
  addDrawerOpen: boolean;
  onAddDrawerChange: (open: boolean) => void;
  loadingMessage?: React.ReactNode;
  // Optional: fetch members for the selected pod from the app's data layer
  getVolunteersForPod?: (
    podId: string,
  ) => Promise<import("@workspace/store/types/pod.ts").RosterEntry[]>;
};
export function DispatchShiftsLayout({
  shifts,
  activeShifts,
  upcomingShifts,
  pods,
  roster,
  onRemoveShift,
  onAddShift,
  onUpdateShift,
  isShiftActive,
  onCreateShift,
  addDrawerOpen,
  onAddDrawerChange,
  loadingMessage,
  getVolunteersForPod,
}: DispatchShiftsLayoutProps) {
  return (
    <div className="flex h-full flex-col overflow-y-hidden">
      <div className="sticky top-14 z-10 mb-3 border-b bg-background px-4">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold">Dispatch Shifts</h2>
            <p className="text-xs text-muted-foreground">
              {shifts.length} total shifts registered
            </p>
          </div>
          <div>
            <Button
              size="sm"
              variant="outline"
              className="mt-2 sm:mt-0"
              onClick={onCreateShift ?? (() => onAddDrawerChange(true))}
            >
              <Plus className="mr-2" /> New Shift
            </Button>
          </div>
        </div>
      </div>

      {loadingMessage ? (
        <p className="px-4 text-sm text-muted-foreground">{loadingMessage}</p>
      ) : null}

      <Tabs
        defaultValue="active"
        className="flex flex-1 flex-col mt-14 overflow-hidden lg:mt-14"
      >
        <TabsList className="mb-3 grid w-full shrink-0 grid-cols-3 gap-2 border-b border-border bg-background/60 p-1">
          <TabsTrigger
            value="active"
            className="flex-1 rounded-md border border-transparent data-[state=active]:border-input data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            Active
          </TabsTrigger>
          <TabsTrigger
            value="upcoming"
            className="flex-1 rounded-md border border-transparent data-[state=active]:border-input data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            Upcoming
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="flex-1 rounded-md border border-transparent data-[state=active]:border-input data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
          >
            All
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="flex-1 overflow-y-auto min-h-0">
          {activeShifts.length === 0 ? (
            <p className="p-4 text-muted-foreground">No active shifts.</p>
          ) : (
            <div className="space-y-3 p-4">
              {activeShifts.map((shift) => (
                <ShiftCard
                  key={shift.id}
                  shift={shift}
                  pods={pods}
                  roster={roster}
                  onRemoveShift={onRemoveShift}
                  onUpdateShift={onUpdateShift}
                  isShiftActive={isShiftActive}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent
          value="upcoming"
          className="flex-1 overflow-y-auto min-h-0"
        >
          {upcomingShifts.length === 0 ? (
            <p className="p-4 text-muted-foreground">No upcoming shifts.</p>
          ) : (
            <div className="space-y-3 p-4">
              {upcomingShifts.map((shift) => (
                <ShiftCard
                  key={shift.id}
                  shift={shift}
                  pods={pods}
                  roster={roster}
                  onRemoveShift={onRemoveShift}
                  onUpdateShift={onUpdateShift}
                  isShiftActive={isShiftActive}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="flex-1 overflow-y-auto min-h-0">
          {shifts.length === 0 ? (
            <p className="p-4 text-muted-foreground">No shifts registered.</p>
          ) : (
            <div className="space-y-3 p-4">
              {shifts.map((shift) => (
                <ShiftCard
                  key={shift.id}
                  shift={shift}
                  pods={pods}
                  roster={roster}
                  onRemoveShift={onRemoveShift}
                  onUpdateShift={onUpdateShift}
                  isShiftActive={isShiftActive}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddShiftDrawer
        open={addDrawerOpen}
        onOpenChange={onAddDrawerChange}
        pods={pods}
        roster={roster}
        onSubmit={onAddShift}
        getVolunteersForPod={getVolunteersForPod}
      />
    </div>
  );
}
export default DispatchShiftsLayout;
