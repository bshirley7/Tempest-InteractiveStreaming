import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database connection not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const context = searchParams.get('context');
    const isActive = searchParams.get('active') !== 'false'; // Default to true

    let query = supabase
      .from('moderation_rules')
      .select('*')
      .eq('is_active', isActive)
      .order('created_at', { ascending: false });

    if (context) {
      query = query.contains('context', [context]);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching moderation rules:', error);
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
      rule_type,
      pattern,
      severity = 'medium',
      action = 'flag',
      replacement_text,
      context,
      description,
      created_by
    } = body;

    // Validation
    if (!rule_type || !pattern) {
      return NextResponse.json({ success: false, error: 'Rule type and pattern are required' }, { status: 400 });
    }

    const validRuleTypes = ['banned_word', 'banned_phrase', 'regex_pattern', 'spam_pattern'];
    if (!validRuleTypes.includes(rule_type)) {
      return NextResponse.json({ success: false, error: 'Invalid rule type' }, { status: 400 });
    }

    const validSeverities = ['low', 'medium', 'high', 'critical'];
    if (!validSeverities.includes(severity)) {
      return NextResponse.json({ success: false, error: 'Invalid severity level' }, { status: 400 });
    }

    const validActions = ['flag', 'block', 'shadow_ban', 'replace'];
    if (!validActions.includes(action)) {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }

    // Test regex pattern if it's a regex rule
    if (rule_type === 'regex_pattern') {
      try {
        new RegExp(pattern);
      } catch (e) {
        return NextResponse.json({ success: false, error: 'Invalid regex pattern' }, { status: 400 });
      }
    }

    const { data, error } = await supabase
      .from('moderation_rules')
      .insert({
        rule_type,
        pattern,
        severity,
        action,
        replacement_text,
        context,
        description,
        created_by,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating moderation rule:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}