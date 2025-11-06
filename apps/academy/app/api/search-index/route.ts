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

export async function GET() {
  try {
    const files = fs.readdirSync(ACADEMY_COURSES_DIR).filter((f) => f.endsWith('.mdx'));
    // Compute latest mtime across content files
    let latest = 0;
    for (const f of files) {
      const st = fs.statSync(path.join(ACADEMY_COURSES_DIR, f));
      latest = Math.max(latest, st.mtimeMs);
    }

    if (cachedItems && latest <= cachedMtimeMs) {
      return NextResponse.json({ items: cachedItems });
    }

    const items = files.map((file) => {
      const filePath = path.join(ACADEMY_COURSES_DIR, file);
      const raw = fs.readFileSync(filePath, 'utf8');
      const { content, data } = matter(raw);
      const slug = file.replace(/\.mdx$/, '');
      const title = (data as any)?.title ?? slug;
      const description = (data as any)?.description ?? '';
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
