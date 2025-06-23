# Step 18: Create TV Guide Components

## Context
You are building Tempest, an interactive streaming platform. This step creates the TV Guide interface components that display channels, current programming, and allow users to navigate to live streaming content with precise Tailwind CSS styling and shadcn/ui integration.

## Purpose
The TV Guide is the primary interface for content discovery, showing live channels with current programming, thumbnails, viewer counts, and interactive elements. Components must be responsive, performant, and visually engaging.

## Prerequisites
- Step 17 completed successfully
- Core UI components created
- Custom hooks for channels and videos implemented
- shadcn/ui components installed

## Task Instructions
Complete each task in order and mark as ✅ when finished:

### Task 1: Create Channel Card Component ⏳
Create an individual channel card displaying current programming and channel information.

**File to Create:** `components/tv-guide/ChannelCard.tsx`

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Users, 
  Clock, 
  Heart, 
  Star,
  Volume2,
  VolumeX 
} from 'lucide-react';
import { useViewerCount } from '@/lib/hooks/useAnalytics';
import { formatDuration, formatNumber } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Channel, Video } from '@/lib/types';

interface ChannelCardProps {
  channel: Channel;
  currentVideo?: Video | null;
  className?: string;
  variant?: 'default' | 'compact' | 'featured';
  showPreview?: boolean;
}

