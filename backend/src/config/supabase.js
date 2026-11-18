import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ SUPABASE_URL or SUPABASE_KEY missing in environment variables. Check .env file.');
}

// Client with service role or anon key
export const supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder', {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Helper to create client with user's Auth Bearer Token for RLS
export const createUserClient = (authHeader) => {
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
  return createClient(supabaseUrl || 'https://placeholder.supabase.co', process.env.SUPABASE_ANON_KEY || 'placeholder', {
    auth: {
      persistSession: false,
    },
    global: {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  });
};
