import { createServerClient } from "@supabase/ssr";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

function getSupabaseEnvironment() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log("========== SUPABASE ENV ==========");
  console.log("URL:", url);
  console.log("ANON:", anonKey?.substring(0, 20));
  console.log("SERVICE:", serviceKey?.substring(0, 20));
  console.log("==================================");

  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables.");
  }

  return { url, anonKey, serviceKey };
}

export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const { url, anonKey } = getSupabaseEnvironment();

  const cookieStore = await cookies();

  console.log("==================================");
  console.log("Using SERVER CLIENT (ANON KEY)");
  console.log("==================================");

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Server Components cannot set cookies during render.
        }
      },
    },
  });
}

export function createSupabaseServiceClient(): SupabaseClient {
  const { url, serviceKey } = getSupabaseEnvironment();

  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is missing.");
  }

  console.log("==================================");
  console.log("Using SERVICE ROLE CLIENT");
  console.log("==================================");

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}