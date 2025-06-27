/**
 * Content Library Sync
 * 
 * Syncs Cloudflare Stream videos with Supabase content library.
 * Ensures all videos are properly imported and organized by channels.
 */

import { listStreamVideos, getStreamVideo } from './stream-api';
import { createClient } from './supabase/server';
import { auth } from '@clerk/nextjs/server';

export interface VideoSyncResult {
  cloudflare_stream_id: string;
  title: string;
  action: 'created' | 'updated' | 'skipped' | 'error';
  error?: string;
}

export interface LibrarySyncSummary {
  total_cloudflare_videos: number;
  total_synced: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  results: VideoSyncResult[];
}

/**
 * Get default channel for orphaned videos
 */
async function getDefaultChannel() {
  const supabase = await createClient();
  
  // Try to get any active channel, preferring specific ones
  const { data: channels, error: channelsError } = await supabase
    .from('channels')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('created_at');

  if (!channels || channels.length === 0) {
    console.log('No active channels found, creating default channel...');
    
    // Create a default channel if none exist
    const { data: newChannel, error } = await supabase
      .from('channels')
      .insert([{
        name: 'General Content',
        slug: 'general-content',
        description: 'Default channel for synced videos',
        is_active: true,
        category: 'general',
        logo_url: null,
        created_at: new Date().toISOString()
      }])
      .select('id, name, slug')
      .single();

    if (error) {
      console.error('Failed to create default channel:', error);
      throw new Error(`Failed to create default channel: ${error.message}`);
    }

    console.log(`Created default channel: ${newChannel.name} (${newChannel.id})`);
    return newChannel;
  }

  // Prefer specific channels if they exist
  const preferredChannel = channels.find(c => 
    ['explore', 'campus-life', 'general-content'].includes(c.slug)
  ) || channels[0];

  console.log(`Using channel: ${preferredChannel.name} (${preferredChannel.id})`);
  return preferredChannel;
}

/**
 * Extract video metadata from Cloudflare Stream video
 */
function extractVideoMetadata(streamVideo: any) {
  const title = streamVideo.meta?.name || `Video ${streamVideo.uid}`;
  const description = streamVideo.meta?.description || null;
  
  // Extract tags from metadata
  const tags = [];
  if (streamVideo.meta?.category) tags.push(streamVideo.meta.category);
  if (streamVideo.meta?.genre) tags.push(streamVideo.meta.genre);
  if (streamVideo.meta?.keywords) {
    tags.push(...streamVideo.meta.keywords.split(',').map((k: string) => k.trim()));
  }

  // Build metadata object
  const metadata: any = {};
  if (streamVideo.meta?.instructor) metadata.instructor = streamVideo.meta.instructor;
  if (streamVideo.meta?.difficulty_level) metadata.difficulty_level = streamVideo.meta.difficulty_level;
  if (streamVideo.meta?.target_audience) metadata.target_audience = streamVideo.meta.target_audience;
  if (streamVideo.meta?.learning_objectives) metadata.learning_objectives = streamVideo.meta.learning_objectives;
  if (streamVideo.meta?.prerequisites) metadata.prerequisites = streamVideo.meta.prerequisites;
  if (streamVideo.meta?.language) metadata.language = streamVideo.meta.language;

  return {
    title,
    description,
    tags: tags.length > 0 ? tags : null,
    metadata: Object.keys(metadata).length > 0 ? metadata : null,
    duration: streamVideo.duration ? Math.round(streamVideo.duration) : null,
    thumbnail_url: streamVideo.thumbnail || null,
    preview_url: streamVideo.preview || null
    // Removed published_at since it doesn't exist in the content table
  };
}

/**
 * Sync a single Cloudflare video to Supabase
 */
export async function syncSingleVideo(
  streamVideo: any
): Promise<VideoSyncResult> {
  const supabase = await createClient();
  
  if (!supabase) {
    console.error('Failed to create Supabase client');
    return {
      cloudflare_stream_id: streamVideo.uid,
      title: streamVideo.meta?.name || `Video ${streamVideo.uid}`,
      action: 'error',
      error: 'Failed to create Supabase client'
    };
  }
  
  try {
    // Check if video already exists
    const { data: existingVideo } = await supabase
      .from('content')
      .select('id, title, updated_at')
      .eq('cloudflare_video_id', streamVideo.uid)
      .single();

    const videoData = extractVideoMetadata(streamVideo);
    
    if (existingVideo) {
      // Update existing video
      const { error: updateError } = await supabase
        .from('content')
        .update({
          ...videoData,
          updated_at: new Date().toISOString()
        })
        .eq('cloudflare_video_id', streamVideo.uid);

      if (updateError) {
        throw updateError;
      }

      return {
        cloudflare_stream_id: streamVideo.uid,
        title: videoData.title,
        action: 'updated'
      };
    } else {
      // Create new video without forcing channel assignment
      const insertData = {
        title: videoData.title,
        cloudflare_video_id: streamVideo.uid,
        // Don't force channel assignment - let this be done later
        channel_id: null,
        created_at: new Date().toISOString(),
        // Only include fields that actually exist in the database
        ...(videoData.description && { description: videoData.description }),
        ...(videoData.duration && { duration: videoData.duration }),
        ...(videoData.thumbnail_url && { thumbnail_url: videoData.thumbnail_url })
        // Removed published_at since it doesn't exist in the content table
      };

      const { error: insertError } = await supabase
        .from('content')
        .insert(insertData);

      if (insertError) {
        throw insertError;
      }

      return {
        cloudflare_stream_id: streamVideo.uid,
        title: videoData.title,
        action: 'created'
      };
    }
  } catch (error) {
    console.error(`Error syncing video ${streamVideo.uid}:`, error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      code: (error as any)?.code,
      details: (error as any)?.details,
      hint: (error as any)?.hint
    });
    
    return {
      cloudflare_stream_id: streamVideo.uid,
      title: streamVideo.meta?.name || `Video ${streamVideo.uid}`,
      action: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      errorDetails: {
        code: (error as any)?.code,
        details: (error as any)?.details,
        hint: (error as any)?.hint
      }
    };
  }
}

