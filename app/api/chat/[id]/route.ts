import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database connection not configured' }, { status: 500 });
    }

    const { id } = await params;
    const body = await request.json();
    const { is_pinned, is_deleted } = body;

    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (typeof is_pinned === 'boolean') {
      updateData.is_pinned = is_pinned;
    }

    if (typeof is_deleted === 'boolean') {
      updateData.is_deleted = is_deleted;
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating chat message:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = createServiceClient();
    
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database connection not configured' }, { status: 500 });
    }

    const { id } = await params;

    // Soft delete by marking as deleted instead of actually removing
    const { data, error } = await supabase
      .from('chat_messages')
      .update({
        is_deleted: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting chat message:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}