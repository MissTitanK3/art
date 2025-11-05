'use client';

import * as React from 'react';

export function useFullscreenElement<T extends HTMLElement>() {
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const ref = React.useRef<T | null>(null);

  React.useEffect(() => {
    const onFsChange = () => {
      const isFs = !!document.fullscreenElement && document.fullscreenElement === ref.current;
      setIsFullscreen(isFs);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const enter = React.useCallback(async () => {
    await ref.current?.requestFullscreen?.();
    setIsFullscreen(true);
  }, []);

  const exit = React.useCallback(async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    setIsFullscreen(false);
  }, []);

  const toggle = React.useCallback(async () => {
    if (!document.fullscreenElement) return enter();
    return exit();
  }, [enter, exit]);

  return { ref, isFullscreen, enter, exit, toggle } as const;
}
