# Job search XRM operating model

This is the plug-and-play structure for using oXRM as a local job application
system with Codex or another assistant.

## Core loop

Source -> raw signal -> canonical job -> fit -> application packet -> human
approval -> external action -> communication ledger -> follow-up.

Everything in that loop is an XRM record, relationship, view, task, event, or
file. There is no separate hidden job-search database.

## Human setup

Before an agent imports or scores jobs, the human should fill:

- job sources: job boards, saved alerts, career pages, recruiter inboxes,
  referrals, CSVs, APIs, or manual URLs
- target profile: roles, locations, seniority, work mode, must-haves,
  nice-to-haves, exclusions, and fit thresholds
- base CV path and CV editing policy
- cover-letter template path and drafting policy
- daily review time and timezone
- approval rules for applications, messages, uploads, and submissions

Open `/setup/job-search` or use:

```bash
./oxrm cli setup:job-search:next
./oxrm cli mcp:read oxrm://setup/job-search
./oxrm cli mcp:read oxrm://profile/job-search
./oxrm cli mcp:read oxrm://daily-contract/job-search
```

## XRM records

The job-search template uses these first-class records:

- `source_config`: where jobs come from and how an agent should import them
- `raw_job_signal`: one untrusted posting, alert, recruiter email, or pasted URL
- `job`: the canonical consolidated job posting
- `job_fit`: current fit, pushable fit, evidence, gaps, risk, and suggested action
- `application_packet`: draft-only packet tying job, fit, CV, cover letter,
  channel, contact, and approval state together
- `application`: the application state and phase
- `cv_version`, `cv_template`, `cover_letter`, `cover_letter_template`: local
  editable document records and file references
- `action_suggestion`: local suggested action that still needs review
- `approval_request`: the human decision record for a proposed action
- `action_run`: a dry-run, draft-only, local-only, or confirmed-result receipt
- `automation_timer`: planned/manual timer instructions until real scheduling is
  wired for a source
- `operator_playbook` and `setup_todo`: onboarding instructions and warnings

## Saved views

Use these views in the UI or through MCP:

```bash
./oxrm cli mcp:call xrm.run_view --input '{"key":"job_search.source_inbox"}'
./oxrm cli mcp:call xrm.run_view --input '{"key":"job_search.jobs"}'
./oxrm cli mcp:call xrm.run_view --input '{"key":"job_search.job_fits"}'
./oxrm cli mcp:call xrm.run_view --input '{"key":"job_search.application_packets"}'
./oxrm cli mcp:call xrm.run_view --input '{"key":"job_search.applications"}'
./oxrm cli mcp:call xrm.run_view --input '{"key":"job_search.communication_ledger"}'
./oxrm cli mcp:call xrm.run_view --input '{"key":"job_search.action_suggestions"}'
```

## Agent tools

Agents should use job-search tools before generic record writes:

```bash
./oxrm cli mcp:call job_search.get_profile --input '{}'
./oxrm cli mcp:call job_search.get_daily_contract --input '{}'
./oxrm cli mcp:call job_search.ingest_raw_signal --input '{...}'
./oxrm cli mcp:call job_search.check_duplicate --input '{...}'
./oxrm cli mcp:call job_search.promote_signal_to_job --input '{...}'
./oxrm cli mcp:call job_search.suggest_application_channel --input '{...}'
./oxrm cli mcp:call job_search.prepare_application_packet --input '{...}'
./oxrm cli mcp:call job_search.get_application_ledger --input '{...}'
./oxrm cli mcp:call job_search.record_application_event --input '{...}'
./oxrm cli mcp:call job_search.get_action_queue --input '{}'
./oxrm cli mcp:call job_search.propose_action --input '{...}'
./oxrm cli mcp:call job_search.approve_action --input '{...}'
./oxrm cli mcp:call job_search.reject_action --input '{...}'
./oxrm cli mcp:call job_search.run_local_action --input '{...}'
./oxrm cli mcp:call job_search.record_action_result --input '{...}'
```

## Action receipt contract

Every `action_suggestion` should be usable as an audit receipt. At minimum it
should include:

- target record id or external key
- target object type
- evidence snapshot
- safety class
- approval decision: `pending`, `approved`, `rejected`, or `not_required`
- run id or audit reference
- external-effect declaration

Agents should follow this sequence:

1. Create the suggestion with `job_search.propose_action`.
2. Ask the human to approve or reject.
3. Record the decision with `job_search.approve_action` or
   `job_search.reject_action`.
4. Use `job_search.run_local_action` only for dry runs, local drafts, or
   local-only record updates.
5. Use `job_search.record_action_result` for external outcomes only after the
   human confirms the action happened and provides proof/reference.

## Fit calculation discipline

An agent should not write a fit score without evidence. A `job_fit` record
should include:

- current fit score
- pushable fit score after reasonable CV/cover-letter adjustments
- confidence
- must-have evidence
- nice-to-have evidence
- exclusions
- location, language, rate, availability, seniority, and domain fit
- reason the score is not higher
- suggested CV changes
- suggested cover-letter angle
- recommended next action

Scores are suggestions. The human decides whether to apply.

## Document discipline

CV and cover-letter work is draft-only.

Agents may edit local `cv_version`, `cv_template`, `cover_letter`, and
`cover_letter_template` records or linked files. They must not invent
experience, upload documents, submit applications, or message recruiters.

## Recording external actions

After a human applies, emails, uploads, replies, or receives a response, record
it in the application ledger:

```bash
./oxrm cli mcp:call job_search.record_application_event --input '{
  "applicationId": "...",
  "type": "email_sent",
  "channel": "email",
  "direction": "outbound",
  "subject": "Applied for backend role",
  "body": "Human confirmed the application was sent.",
  "humanConfirmed": true,
  "confirmationSource": "human",
  "proof": "Confirmation email visible in local inbox",
  "externalReference": "message-id-or-platform-id"
}'
```

Only record external actions after the human confirms they happened. oXRM tools
should reject external send/upload/apply results when approval, confirmation,
or proof is missing.
