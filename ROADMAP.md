# Roadmap

oXRM is focused on one reliable public loop first: start the Docker stack,
seed synthetic data, inspect who needs follow-up today, draft the next action,
and keep outreach state under local control.

## Now

- Docker-first local runtime.
- Synthetic outreach and job-search demo seeds.
- MCP tools and resources for queues, views, records, tasks, and events.
- Canonical outreach event write path with idempotency and linked tasks.
- `ork-linkedin` integration boundary through MCP/API only.
- Backup worker, latest-backup health, and artifact-presence verification.
- Codex demo path for local synthetic outreach workflows.

## Next

- Full isolated `pg_restore` verification for backups.
- Make the agent identity schema more agnostic: keep generic actor identity,
  status, and audit ownership stable; move implementation-specific roles,
  capabilities, and provider/runtime configuration out of fixed enums.
- Reuse the existing `./oxrm cli ...` and `scripts/oxrm-internal cli ...` paths as the
  CLI adapter surface for agent workflows instead of adding a parallel command
  runner.
- Define the plan execution contract from MCP/API state through the CLI adapter
  to normalized task/action results.
- Public screenshots and short demo clips from synthetic data only.
- Better saved-view editing and onboarding polish.
- Import/export helpers for public-safe sample datasets.
- Stronger approval UX for agent-proposed writes.
- More explicit self-hosted outreach demo flow.

## Later

- Email and calendar ingestion boundaries.
- Team workflow experiments after the single-user Docker loop is boring.
- Hosted or managed deployment layer.
- More storage/indexing options for large relationship datasets.

## Not Planned

- LinkedIn scraping bot.
- Spam or mass-outreach automation.
- Salesforce/HubSpot clone surface area.
- Direct package coupling to `ork-linkedin`, Orkestr, or private campaign repos.
- Public demos with real personal data.
