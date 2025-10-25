# create-region.mjs
**Always Ready Tools — Region Generator Script**  
Version: 2025-10-23

---

## 1) Purpose

Automates creation of a new **region app** from `apps/region-template`.  
Copies files, strips demo data, updates names/branding, replaces `region-template` strings, and registers the package in the workspace.

---

## 2) Prerequisites

- Node 18+ (ESM)
- pnpm installed and on PATH
- `apps/region-template` present in the monorepo

---

## 3) Quick Start

Run via package script:

```bash
pnpm create:region <region-id> [--dry-run] [--skip-install]
```


Examples:
- `pnpm create:region pnw`
- `pnpm create:region pccd --skip-install`
- `pnpm create:region nyc --dry-run` (no changes, prints planned actions)

If `<region-id>` is omitted, an interactive prompt will ask for it.

---

## 4) Flags

- `--dry-run`  
  Prints planned actions. No files are written. Prompts are disabled in dry-run mode.
- `--skip-install` or `--no-install`  
  Skips `pnpm install` at the end.

---

## 5) Naming Rules

Input is a short slug like `pnw`, `pccd`, `nyc`.  
The script:
- Lowercases and trims input
- Strips any leading `region-`
- Validates `[a-z0-9-]+`
- Produces final name `region-<slug>`  
  - Rejects `region-template` to prevent overwriting the template

Also derives:
- **Region Label**: `slug.toUpperCase()` (e.g., `PNW`)

---

## 6) What It Does

1. **Validate**  
   - Verifies `apps/region-template` exists  
   - Ensures destination `apps/region-<slug>` does not exist

2. **Copy**  
   - Copies template to new destination  
   - Skips `node_modules`, `.next`, `.turbo`

3. **Clean**  
   - Removes demo `data/` directory in the new region

4. **Package Name**  
   - Sets `package.json` `"name"` to `region-<slug>`

5. **Global Replace**  
   - Replaces all occurrences of `region-template` with `region-<slug>`  
   - Scans only safe text file types and filenames

6. **Branding**  
   - Updates common strings:  
     - `ART Region Template` → `ART Region <LABEL>`  
     - `ART. Region Template` → `ART. Region <LABEL>`  
     - `ART Dispatch — Region` → `ART Dispatch — <LABEL>`  
   - Updates `public/site.webmanifest` `name` and `short_name`

7. **Workspace Registration**  
   - Runs `pnpm install` in the monorepo root, unless `--skip-install`

---

## 7) Output

- New app at: `apps/region-<slug>`
- Console summary and next steps

---

## 8) Next Steps After Generation

- Wire up region-specific data adapters in: `apps/region-<slug>/lib`
- Configure environment variables in: `apps/region-<slug>/.env`
- Connect data layers in: `apps/region-<slug>/components/dataLayer`
- (If using Supabase) Create DB from `packages/store/src/db_init/init_region.sql` and apply `policies_region.sql`

---

## 9) Error Handling

- `EACCES` during copy → check directory permissions or run in a writable location
- `ENOENT` template missing → ensure `apps/region-template` exists
- Destination exists → choose a different `<region-id>`
- `pnpm not found` → install pnpm or fix PATH
- JSON parse errors in `package.json` or `site.webmanifest` → fix file format, then re-run

---

## 10) Internals (Key Constants)

- `REGION_PREFIX = "region-"`
- `TEMPLATE_DIR = ../apps/region-template`
- `WORKSPACE_ROOT = ..`
- `TEXT_EXTENSIONS` scanned (ts, tsx, js, jsx, mjs, cjs, json, md, mdx, txt, tsconfig, config, yml, yaml, css, scss, sass, less, svg, html)
- `TEXT_BASENAMES` scanned: `.env`, `.env.local`, `.env.example`, `CONTRIBUTING.md`
- `SKIP_COPY_NAMES`: `node_modules`, `.next`, `.turbo`

---

## 11) Security Notes

- No credentials are read or written
- Does not touch databases or remote services
- Ensure `.env` is created per-region and **never committed**
- See `SECURITY.md` for safe publication practices

---

## 12) Related

- Script path: `scripts/create-region.mjs`
- NPM script: `"create:region": "node scripts/create-region.mjs"`
- Schema: `packages/store/src/db_init/init_region.sql`
- Policies: `packages/store/src/db_init/policies_region.sql`
- Security policy: `SECURITY.md`

---
