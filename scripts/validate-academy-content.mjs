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
  const files = fs
    .readdirSync(COURSES_DIR)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => ({
      file: path.join(COURSES_DIR, f),
      slug: f.replace(/\.mdx$/, ''),
    }));
  return files.map(({ file, slug }) => ({
    file,
    slug,
    content: fs.readFileSync(file, 'utf8'),
  }));
}

/** Extract /courses/<slug> link targets from MDX content */
function extractCourseLinks(content) {
  const results = [];
  // Support:
  //  - relative: ](/courses/slug), ](/courses/slug#anchor), ](/courses/slug?x=1)
  //  - absolute: ](https://site.tld/courses/slug), with optional anchor/query
  const patterns = [
    /\]\(\s*\/courses\/([^/#?\s)]+)(?:[?#][^)]*)?\s*\)/g,
    /\]\(\s*(?:https?:\/\/[^)]+?)\/courses\/([^/#?\s)]+)(?:[?#][^)]*)?\s*\)/g,
  ];

  for (const re of patterns) {
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

  const issues = {
    brokenLinks: [], // { file, reference }
    nonNumericReadingTime: [], // { file, value }
    missingReadingTime: [], // { file }
    foundEstimatedReadingTime: [], // { file, value }
  };

  for (const c of courses) {
    const { data } = matter(c.content);
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

    const links = extractCourseLinks(c.content);
    for (const ref of links) {
      // Only validate slug part before any trailing slash or params
      const refSlug = ref.replace(/\/+.*/, '');
      if (!slugs.has(refSlug)) {
        issues.brokenLinks.push({ file: c.file, reference: ref });
      }
    }
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
    'Broken /courses/* links',
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

  if (!hasIssues) {
    console.log('✅ Academy content validation passed: all course links resolve and readingTime is normalized.');
  }

  process.exit(hasIssues ? 1 : 0);
}

run();
