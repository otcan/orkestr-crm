# Contributing

Contributions should preserve the product boundary: oXRM is an MCP-first
relationship workspace and agent-operable relationship ledger. The repository
name and some package scopes still use the older `orkestr-crm` name; public
commands and docs should use `oXRM` and `./oxrm`.

## Development

```bash
pnpm install
pnpm typecheck
pnpm build
```

Use the public-safe demo path for local walkthroughs:

```bash
./oxrm start
./oxrm ready
./oxrm demo
./oxrm test
./oxrm urls
```

Run `pnpm typecheck`, `pnpm build`, and the Docker demo path before opening a
PR that touches runtime behavior. For Compose or proxy changes, also run:

```bash
docker compose -f docker-compose.yml -f infra/compose/docker-compose.prod.yml config
```

## Pull Requests

- Keep changes scoped.
- Document MCP/API behavior changes.
- Document schema, migration, backup, and privacy impact.
- Include tests or smoke coverage that matches the risk of the change.
- Do not include real lead data, real profile URLs, credentials, cookies, mailbox exports, or production logs.
- Do not add direct package dependencies between oXRM, `ork-linkedin`, Orkestr,
  or campaign repos. Use MCP/API contracts for cross-repo operation.

## Branches

Agent-authored branches should use:

```txt
agent/<agent-name>/<short-task>
```
