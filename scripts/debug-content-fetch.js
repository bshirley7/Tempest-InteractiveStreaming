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

async function debugContentFetch() {
  try {
    console.log('🔍 Testing Content Fetch with Channels');
    console.log('=====================================\n');

    // 1. Test the exact query used in the component
    const { data, error } = await supabase
      .from('content')
      .select(`
        *,
        content_channels (
          channel_id,
          channels (
            id,
            name
          )
        )
      `)
      .limit(3);

    if (error) {
      console.error('❌ Query error:', error);
      return;
    }

    console.log('✅ Query successful. Found', data?.length || 0, 'items\n');

    // 2. Show the structure of the first item
    if (data && data.length > 0) {
      console.log('📋 First item structure:');
      console.log('ID:', data[0].id);
      console.log('Title:', data[0].title);
      console.log('Content channels:', JSON.stringify(data[0].content_channels, null, 2));
    }

    // 3. Test alternative query structure
    console.log('\n🔄 Testing alternative query...\n');
    const { data: altData, error: altError } = await supabase
      .from('content_channels')
      .select(`
        content_id,
        channel_id,
        channels (
          id,
          name
        ),
        content!inner (
          title
        )
      `)
      .limit(5);

    if (!altError && altData) {
      console.log('✅ Alternative query results:');
      altData.forEach((item, idx) => {
        console.log(`${idx + 1}. Content: ${item.content.title}`);
        console.log(`   Channel: ${item.channels?.name || 'Unknown'}`);
      });
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

debugContentFetch();