#!/usr/bin/env bash
set -euo pipefail

instance="smoke-journey-$(date +%s)-${RANDOM}"
keep=false

usage() {
  cat <<'EOF'
Usage: scripts/smoke-user-journey.sh [--keep]

Creates a fresh blank oXRM instance, records one CV outreach event and one
follow-up task, restarts the instance, and verifies the data is still present.
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --keep)
      keep=true
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift
done

cleanup() {
  if [[ "$keep" == false ]]; then
    ./oxrm -i "$instance" reset >/dev/null 2>&1 || true
    rm -f "instances/${instance}.local.env"
  fi
}
trap cleanup EXIT

wait_for_health() {
  for _ in $(seq 1 60); do
    if ./oxrm -i "$instance" health >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  echo "Instance did not become healthy: $instance" >&2
  ./oxrm -i "$instance" status >&2 || true
  exit 1
}

echo "Creating fresh non-demo oXRM instance: $instance"
./oxrm init "$instance" --template blank >/dev/null
wait_for_health

./oxrm -i "$instance" cli event:record \
  --name "Smoke Recruiter" \
  --email "smoke.recruiter@example.invalid" \
  --company "Smoke Talent" \
  --type email_sent \
  --channel email \
  --direction outbound \
  --subject "Sent CV for platform role" \
  --body "Synthetic smoke journey event." \
  --key "smoke-user-journey:event" >/dev/null

./oxrm -i "$instance" cli task:create \
  --title "Follow up Smoke Recruiter" \
  --type follow_up \
  --key "smoke-user-journey:task" >/dev/null

./oxrm -i "$instance" restart >/dev/null
wait_for_health

lead_result="$(./oxrm -i "$instance" cli lead:list --query "Smoke Recruiter")"
task_result="$(./oxrm -i "$instance" cli task:list --status open)"
event_result="$(./oxrm -i "$instance" cli event:list --channel email --limit 10)"

printf '%s\n' "$lead_result" | grep -q "Smoke Recruiter"
printf '%s\n' "$task_result" | grep -q "Follow up Smoke Recruiter"
printf '%s\n' "$event_result" | grep -q "Sent CV for platform role"

echo "Fresh non-demo user journey persisted across restart."
