import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database connection not configured' 
      }, { status: 500 });
    }

    const { id: contentId } = await params;

    if (!contentId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Content ID is required' 
      }, { status: 400 });
    }

    // Get all interactions for this content
    const { data: interactions, error } = await supabase
      .from('interactions')
      .select(`
        id,
        type,
        title,
        question,
        options,
        correct_answer,
        time_limit,
        is_active,
        starts_at,
        ends_at,
        metadata,
        created_at,
        updated_at
      `)
      .eq('content_id', contentId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching content interactions:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    // Sort interactions by trigger time if available
    const sortedInteractions = interactions?.sort((a, b) => {
      const triggerA = a.metadata?.trigger_time;
      const triggerB = b.metadata?.trigger_time;
      
      if (!triggerA && !triggerB) return 0;
      if (!triggerA) return 1;
      if (!triggerB) return -1;
      
      // Convert MM:SS to seconds for comparison
      const parseTime = (time: string) => {
        const [minutes, seconds] = time.split(':').map(Number);
        return (minutes || 0) * 60 + (seconds || 0);
      };
      
      return parseTime(triggerA) - parseTime(triggerB);
    }) || [];

    return NextResponse.json({ 
      success: true, 
      data: sortedInteractions 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json({ 
        success: false, 
        error: 'Database connection not configured' 
      }, { status: 500 });
    }

    const { id: contentId } = await params;
    const body = await request.json();
    
    const { 
      type,
      title,
      question,
      options,
      correct_answer,
      time_limit,
      trigger_time,
      auto_activate = false
    } = body;

    // Validation
    if (!type || !title || !question) {
      return NextResponse.json({ 
        success: false, 
        error: 'Type, title, and question are required' 
      }, { status: 400 });
    }

    const validTypes = ['poll', 'quiz', 'rating', 'reaction'];
    if (!validTypes.includes(type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid interaction type' 
      }, { status: 400 });
    }

    // Prepare options based on type
    let processedOptions: any = {};
    
    if (type === 'poll' || type === 'quiz') {
      if (!options || options.length < 2) {
        return NextResponse.json({ 
          success: false, 
          error: 'At least 2 options required for polls and quizzes' 
        }, { status: 400 });
      }
      
      processedOptions = options
        .filter((option: string) => option.trim())
        .map((option: string, index: number) => ({
          id: String.fromCharCode(97 + index), // a, b, c, d
          text: option.trim()
        }));
    } else if (type === 'rating') {
      processedOptions = {
        scale: 5,
        labels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
      };
    } else if (type === 'reaction') {
      processedOptions = {
        emojis: ['👍', '❤️', '😂', '😮', '👏', '🔥']
      };
    }

    const interactionData = {
      content_id: contentId,
      type,
      title,
      question,
      options: processedOptions,
      correct_answer: type === 'quiz' ? correct_answer : null,
      time_limit: time_limit || null,
      is_active: false, // Start inactive by default
      metadata: {
        trigger_time: trigger_time || null,
        auto_activate: auto_activate && !!trigger_time,
        content_specific: true
      }
    };

    const { data, error } = await supabase
      .from('interactions')
      .insert(interactionData)
      .select()
      .single();

    if (error) {
      console.error('Error creating content interaction:', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      data 
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}