import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Sign in with Supabase OTP or Email
 */
export const supabaseSignIn = async (email, password) => {
  if (!supabase) {
    throw new Error('Supabase is not configured yet. Please configure VITE_SUPABASE_URL in .env');
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

/**
 * Sign up with Supabase
 */
export const supabaseSignUp = async (email, password, metadata = {}) => {
  if (!supabase) {
    throw new Error('Supabase is not configured yet. Please configure VITE_SUPABASE_URL in .env');
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });
  if (error) throw error;
  return data;
};

/**
 * Sign in with OAuth (Google) via Supabase
 */
export const supabaseSignInWithGoogle = async () => {
  if (!supabase) {
    throw new Error('Supabase is not configured yet. Please configure VITE_SUPABASE_URL in .env');
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  if (error) throw error;
  return data;
};
