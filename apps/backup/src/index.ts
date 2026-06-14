import { loadBackupConfig } from "./config.js";

const config = loadBackupConfig();
const createdAt = new Date().toISOString();

const manifest = {
  createdAt,
  database: new URL(config.databaseUrl).pathname.replace("/", ""),
  format: "pg_dump_custom",
  schemaVersion: "0001",
  gitRepo: config.githubRepo,
  mode: config.nodeEnv === "production" ? "enforced" : "dry-run"
};

console.log(JSON.stringify({ service: "orkestr-crm-backup", manifest }, null, 2));

if (config.nodeEnv === "production") {
  console.log("Production backup execution will run pg_dump, commit artifacts, and push to BACKUP_GITHUB_REPO.");
} else {
  console.log("Development backup dry run completed. Production mode enforces GitHub backup configuration.");
}

