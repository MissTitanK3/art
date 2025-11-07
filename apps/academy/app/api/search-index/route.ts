import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { NextResponse } from 'next/server';
import { ACADEMY_COURSES_DIR } from '@workspace/ui/data/academy/paths';

// Ensure Node.js runtime so we have filesystem access
export const runtime = 'nodejs';
// Avoid static optimization; rebuild on request in dev while we have our own in-memory cache
export const dynamic = 'force-dynamic';

let cachedItems: any[] | null = null;
let cachedMtimeMs = 0;

function stripMd(md: string): string {
  let s = md;
  // Remove code fences
  s = s.replace(/```[\s\S]*?```/g, ' ');
  // Remove inline code
  s = s.replace(/`[^`]*`/g, ' ');
  // Remove HTML/MDX tags like <Photo .../>
  s = s.replace(/<[^>]+>/g, ' ');
  // Replace links [text](url) -> text
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
  // Remove images ![alt](src)
  s = s.replace(/!\[[^\]]*\]\([^)]*\)/g, ' ');
  // Remove headings/formatting characters
  s = s.replace(/^#+\s*/gm, '');
  s = s.replace(/[>*_#~]/g, ' ');
  // Collapse whitespace
  s = s.replace(/\s+/g, ' ').trim();
  return s;
}

function walkMdxFiles(dir: string, out: string[] = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const abs = path.join(dir, ent.name);
    if (ent.isDirectory()) walkMdxFiles(abs, out);
    else if (ent.isFile() && ent.name.toLowerCase().endsWith('.mdx')) out.push(abs);
  }
  return out;
}

export async function GET() {
  try {
    const files = walkMdxFiles(ACADEMY_COURSES_DIR);
    // Compute latest mtime across content files
    let latest = 0;
    for (const abs of files) {
      const st = fs.statSync(abs);
      latest = Math.max(latest, st.mtimeMs);
    }

    if (cachedItems && latest <= cachedMtimeMs) {
      return NextResponse.json({ items: cachedItems });
    }

    const items = files.map((filePath) => {
      const raw = fs.readFileSync(filePath, 'utf8');
      const { content, data } = matter(raw);
      const slug = path.basename(filePath).replace(/\.mdx$/i, '');
      const title = String((data as any)?.title ?? slug);
      const description = String((data as any)?.description ?? '');
      const version = (data as any)?.version ?? null;
      const text = stripMd(content);
      return { slug, title, description, version, text };
    });

    cachedItems = items;
    cachedMtimeMs = latest;
    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'failed' }, { status: 500 });
  }
}
