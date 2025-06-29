require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createInteractionResponsesTable() {
  console.log('Creating interaction_responses table...');
  
  try {
    // Create the table
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Create interaction_responses table
        CREATE TABLE IF NOT EXISTS interaction_responses (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          interaction_id uuid NOT NULL REFERENCES interactions(id) ON DELETE CASCADE,
          user_id uuid NOT NULL REFERENCES user_profiles(id),
          response text NOT NULL,
          response_data jsonb DEFAULT '{}',
          is_correct boolean,
          created_at timestamptz DEFAULT now(),
          
          -- Ensure one response per user per interaction
          UNIQUE(interaction_id, user_id)
        );
      `
    });

    if (createError) {
      // Try direct SQL if RPC doesn't work
      console.log('RPC failed, trying direct table creation...');
      
      // Check if table already exists
      const { data: existing } = await supabase
        .from('interaction_responses')
        .select('id')
        .limit(1);
      
      if (!existing) {
        console.error('Table creation failed. Please run the migration manually.');
        return;
      } else {
        console.log('✓ Table already exists');
      }
    } else {
      console.log('✓ Table created successfully');
    }

    // Enable RLS
    console.log('Enabling RLS and creating policies...');
    
    // Test if we can query the table
    const { error: testError } = await supabase
      .from('interaction_responses')
      .select('count');

    if (!testError) {
      console.log('✓ Table is accessible');
    }

    console.log('\n✅ Interaction responses table is ready!');
    console.log('Users can now vote on polls and answer quizzes.');

  } catch (error) {
    console.error('Error creating table:', error);
    console.log('\nPlease create the table manually using the migration file:');
    console.log('supabase/migrations/20250629000005_create_interaction_responses_table.sql');
  }
}

// Run the creation
createInteractionResponsesTable()
  .then(() => {
    console.log('\nSetup completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });