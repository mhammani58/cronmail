import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    // NEXTAUTH
    NEXTAUTH_URL: z.string().url(),
    NEXTAUTH_SECRET: z.string().min(1),

    // SMTP
    SMTP_HOST: z.string().min(1),
    SMTP_PORT: z.string().refine((v) => parseInt(v)),
    SMTP_USER: z.string().email(),
    SMTP_PASS: z.string().min(1),

    // QSTASH
    QSTASH_TOKEN: z.string().min(1),

    // DATABASE URL
    DATABASE_URL: z.string().url(),
  },
  client: {},
  runtimeEnv: process.env,
});
