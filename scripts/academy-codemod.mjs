#!/usr/bin/env node
/**
 * Academy MDX Codemod
 * - Normalize internal links to `/academy/<slug>` (fix `/academy/courses/*` and `/courses/*`).
 * - Fix invalid Callout types: `warn` -> `warning`.
 * - Bump frontmatter `version` minor by +0.1 (i.e., 1.2 -> 1.3).
 *
 * Usage:
 *   node scripts/academy-codemod.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const COURSES_DIR = path.resolve(process.cwd(), 'packages/ui/src/data/academy/courses');

function listMdx(dir) {
  return fs.readdirSync(dir).filter((f) => f.endsWith('.mdx'));
}

function bumpVersion(v) {
  if (!v || typeof v !== 'string') return '1.0';
  const m = v.trim().match(/^(\d+)\.(\d+)$/);
  if (!m) {
    // Try number-like fallback
    const n = Number(v);
    if (!Number.isFinite(n)) return v;
    const major = Math.floor(n);
    const minor = Math.round((n - major) * 10);
    return `${major}.${minor + 1}`;
  }
  const major = Number(m[1]);
  const minor = Number(m[2]);
  return `${major}.${minor + 1}`;
}

function transformContent(text) {
  let out = text;
  // Replace /academy/courses/<slug> -> /academy/<slug>
  out = out.replaceAll(/\/(academy)\/courses\//g, '/$1/');
  // Replace /courses/<slug> -> /academy/<slug>
  out = out.replaceAll(/\/(?:courses)\//g, '/academy/');
  // Fix Callout type
  out = out.replaceAll('<Callout type="warn">', '<Callout type="warning">');
  return out;
}

const files = listMdx(COURSES_DIR);
const changed = [];

for (const file of files) {
  const full = path.join(COURSES_DIR, file);
  const raw = fs.readFileSync(full, 'utf8');
  const orig = raw;
  const fm = matter(raw);

  // Update body content first
  fm.content = transformContent(fm.content);

  // Bump version (minor)
  const prev = typeof fm.data.version === 'number' ? String(fm.data.version) : fm.data.version;
  const next = bumpVersion(prev);
  fm.data.version = next;

  const updated = matter.stringify(fm.content.trimStart() + (fm.content.endsWith('\n') ? '' : '\n'), fm.data);

  if (updated !== orig) {
    fs.writeFileSync(full, updated, 'utf8');
    changed.push({ file, from: prev, to: next });
  }
}

console.log(`Updated ${changed.length} files:`);
for (const c of changed) {
  console.log(` - ${c.file}: ${c.from} -> ${c.to}`);
}
