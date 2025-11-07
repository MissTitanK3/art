#!/usr/bin/env node
/**
 * Validate Academy MDX content:
 * - Ensure frontmatter uses numeric `readingTime` (and report any `estimatedReadingTime`).
 * - Verify internal links to /courses/<slug> point to existing MDX slugs.
 *
 * Exits with code 1 if issues are found.
 */
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const COURSES_DIR = path.resolve(
  process.cwd(),
  'packages/ui/src/data/academy/courses'
);

/** Read all .mdx files and return an array of { file, slug, content } */
function readCourses() {
  const out = [];
  const walk = (dir) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(abs);
      else if (ent.isFile() && ent.name.toLowerCase().endsWith('.mdx')) {
        out.push({ file: abs, slug: ent.name.replace(/\.mdx?$/, '') });
      }
    }
  };
  walk(COURSES_DIR);
  return out.map(({ file, slug }) => ({ file, slug, content: fs.readFileSync(file, 'utf8') }));
}

/** Extract /courses/<slug> and /academy/<slug> link targets from MDX content */
function extractInternalCourseLinks(content) {
  const results = [];
  // Support markdown links:
  //  - ](/courses/slug) or ](/academy/slug) with optional #anchor or ?query
  //  - ](https://site.tld/courses/slug) and ](https://site.tld/academy/slug)
  const mdPatterns = [
    /\]\(\s*\/(?:courses|academy)\/([^/#?\s)]+)(?:[?#][^)]*)?\s*\)/g,
    /\]\(\s*(?:https?:\/\/[^)]+?)\/(?:courses|academy)\/([^/#?\s)]+)(?:[?#][^)]*)?\s*\)/g,
  ];
  // Support raw HTML anchors: <a href="/courses/slug"> or <a href="/academy/slug">
  const htmlPatterns = [
    /<a\s+[^>]*href=\"\/(?:courses|academy)\/([^\"#?\s>]+)(?:[?#][^\"]*)?\"[^>]*>/gi,
    /<a\s+[^>]*href=\"(?:https?:\/\/[^\"]+?)\/(?:courses|academy)\/([^\"#?\s>]+)(?:[?#][^\"]*)?\"[^>]*>/gi,
  ];

  for (const re of [...mdPatterns, ...htmlPatterns]) {
    let m;
    while ((m = re.exec(content)) !== null) {
      if (m[1]) results.push(m[1].trim());
    }
  }
  return results;
}

function run() {
  const courses = readCourses();
  const slugs = new Set(courses.map((c) => c.slug));
  const fmSlugs = new Map(); // frontmatter slug -> files with that slug

  const issues = {
    brokenLinks: [], // { file, reference }
    nonNumericReadingTime: [], // { file, value }
    missingReadingTime: [], // { file }
    foundEstimatedReadingTime: [], // { file, value }
    requiredMissing: [], // { file, fields: string[] }
    slugMismatch: [], // { file, fileSlug, frontmatterSlug }
    duplicateFrontmatterSlugs: [], // { slug, files: string[] }
    groupsMissingFiles: [], // { slug }
    filesNotInAnyGroup: [], // { slug }
  };

  // collect slugs from course-groups.ts
  const groupsGenerated = path.resolve(process.cwd(), 'packages/ui/src/data/academy/course-groups.generated.ts');
  const groupsFile = fs.existsSync(groupsGenerated)
    ? groupsGenerated
    : path.resolve(process.cwd(), 'packages/ui/src/data/academy/course-groups.ts');
  let groupSlugs = new Set();
  try {
    const gsrc = fs.readFileSync(groupsFile, 'utf8');
    const reTs = /slug:\s*'([^']+)'/g; // old static TS file
    const reGen = /"slug"\s*:\s*"([^"]+)"/g; // generated file
    let m;
    while ((m = reTs.exec(gsrc)) !== null) groupSlugs.add(m[1]);
    while ((m = reGen.exec(gsrc)) !== null) groupSlugs.add(m[1]);
  } catch {}

  for (const c of courses) {
    const { data } = matter(c.content);
    // required fields
    const required = ['title', 'slug', 'description', 'type', 'version'];
    const missing = required.filter((k) => typeof data[k] === 'undefined' || data[k] === null || data[k] === '');
    if (missing.length) issues.requiredMissing.push({ file: c.file, fields: missing });

    // frontmatter slug checks
    const fmSlug = typeof data.slug === 'string' ? data.slug.trim() : undefined;
    if (fmSlug && fmSlug !== c.slug) {
      issues.slugMismatch.push({ file: c.file, fileSlug: c.slug, frontmatterSlug: fmSlug });
    }
    if (fmSlug) {
      const list = fmSlugs.get(fmSlug) ?? [];
      list.push(c.file);
      fmSlugs.set(fmSlug, list);
    }
    const rt = data.readingTime;
    const ert = data.estimatedReadingTime;

    if (typeof rt === 'undefined') {
      issues.missingReadingTime.push({ file: c.file });
    } else if (typeof rt !== 'number' || Number.isNaN(rt)) {
      issues.nonNumericReadingTime.push({ file: c.file, value: rt });
    }

    if (typeof ert !== 'undefined') {
      issues.foundEstimatedReadingTime.push({ file: c.file, value: ert });
    }

    const links = extractInternalCourseLinks(c.content);
    for (const ref of links) {
      // Only validate slug part before any trailing slash or params
      const refSlug = ref.replace(/\/+.*/, '');
      // Only consider typical course slug shapes to avoid placeholders/entities
      if (!/^[a-z0-9-]+$/.test(refSlug)) continue;
      if (!slugs.has(refSlug)) {
        issues.brokenLinks.push({ file: c.file, reference: ref });
      }
    }
  }

  // duplicate frontmatter slugs
  for (const [slug, filesWith] of fmSlugs.entries()) {
    if (filesWith.length > 1) {
      issues.duplicateFrontmatterSlugs.push({ slug, files: filesWith });
    }
  }

  // group/file parity
  for (const s of groupSlugs) {
    if (!slugs.has(s)) issues.groupsMissingFiles.push({ slug: s });
  }
  for (const s of slugs) {
    if (!groupSlugs.has(s)) issues.filesNotInAnyGroup.push({ slug: s });
  }

  let hasIssues = false;
  const printSection = (title, arr, formatter) => {
    if (!arr.length) return;
    hasIssues = true;
    console.log(`\n${title} (${arr.length})`);
    for (const item of arr) {
      console.log(' -', formatter(item));
    }
  };

  printSection(
    'Broken internal links to courses (/courses/*, /academy/*)',
    issues.brokenLinks,
    (i) => `${i.reference}  ← in ${path.relative(process.cwd(), i.file)}`
  );
  printSection(
    'Missing readingTime',
    issues.missingReadingTime,
    (i) => path.relative(process.cwd(), i.file)
  );
  printSection(
    'Non-numeric readingTime',
    issues.nonNumericReadingTime,
    (i) => `${path.relative(process.cwd(), i.file)} (value: ${JSON.stringify(i.value)})`
  );
  printSection(
    'Found estimatedReadingTime (should prefer readingTime)',
    issues.foundEstimatedReadingTime,
    (i) => `${path.relative(process.cwd(), i.file)} (value: ${JSON.stringify(i.value)})`
  );
  printSection(
    'Missing required frontmatter fields',
    issues.requiredMissing,
    (i) => `${path.relative(process.cwd(), i.file)} → [${i.fields.join(', ')}]`
  );
  printSection(
    'Frontmatter slug mismatch (file name vs slug)',
    issues.slugMismatch,
    (i) => `${path.relative(process.cwd(), i.file)} → file:
${i.fileSlug} frontmatter:${i.frontmatterSlug}`
  );
  printSection(
    'Duplicate frontmatter slugs',
    issues.duplicateFrontmatterSlugs,
    (i) => `${i.slug} used in ${i.files.map((f) => path.relative(process.cwd(), f)).join(', ')}`
  );
  printSection(
    'course-groups.ts references missing .mdx files',
    issues.groupsMissingFiles,
    (i) => i.slug
  );
  printSection(
    '.mdx files not included in any group',
    issues.filesNotInAnyGroup,
    (i) => i.slug
  );

  if (!hasIssues) {
    console.log('✅ Academy content validation passed: all course links resolve and readingTime is normalized.');
  }

  process.exit(hasIssues ? 1 : 0);
}

run();
