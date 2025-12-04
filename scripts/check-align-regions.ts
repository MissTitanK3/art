#!/usr/bin/env node
/**
 * Compare per-region app directories against a baseline template and write detailed diff output.
 *
 * Usage:
 *   ts-node scripts/check-align-regions.ts [--baseline region-pnw] [--out-dir .check-unaligned-region] [--format json|diff] [--staged] [--git]
 *
 * Produces structured JSON reports that can be consumed by other automation or CI steps.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawnSync } from 'child_process';
import { minimatch } from 'minimatch';

type Args = {
  baseline?: string;
  out?: string;
  ignore?: string[];
  verbose?: boolean;
  format?: string;
  git?: boolean;
  staged?: boolean;
  demo?: boolean;
  whitelist?: string;
  paths?: string[];
};

const argv = process.argv.slice(2);
const args: Args = {};
for (let i = 0; i < argv.length; ) {
  const a = argv[i];
  if (a === '--baseline' && argv[i + 1]) {
    args.baseline = argv[i + 1];
    i += 2;
  } else if (a === '--out-dir' && argv[i + 1]) {
    args.out = argv[i + 1];
    i += 2;
  } else if (a === '--ignore' && argv[i + 1]) {
    args.ignore = typeof argv[i + 1] === 'string' ? (argv[i + 1] ?? '').split(',') : [];
    i += 2;
  } else if (a === '--verbose') {
    args.verbose = true;
    i += 1;
  } else if (a === '--format' && argv[i + 1]) {
    args.format = argv[i + 1];
    i += 2;
  } else if (a === '--git') {
    args.git = true;
    i += 1;
  } else if (a === '--staged') {
    args.staged = true;
    i += 1;
  } else if (a === '--demo') {
    args.demo = true;
    i += 1;
  } else if (a === '--whitelist-file' && argv[i + 1]) {
    args.whitelist = argv[i + 1];
    i += 2;
  } else if (a === '--paths' && typeof argv[i + 1] === 'string' && argv[i + 1] !== undefined) {
    if (typeof argv[i + 1] === 'string' && argv[i + 1] !== undefined) {
      args.paths = (argv[i + 1] ?? '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    i += 2;
  } else {
    console.error('Unknown arg', a);
    process.exit(2);
  }
}

const ROOT = path.resolve(process.cwd());
const APPS_DIR = path.join(ROOT, 'apps');
const DEFAULT_OUT = path.join(ROOT, '.check-unaligned-region');
const OUT_DIR = args.out ? path.resolve(ROOT, args.out) : DEFAULT_OUT;
const BASELINE_NAME = args.baseline || (args.demo ? 'region-template' : 'region-pnw');
const DEFAULT_IGNORE = [
  'node_modules',
  '.next',
  '.turbo',
  '.git',
  'dist',
  'build',
  'coverage',
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
];
// Add env ignores by default
DEFAULT_IGNORE.push('.env', '.env.local', '.env.local.example', '.env.example', '.env.*');
const IGNORE_PATTERNS = Array.isArray(args.ignore) ? DEFAULT_IGNORE.concat(args.ignore) : DEFAULT_IGNORE;
const FORMAT = args.format || 'json';

function log(...s: any[]) {
  if (args.verbose) console.log(...s);
}

function isIgnored(relative: string) {
  return IGNORE_PATTERNS.some((p) => {
    try {
      if (minimatch(relative, p)) return true;
    } catch (e) {
      // ignore
    }
    return relative.split(path.sep).includes(p);
  });
}

function hashFile(filePath: string) {
  const hash = crypto.createHash('sha256');
  const data = fs.readFileSync(filePath);
  hash.update(data);
  return hash.digest('hex');
}

function gitTrackedFiles(): Set<string> | null {
  try {
    const res = spawnSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' });
    if (res.status !== 0) return null;
    const lines = res.stdout.split(/\r?\n/).filter(Boolean);
    return new Set(lines.map((l) => path.normalize(l)));
  } catch (e) {
    return null;
  }
}

function gitStagedFiles(): Set<string> | null {
  try {
    const res = spawnSync('git', ['diff', '--name-only', '--staged'], { cwd: ROOT, encoding: 'utf8' });
    if (res.status !== 0) return null;
    const lines = res.stdout.split(/\r?\n/).filter(Boolean);
    return new Set(lines.map((l) => path.normalize(l)));
  } catch (e) {
    return null;
  }
}

function walkDir(dir: string, base = dir, trackedSet: Set<string> | null = null) {
  const files: { full: string; rel: string }[] = [];
  if (!fs.existsSync(dir)) return files;
  const list = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of list) {
    const full = path.join(dir, ent.name);
    const rel = path.relative(base, full);
    if (isIgnored(rel)) continue;
    if (trackedSet) {
      const repoRelative = path.relative(ROOT, full);
      if (!trackedSet.has(path.normalize(repoRelative))) continue;
    }
    if (ent.isDirectory()) files.push(...walkDir(full, base, trackedSet));
    else if (ent.isFile()) files.push({ full, rel });
  }
  return files;
}

function ensureOut() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
}
function clearOut() {
  if (fs.existsSync(OUT_DIR)) fs.rmSync(OUT_DIR, { recursive: true, force: true });
}

function readWhitelist(whitelistFile?: string) {
  if (!whitelistFile) return null;
  const p = path.resolve(ROOT, whitelistFile);
  if (!fs.existsSync(p)) return null;
  const data = fs
    .readFileSync(p, 'utf8')
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  // return array of patterns (negative patterns start with '!')
  return data;
}

function generateUnifiedDiff(aPath: string, bPath: string) {
  try {
    const res = spawnSync('git', ['--no-pager', 'diff', '--no-index', '--color=never', aPath, bPath], {
      encoding: 'utf8',
    });
    return res.stdout || '';
  } catch (e) {
    return '';
  }
}

function matchWhitelist(rel: string, patterns: string[]) {
  // patterns can include negative globs starting with '!'
  let allowed = false;
  for (const p of patterns) {
    if (p.startsWith('!')) {
      const pattern = p.slice(1);
      if (minimatch(rel, pattern)) return false; // explicitly disallowed
      continue;
    }
    if (minimatch(rel, p)) allowed = true;
  }
  return allowed;
}

function compareRegions() {
  if (!fs.existsSync(APPS_DIR)) {
    console.error('apps directory not found at', APPS_DIR);
    process.exit(2);
  }
  clearOut();
  ensureOut();

  const allRegions = fs
    .readdirSync(APPS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name.startsWith('region-'))
    .map((d) => d.name);
  const baselineName = BASELINE_NAME;
  if (!allRegions.includes(baselineName)) {
    console.error('Baseline', baselineName, 'not found in', APPS_DIR);
    process.exit(2);
  }

  // Only include `region-template` when --demo flag is present
  const compareTargets = args.demo
    ? ['region-template']
    : args.paths
      ? args.paths.map((p) => p)
      : allRegions.filter((r) => r !== baselineName && r !== 'region-template');

  let tracked: Set<string> | null = null;
  if (args.git) tracked = gitTrackedFiles();
  if (args.staged) {
    const s = gitStagedFiles();
    if (s) tracked = s;
  }

  const whitelist = readWhitelist(args.whitelist);

  const baselinePath = path.join(APPS_DIR, baselineName);

  // If paths mode, only include those files from baseline
  const baselineFilesList = args.paths
    ? args.paths
        .map((p) => {
          const full = path.join(baselinePath, p);
          if (fs.existsSync(full) && fs.statSync(full).isFile()) return { full, rel: p };
          return null;
        })
        .filter(Boolean)
    : walkDir(baselinePath, baselinePath, tracked);

  const baselineFiles = baselineFilesList.reduce((acc: Record<string, { full: string; hash: string }>, f) => {
    if (f !== null) {
      acc[f.rel] = { full: f.full, hash: hashFile(f.full) };
    }
    return acc;
  }, {});

  const summary: any = { baseline: baselineName, comparedAt: new Date().toISOString(), format: FORMAT, regions: {} };
  let anyDiff = false;

  for (const region of compareTargets) {
    const regionPath = path.join(APPS_DIR, region);
    const regionFilesList = args.paths
      ? args.paths
          .map((p) => {
            const full = path.join(regionPath, p);
            if (fs.existsSync(full) && fs.statSync(full).isFile()) return { full, rel: p };
            return null;
          })
          .filter(Boolean)
      : walkDir(regionPath, regionPath, tracked);

    const regionFiles = regionFilesList.reduce((acc: Record<string, { full: string; hash: string }>, f) => {
      if (f !== null) {
        acc[f.rel] = { full: f.full, hash: hashFile(f.full) };
      }
      return acc;
    }, {});

    const diffs: any[] = [];

    for (const rel of Object.keys(baselineFiles)) {
      if (whitelist && matchWhitelist(rel, whitelist)) continue;
      const base = baselineFiles[rel];
      const other = regionFiles[rel];
      if (!other) {
        diffs.push({ type: 'missing_in_region', path: rel });
        continue;
      }
      if (base && base.hash !== other.hash) diffs.push({ type: 'content_mismatch', path: rel });
    }

    for (const rel of Object.keys(regionFiles)) {
      if (whitelist && matchWhitelist(rel, whitelist)) continue;
      if (!baselineFiles[rel]) diffs.push({ type: 'extra_in_region', path: rel });
    }

    summary.regions[region] = { diffsCount: diffs.length, diffs };
    if (diffs.length > 0) {
      anyDiff = true;
      const regionOut = path.join(OUT_DIR, region);
      fs.mkdirSync(regionOut, { recursive: true });
      for (const d of diffs) {
        const outRelDir = path.dirname(d.path);
        const destDir = path.join(regionOut, outRelDir);
        if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
        if (d.type === 'missing_in_region') {
          const src = path.join(baselinePath, d.path);
          const dest = path.join(regionOut, d.path + '.baseline');
          if (fs.existsSync(src)) fs.copyFileSync(src, dest);
        } else if (d.type === 'extra_in_region') {
          const src = path.join(regionPath, d.path);
          const dest = path.join(regionOut, d.path + '.region');
          if (fs.existsSync(src)) fs.copyFileSync(src, dest);
        } else if (d.type === 'content_mismatch') {
          const srcBase = path.join(baselinePath, d.path);
          const srcRegion = path.join(regionPath, d.path);
          const destBase = path.join(regionOut, d.path + '.baseline');
          const destRegion = path.join(regionOut, d.path + '.region');
          if (fs.existsSync(srcBase)) fs.copyFileSync(srcBase, destBase);
          if (fs.existsSync(srcRegion)) fs.copyFileSync(srcRegion, destRegion);
          if (FORMAT === 'diff') {
            const diff = generateUnifiedDiff(destBase, destRegion);
            const diffOut = path.join(regionOut, d.path + '.diff');
            fs.writeFileSync(diffOut, diff);
          }
        }
      }
    }
  }

  fs.writeFileSync(path.join(OUT_DIR, 'report.json'), JSON.stringify(summary, null, 2));
  if (anyDiff) {
    console.log('Differences found. See', OUT_DIR, 'for details.');
    process.exitCode = 1;
  } else {
    console.log('All compared regions are aligned with', baselineName);
    process.exitCode = 0;
  }
}

compareRegions();
