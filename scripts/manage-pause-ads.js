require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Sample pause screen ads
const sampleAds = [
  {
    title: "Advance Your Tech Career",
    message: "Join thousands of professionals learning cutting-edge technology skills. Master React, Node.js, Python, and more with our hands-on courses.",
    cta_text: "Start Learning Now",
    cta_link: "https://example.com/courses",
    image_url: "https://xcast-media.r2.dev/ads/tech-career-bg.jpg",
    company_logo_url: "https://xcast-media.r2.dev/logos/tech-academy-logo.png",
    priority: 1,
    is_active: false // Start disabled for testing
  },
  {
    title: "Build Amazing Apps",
    message: "Transform your ideas into reality. Learn modern web development, mobile apps, and cloud technologies from industry experts.",
    cta_text: "View Courses",
    cta_link: "https://example.com/web-development",
    image_url: "https://xcast-media.r2.dev/ads/app-development-bg.jpg", 
    company_logo_url: "https://xcast-media.r2.dev/logos/dev-academy-logo.png",
    priority: 2,
    is_active: false
  },
  {
    title: "Level Up Your Skills",
    message: "Stay ahead in the fast-paced tech world. Access premium tutorials, projects, and mentorship to accelerate your growth.",
    cta_text: "Get Started",
    cta_link: "https://example.com/premium",
    image_url: "https://xcast-media.r2.dev/ads/skill-development-bg.jpg",
    company_logo_url: "https://xcast-media.r2.dev/logos/skill-hub-logo.png", 
    priority: 3,
    is_active: false
  }
];

async function createPauseAds() {
  console.log('Creating sample pause screen ads...\n');
  
  try {
    for (const ad of sampleAds) {
      console.log(`Creating ad: ${ad.title}`);
      
      const { data, error } = await supabase
        .from('pause_ads')
        .insert({
          ...ad,
          created_by: '17800b07-5d58-4857-a865-bcd7b6c1a875' // Your admin user ID
        })
        .select()
        .single();

      if (error) {
        console.error(`Error creating ad "${ad.title}":`, error);
      } else {
        console.log(`✓ Created ad: ${ad.title} (ID: ${data.id})`);
      }
    }

    console.log('\n✅ Sample pause screen ads created successfully!');
    console.log('\n📋 Next Steps:');
    console.log('1. Run the SQL script to create the pause_ads table');
    console.log('2. Add enablePauseAds={true} and isPaused={videoPaused} to your VideoPlayerWithInteractions');
    console.log('3. Set is_active=true for ads you want to test');
    console.log('4. Upload actual images to your R2 bucket and update image URLs');

  } catch (error) {
    console.error('Error creating pause screen ads:', error);
  }
}

async function listPauseAds() {
  console.log('Current pause screen ads:\n');
  
  try {
    const { data: ads, error } = await supabase
      .from('pause_ads')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching ads:', error);
      return;
    }

    if (ads.length === 0) {
      console.log('No pause screen ads found.');
      return;
    }

    ads.forEach((ad, index) => {
      console.log(`${index + 1}. ${ad.title}`);
      console.log(`   Status: ${ad.is_active ? '🟢 Active' : '🔴 Inactive'}`);
      console.log(`   Priority: ${ad.priority}`);
      console.log(`   Impressions: ${ad.impression_count}`);
      console.log(`   Clicks: ${ad.click_count}`);
      console.log(`   CTR: ${ad.impression_count > 0 ? ((ad.click_count / ad.impression_count) * 100).toFixed(2) : 0}%`);
      console.log(`   Created: ${new Date(ad.created_at).toLocaleDateString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error listing ads:', error);
  }
}

async function toggleAdStatus(adId, isActive) {
  try {
    const { error } = await supabase
      .from('pause_ads')
      .update({ is_active: isActive })
      .eq('id', adId);

    if (error) {
      console.error('Error updating ad status:', error);
    } else {
      console.log(`✓ Ad ${isActive ? 'activated' : 'deactivated'} successfully`);
    }
  } catch (error) {
    console.error('Error toggling ad status:', error);
  }
}

// Command line interface
const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

switch (command) {
  case 'create':
    createPauseAds();
    break;
  case 'list':
    listPauseAds();
    break;
  case 'activate':
    if (!arg1) {
      console.log('Usage: node manage-pause-ads.js activate <ad-id>');
      process.exit(1);
    }
    toggleAdStatus(arg1, true);
    break;
  case 'deactivate':
    if (!arg1) {
      console.log('Usage: node manage-pause-ads.js deactivate <ad-id>');
      process.exit(1);
    }
    toggleAdStatus(arg1, false);
    break;
  default:
    console.log('Usage:');
    console.log('  node manage-pause-ads.js create     - Create sample ads');
    console.log('  node manage-pause-ads.js list       - List all ads');
    console.log('  node manage-pause-ads.js activate <id>   - Activate an ad');
    console.log('  node manage-pause-ads.js deactivate <id> - Deactivate an ad');
    break;
}