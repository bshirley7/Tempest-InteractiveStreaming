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

export function VODLibrary() {
  const [heroContent, setHeroContent] = useState<VODContent[]>([]);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [justAdded, setJustAdded] = useState<VODContent[]>([]);
  const [trending, setTrending] = useState<VODContent[]>([]);
  const [educational, setEducational] = useState<VODContent[]>([]);
  const [documentaries, setDocumentaries] = useState<VODContent[]>([]);
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

        // Transform content and organize by categories
        const transformedContent = content.map(item => transformContentToVOD(item));
        const transformedAds = adExamples.map(item => transformContentToVOD(item));

        // Set hero content (featured content first, then latest)
        const featuredContent = content
          .filter(item => item.is_featured)
          .slice(0, 3)
          .map(item => transformContentToVOD(item));
        
        const latestContent = transformedContent.slice(0, 2);
        const heroItems = featuredContent.length > 0 ? featuredContent : latestContent;
        setHeroContent(heroItems);

        // Set just added (latest content)
        const justAddedItems = transformedContent.slice(0, 12);
        setJustAdded(justAddedItems);

        // Set trending (most viewed content)
        const trendingItems = [...transformedContent]
          .sort((a, b) => (b.metadata?.views || 0) - (a.metadata?.views || 0))
          .slice(0, 10);
        setTrending(trendingItems);

        // Filter educational content by category/tags
        const educationalItems = transformedContent.filter(item => 
          item.metadata?.tags?.some(tag => 
            ['education', 'learning', 'tutorial', 'lecture', 'course'].includes(tag.toLowerCase())
          ) || ['education', 'science', 'technology', 'mathematics'].includes(item.channel.toLowerCase())
        ).slice(0, 12);
        setEducational(educationalItems.length > 0 ? educationalItems : transformedContent.slice(0, 12));

        // Filter documentaries by category/tags
        const documentaryItems = transformedContent.filter(item =>
          item.metadata?.tags?.some(tag => 
            ['documentary', 'research', 'study', 'analysis'].includes(tag.toLowerCase())
          ) || item.channel.toLowerCase().includes('documentary')
        ).slice(0, 8);
        setDocumentaries(documentaryItems.length > 0 ? documentaryItems : transformedContent.slice(12, 20));

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

  // Empty state
  if (heroContent.length === 0 && justAdded.length === 0) {
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

        {/* Educational Content - Grid */}
        {educational.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Educational Content</h2>
              <p className="text-gray-400">Comprehensive learning materials ({educational.length} videos)</p>
            </div>
            <VODGrid
              content={educational}
              variant="default"
              aspectRatio="16:9"
              columns={{ mobile: 2, tablet: 3, desktop: 4 }}
            />
          </div>
        )}

        {/* Documentaries - Carousel Row */}
        {documentaries.length > 0 && (
          <VODRow
            title="Documentaries & Research"
            subtitle={`In-depth explorations and studies (${documentaries.length} videos)`}
            content={documentaries}
            variant="default"
            aspectRatio="poster"
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