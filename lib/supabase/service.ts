/**
 * Supabase service role client for server-side operations that bypass RLS
 * Use this only in secure server-side contexts (API routes, server actions)
 */
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Check if service role is configured
export const isServiceRoleConfigured = supabaseUrl && 
  supabaseServiceKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseServiceKey.includes('your-service-role-key');

/**
 * Create a Supabase client with service role privileges
 * WARNING: This bypasses Row Level Security - use only in secure server contexts
 */
export function createServiceClient() {
  if (!isServiceRoleConfigured) {
    console.error('Supabase service role not configured properly');
    return null;
  }

  return createClient<Database>(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}