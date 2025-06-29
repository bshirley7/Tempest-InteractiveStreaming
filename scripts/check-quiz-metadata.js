require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkQuizMetadata() {
  console.log('Checking quiz metadata structure...\n');
  
  try {
    // Get all quiz interactions and their metadata
    const { data: quizzes, error } = await supabase
      .from('interactions')
      .select('id, title, type, metadata, created_at')
      .eq('type', 'quiz')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quizzes:', error);
      return;
    }

    if (quizzes.length === 0) {
      console.log('No quiz interactions found.');
      return;
    }

    console.log(`Found ${quizzes.length} quiz interactions:\n`);

    quizzes.forEach((quiz, index) => {
      console.log(`${index + 1}. ${quiz.title}`);
      console.log(`   ID: ${quiz.id}`);
      console.log(`   Metadata:`, JSON.stringify(quiz.metadata, null, 2));
      
      // Check the trigger_time specifically
      if (quiz.metadata?.trigger_time !== undefined) {
        const triggerTime = quiz.metadata.trigger_time;
        const minutes = Math.floor(triggerTime / 60);
        const seconds = triggerTime % 60;
        console.log(`   Trigger Time: ${triggerTime}s = ${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        console.log(`   ❌ No trigger_time found in metadata`);
      }
      console.log('');
    });

  } catch (error) {
    console.error('Error checking quiz metadata:', error);
  }
}

// Run the check
checkQuizMetadata()
  .then(() => {
    console.log('Check completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Check failed:', error);
    process.exit(1);
  });