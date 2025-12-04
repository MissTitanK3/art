"use client";

import * as React from "react";
import { Button } from "@workspace/ui/primitives/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/primitives/select";
import {
  SPEED_PRESETS,
  closestSpeedPresetId,
  PresetId,
} from "@workspace/ui/lib/teleprompter";

export type TeleprompterSettingsProps = {
  fontFace: "sans" | "serif" | "mono" | "dyslexic";
  onFontFaceChange: (v: "sans" | "serif" | "mono" | "dyslexic") => void;

  preset: PresetId;
  onPresetChange: (v: PresetId) => void;

  customTextColor: string;
  onCustomTextColorChange: (v: string) => void;
  customBgColor: string;
  onCustomBgColorChange: (v: string) => void;
  customHighlightColor: string;
  onCustomHighlightColorChange: (v: string) => void;

  overlayColor: string;
  overlayOpacity: number;
  onOverlayColorChange: (v: string) => void;
  onOverlayOpacityChange: (v: number) => void;

  onResetKeyboardHint: () => void;

  defaultSpeed: number;
  onDefaultSpeedChange: (v: number) => void;
  onApplyDefaultSpeed: () => void;
  onResetDefaultSpeed: () => void;

  fontSize: string;
  onFontSizeChange: (v: string) => void;
  lineHeight: string;
  onLineHeightChange: (v: string) => void;
  mirrorH: boolean;
  onMirrorHChange: (v: boolean) => void;
  mirrorV: boolean;
  onMirrorVChange: (v: boolean) => void;
};

export default function TeleprompterSettings(props: TeleprompterSettingsProps) {
  const {
    fontFace,
    onFontFaceChange,
    preset,
    onPresetChange,
    customTextColor,
    onCustomTextColorChange,
    customBgColor,
    onCustomBgColorChange,
    customHighlightColor,
    onCustomHighlightColorChange,
    overlayColor,
    overlayOpacity,
    onOverlayColorChange,
    onOverlayOpacityChange,
    onResetKeyboardHint,
    defaultSpeed,
    onDefaultSpeedChange,
    onApplyDefaultSpeed,
    onResetDefaultSpeed,
    fontSize,
    onFontSizeChange,
    lineHeight,
    onLineHeightChange,
    mirrorH,
    onMirrorHChange,
    mirrorV,
    onMirrorVChange,
  } = props;

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <div className="text-sm font-medium">Font face</div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={fontFace === "sans" ? "secondary" : "outline"}
            onClick={() => onFontFaceChange("sans")}
          >
            Sans
          </Button>
          <Button
            variant={fontFace === "serif" ? "secondary" : "outline"}
            onClick={() => onFontFaceChange("serif")}
          >
            Serif
          </Button>
          <Button
            variant={fontFace === "mono" ? "secondary" : "outline"}
            onClick={() => onFontFaceChange("mono")}
          >
            Mono
          </Button>
          <Button
            variant={fontFace === "dyslexic" ? "secondary" : "outline"}
            onClick={() => onFontFaceChange("dyslexic")}
          >
            Dyslexia-friendly
          </Button>
        </div>
      </div>

      <div className="grid gap-2">
        <div className="text-sm font-medium">Theme</div>
        <div className="flex items-center gap-2">
          <Select
            value={preset}
            onValueChange={(v) => onPresetChange(v as PresetId)}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Preset" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="briefing">Briefing</SelectItem>
              <SelectItem value="studio">Studio</SelectItem>
              <SelectItem value="night">Night</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          {preset === "custom" && (
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                <span>Text</span>
                <input
                  type="color"
                  value={customTextColor}
                  onChange={(e) => onCustomTextColorChange(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>Background</span>
                <input
                  type="color"
                  value={customBgColor}
                  onChange={(e) => onCustomBgColorChange(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span>Highlight</span>
                <input
                  type="color"
                  value={customHighlightColor}
                  onChange={(e) => onCustomHighlightColorChange(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-2">
        <div className="text-sm font-medium">Overlay</div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span>Color</span>
            <input
              type="color"
              value={overlayColor}
              onChange={(e) => onOverlayColorChange(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span>Opacity</span>
            <input
              type="range"
              min={0}
              max={0.95}
              step={0.05}
              value={overlayOpacity}
              onChange={(e) => onOverlayOpacityChange(Number(e.target.value))}
              className="h-2 w-40"
            />
            <span>{overlayOpacity.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <div className="text-sm font-medium">Hints</div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onResetKeyboardHint}>
            Reset keyboard hint
          </Button>
          <span className="text-xs text-muted-foreground">
            Show the “Press Space to play” hint again
          </span>
        </div>
      </div>

      <div className="grid gap-2">
        <div className="text-sm font-medium">Default speed</div>
        <div className="flex items-center gap-3 flex-wrap">
          <Select
            value={closestSpeedPresetId(defaultSpeed)}
            onValueChange={(v) =>
              onDefaultSpeedChange(
                SPEED_PRESETS[v as keyof typeof SPEED_PRESETS].value
              )
            }
          >
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Choose speed" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(SPEED_PRESETS).map(([id, p]) => (
                <SelectItem key={id} value={id}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">
            Current: {mounted ? defaultSpeed.toFixed(2) : "--"}x
          </span>
          <Button variant="light" onClick={onApplyDefaultSpeed}>
            Save
          </Button>
          <Button variant="outline" onClick={onResetDefaultSpeed}>
            Reset
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-col md:flex-row">
        <Select value={fontSize} onValueChange={onFontSizeChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Font" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="text-lg">Large</SelectItem>
            <SelectItem value="text-xl">XL</SelectItem>
            <SelectItem value="text-2xl">2XL</SelectItem>
            <SelectItem value="text-3xl">3XL</SelectItem>
          </SelectContent>
        </Select>
        <Select value={lineHeight} onValueChange={onLineHeightChange}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Spacing" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="leading-7">Tight</SelectItem>
            <SelectItem value="leading-8">Normal</SelectItem>
            <SelectItem value="leading-9">Loose</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={mirrorH ? "secondary" : "outline"}
          onClick={() => onMirrorHChange(!mirrorH)}
        >
          {mirrorH ? "Unmirror H" : "Mirror H"}
        </Button>
        <Button
          variant={mirrorV ? "secondary" : "outline"}
          onClick={() => onMirrorVChange(!mirrorV)}
        >
          {mirrorV ? "Unmirror V" : "Mirror V"}
        </Button>
      </div>
    </div>
  );
}
