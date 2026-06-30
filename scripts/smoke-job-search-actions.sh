#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

OXRM_CMD="${OXRM_CMD:-./oxrm}"
API_URL="${OXRM_API_URL:-http://127.0.0.1:18291}"

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

oxrm() {
  # OXRM_CMD may intentionally contain arguments, for example "./oxrm -i demo".
  # shellcheck disable=SC2086
  $OXRM_CMD "$@"
}

read_json_text() {
  node -e '
    const fs = require("node:fs");
    const envelope = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
    const text = envelope?.content?.[0]?.text;
    if (!text) {
      console.error(JSON.stringify({ error: "missing_mcp_text", envelope }, null, 2));
      process.exit(1);
    }
    process.stdout.write(text);
  ' "$1"
}

oxrm ready >/dev/null

curl -fsS "$API_URL/api/xrm/records?objectType=application&limit=1" >"$tmp_dir/applications.json"
application_id="$(node -e '
  const fs = require("node:fs");
  const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  const row = (Array.isArray(data) ? data : data.records || data.rows || [])[0];
  if (!row?.id) {
    console.error(JSON.stringify({ error: "missing_application_for_action_smoke", data }, null, 2));
    process.exit(1);
  }
  process.stdout.write(row.id);
' "$tmp_dir/applications.json")"

curl -fsS -X POST "$API_URL/api/job-search/action-queue" \
  -H "content-type: application/json" \
  --data-binary @- >"$tmp_dir/proposal.json" <<JSON
{
  "title": "Smoke test external action receipt",
  "targetViewKey": "job_search.applications",
  "targetObjectType": "application",
  "targetRecordId": "$application_id",
  "actionKind": "send_follow_up",
  "safetyClass": "external_send",
  "priority": 1,
  "confidence": 80,
  "recommendedAction": "Human sends a synthetic follow-up outside oXRM, then records the receipt.",
  "evidence": "Smoke test uses a synthetic application target.",
  "approvalRequired": true,
  "approvalReason": "External email send must be approved and proved.",
  "createdByAgent": "smoke-test"
}
JSON

action_id="$(node -e '
  const fs = require("node:fs");
  const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  if (!data.action?.id || data.action?.fields?.approvalDecision !== "pending") {
    console.error(JSON.stringify({ error: "action_proposal_missing_pending_receipt", data }, null, 2));
    process.exit(1);
  }
  process.stdout.write(data.action.id);
' "$tmp_dir/proposal.json")"

blocked_status="$(
  curl -sS -o "$tmp_dir/blocked-before-approval.json" -w "%{http_code}" \
    -X POST "$API_URL/api/job-search/action-queue/$action_id/result" \
    -H "content-type: application/json" \
    --data '{"resultType":"external_send","externalEffectDeclared":true,"outputSummary":"Should be blocked"}'
)"
if [[ "$blocked_status" != "409" ]]; then
  echo "Expected external result before approval to be blocked, got $blocked_status" >&2
  cat "$tmp_dir/blocked-before-approval.json" >&2
  exit 1
fi

curl -fsS -X POST "$API_URL/api/job-search/action-queue/$action_id/approve" \
  -H "content-type: application/json" \
  --data '{"decidedBy":"smoke-human","decisionReason":"Synthetic approval for smoke test"}' >"$tmp_dir/approved.json"

blocked_proof_status="$(
  curl -sS -o "$tmp_dir/blocked-without-proof.json" -w "%{http_code}" \
    -X POST "$API_URL/api/job-search/action-queue/$action_id/result" \
    -H "content-type: application/json" \
    --data '{"resultType":"external_send","externalEffectDeclared":true,"humanConfirmed":true,"outputSummary":"Should be blocked without proof"}'
)"
if [[ "$blocked_proof_status" != "409" ]]; then
  echo "Expected external result without proof to be blocked, got $blocked_proof_status" >&2
  cat "$tmp_dir/blocked-without-proof.json" >&2
  exit 1
fi

curl -fsS -X POST "$API_URL/api/job-search/action-queue/$action_id/result" \
  -H "content-type: application/json" \
  --data '{
    "resultType": "external_send",
    "externalEffectDeclared": true,
    "humanConfirmed": true,
    "proof": "Synthetic smoke proof: human confirmed send in test",
    "externalReference": "smoke-message-id",
    "outputSummary": "Recorded synthetic external send receipt",
    "recordedBy": "smoke-human"
  }' >"$tmp_dir/result.json"

node -e '
  const fs = require("node:fs");
  const data = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  const fields = data.action?.fields || {};
  const fail = (error) => {
    console.error(JSON.stringify({ error, data }, null, 2));
    process.exit(1);
  };
  if (fields.status !== "external_result_recorded") fail("action_result_not_recorded");
  if (fields.approvalDecision !== "approved") fail("action_result_lost_approval");
  if (fields.externalEffectDeclared !== true) fail("action_result_missing_external_effect");
  if (fields.humanConfirmedExternalEffect !== true) fail("action_result_missing_human_confirmation");
  if (!fields.externalEffectProof) fail("action_result_missing_proof");
' "$tmp_dir/result.json"

oxrm cli mcp:call job_search.get_action_queue --input '{"status":"external_result_recorded","limit":5}' >"$tmp_dir/mcp-queue.json"
read_json_text "$tmp_dir/mcp-queue.json" >"$tmp_dir/mcp-queue-body.json"
node -e '
  const fs = require("node:fs");
  const records = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  const actionId = process.argv[2];
  const record = records.find((item) => item.id === actionId);
  if (!record || record.fields?.externalEffectProof !== "Synthetic smoke proof: human confirmed send in test") {
    console.error(JSON.stringify({ error: "mcp_queue_missing_recorded_receipt", actionId, records }, null, 2));
    process.exit(1);
  }
' "$tmp_dir/mcp-queue-body.json" "$action_id"

echo "Job search action queue smoke passed."
