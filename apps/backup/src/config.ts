export interface BackupConfig {
  databaseUrl: string;
  githubRepo: string;
  githubToken: string | undefined;
  workspace: string;
  gitAuthorName: string;
  gitAuthorEmail: string;
  nodeEnv: string;
}

export function loadBackupConfig(): BackupConfig {
  const databaseUrl = process.env.DATABASE_URL;
  const githubRepo = process.env.BACKUP_GITHUB_REPO?.trim();
  const githubToken = process.env.BACKUP_GITHUB_TOKEN;
  const nodeEnv = process.env.NODE_ENV ?? "development";

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for backups");
  }

  return {
    databaseUrl,
    githubRepo: githubRepo || "local/dev-backups",
    githubToken,
    workspace: process.env.BACKUP_WORKSPACE ?? ".backups",
    gitAuthorName: process.env.BACKUP_GIT_AUTHOR_NAME ?? "oXRM Backup",
    gitAuthorEmail: process.env.BACKUP_GIT_AUTHOR_EMAIL ?? "backups@oxrm.local",
    nodeEnv
  };
}
