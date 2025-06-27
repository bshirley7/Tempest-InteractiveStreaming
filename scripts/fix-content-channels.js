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

async function fixContentChannels() {
  try {
    console.log('🔍 Debugging Content Channels Issue');
    console.log('==================================\n');

    // 1. Get a specific content item that should have channels
    const contentTitle = "Exploring Singapore's Coolest Attractions - TRAVEL GUIDE";
    
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('id, title')
      .eq('title', contentTitle)
      .single();

    if (contentError || !content) {
      console.error('❌ Could not find content:', contentTitle);
      return;
    }

    console.log('✅ Found content:');
    console.log('   ID:', content.id);
    console.log('   Title:', content.title);

    // 2. Check if it has channel associations
    const { data: associations, error: assocError } = await supabase
      .from('content_channels')
      .select('*')
      .eq('content_id', content.id);

    console.log('\n📋 Current channel associations:', associations?.length || 0);
    if (associations && associations.length > 0) {
      associations.forEach(assoc => {
        console.log('   - Channel ID:', assoc.channel_id);
      });
    }

    // 3. Test the joined query
    console.log('\n🔄 Testing joined query for this content...');
    const { data: joinedData, error: joinedError } = await supabase
      .from('content')
      .select(`
        id,
        title,
        content_channels!left (
          channel_id,
          channels (
            id,
            name
          )
        )
      `)
      .eq('id', content.id)
      .single();

    if (joinedError) {
      console.error('❌ Joined query error:', joinedError);
    } else {
      console.log('✅ Joined query result:');
      console.log(JSON.stringify(joinedData, null, 2));
    }

    // 4. List all available channels
    console.log('\n📺 Available channels:');
    const { data: channels } = await supabase
      .from('channels')
      .select('id, name');
    
    if (channels) {
      channels.forEach((ch, idx) => {
        console.log(`${idx + 1}. ${ch.name} (${ch.id})`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixContentChannels();