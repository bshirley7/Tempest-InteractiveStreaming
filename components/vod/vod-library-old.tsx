'use client';

import { useState, useEffect } from 'react';
import { VODCard } from './vod-card';
import { VODGrid } from './vod-grid';
import { VODRow } from './vod-row';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Info, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { VideoContent } from '@/lib/types';

interface VODContent {
  _id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number;
  channel: string;
  metadata?: {
    tags?: string[];
    rating?: number;
    views?: number;
  };
}

// Transform database content to VOD format
function transformContentToVOD(content: VideoContent & { content_channels?: any[] }): VODContent {
  // Extract channel name from the relationship or infer from category/genre
  // Handle both old format (channels) and new format (content_channels array)
  let channelName = 'General';
  
  if (content.content_channels && content.content_channels.length > 0) {
    // New format: array of channel relationships
    channelName = content.content_channels[0].channel?.name || 'General';
  } else if ((content as any).channels?.name) {
    // Old format: direct channel relationship
    channelName = (content as any).channels.name;
  } else if (content.category) {
    channelName = content.category;
  } else if (content.genre) {
    channelName = content.genre;
  }

  // Clean up the title by removing file extensions and common patterns
  const cleanTitle = content.title
    .replace(/\.(mp4|avi|mov|mkv|webm)$/i, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    _id: content.id,
    title: cleanTitle,
    description: content.description || generateDescription(cleanTitle),
    thumbnailUrl: content.thumbnail_url || `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&h=225`,
    duration: content.duration || 0,
    channel: channelName,
    metadata: {
      tags: content.tags || inferTags(cleanTitle),
      rating: 4.5, // Default rating since we don't have ratings in DB yet
      views: content.view_count || Math.floor(Math.random() * 10000) + 1000 // Random views for demo
    }
  };
}

