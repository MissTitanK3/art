import { ACADEMY_COURSE_GROUPS } from '@workspace/ui/data/academy/course-groups'
import { getAllCourses as loadAllCourses } from './mdx-loader'

export const COURSE_GROUPS = ACADEMY_COURSE_GROUPS

export const getAllCourses = loadAllCourses

export function getPrevNextWithMetadata(slug: string) {
  const allCourses = getAllCourses()
  const courseMap = Object.fromEntries(allCourses.map((c) => [c.slug, c.frontmatter]))

  const flat: { slug: string }[] = COURSE_GROUPS.flatMap((group) =>
    group.courses.map((c) => ({
      slug: typeof c === 'string' ? c : c.slug,
    })),
  )

  const index = flat.findIndex((c) => c.slug === slug)
  const prevSlug = flat[index - 1]?.slug ?? null
  const nextSlug = flat[index + 1]?.slug ?? null

  return {
    prev: prevSlug ? { slug: prevSlug, title: courseMap[prevSlug]?.title } : null,
    next: nextSlug ? { slug: nextSlug, title: courseMap[nextSlug]?.title } : null,
  }
}

export function getPrevNext(slug: string) {
  const flat: { slug: string; label: string }[] = COURSE_GROUPS.flatMap((group) =>
    group.courses.map((c) => ({
      slug: typeof c === 'string' ? c : c.slug,
      label: group.label,
    })),
  )

  const index = flat.findIndex((c) => c.slug === slug)
  return {
    prev: flat[index - 1] ?? null,
    next: flat[index + 1] ?? null,
  }
}
