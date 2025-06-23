/**
 * Clerk + Supabase Integration
 * 
 * This utility syncs Clerk user authentication with Supabase for data storage.
 * - Clerk handles ALL authentication (login, signup, session management)
 * - Supabase is used ONLY for data storage (user profiles, content, etc.)
 * - User records are synchronized between Clerk and Supabase
 */

import { User } from '@clerk/nextjs/server';
import { createClient } from '@/lib/supabase/server';

export interface SupabaseUserProfile {
  clerk_user_id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  username?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Sync a Clerk user to Supabase user profile
 * This should be called whenever a user signs up or their profile changes
 */
export async function syncClerkUserToSupabase(clerkUser: User): Promise<SupabaseUserProfile | null> {
  try {
    const supabase = createClient();
    
    const userProfile: SupabaseUserProfile = {
      clerk_user_id: clerkUser.id,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      full_name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
      avatar_url: clerkUser.imageUrl || null,
      username: clerkUser.username || null,
      updated_at: new Date().toISOString()
    };

    // Upsert user profile (insert or update)
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(userProfile, {
        onConflict: 'clerk_user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error syncing Clerk user to Supabase:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to sync Clerk user to Supabase:', error);
    return null;
  }
}

/**
 * Get Supabase user profile by Clerk user ID
 */
export async function getSupabaseUserProfile(clerkUserId: string): Promise<SupabaseUserProfile | null> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (error) {
      console.error('Error fetching user profile from Supabase:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch user profile from Supabase:', error);
    return null;
  }
}

/**
 * Create a Supabase client with Clerk user context
 * This is for server-side operations where we need to associate data with a Clerk user
 */
export function createSupabaseClientForClerkUser(clerkUserId: string) {
  const supabase = createClient();
  
  // Helper function to add clerk_user_id to queries
  const withClerkUser = (table: string) => {
    return supabase.from(table).select('*, clerk_user_id').eq('clerk_user_id', clerkUserId);
  };

  return {
    supabase,
    withClerkUser,
    clerkUserId
  };
}

/**
 * Validate that a resource belongs to the authenticated Clerk user
 */
export async function validateUserOwnership(
  tableName: string, 
  resourceId: string, 
  clerkUserId: string
): Promise<boolean> {
  try {
    const supabase = createClient();
    
    const { data, error } = await supabase
      .from(tableName)
      .select('clerk_user_id')
      .eq('id', resourceId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.clerk_user_id === clerkUserId;
  } catch (error) {
    console.error('Error validating user ownership:', error);
    return false;
  }
}