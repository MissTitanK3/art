"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
type Props = {
  storageKey: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
};
/**
 * Preserves scroll position for its own scrollable container across route changes.
 * Uses sessionStorage(key) to store/restore scrollTop.
 */
export default function ScrollAreaPersist({
  storageKey,
  className,
  style,
  children,
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  // Restore on mount
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) {
        const top = parseInt(raw, 10);
        if (!Number.isNaN(top)) el.scrollTop = top;
      }
    } catch {
      /* ignore storage errors */
    }
  }, [storageKey]);
  // Save on scroll and on unload
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      try {
        sessionStorage.setItem(storageKey, String(el.scrollTop));
      } catch {
        /* ignore storage errors */
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    const onPageHide = () => onScroll();
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("beforeunload", onPageHide);
    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("beforeunload", onPageHide);
    };
  }, [storageKey]);
  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
