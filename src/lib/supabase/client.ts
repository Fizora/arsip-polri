import environtment from "@/config/environment";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  environtment.SUPABASE_URL || "",
  environtment.SUPABASE_URL || ""
);

export default supabase;
