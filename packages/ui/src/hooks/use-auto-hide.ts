"use client";
import { useCallback, useEffect, useRef, useState } from "react";
export function useAutoHide(delayMs = 3000) {
  const [visible, setVisible] = useState(true);
  const timer = useRef<number | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const onActivity = useCallback(() => {
    setVisible(true);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setVisible(false), delayMs);
  }, [delayMs]);
  useEffect(() => {
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
