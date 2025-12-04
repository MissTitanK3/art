"use client";

import * as React from "react";
import TeleprompterViewer from "@workspace/ui/patterns/features/teleprompter/teleprompter-viewer";
import {
  TransportControls,
  SpeedControl,
} from "@workspace/ui/patterns/features/teleprompter/teleprompter-controls";

export type TeleprompterShellProps = {
  // wiring
  containerRef?: (el: HTMLDivElement | null) => void;
  viewportRef?: (el: HTMLDivElement | null) => void;
  scrollRef?: (el: HTMLDivElement | null) => void;
  currentRef?: (el: HTMLDivElement | null) => void;
  onFocus?: React.FocusEventHandler<HTMLDivElement>;
  onBlur?: React.FocusEventHandler<HTMLDivElement>;
  fullscreen: boolean;
  showFsControls: boolean;
  onToggleFullscreen: () => void;

  // playback
  playing: boolean;
  onPlayToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
  onRewind: () => void;
  progressPct?: number;
  speed: number;
  onSpeedChange: (v: number) => void;

  // viewer props
  text: string;
  index: number;
  onIndexRef?: (r: React.RefObject<HTMLDivElement | null>) => void; // passthrough if needed
  theme: any;
  custom?: { textColor: string; bgColor: string; highlightColor: string };
  font: { sizeClass: string; lineHeightClass: string; face: any };
  mirror: { h: boolean; v: boolean };
  overlay: { color: string; opacity: number };
  showLegend: boolean;
  countdown?: {
    enabled: boolean;
    totalMs: number;
    startedAt?: number;
    segments: { name: string; durationMs: number }[];
  };
  legendDurations?: { pauseMs: number; breatheMs: number; lookupMs: number };
  showSegmentBar?: boolean;
  overlays?: React.ReactNode;
};

export default function TeleprompterShell(props: TeleprompterShellProps) {
  const {
    containerRef,
    viewportRef,
    scrollRef,
    currentRef,
    fullscreen,
    showFsControls,
    onToggleFullscreen,
    playing,
    onPlayToggle,
    onPrev,
    onNext,
    onRewind,
    progressPct,
    speed,
    onSpeedChange,
    text,
    index,
    theme,
    custom,
    font,
    mirror,
    overlay,
    showLegend,
    countdown,
    legendDurations,
    showSegmentBar,
  } = props;

  return (
    <div
      role="region"
      aria-label="Teleprompter"
      ref={containerRef ?? undefined}
      className="relative min-h-[50vh] rounded-md border p-0 md:p-0"
      onFocusCapture={props.onFocus}
      onBlurCapture={props.onBlur}
    >
      {props.overlays}
      {overlay.opacity > 0 ? (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{ backgroundColor: overlay.color, opacity: overlay.opacity }}
        />
      ) : null}

      {fullscreen && (
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 p-3 pb-[env(safe-area-inset-bottom)] transition-all duration-200 ${showFsControls ? "opacity-100" : "opacity-0 translate-y-2"}`}
        >
          <div className="mx-auto max-w-3xl">
            <div className="pointer-events-auto flex flex-wrap items-center gap-2 rounded-md border bg-background/80 p-2 shadow-sm backdrop-blur">
              <TransportControls
                compact
                className="md:flex-1"
                playing={playing}
                onPlayToggle={onPlayToggle}
                onPrev={onPrev}
                onNext={onNext}
                onRewind={onRewind}
              />
              <div className="ml-auto flex items-center gap-2">
                <button
                  className="h-9 px-3 text-sm rounded-md border bg-transparent"
                  onClick={onToggleFullscreen}
                >
                  {fullscreen ? "Exit Fullscreen" : "Fullscreen"}
                </button>
              </div>
              <div className="w-full">
                <SpeedControl value={speed} onChange={onSpeedChange} />
              </div>
            </div>
          </div>
        </div>
      )}

      <TeleprompterViewer
        text={text}
        index={index}
        onIndexRef={(r) => {
          if (currentRef) currentRef(r.current);
        }}
        onScrollRef={(r) => {
          if (scrollRef) scrollRef(r.current);
        }}
        theme={theme}
        custom={custom}
        font={font as any}
        mirror={mirror}
        overlay={overlay}
        showLegend={showLegend}
        countdown={countdown as any}
        legendDurations={legendDurations}
        showSegmentBar={!!showSegmentBar}
      />
    </div>
  );
}
