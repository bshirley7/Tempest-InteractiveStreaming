import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import crypto from 'crypto';

// Cloudflare Stream webhook events
interface StreamWebhookEvent {
  uid: string;
  status: {
    state: 'ready' | 'inprogress' | 'error' | 'queued';
    pctComplete?: string;
    errorReasonCode?: string;
    errorReasonText?: string;
  };
  meta: {
    name?: string;
    description?: string;
    [key: string]: any;
  };
  created: string;
  modified: string;
  size: number;
  preview: string;
  thumbnail: string;
  duration: number;
  input: {
    width: number;
    height: number;
  };
  playback: {
    hls: string;
    dash: string;
  };
  allowedOrigins: string[];
  requireSignedURLs: boolean;
  uploaded: string;
  uploadExpiry: string;
  readyToStream: boolean;
  watermark?: any;
}

// Verify webhook signature (if configured)
function verifyWebhookSignature(request: NextRequest, body: string): boolean {
  const webhookSecret = process.env.CLOUDFLARE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.warn('CLOUDFLARE_WEBHOOK_SECRET not configured, skipping signature verification');
    return true; // Allow if no secret configured
  }

  const signature = request.headers.get('cf-webhook-signature');
  if (!signature) {
    console.error('Missing webhook signature');
    return false;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Cloudflare Stream webhook received');
    
    // Get raw body for signature verification
    const body = await request.text();
    
    // Verify webhook signature
    if (!verifyWebhookSignature(request, body)) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      );
    }

    // Parse the webhook data
    const webhookData: StreamWebhookEvent = JSON.parse(body);
    console.log('Webhook data:', JSON.stringify(webhookData, null, 2));

    const supabase = await createClient();
    if (!supabase) {
      console.error('Supabase not configured');
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // Handle different webhook events based on video status
    switch (webhookData.status.state) {
      case 'ready':
        await handleVideoReady(supabase, webhookData);
        break;
      case 'error':
        await handleVideoError(supabase, webhookData);
        break;
      case 'inprogress':
        await handleVideoProcessing(supabase, webhookData);
        break;
      default:
        console.log(`Unhandled webhook state: ${webhookData.status.state}`);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully',
      videoId: webhookData.uid,
      status: webhookData.status.state
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

async function handleVideoReady(supabase: any, webhookData: StreamWebhookEvent) {
  console.log(`Video ${webhookData.uid} is ready for streaming`);
  
  try {
    // Check if video exists in Supabase
    const { data: existingContent, error: fetchError } = await supabase
      .from('content')
      .select('id, title, sync_status')
      .eq('cloudflare_video_id', webhookData.uid)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching content:', fetchError);
      return;
    }

    if (existingContent) {
      // Update existing content with latest metadata from Cloudflare
      const { error: updateError } = await supabase
        .from('content')
        .update({
          duration: webhookData.duration || 0,
          is_published: true, // Video is ready, so it can be published
          thumbnail_url: webhookData.thumbnail,
          sync_status: 'auto_synced',
          last_synced_at: new Date().toISOString(),
          metadata: {
            ...existingContent.metadata,
            cloudflare_status: 'ready',
            preview_url: webhookData.preview,
            playback_hls: webhookData.playback?.hls,
            playback_dash: webhookData.playback?.dash,
            resolution: {
              width: webhookData.input?.width,
              height: webhookData.input?.height,
            },
            webhook_updated: new Date().toISOString(),
          },
        })
        .eq('cloudflare_video_id', webhookData.uid);

      if (updateError) {
        console.error('Error updating content:', updateError);
      } else {
        console.log(`Updated content for video ${webhookData.uid}`);
      }
    } else {
      // Create new content record from webhook data
      console.log(`Creating new content record for video ${webhookData.uid}`);
      
      const { error: insertError } = await supabase
        .from('content')
        .insert([{
          title: webhookData.meta?.name || `Video ${webhookData.uid}`,
          description: webhookData.meta?.description || '',
          cloudflare_video_id: webhookData.uid,
          duration: webhookData.duration || 0,
          thumbnail_url: webhookData.thumbnail,
          category: 'Uncategorized',
          language: 'English',
          is_published: true,
          sync_status: 'auto_created_from_webhook',
          last_synced_at: new Date().toISOString(),
          metadata: {
            cloudflare_status: 'ready',
            preview_url: webhookData.preview,
            playback_hls: webhookData.playback?.hls,
            playback_dash: webhookData.playback?.dash,
            resolution: {
              width: webhookData.input?.width,
              height: webhookData.input?.height,
            },
            size: webhookData.size,
            uploaded: webhookData.uploaded,
            created_from_webhook: true,
            webhook_created: new Date().toISOString(),
          },
        }]);

      if (insertError) {
        console.error('Error creating content from webhook:', insertError);
      } else {
        console.log(`Created new content record for video ${webhookData.uid}`);
      }
    }
  } catch (error) {
    console.error('Error handling video ready webhook:', error);
  }
}

async function handleVideoError(supabase: any, webhookData: StreamWebhookEvent) {
  console.log(`Video ${webhookData.uid} processing failed:`, webhookData.status.errorReasonText);
  
  try {
    const { error } = await supabase
      .from('content')
      .update({
        is_published: false,
        sync_status: 'error',
        last_synced_at: new Date().toISOString(),
        metadata: {
          cloudflare_status: 'error',
          error_code: webhookData.status.errorReasonCode,
          error_message: webhookData.status.errorReasonText,
          webhook_updated: new Date().toISOString(),
        },
      })
      .eq('cloudflare_video_id', webhookData.uid);

    if (error) {
      console.error('Error updating content with error status:', error);
    } else {
      console.log(`Marked video ${webhookData.uid} as error in Supabase`);
    }
  } catch (error) {
    console.error('Error handling video error webhook:', error);
  }
}

async function handleVideoProcessing(supabase: any, webhookData: StreamWebhookEvent) {
  console.log(`Video ${webhookData.uid} is processing: ${webhookData.status.pctComplete}% complete`);
  
  try {
    const { error } = await supabase
      .from('content')
      .update({
        sync_status: 'processing',
        last_synced_at: new Date().toISOString(),
        metadata: {
          cloudflare_status: 'processing',
          processing_percent: webhookData.status.pctComplete,
          webhook_updated: new Date().toISOString(),
        },
      })
      .eq('cloudflare_video_id', webhookData.uid);

    if (error) {
      console.error('Error updating content with processing status:', error);
    } else {
      console.log(`Updated processing status for video ${webhookData.uid}: ${webhookData.status.pctComplete}%`);
    }
  } catch (error) {
    console.error('Error handling video processing webhook:', error);
  }
}