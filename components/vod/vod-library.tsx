'use client';

import { useState, useEffect } from 'react';
import { VODCard } from './vod-card';
import { VODGrid } from './vod-grid';
import { VODRow } from './vod-row';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, Info, AlertCircle, Loader2 } from 'lucide-react';
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
function transformContentToVOD(content: VideoContent & { channels?: any }): VODContent {
  // Extract channel name from the relationship or infer from category/genre
  const channelName = content.channels?.name || 
                     content.category || 
                     content.genre || 
                     'General';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch content from database
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all published content
        const response = await fetch('/api/content?status=published&limit=200');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch content: ${response.statusText}`);
        }

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch content');
        }

        const content: VideoContent[] = result.data || [];
        
        if (content.length === 0) {
          setError('No published content available. Please check if content has been synced and published.');
          return;
        }

        // Transform content and organize by categories
        const transformedContent = content.map(item => transformContentToVOD(item));

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

        {/* Debug info in development */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 p-4 bg-gray-900 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-400 mb-2">Debug Info</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500">
              <div>Hero: {heroContent.length}</div>
              <div>Just Added: {justAdded.length}</div>
              <div>Trending: {trending.length}</div>
              <div>Educational: {educational.length}</div>
              <div>Documentaries: {documentaries.length}</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-black border-t border-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src="/icon.svg" 
                alt="Tempest" 
                className="h-8 w-8"
              />
              <span className="text-white text-lg font-bold">Tempest University</span>
            </div>
            <div className="text-gray-400 text-sm">
              curated by University Partners
            </div>
          </div>
          
          <div className="mt-6 text-center text-gray-500 text-sm">
            © 2024 Tempest University. All rights reserved.
          </div>
          
          <div className="mt-4 flex justify-center space-x-6 text-gray-400 text-sm">
            <a href="#" className="hover:text-white">Audio Description</a>
            <a href="#" className="hover:text-white">Do Not Sell or Share My Personal Information</a>
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Help</a>
            <a href="#" className="hover:text-white">Devices</a>
          </div>
        </div>
      </footer>
    </div>
  );
}