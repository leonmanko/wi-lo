import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as allSchemas from "./schema/relations";

const connectionString = `postgresql://${process.env.SUPABASE_DB_USER}:${process.env.SUPABASE_DB_PASSWORD}@${process.env.SUPABASE_DB_HOST}:${process.env.SUPABASE_DB_PORT}/${process.env.SUPABASE_DB_NAME}?sslmode=require`;

const client = postgres(connectionString, {
  max: 20,
  idle_timeout: 30,
  connect_timeout: 10,
  prepare: false,
});

export const db = drizzle(client, { schema: allSchemas });