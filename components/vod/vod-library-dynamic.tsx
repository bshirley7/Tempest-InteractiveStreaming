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
    views?: number;
  };
}

interface ContentShelf {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  layout_style: 'row' | 'grid' | 'hero';
  aspect_ratio: '16:9' | 'poster' | 'square';
  max_items: number;
  is_active: boolean;
  content: VideoContent[];
}

// Transform database content to VOD format
function transformContentToVOD(content: VideoContent & { content_channels?: any[] }): VODContent {
  // Extract channel name from the relationship or infer from category/genre
  let channelName = 'General';
  
  if (content.content_channels && content.content_channels.length > 0) {
    channelName = content.content_channels[0].channel?.name || 'General';
  } else if ((content as any).channels?.name) {
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
    description: content.description || `Educational content: ${cleanTitle}`,
    thumbnailUrl: content.thumbnail_url || `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=400&h=225`,
    duration: content.duration || 0,
    channel: channelName,
    metadata: {
      tags: content.tags || [],
      views: content.view_count || Math.floor(Math.random() * 10000) + 1000
    }
  };
}

export function VODLibraryDynamic() {
  const [shelves, setShelves] = useState<ContentShelf[]>([]);
  const [heroShelf, setHeroShelf] = useState<ContentShelf | null>(null);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [adExamples, setAdExamples] = useState<VODContent[]>([]);
  const [showAds, setShowAds] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch content shelves from database
  useEffect(() => {
    const fetchShelves = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch shelves with content
        const shelvesResponse = await fetch('/api/content-shelves?include_content=true');
        
        if (!shelvesResponse.ok) {
          throw new Error(`Failed to fetch shelves: ${shelvesResponse.statusText}`);
        }

        const shelvesResult = await shelvesResponse.json();
        
        if (!shelvesResult.success) {
          throw new Error(shelvesResult.error || 'Failed to fetch shelves');
        }

        const allShelves: ContentShelf[] = shelvesResult.data || [];
        
        // Find hero shelf (layout_style === 'hero') or use first shelf with content
        const heroShelfData = allShelves.find(shelf => 
          shelf.layout_style === 'hero' && shelf.content && shelf.content.length > 0
        ) || allShelves.find(shelf => shelf.content && shelf.content.length > 0);
        
        if (heroShelfData) {
          setHeroShelf(heroShelfData);
        }

        // Set non-hero shelves
        const regularShelves = allShelves.filter(shelf => 
          shelf.layout_style !== 'hero' && shelf.content && shelf.content.length > 0
        );
        setShelves(regularShelves);

        // Fetch ad examples separately
        const adResponse = await fetch('/api/content?status=published&content_type=advertisement&limit=50');
        if (adResponse.ok) {
          const adResult = await adResponse.json();
          if (adResult.success && adResult.data) {
            const transformedAds = adResult.data.map((item: VideoContent) => transformContentToVOD(item));
            setAdExamples(transformedAds);
          }
        }

        if (allShelves.length === 0) {
          setError('No content shelves configured. Please use the admin panel to create content shelves.');
          return;
        }

      } catch (err) {
        console.error('Error fetching shelves:', err);
        setError(err instanceof Error ? err.message : 'Failed to load content shelves');
      } finally {
        setLoading(false);
      }
    };

    fetchShelves();
  }, []);

  // Auto-rotate hero content
  useEffect(() => {
    if (!heroShelf || !heroShelf.content || heroShelf.content.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroShelf.content.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [heroShelf]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-brand-purple mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading Content Library</h2>
          <p className="text-muted-foreground">Fetching your custom content shelves...</p>
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
          <div className="space-x-3">
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-brand-gradient hover:shadow-glow-brand"
            >
              Try Again
            </Button>
            <Link href="/admin">
              <Button variant="outline">
                Go to Admin Panel
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Check if we have any content
  const hasAnyContent = heroShelf?.content?.length > 0 || shelves.some(shelf => shelf.content?.length > 0);

  // Empty state
  if (!hasAnyContent) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <Play className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Content Available</h2>
          <p className="text-muted-foreground mb-4">
            No content has been assigned to your shelves yet. Please use the admin panel to organize your content.
          </p>
          <div className="space-x-3">
            <Button 
              onClick={() => window.location.reload()} 
              className="bg-brand-gradient hover:shadow-glow-brand"
            >
              Refresh
            </Button>
            <Link href="/admin">
              <Button variant="outline">
                Manage Content Shelves
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentHero = heroShelf?.content?.[currentHeroIndex];

  return (
    <div className="min-h-screen text-white">
      {/* Hero Section */}
      {currentHero && (
        <VODCard
          content={transformContentToVOD(currentHero)}
          variant="hero"
          className="mb-8"
        />
      )}

      {/* Dynamic Content Shelves */}
      <div className="container mx-auto px-4 py-8">
        {shelves.map((shelf) => {
          const transformedContent = shelf.content.map(item => transformContentToVOD(item));
          
          if (transformedContent.length === 0) return null;

          // Render based on layout style
          if (shelf.layout_style === 'grid') {
            return (
              <div key={shelf.id} className="mb-12">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">{shelf.name}</h2>
                  {shelf.description && (
                    <p className="text-gray-400">{shelf.description} ({transformedContent.length} videos)</p>
                  )}
                </div>
                <VODGrid
                  content={transformedContent}
                  variant="default"
                  aspectRatio={shelf.aspect_ratio}
                  columns={{ mobile: 2, tablet: 3, desktop: 4 }}
                />
              </div>
            );
          }

          // Default to row layout
          return (
            <VODRow
              key={shelf.id}
              title={shelf.name}
              subtitle={shelf.description ? `${shelf.description} (${transformedContent.length} videos)` : `${transformedContent.length} videos`}
              content={transformedContent}
              variant="default"
              aspectRatio={shelf.aspect_ratio}
              className="mb-12"
            />
          );
        })}

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