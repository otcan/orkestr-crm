# Orkestr CRM

Orkestr CRM is an MCP-first outreach ledger for agent-operated sales workflows. It gives AI agents and connector workers one auditable place to record leads, outreach events, follow-up state, scheduling context, and backup status.

The project is deliberately not a generic CRM or an outreach automation bot. The core product contract is the ledger: every successful external send can be written once, deduplicated by an idempotency key, and then read back through HTTP APIs, MCP tools, and MCP resources.

## What It Does

- Records outreach events atomically: lead upsert, flow assignment update, and activity append.
- Exposes MCP tools and resources for agent workflows such as queue review, lead lookup, event recording, and backup health.
- Keeps connector boundaries explicit for LinkedIn, Sales Navigator, email, calendar, and future CRM syncs.
- Ships a public-safe synthetic demo seed and smoke path.
- Treats backups, approval boundaries, and auditability as product requirements.

## Stack

- Angular with Signals
- Node.js and Fastify
- Drizzle ORM
- PostgreSQL
- Redis
- MCP server for agent tools and resources
- Containerized runtime
- GitHub-backed backup worker

## Docker-First Quickstart

Run the product through Docker. You do not need Node.js or pnpm on the host for normal installation, demo usage, CLI usage, or multi-instance operation.

Requirements:

- Docker Engine
- Docker Compose plugin, optional. If Compose is unavailable, `./ocrm` falls back to direct Docker containers.

```bash
./ocrm start
./ocrm ready
./ocrm demo
./ocrm test
```

`./ocrm` builds the app image, starts Postgres, Redis, API, MCP, web, worker, and scheduler containers, runs migrations, seeds baseline data, loads a public-safe demo, then runs smoke checks.

Print the URLs assigned to the Docker instance:

```bash
./ocrm urls
```

Run CLI commands inside the Docker instance network:

```bash
./ocrm cli health
./ocrm tools
./ocrm cli mcp:call crm.search_leads --input '{"query":"founder"}'
./ocrm cli mcp:read crm://queue/today
```

The default demo instance exposes services through Docker-managed host ports. Use `./ocrm urls` instead of hard-coding ports in scripts or documentation. Override host ports in `instances/<name>.env.example` before creating an instance, or in the private `instances/<name>.local.env` after setup.

## Multiple Docker Instances

Multiple instances are isolated by env file, Docker project name, host ports, and database volumes.

```bash
./ocrm new client-a
$EDITOR instances/client-a.local.env
./ocrm -i client-a start
./ocrm -i client-a ready
./ocrm -i client-a urls
```

Each instance runs its CLI inside that instance's Docker network:

```bash
./ocrm -i client-a cli health
./ocrm -i client-a cli event:list --limit 20
```

## Public-Safe Demo

The demo path uses only synthetic records and `.invalid` URLs.

```bash
./ocrm start
./ocrm ready
./ocrm demo
./ocrm test
```

Use `./ocrm urls` to print the Docker instance URLs. Keep `instances/*.local.env` private; they may contain credentials and backup targets.

## CLI And MCP Testing

Use the Dockerized CLI:

```bash
./ocrm cli health
./ocrm tools
./ocrm cli mcp:call crm.search_leads --input '{"query":"founder"}'
./ocrm cli mcp:read crm://queue/today
./ocrm smoke
```

Host-side CLI development is contributor-only. For normal use, run `./ocrm cli ...` so the CLI resolves API and MCP services inside the Docker network.

## Data Model

Orkestr CRM keeps identity separate from workflow state:

- People are contacts.
- Companies own names, websites, and domains.
- Email addresses are normalized and unique.
- Leads are workflow records that link a person to a company.
- Tasks are the actionable queue for follow-up, research, approvals, and cleanup.
- Activities/events are the append-only timeline for messages, connection requests, emails, meetings, notes, and connector sync facts.

Lead writes go through identity resolution. Email addresses, LinkedIn URLs, SalesNav URLs, domains, and normalized company names are used to find existing records before anything new is created. Common fields are first-class columns, and `customFields`/`metadata` keep the model expandable.

General connector ingestion should write idempotent timeline events to `POST /api/events`:

```bash
./ocrm cli -- event:record \
  --type email_received \
  --channel email \
  --direction inbound \
  --name "Alex Rivera" \
  --email alex@example.test \
  --subject "Re: partnership" \
  --key "demo:gmail:thread-123:message-456"
```

The event ledger accepts `message_sent`, `message_received`, `connection_request_sent`, `connection_request_received`, `email_sent`, `email_received`, and the other activity types in the schema. Events can link to a lead, person, company, task, assignment, provider thread ID, provider message ID, external URL, and free-form metadata.

## Outreach Event Contract

Successful outreach senders should write to the ledger with one atomic API call:

```bash
curl -X POST "$CRM_API_URL/api/outreach-events" \
  -H 'content-type: application/json' \
  -d '{
    "externalKey": "demo:connection:alex-rivera:2026-06-15T09:23:18Z",
    "lead": {
      "fullName": "Alex Rivera",
      "company": "Example Infrastructure Co",
      "title": "Head of Partnerships",
      "linkedinUrl": "https://example.invalid/linkedin/alex-rivera",
      "source": "demo:synthetic"
    },
    "assignment": {
      "status": "connection_sent",
      "lastContactedAt": "2026-06-15T09:23:18Z"
    },
    "activity": {
      "type": "connection_sent",
      "channel": "linkedin",
      "direction": "outbound",
      "body": "Synthetic connection request recorded for demo purposes.",
      "occurredAt": "2026-06-15T09:23:18Z"
    }
  }'
```

`externalKey` is idempotent. Repeating the same call returns the existing activity instead of duplicating the outreach event. See [docs/outreach-event-contract.md](docs/outreach-event-contract.md).

## Database

```bash
./ocrm migrate
./ocrm seed
./ocrm demo
./ocrm db-smoke
```

`seed` creates baseline product configuration. `demo-seed` adds public-safe synthetic demo records.

## Contributor Development

Normal users should use `./ocrm`. Contributors who are changing TypeScript code can run workspace commands directly on the host:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm typecheck
pnpm build
pnpm db:generate
```

For host-side dev services, use `scripts/crm dev <service>`. Runtime validation should still go through Docker with `./ocrm test`.

## Documentation

- [Architecture](docs/architecture.md)
- [Outreach event contract](docs/outreach-event-contract.md)
- [Privacy and safe-data handling](docs/privacy-and-safe-data.md)
- [Future CRM sync](docs/crm-sync.md)
- [Instance operations](docs/instances.md)
- [Public repo export](docs/public-repo-export.md)
- [Release checklist](docs/public-release.md)

## Backups

Production must configure `BACKUP_GITHUB_REPO` and `BACKUP_GITHUB_TOKEN`.

```bash
./ocrm backup
./ocrm verify
```

The backup worker is part of the scaffold because backup enforcement is a product requirement, not an operational afterthought.

## Agent Branch Workflow

Agents should work on branches named:

```txt
agent/<agent-name>/<short-task>
```

MCP tools expose branch creation, branch summary, and PR body preparation. Opening a PR remains an approval-gated external side effect.

## Production Exposure

Default Docker development ports are loopback-only. For production, use the Caddy reverse proxy profile in `infra/compose/docker-compose.prod.yml` and expose only the proxy through the host firewall.
