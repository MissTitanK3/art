"use client";

import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Button } from "@workspace/ui/components/button";
import AddShiftDrawer from "@workspace/ui/components/client/shifts/AddShiftDrawer";
import ShiftCard from "@workspace/ui/components/client/shifts/ShiftCard";
import type { DispatchShift } from "@workspace/store/dispatchRosterStore";
import { Plus } from "lucide-react";

export type DispatchShiftsLayoutProps = {
  shifts: DispatchShift[];
  activeShifts: DispatchShift[];
  upcomingShifts: DispatchShift[];
  onCreateShift?: () => void;
  addDrawerOpen: boolean;
  onAddDrawerChange: (open: boolean) => void;
  loadingMessage?: React.ReactNode;
};

export function DispatchShiftsLayout({
  shifts,
  activeShifts,
  upcomingShifts,
  onCreateShift,
  addDrawerOpen,
  onAddDrawerChange,
  loadingMessage,
}: DispatchShiftsLayoutProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="sticky top-14 z-10 mb-3 border-b bg-background px-4 py-3">
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold">Dispatch Shifts</h2>
            <p className="text-xs text-muted-foreground">{shifts.length} total shifts registered</p>
          </div>
          <div>
            <Button size="sm" variant="outline" className="mt-2 sm:mt-0" onClick={onCreateShift ?? (() => onAddDrawerChange(true))}>
              <Plus className="mr-2" /> New Shift
            </Button>
          </div>
        </div>
      </div>

      {loadingMessage ? (
        <p className="px-4 text-sm text-muted-foreground">{loadingMessage}</p>
      ) : null}

      <Tabs defaultValue="active" className="flex flex-1 flex-col">
        <TabsList className="mb-3 flex w-full">
          <TabsTrigger value="active" className="flex-1">
            Active
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="flex-1">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="all" className="flex-1">
            All
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="flex-1 overflow-y-auto">
          {activeShifts.length === 0 ? (
            <p className="p-4 text-muted-foreground">No active shifts.</p>
          ) : (
            <div className="space-y-3 p-4">
              {activeShifts.map((shift) => (
                <ShiftCard key={shift.id} shift={shift} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="flex-1 overflow-y-auto">
          {upcomingShifts.length === 0 ? (
            <p className="p-4 text-muted-foreground">No upcoming shifts.</p>
          ) : (
            <div className="space-y-3 p-4">
              {upcomingShifts.map((shift) => (
                <ShiftCard key={shift.id} shift={shift} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all" className="flex-1 overflow-y-auto">
          {shifts.length === 0 ? (
            <p className="p-4 text-muted-foreground">No shifts registered.</p>
          ) : (
            <div className="space-y-3 p-4">
              {shifts.map((shift) => (
                <ShiftCard key={shift.id} shift={shift} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AddShiftDrawer open={addDrawerOpen} onOpenChange={onAddDrawerChange} />
    </div>
  );
}

export default DispatchShiftsLayout;
