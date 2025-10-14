import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { compile } from '@mdx-js/mdx';
import * as runtime from 'react/jsx-runtime';
import rehypeSlug from 'rehype-slug';
import { extractToc } from './mdx.toc';
import remarkGfm from 'remark-gfm';
import { ACADEMY_COURSES_DIR } from '@workspace/ui/data/academy/paths';

export type CourseFrontmatter = {
  title: string;
  slug: string;
  description: string;
  type: 'qualified' | 'certified';
  readingTime?: string;
  version?: number;
};

export async function getCourseBySlug(slug: string) {
  const filepath = path.join(ACADEMY_COURSES_DIR, `${slug}.mdx`);
  const raw = fs.readFileSync(filepath, 'utf8');
  const { content, data: frontmatter } = matter(raw);

  const compiled = await compile(content, {
    outputFormat: 'function-body',
    jsxImportSource: 'react',
    remarkPlugins: [remarkGfm],
    rehypePlugins: [rehypeSlug],
  });

  const MDXContent = new Function(String(compiled))(runtime).default;
  const toc = extractToc(content); // ✅ Extract at build time

  return {
    frontmatter: frontmatter as CourseFrontmatter,
    Content: MDXContent,
    toc, // ✅ Include directly
    raw,
    slug,
  };
}

export function getAllCourseSlugs(): string[] {
  const files = fs.readdirSync(ACADEMY_COURSES_DIR);
  return files.filter((file) => file.endsWith('.mdx')).map((file) => file.replace(/\.mdx$/, ''));
}

export function getAllCourses() {
  const files = fs.readdirSync(ACADEMY_COURSES_DIR);

  return files
    .filter((file) => file.endsWith('.mdx'))
    .map((file) => {
      const filePath = path.join(ACADEMY_COURSES_DIR, file);
      const raw = fs.readFileSync(filePath, 'utf8');
      const { data: frontmatter } = matter(raw);
      return {
        slug: file.replace(/\.mdx$/, ''),
        frontmatter: frontmatter as CourseFrontmatter,
      };
    });
}
