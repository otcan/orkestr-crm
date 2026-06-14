import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import Fastify from "fastify";
import { z } from "zod";
import { loadConfig } from "./config.js";
import { createCrmTools } from "./tools.js";

function toContent(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(value, null, 2)
      }
    ]
  };
}

export async function buildMcpHttpServer() {
  const config = loadConfig();
  const tools = createCrmTools(config.databaseUrl);
  const app = Fastify({ logger: { level: config.logLevel } });

  app.addHook("onClose", async () => {
    await tools.close();
  });

  app.get("/health", async () => ({
    status: "ok",
    service: "orkestr-crm-mcp"
  }));

  app.all("/mcp", async (request, reply) => {
    const server = new McpServer({
      name: "orkestr-crm",
      version: "0.1.0"
    });

    server.tool(
      "crm.search_leads",
      "Search leads by name, company, title, LinkedIn URL, SalesNav URL, or email.",
      {
        query: z.string().optional(),
        limit: z.number().int().min(1).max(100).optional()
      },
      async (input) => toContent(await tools.searchLeads(input))
    );

    server.tool(
      "crm.create_lead",
      "Create a CRM lead. Routine write; audited action support will be added with agent identity.",
      {
        fullName: z.string().min(1),
        company: z.string().optional(),
        title: z.string().optional(),
        linkedinUrl: z.string().url().optional(),
        salesnavUrl: z.string().url().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        location: z.string().optional(),
        source: z.string().optional(),
        notes: z.string().optional()
      },
      async (input) => toContent(await tools.createLead(input))
    );

    server.tool(
      "crm.get_daily_queue",
      "Return assignments due now or overdue for agent operation.",
      {
        limit: z.number().int().min(1).max(100).optional()
      },
      async (input) => toContent(await tools.getDailyQueue(input))
    );

    server.tool(
      "crm.log_activity",
      "Append an activity to a lead or assignment timeline.",
      {
        leadId: z.string().uuid(),
        assignmentId: z.string().uuid().optional(),
        integrationAccountId: z.string().uuid().optional(),
        type: z.string(),
        channel: z.string(),
        direction: z.enum(["outbound", "inbound", "internal"]).default("internal"),
        body: z.string().optional(),
        externalId: z.string().optional(),
        occurredAt: z.string().datetime().optional()
      },
      async (input) => toContent(await tools.logActivity(input))
    );

    server.tool(
      "crm.get_backup_health",
      "Inspect latest backup state. Degraded means no successful backup within 26 hours.",
      {},
      async () => toContent(await tools.getBackupHealth())
    );

    const transport = new StreamableHTTPServerTransport({});

    await server.connect(transport as Parameters<typeof server.connect>[0]);
    await transport.handleRequest(request.raw, reply.raw, request.body);
    return reply;
  });

  return app;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const config = loadConfig();
  const app = await buildMcpHttpServer();
  await app.listen({ host: config.host, port: config.port });
}
