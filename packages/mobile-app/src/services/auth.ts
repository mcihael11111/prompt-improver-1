import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://yrjxpchquyzqyypixxgu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyanhwY2hxdXl6cXl5cGl4eGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI2Mzk3MzMsImV4cCI6MjA3ODIxNTczM30.PmSmjP2uVEyABRUkoAnTnuDexXfCZ8FBXt4vI1_KWFQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
