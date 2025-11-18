"use client";

import { Card } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Switch } from "@workspace/ui/components/switch";
import { Filter } from "lucide-react";
import {
  CalendarOrgSummary,
  CalendarPodSummary,
  CalendarVisibility,
} from "./CollectiveCalendarShared";

type CollectiveCalendarFiltersProps = {
  organizations: CalendarOrgSummary[];
  pods: CalendarPodSummary[];
  selectedOrg: string;
  onSelectedOrgChange: (value: string) => void;
  selectedPod: string;
  onSelectedPodChange: (value: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  visibilityFilter: CalendarVisibility | "all";
  onVisibilityFilterChange: (value: CalendarVisibility | "all") => void;
  timeRange: "today" | "week" | "month";
  onTimeRangeChange: (value: "today" | "week" | "month") => void;
  needsCrewOnly: boolean;
  onNeedsCrewOnlyChange: (value: boolean) => void;
  myOnly: boolean;
  onMyOnlyChange: (value: boolean) => void;
};

export function CollectiveCalendarFilters({
  organizations,
  pods,
  selectedOrg,
  onSelectedOrgChange,
  selectedPod,
  onSelectedPodChange,
  search,
  onSearchChange,
  visibilityFilter,
  onVisibilityFilterChange,
  timeRange,
  onTimeRangeChange,
  needsCrewOnly,
  onNeedsCrewOnlyChange,
  myOnly,
  onMyOnlyChange,
}: CollectiveCalendarFiltersProps) {
  return (
    <Card className="border-dashed">
      <div className="flex items-center gap-2 border-b px-3 py-2 text-sm font-semibold">
        <Filter className="h-4 w-4" />
        Filters
      </div>
      <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 md:grid-cols-3">
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Organization</p>
          <Select value={selectedOrg} onValueChange={onSelectedOrgChange}>
            <SelectTrigger>
              <SelectValue placeholder="All organizations" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All organizations</SelectItem>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                  {org.role ? ` — ${org.role}` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Pod</p>
          <Select value={selectedPod} onValueChange={onSelectedPodChange}>
            <SelectTrigger>
              <SelectValue placeholder="All pods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All pods</SelectItem>
              {pods.map((pod) => (
                <SelectItem key={pod.id} value={pod.id}>
                  {pod.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Shift type / label</p>
          <Input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Watch, patrol, etc."
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Visibility</p>
          <Select
            value={visibilityFilter}
            onValueChange={(v) => onVisibilityFilterChange(v as any)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All visibility</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="org">Org only</SelectItem>
              <SelectItem value="private">Pod only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Time range</p>
          <Select
            value={timeRange}
            onValueChange={(v) => onTimeRangeChange(v as any)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Needs crew only</p>
            <p className="text-xs text-muted-foreground">
              Hide shifts without open requests
            </p>
          </div>
          <Switch
            checked={needsCrewOnly}
            onCheckedChange={(v) => onNeedsCrewOnlyChange(Boolean(v))}
          />
        </div>
        <div className="flex items-center justify-between rounded-md border px-3 py-2">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">My shifts</p>
            <p className="text-xs text-muted-foreground">
              Show signups and pods you belong to
            </p>
          </div>
          <Switch
            checked={myOnly}
            onCheckedChange={(v) => onMyOnlyChange(Boolean(v))}
          />
        </div>
      </div>
    </Card>
  );
}
