import fs from 'fs';
import path from 'path';
// Frontmatter is provided by the generated manifest; no runtime parsing needed
import rehypeSlug from 'rehype-slug';
import { extractToc } from './mdx.toc';
import remarkGfm from 'remark-gfm';
import { ACADEMY_COURSES_DIR } from '@workspace/ui/data/academy/paths';
import type { AcademyCourseFrontmatter as CourseFrontmatter } from '@workspace/ui/data/academy/types';
import { MDX_COURSE_FRONTMATTER } from './mdx-manifest.generated';

export async function getCourseBySlug(slug: string) {
  const filepath = path.join(ACADEMY_COURSES_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filepath)) {
    console.error('[academy] getCourseBySlug:file-missing', { slug, filepath });
  }
  const rawFull = fs.readFileSync(filepath, 'utf8');
  const content = rawFull.replace(/^---[\s\S]*?---\n/, '');
  const fmMap = MDX_COURSE_FRONTMATTER;
  const frontmatter = fmMap[slug as keyof typeof fmMap] as CourseFrontmatter | undefined;
  const toc = extractToc(content); // ✅ Extract at build time

  return {
    frontmatter: frontmatter as CourseFrontmatter,
    toc, // ✅ Include directly
    raw: content,
    slug,
  };
}

export function getAllCourseSlugs(): string[] {
  const files = fs.readdirSync(ACADEMY_COURSES_DIR);
  return files.filter((file) => file.endsWith('.mdx')).map((file) => file.replace(/\.mdx$/, ''));
}

export function getAllCourses() {
  return Object.entries(MDX_COURSE_FRONTMATTER).map(([slug, frontmatter]) => ({
    slug,
    frontmatter: frontmatter as CourseFrontmatter,
  }));
}
