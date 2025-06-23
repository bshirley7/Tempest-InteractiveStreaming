/**
 * Client-side User Synchronization (No Webhooks Required)
 * 
 * This provides manual user sync for when Clerk webhooks are not available.
 * Call these functions in your components to ensure user data is synced.
 */

import { User } from '@clerk/nextjs/server';
import { useState, useEffect } from 'react';
import { syncClerkUserToSupabase, getSupabaseUserProfile } from './clerk-supabase-sync';

/**
 * Ensure user is synced to Supabase (client-side)
 * Call this in components when you need to ensure user data exists
 */
export async function ensureUserSyncedAPI(clerkUser: User) {
  try {
    const response = await fetch('/api/sync-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clerkUserId: clerkUser.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        fullName: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
        avatarUrl: clerkUser.imageUrl || null,
        username: clerkUser.username || null,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to sync user');
    }

    return await response.json();
  } catch (error) {
    console.error('Error syncing user:', error);
    return null;
  }
}

/**
 * Hook to automatically sync user on component mount
 */
export function useUserSync(clerkUser: User | null | undefined) {
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    if (clerkUser && !synced) {
      ensureUserSyncedAPI(clerkUser).then(() => {
        setSynced(true);
      });
    }
  }, [clerkUser, synced]);

  return synced;
}