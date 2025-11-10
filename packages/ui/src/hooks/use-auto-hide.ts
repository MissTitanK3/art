"use client";

import * as React from "react";

export function useAutoHide(delayMs = 3000) {
  const [visible, setVisible] = React.useState(true);
  const timer = React.useRef<number | null>(null);
  const containerRef = React.useRef<HTMLElement | null>(null);

  const onActivity = React.useCallback(() => {
    setVisible(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setVisible(false), delayMs);
  }, [delayMs]);

  React.useEffect(() => {
    const el = containerRef.current ?? document;
    onActivity();
    const onKey = onActivity;
    const onClick = onActivity as EventListener;
    el.addEventListener("mousemove", onActivity as any);
    el.addEventListener(
      "touchstart",
      onActivity as any,
      { passive: true } as any,
    );
    document.addEventListener("keydown", onKey as any);
    document.addEventListener("click", onClick, { capture: true } as any);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
      el.removeEventListener("mousemove", onActivity as any);
      el.removeEventListener("touchstart", onActivity as any);
      document.removeEventListener("keydown", onKey as any);
      document.removeEventListener(
        "click",
        onClick as any,
        { capture: true } as any,
      );
    };
  }, [onActivity]);

  return { visible, containerRef, onActivity } as const;
}
