# Backlog Decisions

Use this file for near-term product and architecture decisions that affect issue scope.

## 2026-06-16 oXRM Cleanup

- Naming: use `oXRM` as the product shorthand for Orkestr XRM. Keep existing repository/runtime names until code and docs are migrated deliberately.
- Generic records: use a hybrid persistence strategy. PostgreSQL stays canonical; append-friendly record/event files support fast writes, audit/export, and recovery; indexed projections support fast search. Design for up to 1M records per Docker-isolated instance.
- Migrations: every migration needs a manual update note covering data movement, backfill, verification, and rollback impact. Do not depend on old compatibility paths silently carrying data forward at this stage.
- Templates: outreach remains the first bundled domain. Job search is the first non-outreach proof preset now that generic records, views, and MCP contracts exist; keep future templates in seed/configuration until a domain proves repeated usage.
- Multi-instance: keep isolation at the Docker level through env files, Docker project names, host ports, and volumes. Do not add repo-level instance management yet.
- Local LinkedIn instances checked: the current runtime examples follow the Docker-level isolation model.

## 2026-06-19 Agent Runtime Tasks

- Agent schema: the current fixed `agent_type` enum is too implementation-specific for the long-term product contract. Replace it with an agnostic identity model that keeps durable fields such as name, status, branch prefix, and audit references, while moving roles, capabilities, provider/runtime details, and workflow specialization into extensible configuration.
- CLI adapter: do not introduce a second command execution layer. The existing Dockerized `./oxrm cli ...` path is the supported operator/runtime surface, and `scripts/oxrm-internal cli ...` remains the contributor source-development path.
- Plan contract: define plan execution as a small neutral contract that can read state through MCP/API, invoke approved actions through the existing CLI/API/MCP surfaces, and return normalized results suitable for audit logs and UI task timelines.
- Migration scope: if the agent schema changes require database migration, include an explicit manual update note for backfill, compatibility, verification, and rollback.
