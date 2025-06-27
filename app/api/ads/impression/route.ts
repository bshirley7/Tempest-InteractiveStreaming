import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const adId = searchParams.get('id');
    const position = searchParams.get('position') || 'unknown';
    
    if (!adId) {
      return new NextResponse('Missing ad ID', { status: 400 });
    }

    if (!supabase) {
      console.error('Database not configured for ad impression tracking');
      return new NextResponse('OK', { status: 200 });
    }

    // Log the impression (you can create an ad_impressions table if needed)
    console.log(`Ad impression: ID=${adId}, Position=${position}, Time=${new Date().toISOString()}`);
    
    // For now, just log to console. You could create an ad_impressions table like:
    // CREATE TABLE ad_impressions (
    //   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    //   ad_id UUID REFERENCES content(id),
    //   position VARCHAR(20),
    //   user_agent TEXT,
    //   ip_address INET,
    //   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    // );

    // Optional: Insert impression record
    /*
    const { error } = await supabase
      .from('ad_impressions')
      .insert({
        ad_id: adId,
        position,
        user_agent: request.headers.get('user-agent'),
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      });

    if (error) {
      console.error('Failed to log ad impression:', error);
    }
    */

    // Return 1x1 transparent pixel
    const pixel = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
      'base64'
    );

    return new NextResponse(pixel, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Length': pixel.length.toString()
      }
    });

  } catch (error) {
    console.error('Ad impression tracking error:', error);
    return new NextResponse('OK', { status: 200 });
  }
}