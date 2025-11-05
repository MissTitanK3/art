import fs from 'fs';
import path from 'path';

export type SeasonFrontmatter = {
  title?: string;
  sector?: string;
  tone?: string;
  themeColor?: string;
};

function findSeasonsDir(): string | null {
  // Prefer app-local content folder
  const localDir = path.join(process.cwd(), 'apps', 'frontiers', 'content', 'seasons');
  if (fs.existsSync(localDir)) return localDir;
  // Fallback to project-root/content/seasons
  const rootDir = path.join(process.cwd(), 'content', 'seasons');
  if (fs.existsSync(rootDir)) return rootDir;
  // Also try app cwd/content/seasons
  const appDir = path.join(process.cwd(), 'content', 'seasons');
  if (fs.existsSync(appDir)) return appDir;
  return null;
}

export function seasonPathForSlug(slug: string): string | null {
  const dir = findSeasonsDir();
  if (!dir) return null;
  const file = path.join(dir, `${slug}.mdx`);
  return fs.existsSync(file) ? file : null;
}

export function loadSeason(slug: string): { frontmatter: SeasonFrontmatter; content: string } | null {
  const file = seasonPathForSlug(slug);
  if (!file) return null;
  const raw = fs.readFileSync(file, 'utf8');
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/m.exec(raw);
  if (!match) return { frontmatter: {}, content: String(raw) };
  const yaml = String(match[1] || '');
  const body = String(match[2] || '');
  const fm: SeasonFrontmatter = {};
  for (const line of yaml.split(/\r?\n/)) {
    const m = /^([A-Za-z0-9_-]+):\s*\"?([^\"]*)\"?\s*$/.exec(line.trim());
    if (!m) continue;
    const key = m[1];
    const val = m[2];
    if (key === 'title') fm.title = val;
    else if (key === 'sector') fm.sector = val;
    else if (key === 'tone') fm.tone = val;
    else if (key === 'themeColor') fm.themeColor = val;
  }
  return { frontmatter: fm, content: body };
}

export function listSeasonSlugs(): string[] {
  const dir = findSeasonsDir();
  if (!dir) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.mdx'))
    .map((f) => f.replace(/\.mdx$/, ''));
}
