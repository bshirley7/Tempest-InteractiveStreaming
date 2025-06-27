import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    const adId = searchParams.get('id');
    const event = searchParams.get('event');
    
    if (!adId || !event) {
      return new NextResponse('Missing parameters', { status: 400 });
    }

    if (!supabase) {
      console.error('Database not configured for ad tracking');
      return new NextResponse('OK', { status: 200 });
    }

    // Log the tracking event
    console.log(`Ad tracking: ID=${adId}, Event=${event}, Time=${new Date().toISOString()}`);
    
    // You can create an ad_events table if needed for detailed analytics:
    // CREATE TABLE ad_events (
    //   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    //   ad_id UUID REFERENCES content(id),
    //   event_type VARCHAR(50),
    //   user_agent TEXT,
    //   ip_address INET,
    //   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    // );

    // Optional: Insert tracking event
    /*
    const { error } = await supabase
      .from('ad_events')
      .insert({
        ad_id: adId,
        event_type: event,
        user_agent: request.headers.get('user-agent'),
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip')
      });

    if (error) {
      console.error('Failed to log ad event:', error);
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
    console.error('Ad tracking error:', error);
    return new NextResponse('OK', { status: 200 });
  }
}