CREATE TABLE "xrm_field_mappings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"object_type_id" uuid NOT NULL,
	"field_definition_id" uuid,
	"field_key" text NOT NULL,
	"semantic_field_id" uuid NOT NULL,
	"confidence" integer DEFAULT 100 NOT NULL,
	"transform" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xrm_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"record_id" uuid NOT NULL,
	"kind" text DEFAULT 'document' NOT NULL,
	"title" text NOT NULL,
	"path" text NOT NULL,
	"mime_type" text,
	"size" integer,
	"checksum" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_by_agent_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "xrm_semantic_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"label" text NOT NULL,
	"data_type" text DEFAULT 'text' NOT NULL,
	"description" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "view_definitions" ADD COLUMN "group_by" text;--> statement-breakpoint
ALTER TABLE "view_definitions" ADD COLUMN "placement" text DEFAULT 'sidebar' NOT NULL;--> statement-breakpoint
ALTER TABLE "view_definitions" ADD COLUMN "display_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "view_definitions" ADD COLUMN "audience" text DEFAULT 'default' NOT NULL;--> statement-breakpoint
ALTER TABLE "view_definitions" ADD COLUMN "visible_when" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "xrm_field_definitions" ADD COLUMN "searchable" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "xrm_field_definitions" ADD COLUMN "display_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "xrm_field_definitions" ADD COLUMN "summary_rank" integer;--> statement-breakpoint
ALTER TABLE "xrm_field_definitions" ADD COLUMN "is_primary" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "xrm_field_definitions" ADD COLUMN "options" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "xrm_field_mappings" ADD CONSTRAINT "xrm_field_mappings_object_type_id_xrm_object_types_id_fk" FOREIGN KEY ("object_type_id") REFERENCES "public"."xrm_object_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xrm_field_mappings" ADD CONSTRAINT "xrm_field_mappings_field_definition_id_xrm_field_definitions_id_fk" FOREIGN KEY ("field_definition_id") REFERENCES "public"."xrm_field_definitions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xrm_field_mappings" ADD CONSTRAINT "xrm_field_mappings_semantic_field_id_xrm_semantic_fields_id_fk" FOREIGN KEY ("semantic_field_id") REFERENCES "public"."xrm_semantic_fields"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xrm_files" ADD CONSTRAINT "xrm_files_record_id_xrm_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."xrm_records"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "xrm_files" ADD CONSTRAINT "xrm_files_created_by_agent_id_agents_id_fk" FOREIGN KEY ("created_by_agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "xrm_field_mappings_object_field_semantic_unique" ON "xrm_field_mappings" USING btree ("object_type_id","field_key","semantic_field_id");--> statement-breakpoint
CREATE INDEX "xrm_field_mappings_object_idx" ON "xrm_field_mappings" USING btree ("object_type_id");--> statement-breakpoint
CREATE INDEX "xrm_field_mappings_semantic_idx" ON "xrm_field_mappings" USING btree ("semantic_field_id");--> statement-breakpoint
CREATE UNIQUE INDEX "xrm_files_record_path_unique" ON "xrm_files" USING btree ("record_id","path");--> statement-breakpoint
CREATE INDEX "xrm_files_record_idx" ON "xrm_files" USING btree ("record_id");--> statement-breakpoint
CREATE INDEX "xrm_files_kind_idx" ON "xrm_files" USING btree ("kind");--> statement-breakpoint
CREATE UNIQUE INDEX "xrm_semantic_fields_key_unique" ON "xrm_semantic_fields" USING btree ("key");