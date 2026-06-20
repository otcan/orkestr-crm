import { createCrmServices } from "@oxrm/core";
import { createDatabase } from "@oxrm/db";

export function createCrmTools(databaseUrl: string, options: { backupsRequired?: boolean | undefined } = {}) {
  const { db, queryClient } = createDatabase(databaseUrl);
  const services = createCrmServices({ db, backupsRequired: options.backupsRequired });

  return {
    services,
    async close() {
      await queryClient.end();
    }
  };
}
