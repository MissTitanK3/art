#!/usr/bin/env node
/**
 * Produce a prioritized list of files that differ across regions using the latest check-align report.
 *
 * Usage:
 *   node scripts/prioritize-diffs.mjs
 *
 * Outputs `.check-unaligned-region/prioritized-diffs.json` with heuristic action suggestions.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const REPORT = path.join(ROOT, '.check-unaligned-region', 'report.json');
const OUT = path.join(ROOT, '.check-unaligned-region', 'prioritized-diffs.json');

if (!fs.existsSync(REPORT)) {
  console.error('report.json not found; run the checker first');
  process.exit(2);
}

const report = JSON.parse(fs.readFileSync(REPORT, 'utf8'));
const counts = new Map();
for (const [region, info] of Object.entries(report.regions || {})) {
  for (const d of info.diffs || []) {
    const key = d.path;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
}

const arr = Array.from(counts.entries()).map(([path, count]) => ({ path, count }));
arr.sort((a, b) => b.count - a.count || a.path.localeCompare(b.path));

// Suggest action heuristics: if path looks like env or demo data -> whitelist; if missing_in_region high freq -> update region; otherwise update baseline
const suggestions = arr.map((item) => {
  const p = item.path;
  const lower = p.toLowerCase();
  let action = 'review';
  if (lower.startsWith('data/') || lower.includes('demo')) action = 'whitelist';
  if (lower.includes('.env') || lower.includes('env')) action = 'whitelist';
  if (lower.includes('missing') || lower.includes('missing_in_region')) action = 'update_region';
  // prefer updating baseline for core libs/config
  if (p.startsWith('lib/') || p.startsWith('providers/') || p === 'nav.config.ts' || p === 'package.json' || p.endsWith('tsconfig.json')) action = 'update_baseline';
  return { ...item, suggestion: action };
});

fs.writeFileSync(OUT, JSON.stringify({ generatedAt: new Date().toISOString(), prioritized: suggestions }, null, 2));
console.log('Wrote prioritized list to', OUT);
