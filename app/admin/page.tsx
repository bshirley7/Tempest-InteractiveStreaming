'use client';

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { AdminDashboard } from '@/components/admin/admin-dashboard';
import { getUserProfile, checkUserRole } from '@/lib/supabase/client';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { Suspense } from 'react';

// Simple admin user IDs for immediate access (add your Clerk user ID here)
const ADMIN_USER_IDS: string[] = [
  // Add your Clerk user ID here to get immediate admin access
  // You can find your user ID in the Clerk dashboard or browser console when logged in
  'user_2y232PRIhXVR9omfFBhPQdG6DZU',
  'user_2ykxfPwP3yMZH0HbqadSs4FaDXT'
];

function AdminPageContent() {
  // Check if Clerk is properly configured
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = publishableKey && !publishableKey.includes('actual-bullfrog');
  
  // Always call useUser hook - conditional logic happens after
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function checkAccess() {
      if (!mounted || !isLoaded) return;

      // If neither Clerk nor Supabase is configured, allow demo access
      if (!isClerkConfigured && !isSupabaseConfigured) {
        console.log('Demo mode: No authentication configured, allowing admin access');
        setIsAuthorized(true);
        setLoading(false);
        return;
      }

      // If not signed in, redirect to sign-in
      if (!isSignedIn) {
        router.push('/sign-in');
        return;
      }

      if (user?.id) {
        console.log('Checking admin access for user:', user.id);
        
        // Check if user is in the simple admin list first
        if (ADMIN_USER_IDS.includes(user.id)) {
          console.log('User granted admin access via admin user ID list');
          setIsAuthorized(true);
          setLoading(false);
          return;
        }

        // If Supabase is not configured, allow demo access for signed-in users
        if (!isSupabaseConfigured) {
          console.log('Supabase not configured, allowing demo admin access for signed-in user');
          setIsAuthorized(true);
          setLoading(false);
          return;
        }

        // Check Supabase role-based access
        try {
          const hasAccess = await checkUserRole(user.id, ['admin', 'faculty']);
          console.log('Supabase role check result:', hasAccess);
          setIsAuthorized(hasAccess);
          if (!hasAccess) {
            console.log('User does not have admin/faculty role, redirecting to home');
            router.push('/');
          }
        } catch (error) {
          console.error('Error checking user role:', error);
          // In case of any error, deny access for security
          console.log('Error occurred, denying admin access');
          setIsAuthorized(false);
          router.push('/');
        }
      }
      
      setLoading(false);
    }

    checkAccess();
  }, [mounted, isLoaded, isSignedIn, user, router, isClerkConfigured]);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to access the admin panel.</p>
          {user?.id && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Your User ID: <code className="bg-background px-2 py-1 rounded">{user.id}</code></p>
              <p className="text-xs text-muted-foreground mt-2">
                To grant admin access, add your User ID to the ADMIN_USER_IDS array in app/admin/page.tsx
              </p>
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950 rounded border border-blue-200 dark:border-blue-800">
                <p className="text-xs font-medium text-blue-800 dark:text-blue-200">Configuration Status:</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Clerk: {isClerkConfigured ? '✅ Configured' : '❌ Not configured'}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  Supabase: {isSupabaseConfigured ? '✅ Configured' : '❌ Not configured'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <AdminDashboard />
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    }>
      <AdminPageContent />
    </Suspense>
  );
}