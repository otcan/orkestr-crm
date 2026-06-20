-- Manual migration note:
-- Backfill: preserve the old fixed agent_type enum value in metadata.legacyType,
-- then map bundled roles to generic text categories so future runtimes can define
-- their own type strings without Postgres enum changes.
-- Verification: confirm agents.type is text, agent_type no longer exists, and
-- existing agent rows retain their old role under metadata->>'legacyType'.
-- Rollback impact: recreating the old enum requires mapping any custom type
-- strings back to one of crm_operator, code_contributor, connector_worker, or
-- scheduler_worker before narrowing the column type.
ALTER TABLE "agents" ALTER COLUMN "type" SET DATA TYPE text USING "type"::text;--> statement-breakpoint
ALTER TABLE "agents" ALTER COLUMN "type" SET DEFAULT 'operator';--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "capabilities" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "runtime_config" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "agents" ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
UPDATE "agents"
SET
  "metadata" = jsonb_set("metadata", '{legacyType}', to_jsonb("type"), true),
  "type" = CASE "type"
    WHEN 'crm_operator' THEN 'operator'
    WHEN 'code_contributor' THEN 'operator'
    WHEN 'connector_worker' THEN 'worker'
    WHEN 'scheduler_worker' THEN 'worker'
    ELSE "type"
  END,
  "capabilities" = CASE "type"
    WHEN 'crm_operator' THEN '[{"key":"crm.read","level":"read"},{"key":"crm.write","level":"write"},{"key":"plan.execute","level":"write"}]'::jsonb
    WHEN 'code_contributor' THEN '[{"key":"code.branch","level":"system"},{"key":"plan.execute","level":"write"}]'::jsonb
    WHEN 'connector_worker' THEN '[{"key":"crm.read","level":"read"},{"key":"crm.write","level":"write"},{"key":"integration.sync","level":"external_side_effect"}]'::jsonb
    WHEN 'scheduler_worker' THEN '[{"key":"crm.read","level":"read"},{"key":"scheduler.write","level":"external_side_effect"}]'::jsonb
    ELSE "capabilities"
  END
WHERE "metadata"->>'legacyType' IS NULL;--> statement-breakpoint
DROP TYPE "public"."agent_type";
