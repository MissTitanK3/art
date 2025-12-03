import * as React from "react";
import { Button } from "./button";

export interface TeleprompterHeaderProps {
  onImportOpen: () => void;
  onSettingsOpen: () => void;
  onToggleLegend: () => void;
  showLegend: boolean;
  onToggleFullscreen: () => void;
  fullscreen: boolean;
  onToggleMobileControls: () => void;
  mobileControlsVisible: boolean;
}

export function TeleprompterHeader({
  onImportOpen,
  onSettingsOpen,
  onToggleLegend,
  showLegend,
  onToggleFullscreen,
  fullscreen,
  onToggleMobileControls,
  mobileControlsVisible,
}: TeleprompterHeaderProps) {
  return (
    <div className="flex flex-col gap-2 md:items-center md:justify-between">
      <h1 className="text-2xl font-semibold">Teleprompter</h1>
      <hr className="border-t border-gray-200" />
      <div className="grid w-full md:flex-1 grid-cols-2 md:grid-cols-4 gap-2">
        <Button className="w-full" variant="outline" onClick={onImportOpen}>
          Load Script
        </Button>
        <Button className="w-full" variant="outline" onClick={onToggleLegend}>
          {showLegend ? "Hide Cues" : "Show Cues"}
        </Button>
        <Button
          className="w-full"
          variant="outline"
          onClick={onToggleFullscreen}
        >
          {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </Button>
        <Button className="w-full" variant="outline" onClick={onSettingsOpen}>
          Settings
        </Button>
        <Button
          className="w-full md:hidden"
          variant="outline"
          onClick={onToggleMobileControls}
        >
          {mobileControlsVisible ? "Hide Controls" : "Show Controls"}
        </Button>
      </div>
    </div>
  );
}
