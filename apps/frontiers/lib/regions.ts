const REGION_TO_SECTOR: Record<string, string> = {
  "region-pnw": "EOS-9",
  "region-template": "EOS-0",
};

export function mapRegionToSector(regionId?: string | null): string | null {
  if (!regionId) return null;
  return REGION_TO_SECTOR[regionId] ?? "EOS-1";
}
