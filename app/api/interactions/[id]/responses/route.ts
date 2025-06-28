import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database connection not configured' }, { status: 500 });
    }

    const { id: interactionId } = params;

    const { data, error } = await supabase
      .from('interaction_responses')
      .select('*')
      .eq('interaction_id', interactionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching interaction responses:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database connection not configured' }, { status: 500 });
    }

    const { id: interactionId } = params;
    const body = await request.json();
    const { user_id, response, response_data = {} } = body;

    if (!user_id || !response) {
      return NextResponse.json({ success: false, error: 'User ID and response are required' }, { status: 400 });
    }

    // Check if user has already responded to this interaction
    const { data: existing } = await supabase
      .from('interaction_responses')
      .select('id')
      .eq('interaction_id', interactionId)
      .eq('user_id', user_id)
      .single();

    if (existing) {
      return NextResponse.json({ success: false, error: 'User has already responded to this interaction' }, { status: 409 });
    }

    // Get the interaction to check correct answer
    const { data: interaction } = await supabase
      .from('interactions')
      .select('correct_answer, type')
      .eq('id', interactionId)
      .single();

    let isCorrect = null;
    if (interaction?.correct_answer && ['quiz'].includes(interaction.type)) {
      isCorrect = response === interaction.correct_answer;
    }

    // Insert the response
    const { data, error } = await supabase
      .from('interaction_responses')
      .insert({
        interaction_id: interactionId,
        user_id,
        response,
        response_data,
        is_correct: isCorrect
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating interaction response:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Update interaction results/statistics
    await updateInteractionStats(supabase, interactionId);

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

async function updateInteractionStats(supabase: any, interactionId: string) {
  try {
    // Get all responses for this interaction
    const { data: responses } = await supabase
      .from('interaction_responses')
      .select('response, is_correct')
      .eq('interaction_id', interactionId);

    if (!responses) return;

    // Calculate statistics
    const totalResponses = responses.length;
    const responseCounts: Record<string, number> = {};
    let correctCount = 0;

    responses.forEach((resp: any) => {
      responseCounts[resp.response] = (responseCounts[resp.response] || 0) + 1;
      if (resp.is_correct) correctCount++;
    });

    const results = {
      total_responses: totalResponses,
      response_counts: responseCounts,
      correct_responses: correctCount,
      accuracy_rate: totalResponses > 0 ? (correctCount / totalResponses) * 100 : 0
    };

    // Update the interaction with new results
    await supabase
      .from('interactions')
      .update({ results })
      .eq('id', interactionId);

  } catch (error) {
    console.error('Error updating interaction stats:', error);
  }
}