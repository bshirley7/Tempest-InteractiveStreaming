require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTableSchema() {
  console.log('Checking interaction_responses table schema...\n');
  
  try {
    // First, try to select from the table to see what columns we get
    const { data, error } = await supabase
      .from('interaction_responses')
      .select('*')
      .limit(0); // We just want the schema, not actual data

    if (error) {
      console.error('Error accessing table:', error);
      return;
    }

    // Get column information by attempting an insert with all expected columns
    console.log('Testing table structure...');
    
    const testData = {
      interaction_id: '00000000-0000-0000-0000-000000000000',
      user_id: '00000000-0000-0000-0000-000000000000',
      response: 'test',
      response_data: { test: true },
      is_correct: false
    };

    // Try to insert (will fail due to foreign keys, but we'll see column errors first)
    const { error: insertError } = await supabase
      .from('interaction_responses')
      .insert(testData);

    if (insertError) {
      console.log('\nInsert test error:', insertError.message);
      
      if (insertError.message.includes('column') && insertError.message.includes('does not exist')) {
        console.log('\n❌ Missing columns detected!');
        console.log('The table is missing some required columns.');
        console.log('\nPlease run the following SQL in your Supabase SQL Editor:');
        console.log('----------------------------------------');
        console.log('ALTER TABLE interaction_responses');
        console.log('ADD COLUMN IF NOT EXISTS is_correct boolean,');
        console.log('ADD COLUMN IF NOT EXISTS response_data jsonb DEFAULT \'{}\';');
        console.log('----------------------------------------');
      } else if (insertError.message.includes('violates foreign key constraint')) {
        console.log('\n✓ Table structure appears correct (foreign key constraint as expected)');
      }
    }

    // Try to get actual schema info
    console.log('\nAttempting to query table structure...');
    const { data: schemaTest } = await supabase
      .from('interaction_responses')
      .select()
      .limit(1);

    console.log('\nTable appears to have the following structure based on query results.');
    console.log('If is_correct or response_data columns are missing, please add them.');

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkTableSchema()
  .then(() => {
    console.log('\nSchema check completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Check failed:', error);
    process.exit(1);
  });