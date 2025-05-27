import type { Config } from 'drizzle-kit';

export default {
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    authToken: process.env.DATABASE_AUTH_TOKEN!,
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
