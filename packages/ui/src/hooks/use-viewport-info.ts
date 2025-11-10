"use client";

import * as React from "react";

export function useViewportInfo(mdBreakpoint = 768) {
  const [width, setWidth] = React.useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );
  const [height, setHeight] = React.useState<number>(
    typeof window !== "undefined" ? window.innerHeight : 0,
  );

  React.useEffect(() => {
    const onResize = () => {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    };
    onResize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
    };
  }, []);

  return {
    width,
    height,
    isMobile: width < mdBreakpoint,
    isPortrait: height >= width,
  } as const;
}
