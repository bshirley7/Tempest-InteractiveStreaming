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

async function testChannelSave() {
  try {
    console.log('🔍 Testing Channel Save Process');
    console.log('================================\n');

    // 1. Get a test content item
    const { data: content } = await supabase
      .from('content')
      .select('id, title')
      .limit(1)
      .single();

    if (!content) {
      console.error('❌ No content found');
      return;
    }

    console.log('✅ Using content:', content.title);
    console.log('   ID:', content.id);

    // 2. Get available channels
    const { data: channels } = await supabase
      .from('channels')
      .select('id, name')
      .limit(3);

    console.log('\n📺 Available channels:');
    channels.forEach(ch => console.log(`   - ${ch.name} (${ch.id})`));

    // 3. Delete existing associations
    console.log('\n🗑️  Clearing existing associations...');
    const { error: deleteError } = await supabase
      .from('content_channels')
      .delete()
      .eq('content_id', content.id);

    if (deleteError) {
      console.error('❌ Delete error:', deleteError);
    } else {
      console.log('✅ Cleared existing associations');
    }

    // 4. Add new associations
    console.log('\n➕ Adding new associations...');
    const channelRelationships = channels.slice(0, 2).map(channel => ({
      content_id: content.id,
      channel_id: channel.id
    }));

    console.log('Inserting:', JSON.stringify(channelRelationships, null, 2));

    const { data: insertedData, error: insertError } = await supabase
      .from('content_channels')
      .insert(channelRelationships)
      .select();

    if (insertError) {
      console.error('❌ Insert error:', insertError);
    } else {
      console.log('✅ Inserted successfully:', insertedData);
    }

    // 5. Verify the save
    console.log('\n🔄 Verifying saved associations...');
    const { data: verified } = await supabase
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

    console.log('✅ Final result:');
    console.log(JSON.stringify(verified, null, 2));

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testChannelSave();