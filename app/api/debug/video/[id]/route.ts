import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Debug video API called for ID:', params.id);
    
    const supabase = await createClient();
    
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    // First, try to get just the content without any joins
    console.log('Fetching content without joins...');
    const { data: basicContent, error: basicError } = await supabase
      .from('content')
      .select('*')
      .eq('id', params.id)
      .single();
    
    if (basicError) {
      console.error('Basic content fetch error:', basicError);
      return NextResponse.json({
        error: 'Failed to fetch basic content',
        details: {
          code: basicError.code,
          message: basicError.message,
          details: basicError.details,
          hint: basicError.hint
        }
      }, { status: 500 });
    }

    if (!basicContent) {
      return NextResponse.json(
        { error: 'Content not found' },
        { status: 404 }
      );
    }

    // Now try with the channel join
    console.log('Fetching content with channel join...');
    const { data: contentWithChannel, error: channelError } = await supabase
      .from('content')
      .select(`
        *,
        channels!left(id, name, slug, category)
      `)
      .eq('id', params.id)
      .single();

    // Get channel info separately if there's a channel_id
    let channelInfo = null;
    if (basicContent.channel_id) {
      console.log('Fetching channel info for ID:', basicContent.channel_id);
      const { data: channel } = await supabase
        .from('channels')
        .select('*')
        .eq('id', basicContent.channel_id)
        .single();
      
      channelInfo = channel;
    }

    return NextResponse.json({
      success: true,
      debug: {
        contentId: params.id,
        hasCloudflareVideoId: !!basicContent.cloudflare_video_id,
        cloudflareVideoId: basicContent.cloudflare_video_id,
        hasChannelId: !!basicContent.channel_id,
        channelId: basicContent.channel_id,
        channelJoinError: channelError ? {
          code: channelError.code,
          message: channelError.message
        } : null
      },
      basicContent,
      contentWithChannel: contentWithChannel || null,
      channelInfo
    });
  } catch (error) {
    console.error('Debug video API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}