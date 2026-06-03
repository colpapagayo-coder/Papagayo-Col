import { createClient } from '@supabase/supabase-js';

const env = (import.meta as any).env;
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://zypclgdcgrvwplljwfts.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_JVpOeVJS1N7ysAw6lVw3iw__3_aA6QE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
