"use client";

import * as React from "react";
import TeleprompterViewer from "@workspace/ui/patterns/features/teleprompter/teleprompter-viewer";
import {
  TransportControls,
  SpeedControl,
} from "@workspace/ui/patterns/features/teleprompter/teleprompter-controls";

const SAMPLE = [
  "Welcome team. We’ll start with a quick overview. [pause]",
  "If you’re on comms, confirm batteries and backups now. [look up]",
  "Key points: maintain presence, document interactions. [breathe]",
].join("\n\n");

export function TeleprompterDemo() {
  const [text, setText] = React.useState(SAMPLE);
  const [index, setIndex] = React.useState(0);
  const [playing, setPlaying] = React.useState(false);
  const [speed, setSpeed] = React.useState(1);
  const [lineMs] = React.useState(1500);
  const [lineStartedAt, setLineStartedAt] = React.useState<number | undefined>(
    undefined
  );
  const timer = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!playing) return;
    if (timer.current) window.clearTimeout(timer.current);
    setLineStartedAt(Date.now());
    timer.current = window.setTimeout(
      () => {
        setIndex((i) => {
          const lines = text.split(/\r?\n/);
          return Math.min(lines.length - 1, i + 1);
        });
      },
      Math.max(500, lineMs / Math.max(0.25, speed))
    );
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [playing, index, text, speed, lineMs]);

  const lines = React.useMemo(() => text.split(/\r?\n/), [text]);

  return (
    <div className="flex flex-col gap-3">
      <TransportControls
        playing={playing}
        onPlayToggle={() => setPlaying((p) => !p)}
        onPrev={() => setIndex((i) => Math.max(0, i - 1))}
        onNext={() => setIndex((i) => Math.min(lines.length - 1, i + 1))}
        onRewind={() => {
          setPlaying(false);
          setIndex(0);
          setLineStartedAt(undefined);
        }}
      />
      <SpeedControl value={speed} onChange={setSpeed} />
      <TeleprompterViewer
        text={text}
        index={index}
        theme="studio"
        font={{
          sizeClass: "text-xl",
          lineHeightClass: "leading-8",
          face: "sans",
        }}
        countdown={{
          enabled: playing,
          totalMs: lineMs,
          startedAt: lineStartedAt,
        }}
      />
    </div>
  );
}

export default TeleprompterDemo;
