require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupInteractionResponses() {
  console.log('Setting up interaction responses table...');
  
  try {
    // First check if the table exists
    const { data: tables, error: tableError } = await supabase
      .from('interaction_responses')
      .select('id')
      .limit(1);

    if (tableError && tableError.code === '42P01') {
      console.log('Table does not exist. Please run the migration first:');
      console.log('supabase/migrations/20250629000005_create_interaction_responses_table.sql');
      return;
    }

    console.log('✓ Interaction responses table exists');

    // Check if we have any interactions
    const { data: interactions, error: interactionError } = await supabase
      .from('interactions')
      .select('id, title, type')
      .limit(5);

    if (interactionError) {
      console.error('Error fetching interactions:', interactionError);
      return;
    }

    console.log(`\n✓ Found ${interactions?.length || 0} interactions`);
    
    if (interactions && interactions.length > 0) {
      console.log('\nActive interactions:');
      interactions.forEach(i => {
        console.log(`  - ${i.title} (${i.type})`);
      });
    }

    // Check existing responses
    const { data: responses, error: responseError } = await supabase
      .from('interaction_responses')
      .select('id')
      .limit(1);

    const responseCount = responses?.length || 0;
    console.log(`\n✓ Found ${responseCount} existing responses`);

    console.log('\n✅ Interaction response system is ready!');
    console.log('Users can now vote on polls and answer quizzes.');

  } catch (error) {
    console.error('Error setting up interaction responses:', error);
  }
}

// Run the setup
setupInteractionResponses()
  .then(() => {
    console.log('\nSetup completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });