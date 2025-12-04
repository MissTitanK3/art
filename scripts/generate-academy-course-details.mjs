/**
 * Reads every Academy course MDX file and produces `course-details.generated.ts` with curated metadata.
 *
 * Usage:
 *   node scripts/generate-academy-course-details.mjs
 *
 * Typically invoked via `pnpm -w run generate:academy-course-details` inside CI/local flows.
 */
import fsp from 'fs/promises'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// adjust if you place this script elsewhere
const COURSES_DIR = path.resolve(__dirname, '../packages/ui/src/data/academy/courses')
const OUT_FILE = path.resolve(__dirname, '../packages/ui/src/data/academy/course-details.generated.ts')

function pickFrontmatter(data) {
  const fields = ['title', 'description', 'icon', 'version', 'durationHours', 'type', 'modality', 'instructorType', 'certId']
  const out = {}
  const coerceNum = (v) => (typeof v === 'string' && v.trim() !== '' && !Number.isNaN(Number(v)) ? Number(v) : v)
  for (const k of fields) {
    if (data[k] !== undefined) {
      const val = k === 'version' || k === 'durationHours' ? coerceNum(data[k]) : data[k]
      out[k] = val
    }
  }
  return out
}
function walk(dir, out = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true })
  for (const it of items) {
    const abs = path.join(dir, it.name)
    if (it.isDirectory()) walk(abs, out)
    else if (it.isFile() && it.name.toLowerCase().endsWith('.mdx')) out.push(abs)
  }
  return out
}

async function main() {
  const files = walk(COURSES_DIR)
  const entries = {}
  for (const abs of files) {
    const raw = await fsp.readFile(abs, 'utf8')
    const { data } = matter(raw)
    const slug = path.basename(abs).replace(/\.mdx?$/, '')
    entries[slug] = pickFrontmatter(data)
  }

  const content =
    `// AUTO-GENERATED — DO NOT EDIT
export const GENERATED_COURSE_DETAILS = ${JSON.stringify(entries, null, 2)} as const;
`
  await fsp.writeFile(OUT_FILE, content, 'utf8')
  console.log('Wrote', OUT_FILE)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
