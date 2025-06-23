/**
 * Supabase client configuration for Next.js App Router with SSR support
 */
import { createBrowserClient } from '@supabase/ssr';
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

// Log configuration status for debugging
if (typeof window !== 'undefined') {
  console.log('Supabase Configuration Status:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlValid: supabaseUrl.startsWith('https://'),
    isConfigured: isSupabaseConfigured
  });
}

/**
 * Create a Supabase client for use in Client Components
 * This handles authentication state and session management
 */
export function createClient() {
  if (!isSupabaseConfigured) {
    console.warn('Supabase is not configured. Some features may not work.');
    return null;
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}

// Create a singleton client instance for client-side use
export const supabase = createClient();

// Helper function to get user profile
export async function getUserProfile(userId: string) {
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

// Helper function to check if user is admin/faculty
export async function checkUserRole(userId: string, requiredRoles: string[] = ['admin', 'faculty']) {
  // Return true if Supabase is not configured (demo mode - allow access)
  if (!supabase) {
    console.warn('Supabase is not configured. Allowing demo access.');
    return true;
  }

  try {
    const profile = await getUserProfile(userId);
    return profile && requiredRoles.includes(profile.role);
  } catch (error) {
    console.error('Error checking user role:', error);
    // In case of authentication errors, allow demo access
    console.warn('Authentication failed. Allowing demo access.');
    return true;
  }
}

// Helper function to create or update user profile
export async function upsertUserProfile(userData: {
  user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
}) {
  if (!supabase) {
    console.warn('Supabase is not configured. Skipping profile upsert.');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userData.user_id,
        email: userData.email,
        full_name: userData.full_name || null,
        avatar_url: userData.avatar_url || null,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to upsert user profile:', error);
    return null;
  }
}