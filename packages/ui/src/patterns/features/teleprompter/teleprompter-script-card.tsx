import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/primitives/card";
import { Button } from "@workspace/ui/primitives/button";
import {
  TransportControls,
  SpeedControl,
} from "@workspace/ui/patterns/features/teleprompter/teleprompter-controls";
import TeleprompterShell, {
  TeleprompterShellProps,
} from "@workspace/ui/patterns/features/teleprompter/teleprompter-shell";
import KeyboardHint from "@workspace/ui/patterns/common/keyboard-hint";
import OrientationHint from "@workspace/ui/patterns/common/orientation-hint";

export interface TeleprompterScriptCardProps {
  scriptId: string;
  text: string;
  setText: (text: string) => void;
  onReset: () => void;
  onCopy: () => void;
  onExportTxt: () => void;
  onExportMd: () => void;

  // Playback
  playing: boolean;
  onPlayToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRewind: () => void;
  progressPct: number;
  elapsedMs: number;
  totalMs: number;
  humanTime: (ms: number) => string;

  // Speed
  speed: number;
  onSpeedChange: (speed: number) => void;

  // UI State
  mobileControlsVisible: boolean;
  mounted: boolean;

  // Shell
  shellProps: Omit<
    TeleprompterShellProps,
    | "playing"
    | "onPlayToggle"
    | "onPrev"
    | "onNext"
    | "onRewind"
    | "progressPct"
    | "speed"
    | "onSpeedChange"
    | "text"
  >;

  // Hints
  viewportHasFocus: boolean;
  viewportHintDismissed: boolean;
  onDismissViewportHint: () => void;
  fullscreen: boolean;
  isMobile: boolean;
  isPortrait: boolean;
  orientationHintDismissed: boolean;
  onDismissOrientationHint: () => void;
}

export function TeleprompterScriptCard({
  scriptId,
  text,
  setText,
  onReset,
  onCopy,
  onExportTxt,
  onExportMd,
  playing,
  onPlayToggle,
  onPrev,
  onNext,
  onRewind,
  progressPct,
  elapsedMs,
  totalMs,
  humanTime,
  speed,
  onSpeedChange,
  mobileControlsVisible,
  mounted,
  shellProps,
  viewportHasFocus,
  viewportHintDismissed,
  onDismissViewportHint,
  fullscreen,
  isMobile,
  isPortrait,
  orientationHintDismissed,
  onDismissOrientationHint,
}: TeleprompterScriptCardProps) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex flex-col gap-2 w-full">
          <CardTitle>Script</CardTitle>
          <div className="grid w-full grid-cols-2 md:grid-cols-4 gap-2">
            <Button className="w-full" variant="outline" onClick={onReset}>
              Reset
            </Button>
            <Button className="w-full" variant="light" onClick={onCopy}>
              Copy
            </Button>
            <Button className="w-full" variant="outline" onClick={onExportTxt}>
              Export .txt
            </Button>
            <Button className="w-full" variant="outline" onClick={onExportMd}>
              Export .md
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Playback controls */}
        <div
          className={`mb-2 flex flex-wrap items-center gap-2 md:gap-3 ${
            mobileControlsVisible ? "" : "hidden"
          } md:flex`}
        >
          {/* Primary transport controls - equal sizing */}
          <TransportControls
            className="mb-2 md:flex-1"
            playing={playing}
            onPlayToggle={onPlayToggle}
            onPrev={onPrev}
            onNext={onNext}
            onRewind={onRewind}
          />
          <div className="ml-auto hidden md:flex items-center gap-3 text-sm text-muted-foreground">
            <div className="h-2 w-40 overflow-hidden rounded bg-muted">
              <div
                className="h-2 bg-primary"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span suppressHydrationWarning>
              {mounted
                ? `${humanTime(elapsedMs)} / ~${humanTime(totalMs)}`
                : "--:-- / ~--:--"}
            </span>
          </div>
        </div>

        {/* Speed row - separate line with equal-width treatment */}
        <div
          className={`${mobileControlsVisible ? "" : "hidden"} md:block mb-2`}
        >
          <SpeedControl value={speed} onChange={onSpeedChange} />
        </div>

        {/* Reader viewport via shell */}
        <TeleprompterShell
          {...shellProps}
          playing={playing}
          onPlayToggle={onPlayToggle}
          onPrev={onPrev}
          onNext={onNext}
          onRewind={onRewind}
          progressPct={progressPct}
          speed={speed}
          onSpeedChange={onSpeedChange}
          text={text}
          overlays={
            <>
              {mounted &&
                !viewportHasFocus &&
                !playing &&
                !viewportHintDismissed && (
                  <KeyboardHint show onDismiss={onDismissViewportHint}>
                    Press Space to play (focus viewport first)
                  </KeyboardHint>
                )}
              {mounted &&
                fullscreen &&
                isMobile &&
                isPortrait &&
                !orientationHintDismissed && (
                  <OrientationHint show onDismiss={onDismissOrientationHint} />
                )}
            </>
          }
        />
      </CardContent>
    </Card>
  );
}
