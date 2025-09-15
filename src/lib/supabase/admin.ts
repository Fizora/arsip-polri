import { createClient } from "@supabase/supabase-js";
import environment from "@/config/environment";

const supabase = createClient(
  environment.SUPABASE_URL || "",
  environment.SUPABASE_ADMIN || "",
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

export const supabaseAdmin = supabase.auth.admin;