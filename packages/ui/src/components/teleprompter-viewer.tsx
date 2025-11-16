"use client";

import * as React from "react";
import {
  TELEPROMPTER_PRESETS,
  PresetId,
  parseCues,
  CueChunk,
} from "@workspace/ui/lib/teleprompter";

export type TeleprompterTheme =
  | { cls?: string; highlightCls?: string; nextCls?: string }
  | PresetId;

type FontFace = "sans" | "serif" | "mono" | "dyslexic";

type CountdownSegment = {
  name: "base" | "pause" | "breathe" | "lookup" | "custom";
  durationMs: number;
};

type CueName = "pause" | "breathe" | "lookup" | "custom";

const CUE_STYLE_MAP: Record<
  CueName,
  { label: string; chipBg: string; chipText: string; segmentBg: string }
> = {
  pause: {
    label: "pause",
    chipBg: "bg-amber-500/20",
    chipText: "text-amber-300",
    segmentBg: "bg-amber-500/70",
  },
  breathe: {
    label: "breathe",
    chipBg: "bg-emerald-500/20",
    chipText: "text-emerald-300",
    segmentBg: "bg-emerald-500/70",
  },
  lookup: {
    label: "look up",
    chipBg: "bg-sky-500/20",
    chipText: "text-sky-300",
    segmentBg: "bg-sky-500/70",
  },
  custom: {
    label: "custom",
    chipBg: "bg-fuchsia-500/20",
    chipText: "text-fuchsia-300",
    segmentBg: "bg-fuchsia-500/70",
  },
};

const CUE_CHIP_BASE = "inline-flex items-center gap-1 rounded";
const CUE_CHIP_VARIANTS = {
  default: "px-2 py-0.5 text-xs",
  compact: "px-1.5 py-0.5 text-[10px]",
  legend: "px-2 py-0.5",
} as const;

type CueChipVariant = keyof typeof CUE_CHIP_VARIANTS;

const cueLabel = (cue: CueName) => CUE_STYLE_MAP[cue].label;

const cueChipClasses = (
  cue: CueName,
  opts: { variant?: CueChipVariant; className?: string } = {},
) => {
  const variant = opts.variant ?? "default";
  return [
    CUE_CHIP_BASE,
    CUE_STYLE_MAP[cue].chipBg,
    CUE_STYLE_MAP[cue].chipText,
    CUE_CHIP_VARIANTS[variant],
    opts.className,
  ]
    .filter(Boolean)
    .join(" ");
};

const cueSegmentClass = (name: CountdownSegment["name"]) => {
  if (name === "base") return "bg-muted-foreground/40";
  return CUE_STYLE_MAP[name as CueName]?.segmentBg ?? "bg-muted-foreground/40";
};

const isCueName = (value: string): value is CueName =>
  value === "pause" || value === "breathe" || value === "lookup" || value === "custom";

export type TeleprompterViewerProps = {
  text: string;
  index: number;
  onIndexRef?: (ref: React.RefObject<HTMLDivElement | null>) => void;
  onScrollRef?: (ref: React.RefObject<HTMLDivElement | null>) => void;
  theme?: TeleprompterTheme;
  font?: { sizeClass: string; lineHeightClass: string; face?: FontFace };
  mirror?: { h?: boolean; v?: boolean };
  overlay?: { color: string; opacity: number };
  showLegend?: boolean;
  countdown?: {
    enabled: boolean;
    totalMs?: number;
    startedAt?: number;
    dotMs?: number;
    segments?: CountdownSegment[];
  };
  custom?: { textColor?: string; bgColor?: string; highlightColor?: string };
  className?: string;
  legendDurations?: { pauseMs: number; breatheMs: number; lookupMs: number };
  showSegmentBar?: boolean;
};

const fontFamilyFor = (face?: FontFace): React.CSSProperties => {
  if (face === "serif") return { fontFamily: "serif" };
  if (face === "mono")
    return {
      fontFamily:
        "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
    } as React.CSSProperties;
  if (face === "dyslexic")
    return {
      fontFamily:
        "'OpenDyslexic', 'Atkinson Hyperlegible', system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
    } as React.CSSProperties;
  return {
    fontFamily:
      "system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, 'Apple Color Emoji', 'Segoe UI Emoji'",
  } as React.CSSProperties;
};

