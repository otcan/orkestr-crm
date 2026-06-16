CREATE TABLE "view_definitions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"object_type" text NOT NULL,
	"layout" text DEFAULT 'table' NOT NULL,
	"columns" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"filters" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sort" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_by_agent_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "view_definitions" ADD CONSTRAINT "view_definitions_created_by_agent_id_agents_id_fk" FOREIGN KEY ("created_by_agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "view_definitions_key_unique" ON "view_definitions" USING btree ("key");--> statement-breakpoint
CREATE INDEX "view_definitions_object_type_idx" ON "view_definitions" USING btree ("object_type");