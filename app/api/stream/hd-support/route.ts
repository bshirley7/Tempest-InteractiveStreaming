import { NextRequest, NextResponse } from 'next/server';
import { checkHDStreamingSupport, getVideoQualityInfo } from '@/lib/stream-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (videoId) {
      // Get quality info for a specific video
      const qualityInfo = await getVideoQualityInfo(videoId);
      return NextResponse.json({
        success: true,
        data: qualityInfo
      });
    } else {
      // Get general HD support info
      const hdSupport = await checkHDStreamingSupport();
      return NextResponse.json({
        success: true,
        data: hdSupport
      });
    }
  } catch (error) {
    console.error('HD support check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to check HD streaming support',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}