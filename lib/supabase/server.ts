/**
 * Supabase server-side client for Next.js App Router
 * Following official @supabase/ssr implementation
 */
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from './types';

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
 * Create a Supabase client for use in Server Components
 * This handles session management via cookies
 */
export async function createClient() {
  // In development, try to create client even if configuration check fails
  if (!isSupabaseConfigured) {
    console.warn('Supabase configuration check failed, but attempting to create client anyway...');
    // Don't return null in development - try to create the client
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing required Supabase environment variables');
      return null;
    }
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch (error) {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Get authenticated user from server context
 * Use this in Server Components to check auth status
 */
export async function getUser() {
  const supabase = await createClient();
  
  if (!supabase) {
    return { user: null, error: null };
  }

  try {
    const { data, error } = await supabase.auth.getUser();
    return { user: data.user, error };
  } catch (error) {
    console.error('Error getting user:', error);
    return { user: null, error };
  }
}

/**
 * Server-side helper to get user profile
 */
export async function getUserProfile(userId: string) {
  const supabase = await createClient();
  
  if (!supabase) {
    console.warn('Supabase is not configured. Skipping user profile fetch.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }
}

/**
 * Server-side helper to check user role
 */
export async function checkUserRole(userId: string, requiredRoles: string[] = ['admin', 'faculty']) {
  const supabase = await createClient();
  
  if (!supabase) {
    console.warn('Supabase is not configured. Allowing demo access.');
    return true;
  }

  try {
    const profile = await getUserProfile(userId);
    return profile && requiredRoles.includes(profile.role);
  } catch (error) {
    console.error('Error checking user role:', error);
    return false; // Deny access on server-side errors for security
  }
} 