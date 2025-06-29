require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Background images for announcements
const backgroundImages = [
  'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/159490/yale-university-landscape-universities-schools-159490.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1205651/pexels-photo-1205651.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/289737/pexels-photo-289737.jpeg?auto=compress&cs=tinysrgb&w=800'
];

// Universal announcements for the streaming platform
const globalAnnouncements = [
  {
    title: 'Welcome to Tempest Interactive Streaming',
    content: 'Experience the future of interactive video content with real-time polls, quizzes, and engagement features. Join the conversation!',
    type: 'announcement',
    priority: 'high',
    is_active: true,
    metadata: { show_on_videos: true }
  },
  {
    title: 'Interactive Features Now Live',
    content: 'Engage with content through live polls, quizzes, and real-time chat. Your participation helps content creators understand what you love most.',
    type: 'announcement',
    priority: 'high',
    is_active: true,
    metadata: { show_on_videos: true }
  },
  {
    title: 'Privacy-First Data Collection',
    content: 'Your interaction data helps improve content recommendations while maintaining your privacy. We collect only what you choose to share.',
    type: 'general',
    priority: 'normal',
    is_active: true,
    metadata: { show_on_videos: false, link: '/privacy' }
  },
  {
    title: 'Enhanced AVOD Experience',
    content: 'Interactive streaming provides valuable first-party data that helps us serve better, more relevant advertisements tailored to your interests.',
    type: 'general',
    priority: 'normal',
    is_active: true,
    metadata: { show_on_videos: false }
  },
  {
    title: 'Join Our Beta Program',
    content: 'Be among the first to test new interactive features! Beta users get early access to polls, quizzes, and advanced engagement tools.',
    type: 'event',
    priority: 'high',
    is_active: true,
    starts_at: '2025-07-01T00:00:00Z',
    ends_at: '2025-08-01T23:59:59Z',
    metadata: { show_on_videos: true }
  },
  {
    title: 'Content Creator Guidelines',
    content: 'New guidelines for creating engaging interactive content. Learn best practices for polls, quizzes, and viewer engagement strategies.',
    type: 'general',
    priority: 'normal',
    is_active: true,
    metadata: { show_on_videos: false, link: '/guidelines' }
  },
  {
    title: 'Weekly Engagement Report',
    content: 'Check your weekly engagement metrics! See how your interactions contribute to the community and help shape future content.',
    type: 'general',
    priority: 'normal',
    is_active: true,
    metadata: { show_on_videos: false }
  },
  {
    title: 'System Maintenance Scheduled',
    content: 'Planned maintenance window: Sunday 2 AM - 4 AM UTC. Interactive features may be temporarily unavailable during this time.',
    type: 'alert',
    priority: 'urgent',
    is_active: true,
    starts_at: '2025-07-06T02:00:00Z',
    ends_at: '2025-07-06T06:00:00Z',
    metadata: { show_on_videos: true }
  },
  {
    title: 'New Content Categories Available',
    content: 'Explore Programming, Business, Entertainment, and Educational content with enhanced interactive features and real-time engagement.',
    type: 'announcement',
    priority: 'normal',
    is_active: true,
    metadata: { show_on_videos: false }
  },
  {
    title: 'Community Guidelines Update',
    content: 'Updated community guidelines now include interactive engagement rules. Please review to ensure positive community interactions.',
    type: 'announcement',
    priority: 'normal',
    is_active: true,
    metadata: { show_on_videos: false, link: '/terms' }
  }
];

async function populateGlobalAnnouncements() {
  console.log('Creating global announcements for Tempest streaming platform...');
  
  let successCount = 0;
  let errorCount = 0;

  for (const announcement of globalAnnouncements) {
    try {
      const { data, error } = await supabase
        .from('campus_updates')
        .insert(announcement);

      if (error) {
        console.error(`✗ Failed to create "${announcement.title}":`, error.message);
        errorCount++;
      } else {
        const type = announcement.metadata?.show_on_videos ? '(Video Overlay)' : '(Admin Only)';
        console.log(`✓ Created: ${announcement.title} ${type}`);
        successCount++;
      }
    } catch (err) {
      console.error(`✗ Exception creating "${announcement.title}":`, err.message);
      errorCount++;
    }
  }

  console.log(`\nCompleted! ${successCount} announcements created, ${errorCount} errors.`);
  
  if (successCount > 0) {
    console.log('\n🎯 Global announcements are now ready!');
    console.log('📍 View them in: Admin → Communication → Announcements');
    console.log('📺 Video overlay announcements will appear on videos');
    console.log('🎮 Interactive announcements encourage engagement');
  }

  // Summary of what was created
  const videoOverlayCount = globalAnnouncements.filter(a => a.metadata?.show_on_videos).length;
  const adminOnlyCount = globalAnnouncements.filter(a => !a.metadata?.show_on_videos).length;
  
  console.log(`\n📊 Summary:`);
  console.log(`   • ${videoOverlayCount} announcements will show on videos`);
  console.log(`   • ${adminOnlyCount} announcements are admin-only`);
  console.log(`   • ${globalAnnouncements.filter(a => a.ends_at).length} announcements have expiration dates`);
  console.log(`   • ${globalAnnouncements.filter(a => a.priority === 'high' || a.priority === 'urgent').length} high-priority announcements`);
}

// Run the script
populateGlobalAnnouncements()
  .then(() => {
    console.log('Script completed successfully.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script failed:', error);
    process.exit(1);
  });