#!/usr/bin/env bash
# ---------------------------------------------------------------------------
# Smoke test.
#
# Builds the site, serves dist/, and fetches every route. Routes are DERIVED
# from src/App.jsx at runtime rather than hardcoded, so this file cannot go
# stale when routes change.
#
#   bash scripts/smoke.sh
# ---------------------------------------------------------------------------
set -uo pipefail
cd "$(dirname "$0")/.."

PORT="${SMOKE_PORT:-4321}"
FAILED=0
PREVIEW_PID=""

cleanup() {
  if [ -n "$PREVIEW_PID" ]; then kill "$PREVIEW_PID" 2>/dev/null || true; fi
}
trap cleanup EXIT

say() { printf '%s\n' "$*"; }
pass() { printf '  ok    %s\n' "$*"; }
fail() { printf '  FAIL  %s\n' "$*"; FAILED=$((FAILED + 1)); }

# --- 1. Build --------------------------------------------------------------
say "==> build"
if npm run build >/tmp/pp-smoke-build.log 2>&1; then
  pass "vite build"
else
  fail "vite build"
  tail -40 /tmp/pp-smoke-build.log
  exit 1
fi

# --- 2. Static checks on the bundle ----------------------------------------
say "==> bundle checks"

# No secret may ever be inlined into the client bundle.
if grep -rqE 'VITE_ADMIN_PASSWORD|VITE_SESSION_SECRET|VITE_MONGODB_URI|VITE_STRIPE_SECRET' dist 2>/dev/null; then
  fail "a secret-shaped VITE_ variable was inlined into dist/"
else
  pass "no secret-shaped VITE_ variables in dist/"
fi

# Zero-emoji rule. Scan source, not dist (fonts and minified data create noise).
if grep -rlP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{FE0F}\x{2190}-\x{21FF}\x{2B00}-\x{2BFF}]' \
     src api 2>/dev/null | grep -q .; then
  fail "emoji found in source"
  grep -rlP '[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}\x{FE0F}\x{2190}-\x{21FF}\x{2B00}-\x{2BFF}]' src api 2>/dev/null
else
  pass "no emoji in src/ or api/"
fi

# Nothing may call the API directly; everything goes through the dataSource seam.
# live.js is the one permitted caller; dataSource.js documents the rule in a
# comment, so both are excluded by name rather than by loosening the pattern.
STRAY=$(grep -rln "fetch(['\"\`]/api" src --include='*.jsx' --include='*.js' 2>/dev/null \
        | grep -v -e 'src/lib/sources/live.js' -e 'src/lib/dataSource.js' || true)
if [ -n "$STRAY" ]; then
  fail "component calls /api directly instead of using dataSource.js:"
  printf '        %s\n' $STRAY
else
  pass "all API access goes through src/lib/dataSource.js"
fi

# Retired accents must not survive a reskin. Checked against the BUILT output,
# not src/ — the build strips comments, so this catches a real surviving value
# while ignoring notes in index.css that record a colour as retired.
#   3a5aff — the original static site's electric blue
#   5b93e0 — the first rebuild's "twilight blue", retired with Direction B
GHOSTS=''
for hex in 3a5aff 5b93e0 9fc4f0 3e74be; do
  if grep -rqi "$hex" dist 2>/dev/null; then GHOSTS="$GHOSTS #$hex"; fi
done
if [ -n "$GHOSTS" ]; then
  fail "retired accent(s) still in built output:$GHOSTS"
else
  pass "all retired accents swept from build output"
fi

# Contrast. Mid-grey is unforgiving in both directions, so every token pair is
# verified against the real values in src/index.css rather than trusted.
if node scripts/check-contrast.mjs >/tmp/pp-contrast.log 2>&1; then
  pass "contrast: $(grep -oE '[0-9]+ pair' /tmp/pp-contrast.log | head -1) checked, 0 failures"
else
  fail "contrast check failed"
  grep -E '^\s+FAIL' /tmp/pp-contrast.log || tail -10 /tmp/pp-contrast.log
fi

# --- 3. Derive routes from App.jsx -----------------------------------------
say "==> routes"
# Splat routes ("/admin/*") become their base path so the section still gets
# hit; the bare catch-all ("*") is dropped. Params become a literal segment.
ROUTES=$(grep -oE 'path="[^"]+"' src/App.jsx \
         | sed 's/path="//; s/"//' \
         | sed 's#/\*$##' \
         | grep -v '^\*$' \
         | sed 's#/:[^/]*#/_smoke_#g' \
         | sort -u)

if [ -z "$ROUTES" ]; then
  fail "could not derive any routes from src/App.jsx"
  exit 1
fi

# --- 4. Serve and fetch ----------------------------------------------------
npm run preview -- --port "$PORT" --strictPort >/tmp/pp-smoke-preview.log 2>&1 &
PREVIEW_PID=$!

for _ in $(seq 1 40); do
  if curl -fsS --noproxy '*' "http://127.0.0.1:$PORT/" >/dev/null 2>&1; then break; fi
  sleep 0.25
done

for route in $ROUTES; do
  case "$route" in /*) url="http://127.0.0.1:$PORT$route" ;; *) url="http://127.0.0.1:$PORT/$route" ;; esac
  code=$(curl -s --noproxy '*' -o /dev/null -w '%{http_code}' "$url")
  if [ "$code" = "200" ]; then pass "$route"; else fail "$route -> HTTP $code"; fi
done

say ""
if [ "$FAILED" -eq 0 ]; then
  say "smoke: all checks passed"
else
  say "smoke: $FAILED check(s) failed"
fi
exit "$FAILED"
