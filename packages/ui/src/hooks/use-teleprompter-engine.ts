"use client";

import * as React from "react";

export type ComputeLineMs = (line: string, speed: number) => number;

export type TeleprompterEngine = {
  index: number;
  setIndex: React.Dispatch<React.SetStateAction<number>>;
  playing: boolean;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  rewind: () => void;
  progressPct: number;
  elapsedMs: number;
  plannedMsForCurrentLine: number;
  lineStartedAt: number | null;
};

export function useTeleprompterEngine(
  text: string,
  speed: number,
  computeLineMs: ComputeLineMs,
): TeleprompterEngine {
  const lines = React.useMemo(() => (text ?? "").split(/\r?\n/), [text]);
  const [index, setIndex] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [elapsedMs, setElapsedMs] = React.useState(0);
  const [startedAt, setStartedAt] = React.useState<number | null>(null);
  const [plannedMsForCurrentLine, setPlannedMsForCurrentLine] =
    React.useState(0);
  const [lineStartedAt, setLineStartedAt] = React.useState<number | null>(null);

  const playTimer = React.useRef<number | null>(null);
  const timeTicker = React.useRef<number | null>(null);

  const clearTimers = React.useCallback(() => {
    if (playTimer.current) {
      window.clearTimeout(playTimer.current);
      playTimer.current = null;
    }
    if (timeTicker.current) {
      window.clearInterval(timeTicker.current);
      timeTicker.current = null;
    }
  }, []);

  const scheduleFrom = React.useCallback(
    (fromIdx: number) => {
      if (!playing) return;
      if (playTimer.current) {
        window.clearTimeout(playTimer.current);
        playTimer.current = null;
      }
      const line = lines[fromIdx] ?? "";
      if (fromIdx >= lines.length - 1) {
        setPlaying(false);
        setLineStartedAt(null);
        return;
      }
      const ms = computeLineMs(line, speed);
      setPlannedMsForCurrentLine(ms);
      setLineStartedAt(Date.now());
      playTimer.current = window.setTimeout(() => {
        setIndex((i) => Math.min(lines.length - 1, i + 1));
      }, ms);
    },
    [lines, playing, speed, computeLineMs],
  );

  // keep planned time up-to-date when index/speed change
  React.useEffect(() => {
    const ln = lines[index] ?? "";
    const ms = computeLineMs(ln, speed);
    setPlannedMsForCurrentLine(ms);
    if (!playing) setLineStartedAt(null);
  }, [index, lines, speed, playing, computeLineMs]);

  // when index changes while playing, advance scheduling
  React.useEffect(() => {
    if (playing) scheduleFrom(index);
  }, [index, playing, scheduleFrom]);

  // ticker for elapsed time
  React.useEffect(() => {
    if (timeTicker.current) {
      window.clearInterval(timeTicker.current);
      timeTicker.current = null;
    }
    if (playing) {
      const start = startedAt ?? Date.now();
      if (!startedAt) setStartedAt(start);
      timeTicker.current = window.setInterval(
        () => setElapsedMs(Date.now() - start),
        250,
      );
    }
    return () => {
      if (timeTicker.current) window.clearInterval(timeTicker.current);
    };
  }, [playing, startedAt]);

  React.useEffect(() => () => clearTimers(), [clearTimers]);

  const togglePlay = React.useCallback(() => {
    setPlaying((p) => {
      const willPlay = !p;
      if (willPlay && index >= lines.length - 1) {
        // restart from beginning
        setIndex(0);
        setStartedAt(null);
        setElapsedMs(0);
        setLineStartedAt(null);
      }
      return willPlay;
    });
  }, [index, lines.length]);

  const prev = React.useCallback(() => {
    clearTimers();
    setPlaying(false);
    setLineStartedAt(null);
    setIndex((i) => Math.max(0, i - 1));
  }, [clearTimers]);

  const next = React.useCallback(() => {
    clearTimers();
    setPlaying(false);
    setLineStartedAt(null);
    setIndex((i) => Math.min(lines.length - 1, i + 1));
  }, [clearTimers, lines.length]);

  const rewind = React.useCallback(() => {
    clearTimers();
    setPlaying(false);
    setIndex(0);
    setStartedAt(null);
    setElapsedMs(0);
    setLineStartedAt(null);
  }, [clearTimers]);

  const progressPct = React.useMemo(
    () => (lines.length <= 1 ? 0 : (index / (lines.length - 1)) * 100),
    [index, lines.length],
  );

  return {
    index,
    setIndex,
    playing,
    togglePlay,
    next,
    prev,
    rewind,
    progressPct,
    elapsedMs,
    plannedMsForCurrentLine,
    lineStartedAt,
  };
}
