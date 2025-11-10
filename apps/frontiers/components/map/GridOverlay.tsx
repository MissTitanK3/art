"use client";

import { useMap } from "react-leaflet";

export function GridOverlay() {
  useMap();
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-25"
      style={{
        backgroundImage:
          "linear-gradient(0deg, rgba(0,0,0,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.08) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }}
    />
  );
}
