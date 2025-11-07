#!/usr/bin/env node
// Scaffold a new Academy course MDX from a template
import fs from 'node:fs'
import path from 'node:path'

const COURSES_DIR = path.resolve(process.cwd(), 'packages/ui/src/data/academy/courses')
const TEMPLATE = path.join(COURSES_DIR, '_course-template.mdx')

function usage() {
  console.log('Usage: node scripts/new-course.mjs <slug> [--title "Title"]')
  process.exit(1)
}

function parseArgs(argv) {
  const args = { slug: null, title: null, dir: null }
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (!args.slug && !a.startsWith('--')) {
      args.slug = a
      continue
    }
    if (a === '--title') {
      args.title = argv[++i] ?? null
      continue
    }
    if (a === '--dir') {
      args.dir = argv[++i] ?? null
      continue
    }
    console.warn('Unknown arg:', a)
  }
  return args
}

function replaceAll(content, replacements) {
  let out = content
  for (const [needle, value] of Object.entries(replacements)) {
    out = out.replaceAll(needle, value)
  }
  return out
}

function encodeSafeDir(name) {
  const map = [
    [/:/g, '__c__'],
    [/\(/g, '__lp__'],
    [/\)/g, '__rp__'],
    [/&/g, '__and__'],
    [/,/g, '__cm__'],
    [/\//g, '__slash__'],
    [/'/g, '__ap__'],
    [/\+/g, '__plus__'],
    [/\s+/g, '_'],
  ]
  let s = name
  for (const [re, token] of map) s = s.replace(re, token)
  return s
}

function main() {
  if (!fs.existsSync(COURSES_DIR)) {
    console.error('Courses directory not found:', COURSES_DIR)
    process.exit(1)
  }
  const { slug, title, dir } = parseArgs(process.argv)
  if (!slug) usage()

  const base = dir ? path.join(COURSES_DIR, encodeSafeDir(dir)) : COURSES_DIR
  fs.mkdirSync(base, { recursive: true })
  const dest = path.join(base, `${slug}.mdx`)
  if (fs.existsSync(dest)) {
    console.error('Refusing to overwrite existing file:', dest)
    process.exit(1)
  }
  const tpl = fs.readFileSync(TEMPLATE, 'utf8')
  const finalTitle = title || slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())
  const content = replaceAll(tpl, {
    '[course-slug]': slug,
    '[Course Title]': finalTitle,
    '[1–2 sentence summary of what learners gain.]': 'Short description here.',
  })
  fs.writeFileSync(dest, content)
  console.log('✅ Created new course at', dest)
  console.log('\nNext:')
  console.log('- Run: pnpm -w run generate:academy-course-details && pnpm -w run generate:academy-groups')
}

main()
