require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Your Clerk user ID from the error message
const clerkUserId = 'user_2y232PRIhXVR9omfFBhPQdG6DZU';

async function testUserProfile() {
  console.log('Testing user profile for Clerk ID:', clerkUserId);
  
  try {
    // Check if user profile exists
    const { data: userProfile, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      
      if (error.code === 'PGRST116') {
        console.log('\n❌ User profile not found!');
        console.log('Creating user profile...');
        
        // Create the user profile
        const { data: newProfile, error: createError } = await supabase
          .from('user_profiles')
          .insert({
            clerk_user_id: clerkUserId,
            email: 'brandon.shirley@gmail.com', // From your .env.local
            full_name: 'Brandon Shirley',
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating user profile:', createError);
        } else {
          console.log('✓ User profile created:', newProfile.id);
        }
      }
    } else {
      console.log('✓ User profile found:', userProfile.id);
      console.log('  Email:', userProfile.email);
      console.log('  Role:', userProfile.role);
    }

    // Test interaction responses table
    console.log('\nChecking interaction_responses table...');
    const { error: tableError } = await supabase
      .from('interaction_responses')
      .select('count');

    if (tableError) {
      console.log('❌ interaction_responses table not accessible:', tableError.message);
      console.log('Please run the migration to create the table.');
    } else {
      console.log('✓ interaction_responses table is accessible');
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the test
testUserProfile()
  .then(() => {
    console.log('\nTest completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Test failed:', error);
    process.exit(1);
  });