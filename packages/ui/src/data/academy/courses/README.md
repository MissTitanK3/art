Academy Courses

How to add a course

- Scaffold from template: `pnpm -w run new:course <slug> --title "Nice Title" [--dir "Level 1 - Team Member Onboarding"]`
- Edit the new file in this folder (or subfolder): it includes frontmatter and a basic outline.
- Regenerate metadata and groups: `pnpm -w run generate:academy-course-details && pnpm -w run generate:academy-groups`
- Validate content: `pnpm -w run validate:academy`

Organizing by folders

- You can create subfolders under this directory to mirror groupings.
- Use safe tokens in folder names so they work cross‑platform and can be decoded into display labels:

  Intended → Safe token
  - `:` → `__c__`
  - `(` → `__lp__`
  - `)` → `__rp__`
  - `&` → `__and__`
  - `,` → `__cm__`
  - `/` → `__slash__`
  - `'` → `__ap__`
  - `+` → `__plus__`
  - space → `_`

  Example: `Level 1: Team Member Onboarding` → `Level_1__c__Team_Member_Onboarding`

- Filenames must match the course slug (e.g., `secure-messaging.mdx` for slug `secure-messaging`).
- The app, generators, and validator scan subfolders recursively.

Frontmatter tips

- Required: `title`, `slug`, `description`, `type` (qualified|certified|overview|appendix), `version`.
- Prefer `readingTime` (number of minutes). Avoid `estimatedReadingTime`.
- Optional: `icon`, `durationHours`, `modality`, `instructorType`, `certId`.
