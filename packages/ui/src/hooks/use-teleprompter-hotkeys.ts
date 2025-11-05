'use client';

import * as React from 'react';

export type TeleprompterHotkeyHandlers = {
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  rewind: () => void;
  setSpeed: (updater: (s: number) => number) => void;
  toggleHMirror?: () => void;
  toggleVMirror?: () => void;
  toggleFullscreen?: () => void;
};

export function useTeleprompterHotkeys(
  scopeRef: React.RefObject<HTMLElement | null>,
  handlers: TeleprompterHotkeyHandlers,
) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target) {
        const tag = target.tagName;
        const isEditable =
          target.isContentEditable ||
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT' ||
          target.getAttribute('role') === 'textbox';
        if (isEditable) return;
      }
      const activeEl = typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;
      const scope = scopeRef.current;
      const inScope = !!(scope && activeEl && (activeEl === scope || scope.contains(activeEl)));
      if (!inScope) return;

      if (e.key === ' ') {
        e.preventDefault();
        handlers.togglePlay();
        return;
      }
      if (e.key === '+' || e.key === '=') handlers.setSpeed((s) => Math.min(2, Number((s + 0.05).toFixed(2))));
      if (e.key === '-') handlers.setSpeed((s) => Math.max(0.25, Number((s - 0.05).toFixed(2))));
      if (e.key === 'ArrowDown') handlers.next();
      if (e.key === 'ArrowUp') handlers.prev();
      if (e.key.toLowerCase() === 'r') handlers.rewind();
      if (e.key.toLowerCase() === 'm') handlers.toggleHMirror?.();
      if (e.key.toLowerCase() === 'v') handlers.toggleVMirror?.();
      if (e.key.toLowerCase() === 'f') handlers.toggleFullscreen?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [scopeRef, handlers]);
}
