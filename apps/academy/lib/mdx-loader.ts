import fs from "fs";
import path from "path";
// Frontmatter is provided by the generated manifest; no runtime parsing needed
import rehypeSlug from "rehype-slug";
import { extractToc } from "./mdx.toc";
import remarkGfm from "remark-gfm";
import { ACADEMY_COURSES_DIR } from "@workspace/ui/data/academy/paths";
import type { AcademyCourseFrontmatter as CourseFrontmatter } from "@workspace/ui/data/academy/types";
import { MDX_COURSE_FRONTMATTER } from "./mdx-manifest.generated";

export async function getCourseBySlug(slug: string) {
  const filepath = findCourseFile(slug);
  if (!filepath) {
    const expected = path.join(ACADEMY_COURSES_DIR, `${slug}.mdx`);
    console.error("[academy] getCourseBySlug:file-missing", { slug, expected });
    throw new Error("Course file not found");
  }
  const rawFull = fs.readFileSync(filepath, "utf8");
  const content = rawFull.replace(/^---[\s\S]*?---\n/, "");
  const fmMap = MDX_COURSE_FRONTMATTER;
  const frontmatter = fmMap[slug as keyof typeof fmMap] as
    | CourseFrontmatter
    | undefined;
  const toc = extractToc(content); // ✅ Extract at build time

  return {
    frontmatter: frontmatter as CourseFrontmatter,
    toc, // ✅ Include directly
    raw: content,
    slug,
  };
}

export function getAllCourseSlugs(): string[] {
  const slugs: string[] = [];
  const walk = (dir: string) => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) walk(abs);
      else if (ent.isFile() && /\.mdx?$/.test(ent.name))
        slugs.push(ent.name.replace(/\.mdx?$/, ""));
    }
  };
  walk(ACADEMY_COURSES_DIR);
  return slugs;
}

export function getAllCourses() {
  return Object.entries(MDX_COURSE_FRONTMATTER).map(([slug, frontmatter]) => ({
    slug,
    frontmatter: frontmatter as CourseFrontmatter,
  }));
}

function findCourseFile(slug: string): string | null {
  const walk = (dir: string): string | null => {
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const abs = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        const found = walk(abs);
        if (found) return found;
      } else if (ent.isFile() && ent.name === `${slug}.mdx`) {
        return abs;
      }
    }
    return null;
  };
  return walk(ACADEMY_COURSES_DIR);
}
