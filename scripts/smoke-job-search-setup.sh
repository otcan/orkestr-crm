#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

test -f docs/start-with-codex.md
test -f docs/prompts/job-search-codex-onboarding.md
grep -F "git clone https://github.com/otcan/oxrm.git" docs/prompts/job-search-codex-onboarding.md >/dev/null
grep -F "./oxrm doctor" docs/prompts/job-search-codex-onboarding.md >/dev/null
grep -F "./oxrm init personal --template job-search --ports auto" docs/prompts/job-search-codex-onboarding.md >/dev/null
grep -F "./oxrm -i personal cli setup:job-search:next" docs/prompts/job-search-codex-onboarding.md >/dev/null
grep -F "Do not send" docs/prompts/job-search-codex-onboarding.md >/dev/null
for doc in docs/start-with-codex.md README.md docs/start-here.md docs/onboarding/job-search-setup.md; do
  grep -F "Install Codex for desktop" "$doc" >/dev/null
done

./oxrm ready >/dev/null

./oxrm cli setup:job-search --input '{"sources":[]}' >"$tmp_dir/reset-setup.json"
node -e '
  const fs = require("node:fs");
  const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  const fail = (error, extra = {}) => {
    console.error(JSON.stringify({ error, ...extra }, null, 2));
    process.exit(1);
  };
  if (data.sources?.some((source) => source.displayName === "Recruiter inbox")) fail("job_search_setup_created_template_source");
  if (!Array.isArray(data.sources) || data.sources.length !== 0) fail("job_search_setup_should_start_without_sources", { sources: data.sources });
  if (!Array.isArray(data.todos) || !data.todos.some((todo) => todo.key === "sources.missing")) {
    fail("job_search_setup_missing_source_todo", { todos: data.todos });
  }
  if (!Array.isArray(data.timers) || data.timers.length < 2) fail("job_search_setup_missing_timers");
  if (!Array.isArray(data.blueprints) || data.blueprints.length < 4) fail("job_search_setup_missing_blueprints");
  if (typeof data.readinessScore !== "number" || data.readinessScore < 1) fail("job_search_setup_missing_readiness");
  if (!Array.isArray(data.todos) || !Array.isArray(data.warnings)) fail("job_search_setup_missing_todos");
  if (!Array.isArray(data.agentDirections) || data.agentDirections.length < 1) fail("job_search_setup_missing_agent_directions");
  if (!String(data.playbookText || "").includes("Job search operating playbook")) fail("job_search_setup_missing_playbook_text");
' "$tmp_dir/reset-setup.json"

./oxrm cli setup:job-search >"$tmp_dir/empty-setup.json"
node -e '
  const fs = require("node:fs");
  const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  const fail = (error, extra = {}) => {
    console.error(JSON.stringify({ error, ...extra }, null, 2));
    process.exit(1);
  };
  if (!Array.isArray(data.sources) || data.sources.length !== 0) fail("job_search_setup_without_input_should_not_create_sources", { sources: data.sources });
' "$tmp_dir/empty-setup.json"

./oxrm cli setup:job-search --input '{
  "sources": [
    {
      "title": "Manual job URLs",
      "channel": "manual",
      "cadence": "manual",
      "importInstructions": "Paste role, company, source URL, raw job description, location, and discovered date."
    }
  ]
}' >"$tmp_dir/configured.json"
node -e '
  const fs = require("node:fs");
  const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  const fail = (error, extra = {}) => {
    console.error(JSON.stringify({ error, ...extra }, null, 2));
    process.exit(1);
  };
  const sourceNames = (data.sources || []).map((source) => source.displayName);
  if (!data.configured) fail("job_search_setup_not_configured", { gaps: data.gaps, todos: data.todos });
  if (sourceNames.includes("Recruiter inbox")) fail("job_search_setup_kept_template_source", { sourceNames });
  if (sourceNames.length !== 1 || sourceNames[0] !== "Manual job URLs") fail("job_search_setup_explicit_sources_not_authoritative", { sourceNames });
' "$tmp_dir/configured.json"

./oxrm cli setup:job-search >"$tmp_dir/preserved.json"
node -e '
  const fs = require("node:fs");
  const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  const sourceNames = (data.sources || []).map((source) => source.displayName);
  if (sourceNames.length !== 1 || sourceNames[0] !== "Manual job URLs") {
    console.error(JSON.stringify({ error: "job_search_setup_without_input_should_preserve_sources", sourceNames }, null, 2));
    process.exit(1);
  }
' "$tmp_dir/preserved.json"

./oxrm cli setup:job-search:get >"$tmp_dir/read.json"
node -e '
  const fs = require("node:fs");
  const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  if (!data.configured || !String(data.agentPrompt || "").includes("Use oXRM as the local source of truth")) {
    console.error(JSON.stringify({ error: "job_search_setup_read_failed", data }, null, 2));
    process.exit(1);
  }
' "$tmp_dir/read.json"

./oxrm cli setup:job-search:next >"$tmp_dir/next.json"
node -e '
  const fs = require("node:fs");
  const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  if (!Array.isArray(data.agentDirections) || !String(data.suggestedPrompt || "").includes("Draft only")) {
    console.error(JSON.stringify({ error: "job_search_setup_next_failed", data }, null, 2));
    process.exit(1);
  }
' "$tmp_dir/next.json"

./oxrm cli mcp:read oxrm://setup/job-search >"$tmp_dir/mcp-setup.json"
grep -F "Configured job search operating playbook" "$tmp_dir/mcp-setup.json" >/dev/null

./oxrm cli mcp:read oxrm://playbook/job-search >"$tmp_dir/mcp-playbook.json"
grep -F "Job search operating playbook" "$tmp_dir/mcp-playbook.json" >/dev/null

./oxrm cli mcp:call job_search.get_setup --input '{}' >"$tmp_dir/mcp-tool.json"
grep -F "job_search" "$tmp_dir/mcp-tool.json" >/dev/null

./oxrm cli mcp:call job_search.get_setup_next --input '{}' >"$tmp_dir/mcp-next-tool.json"
grep -F "agentDirections" "$tmp_dir/mcp-next-tool.json" >/dev/null

echo "Job search setup smoke passed."
