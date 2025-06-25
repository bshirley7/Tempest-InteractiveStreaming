import { NextRequest, NextResponse } from 'next/server';
import { getStreamUploadUrl } from '@/lib/stream-api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, requireSignedURLs = false, allowedOrigins = ['*'], ...metadata } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Video name is required' },
        { status: 400 }
      );
    }

    const uploadInfo = await getStreamUploadUrl({
      name,
      requireSignedURLs,
      allowedOrigins,
      ...metadata
    });

    return NextResponse.json(uploadInfo);
  } catch (error) {
    console.error('Error getting upload URL:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get upload URL' },
      { status: 500 }
    );
  }
}