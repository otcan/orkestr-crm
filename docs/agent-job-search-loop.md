# Agent job search loop

This is the operating manual for a local assistant working with oXRM.

## First read

```bash
./oxrm cli mcp:read oxrm://setup/job-search
./oxrm cli mcp:read oxrm://profile/job-search
./oxrm cli mcp:read oxrm://daily-contract/job-search
./oxrm cli mcp:read oxrm://playbook/job-search
./oxrm cli mcp:call job_search.get_setup_next --input '{}'
./oxrm cli mcp:call xrm.run_view --input '{"key":"job_search.source_inbox"}'
./oxrm cli mcp:call xrm.run_view --input '{"key":"job_search.jobs"}'
./oxrm cli mcp:call xrm.run_view --input '{"key":"job_search.job_fits"}'
./oxrm cli mcp:call xrm.run_view --input '{"key":"job_search.applications"}'
```

## Daily loop

1. Read configured sources and the daily contract.
2. Create `raw_job_signal` records for new postings, alerts, recruiter emails,
   or pasted URLs.
3. Run duplicate checks before creating canonical `job` records.
4. Create or update `job_fit` records using the configured rubric.
5. Prepare draft-only `application_packet` records for high-fit jobs.
6. Create approval tasks or `action_suggestion` records.
7. Record the human approval or rejection on the action suggestion.
8. Run local/draft-only actions through `job_search.run_local_action`.
9. After the human applies, uploads, or sends externally, record the action
   result with confirmation and proof/reference.
10. Record the application ledger event and next follow-up.

## Operating model

Read [job-search XRM operating model](job-search-xrm-operating-model.md) for
the object model, saved views, MCP tools, fit calculation discipline, CV/cover
letter rules, and ledger recording contract.

## Initial setup prompt

```text
If this is a fresh machine, use docs/prompts/job-search-codex-onboarding.md.

Use Docker and local synthetic/demo-safe data unless I explicitly provide real
records.

Run or inspect the job-search setup:

1. Run `./oxrm cli setup:job-search:next`.
2. If setup is missing, run `./oxrm cli setup:job-search`.
3. Read `oxrm://setup/job-search`.
4. Read `oxrm://playbook/job-search`.
5. Tell me what sources, CV policy, cover-letter policy, fit rubric, timers,
   and approval boundaries are configured.
6. List blocking todos first, then warnings.
7. Do not send, upload, apply, or contact anyone.
```

## Daily import and scoring prompt

```text
Read the configured job-search sources and today's queue.

For each new synthetic or user-provided posting:
- preserve source URL
- preserve raw job description
- dedupe by company, title, location, and URL
- create or update a raw_job_signal first
- promote only after duplicate review
- create or update the canonical job posting record
- create or update a job_fit record with evidence
- explain strengths, gaps, risks, uncertainty, and suggested next action

Do not apply. Do not message recruiters. Do not upload documents.
```

## High-fit review prompt

```text
Run the job postings and job fits views.

Pick up to three high-fit jobs. For each one:
- summarize company, role, location, source, and application phase
- summarize fit evidence and gaps
- identify whether a CV version and cover letter exist
- propose the next local action
- mark whether human approval is required

Do not create external actions.
```

## CV and cover-letter drafting prompt

```text
Use the configured CV and cover-letter policy.

For the selected application:
- read the job posting
- read the job fit
- read existing CV versions and cover letters
- draft a role-specific CV change summary
- draft a cover letter only if the configured policy allows it
- create local draft records only if I approve

Do not invent experience. Do not upload or send anything.
```

## Follow-up prompt

```text
Read the application, communication ledger, responsible contact, last touch,
and next action date.

Draft one short follow-up. Include the reason for follow-up and any uncertainty.

Do not send the follow-up. If I approve, create a local draft or task only.
After I send externally, record the confirmed event and next follow-up.
```

## Tool preference

Use purpose-built job-search tools before generic XRM writes:

```bash
./oxrm cli mcp:call job_search.ingest_raw_signal --input '{...}'
./oxrm cli mcp:call job_search.check_duplicate --input '{...}'
./oxrm cli mcp:call job_search.promote_signal_to_job --input '{...}'
./oxrm cli mcp:call job_search.suggest_application_channel --input '{...}'
./oxrm cli mcp:call job_search.prepare_application_packet --input '{...}'
./oxrm cli mcp:call job_search.record_application_event --input '{...}'
./oxrm cli mcp:call job_search.propose_action --input '{...}'
./oxrm cli mcp:call job_search.approve_action --input '{...}'
./oxrm cli mcp:call job_search.reject_action --input '{...}'
./oxrm cli mcp:call job_search.run_local_action --input '{...}'
./oxrm cli mcp:call job_search.record_action_result --input '{...}'
```

## Safety boundary

Do not send email, LinkedIn messages, CVs, cover letters, job applications,
uploads, or recruiter replies from MCP tools.

Record external actions only after the human confirms they happened and gives
proof such as a provider message id, platform application id, confirmation URL,
or concise manual proof note.
