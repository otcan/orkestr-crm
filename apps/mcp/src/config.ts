export interface McpConfig {
  host: string;
  port: number;
  databaseUrl: string;
  logLevel: string;
  nodeEnv: string;
  backupsRequired: boolean;
}

export function loadConfig(): McpConfig {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const nodeEnv = process.env.NODE_ENV ?? "development";
  const backupsRequired =
    process.env.OXRM_BACKUP_REQUIRED === undefined ? nodeEnv === "production" : process.env.OXRM_BACKUP_REQUIRED === "true";

  return {
    host: process.env.MCP_HOST ?? "0.0.0.0",
    port: Number(process.env.MCP_PORT ?? 18182),
    databaseUrl,
    logLevel: process.env.LOG_LEVEL ?? "info",
    nodeEnv,
    backupsRequired
  };
}
