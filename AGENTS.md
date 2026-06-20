# oXRM agent instructions

oXRM is a self-hosted outreach workspace for high-context job search, customer
outreach, partnerships, and founder-led sales.

## Default local demo

```bash
./oxrm codex-demo
./oxrm cli mcp:read crm://queue/today
./oxrm cli mcp:call crm.search_leads --input '{"query":"founder"}'
./oxrm cli mcp:call xrm.run_view --input '{"key":"job_search.applications"}'
```

Use `./oxrm codex-demo --reset --check` when you need a fresh synthetic demo.

## Safety rules

- Use synthetic data for demos.
- Do not send email, LinkedIn messages, CVs, applications, invites, or any
  external outreach from this repo.
- Draft messages, cover letters, CV changes, and follow-up actions only.
- Treat approval records and action suggestions as proposed work until a human
  approves the real external action.
- Keep `crm.*`, `crm://`, `CRM_API_URL`, and `CRM_MCP_URL` compatible for
  existing agents.

## Job search loop

1. Read sources, timers, job postings, job fits, applications, CV versions,
   cover letters, files, approvals, action suggestions, and the communication
   ledger.
2. Prioritize high-fit postings and overdue follow-ups.
3. Generate or update draft CV/cover-letter files only when linked to an
   application or job fit.
4. Record synthetic notes/tasks through API or MCP only when supported.

## Outreach loop

1. Read the queue, lead/person/company records, relationship history, tasks,
   drafts, approvals, and outcomes.
2. Summarize context before recommending an action.
3. Draft a short next message when appropriate.
4. Leave final sending and external side effects to the human operator.
