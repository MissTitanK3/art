"use client";

export function useGeolocation() {
  async function getPosition(): Promise<{ lat: number; lng: number }> {
    if (!("geolocation" in navigator))
      throw new Error("Geolocation not supported in this browser");
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 0,
      });
    });
    return {
      lat: round2(pos.coords.latitude),
      lng: round2(pos.coords.longitude),
    };
  }

  function round2(n: number) {
    return Math.round(n * 100) / 100;
  }

  return { getPosition };
}
