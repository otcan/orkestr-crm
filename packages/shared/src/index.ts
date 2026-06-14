import { z } from "zod";

export const assignmentStatusSchema = z.enum([
  "new",
  "queued",
  "connection_sent",
  "connected",
  "messaged",
  "follow_up_due",
  "replied",
  "meeting_booked",
  "won",
  "lost",
  "do_not_contact"
]);

export const activityTypeSchema = z.enum([
  "connection_sent",
  "connection_accepted",
  "message_sent",
  "message_received",
  "inmail_sent",
  "email_sent",
  "email_received",
  "follow_up_due",
  "booking_created",
  "meeting_booked",
  "not_interested",
  "converted",
  "manual_note"
]);

export const channelSchema = z.enum([
  "linkedin",
  "salesnav",
  "email",
  "scheduler",
  "manual"
]);

export const directionSchema = z.enum(["outbound", "inbound", "internal"]);

export const integrationProviderSchema = z.enum([
  "linkedin",
  "salesnav",
  "gmail",
  "outlook",
  "google_calendar",
  "microsoft_calendar",
  "caldav"
]);

export const integrationStatusSchema = z.enum([
  "active",
  "needs_auth",
  "paused",
  "error",
  "archived"
]);

export const agentTypeSchema = z.enum([
  "crm_operator",
  "code_contributor",
  "connector_worker",
  "scheduler_worker"
]);

export const agentStatusSchema = z.enum(["active", "paused", "archived"]);
export const approvalStatusSchema = z.enum(["pending", "approved", "rejected", "expired"]);
export const backupStatusSchema = z.enum(["running", "succeeded", "failed"]);

export const createLeadSchema = z.object({
  fullName: z.string().min(1),
  company: z.string().optional(),
  title: z.string().optional(),
  linkedinUrl: z.string().url().optional(),
  salesnavUrl: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  location: z.string().optional(),
  source: z.string().optional(),
  ownerAgentId: z.string().uuid().optional(),
  notes: z.string().optional()
});

export const updateLeadSchema = createLeadSchema.partial();

export const createActivitySchema = z.object({
  leadId: z.string().uuid(),
  assignmentId: z.string().uuid().optional(),
  integrationAccountId: z.string().uuid().optional(),
  type: activityTypeSchema,
  channel: channelSchema,
  direction: directionSchema.default("internal"),
  body: z.string().optional(),
  externalId: z.string().optional(),
  occurredAt: z.string().datetime().optional()
});

export const createAssignmentSchema = z.object({
  leadId: z.string().uuid(),
  flowId: z.string().uuid(),
  currentStepId: z.string().uuid().optional(),
  status: assignmentStatusSchema.default("new"),
  priority: z.number().int().default(0),
  ownerAgentId: z.string().uuid().optional(),
  nextActionAt: z.string().datetime().optional()
});

export const updateAssignmentSchema = z.object({
  currentStepId: z.string().uuid().nullable().optional(),
  status: assignmentStatusSchema.optional(),
  priority: z.number().int().optional(),
  ownerAgentId: z.string().uuid().nullable().optional(),
  lastContactedAt: z.string().datetime().nullable().optional(),
  nextActionAt: z.string().datetime().nullable().optional()
});

export type AssignmentStatus = z.infer<typeof assignmentStatusSchema>;
export type ActivityType = z.infer<typeof activityTypeSchema>;
export type Channel = z.infer<typeof channelSchema>;
export type Direction = z.infer<typeof directionSchema>;
export type IntegrationProvider = z.infer<typeof integrationProviderSchema>;
export type IntegrationStatus = z.infer<typeof integrationStatusSchema>;
export type AgentType = z.infer<typeof agentTypeSchema>;
export type AgentStatus = z.infer<typeof agentStatusSchema>;
export type ApprovalStatus = z.infer<typeof approvalStatusSchema>;
export type BackupStatus = z.infer<typeof backupStatusSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type CreateAssignmentInput = z.infer<typeof createAssignmentSchema>;
export type UpdateAssignmentInput = z.infer<typeof updateAssignmentSchema>;

