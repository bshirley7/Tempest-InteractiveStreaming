#!/usr/bin/env node

/**
 * Debug script to analyze content categorization
 * This script fetches all content and analyzes how it's being categorized
 */

const fs = require('fs');
const path = require('path');

// Simulate the categorization logic from vod-library.tsx
function categorizeContent(content) {
  const categories = {
    travelGuides: [],
    relaxationWellness: [],
    documentaries: [],
    careerDevelopment: [],
    howToTutorials: [],
    academicContent: [],
    newsUpdates: [],
    entertainment: []
  };

  content.forEach(item => {
    const title = item.title.toLowerCase();
    const description = (item.description || '').toLowerCase();
    const category = (item.category || '').toLowerCase();
    const genre = (item.genre || '').toLowerCase();
    const tags = (item.tags || []).map(tag => tag.toLowerCase());
    
    // Get channel name from content_channels relationship
    let channelName = 'general';
    if (item.content_channels && item.content_channels.length > 0) {
      channelName = (item.content_channels[0].channel?.name || 'general').toLowerCase();
    }
    
    const textToAnalyze = `${title} ${description} ${category} ${genre} ${channelName} ${tags.join(' ')}`;

    console.log(`\nAnalyzing: "${item.title}"`);
    console.log(`Category: ${item.category || 'None'}`);
    console.log(`Genre: ${item.genre || 'None'}`);
    console.log(`Channel: ${channelName}`);
    console.log(`Tags: ${tags.join(', ') || 'None'}`);
    console.log(`Text to analyze: ${textToAnalyze.substring(0, 100)}...`);

    // Travel & Guides (RetireWise channel content)
    if (
      channelName.includes('retirewise') ||
      channelName.includes('guides') ||
      textToAnalyze.match(/\b(travel|trip|guide|city|country|vacation|destination|journey|explore|visit|tourism|adventure|culture|international)\b/)
    ) {
      categories.travelGuides.push(item);
      console.log(`-> Categorized as: Travel & Guides`);
    }
    // Relaxation & Wellness (Wellness Wave content)
    else if (
      channelName.includes('wellness') ||
      channelName.includes('relaxation') ||
      textToAnalyze.match(/\b(wellness|health|meditation|relaxation|stress|mindfulness|yoga|fitness|mental|therapy|healing|calm|peace)\b/)
    ) {
      categories.relaxationWellness.push(item);
      console.log(`-> Categorized as: Relaxation & Wellness`);
    }
    // Documentaries (MindFeed documentaries)
    else if (
      channelName.includes('documentary') ||
      textToAnalyze.match(/\b(documentary|research|study|analysis|investigation|report|case study|in-depth|exploration|examination)\b/)
    ) {
      categories.documentaries.push(item);
      console.log(`-> Categorized as: Documentaries`);
    }
    // Career Development (Career Compass content)
    else if (
      channelName.includes('career') ||
      channelName.includes('compass') ||
      textToAnalyze.match(/\b(career|job|business|professional|startup|leadership|management|interview|resume|skills|workplace|finance|investment)\b/)
    ) {
      categories.careerDevelopment.push(item);
      console.log(`-> Categorized as: Career Development`);
    }
    // How-To & Tutorials (How-To Hub content)
    else if (
      channelName.includes('how-to') ||
      channelName.includes('tutorial') ||
      textToAnalyze.match(/\b(tutorial|how to|diy|guide|tips|step by step|instruction|demonstration|technique|method|process)\b/)
    ) {
      categories.howToTutorials.push(item);
      console.log(`-> Categorized as: How-To & Tutorials`);
    }
    // News & Updates (Campus Pulse content)
    else if (
      channelName.includes('campus') ||
      channelName.includes('pulse') ||
      channelName.includes('news') ||
      textToAnalyze.match(/\b(news|update|announcement|campus|pulse|current events|breaking|latest|press|bulletin)\b/)
    ) {
      categories.newsUpdates.push(item);
      console.log(`-> Categorized as: News & Updates`);
    }
    // Entertainment (StudyBreak content)
    else if (
      channelName.includes('studybreak') ||
      channelName.includes('entertainment') ||
      channelName.includes('quiz') ||
      textToAnalyze.match(/\b(entertainment|gaming|quiz|trivia|fun|games|comedy|music|art|creative|interactive|break|leisure)\b/)
    ) {
      categories.entertainment.push(item);
      console.log(`-> Categorized as: Entertainment`);
    }
    // Academic Content (MindFeed educational content)
    else {
      categories.academicContent.push(item);
      console.log(`-> Categorized as: Academic Content (default)`);
    }
  });

  return categories;
}