// Helper function to generate description from title
function generateDescription(title: string): string {
  const descriptions = [
    `Learn about ${title.toLowerCase()} in this comprehensive educational video.`,
    `Explore ${title.toLowerCase()} with expert insights and practical examples.`,
    `Discover key concepts and applications in ${title.toLowerCase()}.`,
    `In-depth analysis and discussion on ${title.toLowerCase()}.`,
    `Educational content covering ${title.toLowerCase()} fundamentals and advanced topics.`
  ];
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

// Helper function to infer tags from title
function inferTags(title: string): string[] {
  const lowerTitle = title.toLowerCase();
  const tagMap: Record<string, string[]> = {
    'career': ['career', 'professional development', 'advice'],
    'financial': ['finance', 'money', 'investment'],
    'modelling': ['modeling', 'analysis', 'data'],
    'interview': ['interview', 'tips', 'preparation'],
    'advice': ['advice', 'tips', 'guidance'],
    'motivation': ['motivation', 'inspiration', 'mindset'],
    'job': ['employment', 'career', 'work'],
    'decision': ['decision making', 'psychology', 'choices'],
    'regret': ['psychology', 'decision making', 'mindset'],
    'cfa': ['finance', 'certification', 'professional'],
    'wall street': ['finance', 'investment', 'banking']
  };

  const inferredTags: string[] = [];
  Object.entries(tagMap).forEach(([keyword, tags]) => {
    if (lowerTitle.includes(keyword)) {
      inferredTags.push(...tags);
    }
  });

  return inferredTags.length > 0 ? [...new Set(inferredTags)] : ['education', 'learning'];
}

// Helper function to categorize content based on channels, categories, and keywords
function categorizeContent(content: VideoContent[]): Record<string, VODContent[]> {
  const transformedContent = content.map(item => transformContentToVOD(item));
  
  const categories = {
    travelGuides: [] as VODContent[],
    relaxationWellness: [] as VODContent[],
    documentaries: [] as VODContent[],
    careerDevelopment: [] as VODContent[],
    howToTutorials: [] as VODContent[],
    academicContent: [] as VODContent[],
    newsUpdates: [] as VODContent[],
    entertainment: [] as VODContent[]
  };

  transformedContent.forEach(item => {
    const title = item.title.toLowerCase();
    const description = item.description.toLowerCase();
    const channel = item.channel.toLowerCase();
    const tags = item.metadata?.tags?.map(tag => tag.toLowerCase()) || [];
    const textToAnalyze = `${title} ${description} ${channel} ${tags.join(' ')}`;

    // Travel & Guides (RetireWise channel content)
    if (
      channel.includes('retirewise') ||
      channel.includes('guides') ||
      textToAnalyze.match(/\b(travel|trip|guide|city|country|vacation|destination|journey|explore|visit|tourism|adventure|culture|international)\b/)
    ) {
      categories.travelGuides.push(item);
    }
    // Relaxation & Wellness (Wellness Wave content)
    else if (
      channel.includes('wellness') ||
      channel.includes('relaxation') ||
      textToAnalyze.match(/\b(wellness|health|meditation|relaxation|stress|mindfulness|yoga|fitness|mental|therapy|healing|calm|peace)\b/)
    ) {
      categories.relaxationWellness.push(item);
    }
    // Documentaries (MindFeed documentaries)
    else if (
      channel.includes('documentary') ||
      textToAnalyze.match(/\b(documentary|research|study|analysis|investigation|report|case study|in-depth|exploration|examination)\b/)
    ) {
      categories.documentaries.push(item);
    }
    // Career Development (Career Compass content)
    else if (
      channel.includes('career') ||
      channel.includes('compass') ||
      textToAnalyze.match(/\b(career|job|business|professional|startup|leadership|management|interview|resume|skills|workplace|finance|investment)\b/)
    ) {
      categories.careerDevelopment.push(item);
    }
    // How-To & Tutorials (How-To Hub content)
    else if (
      channel.includes('how-to') ||
      channel.includes('tutorial') ||
      textToAnalyze.match(/\b(tutorial|how to|diy|guide|tips|step by step|instruction|demonstration|technique|method|process)\b/)
    ) {
      categories.howToTutorials.push(item);
    }
    // News & Updates (Campus Pulse content)
    else if (
      channel.includes('campus') ||
      channel.includes('pulse') ||
      channel.includes('news') ||
      textToAnalyze.match(/\b(news|update|announcement|campus|pulse|current events|breaking|latest|press|bulletin)\b/)
    ) {
      categories.newsUpdates.push(item);
    }
    // Entertainment (StudyBreak content)
    else if (
      channel.includes('studybreak') ||
      channel.includes('entertainment') ||
      channel.includes('quiz') ||
      textToAnalyze.match(/\b(entertainment|gaming|quiz|trivia|fun|games|comedy|music|art|creative|interactive|break|leisure)\b/)
    ) {
      categories.entertainment.push(item);
    }
    // Academic Content (MindFeed educational content)
    else {
      categories.academicContent.push(item);
    }
  });

  return categories;
}

export function VODLibrary() {
  const [heroContent, setHeroContent] = useState<VODContent[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [justAdded, setJustAdded] = useState<VODContent[]>([]);
  const [trending, setTrending] = useState<VODContent[]>([]);
  
  // Organized content categories
  const [travelGuides, setTravelGuides] = useState<VODContent[]>([]);
  const [relaxationWellness, setRelaxationWellness] = useState<VODContent[]>([]);
  const [documentaries, setDocumentaries] = useState<VODContent[]>([]);
  const [careerDevelopment, setCareerDevelopment] = useState<VODContent[]>([]);
  const [howToTutorials, setHowToTutorials] = useState<VODContent[]>([]);
  const [academicContent, setAcademicContent] = useState<VODContent[]>([]);
  const [newsUpdates, setNewsUpdates] = useState<VODContent[]>([]);
  const [entertainment, setEntertainment] = useState<VODContent[]>([]);
  
  const [adExamples, setAdExamples] = useState<VODContent[]>([]);
  const [showAds, setShowAds] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch content from database
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch published content (educational videos only by default)
        const contentResponse = await fetch('/api/content?status=published&content_type=content&limit=200');
        
        if (!contentResponse.ok) {
          throw new Error(`Failed to fetch content: ${contentResponse.statusText}`);
        }

        const contentResult = await contentResponse.json();
        
        if (!contentResult.success) {
          throw new Error(contentResult.error || 'Failed to fetch content');
        }

        const content: VideoContent[] = contentResult.data || [];
        
        // Also fetch ad examples for showcase
        const adResponse = await fetch('/api/content?status=published&content_type=advertisement&limit=50');
        let adExamples: VideoContent[] = [];
        
        if (adResponse.ok) {
          const adResult = await adResponse.json();
          if (adResult.success) {
            adExamples = adResult.data || [];
          }
        }
        
        if (content.length === 0 && adExamples.length === 0) {
          setError('No published content available. Please check if content has been synced and published.');
          return;
        }

        // Categorize content using the new system
        const categorizedContent = categorizeContent(content);
        const transformedAds = adExamples.map(item => transformContentToVOD(item));

        // Set hero content (featured content first, then latest)
        const featuredContent = content
          .filter(item => item.is_featured)
          .slice(0, 3)
          .map(item => transformContentToVOD(item));
        
        const allTransformed = content.map(item => transformContentToVOD(item));
        const latestContent = allTransformed.slice(0, 2);
        const heroItems = featuredContent.length > 0 ? featuredContent : latestContent;
        setHeroContent(heroItems);

        // Set just added (latest content across all categories)
        const justAddedItems = allTransformed.slice(0, 12);
        setJustAdded(justAddedItems);

        // Set trending (most viewed content across all categories)
        const trendingItems = [...allTransformed]
          .sort((a, b) => (b.metadata?.views || 0) - (a.metadata?.views || 0))
          .slice(0, 10);
        setTrending(trendingItems);

        // Set categorized content
        setTravelGuides(categorizedContent.travelGuides.slice(0, 12));
        setRelaxationWellness(categorizedContent.relaxationWellness.slice(0, 12));
        setDocumentaries(categorizedContent.documentaries.slice(0, 12));
        setCareerDevelopment(categorizedContent.careerDevelopment.slice(0, 12));
        setHowToTutorials(categorizedContent.howToTutorials.slice(0, 12));
        setAcademicContent(categorizedContent.academicContent.slice(0, 12));
        setNewsUpdates(categorizedContent.newsUpdates.slice(0, 8));
        setEntertainment(categorizedContent.entertainment.slice(0, 10));

        // Set ad examples for showcase
        setAdExamples(transformedAds);

      } catch (err) {
        console.error('Error fetching content:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content');
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  // Auto-rotate hero content
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroContent.length);
    }, 8000);
    return () => clearInterval(interval);
  }, [heroContent.length]);

  const currentHero = heroContent[currentHeroIndex];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand-purple mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading Content Library</h2>
          <p className="text-muted-foreground">Fetching the latest videos from our database...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Content Unavailable</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-brand-gradient hover:shadow-glow-brand"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Check if we have any content at all
  const hasAnyContent = heroContent.length > 0 || justAdded.length > 0 || 
    travelGuides.length > 0 || relaxationWellness.length > 0 || 
    documentaries.length > 0 || careerDevelopment.length > 0 || 
    howToTutorials.length > 0 || academicContent.length > 0 || 
    newsUpdates.length > 0 || entertainment.length > 0;

  // Empty state
  if (!hasAnyContent) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Content Available</h2>
          <p className="text-muted-foreground mb-4">
            The content library is empty. Please check back later or contact your administrator.
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-brand-gradient hover:shadow-glow-brand"
          >
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white">
      {/* Hero Section */}
      {currentHero && (
        <VODCard
          content={currentHero}
          variant="hero"
          className="mb-8"
        />
      )}

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-8">
        {/* Just Added - 16:9 Row */}
        {justAdded.length > 0 && (
          <VODRow
            title="Just Added"
            subtitle={`Latest content from our database (${justAdded.length} videos)`}
            content={justAdded}
            variant="large"
            aspectRatio="16:9"
            className="mb-12"
          />
        )}

        {/* Trending - 16:9 Format Row */}
        {trending.length > 0 && (
          <VODRow
            title="Trending Now"
            subtitle={`Most viewed content (${trending.length} videos)`}
            content={trending}
            variant="default"
            aspectRatio="16:9"
            className="mb-12"
          />
        )}

        {/* Travel & Guides */}
        {travelGuides.length > 0 && (
          <VODRow
            title="Travel & Guides"
            subtitle={`Explore destinations and travel tips (${travelGuides.length} videos)`}
            content={travelGuides}
            variant="default"
            aspectRatio="16:9"
            className="mb-12"
          />
        )}

        {/* Relaxation & Wellness */}
        {relaxationWellness.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Relaxation & Wellness</h2>
              <p className="text-gray-400">Health, mindfulness, and well-being content ({relaxationWellness.length} videos)</p>
            </div>
            <VODGrid
              content={relaxationWellness}
              variant="default"
              aspectRatio="16:9"
              columns={{ mobile: 2, tablet: 3, desktop: 4 }}
            />
          </div>
        )}

        {/* Documentaries */}
        {documentaries.length > 0 && (
          <VODRow
            title="Documentaries"
            subtitle={`In-depth research and investigations (${documentaries.length} videos)`}
            content={documentaries}
            variant="default"
            aspectRatio="poster"
            className="mb-12"
          />
        )}

        {/* Career Development */}
        {careerDevelopment.length > 0 && (
          <VODRow
            title="Career Development"
            subtitle={`Professional growth and business insights (${careerDevelopment.length} videos)`}
            content={careerDevelopment}
            variant="default"
            aspectRatio="16:9"
            className="mb-12"
          />
        )}

        {/* How-To & Tutorials */}
        {howToTutorials.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">How-To & Tutorials</h2>
              <p className="text-gray-400">Step-by-step guides and instructional content ({howToTutorials.length} videos)</p>
            </div>
            <VODGrid
              content={howToTutorials}
              variant="default"
              aspectRatio="16:9"
              columns={{ mobile: 2, tablet: 3, desktop: 4 }}
            />
          </div>
        )}

        {/* Academic Content */}
        {academicContent.length > 0 && (
          <VODRow
            title="Academic Content"
            subtitle={`Educational lectures and scholarly material (${academicContent.length} videos)`}
            content={academicContent}
            variant="default"
            aspectRatio="16:9"
            className="mb-12"
          />
        )}

        {/* News & Updates */}
        {newsUpdates.length > 0 && (
          <VODRow
            title="News & Updates"
            subtitle={`Latest campus news and announcements (${newsUpdates.length} videos)`}
            content={newsUpdates}
            variant="default"
            aspectRatio="16:9"
            className="mb-12"
          />
        )}

        {/* Entertainment */}
        {entertainment.length > 0 && (
          <VODRow
            title="Entertainment"
            subtitle={`Fun content, games, and interactive experiences (${entertainment.length} videos)`}
            content={entertainment}
            variant="default"
            aspectRatio="16:9"
            className="mb-12"
          />
        )}

        {/* Ad Examples Toggle Section */}
        {adExamples.length > 0 && (
          <div className="mb-12">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">Advertisement Examples</h2>
                <p className="text-gray-400">Showcase of our advertising content ({adExamples.length} examples)</p>
              </div>
              <Button
                onClick={() => setShowAds(!showAds)}
                variant="outline"
                className="border-brand-purple/50 text-white bg-black/30 backdrop-blur-sm hover:bg-brand-gradient hover:border-transparent hover:shadow-glow-purple transition-all duration-300"
              >
                {showAds ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Hide Examples
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Show Examples
                  </>
                )}
              </Button>
            </div>
            
            {showAds && (
              <div className="bg-gradient-to-br from-brand-purple/10 to-brand-indigo/10 backdrop-blur-sm rounded-xl p-6 border border-brand-purple/20">
                <div className="mb-4">
                  <Badge className="bg-brand-gradient text-white border-none px-3 py-1">
                    Advertisement Showcase
                  </Badge>
                </div>
                <VODGrid
                  content={adExamples}
                  variant="default"
                  aspectRatio="16:9"
                  columns={{ mobile: 2, tablet: 3, desktop: 4 }}
                />
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}