require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugTables() {
  console.log('Debugging tables structure...\n');
  
  try {
    console.log('=== INTERACTIONS TABLE ===');
    const { data: interactionsSchema, error: intError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'interactions' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });

    if (intError) {
      console.log('Could not get interactions schema via RPC, trying direct query...');
      // Try to describe the table by selecting from it
      const { data: testInt } = await supabase
        .from('interactions')
        .select('*')
        .limit(1);
      console.log('Interactions table query successful');
    } else {
      console.log('Interactions columns:', interactionsSchema);
    }

    console.log('\n=== INTERACTION_RESPONSES TABLE ===');
    const { data: responsesSchema, error: respError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'interaction_responses' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      });

    if (respError) {
      console.log('Could not get interaction_responses schema via RPC, trying direct query...');
      // Try to describe the table by selecting from it
      const { data: testResp } = await supabase
        .from('interaction_responses')
        .select('*')
        .limit(1);
      console.log('Interaction_responses table query successful');
    } else {
      console.log('Interaction_responses columns:', responsesSchema);
    }

    // Now let's test the exact insert that's failing
    console.log('\n=== TESTING ACTUAL INSERT ===');
    const testInteractionId = '73bbd278-0fe3-4483-966a-0de39c754ed1';
    const testUserId = '17800b07-5d58-4857-a865-bcd7b6c1a875';
    
    // First check if this interaction exists
    const { data: interaction } = await supabase
      .from('interactions')
      .select('correct_answer, type')
      .eq('id', testInteractionId)
      .single();
    
    if (interaction) {
      console.log('Found interaction:', interaction);
      
      // Now try the insert with the exact same structure as the API
      const { error: insertError } = await supabase
        .from('interaction_responses')
        .insert({
          interaction_id: testInteractionId,
          user_id: testUserId,
          response: 'test_option',
          response_data: { selected_option: 'test_option' },
          is_correct: false
        });
      
      if (insertError) {
        console.log('Insert error:', insertError.message);
        console.log('Insert error details:', insertError);
      } else {
        console.log('Insert successful! (cleaning up...)');
        // Clean up the test record
        await supabase
          .from('interaction_responses')
          .delete()
          .eq('interaction_id', testInteractionId)
          .eq('user_id', testUserId);
      }
    } else {
      console.log('Interaction not found with ID:', testInteractionId);
    }

  } catch (error) {
    console.error('Error debugging tables:', error);
  }
}

debugTables()
  .then(() => {
    console.log('\nDebug completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Debug failed:', error);
    process.exit(1);
  });