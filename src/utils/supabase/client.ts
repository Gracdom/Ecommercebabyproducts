import { createClient } from "@jsr/supabase__supabase-js@2.49.8";
import { projectId, publicAnonKey } from "./info";

export const supabaseUrl = `https://${projectId}.supabase.co`;
export const supabaseAnonKey = publicAnonKey;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


