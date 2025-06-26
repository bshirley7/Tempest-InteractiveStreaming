#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testContentAPI() {
  try {
    console.log('🔍 Testing Content API');
    console.log('====================\n');

    // Test the exact same query as the API
    const { data: content, error } = await supabase
      .from('content')
      .select(`
        *,
        channels(name, slug, category)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('❌ Query Error:', error);
      return;
    }

    console.log(`✅ Found ${content.length} published videos:`);
    
    content.forEach((video, index) => {
      console.log(`\n${index + 1}. ${video.title}`);
      console.log(`   ID: ${video.id}`);
      console.log(`   Channel: ${video.channels?.name || 'No channel'}`);
      console.log(`   Published: ${video.is_published}`);
      console.log(`   Duration: ${video.duration || 'Unknown'}`);
      console.log(`   Thumbnail: ${video.thumbnail_url || 'No thumbnail'}`);
      console.log(`   Tags: ${(video.tags || []).join(', ') || 'No tags'}`);
    });

    // Check total count
    const { count } = await supabase
      .from('content')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    console.log(`\n📊 Total published videos: ${count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testContentAPI();