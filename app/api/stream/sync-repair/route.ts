import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

interface RepairResult {
  cloudflareVideoId: string;
  action: 'created_in_supabase' | 'updated_metadata' | 'already_synced' | 'failed';
  error?: string;
  supabaseId?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { videoIds, autoFix = false } = await request.json();
    
    if (!videoIds || !Array.isArray(videoIds)) {
      return NextResponse.json(
        { error: 'Video IDs array is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const results: RepairResult[] = [];

    for (const videoId of videoIds) {
      try {
        // Get video data from Cloudflare Stream
        const cloudflareResponse = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/stream/${videoId}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.CLOUDFLARE_STREAM_API_TOKEN}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (!cloudflareResponse.ok) {
          results.push({
            cloudflareVideoId: videoId,
            action: 'failed',
            error: 'Video not found in Cloudflare Stream',
          });
          continue;
        }

        const { result: cloudflareVideo } = await cloudflareResponse.json();

        // Check if already exists in Supabase
        const { data: existingContent } = await supabase
          .from('content')
          .select('id')
          .eq('cloudflare_video_id', videoId)
          .single();

        if (existingContent) {
          results.push({
            cloudflareVideoId: videoId,
            action: 'already_synced',
            supabaseId: existingContent.id,
          });
          continue;
        }

        if (!autoFix) {
          results.push({
            cloudflareVideoId: videoId,
            action: 'failed',
            error: 'Auto-fix disabled, would create in Supabase',
          });
          continue;
        }

        // Create content record in Supabase with data from Cloudflare
        const contentData = {
          title: cloudflareVideo.meta?.name || `Video ${videoId}`,
          description: cloudflareVideo.meta?.description || '',
          cloudflare_video_id: videoId,
          duration: cloudflareVideo.duration || 0,
          category: cloudflareVideo.meta?.category || 'Uncategorized',
          language: cloudflareVideo.meta?.language || 'English',
          is_published: cloudflareVideo.ready || false,
          sync_status: 'auto_repaired',
          last_synced_at: new Date().toISOString(),
          metadata: {
            repair_date: new Date().toISOString(),
            repaired_from: 'cloudflare_stream',
            cloudflare_meta: cloudflareVideo.meta,
            thumbnail_url: cloudflareVideo.thumbnail,
            preview_url: cloudflareVideo.preview,
            status: cloudflareVideo.status,
          },
        };

        const { data: newContent, error: createError } = await supabase
          .from('content')
          .insert([contentData])
          .select()
          .single();

        if (createError) {
          results.push({
            cloudflareVideoId: videoId,
            action: 'failed',
            error: `Failed to create in Supabase: ${createError.message}`,
          });
        } else {
          results.push({
            cloudflareVideoId: videoId,
            action: 'created_in_supabase',
            supabaseId: newContent.id,
          });
        }
      } catch (error) {
        results.push({
          cloudflareVideoId: videoId,
          action: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        created: results.filter(r => r.action === 'created_in_supabase').length,
        alreadySynced: results.filter(r => r.action === 'already_synced').length,
        failed: results.filter(r => r.action === 'failed').length,
      },
    });
  } catch (error) {
    console.error('Sync repair error:', error);
    return NextResponse.json(
      { error: 'Failed to repair sync' },
      { status: 500 }
    );
  }
}

// Repair orphaned Supabase records (exist in Supabase but not in Cloudflare)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action'); // 'mark_deleted' or 'remove'
    const videoIds = searchParams.get('videoIds')?.split(',') || [];
    
    if (!videoIds.length) {
      return NextResponse.json(
        { error: 'Video IDs are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const results: RepairResult[] = [];

    for (const videoId of videoIds) {
      try {
        if (action === 'remove') {
          // Permanently delete the record
          const { error } = await supabase
            .from('content')
            .delete()
            .eq('cloudflare_video_id', videoId);

          if (error) {
            results.push({
              cloudflareVideoId: videoId,
              action: 'failed',
              error: error.message,
            });
          } else {
            results.push({
              cloudflareVideoId: videoId,
              action: 'updated_metadata',
            });
          }
        } else {
          // Mark as deleted but keep the record
          const { error } = await supabase
            .from('content')
            .update({
              is_published: false,
              sync_status: 'orphaned',
              metadata: {
                orphaned_date: new Date().toISOString(),
                reason: 'missing_from_cloudflare',
              },
            })
            .eq('cloudflare_video_id', videoId);

          if (error) {
            results.push({
              cloudflareVideoId: videoId,
              action: 'failed',
              error: error.message,
            });
          } else {
            results.push({
              cloudflareVideoId: videoId,
              action: 'updated_metadata',
            });
          }
        }
      } catch (error) {
        results.push({
          cloudflareVideoId: videoId,
          action: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        updated: results.filter(r => r.action === 'updated_metadata').length,
        failed: results.filter(r => r.action === 'failed').length,
      },
    });
  } catch (error) {
    console.error('Orphan cleanup error:', error);
    return NextResponse.json(
      { error: 'Failed to clean up orphaned records' },
      { status: 500 }
    );
  }
}