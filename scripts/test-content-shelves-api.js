#!/usr/bin/env node

/**
 * Test script to check content shelves API functionality
 * Run with: node scripts/test-content-shelves-api.js
 */

const { createServiceClient } = require('../lib/supabase/service.ts');

async function testContentShelvesAPI() {
  console.log('🧪 Testing Content Shelves API...\n');

  try {
    // Test Supabase connection
    console.log('1. Testing Supabase service client...');
    const supabase = createServiceClient();
    
    if (!supabase) {
      console.error('❌ Supabase service client not configured');
      console.log('   Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
      return;
    }
    
    console.log('✅ Supabase service client created successfully');

    // Test if content_shelves table exists
    console.log('\n2. Checking if content_shelves table exists...');
    const { data: shelves, error: shelvesError } = await supabase
      .from('content_shelves')
      .select('*')
      .limit(1);

    if (shelvesError) {
      console.error('❌ Error accessing content_shelves table:', shelvesError.message);
      console.log('   You may need to run the database migration:');
      console.log('   supabase/migrations/20250628000001_add_content_shelves.sql');
      return;
    }

    console.log('✅ content_shelves table exists');
    console.log(`   Found ${shelves?.length || 0} shelf(s) in the table`);

    // Test if content_shelf_assignments table exists
    console.log('\n3. Checking if content_shelf_assignments table exists...');
    const { data: assignments, error: assignmentsError } = await supabase
      .from('content_shelf_assignments')
      .select('*')
      .limit(1);

    if (assignmentsError) {
      console.error('❌ Error accessing content_shelf_assignments table:', assignmentsError.message);
      return;
    }

    console.log('✅ content_shelf_assignments table exists');
    console.log(`   Found ${assignments?.length || 0} assignment(s) in the table`);

    // Test content table (should already exist)
    console.log('\n4. Checking content table access...');
    const { data: content, error: contentError } = await supabase
      .from('content')
      .select('id, title, content_type')
      .limit(5);

    if (contentError) {
      console.error('❌ Error accessing content table:', contentError.message);
      return;
    }

    console.log('✅ content table accessible');
    console.log(`   Found ${content?.length || 0} content item(s) for testing`);

    if (content && content.length > 0) {
      console.log('   Sample content:');
      content.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.title} (${item.content_type || 'content'})`);
      });
    }

    console.log('\n🎉 All tests passed! Content Shelves API should be working.');
    console.log('\n📝 Next steps:');
    console.log('   1. Start your development server: npm run dev');
    console.log('   2. Go to /admin → Content → Content Shelves');
    console.log('   3. Create your first content shelf');
    console.log('   4. Assign some videos to it');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Run the test
testContentShelvesAPI();