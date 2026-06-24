# Job-search Codex onboarding prompt

You are helping me set up oXRM locally for job search only.

Goal: create a local job application system for tracking job sources, postings,
fit scores, applications, CV versions, cover letters, recruiter contacts,
communication history, follow-ups, and approval-gated draft actions.

Use Docker. Do not use real external credentials yet. Do not send emails,
LinkedIn messages, CVs, cover letters, job applications, uploads, or recruiter
messages. Draft only.

## Steps

1. Clone oXRM if it is not already present:

   ```bash
   git clone https://github.com/otcan/oxrm.git
   cd oxrm
   ```

2. Inspect the repo docs before operating:

   ```bash
   sed -n '1,220p' docs/start-with-codex.md
   sed -n '1,220p' docs/onboarding/job-search-setup.md
   sed -n '1,220p' docs/agent-job-search-loop.md
   ```

3. Check the machine:

   ```bash
   ./oxrm doctor
   ```

   If Docker, ports, disk, permissions, or dependencies are missing, explain
   the issue clearly and suggest the safest fix before continuing.

4. Start the local job-search workspace:

   ```bash
   ./oxrm init personal --template job-search --ports auto
   ./oxrm -i personal ready
   ./oxrm -i personal urls
   ```

   If `init` is already done, use the existing instance and print the URLs.

5. Read the setup state:

   ```bash
   ./oxrm -i personal cli setup:job-search:next
   ./oxrm -i personal cli mcp:read oxrm://setup/job-search
   ./oxrm -i personal cli mcp:read oxrm://playbook/job-search
   ```

6. Ask me only the missing essentials:

   - What roles are you targeting?
   - What locations, remote rules, salary constraints, or visa constraints matter?
   - What skills or domains are must-have?
   - What roles, industries, seniority levels, or constraints should be excluded?
   - Where is your base CV file?
   - Do you have a cover-letter template file?
   - Which sources should be tracked: job boards, saved alerts, career pages,
     recruiter inbox, referrals, CSV, or manual URLs?
   - What time should the daily review happen?

7. Configure oXRM from my answers using:

   ```bash
   ./oxrm -i personal cli setup:job-search --input '{...}'
   ./oxrm -i personal cli setup:job-search:next
   ```

   Use only the sources I named. Do not add example/template sources such as
   "Recruiter inbox" unless I explicitly asked for that source.

8. Show me:

   - Web URL
   - setup readiness score
   - open setup todos
   - warnings
   - next recommended action
   - the first three views I should open

9. Stop after setup. Do not apply to jobs or contact anyone.

## Operating rule

Before every future job-search session, read:

```bash
./oxrm -i personal cli setup:job-search:next
```

Resolve blocking todos before importing, scoring, drafting, or creating
application records. Warnings should change behavior, but they do not always
block local work.
