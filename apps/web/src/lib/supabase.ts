// apps/web/src/lib/supabase.ts

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variables d\'environnement Supabase manquantes. ' +
    'Vérifiez que VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY sont définies dans .env.local'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: {
      getItem: (key: string): string | null => {
        if (typeof window !== 'undefined') {
          try { return sessionStorage.getItem(key); } catch { return null; }
        }
        return null;
      },
      setItem: (key: string, value: string): void => {
        if (typeof window !== 'undefined') {
          try { sessionStorage.setItem(key, value); } catch {}
        }
      },
      removeItem: (key: string): void => {
        if (typeof window !== 'undefined') {
          try { sessionStorage.removeItem(key); } catch {}
        }
      },
    },
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});