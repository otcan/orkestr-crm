# ork-linkedin Integration Boundary

`ork-linkedin` owns reusable LinkedIn operation mechanics: browser/runtime
state, safety blockers, invite verification, MCP tools, and optional storage
adapters.

oXRM owns relationship state: leads, people, companies, assignments, tasks,
activities, saved views, approvals, and audit links.

The repos must remain independent. oXRM must not import `ork-linkedin`, and
`ork-linkedin` must not import oXRM packages. Campaign repos must also avoid
importing either implementation directly. Cross-repo operation happens through
MCP tools and stable HTTP/API contracts only.

## Allowed Paths

- `ork-linkedin` writes verified relationship events through
  `crm.record_outreach_event` or `POST /api/outreach-events`.
- `ork-linkedin` writes blockers through `crm.record_event` or a stable API
  event endpoint.
- oXRM exposes queues, approvals, and saved views through its MCP resources and
  tools.
- Campaign timers call `ork-linkedin` MCP tools or thin wrappers that call MCP.

## Forbidden Paths

- Importing `@orkestr-crm/*` from `ork-linkedin`.
- Importing `ork-linkedin` packages from oXRM.
- Sharing browser profiles, cookies, local paths, or campaign-private prompts.
- Recording `connection_sent` before `ork-linkedin` returns verified send
  evidence.

## Event Mapping

| LinkedIn result | oXRM path | Notes |
| --- | --- | --- |
| Verified connection request | `crm.record_outreach_event` | Creates/updates lead, assignment, activity, and acceptance-check task. |
| Quota or safety blocker | `crm.record_event` | Records blocker evidence without pretending a send happened. |
| Accepted connection | `crm.record_event` or `crm.record_outreach_event` | Creates a first-message approval task when appropriate. |
| Inbound reply | `crm.record_event` | Creates or updates review/follow-up task. |
| Human approval needed | `crm.request_approval` | Keeps outbound action under operator control. |

## Related Repo

- `otcan/ork-linkedin`: https://github.com/otcan/ork-linkedin
- Jira project: https://metastatebio.atlassian.net/jira/software/c/projects/ORKLINK
