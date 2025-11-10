// apps/region-template/app/api/reverse-geocode/route.ts
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  if (!lat || !lng) {
    return NextResponse.json({ error: "Missing lat/lng" }, { status: 400 });
  }

  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "AlwaysReadyTools/1.0 (contact@example.org)", // required by OSM
    },
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Upstream error" }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
