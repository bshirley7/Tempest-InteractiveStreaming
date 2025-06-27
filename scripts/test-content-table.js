/**
 * Test what columns exist in the content table
 */

const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testContentTable() {
  console.log('🔍 Testing Content Table Structure\n');

  try {
    // Try to get one record to see the structure
    console.log('1️⃣ Getting existing content structure...');
    const { data: existingContent, error: readError } = await supabase
      .from('content')
      .select('*')
      .limit(1);

    if (readError) {
      console.error('❌ Error reading content table:', readError);
      return;
    }

    if (existingContent && existingContent.length > 0) {
      console.log('✅ Found existing content. Available columns:');
      Object.keys(existingContent[0]).forEach(column => {
        console.log(`   - ${column}: ${typeof existingContent[0][column]}`);
      });
    } else {
      console.log('ℹ️  No existing content found');
    }

    // Try a minimal insert to see what works
    console.log('\n2️⃣ Testing minimal insert...');
    const testData = {
      title: 'Test Video - DELETE ME',
      cloudflare_video_id: 'test-123',
      created_at: new Date().toISOString()
    };

    console.log('Attempting to insert:', testData);

    const { data: insertResult, error: insertError } = await supabase
      .from('content')
      .insert([testData])
      .select('*')
      .single();

    if (insertError) {
      console.error('❌ Insert failed:', insertError);
      console.error('Error details:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      });
    } else {
      console.log('✅ Insert successful:', insertResult);
      
      // Clean up
      const { error: deleteError } = await supabase
        .from('content')
        .delete()
        .eq('id', insertResult.id);
        
      if (deleteError) {
        console.warn('⚠️  Could not clean up test record:', deleteError.message);
      } else {
        console.log('✅ Test record cleaned up');
      }
    }

    // Try insert with more fields
    console.log('\n3️⃣ Testing insert with all fields...');
    const fullTestData = {
      title: 'Full Test Video - DELETE ME',
      cloudflare_video_id: 'test-456',
      description: 'Test description',
      duration: 121,
      thumbnail_url: 'https://example.com/thumb.jpg',
      channel_id: null,
      created_at: new Date().toISOString()
    };

    console.log('Attempting full insert:', fullTestData);

    const { data: fullInsertResult, error: fullInsertError } = await supabase
      .from('content')
      .insert([fullTestData])
      .select('*')
      .single();

    if (fullInsertError) {
      console.error('❌ Full insert failed:', fullInsertError);
      console.error('Error details:', {
        code: fullInsertError.code,
        message: fullInsertError.message,
        details: fullInsertError.details,
        hint: fullInsertError.hint
      });
    } else {
      console.log('✅ Full insert successful:', fullInsertResult);
      
      // Clean up
      const { error: deleteError2 } = await supabase
        .from('content')
        .delete()
        .eq('id', fullInsertResult.id);
        
      if (!deleteError2) {
        console.log('✅ Full test record cleaned up');
      }
    }

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

testContentTable()
  .then(() => {
    console.log('\n🎯 Content table test complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Test failed:', error);
    process.exit(1);
  });