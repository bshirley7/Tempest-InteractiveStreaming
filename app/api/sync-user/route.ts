/**
 * Manual User Sync API Route (No Webhooks Required)
 * 
 * Manually syncs Clerk users to Supabase when webhooks are not available.
 * Called from client-side components to ensure user data exists.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { syncClerkUserToSupabase } from '@/lib/clerk-supabase-sync';

export async function POST(request: NextRequest) {
  try {
    // Verify the user is authenticated with Clerk
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the current user from Clerk
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Sync user to Supabase
    const syncResult = await syncClerkUserToSupabase(clerkUser);
    
    if (!syncResult) {
      return NextResponse.json(
        { error: 'Failed to sync user to Supabase' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'User synced successfully',
      userProfile: syncResult
    });

  } catch (error) {
    console.error('Error in sync-user API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  );
}