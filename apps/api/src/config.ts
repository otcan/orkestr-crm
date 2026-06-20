export interface ApiConfig {
  host: string;
  port: number;
  databaseUrl: string;
  nodeEnv: string;
  logLevel: string;
  backupsRequired: boolean;
}

export function loadConfig(): ApiConfig {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  const nodeEnv = process.env.NODE_ENV ?? "development";
  const backupsRequired =
    process.env.OXRM_BACKUP_REQUIRED === undefined ? nodeEnv === "production" : process.env.OXRM_BACKUP_REQUIRED === "true";

  return {
    host: process.env.API_HOST ?? "0.0.0.0",
    port: Number(process.env.API_PORT ?? 18181),
    databaseUrl,
    nodeEnv,
    logLevel: process.env.LOG_LEVEL ?? "info",
    backupsRequired
  };
}
