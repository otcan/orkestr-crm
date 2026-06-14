import { createDatabase, activities, assignments, backupRuns, leads } from "@orkestr-crm/db";
import { createActivitySchema, createLeadSchema, updateAssignmentSchema } from "@orkestr-crm/shared";
import { desc, eq, lte } from "drizzle-orm";
import { z } from "zod";

export function createCrmTools(databaseUrl: string) {
  const { db, queryClient } = createDatabase(databaseUrl);

  return {
    async close() {
      await queryClient.end();
    },

    async searchLeads(input: { query?: string | undefined; limit?: number | undefined }) {
      const limit = input.limit ?? 20;
      const rows = await db.query.leads.findMany({
        orderBy: [desc(leads.updatedAt)],
        limit
      });

      if (!input.query) {
        return rows;
      }

      const q = input.query.toLowerCase();
      return rows.filter((lead) =>
        [lead.fullName, lead.company, lead.title, lead.linkedinUrl, lead.salesnavUrl, lead.email]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(q))
      );
    },

    async createLead(input: unknown) {
      const parsed = createLeadSchema.parse(input);
      const [created] = await db
        .insert(leads)
        .values({
          fullName: parsed.fullName,
          company: parsed.company,
          title: parsed.title,
          linkedinUrl: parsed.linkedinUrl,
          salesnavUrl: parsed.salesnavUrl,
          email: parsed.email,
          phone: parsed.phone,
          location: parsed.location,
          source: parsed.source,
          ownerAgentId: parsed.ownerAgentId,
          notes: parsed.notes
        })
        .returning();

      return created;
    },

    async getDailyQueue(input: { limit?: number | undefined }) {
      return db.query.assignments.findMany({
        where: lte(assignments.nextActionAt, new Date()),
        orderBy: [desc(assignments.priority), desc(assignments.nextActionAt)],
        limit: input.limit ?? 25
      });
    },

    async updateAssignmentStatus(input: unknown) {
      const schema = z.object({
        assignmentId: z.string().uuid(),
        patch: updateAssignmentSchema
      });
      const parsed = schema.parse(input);
      const [updated] = await db
        .update(assignments)
        .set({
          ...parsed.patch,
          lastContactedAt: parsed.patch.lastContactedAt ? new Date(parsed.patch.lastContactedAt) : undefined,
          nextActionAt: parsed.patch.nextActionAt ? new Date(parsed.patch.nextActionAt) : undefined,
          updatedAt: new Date()
        })
        .where(eq(assignments.id, parsed.assignmentId))
        .returning();

      return updated;
    },

    async logActivity(input: unknown) {
      const parsed = createActivitySchema.parse(input);
      const [created] = await db
        .insert(activities)
        .values({
          leadId: parsed.leadId,
          assignmentId: parsed.assignmentId,
          integrationAccountId: parsed.integrationAccountId,
          type: parsed.type,
          channel: parsed.channel,
          direction: parsed.direction,
          body: parsed.body,
          externalId: parsed.externalId,
          occurredAt: parsed.occurredAt ? new Date(parsed.occurredAt) : undefined
        })
        .returning();

      return created;
    },

    async getBackupHealth() {
      const latest = await db.query.backupRuns.findFirst({
        orderBy: [desc(backupRuns.startedAt)]
      });

      return {
        latestStatus: latest?.status ?? "missing",
        latestFinishedAt: latest?.finishedAt ?? null,
        degraded:
          !latest?.finishedAt ||
          latest.status !== "succeeded" ||
          Date.now() - latest.finishedAt.getTime() > 26 * 60 * 60 * 1000
      };
    }
  };
}
