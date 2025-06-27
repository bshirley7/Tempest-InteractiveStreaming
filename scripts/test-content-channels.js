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

async function testContentChannels() {
  try {
    console.log('🔍 Testing Content Channels Table');
    console.log('=================================\n');

    // 1. Check if table exists and get count
    const { count, error: countError } = await supabase
      .from('content_channels')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('❌ Error accessing content_channels table:', countError);
      return;
    }

    console.log(`✅ Table exists with ${count || 0} relationships\n`);

    // 2. Get some sample data
    const { data: samples, error: sampleError } = await supabase
      .from('content_channels')
      .select(`
        content_id,
        channel_id,
        content:content_id (
          title
        ),
        channel:channel_id (
          name
        )
      `)
      .limit(5);

    if (sampleError) {
      console.error('❌ Error fetching samples:', sampleError);
    } else if (samples && samples.length > 0) {
      console.log('📋 Sample channel relationships:');
      samples.forEach((rel, index) => {
        console.log(`${index + 1}. Content: ${rel.content?.title || rel.content_id}`);
        console.log(`   Channel: ${rel.channel?.name || rel.channel_id}\n`);
      });
    } else {
      console.log('⚠️  No channel relationships found in the table');
    }

    // 3. Check for orphaned relationships
    const { data: orphaned, error: orphanError } = await supabase
      .from('content_channels')
      .select('content_id, channel_id')
      .is('content.id', null);

    if (!orphanError && orphaned && orphaned.length > 0) {
      console.log(`\n⚠️  Found ${orphaned.length} orphaned relationships (content deleted)`);
    }

    // 4. Get content with multiple channels
    const { data: multiChannel, error: multiError } = await supabase
      .from('content')
      .select(`
        id,
        title,
        content_channels (
          channel:channels (
            id,
            name
          )
        )
      `)
      .limit(10);

    if (!multiError && multiChannel) {
      const withMultiple = multiChannel.filter(c => c.content_channels.length > 1);
      console.log(`\n📊 Content with multiple channels: ${withMultiple.length}`);
      
      if (withMultiple.length > 0) {
        console.log('\nExamples:');
        withMultiple.slice(0, 3).forEach((content) => {
          console.log(`- "${content.title}"`);
          content.content_channels.forEach(cc => {
            console.log(`  • ${cc.channel.name}`);
          });
        });
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

testContentChannels();