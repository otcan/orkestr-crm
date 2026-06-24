# Start here

This page is the shortest path to a usable local oXRM job-search workspace.

## What oXRM is

oXRM is a self-hosted outreach workspace for high-context outreach.

Use it for:

- job applications and CV follow-ups
- recruiter communication
- customer outreach
- partnerships
- founder-led sales
- warm leads and relationship follow-ups

It stores local records, tasks, notes, drafts, files, relationships, events,
saved views, and approval state. Agents can read and update that local state,
but humans stay responsible for external actions.

## Recommended: start with Codex

1. Install Codex for desktop.
2. Create a new Project.
3. Paste the prompt from `docs/prompts/job-search-codex-onboarding.md`.

Codex should clone oXRM, run `./oxrm doctor`, start the local Docker stack,
ask the essential job-search setup questions, and configure the workspace.

See [Start job search with Codex](start-with-codex.md).

## Run locally yourself

Requirements: Docker Engine.

```bash
git clone https://github.com/otcan/oxrm.git
cd oxrm
./oxrm init personal --template job-search --ports auto
./oxrm -i personal urls
```

Open the printed Web URL.

If you are using the default instance instead of `personal`:

```bash
./oxrm start
./oxrm ready
./oxrm urls
```

## Choose a workspace

Use `job-search` when you want applications, CV versions, cover letters, job
fit scoring, recruiter contacts, interviews, and follow-ups.

Use `outreach` when you want leads, people, companies, opportunities, draft
messages, approvals, outcomes, and follow-ups.

Use `blank` when you want structure without synthetic demo data.

```bash
./oxrm init jobs --template job-search --ports auto
./oxrm init sales --template outreach --ports auto
./oxrm init empty --template blank --ports auto
```

## Set up job search

After the stack is running:

```bash
./oxrm -i personal cli setup:job-search
./oxrm -i personal cli setup:job-search:get
./oxrm -i personal cli setup:job-search:next
```

Open:

```text
/setup/job-search
```

The setup creates normal XRM records for sources, fit scoring, CV editing,
cover-letter drafting, follow-ups, timers, and the operator playbook.

## Connect an assistant

Print the local MCP endpoint:

```bash
./oxrm urls
```

Then ask the assistant to read:

```bash
./oxrm -i personal cli mcp:read oxrm://setup/job-search
./oxrm -i personal cli mcp:read oxrm://playbook/job-search
./oxrm -i personal cli mcp:read crm://queue/today
```

The assistant may draft, score, summarize, and create local tasks. It should
not send emails, upload CVs, apply to jobs, message recruiters, or claim an
external action happened unless a human confirms it.

## Verify the install

```bash
./oxrm -i personal cli health
./oxrm -i personal test
OXRM_INSTANCE=personal bash scripts/smoke-job-search-setup.sh
```

## Next docs

- [Start job search with Codex](start-with-codex.md)
- [Job search setup](onboarding/job-search-setup.md)
- [Agent job search loop](agent-job-search-loop.md)
- [XRM model](xrm-model.md)
- [MCP](mcp.md)
- [Troubleshooting](troubleshooting.md)
