import { createClient } from "@supabase/supabase-js";
import { createLocalClient } from "@/lib/localDb";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const useLocal = !supabaseUrl || !supabaseAnonKey;

export const supabase: any = useLocal
  ? createLocalClient()
  : createClient(supabaseUrl, supabaseAnonKey);
