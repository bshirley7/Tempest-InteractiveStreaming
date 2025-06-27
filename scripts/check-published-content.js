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

async function checkPublishedContent() {
  try {
    console.log('🔍 Checking Published Content Status');
    console.log('==================================\n');

    // Check total content
    const { count: totalCount } = await supabase
      .from('content')
      .select('*', { count: 'exact', head: true });

    console.log(`📊 Total content items: ${totalCount}`);

    // Check published content
    const { count: publishedCount } = await supabase
      .from('content')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true);

    console.log(`📢 Published content items: ${publishedCount}`);

    // Check draft content
    const { count: draftCount } = await supabase
      .from('content')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', false);

    console.log(`📝 Draft content items: ${draftCount}`);

    // Show sample content with publish status
    const { data: sampleContent } = await supabase
      .from('content')
      .select('id, title, is_published, is_featured')
      .limit(5);

    console.log('\n📋 Sample content status:');
    sampleContent?.forEach((item, index) => {
      const status = item.is_published ? '✅ Published' : '❌ Draft';
      const featured = item.is_featured ? ' ⭐ Featured' : '';
      console.log(`${index + 1}. ${item.title}`);
      console.log(`   Status: ${status}${featured}`);
      console.log('');
    });

    if (publishedCount === 0) {
      console.log('\n⚠️  ISSUE IDENTIFIED: All content is in draft status!');
      console.log('   The Content Library (VOD Library) only shows published content.');
      console.log('   To fix this, you need to publish some content from the admin panel.');
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    process.exit(1);
  }
}

checkPublishedContent();