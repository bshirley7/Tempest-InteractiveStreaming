import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
import { filterContent, checkUserModerationStatus } from '@/lib/moderation/content-filter';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database connection not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channel_id');
    const contentId = searchParams.get('content_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabase
      .from('chat_messages')
      .select(`
        id,
        user_id,
        message,
        is_pinned,
        is_deleted,
        metadata,
        created_at,
        updated_at
      `)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (channelId) {
      query = query.eq('channel_id', channelId);
    }
    if (contentId) {
      query = query.eq('content_id', contentId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching chat messages:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database connection not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { 
      user_id: clerk_user_id, 
      message, 
      channel_id, 
      content_id, 
      metadata = {} 
    } = body;

    // Validation
    if (!clerk_user_id || !message?.trim()) {
      return NextResponse.json({ success: false, error: 'User ID and message are required' }, { status: 400 });
    }

    if (!channel_id && !content_id) {
      return NextResponse.json({ success: false, error: 'Either channel_id or content_id must be provided' }, { status: 400 });
    }

    // Basic content filtering (you can expand this)
    const cleanMessage = message.trim();
    if (cleanMessage.length > 500) {
      return NextResponse.json({ success: false, error: 'Message too long (max 500 characters)' }, { status: 400 });
    }

    // Look up the user's internal UUID from their Clerk ID
    const { data: userProfile, error: userError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('clerk_user_id', clerk_user_id)
      .single();

    if (userError || !userProfile) {
      console.error('User profile not found for Clerk ID:', clerk_user_id);
      return NextResponse.json({ success: false, error: 'User profile not found' }, { status: 404 });
    }

    // Check user moderation status
    const moderationStatus = await checkUserModerationStatus(userProfile.id);
    if (!moderationStatus.canPost) {
      return NextResponse.json({ 
        success: false, 
        error: moderationStatus.isBanned ? 'Account banned' : 'Posting restricted' 
      }, { status: 403 });
    }

    // Filter content through moderation system
    const context = channel_id ? 'chat' : 'comments';
    const moderationResult = await filterContent(cleanMessage, context, userProfile.id);
    
    if (!moderationResult.isAllowed) {
      return NextResponse.json({ 
        success: false, 
        error: 'Message blocked by content filter' 
      }, { status: 400 });
    }

    // Extract message_type from metadata if present
    const messageType = metadata.message_type || 'text';
    
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: userProfile.id, // Use the UUID from user_profiles
        message: moderationResult.filteredContent, // Use filtered content
        message_type: messageType,
        channel_id,
        content_id,
        metadata: {
          ...metadata,
          moderation_score: moderationResult.severityScore,
          requires_review: moderationResult.requiresManualReview
        },
        is_pinned: false,
        is_deleted: false,
        is_flagged: moderationResult.actionTaken === 'flagged',
        moderation_status: moderationResult.actionTaken === 'flagged' ? 'flagged' : 'approved'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating chat message:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}