export function ChannelCard({
  channel,
  currentVideo,
  className,
  variant = 'default',
  showPreview = false
}: ChannelCardProps) {
  const [isPreviewMuted, setIsPreviewMuted] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const { viewerCount } = useViewerCount(currentVideo?.id || '');

  const channelColorClass = `channel-${channel.slug}`;
  
  // Calculate progress for current video (mock for now)
  const mockProgress = currentVideo ? Math.floor(Math.random() * 80) + 10 : 0;

  const cardSizeClasses = {
    default: 'w-full',
    compact: 'w-full max-w-sm',
    featured: 'w-full max-w-lg'
  };

  const thumbnailAspectClasses = {
    default: 'aspect-video',
    compact: 'aspect-[4/3]',
    featured: 'aspect-[21/9]'
  };

  return (
    <Card 
      className={cn(
        'tv-guide-card group cursor-pointer overflow-hidden',
        cardSizeClasses[variant],
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Channel Header */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {/* Channel Logo */}
            <div className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm',
              channelColorClass
            )}>
              {channel.logo_url ? (
                <Image
                  src={channel.logo_url}
                  alt={channel.name}
                  width={40}
                  height={40}
                  className="rounded-lg object-cover"
                />
              ) : (
                channel.name.substring(0, 2).toUpperCase()
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold truncate">
                {channel.name}
              </CardTitle>
              <CardDescription className="text-xs truncate">
                {channel.description}
              </CardDescription>
            </div>
          </div>
          
          {/* Live Indicator */}
          <Badge 
            variant="destructive" 
            className="animate-pulse text-xs"
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full mr-1"></div>
            LIVE
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Video Thumbnail/Preview */}
        <div className="relative group/video">
          <div className={cn(
            'relative bg-muted overflow-hidden',
            thumbnailAspectClasses[variant]
          )}>
            {currentVideo ? (
              <>
                <Image
                  src={currentVideo.thumbnail_url || '/api/placeholder/640/360'}
                  alt={currentVideo.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover/video:scale-105"
                />
                
                {/* Video Preview Controls (when hovered) */}
                <div className={cn(
                  'absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 transition-opacity duration-200',
                  isHovered && 'opacity-100'
                )}>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border-white/20"
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Watch
                    </Button>
                    
                    {showPreview && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsPreviewMuted(!isPreviewMuted);
                        }}
                        className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white"
                      >
                        {isPreviewMuted ? (
                          <VolumeX className="w-4 h-4" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Video Progress Bar */}
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <Progress 
                    value={mockProgress} 
                    className="h-1 bg-black/20"
                  />
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="text-center space-y-2">
                  <div className={cn(
                    'w-12 h-12 mx-auto rounded-lg flex items-center justify-center text-white',
                    channelColorClass
                  )}>
                    <Play className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No content scheduled
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Video Information */}
        {currentVideo && (
          <div className="p-4 space-y-3">
            <div className="space-y-1">
              <h3 className="font-medium text-sm line-clamp-2 leading-tight">
                {currentVideo.title}
              </h3>
              {currentVideo.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {currentVideo.description}
                </p>
              )}
            </div>

            {/* Video Stats */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {formatNumber(viewerCount)} watching
                  </span>
                </div>
                
                {currentVideo.duration && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {formatDuration(currentVideo.duration)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                <span className="text-muted-foreground">4.8</span>
              </div>
            </div>

            {/* Tags */}
            {currentVideo.tags && currentVideo.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {currentVideo.tags.slice(0, 3).map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="text-xs px-2 py-0"
                  >
                    {tag}
                  </Badge>
                ))}
                {currentVideo.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    +{currentVideo.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Quick Actions */}
      <div className={cn(
        'absolute top-2 right-2 opacity-0 transition-opacity duration-200',
        isHovered && 'opacity-100'
      )}>
        <div className="flex space-x-1">
          <Button
            size="sm"
            variant="ghost"
            className="w-8 h-8 p-0 bg-black/20 hover:bg-black/30 backdrop-blur-sm text-white"
          >
            <Heart className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Link Wrapper */}
      <Link 
        href={`/watch?channel=${channel.slug}`}
        className="absolute inset-0 z-10"
      >
        <span className="sr-only">
          Watch {channel.name} - {currentVideo?.title || 'Live Stream'}
        </span>
      </Link>
    </Card>
  );
}
```

**Verification:** 
- ChannelCard component created with all interactive elements
- Proper Tailwind CSS classes for responsive design
- shadcn/ui components integrated (Card, Badge, Button, Progress)
- Real-time viewer count integration
- Channel color theming with CSS variables

### Task 2: Create TV Guide Grid Component ⏳
Create the main TV Guide layout that displays all channels in a responsive grid.

**File to Create:** `components/tv-guide/TVGuide.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Shuffle,
  TrendingUp,
  Clock,
  Users
} from 'lucide-react';
import { ChannelCard } from './ChannelCard';
import { ChannelCardSkeleton } from '@/components/ui/loading';
import { ErrorDisplay } from '@/components/ErrorBoundary';
import { useChannels } from '@/lib/hooks/useChannels';
import { useVideos } from '@/lib/hooks/useVideos';
import { cn } from '@/lib/utils/cn';
import type { Channel, Video } from '@/lib/types';

interface TVGuideProps {
  className?: string;
  defaultView?: 'grid' | 'list';
  showFilters?: boolean;
}

export function TVGuide({ 
  className, 
  defaultView = 'grid',
  showFilters = true 
}: TVGuideProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(defaultView);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'viewers' | 'trending'>('name');
  
  const { channels, loading: channelsLoading, error: channelsError } = useChannels();
  const { videos } = useVideos({ featured: true, limit: 20 });

  // Mock current videos for each channel (in real app, this would come from schedule)
  const [currentVideos, setCurrentVideos] = useState<Record<string, Video>>({});

  useEffect(() => {
    // Simulate current video assignment
    if (channels.length > 0 && videos.length > 0) {
      const videoMap: Record<string, Video> = {};
      channels.forEach((channel, index) => {
        if (videos[index % videos.length]) {
          videoMap[channel.id] = videos[index % videos.length];
        }
      });
      setCurrentVideos(videoMap);
    }
  }, [channels, videos]);

  // Filter and sort channels
  const filteredChannels = channels.filter(channel => {
    const matchesSearch = channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         channel.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || channel.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedChannels = [...filteredChannels].sort((a, b) => {
    switch (sortBy) {
      case 'viewers':
        // Mock viewer counts for sorting
        return Math.random() - 0.5;
      case 'trending':
        return Math.random() - 0.5;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const categories = [
    { value: 'all', label: 'All Channels', count: channels.length },
    { value: 'education', label: 'Education', count: channels.filter(c => c.category === 'education').length },
    { value: 'entertainment', label: 'Entertainment', count: channels.filter(c => c.category === 'entertainment').length },
    { value: 'lifestyle', label: 'Lifestyle', count: channels.filter(c => c.category === 'lifestyle').length },
  ];

  const gridClasses = {
    grid: 'tv-guide-grid',
    list: 'flex flex-col space-y-4'
  };

  if (channelsError) {
    return (
      <div className={className}>
        <ErrorDisplay 
          error={channelsError}
          retry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Live Channels</h1>
            <p className="text-muted-foreground">
              Discover live educational content and interactive streams
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{channels.length} Live</span>
            </Badge>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            >
              {viewMode === 'grid' ? (
                <>
                  <List className="w-4 h-4 mr-2" />
                  List View
                </>
              ) : (
                <>
                  <Grid className="w-4 h-4 mr-2" />
                  Grid View
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        {showFilters && (
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search channels and content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex space-x-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{category.label}</span>
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {category.count}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">
                    <div className="flex items-center space-x-2">
                      <span>Name</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewers">
                    <div className="flex items-center space-x-2">
                      <Users className="w-3 h-3" />
                      <span>Viewers</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="trending">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-3 h-3" />
                      <span>Trending</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Featured Section */}
      <Tabs defaultValue="live" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3 lg:w-96">
          <TabsTrigger value="live" className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Live Now</span>
          </TabsTrigger>
          <TabsTrigger value="trending" className="flex items-center space-x-2">
            <TrendingUp className="w-4 h-4" />
            <span>Trending</span>
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>Coming Up</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          {/* Quick Actions */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <Button variant="outline" size="sm" className="flex-shrink-0">
              <Shuffle className="w-4 h-4 mr-2" />
              Random Channel
            </Button>
            <Button variant="outline" size="sm" className="flex-shrink-0">
              Most Popular
            </Button>
            <Button variant="outline" size="sm" className="flex-shrink-0">
              Recently Added
            </Button>
          </div>

          {/* Channels Grid */}
          {channelsLoading ? (
            <div className={gridClasses[viewMode]}>
              {Array.from({ length: 8 }).map((_, i) => (
                <ChannelCardSkeleton key={i} />
              ))}
            </div>
          ) : sortedChannels.length > 0 ? (
            <div className={gridClasses[viewMode]}>
              {sortedChannels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  currentVideo={currentVideos[channel.id]}
                  variant={viewMode === 'list' ? 'compact' : 'default'}
                  showPreview={true}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No channels found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <div className="text-center py-12">
            <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Trending Content</h3>
            <p className="text-muted-foreground">
              Trending channels and content will appear here
            </p>
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <div className="text-center py-12">
            <Clock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Coming Up</h3>
            <p className="text-muted-foreground">
              Scheduled programming will appear here
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

**Verification:** 
- TVGuide component created with responsive grid layout
- Search and filtering functionality implemented
- shadcn/ui Tabs, Select, and Input components used
- Multiple view modes (grid/list) supported
- Loading states and error handling included

### Task 3: Create Live Indicator Component ⏳
Create a reusable live status indicator with animation and viewer count.

**File to Create:** `components/tv-guide/LiveIndicator.tsx`

```typescript
'use client';

import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, Radio } from 'lucide-react';
import { formatNumber } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface LiveIndicatorProps {
  isLive: boolean;
  viewerCount?: number;
  className?: string;
  variant?: 'default' | 'compact' | 'minimal';
  showViewers?: boolean;
}

export function LiveIndicator({
  isLive,
  viewerCount = 0,
  className,
  variant = 'default',
  showViewers = true
}: LiveIndicatorProps) {
  if (!isLive) {
    return (
      <Badge variant="secondary" className={cn('text-xs', className)}>
        Offline
      </Badge>
    );
  }

  const sizeClasses = {
    default: 'text-xs px-2 py-1',
    compact: 'text-xs px-1.5 py-0.5',
    minimal: 'text-xs px-1 py-0.5'
  };

  const dotSizes = {
    default: 'w-2 h-2',
    compact: 'w-1.5 h-1.5',
    minimal: 'w-1 h-1'
  };

  if (variant === 'minimal') {
    return (
      <div className={cn('flex items-center space-x-1', className)}>
        <div className={cn(
          'bg-red-500 rounded-full animate-pulse',
          dotSizes[variant]
        )}></div>
        <span className="text-xs font-medium text-red-600 dark:text-red-400">
          LIVE
        </span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn('flex items-center space-x-2', className)}>
        {/* Live Badge */}
        <Tooltip>
          <TooltipTrigger>
            <Badge 
              variant="destructive" 
              className={cn(
                'animate-pulse flex items-center space-x-1',
                sizeClasses[variant]
              )}
            >
              <div className={cn(
                'bg-white rounded-full',
                dotSizes[variant]
              )}></div>
              <span className="font-medium">LIVE</span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="flex items-center space-x-2">
              <Radio className="w-4 h-4" />
              <span>Broadcasting live</span>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Viewer Count */}
        {showViewers && viewerCount > 0 && (
          <Tooltip>
            <TooltipTrigger>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span className="font-medium">
                  {formatNumber(viewerCount)}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <span>{viewerCount.toLocaleString()} viewers watching</span>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}

// Specialized component for floating live indicator
interface FloatingLiveIndicatorProps {
  isLive: boolean;
  viewerCount?: number;
  className?: string;
}

export function FloatingLiveIndicator({
  isLive,
  viewerCount,
  className
}: FloatingLiveIndicatorProps) {
  if (!isLive) return null;

  return (
    <div className={cn(
      'absolute top-2 left-2 z-10 flex items-center space-x-2',
      className
    )}>
      <div className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
        <span className="text-white text-xs font-medium">LIVE</span>
      </div>
      
      {viewerCount && viewerCount > 0 && (
        <div className="bg-black/60 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
          <Users className="w-3 h-3 text-white" />
          <span className="text-white text-xs font-medium">
            {formatNumber(viewerCount)}
          </span>
        </div>
      )}
    </div>
  );
}

// Component for stream status in different states
interface StreamStatusProps {
  status: 'live' | 'scheduled' | 'ended' | 'offline';
  scheduledTime?: Date;
  viewerCount?: number;
  className?: string;
}

export function StreamStatus({
  status,
  scheduledTime,
  viewerCount,
  className
}: StreamStatusProps) {
  const statusConfig = {
    live: {
      badge: (
        <Badge variant="destructive" className="animate-pulse">
          <div className="w-2 h-2 bg-white rounded-full mr-1"></div>
          LIVE
        </Badge>
      ),
      color: 'text-red-600'
    },
    scheduled: {
      badge: (
        <Badge variant="secondary">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
          SCHEDULED
        </Badge>
      ),
      color: 'text-blue-600'
    },
    ended: {
      badge: (
        <Badge variant="outline">
          <div className="w-2 h-2 bg-gray-400 rounded-full mr-1"></div>
          ENDED
        </Badge>
      ),
      color: 'text-gray-600'
    },
    offline: {
      badge: (
        <Badge variant="secondary">
          OFFLINE
        </Badge>
      ),
      color: 'text-gray-600'
    }
  };

  const config = statusConfig[status];

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {config.badge}
      
      {status === 'live' && viewerCount && viewerCount > 0 && (
        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
          <Users className="w-3 h-3" />
          <span>{formatNumber(viewerCount)} watching</span>
        </div>
      )}
      
      {status === 'scheduled' && scheduledTime && (
        <div className="text-xs text-muted-foreground">
          Starts {scheduledTime.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      )}
    </div>
  );
}
```

**Verification:** 
- LiveIndicator components created with multiple variants
- Animation using Tailwind animate-pulse class
- shadcn/ui Tooltip and Badge components used
- Viewer count formatting with utility function
- Accessibility support with proper ARIA labels

### Task 4: Create Schedule Timeline Component ⏳
Create a horizontal timeline showing current and upcoming programming.

**File to Create:** `components/tv-guide/ScheduleTimeline.tsx`

```typescript
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Play,
  Calendar
} from 'lucide-react';
import { LiveIndicator } from './LiveIndicator';
import { formatRelativeTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Video, Schedule } from '@/lib/types';

interface ScheduleTimelineProps {
  channelId: string;
  className?: string;
  timeRange?: 'today' | 'week' | 'month';
}

// Mock schedule data - in real app this would come from the database
const mockSchedule: Schedule[] = [
  {
    id: '1',
    channel_id: 'channel-1',
    video_id: 'video-1',
    start_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
    end_time: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min from now
    is_recurring: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    video: {
      id: 'video-1',
      title: 'Introduction to React Hooks',
      description: 'Learn the fundamentals of React Hooks',
      channel_id: 'channel-1',
      duration: 3600,
      view_count: 1250,
      like_count: 89,
      tags: ['react', 'javascript', 'tutorial'],
      metadata: {},
      is_live: true,
      is_featured: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      thumbnail_url: 'https://via.placeholder.com/320x180'
    }
  },
  // Add more mock schedule items...
];

export function ScheduleTimeline({ 
  channelId, 
  className,
  timeRange = 'today' 
}: ScheduleTimelineProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Generate time slots for the timeline
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    for (let i = 0; i < 24; i++) {
      const time = new Date(startOfDay.getTime() + i * 60 * 60 * 1000);
      slots.push({
        time,
        hour: time.getHours(),
        label: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isCurrentHour: time.getHours() === now.getHours() && 
                      time.getDate() === now.getDate()
      });
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();
  const schedule = mockSchedule; // In real app, filter by channelId

  // Calculate position for current time indicator
  const getCurrentTimePosition = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const minutesSinceStart = (now.getTime() - startOfDay.getTime()) / (1000 * 60);
    return (minutesSinceStart / (24 * 60)) * 100;
  };

  const scrollToCurrentTime = () => {
    if (scrollAreaRef.current) {
      const currentPosition = getCurrentTimePosition();
      const scrollPosition = (currentPosition / 100) * scrollAreaRef.current.scrollWidth;
      scrollAreaRef.current.scrollTo({ left: scrollPosition - 200, behavior: 'smooth' });
    }
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <h3 className="font-semibold">Today's Schedule</h3>
            <Badge variant="outline" className="text-xs">
              {schedule.length} programs
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={scrollToCurrentTime}
            >
              <Clock className="w-4 h-4 mr-2" />
              Now
            </Button>
            
            <div className="flex">
              <Button
                variant="ghost"
                size="sm"
                className="px-2"
                onClick={() => scrollAreaRef.current?.scrollBy({ left: -200, behavior: 'smooth' })}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="px-2"
                onClick={() => scrollAreaRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <ScrollArea className="w-full" ref={scrollAreaRef}>
          <div className="relative w-full min-w-[1200px] h-24">
            {/* Time Grid */}
            <div className="absolute inset-0 flex">
              {timeSlots.map((slot, index) => (
                <div
                  key={slot.hour}
                  className={cn(
                    'flex-1 border-r border-border last:border-r-0 relative',
                    slot.isCurrentHour && 'bg-muted/50'
                  )}
                >
                  {/* Hour Label */}
                  <div className="absolute top-0 left-2 text-xs text-muted-foreground font-medium">
                    {slot.label}
                  </div>
                  
                  {/* Hour Divisions */}
                  <div className="absolute top-6 left-1/4 w-px h-4 bg-border"></div>
                  <div className="absolute top-6 left-1/2 w-px h-4 bg-border"></div>
                  <div className="absolute top-6 left-3/4 w-px h-4 bg-border"></div>
                </div>
              ))}
            </div>

            {/* Current Time Indicator */}
            <div
              className="absolute top-0 bottom-0 z-20 w-0.5 bg-red-500"
              style={{ left: `${getCurrentTimePosition()}%` }}
            >
              <div className="absolute -top-1 -left-1 w-3 h-3 bg-red-500 rounded-full"></div>
              <div className="absolute -top-6 -left-8 bg-red-500 text-white text-xs px-1 py-0.5 rounded text-center whitespace-nowrap">
                NOW
              </div>
            </div>

            {/* Schedule Items */}
            <div className="absolute top-12 left-0 right-0 bottom-0">
              {schedule.map((item) => {
                const startTime = new Date(item.start_time);
                const endTime = new Date(item.end_time);
                const duration = endTime.getTime() - startTime.getTime();
                const startOfDay = new Date(startTime.getFullYear(), startTime.getMonth(), startTime.getDate());
                
                const startOffset = (startTime.getTime() - startOfDay.getTime()) / (24 * 60 * 60 * 1000) * 100;
                const width = duration / (24 * 60 * 60 * 1000) * 100;
                
                const isActive = currentTime >= startTime && currentTime <= endTime;
                const isUpcoming = currentTime < startTime;
                const isPast = currentTime > endTime;

                return (
                  <div
                    key={item.id}
                    className={cn(
                      'absolute h-10 rounded-md border-2 cursor-pointer transition-all duration-200 hover:z-10 hover:scale-105',
                      isActive && 'border-red-500 bg-red-50 dark:bg-red-950 shadow-lg',
                      isUpcoming && 'border-blue-500 bg-blue-50 dark:bg-blue-950',
                      isPast && 'border-gray-300 bg-gray-50 dark:bg-gray-900 opacity-60',
                      selectedTimeSlot === item.id && 'ring-2 ring-primary'
                    )}
                    style={{
                      left: `${startOffset}%`,
                      width: `${Math.max(width, 5)}%`
                    }}
                    onClick={() => setSelectedTimeSlot(
                      selectedTimeSlot === item.id ? null : item.id
                    )}
                  >
                    <div className="flex items-center h-full px-2 space-x-2">
                      {isActive && <LiveIndicator isLive={true} variant="minimal" showViewers={false} />}
                      
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium truncate">
                          {item.video?.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {startTime.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      
                      {isActive && (
                        <Button size="sm" className="w-6 h-6 p-0">
                          <Play className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>

        {/* Selected Program Details */}
        {selectedTimeSlot && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            {(() => {
              const selectedItem = schedule.find(item => item.id === selectedTimeSlot);
              if (!selectedItem?.video) return null;
              
              const startTime = new Date(selectedItem.start_time);
              const endTime = new Date(selectedItem.end_time);
              const isActive = currentTime >= startTime && currentTime <= endTime;
              
              return (
                <div className="flex items-start space-x-3">
                  <div className="w-16 h-12 bg-muted rounded flex-shrink-0 overflow-hidden">
                    {selectedItem.video.thumbnail_url && (
                      <img
                        src={selectedItem.video.thumbnail_url}
                        alt={selectedItem.video.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">
                      {selectedItem.video.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                      {selectedItem.video.description}
                    </p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                      <span>
                        {startTime.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })} - {endTime.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                      {selectedItem.video.tags && selectedItem.video.tags.length > 0 && (
                        <div className="flex space-x-1">
                          {selectedItem.video.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs px-1 py-0">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {isActive && (
                    <Button size="sm" className="flex-shrink-0">
                      <Play className="w-4 h-4 mr-2" />
                      Watch
                    </Button>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Verification:** 
- ScheduleTimeline component created with interactive timeline
- Real-time current time indicator with precise positioning
- shadcn/ui ScrollArea, Card, and Button components used
- Responsive timeline with proper time calculations
- Click interactions for program details

## Task Completion Checklist
Mark each task as complete when finished:

- [ ] Task 1: ChannelCard component with interactive elements ✅
- [ ] Task 2: TVGuide grid layout with filtering ✅  
- [ ] Task 3: LiveIndicator components with animations ✅
- [ ] Task 4: ScheduleTimeline with real-time updates ✅

## Verification Steps
After completing all tasks:

1. Check all TV Guide component files exist:
   ```bash
   ls -la components/tv-guide/
   ```

2. Test TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```

3. Start development server and test components:
   ```bash
   npm run dev
   ```

4. Navigate to homepage and verify no errors
5. Test responsive design at different breakpoints
6. Verify Tailwind animations work correctly
7. Test hover states and interactive elements

## Success Criteria
- All TV Guide components created with proper TypeScript types
- shadcn/ui components integrated correctly throughout
- Tailwind CSS classes provide responsive, accessible design
- Real-time data integration works with custom hooks
- Interactive elements provide immediate feedback
- Loading states and error handling implemented
- Channel color theming works with CSS variables
- Components follow design system patterns

## Important Notes
- All components use design system CSS variables for theming
- Channel-specific colors applied with dynamic classes
- Real-time features use proper cleanup to prevent memory leaks
- Accessibility support included with proper ARIA labels
- Mobile-first responsive design implemented
- Performance optimized with proper React patterns

## Troubleshooting
If you encounter issues:
1. Verify custom hooks are properly imported and working
2. Check that design system CSS variables are defined
3. Ensure shadcn/ui components are correctly installed
4. Test responsive classes at various breakpoints
5. Verify real-time subscriptions clean up properly

## Next Step
After completing this step and marking all tasks ✅, proceed to Step 19: Create Video Player Components.