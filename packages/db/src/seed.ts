import { agents, eventTypes, flowSteps, flows, viewDefinitions } from "./schema/index.js";
import { createDatabase } from "./client.js";
import { eq } from "drizzle-orm";

const { db, queryClient } = createDatabase();

try {
  const agent =
    (await db.query.agents.findFirst({ where: eq(agents.name, "Codex CRM Operator") })) ??
    (
      await db
        .insert(agents)
        .values({
          name: "Codex CRM Operator",
          type: "crm_operator",
          defaultBranchPrefix: "agent/codex"
        })
        .returning()
    )[0];

  const persistedFlow =
    (await db.query.flows.findFirst({ where: eq(flows.name, "Default LinkedIn Outreach") })) ??
    (
      await db
        .insert(flows)
        .values({
          name: "Default LinkedIn Outreach",
          description: "Starter flow for LinkedIn, SalesNav, and email follow-up."
        })
        .returning()
    )[0];

  if (persistedFlow) {
    const existingSteps = await db.query.flowSteps.findMany({
      where: eq(flowSteps.flowId, persistedFlow.id)
    });
    if (existingSteps.length === 0) {
      await db.insert(flowSteps).values([
        { flowId: persistedFlow.id, stepOrder: 1, name: "Connect", channel: "linkedin", defaultDelayDays: 0 },
        { flowId: persistedFlow.id, stepOrder: 2, name: "First message", channel: "linkedin", defaultDelayDays: 1 },
        { flowId: persistedFlow.id, stepOrder: 3, name: "Follow-up", channel: "email", defaultDelayDays: 4 }
      ]);
    }
  }

  const eventType = await db.query.eventTypes.findFirst({ where: eq(eventTypes.slug, "intro-call") });
  if (!eventType) {
    await db.insert(eventTypes).values({
      name: "Intro Call",
      slug: "intro-call",
      description: "Default 30 minute intro call.",
      durationMinutes: 30,
      bufferBeforeMinutes: 5,
      bufferAfterMinutes: 5,
      bookingWindowDays: 30
    });
  }

  const defaultViews = [
    {
      key: "lead.all",
      name: "All Leads",
      description: "Recent leads with core identity and source fields.",
      objectType: "lead",
      layout: "table",
      columns: ["fullName", "company", "email", "source", "updatedAt"],
      filters: [],
      sort: [{ field: "updatedAt", direction: "desc" }],
      isDefault: true
    },
    {
      key: "person.all",
      name: "All People",
      description: "Normalized people/contact records.",
      objectType: "person",
      layout: "table",
      columns: ["fullName", "title", "location", "source", "updatedAt"],
      filters: [],
      sort: [{ field: "updatedAt", direction: "desc" }],
      isDefault: true
    },
    {
      key: "company.all",
      name: "All Companies",
      description: "Normalized company and domain records.",
      objectType: "company",
      layout: "table",
      columns: ["name", "primaryDomain", "industry", "source", "updatedAt"],
      filters: [],
      sort: [{ field: "updatedAt", direction: "desc" }],
      isDefault: true
    },
    {
      key: "task.open",
      name: "Open Tasks",
      description: "Open work items ordered by priority and due date.",
      objectType: "task",
      layout: "table",
      columns: ["title", "status", "type", "priority", "dueAt"],
      filters: [{ field: "status", operator: "equals", value: "open" }],
      sort: [
        { field: "priority", direction: "desc" },
        { field: "dueAt", direction: "asc" }
      ],
      isDefault: true
    },
    {
      key: "event.recent",
      name: "Recent Events",
      description: "Recent timeline events across records.",
      objectType: "event",
      layout: "timeline",
      columns: ["type", "channel", "direction", "lead.fullName", "occurredAt"],
      filters: [],
      sort: [{ field: "occurredAt", direction: "desc" }],
      isDefault: true
    }
  ];

  let createdViews = 0;
  for (const view of defaultViews) {
    const existing = await db.query.viewDefinitions.findFirst({ where: eq(viewDefinitions.key, view.key) });
    if (!existing) {
      await db.insert(viewDefinitions).values(view);
      createdViews += 1;
    }
  }

  console.log(
    JSON.stringify(
      {
        status: "ok",
        agentId: agent?.id ?? null,
        flowId: persistedFlow?.id ?? null,
        createdViews
      },
      null,
      2
    )
  );
} finally {
  await queryClient.end();
}
