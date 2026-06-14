import cors from "@fastify/cors";
import { createDatabase, leads, assignments, activities, backupRuns } from "@orkestr-crm/db";
import { createLeadSchema, createActivitySchema, createAssignmentSchema } from "@orkestr-crm/shared";
import { desc, eq, lte } from "drizzle-orm";
import Fastify from "fastify";
import { ZodError } from "zod";
import { loadConfig } from "./config.js";

export async function buildServer() {
  const config = loadConfig();
  const { db, queryClient } = createDatabase(config.databaseUrl);

  const app = Fastify({
    logger: {
      level: config.logLevel
    }
  });

  app.addHook("onClose", async () => {
    await queryClient.end();
  });

  await app.register(cors, {
    origin: true
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: "validation_error",
        issues: error.issues
      });
    }

    app.log.error(error);
    return reply.status(500).send({
      error: "internal_server_error"
    });
  });

  app.get("/api/health", async () => {
    const latestBackup = await db.query.backupRuns.findFirst({
      orderBy: [desc(backupRuns.startedAt)]
    });

    const backupAgeMs = latestBackup?.status === "succeeded" && latestBackup.finishedAt
      ? Date.now() - latestBackup.finishedAt.getTime()
      : null;

    return {
      status: backupAgeMs === null || backupAgeMs > 26 * 60 * 60 * 1000 ? "degraded" : "ok",
      service: "orkestr-crm-api",
      backup: {
        latestStatus: latestBackup?.status ?? "missing",
        latestFinishedAt: latestBackup?.finishedAt ?? null
      }
    };
  });

  app.get("/api/leads", async () => {
    return db.query.leads.findMany({
      orderBy: [desc(leads.updatedAt)],
      limit: 100
    });
  });

  app.post("/api/leads", async (request, reply) => {
    const input = createLeadSchema.parse(request.body);
    const [created] = await db
      .insert(leads)
      .values({
        fullName: input.fullName,
        company: input.company,
        title: input.title,
        linkedinUrl: input.linkedinUrl,
        salesnavUrl: input.salesnavUrl,
        email: input.email,
        phone: input.phone,
        location: input.location,
        source: input.source,
        ownerAgentId: input.ownerAgentId,
        notes: input.notes
      })
      .returning();

    return reply.status(201).send(created);
  });

  app.get("/api/assignments/due", async () => {
    return db.query.assignments.findMany({
      where: lte(assignments.nextActionAt, new Date()),
      orderBy: [desc(assignments.priority), desc(assignments.nextActionAt)],
      limit: 100
    });
  });

  app.post("/api/assignments", async (request, reply) => {
    const input = createAssignmentSchema.parse(request.body);
    const [created] = await db
      .insert(assignments)
      .values({
        leadId: input.leadId,
        flowId: input.flowId,
        currentStepId: input.currentStepId,
        status: input.status,
        priority: input.priority,
        ownerAgentId: input.ownerAgentId,
        nextActionAt: input.nextActionAt ? new Date(input.nextActionAt) : undefined
      })
      .returning();

    return reply.status(201).send(created);
  });

  app.post("/api/activities", async (request, reply) => {
    const input = createActivitySchema.parse(request.body);
    const [created] = await db
      .insert(activities)
      .values({
        leadId: input.leadId,
        assignmentId: input.assignmentId,
        integrationAccountId: input.integrationAccountId,
        type: input.type,
        channel: input.channel,
        direction: input.direction,
        body: input.body,
        externalId: input.externalId,
        occurredAt: input.occurredAt ? new Date(input.occurredAt) : undefined
      })
      .returning();

    return reply.status(201).send(created);
  });

  app.get("/api/leads/:id/activities", async (request) => {
    const params = request.params as { id: string };
    return db.query.activities.findMany({
      where: eq(activities.leadId, params.id),
      orderBy: [desc(activities.occurredAt)],
      limit: 100
    });
  });

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const config = loadConfig();
  const app = await buildServer();
  await app.listen({ host: config.host, port: config.port });
}
