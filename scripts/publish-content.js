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

async function publishAllContent() {
  try {
    console.log('🎬 Publishing All Content');
    console.log('========================\n');

    // Get all unpublished content
    const { data: unpublished, error: fetchError } = await supabase
      .from('content')
      .select('id, title, is_published')
      .eq('is_published', false);

    if (fetchError) {
      throw new Error(`Failed to fetch content: ${fetchError.message}`);
    }

    console.log(`📊 Found ${unpublished.length} unpublished videos`);

    if (unpublished.length === 0) {
      console.log('✅ All content is already published!');
      return;
    }

    // Publish all content
    const { data: updated, error: updateError } = await supabase
      .from('content')
      .update({ 
        is_published: true,
        updated_at: new Date().toISOString()
      })
      .eq('is_published', false)
      .select('id, title');

    if (updateError) {
      throw new Error(`Failed to publish content: ${updateError.message}`);
    }

    console.log(`✅ Successfully published ${updated.length} videos:`);
    updated.forEach((video, index) => {
      console.log(`   ${index + 1}. ${video.title}`);
    });

    // Show summary
    const { data: allContent, error: summaryError } = await supabase
      .from('content')
      .select('is_published');

    if (!summaryError) {
      const published = allContent.filter(c => c.is_published).length;
      const total = allContent.length;
      console.log(`\n📈 Content Status: ${published}/${total} published`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

publishAllContent();