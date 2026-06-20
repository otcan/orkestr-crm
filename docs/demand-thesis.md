# Demand Thesis

## Short Answer

There is likely demand for oXRM if it is positioned as self-hosted outreach for
technical operators using agents, not as a generic CRM clone.

The winning wedge is:

> A self-hosted outreach workspace for high-context outreach, from job
> applications and CV follow-ups to customer outreach, partnerships, and
> founder-led sales.

## Why Demand Exists

### 1. Generic CRM Is Crowded, But Self-Hosted Outreach Is Clear

The CRM market is mature and crowded. Building a generic CRM is not attractive.

However, self-hosted outreach for high-context work is still underserved:
operators use spreadsheets, inboxes, LinkedIn, notes, and AI chats at the same
time. oXRM should own that local workflow before presenting itself as
infrastructure.

### 2. Open-Source CRM Demand Is Real

Twenty has strong traction as an open-source CRM platform. That shows teams want CRM systems they can customize, self-host, version, and integrate deeply.

This does not prove demand for oXRM specifically, but it supports the direction: technical teams want relationship infrastructure that behaves like software, not locked SaaS.

### 3. Agents Need A Local Outreach Workspace

Agents can help when outreach state is structured. That maps directly to daily
outreach operations:

- find leads
- inspect history
- decide next action
- update state
- schedule calls
- sync integrations
- prepare follow-ups

If agents are going to help with outreach, they need systems designed around
queues, drafts, approvals, and audit trails instead of systems built only around
human UI clicks.

### 4. LinkedIn Outreach Tools Exist, But CRM State Is Fragmented

The market has many LinkedIn automation and outreach tools. That is a demand signal, but also a warning.

The opportunity is not to compete head-on as a LinkedIn automation tool. The
opportunity is to become the trusted local workspace across outreach workflows:

- LinkedIn
- Sales Navigator
- email
- calendar
- manual operator notes
- agent actions
- job applications, referrals, interviews, and documents

## Positioning

Avoid:

- "Open-source CRM"
- "LinkedIn automation tool"
- "AI sales assistant"

Prefer:

- "Self-hosted outreach workspace"
- "Run your outreach from your own machine"
- "High-context outreach for job search, customer outreach, partnerships, and founder-led sales"

## Target Users

Best early users:

- AI-forward outbound agencies.
- Founder-led sales teams using agents heavily.
- Operators running multiple LinkedIn/SalesNav workflows.
- Operators managing high-context job searches or recruiting-style relationship workflows.
- Teams already unhappy with CRM data entry.
- Teams that want self-hosting, auditability, and custom automation.

Weak early users:

- Traditional sales teams that just want Salesforce or HubSpot.
- Teams that need enterprise forecasting first.
- Users who primarily want a polished human-first CRM.
- Teams unwilling to run containers or manage credentials.

## Demand Risks

- Generic CRM expectations can swallow the product.
- LinkedIn automation is fragile and policy-sensitive.
- MCP tools need strong security and approval controls.
- Sales teams may want polished SaaS more than self-hosted infrastructure.
- Calendar, email, LinkedIn, and SalesNav integrations can dominate engineering time.
- A narrow internal-tool product may not translate into broad external demand without packaging.

## Validation Plan

Validate demand before overbuilding:

1. Dogfood internally for one real LinkedIn/SalesNav workflow.
2. Build only the MCP tools needed for daily operation.
3. Track whether agents reduce manual CRM updates.
4. Validate job-search as the first non-outreach proof preset using applications, interviews, referrals, documents, tasks, and timelines.
5. Add scheduler only to the point where meetings can be booked reliably.
6. Give it to 3-5 similar operators or agencies.
7. Measure repeated weekly use, not signup interest.
8. Ask for payment or deployment commitment after the first successful workflow.

## Decision

Build if the goal is to own self-hosted outreach for technical operators using
agents.

Do not build if the goal is to ship a general-purpose CRM quickly. In that case, use Relaticle or Twenty.
