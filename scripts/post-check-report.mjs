#!/usr/bin/env node
/**
 * Convert `.check-unaligned-region/report.json` into a Markdown summary that can seed a PR description.
 *
 * Usage:
 *   node scripts/post-check-report.mjs
 *
 * Writes `pr_suggestion.md` (or `$PR_SUGGEST_OUT`) containing top diffs and per-region breakdowns.
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.resolve(process.cwd());
const OUT_DIR = path.join(ROOT, '.check-unaligned-region');
const REPORT = path.join(OUT_DIR, 'report.json');

if (!fs.existsSync(REPORT)) {
  console.error('No report found at', REPORT);
  process.exit(2);
}

const report = JSON.parse(fs.readFileSync(REPORT, 'utf8'));

// Optional env to control output path
const outFile = process.env.PR_SUGGEST_OUT || path.join(OUT_DIR, 'pr_suggestion.md');

const title = `Align regions with baseline: ${report.baseline}`;

// Flatten diffs to compute top files
const fileCounts = new Map();
for (const [region, info] of Object.entries(report.regions || {})) {
  for (const d of info.diffs || []) {
    fileCounts.set(d.path, (fileCounts.get(d.path) || 0) + 1);
  }
}
const top = Array.from(fileCounts.entries())
  .map(([p, c]) => ({ path: p, count: c }))
  .sort((a, b) => b.count - a.count)
  .slice(0, 5);

let md = `# ${title}\n\n`;
md += `**Summary**: Baseline **${report.baseline}** — compared at ${report.comparedAt}.\n\n`;
md += `**Regions checked**: ${Object.keys(report.regions || {}).join(', ')}.\n\n`;
md += `**Top diffs (by frequency)**:\n`;
if (top.length === 0) md += '- No diffs found\n\n';
else {
  for (const t of top) md += `- ${t.path} — ${t.count} region(s)\n`;
  md += '\n';
}

md += '### Details (collapsed)\n\n<details>\n<summary>Click to expand per-region diffs</summary>\n\n';
for (const region of Object.keys(report.regions)) {
  const info = report.regions[region];
  md += `#### ${region}: ${info.diffsCount} diffs\n\n`;
  if (info.diffs && info.diffs.length > 0) {
    md += '| Type | Path |\n|---|---:|\n';
    for (const d of info.diffs) md += `| ${d.type} | ${d.path} |\n`;
    md += '\n';
  }
}
md += '</details>\n\n';

md += '---\n\n';
md += `Suggested PR title:\n\n**${title}**\n\n`;
md += 'Suggested PR body:\n\n';
md += md; // include the same content as body for convenience

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, md);
console.log('Wrote PR suggestion to', outFile);
