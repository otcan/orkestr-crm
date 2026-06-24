# Start job search with Codex

This is the intended first-run path for job-search onboarding.

## 1. Install Codex

Install Codex for desktop from the official installer for your operating
system.

## 2. Create a Project

Open Codex and create a new Project for your job search.

Use an empty folder or a folder where you want Codex to clone oXRM.

## 3. Paste the onboarding prompt

Copy the prompt from:

```text
docs/prompts/job-search-codex-onboarding.md
```

Paste it into the new Codex Project.

Codex should clone `https://github.com/otcan/oxrm.git`, run the local checks,
start oXRM, ask the minimum job-search setup questions, and configure the
workspace through oXRM commands and docs.

## What Codex should ask

Codex should ask only what is needed to make job search useful:

- target roles
- location and remote constraints
- must-have skills
- exclusion criteria
- base CV file path
- cover-letter template path, if any
- job sources to track
- daily review time

## What Codex must not do

Codex must not send emails, message recruiters, upload CVs, submit
applications, use real external credentials, or claim external actions happened.

Agents draft locally. Humans act externally.

## Verify setup

After onboarding, Codex should show:

- local Web URL
- setup readiness score
- open setup todos and warnings
- next recommended action

Useful commands:

```bash
./oxrm urls
./oxrm cli setup:job-search:next
./oxrm cli mcp:call job_search.get_setup_next --input '{}'
```
