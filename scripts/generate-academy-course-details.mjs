import fs from 'fs/promises'
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
  for (const k of fields) {
    if (data[k] !== undefined) out[k] = data[k]
  }
  return out
}
async function main() {
  const files = await fs.readdir(COURSES_DIR)
  const entries = {}
  for (const file of files.filter((f) => f.endsWith('.mdx'))) {
    const raw = await fs.readFile(path.join(COURSES_DIR, file), 'utf8')
    const { data } = matter(raw)
    const slug = file.replace(/\.mdx$/, '')
    entries[slug] = pickFrontmatter(data)
  }

  const content =
    `// AUTO-GENERATED — DO NOT EDIT
export const GENERATED_COURSE_DETAILS = ${JSON.stringify(entries, null, 2)} as const;
`
  await fs.writeFile(OUT_FILE, content, 'utf8')
  console.log('Wrote', OUT_FILE)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})