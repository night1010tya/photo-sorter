import { createClient } from "@supabase/supabase-js";
import "server-only";

   const supabaseUrl = process.env.SUPABASE_URL;
   const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

   if (!supabaseUrl) {
    throw new Error("SUPABASE_URLが設定されていません");
  }
  
  if (!supabaseSecretKey) {
    throw new Error("SUPABASE_SECRET_KEYが設定されていません");
  }
  
  export const supabaseAdmin = createClient(
    supabaseUrl,
    supabaseSecretKey
  );