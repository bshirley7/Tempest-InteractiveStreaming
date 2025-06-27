const { createClient } = require('@supabase/supabase-js');

// Use service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSPolicy() {
  try {
    console.log('Fixing RLS policy for content_channels table...');
    
    // Drop existing policies
    const dropPolicies = `
      DROP POLICY IF EXISTS "Faculty can manage content channels" ON content_channels;
      DROP POLICY IF EXISTS "Students can read content channels" ON content_channels;
      DROP POLICY IF EXISTS "Authenticated users can manage content channels" ON content_channels;
    `;
    
    // Create new policy
    const createPolicy = `
      CREATE POLICY "Authenticated users can manage content_channels"
        ON content_channels
        FOR ALL
        TO authenticated
        USING (true);
    `;
    
    // Execute the SQL
    const { error: dropError } = await supabase.rpc('exec_sql', { sql: dropPolicies });
    if (dropError) {
      console.error('Error dropping policies:', dropError);
    } else {
      console.log('Successfully dropped old policies');
    }
    
    const { error: createError } = await supabase.rpc('exec_sql', { sql: createPolicy });
    if (createError) {
      console.error('Error creating new policy:', createError);
    } else {
      console.log('Successfully created new policy');
    }
    
    console.log('RLS policy fix completed!');
  } catch (error) {
    console.error('Error fixing RLS policy:', error);
  }
}

fixRLSPolicy();