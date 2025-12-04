#!/usr/bin/env node
/**
 * Compare per-region app directories against a baseline template and emit a diff report.
 *
 * Usage:
 *   node scripts/check-align-regions.mjs [--baseline region-pnw] [--out-dir .check-unaligned-region] [--format json|diff] [--staged] [--git]
 *
 * Writes the report into the chosen output directory for follow-up scripts such as
 * `scripts/post-check-report.mjs` or `scripts/prioritize-diffs.mjs`.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { spawnSync } from 'child_process';
import { minimatch } from 'minimatch';

// Basic CLI parsing (lightweight)
const argv = process.argv.slice(2);
const args = {};
let i = 0;
while (i < argv.length) {
  const a = argv[i];
  if (a === '--baseline' && argv[i + 1]) { args.baseline = argv[i + 1]; i += 2; }
  else if (a === '--out-dir' && argv[i + 1]) { args.out = argv[i + 1]; i += 2; }
  else if (a === '--ignore' && argv[i + 1]) { args.ignore = argv[i + 1].split(','); i += 2; }
  else if (a === '--verbose') { args.verbose = true; i += 1; }
  else if (a === '--format' && argv[i + 1]) { args.format = argv[i + 1]; i += 2; }
  else if (a === '--git') { args.git = true; i += 1; }
  else if (a === '--input' && argv[i + 1]) { args.input = argv[i + 1]; i += 2; }
  else if (a === '--auto-accept-baseline') { args.autoAcceptBaseline = true; i += 1; }
  else if (a === '--fail-on-review') { args.failOnReview = true; i += 1; }
  else if (a === '--run-lint') { args.runLint = true; i += 1; }
  else if (a === '--run-typecheck') { args.runTypecheck = true; i += 1; }
  else if (a === '--output' && argv[i + 1]) { args.output = argv[i + 1]; i += 2; }
  else if (a === '--staged') { args.staged = true; i += 1; }
  else if (a === '--demo') { args.demo = true; i += 1; }
  else if (a === '--whitelist-file' && argv[i + 1]) { args.whitelist = argv[i + 1]; i += 2; }
  else { console.error('Unknown arg', a); process.exit(2); }
}

// Defaults
const ROOT = path.resolve(process.cwd());
if (!args.whitelist) {
  const defaultWhitelist = path.join(ROOT, 'scripts', 'check-align-whitelist.txt');
  if (fs.existsSync(defaultWhitelist)) {
    args.whitelist = defaultWhitelist; // default to repo-managed whitelist for known safe diffs
  }
}
const APPS_DIR = path.join(ROOT, 'apps');
const DEFAULT_OUT = path.join(ROOT, '.check-unaligned-region');
const OUT_DIR = args.out ? path.resolve(ROOT, args.out) : DEFAULT_OUT;
const BASELINE_NAME = args.baseline || (args.demo ? 'region-template' : 'region-pnw');
const DEFAULT_IGNORE = [
  'node_modules', '.next', '.turbo', '.git', 'dist', 'build', 'coverage',
  'pnpm-lock.yaml', 'package-lock.json', 'yarn.lock',
  // Do not check env files by default
  '.env', '.env.local', '.env.local.example', '.env.example', '.env.*', 'public/us-counties.json',
  'brand_settings.ts'
];
const IGNORE_PATTERNS = Array.isArray(args.ignore) ? DEFAULT_IGNORE.concat(args.ignore) : DEFAULT_IGNORE;
const FORMAT = args.format || 'json'; // json or diff

function log(...s) { if (args.verbose) console.log(...s); }

// Provides throttled progress updates so long tasks emit feedback every few seconds.
function createStatusReporter(intervalMs = 2000) {
  let phase = null;
  let lastLogged = 0;
  let lastMessage = '';

  function emit(message, force = false) {
    const now = Date.now();
    if (!force && now - lastLogged < intervalMs) {
      lastMessage = message;
      return;
    }
    const prefix = phase ? `${phase} - ` : '';
    console.log(`[status] ${prefix}${message}`);
    lastLogged = now;
    lastMessage = message;
  }

  return {
    start(label, detail) {
      phase = label;
      if (detail) {
        emit(detail, true);
      } else {
        console.log(`[status] ${label}`);
        lastLogged = Date.now();
        lastMessage = label;
      }
    },
    tick(detail, force = false) {
      if (!detail) return;
      emit(detail, force);
    },
    done(detail) {
      const message = detail || 'done';
      emit(message, true);
      phase = null;
    },
    flush() {
      if (phase && lastMessage !== 'done') {
        emit('still running', true);
      }
    }
  };
}

function isIgnored(relative) {
  // support glob patterns via minimatch and also exact path segment matches
  return IGNORE_PATTERNS.some((p) => {
    try {
      if (minimatch(relative, p)) return true;
    } catch (e) {
      // fall back
    }
    return relative.split(path.sep).includes(p);
  });
}

function hashFile(filePath) {
  // Read as text and normalize certain known non-functional blocks (like per-region metadata)
  const raw = fs.readFileSync(filePath, 'utf8');
  const normalized = normalizeContentForAlignment(filePath, raw);
  // Run Prettier normalization to avoid flagging mere formatting/quote-style differences.
  const pretty = tryPrettierFormat(filePath, normalized);
  const toHash = pretty != null ? pretty : normalized;
  const hash = crypto.createHash('sha256');
  hash.update(toHash, 'utf8');
  return hash.digest('hex');
}

function tryPrettierFormat(filePath, content) {
  if (!content) return content;
  try {
    const ext = path.extname(filePath).toLowerCase();
    const formattableExt = new Set(['.js', '.cjs', '.mjs', '.ts', '.tsx', '.jsx', '.json', '.md', '.css', '.scss']);
    if (!formattableExt.has(ext)) return content;
    // Use the Prettier CLI synchronously to avoid async/plugin resolution differences in the API.
    const res = spawnSync('npx', ['prettier', '--stdin-filepath', filePath], { input: content, encoding: 'utf8' });
    if (res.status === 0 && res.stdout) return res.stdout;
    log('Prettier CLI failed for', filePath, res.stderr || res.status);
    return content;
  } catch (e) {
    log('Prettier normalization exception for', filePath, e && e.message);
    return content;
  }
}

// Normalize file contents for alignment checks. This removes or replaces blocks that are
// intentionally region-specific (for example the `export const metadata` block in
// `apps/<region>/app/layout.tsx`) so those differences don't cause spurious diffs.
function normalizeContentForAlignment(filePath, content) {
  if (!content) return content;
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');

  // Ignore the metadata block in app/layout.tsx files under apps/<region>/app/layout.tsx
  if (/^apps\/[\w-]+\/app\/layout\.tsx$/.test(rel)) {
    const metaPattern = /\/\/\s*-+\s*Metadata\s*-+[\s\S]*?export\s+const\s+metadata[\s\S]*?\n\};/;
    if (metaPattern.test(content)) {
      return content.replace(metaPattern, '// METADATA_BLOCK_IGNORED_BY_CHECK_ALIGN\n');
    }
  }

  // Ignore region-specific package.json `description` fields
  if (/^apps\/[\w-]+\/package\.json$/.test(rel)) {
    try {
      const obj = JSON.parse(content);
      if (obj && typeof obj === 'object' && 'description' in obj) {
        delete obj.description;
        return JSON.stringify(obj, null, 2);
      }
    } catch (e) {
      // if parsing fails, fall back to raw content
    }
  }

  // Ignore providerKey line in providers files under apps/<region>/providers/*
  if (/^apps\/[\w-]+\/providers\/.+/.test(rel)) {
    // Remove any line containing 'storageKey'
    return content.split(/\r?\n/).map(line => line.includes('storageKey') ? '// STORAGE_KEY_IGNORED_BY_CHECK_ALIGN' : line).join('\n');
  }

  return content;
}

function walkDir(dir, base = dir, trackedSet = null, progress = null, progressState = null) {
  const files = [];
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
    if (progress && progressState) {
      progressState.count = (progressState.count || 0) + 1;
      if (progressState.count === 1 || progressState.count % 50 === 0) {
        const prefix = progressState.labelPrefix || '';
        const detail = rel || ent.name || '.';
        progress.tick(`${prefix}${detail}`);
      }
    }
    if (ent.isDirectory()) {
      files.push(...walkDir(full, base, trackedSet, progress, progressState));
    } else if (ent.isFile()) {
      files.push({ full, rel });
    }
  }
  return files;
}

function ensureOut() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
}

function clearOut() {
  if (fs.existsSync(OUT_DIR)) {
    fs.rmSync(OUT_DIR, { recursive: true, force: true });
  }
}

function gitTrackedFiles() {
  try {
    const res = spawnSync('git', ['ls-files'], { cwd: ROOT, encoding: 'utf8' });
    if (res.status !== 0) return null;
    const lines = res.stdout.split(/\r?\n/).filter(Boolean);
    return new Set(lines.map(l => path.normalize(l)));
  } catch (e) {
    return null;
  }
}

function gitStagedFiles() {
  try {
    const res = spawnSync('git', ['diff', '--name-only', '--staged'], { cwd: ROOT, encoding: 'utf8' });
    if (res.status !== 0) return null;
    const lines = res.stdout.split(/\r?\n/).filter(Boolean);
    return new Set(lines.map(l => path.normalize(l)));
  } catch (e) {
    return null;
  }
}

function readWhitelist(whitelistFile) {
  if (!whitelistFile) return null;
  const p = path.resolve(ROOT, whitelistFile);
  if (!fs.existsSync(p)) return null;
  const data = fs.readFileSync(p, 'utf8').split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  return data; // patterns or exact paths relative to region root
}

function generateUnifiedDiff(aPath, bPath) {
  // fallback to simple line-by-line diff using git diff --no-index
  try {
    const res = spawnSync('git', ['--no-pager', 'diff', '--no-index', '--color=never', aPath, bPath], { encoding: 'utf8' });
    return res.stdout || '';
  } catch (e) {
    return '';
  }
}

// ---- New helpers: classification, secret scanning, manifest/sw checks, reporting ----

const CRITICAL_PATTERNS = [
  /^app\/api\/admin(\/|$)/,
  /^public\/sw\.js$/,
  /^public\/site\.webmanifest$/,
  /^package\.json$/
];

const REVIEW_PATTERNS = [
  /^app\/api(\/|$)/,
  /^app\/sign-up(\/|$)/,
  /^app\/page\.tsx$/,
  /^components\/dataLayer\//
];

const BASELINE_PATTERNS = [/nav\.config\.ts$/, /^providers\//, /lib\/guards\.ts$/];

const SECRET_REGEXES = [
  /SUPABASE_SERVICE_ROLE_KEY/i,
  /-----BEGIN (?:RSA )?PRIVATE KEY-----/i,
  /\bAKIA[0-9A-Z]{16}\b/, // AWS access key-ish
  /(?:secret|token|password|private[-_ ]?key)[=:\"'\s]*[A-Za-z0-9\-_.+\/=]{20,}/i
];

function classifyPath(rel) {
  if (CRITICAL_PATTERNS.some(r => r.test(rel))) return 'critical';
  if (BASELINE_PATTERNS.some(r => r.test(rel))) return 'baseline';
  if (REVIEW_PATTERNS.some(r => r.test(rel))) return 'review';
  return 'review';
}

function fileHasIgnoreMarker(filePath) {
  try {
    const c = fs.readFileSync(filePath, 'utf8');
    return c.includes('// check-align-ignore');
  } catch (e) {
    return false;
  }
}

function secretScanFile(filePath) {
  const issues = [];
  if (!fs.existsSync(filePath)) return issues;
  if (fileHasIgnoreMarker(filePath)) return issues;
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li];
    for (const rx of SECRET_REGEXES) {
      const m = line.match(rx);
      if (m) {
        issues.push({ type: 'secret', message: `Possible secret match: ${m[0].slice(0, 120)}`, line: li + 1, snippet: line.trim() });
      }
    }
  }
  return issues;
}

function parseJsonSafe(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return null; }
}

function validateManifest(regionFullPath) {
  const issues = [];
  if (!fs.existsSync(regionFullPath)) return issues;
  const data = parseJsonSafe(regionFullPath);
  if (!data) { issues.push({ type: 'manifest', message: 'Invalid JSON' }); return issues; }
  if (!data.name && !data.short_name) issues.push({ type: 'manifest', message: 'missing name/short_name' });
  if (!Array.isArray(data.icons) || data.icons.length === 0) issues.push({ type: 'manifest', message: 'missing icons array' });
  else {
    // Check icons exist relative to region public or root public
    for (const ic of data.icons) {
      const src = ic.src;
      if (!src) { issues.push({ type: 'manifest', message: 'icon missing src' }); continue; }
      // try absolute and relative resolution
      const cand = [];
      if (src.startsWith('/')) {
        cand.push(path.join(ROOT, 'apps', path.sep)); // dummy to try later
      }
      // try path relative to manifest dir
      cand.push(path.join(path.dirname(regionFullPath), src.replace(/^\//, '')));
      let exists = false;
      for (const c of cand) {
        try { if (fs.existsSync(c)) { exists = true; break; } } catch (e) { }
      }
      if (!exists) issues.push({ type: 'manifest', message: `icon not found: ${src}` });
    }
  }
  return issues;
}

function extractCacheNames(content) {
  const names = new Set();
  const rx = /CACHE[_-]?NAME\s*[:=]\s*["'`]([^"'`\n]+)["'`]/ig;
  let m;
  while ((m = rx.exec(content)) !== null) names.add(m[1]);
  // also look for cache-v1 style strings
  const rx2 = /cache[-_]v[0-9]+/ig;
  while ((m = rx2.exec(content)) !== null) names.add(m[0]);
  return Array.from(names);
}

function validateServiceWorker(baselineFull, regionFull) {
  const issues = [];
  if (!fs.existsSync(regionFull)) return issues;
  const regionContent = fs.readFileSync(regionFull, 'utf8');
  const baselineContent = fs.existsSync(baselineFull) ? fs.readFileSync(baselineFull, 'utf8') : '';
  const rNames = extractCacheNames(regionContent);
  const bNames = extractCacheNames(baselineContent);
  if (rNames.length === 0 && bNames.length === 0) {
    issues.push({ type: 'sw', message: 'could not detect cache name/version heuristics' });
  } else if (JSON.stringify(rNames) === JSON.stringify(bNames)) {
    issues.push({ type: 'sw', message: 'cache name/version appears unchanged between baseline and region; manual review recommended' });
  }
  return issues;
}

function checkPackageLockConsistency() {
  // If working in a git repo, look for pnpm-lock.yaml changes in git diff name-only
  const issues = [];
  try {
    const res = spawnSync('git', ['diff', '--name-only', 'HEAD'], { cwd: ROOT, encoding: 'utf8' });
    const unstaged = (res.stdout || '').split(/\r?\n/).filter(Boolean);
    const stagedRes = spawnSync('git', ['diff', '--name-only', '--staged'], { cwd: ROOT, encoding: 'utf8' });
    const staged = (stagedRes.stdout || '').split(/\r?\n/).filter(Boolean);
    const all = new Set([...unstaged, ...staged]);
    if (!all.has('pnpm-lock.yaml') && !all.has('package-lock.json') && !all.has('yarn.lock')) {
      issues.push({ type: 'lockfile', message: 'package.json changed but lockfile (pnpm-lock.yaml/package-lock.json/yarn.lock) not changed/staged' });
    }
  } catch (e) {
    // ignore
  }
  return issues;
}

function runCmd(cmd, argsArr, opts = {}) {
  try {
    const res = spawnSync(cmd, argsArr, Object.assign({ cwd: ROOT, stdio: 'pipe', encoding: 'utf8' }, opts));
    return { status: res.status, stdout: res.stdout || '', stderr: res.stderr || '' };
  } catch (e) {
    return { status: 1, stdout: '', stderr: String(e) };
  }
}

function runTypecheckAndLintForRegions(regionsWithJsTs) {
  const results = {};
  if (!regionsWithJsTs || regionsWithJsTs.length === 0) return results;
  for (const region of regionsWithJsTs) {
    // Try to read apps/<region>/package.json to get package name for -F selector
    const pkgPath = path.join(APPS_DIR, region, 'package.json');
    let pkgName = null;
    if (fs.existsSync(pkgPath)) {
      try { pkgName = JSON.parse(fs.readFileSync(pkgPath, 'utf8')).name; } catch (e) { pkgName = null; }
    }
    if (args.runTypecheck) {
      const cmdArgs = pkgName ? ['-w', '-s', '-F', pkgName, 'typecheck'] : ['-w', '-s', 'typecheck'];
      results[region] = results[region] || {};
      const r = runCmd('pnpm', cmdArgs);
      results[region].typecheck = r;
    }
    if (args.runLint) {
      const cmdArgs = pkgName ? ['-w', '-s', '-F', pkgName, 'lint'] : ['-w', '-s', 'lint'];
      results[region] = results[region] || {};
      const r = runCmd('pnpm', cmdArgs);
      results[region].lint = r;
    }
  }
  return results;
}

function writeReport(outPath, reportObj) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(reportObj, null, 2));
}

function writeHumanReport(outDir, reportObj) {
  const lines = [];
  lines.push(`# Alignment report — ${reportObj.generatedAt}`);
  lines.push('');
  lines.push(`Baseline: ${reportObj.baseline}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push(`- Critical: ${reportObj.summaryCounts.critical || 0}`);
  lines.push(`- Review: ${reportObj.summaryCounts.review || 0}`);
  lines.push(`- Baseline: ${reportObj.summaryCounts.baseline || 0}`);
  lines.push('');
  for (const [region, rinfo] of Object.entries(reportObj.regions)) {
    lines.push(`## Region: ${region} — ${rinfo.diffsCount} diffs`);
    lines.push('');
    const bySeverity = { critical: [], review: [], baseline: [] };
    // Suppress whitelisted files from report output
    const whitelist = readWhitelist(args.whitelist);
    function isWhitelisted(path) {
      return whitelist && whitelist.some(pattern => minimatch(path, pattern));
    }
    for (const d of rinfo.diffs) {
      if (!isWhitelisted(d.path)) {
        (bySeverity[d.severity] = bySeverity[d.severity] || []).push(d);
      }
    }
    if (bySeverity.critical.length) {
      lines.push('### Critical');
      for (const it of bySeverity.critical) {
        lines.push(`- ${it.path} — ${it.type}${it.issues && it.issues.length ? ' (' + it.issues.map(x => x.message || x.type).join('; ') + ')' : ''}`);
      }
      lines.push('');
    }
    if (bySeverity.review.length) {
      lines.push('### Review');
      for (const it of bySeverity.review) {
        lines.push(`- ${it.path} — ${it.type}${it.issues && it.issues.length ? ' (' + it.issues.map(x => x.message || x.type).join('; ') + ')' : ''}`);
      }
      lines.push('');
    }
    if (bySeverity.baseline.length) {
      lines.push('### Baseline (candidates)');
      for (const it of bySeverity.baseline) {
        lines.push(`- ${it.path} — ${it.type}`);
      }
      lines.push('');
    }
  }

  const md = lines.join('\n');
  const outPath = path.join(outDir, 'report.md');
  fs.writeFileSync(outPath, md);
  return outPath;
}

function writePrSuggestion(outDir, reportObj) {
  const genAt = reportObj.generatedAt || new Date().toISOString();
  const baseline = reportObj.baseline || BASELINE_NAME;
  const regions = Object.keys(reportObj.regions || {});
  const counts = reportObj.summaryCounts || { critical: 0, review: 0, baseline: 0 };

  const lines = [];
  lines.push(`# Align regions with baseline: ${baseline}`);
  lines.push('');
  lines.push('**Summary**');
  lines.push('');
  lines.push(`- Baseline: **${baseline}**`);
  lines.push(`- Compared at: ${genAt}`);
  lines.push(`- Regions checked: ${regions.join(', ') || 'none'}`);
  lines.push(`- Totals (from automated scan): critical: ${counts.critical || 0}, review: ${counts.review || 0}, baseline candidates: ${counts.baseline || 0}`);
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## High-level recommendations');
  lines.push('');
  lines.push('- Manual review (CRITICAL): admin API routes, `package.json` diffs, `public/site.webmanifest`, `public/sw.js`. These must be reviewed for auth/service-role usage, cache/versioning, and dependency changes.');
  lines.push('- Human review (REVIEW): pages, non-admin API routes, and data-layer files. Verify data shapes, RLS/auth, and UI behavior.');
  lines.push('- Baseline candidates (AUTO-ACCEPT after validation): `nav.config.ts`, `providers/*`, `lib/guards.ts` — safe to accept if lint/typecheck pass.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Per-region highlights');
  lines.push('');
  for (const r of regions) {
    const info = reportObj.regions[r] || { diffsCount: 0 };
    const criticals = (info.diffs || []).filter(d => d.severity === 'critical').map(d => d.path);
    const reviews = (info.diffs || []).filter(d => d.severity === 'review').map(d => d.path);
    const baselines = (info.diffs || []).filter(d => d.severity === 'baseline').map(d => d.path);
    lines.push(`- ${r} (${info.diffsCount || 0} diffs): critical: ${criticals.length}, review: ${reviews.length}, baseline candidates: ${baselines.length}`);
  }
  lines.push('');
  lines.push('---');
  lines.push('');
  // Suppress whitelisted files from manual review section
  lines.push('## Files requiring manual review (do not auto-accept)');
  lines.push('');
  lines.push('- `app/api/admin/**` (admin routes)');
  const whitelist = readWhitelist(args.whitelist);
  function isWhitelisted(path) {
    return whitelist && whitelist.some(pattern => minimatch(path, pattern));
  }
  // Only show files not whitelisted
  const manualFiles = ['public/site.webmanifest', 'public/sw.js', 'package.json'];
  for (const f of manualFiles) {
    if (!isWhitelisted(f)) {
      lines.push(`- \${f}`);
    }
  }
  lines.push('');
  lines.push('## Baseline candidates (safe to accept if validation passes)');
  lines.push('');
  lines.push('- `nav.config.ts`');
  lines.push('- `providers/*`');
  lines.push('- `lib/guards.ts`');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## Per-file diffs (selected)');
  lines.push('');
  // include diffs for content_mismatch files (first N lines)
  for (const r of regions) {
    const info = reportObj.regions[r] || { diffs: [] };
    const mismatches = (info.diffs || []).filter(d => d.type === 'content_mismatch');
    if (mismatches.length === 0) continue;
    lines.push(`### ${r} — ${mismatches.length} content_mismatch(s)`);
    lines.push('');
    for (const m of mismatches) {
      const diffRel = path.join(r, m.path + '.diff');
      const diffFull = path.join(OUT_DIR, diffRel);
      lines.push(`#### ${m.path}`);
      lines.push('');
      lines.push(`Diff file: 
  - ".check-unaligned-region/${diffRel}"`);
      lines.push('');
      try {
        if (fs.existsSync(diffFull)) {
          const raw = fs.readFileSync(diffFull, 'utf8').split(/\r?\n/).slice(0, 200).join('\n');
          lines.push('```diff');
          lines.push(raw || '(empty diff)');
          lines.push('```');
        } else {
          lines.push('(diff file not found)');
        }
      } catch (e) {
        lines.push('(failed to read diff)');
      }
      lines.push('');
    }
  }

  lines.push('## Secret-note files');
  lines.push('');
  lines.push('- `README.md` in regions: flagged for `SUPABASE_SERVICE_ROLE_KEY` — likely documentation. If confirmed, add to the whitelist or add `// check-align-ignore` to suppress future warnings.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('## QA checklist');
  lines.push('');
  lines.push('- [ ] Human review: inspect all `app/api/admin/**` changes for accidental service-role usage or permission changes.');
  lines.push('- [ ] Human review: inspect `public/sw.js` and `public/site.webmanifest` for cache/version changes and icon existence.');
  lines.push('- [ ] Human review: inspect `package.json` diffs and confirm lockfile update (pnpm-lock.yaml / package-lock.json / yarn.lock).');
  lines.push('- [ ] Regenerate report locally and validate results:');
  lines.push('```');
  lines.push('node scripts/check-align-regions.mjs --input .check-unaligned-region/prioritized-diffs.json --out-dir .check-unaligned-region --run-lint --run-typecheck --verbose');
  lines.push('```');
  lines.push('- [ ] Confirm `.check-unaligned-region/report.json` and `.check-unaligned-region/report.md` are up to date.');
  lines.push('- [ ] Run full workspace build (optional but recommended):');
  lines.push('```');
  lines.push('pnpm install');
  lines.push('pnpm -w build');
  lines.push('```');
  lines.push('- [ ] If accepting baseline candidates, confirm lint/typecheck pass (the script uses `--run-lint --run-typecheck`).');
  lines.push('- [ ] Security signoff: confirm README secret flags are documentation, add whitelist or ignore markers as needed.');
  lines.push('- [ ] Approve and merge.');

  const outPath = path.join(outDir, 'pr_suggestion.md');
  fs.writeFileSync(outPath, lines.join('\n'));
  return outPath;
}


function compareRegions() {
  if (!fs.existsSync(APPS_DIR)) {
    console.error('apps directory not found at', APPS_DIR);
    process.exit(2);
  }

  const status = createStatusReporter();

  clearOut();
  ensureOut();

  status.start(`Discovering region apps inside ${APPS_DIR}`);
  const allRegions = fs.readdirSync(APPS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name.startsWith('region-'))
    .map(d => d.name);
  status.tick(`Found ${allRegions.length} region app(s)`);
  status.done('Region discovery complete');

  let baselineName = BASELINE_NAME;
  if (!allRegions.includes(baselineName)) {
    console.error('Baseline', baselineName, 'not found in', APPS_DIR);
    process.exit(2);
  }

  const compareTargets = args.demo
    ? ['region-template']
    : allRegions.filter((r) => r !== baselineName && r !== 'region-template');

  console.log(`[status] Starting alignment check with baseline ${baselineName}. Target regions: ${compareTargets.length ? compareTargets.join(', ') : 'none'}.`);

  let tracked = null;
  if (args.git) tracked = gitTrackedFiles();
  if (args.staged) {
    const s = gitStagedFiles();
    if (s) tracked = s;
  }

  const whitelist = readWhitelist(args.whitelist);
  let whitelistMatchers = null;
  if (whitelist) whitelistMatchers = whitelist.map(p => p.trim());

  const baselinePath = path.join(APPS_DIR, baselineName);
  status.start(`Collecting baseline file hashes for ${baselineName}`);
  const baselineProgressState = { count: 0, labelPrefix: `${baselineName}: ` };
  const baselineEntries = walkDir(baselinePath, baselinePath, tracked, status, baselineProgressState);
  const baselineFiles = {};
  let baselineHashCount = 0;
  for (const entry of baselineEntries) {
    baselineHashCount += 1;
    if (baselineHashCount === 1 || baselineHashCount % 100 === 0) {
      status.tick(`hash baseline ${baselineHashCount}/${baselineEntries.length}`);
    }
    baselineFiles[entry.rel] = { full: entry.full, hash: hashFile(entry.full) };
  }
  status.done(`Baseline inventory ready (${Object.keys(baselineFiles).length} files)`);

  const summary = { baseline: baselineName, comparedAt: new Date().toISOString(), format: FORMAT, regions: {} };
  let anyDiff = false;

  for (const region of compareTargets) {
    const regionPath = path.join(APPS_DIR, region);
    status.start(`Collecting file hashes for ${region}`);
    const regionProgressState = { count: 0, labelPrefix: `${region}: ` };
    const regionEntries = walkDir(regionPath, regionPath, tracked, status, regionProgressState);
    const regionFiles = {};
    let regionHashCount = 0;
    for (const entry of regionEntries) {
      regionHashCount += 1;
      if (regionHashCount === 1 || regionHashCount % 100 === 0) {
        status.tick(`hash ${region} ${regionHashCount}/${regionEntries.length}`);
      }
      regionFiles[entry.rel] = { full: entry.full, hash: hashFile(entry.full) };
    }
    status.done(`Collected ${Object.keys(regionFiles).length} files for ${region}`);

    const diffs = [];
    const fileIssues = {};
    const jsTsTouched = new Set();

    status.start(`Diffing ${region} against ${baselineName}`);
    const baselineKeys = Object.keys(baselineFiles);
    let processedBaseline = 0;
    for (const rel of baselineKeys) {
      processedBaseline += 1;
      if (processedBaseline === 1 || processedBaseline % 200 === 0) {
        status.tick(`baseline ${processedBaseline}/${baselineKeys.length}`);
      }
      if (whitelistMatchers && whitelistMatchers.some(pattern => minimatch(rel, pattern))) continue;
      const base = baselineFiles[rel];
      const other = regionFiles[rel];
      if (!other) {
        diffs.push({ type: 'missing_in_region', path: rel });
        fileIssues[rel] = fileIssues[rel] || [];
        fileIssues[rel].push({ type: 'missing_in_region' });
        continue;
      }
      if (base.hash !== other.hash) {
        diffs.push({ type: 'content_mismatch', path: rel });
        fileIssues[rel] = fileIssues[rel] || [];
        fileIssues[rel].push({ type: 'content_mismatch' });
        if (/\.(?:ts|tsx|js|jsx)$/.test(rel)) jsTsTouched.add(region);
      }
    }

    status.tick('checking extras');
    let processedExtras = 0;
    for (const rel of Object.keys(regionFiles)) {
      processedExtras += 1;
      if (processedExtras === 1 || processedExtras % 200 === 0) {
        status.tick(`extras ${processedExtras}`);
      }
      if (whitelistMatchers && whitelistMatchers.some(pattern => minimatch(rel, pattern))) continue;
      if (!baselineFiles[rel]) {
        diffs.push({ type: 'extra_in_region', path: rel });
      }
    }
    status.done(`Diffing complete for ${region} (${diffs.length} diff(s))`);

    status.start(`Classifying findings for ${region}`);
    for (let index = 0; index < diffs.length; index += 1) {
      if (diffs.length && ((index + 1) === 1 || (index + 1) % 50 === 0)) {
        status.tick(`diff ${index + 1}/${diffs.length}`);
      }
      const d = diffs[index];
      const relPath = d.path;
      const severity = classifyPath(relPath);
      const fullRegionPath = path.join(regionPath, relPath);
      const fullBaselinePath = path.join(baselinePath, relPath);
      const issues = [];

      const secretIssues = secretScanFile(fullRegionPath);
      if (secretIssues.length) issues.push(...secretIssues);

      if (/^public\/site\.webmanifest$/.test(relPath)) {
        const manIssues = validateManifest(fullRegionPath);
        if (manIssues.length) issues.push(...manIssues);
      }

      if (/^public\/sw\.js$/.test(relPath)) {
        const swIssues = validateServiceWorker(fullBaselinePath, fullRegionPath);
        if (swIssues.length) issues.push(...swIssues);
      }

      if (/^package\.json$/.test(relPath)) {
        const lockIssues = checkPackageLockConsistency();
        if (lockIssues.length) issues.push(...lockIssues);
      }

      if (issues.length) fileIssues[relPath] = (fileIssues[relPath] || []).concat(issues);

      d.severity = severity;
      d.issues = fileIssues[relPath] || [];
    }
    status.done(`Classification complete for ${region}`);

    summary.regions[region] = { diffsCount: diffs.length, diffs };

    if (diffs.length > 0) {
      anyDiff = true;
      const regionOut = path.join(OUT_DIR, region);
      fs.mkdirSync(regionOut, { recursive: true });

      status.start(`Writing diff artifacts for ${region}`);
      let artifactIndex = 0;

      for (const d of diffs) {
        artifactIndex += 1;
        if (artifactIndex === 1 || artifactIndex % 25 === 0) {
          status.tick(`artifact ${artifactIndex}/${diffs.length}`);
        }

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
          const diff = generateUnifiedDiff(destBase, destRegion);
          const diffOut = path.join(regionOut, d.path + '.diff');
          try {
            fs.mkdirSync(path.dirname(diffOut), { recursive: true });
            fs.writeFileSync(diffOut, diff);
          } catch (e) {
            // ignore write errors
          }
        }
      }
      status.done(`Artifacts generated for ${region}`);
    }
  }

  status.start('Aggregating summary data');
  const regionsWithJsTs = [];
  for (const r of Object.keys(summary.regions)) {
    const diffs = summary.regions[r].diffs || [];
    if (diffs.some(d => /\.(?:ts|tsx|js|jsx)$/.test(d.path))) regionsWithJsTs.push(r);
  }
  status.done('Summary aggregation complete');

  status.start('Running optional validation commands');
  const validationResults = runTypecheckAndLintForRegions(regionsWithJsTs);
  status.done('Validation commands finished');
  summary.validation = validationResults;

  status.start('Constructing final report');
  const report = { generatedAt: new Date().toISOString(), baseline: baselineName, regions: {}, summaryCounts: { critical: 0, review: 0, baseline: 0 }, anyDiff };
  const regionEntries = Object.entries(summary.regions);
  let regionIndex = 0;
  for (const [region, info] of regionEntries) {
    regionIndex += 1;
    if (regionEntries.length && (regionIndex === 1 || regionIndex % 5 === 0)) {
      status.tick(`region ${regionIndex}/${regionEntries.length}`);
    }
    const rEntry = { diffsCount: info.diffsCount, diffs: [] };
    for (const d of info.diffs) {
      const rec = { path: d.path, type: d.type, severity: d.severity || classifyPath(d.path), issues: d.issues || [] };
      rEntry.diffs.push(rec);
      report.summaryCounts[rec.severity] = (report.summaryCounts[rec.severity] || 0) + 1;
    }
    report.regions[region] = rEntry;
  }
  status.done('Report construction complete');

  const autoAccepted = [];
  if (args.autoAcceptBaseline) {
    status.start('Auto-accepting baseline candidates');
    const baselineFilesToAccept = [];
    for (const [region, rinfo] of Object.entries(report.regions)) {
      for (const d of rinfo.diffs) {
        if (d.severity === 'baseline' && (!d.issues || d.issues.length === 0)) {
          baselineFilesToAccept.push({ region, path: d.path });
        }
      }
    }
    if (baselineFilesToAccept.length > 0) {
      const branchName = `auto/accept-baseline-${new Date().toISOString().replace(/[:.]/g, '-')}`;
      const checkout = runCmd('git', ['checkout', '-b', branchName]);
      if (checkout.status !== 0) {
        console.error('Failed to create branch for auto-accept:', checkout.stderr);
      } else {
        let acceptedCount = 0;
        for (const f of baselineFilesToAccept) {
          const src = path.join(APPS_DIR, baselineName, f.path);
          const dest = path.join(APPS_DIR, f.region, f.path);
          try {
            fs.mkdirSync(path.dirname(dest), { recursive: true });
            fs.copyFileSync(src, dest);
            runCmd('git', ['add', path.relative(ROOT, dest)]);
            autoAccepted.push(path.relative(ROOT, dest));
            acceptedCount += 1;
            if (acceptedCount % 10 === 0) {
              status.tick(`auto-accepted ${acceptedCount}/${baselineFilesToAccept.length}`);
            }
          } catch (e) {
            console.error('auto-accept copy failed for', f.path, e && e.message);
          }
        }
        const vt = runTypecheckAndLintForRegions(regionsWithJsTs);
        const anyFail = Object.values(vt).some(v => (v.typecheck && v.typecheck.status !== 0) || (v.lint && v.lint.status !== 0));
        if (anyFail) {
          console.error('Typecheck/lint failed after auto-accept; aborting commit.');
          runCmd('git', ['checkout', '--', '.']);
          runCmd('git', ['checkout', '-']);
        } else {
          runCmd('git', ['commit', '-m', `chore: accept baseline updates (${baselineName})`]);
          console.log('Created branch', branchName, 'with auto-accepted baseline files:', autoAccepted.length);
        }
      }
    }
    status.done('Auto-accept processing complete');
  }

  status.start('Writing reports to disk');
  const outReportPath = path.join(OUT_DIR, 'report.json');
  writeReport(outReportPath, report);
  if (args.output) writeReport(path.resolve(ROOT, args.output), report);
  try {
    const mdPath = writeHumanReport(OUT_DIR, report);
    console.log('Wrote human-readable report:', mdPath);
  } catch (e) {
    console.error('Failed to write human-readable report:', e && e.message);
  }
  try {
    const prPath = writePrSuggestion(OUT_DIR, report);
    console.log('Wrote PR suggestion:', prPath);
  } catch (e) {
    console.error('Failed to write PR suggestion:', e && e.message);
  }
  status.done('Report writing complete');

  status.flush();

  if (anyDiff) {
    console.log('Differences found. See', OUT_DIR, 'for details.');
  } else {
    console.log('All compared regions are aligned with', baselineName);
  }

  let exitCode = 0;
  if (Object.values(report.summaryCounts).length) {
    const criticalCount = report.summaryCounts.critical || 0;
    const reviewCount = report.summaryCounts.review || 0;
    if (criticalCount > 0) exitCode = 1;
    else if (args.failOnReview && reviewCount > 0) exitCode = 1;
  }
  process.exitCode = exitCode;
}

compareRegions();
