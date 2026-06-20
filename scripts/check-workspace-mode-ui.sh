#!/usr/bin/env bash
set -euo pipefail

failures=0

fail() {
  echo "workspace UI guard: $*" >&2
  failures=$((failures + 1))
}

if git grep -n -E "hostname|linkedin-outreach-demo|job-search-demo" -- apps/web/src/app apps/web/src/main.ts >/tmp/oxrm-ui-host-grep.txt; then
  cat /tmp/oxrm-ui-host-grep.txt >&2
  fail "frontend must not infer workspace mode from hostname"
fi

for legacy_case in \
  '@case ("Start")' \
  '@case ("Dashboard")' \
  '@case ("Workspace")' \
  '@case ("Views")' \
  '@case ("Records")' \
  '@case ("Queue")' \
  '@case ("Timeline")'; do
  if git grep -F "$legacy_case" -- apps/web/src/app/app.component.html >/dev/null; then
    fail "legacy main-template case is still rendered: $legacy_case"
  fi
done

for route in pipeline people companies; do
  if ! git grep -F "{ path: \"$route\"" -- apps/web/src/main.ts >/dev/null; then
    fail "missing Angular product route: /$route"
  fi
done

if ! git grep -F "data-oxrm-mode" -- apps/web/src/app/app-shell.component.ts >/dev/null; then
  fail "rendered shell must expose data-oxrm-mode"
fi

if ! git grep -F "oxrm-workspace-mode" -- apps/web/src/app/app.component.ts >/dev/null; then
  fail "rendered page must expose oxrm-workspace-mode meta"
fi

if git grep -n -E "Applications|Interview|Job fit|fit score" -- apps/web/src/app/outreach-*.component.ts >/tmp/oxrm-ui-outreach-grep.txt; then
  cat /tmp/oxrm-ui-outreach-grep.txt >&2
  fail "outreach pages contain job-search terminology"
fi

if git grep -n -E "Pipeline|Active leads|Waiting for reply" -- apps/web/src/app/job-*.component.ts >/tmp/oxrm-ui-job-grep.txt; then
  cat /tmp/oxrm-ui-job-grep.txt >&2
  fail "job-search pages contain outreach navigation terminology"
fi

if [ "$failures" -gt 0 ]; then
  exit 1
fi
