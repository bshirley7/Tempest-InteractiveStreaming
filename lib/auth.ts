import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

/**
 * Server-side authentication helper
 * Use this in Server Components and API routes ONLY
 * Do NOT use in Client Components - use useUser() hook instead
 */
export async function getAuth() {
  return auth();
}

/**
 * Require authentication for a page/component
 * Redirects to sign-in if not authenticated
 * Use this in Server Components ONLY
 */
export async function requireAuth() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }
  
  return { userId };
}

/**
 * Get current user ID or null if not authenticated
 * Use this in Server Components and API routes ONLY
 */
export async function getCurrentUserId() {
  const { userId } = await auth();
  return userId;
}