/**
 * Sync all Cloudflare Stream videos to Supabase content library
 */
export async function syncContentLibrary(): Promise<LibrarySyncSummary> {
  console.log('Starting content library sync...');
  
  try {
    // Get all videos from Cloudflare Stream
    const streamVideos = await listStreamVideos({ limit: 1000 });
    console.log(`Found ${streamVideos.length} videos in Cloudflare Stream`);

    if (streamVideos.length === 0) {
      return {
        total_cloudflare_videos: 0,
        total_synced: 0,
        created: 0,
        updated: 0,
        skipped: 0,
        errors: 0,
        results: []
      };
    }

    // Filter out videos that are not ready (skip pending uploads)
    const readyVideos = streamVideos.filter(video => {
      // Only sync videos that are actually ready to stream
      const isReady = video.status?.state === 'ready' && video.readyToStream;
      const isPending = video.status?.state === 'pendingupload';
      
      if (isPending) {
        console.log(`Skipping pending upload video: ${video.uid} (${video.meta?.name || 'Unnamed'})`);
      }
      
      return isReady;
    });
    
    console.log(`Found ${readyVideos.length} ready videos out of ${streamVideos.length} total`);
    
    if (readyVideos.length === 0) {
      console.log('No ready videos to sync');
      return {
        total_cloudflare_videos: streamVideos.length,
        total_synced: 0,
        created: 0,
        updated: 0,
        skipped: streamVideos.length,
        errors: 0,
        results: streamVideos.map(v => ({
          cloudflare_stream_id: v.uid,
          title: v.meta?.name || `Video ${v.uid}`,
          action: 'skipped' as const,
          error: v.status?.state === 'pendingupload' ? 'Video stuck in pending upload' : 'Video not ready'
        }))
      };
    }

    // Sync each ready video without forcing channel assignment
    const results: VideoSyncResult[] = [];
    
    // Add skipped results for non-ready videos
    const skippedResults = streamVideos
      .filter(v => !readyVideos.includes(v))
      .map(video => ({
        cloudflare_stream_id: video.uid,
        title: video.meta?.name || `Video ${video.uid}`,
        action: 'skipped' as const,
        error: video.status?.state === 'pendingupload' ? 
          'Video stuck in pending upload - needs cleanup' : 
          `Video not ready (${video.status?.state})`
      }));
    
    results.push(...skippedResults);
    
    // Process ready videos without channel assignment
    for (const streamVideo of readyVideos) {
      const result = await syncSingleVideo(streamVideo);
      results.push(result);
      console.log(`Synced ${streamVideo.uid}: ${result.action}`);
    }

    // Calculate summary
    const summary: LibrarySyncSummary = {
      total_cloudflare_videos: streamVideos.length,
      total_synced: results.filter(r => r.action !== 'error' && r.action !== 'skipped').length,
      created: results.filter(r => r.action === 'created').length,
      updated: results.filter(r => r.action === 'updated').length,
      skipped: results.filter(r => r.action === 'skipped').length,
      errors: results.filter(r => r.action === 'error').length,
      results
    };

    console.log('Content library sync complete:', summary);
    
    // Log important issues
    if (summary.skipped > 0) {
      console.warn(`⚠️  ${summary.skipped} videos were skipped. Check for stuck uploads or processing issues.`);
    }
    
    return summary;

  } catch (error) {
    console.error('Content library sync failed:', error);
    throw error;
  }
}

/**
 * Get sync status - compare Cloudflare vs Supabase counts
 */
export async function getSyncStatus() {
  try {
    const [streamVideos, supabaseResult] = await Promise.all([
      listStreamVideos({ limit: 1000 }),
      (async () => {
        const supabase = await createClient();
        return supabase
          .from('content')
          .select('cloudflare_video_id')
          .not('cloudflare_video_id', 'is', null);
      })()
    ]);

    const cloudflareCount = streamVideos.length;
    const supabaseCount = supabaseResult.data?.length || 0;
    const missingCount = cloudflareCount - supabaseCount;

    return {
      cloudflare_videos: cloudflareCount,
      supabase_videos: supabaseCount,
      missing_videos: Math.max(0, missingCount),
      is_synced: missingCount <= 0,
      last_checked: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error checking sync status:', error);
    throw error;
  }
}

/**
 * Get orphaned videos - videos in Supabase that don't exist in Cloudflare
 */
export async function getOrphanedVideos() {
  try {
    const supabase = await createClient();
    const streamVideos = await listStreamVideos({ limit: 1000 });
    const streamVideoIds = new Set(streamVideos.map(v => v.uid));

    const { data: supabaseVideos } = await supabase
      .from('content')
      .select('id, title, cloudflare_video_id')
      .not('cloudflare_video_id', 'is', null);

    const orphanedVideos = supabaseVideos?.filter(
      video => video.cloudflare_video_id && !streamVideoIds.has(video.cloudflare_video_id)
    ) || [];

    return orphanedVideos;
  } catch (error) {
    console.error('Error finding orphaned videos:', error);
    throw error;
  }
}