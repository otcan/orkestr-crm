export interface BackupConfig {
  databaseUrl: string;
  githubRepo: string;
  nodeEnv: string;
}

export function loadBackupConfig(): BackupConfig {
  const databaseUrl = process.env.DATABASE_URL;
  const githubRepo = process.env.BACKUP_GITHUB_REPO;
  const nodeEnv = process.env.NODE_ENV ?? "development";

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for backups");
  }

  if (!githubRepo && nodeEnv === "production") {
    throw new Error("BACKUP_GITHUB_REPO is required in production");
  }

  return {
    databaseUrl,
    githubRepo: githubRepo ?? "local/dev-backups",
    nodeEnv
  };
}

