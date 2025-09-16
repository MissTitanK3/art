"use client";

import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@workspace/ui/components/tabs";
import { useDispatchRosterStore } from "@workspace/store/dispatchRosterStore";
import { Button } from "@workspace/ui/components/button";
import AddShiftDrawer from "@workspace/ui/components/client/shifts/AddShiftDrawer";
import ShiftCard from "@workspace/ui/components/client/shifts/ShiftCard";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function DispatchShiftsDataLayer() {
  const shifts = useDispatchRosterStore((s) => s.shifts);
  const activeShifts = useDispatchRosterStore((s) => s.getActiveShifts());
  const getUpcomingShifts = useDispatchRosterStore((s) => s.getUpcomingShifts);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col h-full" suppressHydrationWarning>
      <div className="sticky top-14 z-10 mb-3 bg-background border-b px-4 py-3">
        <div className="flex items-center justify-between flex-col sm:flex-row gap-2">
          <div>
            <h2 className="text-lg font-bold">Dispatch Shifts</h2>
            <p className="text-xs text-muted-foreground">
              {shifts.length} total shifts registered
            </p>
          </div>
          <div>
            <Button size="sm" variant="outline" className="mt-2" onClick={() => setOpen(true)}>
              <Plus className="mr-2" /> New Shift
            </Button>
            <AddShiftDrawer open={open} onOpenChange={setOpen} />
          </div>
        </div>
      </div>

      <Tabs defaultValue="active" className="flex-1 flex flex-col">
        <TabsList className="flex w-full mb-3">
          <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
          <TabsTrigger value="upcoming" className="flex-1">Upcoming</TabsTrigger>
          <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
        </TabsList>

        {/* Active */}
        <TabsContent value="active" className="flex-1 overflow-y-auto">
          {activeShifts.length === 0 ? (
            <p className="text-muted-foreground p-4">No active shifts.</p>
          ) : (
            <div className="space-y-3 p-4">
              {activeShifts.map((s) => (
                <ShiftCard key={s.id} shift={s} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Upcoming */}
        <TabsContent value="upcoming" className="flex-1 overflow-y-auto">
          {getUpcomingShifts(24).length === 0 ? (
            <p className="text-muted-foreground p-4">No upcoming shifts.</p>
          ) : (
            <div className="space-y-3 p-4">
              {getUpcomingShifts(24).map((s) => (
                <ShiftCard key={s.id} shift={s} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* All */}
        <TabsContent value="all" className="flex-1 overflow-y-auto">
          {shifts.length === 0 ? (
            <p className="text-muted-foreground p-4">No shifts registered.</p>
          ) : (
            <div className="space-y-3 p-4">
              {shifts.map((s) => (
                <ShiftCard key={s.id} shift={s} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
