require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const moderationRules = [
  // Profanity and inappropriate language
  {
    rule_type: 'banned_word',
    pattern: '\\b(fuck|shit|damn|bitch|asshole|bastard)\\b',
    severity: 'medium',
    action: 'replace',
    replacement_text: '***',
    context: ['chat', 'comments'],
    description: 'Basic profanity filter'
  },
  {
    rule_type: 'banned_word',
    pattern: '\\b(cunt|whore|slut|pussy|dick|cock|penis|vagina)\\b',
    severity: 'high',
    action: 'block',
    context: ['chat', 'comments'],
    description: 'Explicit sexual language'
  },

  // Hate speech and discrimination
  {
    rule_type: 'banned_phrase',
    pattern: '\\b(kill yourself|kys|suicide|go die)\\b',
    severity: 'critical',
    action: 'block',
    context: ['chat', 'comments'],
    description: 'Self-harm encouragement'
  },
  {
    rule_type: 'regex_pattern',
    pattern: '\\b(n[i1]gg[aer]|f[a4]gg[o0]t|ret[a4]rd|sp[i1]c|ch[i1]nk)\\b',
    severity: 'critical',
    action: 'block',
    context: ['chat', 'comments'],
    description: 'Racial and homophobic slurs'
  },

  // Harassment and bullying
  {
    rule_type: 'banned_phrase',
    pattern: '\\b(you suck|you\'re stupid|loser|idiot|moron|dumbass)\\b',
    severity: 'medium',
    action: 'flag',
    context: ['chat', 'comments'],
    description: 'Personal attacks and insults'
  },
  {
    rule_type: 'banned_phrase',
    pattern: '\\b(fat|ugly|gross|disgusting) (person|user|student|you)\\b',
    severity: 'high',
    action: 'block',
    context: ['chat', 'comments'],
    description: 'Body shaming and appearance attacks'
  },

  // Spam patterns
  {
    rule_type: 'spam_pattern',
    pattern: '(.)\\1{4,}',
    severity: 'low',
    action: 'flag',
    context: ['chat', 'comments'],
    description: 'Repeated characters (aaaaa, !!!!!, etc.)'
  },
  {
    rule_type: 'spam_pattern',
    pattern: '\\b(buy now|click here|free money|win now|act fast)\\b',
    severity: 'medium',
    action: 'block',
    context: ['chat', 'comments'],
    description: 'Commercial spam phrases'
  },
  {
    rule_type: 'regex_pattern',
    pattern: '(https?:\\/\\/[^\\s]+|www\\.[^\\s]+|[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})',
    severity: 'low',
    action: 'flag',
    context: ['chat', 'comments'],
    description: 'URL detection for review'
  },

  // Academic misconduct
  {
    rule_type: 'banned_phrase',
    pattern: '\\b(cheat|cheating|answers to|homework help|test answers)\\b',
    severity: 'medium',
    action: 'flag',
    context: ['chat', 'comments'],
    description: 'Academic dishonesty indicators'
  },

  // Personal information sharing
  {
    rule_type: 'regex_pattern',
    pattern: '\\b\\d{3}-\\d{3}-\\d{4}\\b|\\b\\d{10}\\b',
    severity: 'high',
    action: 'block',
    context: ['chat', 'comments'],
    description: 'Phone number detection'
  },
  {
    rule_type: 'regex_pattern',
    pattern: '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
    severity: 'medium',
    action: 'flag',
    context: ['chat', 'comments'],
    description: 'Email address detection'
  },
  {
    rule_type: 'regex_pattern',
    pattern: '\\b\\d{3}-\\d{2}-\\d{4}\\b',
    severity: 'critical',
    action: 'block',
    context: ['chat', 'comments'],
    description: 'Social Security Number pattern'
  },

  // Threats and violence
  {
    rule_type: 'banned_phrase',
    pattern: '\\b(i will kill|gonna kill|murder you|beat you up|violence)\\b',
    severity: 'critical',
    action: 'block',
    context: ['chat', 'comments'],
    description: 'Violent threats'
  },
  {
    rule_type: 'banned_phrase',
    pattern: '\\b(bomb|terrorist|attack|shooting|gun|weapon)\\b',
    severity: 'critical',
    action: 'flag',
    context: ['chat', 'comments'],
    description: 'Violence and terrorism keywords'
  },

  // Drugs and illegal activities
  {
    rule_type: 'banned_word',
    pattern: '\\b(weed|marijuana|cocaine|heroin|meth|drugs|dealer)\\b',
    severity: 'high',
    action: 'flag',
    context: ['chat', 'comments'],
    description: 'Drug-related content'
  },

  // Inappropriate content for educational settings
  {
    rule_type: 'banned_phrase',
    pattern: '\\b(porn|pornography|sex|sexual|nude|naked)\\b',
    severity: 'high',
    action: 'block',
    context: ['chat', 'comments'],
    description: 'Adult content keywords'
  },

  // Gaming and internet slang that might be inappropriate
  {
    rule_type: 'banned_word',
    pattern: '\\b(noob|pwned|rekt|scrub|trash|garbage)\\b',
    severity: 'low',
    action: 'flag',
    context: ['chat', 'comments'],
    description: 'Gaming insults and derogatory terms'
  },

  // Caps lock spam
  {
    rule_type: 'regex_pattern',
    pattern: '^[A-Z\\s!?.,]{20,}$',
    severity: 'low',
    action: 'flag',
    context: ['chat', 'comments'],
    description: 'Excessive caps lock usage'
  },

  // All caps with numbers/symbols (common spam)
  {
    rule_type: 'regex_pattern',
    pattern: '[A-Z0-9!@#$%^&*()]{15,}',
    severity: 'medium',
    action: 'flag',
    context: ['chat', 'comments'],
    description: 'Caps and symbols spam pattern'
  }
];

async function populateModerationRules() {
  console.log('Starting to populate moderation rules...');
  
  let successCount = 0;
  let errorCount = 0;

  for (const rule of moderationRules) {
    try {
      const { data, error } = await supabase
        .from('moderation_rules')
        .insert({
          ...rule,
          is_active: true
          // created_by will be null for system rules
        });

      if (error) {
        console.error(`Error inserting rule "${rule.description}":`, error.message);
        errorCount++;
      } else {
        console.log(`✓ Added rule: ${rule.description}`);
        successCount++;
      }
    } catch (err) {
      console.error(`Exception inserting rule "${rule.description}":`, err.message);
      errorCount++;
    }
  }

  console.log(`\nCompleted! ${successCount} rules added successfully, ${errorCount} errors.`);
}

// Run the script
populateModerationRules()
  .then(() => {
    console.log('Script completed.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });