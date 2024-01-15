import { defineConfig } from "drizzle-kit";
import { env } from "./src/common/env.mjs";

export default defineConfig({
  schema: "./src/server/database/schema.ts",
  driver: "pg",
  dbCredentials: {
    connectionString: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});
