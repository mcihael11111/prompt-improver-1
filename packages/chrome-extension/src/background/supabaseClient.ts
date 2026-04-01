import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { config } from './config';

export const supabase: SupabaseClient = createClient(
  config.SUPABASE_URL,
  config.SUPABASE_ANON_KEY,
);
