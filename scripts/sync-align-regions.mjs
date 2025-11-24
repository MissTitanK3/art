#!/usr/bin/env node
/**
 * Sync regions to the baseline based on .check-unaligned-region/report.json.
 *
 * Usage:
 *   node scripts/sync-align-regions.mjs [--report <path>] [--dry-run] [--remove-extra]
 *
 * - Copies baseline versions for diffs of type `missing_in_region` or `content_mismatch`.
 * - When --remove-extra is provided, deletes files reported as `extra_in_region`.
 * - Defaults to report at .check-unaligned-region/report.json and baseline from that report.
 */

import fs from 'fs';
import path from 'path';

const args = parseArgs(process.argv.slice(2));
const ROOT = path.resolve(process.cwd());
const REPORT_PATH =
  args.report || path.join(ROOT, '.check-unaligned-region', 'report.json');
const DRY_RUN = !!args.dryRun;
const REMOVE_EXTRA = !!args.removeExtra;

main().catch((err) => {
  console.error('[sync-regions] Failed:', err && err.message ? err.message : err);
  process.exit(1);
});

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--report' && argv[i + 1]) {
      out.report = path.resolve(argv[i + 1]);
      i += 1;
    } else if (a === '--dry-run') {
      out.dryRun = true;
    } else if (a === '--remove-extra') {
      out.removeExtra = true;
    } else {
      console.warn('[sync-regions] Ignoring unknown arg', a);
    }
  }
  return out;
}

async function main() {
  if (!fs.existsSync(REPORT_PATH)) {
    throw new Error(
      `Report not found at ${REPORT_PATH}. Run pnpm check:regions:full first.`,
    );
  }

  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
  const baseline = report.baseline || 'region-pnw';
  const regions = Object.keys(report.regions || {});
  if (!regions.length) {
    console.log('[sync-regions] No regions listed in report; nothing to do.');
    return;
  }

  const summary = [];
  for (const region of regions) {
    const diffs = report.regions[region]?.diffs || [];
    if (!diffs.length) {
      summary.push({ region, copied: 0, removed: 0 });
      continue;
    }
    let copied = 0;
    let removed = 0;
    for (const d of diffs) {
      const relPath = d.path;
      if (!relPath) continue;
      if (d.type === 'missing_in_region' || d.type === 'content_mismatch') {
        const src = path.join(ROOT, 'apps', baseline, relPath);
        const dest = path.join(ROOT, 'apps', region, relPath);
        if (!fs.existsSync(src)) {
          console.warn(
            `[sync-regions] Baseline file missing, skipping copy: ${src}`,
          );
          continue;
        }
        if (!DRY_RUN) {
          fs.mkdirSync(path.dirname(dest), { recursive: true });
          fs.copyFileSync(src, dest);
        }
        copied += 1;
        console.log(
          `[sync-regions] ${DRY_RUN ? 'Would copy' : 'Copied'} ${baseline}/${relPath} -> ${region}/${relPath}`,
        );
      } else if (d.type === 'extra_in_region') {
        const target = path.join(ROOT, 'apps', region, relPath);
        if (!fs.existsSync(target)) continue;
        if (!REMOVE_EXTRA) {
          console.log(
            `[sync-regions] Skipping extra_in_region (pass --remove-extra to delete): ${region}/${relPath}`,
          );
          continue;
        }
        if (!DRY_RUN) fs.rmSync(target, { force: true });
        removed += 1;
        console.log(
          `[sync-regions] ${DRY_RUN ? 'Would remove' : 'Removed'} ${region}/${relPath}`,
        );
      }
    }
    summary.push({ region, copied, removed });
  }

  console.log('\n[sync-regions] Summary:');
  for (const s of summary) {
    console.log(
      `- ${s.region}: copied ${s.copied} from ${baseline}${REMOVE_EXTRA ? `, removed ${s.removed} extras` : ''}`,
    );
  }
  if (DRY_RUN) {
    console.log('[sync-regions] Dry run only; rerun without --dry-run to apply.');
  }
}
