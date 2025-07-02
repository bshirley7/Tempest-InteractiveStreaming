'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { checkUserRole, isSupabaseConfigured } from '@/lib/supabase/client';

// Simple admin user IDs for immediate access
const ADMIN_USER_IDS: string[] = [
  'user_2y232PRIhXVR9omfFBhPQdG6DZU',
  'user_2ykxfPwP3yMZH0HbqadSs4FaDXT'
];

interface UseAdminCheckResult {
  isAdmin: boolean;
  loading: boolean;
  isClerkConfigured: boolean;
}

export function useAdminCheck(): UseAdminCheckResult {
  const { isLoaded, isSignedIn, user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = publishableKey && !publishableKey.includes('actual-bullfrog');

  useEffect(() => {
    async function checkAdminStatus() {
      if (!isLoaded) return;

      // If neither Clerk nor Supabase is configured, allow demo access
      if (!isClerkConfigured && !isSupabaseConfigured) {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      // Must be signed in to be admin
      if (!isSignedIn || !user?.id) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Check if user is in the simple admin list first
      if (ADMIN_USER_IDS.includes(user.id)) {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      // If Supabase is not configured, allow demo access for signed-in users
      if (!isSupabaseConfigured) {
        setIsAdmin(true);
        setLoading(false);
        return;
      }

      // Check Supabase role-based access
      try {
        const hasAccess = await checkUserRole(user.id, ['admin', 'faculty']);
        setIsAdmin(hasAccess);
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [isLoaded, isSignedIn, user?.id, isClerkConfigured]);

  return {
    isAdmin,
    loading,
    isClerkConfigured: !!isClerkConfigured
  };
}