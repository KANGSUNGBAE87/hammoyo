import { createClient } from "npm:@supabase/supabase-js@2";

export class BackendConfigurationError extends Error {
  code = "BACKEND_CONFIGURATION_MISSING";
}

function requiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new BackendConfigurationError(`${name} is required.`);
  return value;
}

export function createSupabaseAdminClient() {
  const url = Deno.env.get("SUPABASE_URL") ?? Deno.env.get("VITE_SUPABASE_URL");
  const secret =
    Deno.env.get("HAMMOYEO_DB_ADMIN_KEY") ??
    Deno.env.get("PAIRTUNE_SUPABASE_SECRET_KEY") ??
    Deno.env.get("HAMMOYEO_SUPABASE_SERVICE_ROLE_KEY") ??
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ??
    Deno.env.get("SUPABASE_SECRET_KEY") ??
    Deno.env.get("SUPABASE_SECRET_KEYS");
  if (!url) throw new BackendConfigurationError("SUPABASE_URL is required.");
  if (!secret) {
    throw new BackendConfigurationError("HAMMOYEO_DB_ADMIN_KEY or shared project admin key is required.");
  }
  return createClient(url, secret, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function getSessionSecret() {
  return requiredEnv("HAMMOYEO_SESSION_SECRET");
}

export function getProviderHashSecret() {
  return requiredEnv("HAMMOYEO_PROVIDER_HASH_SECRET");
}

export function getTossExchangeUrl() {
  return requiredEnv("TOSS_AUTH_EXCHANGE_URL");
}

export async function runQuery<T>(query: PromiseLike<{ data: T; error: { message: string; code?: string } | null }>) {
  const { data, error } = await query;
  if (error) {
    throw new Error(error.message);
  }
  return data;
}
