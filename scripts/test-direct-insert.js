require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing with service role key...');
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function testInsert() {
  try {
    // Test insert with service role (should bypass RLS)
    const testData = {
      content_id: '97071238-e888-4006-a349-03d7857dae74',
      channel_id: '41360520-cd43-49c4-8ca2-d46fa120332a'
    };
    
    console.log('Testing insert with service role...');
    const { data, error } = await supabaseAdmin
      .from('content_channels')
      .insert(testData)
      .select();
    
    if (error) {
      console.error('Service role insert failed:', error);
    } else {
      console.log('Service role insert successful:', data);
      
      // Clean up
      await supabaseAdmin
        .from('content_channels')
        .delete()
        .eq('content_id', testData.content_id)
        .eq('channel_id', testData.channel_id);
      console.log('Cleaned up test record');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testInsert();