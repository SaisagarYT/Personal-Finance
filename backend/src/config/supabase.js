import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

let _client = null;
let _currentUrl = null;
let _currentKey = null;

export const getSupabase = () => {
  const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder';

  if (!_client || _currentUrl !== supabaseUrl || _currentKey !== supabaseKey) {
    _currentUrl = supabaseUrl;
    _currentKey = supabaseKey;
    _client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return _client;
};

export const supabase = new Proxy({}, {
  get(_target, prop) {
    const client = getSupabase();
    const val = client[prop];
    return typeof val === 'function' ? val.bind(client) : val;
  },
});
