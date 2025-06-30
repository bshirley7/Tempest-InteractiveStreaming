import { NextRequest, NextResponse } from 'next/server';
import { getStreamVideo, updateStreamVideo, deleteStreamVideo } from '@/lib/stream-api';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const video = await getStreamVideo(id);
    return NextResponse.json(video);
  } catch (error) {
    console.error('Error getting video:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get video' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const updatedVideo = await updateStreamVideo(id, body);
    return NextResponse.json(updatedVideo);
  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update video' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deleteStreamVideo(id);
    
    if (success) {
      return NextResponse.json({ success: true, message: 'Video deleted successfully' });
    } else {
      return NextResponse.json(
        { error: 'Failed to delete video' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete video' },
      { status: 500 }
    );
  }
}