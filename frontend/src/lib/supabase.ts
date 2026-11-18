import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cijknmicojgxllburhot.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseAnonKey && supabaseAnonKey !== 'your_supabase_anon_public_key_here'
);

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey || 'placeholder-key'
);
