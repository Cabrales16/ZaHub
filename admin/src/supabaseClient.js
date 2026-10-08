import { createClient } from '@supabase/supabase-js';
import { createMockClient } from '../../shared/mock/mockSupabase.js';

// Con VITE_DEMO_MODE=true se usa un backend simulado en el navegador (ver ../shared/mock)
// y no hace falta Supabase. Es lo que se publica en GitHub Pages.
export const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';

// En modo normal las credenciales vienen de .env (antes estaban escritas en el código).
export const supabase = isDemo
  ? createMockClient({ app: 'admin' })
  : createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY
    );
