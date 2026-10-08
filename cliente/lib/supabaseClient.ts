// lib/supabaseClient.ts
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
// @ts-ignore: módulo JS compartido con el panel admin
import { createMockClient } from "../../shared/mock/mockSupabase.js";

// Con EXPO_PUBLIC_DEMO_MODE=true se usa un backend simulado en el navegador
// (ver ../shared/mock) y no hace falta Supabase. Es lo que se publica en GitHub Pages.
export const isDemo = process.env.EXPO_PUBLIC_DEMO_MODE === "true";

export const supabase: any = isDemo
  ? createMockClient({ app: "cliente" })
  : createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL!,
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
    );
