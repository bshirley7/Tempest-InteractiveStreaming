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

async function verifyContentFetch() {
  try {
    console.log('🔍 Verifying Content Fetch (matching content-management.tsx query)');
    console.log('======================================================\n');

    // Exact same query as content-management.tsx (after fix)
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Query Error:', error);
      return;
    }

    console.log(`✅ Successfully fetched ${data.length} content items!\n`);
    
    data.forEach((item, index) => {
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   ID: ${item.id}`);
      console.log(`   Cloudflare ID: ${item.cloudflare_video_id}`);
      console.log(`   Channel ID: ${item.channel_id || 'No channel'}`);
      console.log(`   Category: ${item.category || 'No category'}`);
      console.log(`   Published: ${item.is_published}`);
      console.log(`   Duration: ${item.duration ? item.duration + 's' : 'Unknown'}`);
      console.log(`   Created: ${new Date(item.created_at).toLocaleDateString()}`);
      console.log('');
    });

    // Also test the API endpoint style query with pagination
    console.log('\n📄 Testing API-style query with pagination:');
    const { data: paginatedData, error: paginatedError, count } = await supabase
      .from('content')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(0, 19); // First 20 items

    if (paginatedError) {
      console.error('❌ Paginated Query Error:', paginatedError);
    } else {
      console.log(`✅ Paginated query successful: ${paginatedData.length} items (Total: ${count})`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

verifyContentFetch();