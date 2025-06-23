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
  const supabase = createClient();
  
  // Try to get "Explore" channel first, fallback to any active channel
  const { data: channel } = await supabase
    .from('channels')
    .select('id, name')
    .or('slug.eq.explore,slug.eq.campus-life,is_active.eq.true')
    .order('slug')
    .limit(1)
    .single();

  if (!channel) {
    throw new Error('No active channels found. Please create at least one channel first.');
  }

  return channel;
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
    duration: streamVideo.duration || null,
    thumbnail_url: streamVideo.thumbnail || null,
    preview_url: streamVideo.preview || null,
    published_at: streamVideo.readyToStream ? streamVideo.created : null
  };
}

/**
 * Sync a single Cloudflare video to Supabase
 */
export async function syncSingleVideo(
  streamVideo: any, 
  defaultChannelId: string
): Promise<VideoSyncResult> {
  const supabase = createClient();
  
  try {
    // Check if video already exists
    const { data: existingVideo } = await supabase
      .from('videos')
      .select('id, title, updated_at')
      .eq('cloudflare_stream_id', streamVideo.uid)
      .single();

    const videoData = extractVideoMetadata(streamVideo);
    
    if (existingVideo) {
      // Update existing video
      const { error: updateError } = await supabase
        .from('videos')
        .update({
          ...videoData,
          updated_at: new Date().toISOString()
        })
        .eq('cloudflare_stream_id', streamVideo.uid);

      if (updateError) {
        throw updateError;
      }

      return {
        cloudflare_stream_id: streamVideo.uid,
        title: videoData.title,
        action: 'updated'
      };
    } else {
      // Create new video
      const { error: insertError } = await supabase
        .from('videos')
        .insert({
          ...videoData,
          cloudflare_stream_id: streamVideo.uid,
          channel_id: defaultChannelId,
          created_at: new Date().toISOString()
        });

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
    return {
      cloudflare_stream_id: streamVideo.uid,
      title: streamVideo.meta?.name || `Video ${streamVideo.uid}`,
      action: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
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

    // Get default channel for videos
    const defaultChannel = await getDefaultChannel();
    console.log(`Using default channel: ${defaultChannel.name} (${defaultChannel.id})`);

    // Sync each video
    const results: VideoSyncResult[] = [];
    for (const streamVideo of streamVideos) {
      const result = await syncSingleVideo(streamVideo, defaultChannel.id);
      results.push(result);
      console.log(`Synced ${streamVideo.uid}: ${result.action}`);
    }

    // Calculate summary
    const summary: LibrarySyncSummary = {
      total_cloudflare_videos: streamVideos.length,
      total_synced: results.filter(r => r.action !== 'error').length,
      created: results.filter(r => r.action === 'created').length,
      updated: results.filter(r => r.action === 'updated').length,
      skipped: results.filter(r => r.action === 'skipped').length,
      errors: results.filter(r => r.action === 'error').length,
      results
    };

    console.log('Content library sync complete:', summary);
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
      createClient()
        .from('videos')
        .select('cloudflare_stream_id')
        .not('cloudflare_stream_id', 'is', null)
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
    const supabase = createClient();
    const streamVideos = await listStreamVideos({ limit: 1000 });
    const streamVideoIds = new Set(streamVideos.map(v => v.uid));

    const { data: supabaseVideos } = await supabase
      .from('videos')
      .select('id, title, cloudflare_stream_id')
      .not('cloudflare_stream_id', 'is', null);

    const orphanedVideos = supabaseVideos?.filter(
      video => video.cloudflare_stream_id && !streamVideoIds.has(video.cloudflare_stream_id)
    ) || [];

    return orphanedVideos;
  } catch (error) {
    console.error('Error finding orphaned videos:', error);
    throw error;
  }
}