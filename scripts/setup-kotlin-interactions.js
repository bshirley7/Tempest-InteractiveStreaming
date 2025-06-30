require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Kotlin-specific interactions
const kotlinInteractions = [
  {
    type: 'quiz',
    title: 'Kotlin Variable Declaration',
    description: 'Which keyword is used to declare a mutable variable in Kotlin?',
    options: [
      { id: 'a', text: 'val' },
      { id: 'b', text: 'var' },
      { id: 'c', text: 'let' },
      { id: 'd', text: 'const' }
    ],
    correct_answer: 'b',
    is_active: false,
    metadata: {
      trigger_time: '02:30',
      auto_activate: true,
      content_specific: true
    }
  },
  {
    type: 'quiz',
    title: 'Kotlin Function Declaration',
    description: 'What is the correct syntax for declaring a function in Kotlin?',
    options: [
      { id: 'a', text: 'function myFunc()' },
      { id: 'b', text: 'fun myFunc()' },
      { id: 'c', text: 'def myFunc()' },
      { id: 'd', text: 'void myFunc()' }
    ],
    correct_answer: 'b',
    is_active: false,
    metadata: {
      trigger_time: '05:15',
      auto_activate: true,
      content_specific: true
    }
  },
  {
    type: 'poll',
    title: 'Kotlin vs Java Preference',
    description: 'What do you think is the biggest advantage of Kotlin over Java?',
    options: [
      { id: 'a', text: 'Null safety' },
      { id: 'b', text: 'Concise syntax' },
      { id: 'c', text: 'Interoperability' },
      { id: 'd', text: 'Coroutines' }
    ],
    is_active: false,
    metadata: {
      trigger_time: '08:00',
      auto_activate: true,
      content_specific: true
    }
  },
  {
    type: 'quiz',
    title: 'Kotlin Data Classes',
    description: 'What does the "data" keyword automatically generate for a class?',
    options: [
      { id: 'a', text: 'Constructor only' },
      { id: 'b', text: 'toString() method only' },
      { id: 'c', text: 'equals(), hashCode(), toString(), and copy()' },
      { id: 'd', text: 'Nothing special' }
    ],
    correct_answer: 'c',
    is_active: false,
    metadata: {
      trigger_time: '12:45',
      auto_activate: true,
      content_specific: true
    }
  },
  {
    type: 'quiz',
    title: 'Kotlin Null Safety',
    description: 'Which operator is used for safe calls in Kotlin?',
    options: [
      { id: 'a', text: '?.' },
      { id: 'b', text: '!!' },
      { id: 'c', text: '?:' },
      { id: 'd', text: '::' }
    ],
    correct_answer: 'a',
    is_active: false,
    metadata: {
      trigger_time: '15:20',
      auto_activate: true,
      content_specific: true
    }
  }
];

async function setupKotlinInteractions() {
  console.log('Setting up Kotlin interactions...');
  
  try {
    // Find content that might be Kotlin-related
    const { data: kotlinContent, error: contentError } = await supabase
      .from('content')
      .select('id, title, description')
      .or('title.ilike.%kotlin%,description.ilike.%kotlin%,title.ilike.%android%')
      .eq('is_published', true);

    if (contentError) {
      throw contentError;
    }

    if (!kotlinContent || kotlinContent.length === 0) {
      console.log('No Kotlin-related content found. Creating a sample content entry...');
      
      // Create a sample Kotlin content entry
      const { data: newContent, error: createError } = await supabase
        .from('content')
        .insert({
          title: 'Kotlin Programming Fundamentals',
          description: 'Learn the basics of Kotlin programming language',
          cloudflare_video_id: 'sample-kotlin-video-id',
          is_published: true,
          category: 'programming',
          tags: ['kotlin', 'programming', 'android'],
          metadata: {
            sample: true,
            created_for: 'interaction_demo'
          }
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      kotlinContent.push(newContent);
      console.log('✓ Created sample Kotlin content:', newContent.title);
    }

    console.log(`Found ${kotlinContent.length} Kotlin-related content item(s):`);
    kotlinContent.forEach(content => {
      console.log(`- ${content.title} (ID: ${content.id})`);
    });

    // Add interactions to the first Kotlin content found
    const targetContent = kotlinContent[0];
    console.log(`\nAdding interactions to: "${targetContent.title}"`);

    let successCount = 0;
    let errorCount = 0;

    for (const interaction of kotlinInteractions) {
      try {
        const { data, error } = await supabase
          .from('interactions')
          .insert({
            ...interaction,
            content_id: targetContent.id,
            is_active: false // Start inactive
          });

        if (error) {
          console.error(`✗ Failed to create "${interaction.title}":`, error.message);
          errorCount++;
        } else {
          console.log(`✓ Created interaction: ${interaction.title} (trigger: ${interaction.trigger_time})`);
          successCount++;
        }
      } catch (err) {
        console.error(`✗ Exception creating "${interaction.title}":`, err.message);
        errorCount++;
      }
    }

    console.log(`\nCompleted! ${successCount} interactions created, ${errorCount} errors.`);
    
    if (successCount > 0) {
      console.log('\n🎯 Kotlin interactions are now ready!');
      console.log('You can view and manage them in Admin → Communication → Interactions');
      console.log(`Filter by "${targetContent.title}" to see the Kotlin-specific interactions.`);
    }

  } catch (error) {
    console.error('Script failed:', error);
    process.exit(1);
  }
}

// Run the script
setupKotlinInteractions()
  .then(() => {
    console.log('Script completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });