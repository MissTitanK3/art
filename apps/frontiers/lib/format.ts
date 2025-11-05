export function humanizeKey(key: string): string {
  if (!key) return '';
  const spaced = key
    .replace(/[_-]+/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase();
  return spaced.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function pct(v: number): string {
  if (Number.isNaN(v as any) || v === null || v === undefined) return '';
  const n = (v as number) * 100;
  const abs = Math.abs(n);
  // Show 1 decimal place for small values to avoid rounding to 0%
  const decimals = abs < 10 ? 1 : 0; // 0.0%..9.9% -> 1 decimal; 10%+ -> integer
  const formatted = n.toFixed(decimals);
  const sign = n > 0 ? '+' : '';
  return `${sign}${formatted}%`;
}
