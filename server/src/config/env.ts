import { z } from "zod"; 
 
const envSchema = z.object({ 
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(), 
  SUPABASE_ANON_KEY: z.string().min(1), 
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1), 
  SUPABASE_DB_HOST: z.string().min(1), 
  SUPABASE_DB_PORT: z.string().transform(Number), 
  SUPABASE_DB_USER: z.string().min(1), 
  SUPABASE_DB_PASSWORD: z.string().min(1), 
  SUPABASE_DB_NAME: z.string().min(1), 
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"), 
}); 
 
export function validateEnv() { 
  const result = envSchema.safeParse(process.env); 
  if (!result.success) { 
    console.error("? Variables d'environnement invalides :", result.error.format()); 
    process.exit(1); 
  } 
  return result.data; 
} 
