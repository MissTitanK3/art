export function formatAge(iso: string): string {
  const deltaMs = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(deltaMs / (1000 * 60));
  const hours = Math.floor(minutes / 60);

  if (minutes < 1) return "<1 minute";
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  }

  if (hours < 72) {
    const rounded = Math.floor(minutes / 15) * 15;
    const hrPart = Math.floor(rounded / 60);
    const minPart = rounded % 60;
    let result = `${hrPart} hour${hrPart === 1 ? "" : "s"}`;
    if (minPart > 0) result += ` ${minPart} minute${minPart === 1 ? "" : "s"}`;
    return result;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"}`;
}
