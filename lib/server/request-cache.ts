import "server-only";

import { cache } from "react";

import {
  createSupabaseServerClient,
  createSupabaseServiceClient,
} from "@/lib/supabase/server";

export const getCachedSupabaseServerClient = cache(createSupabaseServerClient);

export const getCachedSupabaseServiceClient = cache(() => createSupabaseServiceClient());