async function analyzeContent() {
  try {
    console.log('=== Content Categorization Analysis ===\n');
    
    // Try to read from a local API or use sample data
    console.log('Note: This script shows the categorization logic analysis.');
    console.log('To see actual database data, run this script in an environment with database access.\n');
    
    // Sample data to demonstrate categorization logic
    const sampleContent = [
      {
        id: '1',
        title: 'Career Planning for College Students',
        description: 'A comprehensive guide to career planning',
        category: 'Education',
        genre: 'Professional Development',
        tags: ['career', 'planning', 'students'],
        content_channels: [{ channel: { name: 'Career Compass' } }]
      },
      {
        id: '2',
        title: 'Documentary: Climate Change Research',
        description: 'In-depth analysis of climate change studies',
        category: 'Documentaries',
        genre: 'Science',
        tags: ['documentary', 'climate', 'research'],
        content_channels: [{ channel: { name: 'MindFeed' } }]
      },
      {
        id: '3',
        title: 'How to Cook Pasta',
        description: 'Step by step tutorial for cooking pasta',
        category: 'Tutorials',
        genre: 'Cooking',
        tags: ['cooking', 'tutorial', 'food'],
        content_channels: [{ channel: { name: 'How-To Hub' } }]
      },
      {
        id: '4',
        title: 'Paris Travel Guide',
        description: 'Explore the beautiful city of Paris',
        category: 'Travel',
        genre: 'Guides',
        tags: ['travel', 'paris', 'guide'],
        content_channels: [{ channel: { name: 'RetireWise' } }]
      },
      {
        id: '5',
        title: 'Advanced Mathematics Lecture',
        description: 'University level mathematics course',
        category: 'Education',
        genre: 'Academic',
        tags: ['mathematics', 'lecture', 'academic'],
        content_channels: [{ channel: { name: 'MindFeed' } }]
      }
    ];
    
    console.log('Analyzing sample content with current categorization logic:\n');
    const categorized = categorizeContent(sampleContent);
    
    console.log('\n=== CATEGORIZATION RESULTS ===\n');
    Object.entries(categorized).forEach(([categoryName, items]) => {
      console.log(`${categoryName.toUpperCase()}: ${items.length} items`);
      items.forEach(item => {
        console.log(`  - ${item.title}`);
      });
      console.log('');
    });
    
    console.log('=== OBSERVATIONS ===\n');
    console.log('1. Content categorization is based on:');
    console.log('   - Channel name (primary)');
    console.log('   - Title text analysis');
    console.log('   - Description content');
    console.log('   - Category field');
    console.log('   - Genre field');
    console.log('   - Tags array');
    console.log('');
    
    console.log('2. Common categorization issues:');
    console.log('   - Content without specific channel associations defaults to "Academic Content"');
    console.log('   - Keyword matching might miss variations (e.g., "documentation" vs "documentary")');
    console.log('   - Multiple possible categories for content (e.g., "Career tutorial" could be Career or Tutorial)');
    console.log('');
    
    console.log('3. To improve categorization:');
    console.log('   - Ensure content has proper channel associations');
    console.log('   - Use consistent category/genre values');
    console.log('   - Add more comprehensive keyword matching');
    console.log('   - Consider priority ordering for overlapping categories');
    console.log('');
    
    // Analysis of expected categories based on channel structure
    console.log('=== EXPECTED CHANNEL MAPPINGS ===\n');
    const channelMappings = {
      'Campus Pulse': 'News & Updates',
      'RetireWise': 'Travel & Guides', 
      'MindFeed': 'Documentaries (if documentary keywords) OR Academic Content',
      'Career Compass': 'Career Development',
      'QuizQuest': 'Entertainment',
      'StudyBreak': 'Entertainment',
      'Wellness Wave': 'Relaxation & Wellness',
      'How-To Hub': 'How-To & Tutorials'
    };
    
    Object.entries(channelMappings).forEach(([channel, category]) => {
      console.log(`${channel} -> ${category}`);
    });
    
  } catch (error) {
    console.error('Error analyzing content:', error);
  }
}

// If running directly, execute the analysis
if (require.main === module) {
  analyzeContent();
}

module.exports = { analyzeContent, categorizeContent };