#!/usr/bin/env node
/**
 * Generate Academy course group metadata by scanning the `/courses` directory and decoding safe folder names.
 *
 * Usage:
 *   node scripts/generate-academy-groups.mjs
 *
 * Produces `course-groups.generated.ts`, which is used at runtime for grouping courses in the UI.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const COURSES_DIR = path.resolve(process.cwd(), 'packages/ui/src/data/academy/courses');
const OUT_FILE = path.resolve(process.cwd(), 'packages/ui/src/data/academy/course-groups.generated.ts');

function decodeSafeName(name) {
  const map = [
    [/__c__/g, ':'],
    [/__lp__/g, '('],
    [/__rp__/g, ')'],
    [/__and__/g, '&'],
    [/__amp__/g, '&'],
    [/__cm__/g, ','],
    [/__slash__/g, '/'],
    [/__ap__/g, "'"],
    [/__plus__/g, '+'],
  ];
  let s = name;
  for (const [re, sym] of map) s = s.replace(re, sym);
  // spaces are encoded as underscores; convert back for display label
  s = s.replace(/_/g, ' ');
  return s.trim();
}

function isDir(p) { try { return fs.statSync(p).isDirectory(); } catch { return false; } }
function isFile(p) { try { return fs.statSync(p).isFile(); } catch { return false; } }

function readFrontmatterIcon(abs) {
  try {
    const raw = fs.readFileSync(abs, 'utf8');
    const { data } = matter(raw);
    return typeof data.icon === 'string' ? data.icon : undefined;
  } catch { return undefined; }
}

function main() {
  if (!isDir(COURSES_DIR)) {
    console.error('[groups] courses dir not found:', COURSES_DIR);
    process.exit(1);
  }

  const entries = fs.readdirSync(COURSES_DIR, { withFileTypes: true });
  const groups = [];
  const rootFiles = [];

  for (const ent of entries) {
    const abs = path.join(COURSES_DIR, ent.name);
    if (ent.isDirectory()) {
      const label = decodeSafeName(ent.name);
      const files = fs.readdirSync(abs).filter((f) => f.toLowerCase().endsWith('.mdx'));
      const courses = files.map((f) => {
        const slug = f.replace(/\.mdx$/i, '');
        const icon = readFrontmatterIcon(path.join(abs, f));
        return { slug, icon };
      });
      groups.push({ label, courses });
    } else if (ent.isFile() && ent.name.toLowerCase().endsWith('.mdx')) {
      rootFiles.push(ent.name);
    }
  }

  // Build prioritized order: Getting Started + Levels at the top in this order
  const PRIORITY = [
    'Getting Started (Everyone)',
    'Level 1: Team Member Onboarding',
    'Level 2: Field Coordination Basics (Basic Dispatcher)',
    'Level 3: Dispatcher Certification (Verified Dispatcher)',
    'Level 4: Zone Lead (Admin Dispatcher)',
  ];

  const byLabel = new Map(groups.map((g) => [g.label, g]));
  const rest = groups.filter((g) => !PRIORITY.includes(g.label)).sort((a, b) => a.label.localeCompare(b.label));
  const ordered = [];
  for (const lbl of PRIORITY) {
    const g = byLabel.get(lbl);
    if (g) ordered.push(g);
  }
  ordered.push(...rest);

  // Append Ungrouped at the end if any root files exist
  if (rootFiles.length) {
    const courses = rootFiles.map((f) => {
      const slug = f.replace(/\.mdx$/i, '');
      const icon = readFrontmatterIcon(path.join(COURSES_DIR, f));
      return { slug, icon };
    });
    ordered.push({ label: 'Template', courses });
  }

  const header = `// AUTO-GENERATED — DO NOT EDIT\n`;
  const body = `import type { AcademyCourseGroupConfig } from './group-types';\n\nexport const GENERATED_ACADEMY_COURSE_GROUPS: AcademyCourseGroupConfig[] = ${JSON.stringify(ordered, null, 2)} as const;\n`;
  fs.writeFileSync(OUT_FILE, header + body, 'utf8');
  console.log('[groups] wrote', OUT_FILE, 'with', groups.length, 'groups');
}

main();