const useCountdownDots = (
  enabled: boolean,
  totalMs?: number,
  startedAt?: number,
  dotMs = 1000,
) => {
  const [, force] = React.useReducer((x) => x + 1, 0);
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    if (!mounted || !enabled || !startedAt || !totalMs) return;
    const id = window.setInterval(() => force(), 250);
    return () => window.clearInterval(id);
  }, [mounted, enabled, startedAt, totalMs]);
  if (!mounted || !enabled || !startedAt || !totalMs) return "";
  const DOTS_MIN = 3;
  const DOTS_MAX = 12;
  const totalDots = Math.max(
    DOTS_MIN,
    Math.min(DOTS_MAX, Math.round(totalMs / dotMs)),
  );
  const elapsed = Date.now() - startedAt;
  const left = Math.max(0, totalMs - elapsed);
  const count = Math.max(0, Math.ceil((left / totalMs) * totalDots));
  return "\u2022".repeat(count);
};

// Determine active segment color based on elapsed time and provided segments
const useActiveCountdownColor = (
  enabled: boolean,
  startedAt?: number,
  totalMs?: number,
  segments?: CountdownSegment[],
) => {
  const [tick, setTick] = React.useState(0);
  const segLen = Array.isArray(segments) ? segments.length : 0;
  React.useEffect(() => {
    if (!enabled || !startedAt || !totalMs || !segLen) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 250);
    return () => window.clearInterval(id);
  }, [enabled, startedAt, totalMs, segLen]);
  if (!enabled || !startedAt || !totalMs || !segments?.length)
    return undefined as string | undefined;
  void tick; // force update
  const elapsed = Date.now() - startedAt;
  let acc = 0;
  for (const seg of segments) {
    acc += Math.max(0, seg.durationMs || 0);
    if (elapsed <= acc) {
      if (isCueName(seg.name)) return CUE_STYLE_MAP[seg.name].chipText;
      return undefined; // base
    }
  }
  return undefined;
};

export const TeleprompterViewer = React.forwardRef<
  HTMLDivElement,
  TeleprompterViewerProps
