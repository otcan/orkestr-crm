import { loadBackupConfig } from "./config.js";

const config = loadBackupConfig();

console.log(
  JSON.stringify(
    {
      service: "orkestr-crm-backup-verify",
      status: "ok",
      gitRepo: config.githubRepo,
      message: "Restore verification scaffold is ready; it will replay the latest dump into a temporary PostgreSQL database."
    },
    null,
    2
  )
);
