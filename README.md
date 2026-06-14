# Orkestr CRM

MCP-first, agent-first CRM control plane for LinkedIn, Sales Navigator, email, follow-up, scheduling, and CRM state.

## Stack

- Angular with Signals
- Node.js and Fastify
- Drizzle ORM
- PostgreSQL
- Redis
- MCP server for agent tools and resources
- Always containerized runtime
- Mandatory daily GitHub backup worker

## Local Setup

```bash
cp .env.example .env
pnpm install
pnpm build
docker compose up --build
```

The initial scaffold binds published ports to `127.0.0.1` by default. Put a firewall or authenticated reverse proxy in front of it before exposing it beyond the host.

The initial scaffold exposes locally on project-specific high ports:

- Web app: `http://127.0.0.1:18180`
- API health: `http://127.0.0.1:18181/api/health`
- MCP HTTP health: `http://127.0.0.1:18182/health`
- Postgres host port: `127.0.0.1:18183`
- Redis host port: `127.0.0.1:18184`

Override ports with `WEB_PORT`, `API_PORT`, `MCP_PORT`, `HOST_WEB_PORT`, `HOST_API_PORT`, `HOST_MCP_PORT`, `HOST_POSTGRES_PORT`, and `HOST_REDIS_PORT`.

## Development

```bash
pnpm dev:api
pnpm dev:mcp
pnpm dev:web
```

## CLI And MCP Testing

```bash
pnpm crm health
pnpm crm mcp:tools
pnpm crm mcp:call crm.search_leads --input '{"query":"founder"}'
pnpm crm mcp:read crm://queue/today
pnpm crm smoke
```

The CLI uses:

- `CRM_API_URL`, default `http://127.0.0.1:18181`
- `CRM_MCP_URL`, default `http://127.0.0.1:18182/mcp`

## Database

```bash
pnpm db:migrate
pnpm db:seed
pnpm db:smoke
```

## Backups

Production must configure `BACKUP_GITHUB_REPO` and credentials for pushing backup artifacts.

```bash
pnpm backup:run
pnpm backup:verify
```

The backup worker is intentionally part of the first scaffold because backup enforcement is a product requirement, not an operational afterthought.

Production requires `BACKUP_GITHUB_REPO` and `BACKUP_GITHUB_TOKEN`.

## Agent Branch Workflow

Agents should work on branches named:

```txt
agent/<agent-name>/<short-task>
```

MCP tools expose branch creation, branch summary, and PR body preparation. Opening a PR remains an approval-gated external side effect.

## Production Exposure

Default development ports are bound to `127.0.0.1`. For production, use the Caddy reverse proxy profile in `infra/compose/docker-compose.prod.yml` and expose only the proxy through the host firewall.
