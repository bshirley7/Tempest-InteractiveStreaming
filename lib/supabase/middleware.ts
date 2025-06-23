/**
 * Supabase middleware client for session refresh
 * Following official @supabase/ssr implementation
 */
import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from './types';
import { isCloudflareStreamConfigured } from '@/lib/cloudflare';

// Get environment variables with proper fallbacks
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Check if Supabase is properly configured
export const isSupabaseConfigured = supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-project-url') && 
  !supabaseAnonKey.includes('your-anon-key');

/**
 * Create a Supabase client for use in Middleware
 * This handles session refresh and cookie management
 */
export function createClient(request: NextRequest) {
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured. Middleware features may not work.');
    return { supabase: null, response: NextResponse.next() };
  }

  // Create an unmodified response
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  return { supabase, response };
}

/**
 * Update session in middleware
 * Call this in your middleware to refresh user sessions
 */
export async function updateSession(request: NextRequest) {
  const { supabase, response } = createClient(request);
  
  if (!supabase) {
    return response;
  }

  // This will refresh session if expired - required for Server Components
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  await supabase.auth.getUser();

  return response;
}

// Log environment variables for debugging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Middleware - Environment Variables Status:');
  console.log('- NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing');
  console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? '✅ Set' : '❌ Missing');
  console.log('- Supabase Configured:', isSupabaseConfigured ? '✅ Yes' : '❌ No');
  
  // Check Cloudflare Stream configuration
  console.log('- Cloudflare Stream Configured:', isCloudflareStreamConfigured() ? '✅ Yes' : '❌ No');
}