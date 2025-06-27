require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  console.log('URL:', supabaseUrl ? 'Present' : 'Missing');
  console.log('Service Key:', supabaseServiceKey ? 'Present' : 'Missing');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function fixRLSPolicy() {
  try {
    console.log('Fixing RLS policy for content_channels table...');
    
    // First, let's check if the table exists and current policies
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('*')
      .eq('table_name', 'content_channels');
    
    if (tableError) {
      console.error('Error checking table:', tableError);
      return;
    }
    
    console.log('Found content_channels table:', tables?.length > 0);
    
    // Try to insert a test record to see the current error
    const testInsert = {
      content_id: '97071238-e888-4006-a349-03d7857dae74', // Use an existing content ID from the logs
      channel_id: '41360520-cd43-49c4-8ca2-d46fa120332a'  // Use an existing channel ID from the logs
    };
    
    console.log('Testing insert with current policy...');
    const { data, error } = await supabase
      .from('content_channels')
      .insert(testInsert)
      .select();
    
    if (error) {
      console.log('Expected error with current policy:', error.message);
    } else {
      console.log('Insert successful, cleaning up test record...');
      await supabase
        .from('content_channels')
        .delete()
        .eq('content_id', testInsert.content_id)
        .eq('channel_id', testInsert.channel_id);
    }
    
  } catch (error) {
    console.error('Error testing RLS policy:', error);
  }
}

fixRLSPolicy();