>(function TeleprompterViewer(
  {
    text,
    index,
    onIndexRef,
    onScrollRef,
    theme = "studio",
    font,
    mirror,
    overlay,
    showLegend,
    countdown,
    custom,
    className,
    legendDurations,
    showSegmentBar,
  }: TeleprompterViewerProps,
  ref,
) {
  const currentRef = React.useRef<HTMLDivElement | null>(null);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    onIndexRef?.(currentRef);
    onScrollRef?.(scrollRef);
  }, [onIndexRef, onScrollRef]);

  const dots = useCountdownDots(
    !!countdown?.enabled,
    countdown?.totalMs,
    countdown?.startedAt,
    countdown?.dotMs,
  );
  const activeDotsColor = useActiveCountdownColor(
    !!countdown?.enabled,
    countdown?.startedAt,
    countdown?.totalMs,
    countdown?.segments,
  );

  const lines = React.useMemo(() => (text ?? "").split(/\r?\n/), [text]);
  const preset =
    typeof theme === "string" ? TELEPROMPTER_PRESETS[theme] : theme;
  const clsBase =
    typeof theme === "string" && theme !== "custom" ? preset.cls : "";
  const highlightCls =
    typeof theme === "string" && theme !== "custom" ? preset.highlightCls : "";
  const nextCls =
    typeof theme === "string" && theme !== "custom"
      ? preset.nextCls
      : "opacity-80";

  // Auto-scroll current line into view
  React.useEffect(() => {
    const container = scrollRef.current;
    const el = currentRef.current;
    if (!container || !el) return;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const offset = elRect.top - containerRect.top;
    const targetTop =
      container.scrollTop +
      offset -
      container.clientHeight / 2 +
      el.clientHeight / 2;
    container.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  }, [index, text]);

  return (
    <div
      ref={ref}
      className={`relative min-h-[50vh] rounded-md border p-0 ${clsBase} ${className ?? ""}`}
      style={
        typeof theme === "string" && theme === "custom"
          ? { color: custom?.textColor, backgroundColor: custom?.bgColor }
          : undefined
      }
    >
      {overlay && overlay.opacity > 0 ? (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{ backgroundColor: overlay.color, opacity: overlay.opacity }}
        />
      ) : null}
      <div
        className={`relative z-0 mx-auto flex max-w-full flex-col gap-6 text-center p-4 md:p-10 ${font?.sizeClass ?? "text-xl"
          } ${font?.lineHeightClass ?? "leading-8"} ${mirror?.h ? "scale-x-[-1]" : ""} ${mirror?.v ? "scale-y-[-1]" : ""
          } max-h-[70vh] md:max-h-[75vh] overflow-y-auto pb-16 break-words`}
        ref={scrollRef}
        style={{
          ...fontFamilyFor(font?.face),
          overscrollBehavior: "contain",
          WebkitOverflowScrolling: "touch",
          wordBreak: "break-word",
        }}
      >
        {showLegend && (
          <div className="mb-2 rounded-md border bg-muted/40 p-3 text-sm">
            <div className="flex flex-wrap items-center gap-3">
              <span className={cueChipClasses("pause", { variant: "legend" })}>
                [{cueLabel("pause")}] adds ~{legendDurations?.pauseMs ?? 600}ms
              </span>
              <span className={cueChipClasses("breathe", { variant: "legend" })}>
                [{cueLabel("breathe")}] adds ~{legendDurations?.breatheMs ?? 300}ms
              </span>
              <span className={cueChipClasses("lookup", { variant: "legend" })}>
                [{cueLabel("lookup")}] adds ~{legendDurations?.lookupMs ?? 1200}ms
              </span>
              <span className={cueChipClasses("custom", { variant: "legend" })}>
                [{cueLabel("custom")}] adds ~250ms
              </span>
            </div>
          </div>
        )}
        {lines.map((ln, i) => {
          const isCurrent = i === index;
          const isNext = i === index + 1;
          const parsedCues = parseCues(ln);
          const baseCls = isCurrent
            ? `${typeof theme === "string" && theme !== "custom" ? highlightCls : ""}`
            : isNext
              ? `${typeof theme === "string" && theme !== "custom" ? nextCls : "opacity-80"}`
              : "opacity-70";
          return (
            <div
              key={i}
              ref={isCurrent ? currentRef : undefined}
              className={`transition-colors duration-200 ${baseCls}`}
              style={
                isCurrent && typeof theme === "string" && theme === "custom"
                  ? { color: custom?.highlightColor, fontWeight: 600 }
                  : undefined
              }
            >
              {ln?.length ? (
                <span className="inline">
                  {isCurrent ? (
                    <>
                      <span className="ml-2 inline-flex items-center gap-2 align-baseline">
                        <span
                          className={`text-sm tracking-widest select-none ${activeDotsColor ?? "text-muted-foreground/70"}`}
                          aria-hidden
                        >
                          {dots}
                        </span>
                        {/* Inline upcoming cues preview for current line */}
                        <span
                          className="text-[10px] text-muted-foreground/70 hidden md:inline-flex items-center gap-1"
                          aria-hidden
                        >
                          {(() => {
                            const cueChunks = parsedCues.filter(
                              (chunk) => chunk.t !== "text",
                            ) as Array<{ t: Exclude<CueChunk["t"], "text">; v: string }>;
                            if (!cueChunks.length) return null;
                            return (
                              <span className="inline-flex items-center gap-1">
                                {cueChunks.map((chunk, cueIdx) => (
                                  <span
                                    key={cueIdx}
                                    className={cueChipClasses(chunk.t as CueName, {
                                      variant: "compact",
                                    })}
                                  >
                                    {cueLabel(chunk.t as CueName)}
                                  </span>
                                ))}
                              </span>
                            );
                          })()}
                        </span>
                      </span>
                      {showSegmentBar && countdown?.segments?.length ? (
                        <div className="mt-1 h-1.5 w-full max-w-xs overflow-hidden rounded bg-muted justify-center mx-auto">
                          <div className="flex h-full w-full">
                            {countdown.segments.map((seg, i) => {
                              const color = cueSegmentClass(seg.name);
                              const widthPct = Math.max(
                                0,
                                Math.min(
                                  100,
                                  Math.round(
                                    ((seg.durationMs || 0) /
                                      Math.max(1, countdown.totalMs || 1)) *
                                    100,
                                  ),
                                ),
                              );
                              return (
                                <div
                                  key={i}
                                  className={`${color} h-full`}
                                  style={{ width: `${widthPct}%` }}
                                />
                              );
                            })}
                          </div>
                        </div>
                      ) : null}
                      <hr />
                    </>
                  ) : null}
                  {parsedCues.map((chunk, idx) => {
                    if (chunk.t === "text")
                      return <span key={idx}>{chunk.v}</span>;
                    if (isCueName(chunk.t))
                      return (
                        <span
                          key={idx}
                          className={cueChipClasses(chunk.t, {
                            className: "mx-1",
                          })}
                        >
                          {cueLabel(chunk.t)}
                        </span>
                      );
                    return null;
                  })}
                </span>
              ) : (
                <span className="opacity-50">&nbsp;</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default TeleprompterViewer;
