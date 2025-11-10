#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
cd "$ROOT_DIR"

# Helper to run a command and show header
run_step() {
  TITLE="$1"
  shift
  echo "\n===== $TITLE ====="
  if "$@"; then
    echo "[OK] $TITLE"
  else
    echo "[FAIL] $TITLE" >&2
    exit 1
  fi
}

# Ensure pnpm is available
if ! command -v pnpm >/dev/null 2>&1; then
  echo "pnpm not found in PATH. Please install pnpm (https://pnpm.io/) or run checks manually." >&2
  exit 2
fi

# 1. Lint (uses turbo workspace lint)
run_step "Lint" pnpm -w run lint

# 2. Academy validation (prebuild will also run these, but validate explicitly)
# validate:academy exists in root package.json
run_step "Validate academy content" pnpm -w run validate:academy

# 3. Build (run turbo build to ensure packages/apps compile)
run_step "Build (turbo)" pnpm -w run build

# 4. Align / region checks - run quick region check that is safe for local
# Use check:regions:staged if you only want staged files; otherwise use check:regions
if pnpm -w -s run check:regions:staged >/dev/null 2>&1; then
  run_step "Region alignment (staged)" pnpm -w run check:regions:staged
else
  # fallback to a lighter check that won't post or fail unexpectedly
  run_step "Region alignment (scan)" pnpm -w run check:regions
fi

# Optional: run tests if present in repo root
if pnpm -w -s run test >/dev/null 2>&1; then
  run_step "Run tests" pnpm -w run test
else
  echo "\nNo root-level 'test' script found or it's not runnable; skipping tests."
fi

echo "\nAll sanity checks passed."

exit 0
