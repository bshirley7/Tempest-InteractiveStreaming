require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample time-based quiz questions for the Kotlin video
const timeBasedQuizzes = [
  {
    title: "Kotlin Basics - Variables",
    question: "What keyword is used to declare a mutable variable in Kotlin?",
    options: [
      { text: "val", id: "val" },
      { text: "var", id: "var" },
      { text: "let", id: "let" },
      { text: "const", id: "const" }
    ],
    correct_answer: "var",
    metadata: {
      trigger_time: 30, // Show at 30 seconds
      duration: 45, // Stay active for 45 seconds
      video_section: "variable_declaration",
      explanation: "In Kotlin, 'var' is used for mutable variables that can be reassigned, while 'val' is for immutable variables (like final in Java)."
    }
  },
  {
    title: "Kotlin Data Types",
    question: "Which of these is a valid way to declare a String in Kotlin?",
    options: [
      { text: "String name = \"John\"", id: "java_style" },
      { text: "val name: String = \"John\"", id: "kotlin_style" },
      { text: "string name = \"John\"", id: "lowercase" },
      { text: "var name = string(\"John\")", id: "constructor" }
    ],
    correct_answer: "kotlin_style",
    metadata: {
      trigger_time: 120, // Show at 2 minutes
      duration: 45,
      video_section: "string_declaration",
      explanation: "Kotlin uses 'val' or 'var' keywords followed by the variable name, then optionally the type. Type inference often allows you to omit the explicit type."
    }
  },
  {
    title: "Kotlin Functions",
    question: "What keyword is used to define a function in Kotlin?",
    options: [
      { text: "function", id: "function" },
      { text: "def", id: "def" },
      { text: "fun", id: "fun" },
      { text: "func", id: "func" }
    ],
    correct_answer: "fun",
    metadata: {
      trigger_time: 240, // Show at 4 minutes
      duration: 45,
      video_section: "function_basics",
      explanation: "Kotlin uses the 'fun' keyword to declare functions, making the code more concise and expressive than Java's verbose function declarations."
    }
  },
  {
    title: "Kotlin Null Safety",
    question: "How do you declare a nullable variable in Kotlin?",
    options: [
      { text: "var name: String = null", id: "direct_null" },
      { text: "var name: String? = null", id: "nullable" },
      { text: "var name: Nullable<String> = null", id: "generic" },
      { text: "var name: Optional<String> = null", id: "optional" }
    ],
    correct_answer: "nullable",
    metadata: {
      trigger_time: 360, // Show at 6 minutes
      duration: 45,
      video_section: "null_safety",
      explanation: "Kotlin's null safety feature requires you to explicitly mark types as nullable using the '?' operator. This prevents NullPointerExceptions at compile time."
    }
  }
];

async function createTimeBasedQuizzes() {
  console.log('Creating time-based quiz questions for Kotlin video...\n');
  
  try {
    // First, get the content ID for the Kotlin video (you'll need to adjust this)
    const { data: kotlinContent } = await supabase
      .from('content')
      .select('id, title')
      .ilike('title', '%kotlin%')
      .limit(1)
      .single();

    if (!kotlinContent) {
      console.log('Kotlin content not found. Creating quizzes without content_id...');
    } else {
      console.log(`Found Kotlin content: ${kotlinContent.title} (${kotlinContent.id})`);
    }

    for (const quiz of timeBasedQuizzes) {
      console.log(`Creating quiz: ${quiz.title}`);
      
      const { data, error } = await supabase
        .from('interactions')
        .insert({
          content_id: kotlinContent?.id || null,
          type: 'quiz',
          title: quiz.title,
          question: quiz.question,
          options: quiz.options,
          correct_answer: quiz.correct_answer,
          is_active: true,
          metadata: quiz.metadata,
          created_by: '17800b07-5d58-4857-a865-bcd7b6c1a875' // Your admin user ID
        })
        .select()
        .single();

      if (error) {
        console.error(`Error creating quiz "${quiz.title}":`, error);
      } else {
        console.log(`✓ Created quiz: ${quiz.title} (triggers at ${quiz.metadata.trigger_time}s)`);
      }
    }

    console.log('\n✅ Time-based quizzes created successfully!');
    console.log('\nTo test:');
    console.log('1. Make sure your video player is passing currentVideoTime prop');
    console.log('2. The quizzes will automatically appear at the specified times');
    console.log('3. Each quiz stays active for 45 seconds');
    console.log('4. Users can only see one quiz question at a time');

  } catch (error) {
    console.error('Error creating time-based quizzes:', error);
  }
}

// Run the setup
createTimeBasedQuizzes()
  .then(() => {
    console.log('\nSetup completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Setup failed:', error);
    process.exit(1);
  });