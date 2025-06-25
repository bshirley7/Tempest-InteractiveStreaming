/**
 * Content Library Sync API
 * 
 * Endpoint to sync Cloudflare Stream videos with Supabase content library.
 * Only admins can trigger sync operations.
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { syncContentLibrary, getSyncStatus, getOrphanedVideos } from '@/lib/content-library-sync';
import { createClient } from '@/lib/supabase/server';

// Simple admin user IDs for immediate access (matches admin page)
const ADMIN_USER_IDS: string[] = [
  'user_2y232PRIhXVR9omfFBhPQdG6DZU',
  'user_2ykxfPwP3yMZH0HbqadSs4FaDXT'
];

/**
 * Check if user is admin
 */
async function isUserAdmin(clerkUserId: string): Promise<boolean> {
  try {
    // Check simple admin list first
    if (ADMIN_USER_IDS.includes(clerkUserId)) {
      return true;
    }

    // Check Supabase user role as fallback
    const supabase = createClient();
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', clerkUserId)
      .single();
    
    return user?.role === 'admin';
  } catch (error) {
    console.error('Error checking user role:', error);
    return false;
  }
}

/**
 * POST - Trigger content library sync
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin permissions
    const isAdmin = await isUserAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body for sync options
    const body = await request.json().catch(() => ({}));
    const { force = false } = body;

    console.log(`Starting content library sync (force: ${force})`);

    // Run the sync
    const syncResult = await syncContentLibrary();

    return NextResponse.json({
      success: true,
      message: 'Content library sync completed',
      ...syncResult
    });

  } catch (error) {
    console.error('Content library sync API error:', error);
    return NextResponse.json(
      { 
        error: 'Sync failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * GET - Get sync status and statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check admin permissions
    const isAdmin = await isUserAdmin(userId);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const includeOrphaned = searchParams.get('include_orphaned') === 'true';

    // Get sync status
    const syncStatus = await getSyncStatus();
    
    // Optionally include orphaned videos
    let orphanedVideos = null;
    if (includeOrphaned) {
      orphanedVideos = await getOrphanedVideos();
    }

    return NextResponse.json({
      success: true,
      sync_status: syncStatus,
      orphaned_videos: orphanedVideos
    });

  } catch (error) {
    console.error('Content library status API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get sync status', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}