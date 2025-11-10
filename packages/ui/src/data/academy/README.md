Academy Courses

How to add a course

- Scaffold from template: `pnpm -w run new:course <slug> --title "Nice Title"`
- Edit the new file in this folder: it includes frontmatter and a basic outline.
- Add the slug to a group in `packages/ui/src/data/academy/course-groups.ts` to make it visible on the landing page.
- Regenerate metadata: `pnpm -w run generate:academy-course-details`
- Validate content: `pnpm -w run validate:academy`

Frontmatter tips

- Required: `title`, `slug`, `description`, `type` (qualified|certified|overview|appendix), `version`.
- Prefer `readingTime` (number of minutes). Avoid `estimatedReadingTime`.
- Optional: `icon`, `durationHours`, `modality`, `instructorType`, `certId`.
