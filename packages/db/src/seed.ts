import { agents, eventTypes, flowSteps, flows } from "./schema/index.js";
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

  console.log(
    JSON.stringify(
      {
        status: "ok",
        agentId: agent?.id ?? null,
        flowId: persistedFlow?.id ?? null
      },
      null,
      2
    )
  );
} finally {
  await queryClient.end();
}
