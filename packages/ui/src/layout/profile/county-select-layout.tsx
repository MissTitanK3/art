"use client";

import React from "react";
import { Button } from "@workspace/ui/primitives/button";
import type { CountySelectMapProps } from "@workspace/ui/patterns/features/maps/county-select-map";
import type { SelectedCounty } from "@workspace/store/types/maps.ts";

export type CountySelectLayoutProps = {
  profileMissing: boolean;
  noProfileContent?: React.ReactNode;
  selectedCounties: SelectedCounty[];
  activeCounty: SelectedCounty | null;
  onMapChange: (next: SelectedCounty[]) => void;
  onToggleEditCounty: (county: SelectedCounty) => void;
  onRemoveCounty: (geoId: string) => void;
  onUpdateZones: (geoId: string, zones: number[]) => void;
  onDone: (event?: React.MouseEvent) => void;
  isSaving: boolean;
  MapComponent?: React.ComponentType<CountySelectMapProps>;
  mapProps?: Omit<CountySelectMapProps, "selected" | "onChange" | "editor">;
  loadingMessage?: React.ReactNode;
};

export function CountySelectLayout({
  profileMissing,
  noProfileContent,
  selectedCounties,
  activeCounty,
  onMapChange,
  onToggleEditCounty,
  onRemoveCounty,
  onUpdateZones,
  onDone,
  isSaving,
  MapComponent,
  mapProps,
  loadingMessage,
}: CountySelectLayoutProps) {
  if (profileMissing) {
    return (
      <div className="mx-auto max-w-2xl rounded-lg border p-6">
        {noProfileContent ?? (
          <>
            <h2 className="mb-1 text-lg font-semibold">No profile found</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Restore your demo profile first, then pick counties.
            </p>
          </>
        )}
      </div>
    );
  }

  const countyList = selectedCounties.map((county, index) => (
    <div
      key={county.GEO_ID}
      className="mb-10 space-y-2 rounded border p-3 text-sm"
    >
      <div className="flex h-full w-full flex-col items-center justify-evenly gap-3 md:flex-row md:justify-between">
        <div className="font-medium">
          <span className="text-xs font-mono text-muted-foreground">
            #{index + 1}
          </span>{" "}
          {county.NAME} County
        </div>
        {Array.isArray(county.ZONE) && county.ZONE.length > 0 ? (
          <div className="text-xs text-blue-600">
            Partial coverage: {county.ZONE.length} zone
            {county.ZONE.length > 1 ? "s" : ""}
          </div>
        ) : null}
        <div className="mt-3 flex items-center gap-3">
          <Button onClick={() => onToggleEditCounty(county)}>
            {activeCounty?.GEO_ID === county.GEO_ID
              ? "Done Editing"
              : "Edit Zones"}
          </Button>
          <Button
            onClick={() => onRemoveCounty(county.GEO_ID)}
            variant="destructive"
          >
            Remove
          </Button>
        </div>
      </div>
    </div>
  ));

  return (
    <div className="z-0 flex flex-col gap-4">
      <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
        <div>
          <h1 className="text-xl font-semibold">
            Pick your operating counties
          </h1>
          <p className="text-sm text-muted-foreground">
            Click counties to toggle. Use “Edit Zones” to mark partial coverage.
          </p>
        </div>
        <div className="w-full md:w-32">
          <Button
            onClick={onDone}
            disabled={isSaving}
            aria-busy={isSaving}
            className="w-full"
          >
            {isSaving ? "Saving…" : "Done"}
          </Button>
        </div>
      </div>

      {loadingMessage ? (
        <p className="text-sm text-muted-foreground">{loadingMessage}</p>
      ) : null}

      {MapComponent ? (
        <MapComponent
          selected={selectedCounties}
          onChange={onMapChange}
          editor={
            activeCounty
              ? {
                  county: activeCounty,
                  gridSize: 20,
                  clipEdges: true,
                  onUpdateZones,
                }
              : undefined
          }
          {...mapProps}
        />
      ) : null}

      <div className="space-y-3">
        {selectedCounties.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No counties selected yet. Zoom in and click on a county to select
            it.
          </p>
        ) : (
          countyList
        )}
      </div>
    </div>
  );
}

export default CountySelectLayout;
