const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);

let supabase = null;
if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    console.log(`✅ Supabase Database Client initialized: ${supabaseUrl}`);
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err.message);
  }
} else {
  console.log('ℹ️ Supabase credentials not set in server/.env (using resilient database storage)');
}

module.exports = {
  supabase,
  isSupabaseConfigured,
};
