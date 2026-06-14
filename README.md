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

The initial scaffold exposes locally:

- API health: `http://localhost:3000/api/health`
- MCP HTTP health: `http://localhost:3010/health`
- Web app: `http://localhost:4200`

## Development

```bash
pnpm dev:api
pnpm dev:mcp
pnpm dev:web
```

## Backups

Production must configure `BACKUP_GITHUB_REPO` and credentials for pushing backup artifacts.

```bash
pnpm backup:run
pnpm backup:verify
```

The backup worker is intentionally part of the first scaffold because backup enforcement is a product requirement, not an operational afterthought.
