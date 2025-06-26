#!/usr/bin/env node

/**
 * Check Video HD Quality Script
 * 
 * Checks if a specific video supports HD streaming
 */

require('dotenv').config({ path: '.env.local' });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkVideoHD(contentId) {
  try {
    // Get content from database
    const { data: content, error } = await supabase
      .from('content')
      .select('*')
      .eq('id', contentId)
      .single();
    
    if (error || !content) {
      console.error('Content not found:', error);
      return;
    }
    
    console.log('\n📹 Content Details:');
    console.log('Title:', content.title);
    console.log('Cloudflare Video ID:', content.cloudflare_video_id);
    console.log('Duration:', content.duration);
    console.log('Status:', content.status);
    
    // Get Cloudflare video details
    if (content.cloudflare_video_id) {
      const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
      const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN;
      
      if (!accountId || !apiToken) {
        console.error('\n❌ Missing Cloudflare credentials');
        return;
      }
      
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream/${content.cloudflare_video_id}`,
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        console.error('\n❌ Failed to fetch video from Cloudflare:', response.statusText);
        return;
      }
      
      const data = await response.json();
      const video = data.result;
      
      console.log('\n🎥 Cloudflare Stream Details:');
      console.log('Ready to Stream:', video.readyToStream);
      console.log('Upload Status:', video.status?.state);
      
      if (video.input) {
        console.log('\n📐 Video Resolution:');
        console.log(`Original: ${video.input.width}x${video.input.height}`);
        
        const resolutions = [];
        if (video.input.height >= 240) resolutions.push('240p');
        if (video.input.height >= 360) resolutions.push('360p');
        if (video.input.height >= 480) resolutions.push('480p');
        if (video.input.height >= 720) resolutions.push('720p ✅ HD');
        if (video.input.height >= 1080) resolutions.push('1080p ✅ Full HD');
        if (video.input.height >= 1440) resolutions.push('1440p ✅ 2K');
        if (video.input.height >= 2160) resolutions.push('4K ✅ Ultra HD');
        
        console.log('Available Qualities:', resolutions.join(', '));
        
        if (video.input.height < 720) {
          console.log('\n⚠️  This video is NOT HD quality!');
          console.log('The source video was uploaded in standard definition.');
          console.log('To enable HD, upload videos with at least 720p (1280x720) resolution.');
        } else {
          console.log('\n✅ This video supports HD streaming!');
          console.log('Available HD qualities are determined by the source resolution.');
        }
      }
      
      console.log('\n🔗 Playback URLs:');
      console.log('HLS:', video.playback?.hls);
      console.log('DASH:', video.playback?.dash);
      
    } else {
      console.log('\n❌ No Cloudflare video ID found for this content');
    }
    
  } catch (error) {
    console.error('Error checking video:', error);
  }
}

// Get video ID from command line
const contentId = process.argv[2] || 'e6820d6b-4696-4264-82b4-9749b31ab159';

console.log(`Checking HD support for video: ${contentId}`);
checkVideoHD(contentId);