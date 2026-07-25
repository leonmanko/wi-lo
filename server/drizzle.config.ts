import type { Config } from "drizzle-kit"; 
 
export default { 
  schema: "./src/db/schema/*.ts", 
  out: "./drizzle/migrations", 
  dialect: "postgresql", 
  dbCredentials: { 
    host: process.env.SUPABASE_DB_HOST!, 
    port: parseInt(process.env.SUPABASE_DB_PORT || "6543"), 
    user: process.env.SUPABASE_DB_USER!, 
    password: process.env.SUPABASE_DB_PASSWORD!, 
    database: process.env.SUPABASE_DB_NAME!, 
    ssl: { rejectUnauthorized: false }, 
  }, 
  verbose: true, 
  strict: true, 
} satisfies Config; 
