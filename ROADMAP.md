# Roadmap

oXRM is focused on one reliable public loop first: start the Docker stack,
seed synthetic data, inspect relationship state in the UI, read queues through
MCP, and write audited events through safe APIs.

## Now

- Docker-first local runtime.
- Synthetic outreach and job-search demo seeds.
- MCP tools and resources for queues, views, records, tasks, and events.
- Canonical outreach event write path with idempotency and linked tasks.
- `ork-linkedin` integration boundary through MCP/API only.
- Backup worker, latest-backup health, and artifact-presence verification.

## Next

- Full isolated `pg_restore` verification for backups.
- Public screenshots and short demo clips from synthetic data only.
- Better saved-view editing and onboarding polish.
- Import/export helpers for public-safe sample datasets.
- Stronger approval UX for agent-proposed writes.
- More explicit Orkestr-to-oXRM demo flow.

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
