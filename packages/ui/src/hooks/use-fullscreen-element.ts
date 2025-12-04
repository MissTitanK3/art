"use client";
import { useCallback, useEffect, useRef, useState } from "react";
export function useFullscreenElement<T extends HTMLElement>() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const onFsChange = () => {
      const isFs =
        !!document.fullscreenElement &&
        document.fullscreenElement === ref.current;
      setIsFullscreen(isFs);
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);
  const enter = useCallback(async () => {
    await ref.current?.requestFullscreen?.();
    setIsFullscreen(true);
  }, []);
  const exit = useCallback(async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    setIsFullscreen(false);
  }, []);
  const toggle = useCallback(async () => {
    if (!document.fullscreenElement) return enter();
    return exit();
  }, [enter, exit]);
  return { ref, isFullscreen, enter, exit, toggle } as const;
}
