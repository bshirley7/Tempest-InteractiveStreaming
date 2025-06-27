import { NextRequest, NextResponse } from 'next/server';
import { getStreamUploadUrl } from '@/lib/stream-api';

export async function POST(request: NextRequest) {
  try {
    console.log('Upload URL request received');
    
    // Check environment variables
    console.log('Environment check:');
    console.log('- CLOUDFLARE_ACCOUNT_ID:', process.env.CLOUDFLARE_ACCOUNT_ID ? '✅ Set' : '❌ Missing');
    console.log('- CLOUDFLARE_STREAM_API_TOKEN:', process.env.CLOUDFLARE_STREAM_API_TOKEN ? '✅ Set' : '❌ Missing');
    console.log('- CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN:', process.env.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN ? '✅ Set' : '❌ Missing');

    const body = await request.json();
    console.log('Request body:', body);
    
    const { name, requireSignedURLs = false, allowedOrigins = ['*'], ...metadata } = body;

    if (!name) {
      console.error('No video name provided');
      return NextResponse.json(
        { error: 'Video name is required' },
        { status: 400 }
      );
    }

    console.log('Calling getStreamUploadUrl with:', {
      name,
      requireSignedURLs,
      allowedOrigins,
      ...metadata
    });

    const uploadInfo = await getStreamUploadUrl({
      name,
      requireSignedURLs,
      allowedOrigins,
      ...metadata
    });

    console.log('Upload info received:', uploadInfo);
    return NextResponse.json(uploadInfo);
  } catch (error) {
    console.error('Error getting upload URL:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
    });
    
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to get upload URL',
        details: error instanceof Error ? error.stack : 'Unknown error'
      },
      { status: 500 }
    );
  }
}