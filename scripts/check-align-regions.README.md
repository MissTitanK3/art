check-align-regions

Usage examples:

- Default (baseline = region-pnw):
  node scripts/check-align-regions.mjs

- Demo mode (compare region-template):
  node scripts/check-align-regions.mjs --demo

- Verbose with diff output:
  node scripts/check-align-regions.mjs --verbose --format diff

- Git-aware (only tracked files):
  node scripts/check-align-regions.mjs --git

- Staged-only (compare only staged files):
  node scripts/check-align-regions.mjs --staged

- Use a whitelist (glob patterns) to allow intended differences:
  node scripts/check-align-regions.mjs --whitelist-file scripts/check-align-whitelist.txt

Output:
- Default output directory: .check-unaligned-region
- report.json contains summary
- Per-region folders contain .baseline/.region copies and .diff when format=diff
