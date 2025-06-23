# Step 19: Create Video Player Components

## Context
You are building Tempest, an interactive streaming platform. This step creates the video player components with Cloudflare Stream integration, custom controls, interactive overlays, and real-time features using precise Tailwind CSS classes and Video.js integration.

## Purpose
The video player is the core component for content consumption, supporting live streams, VOD content, interactive overlays, chat integration, and analytics tracking. Components must be responsive, accessible, and provide seamless user experience across devices.

## Prerequisites
- Step 18 completed successfully
- TV Guide components created
- Video.js dependencies installed
- Cloudflare Stream configuration completed
- Custom hooks for videos and analytics available

## Task Instructions
Complete each task in order and mark as ✅ when finished:

### Task 1: Create Base Video Player Component ⏳
Create the core video player component with Video.js and Cloudflare Stream integration.

**File to Create:** `components/video/VideoPlayer.tsx`

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import '@videojs/themes/dist/city/index.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  Settings,
  Users,
  MessageCircle,
  Heart,
  Share
} from 'lucide-react';
import { FloatingLiveIndicator } from '@/components/tv-guide/LiveIndicator';
import { useViewerCount } from '@/lib/hooks/useAnalytics';
import { formatDuration, formatNumber } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Video } from '@/lib/types';

interface VideoPlayerProps {
  video: Video;
  autoplay?: boolean;
  muted?: boolean;
  className?: string;
  onTimeUpdate?: (currentTime: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  showControls?: boolean;
  showOverlays?: boolean;
}

export function VideoPlayer({
  video,
  autoplay = false,
  muted = false,
  className,
  onTimeUpdate,
  onPlay,
  onPause,
  onEnded,
  showControls = true,
  showOverlays = true
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControlsOverlay, setShowControlsOverlay] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  const { viewerCount } = useViewerCount(video.id);

  // Get Cloudflare Stream URL
  const getStreamUrl = () => {
    if (video.cloudflare_stream_id) {
      const subdomain = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN;
      return `https://${subdomain}.cloudflarestream.com/${video.cloudflare_stream_id}/manifest/video.m3u8`;
    }
    return null;
  };

  // Initialize Video.js player
  useEffect(() => {
    if (!videoRef.current) return;

    const streamUrl = getStreamUrl();
    if (!streamUrl) return;

    const options = {
      autoplay: autoplay,
      controls: false, // We'll use custom controls
      responsive: true,
      fluid: true,
      muted: muted,
      preload: 'auto',
      sources: [
        {
          src: streamUrl,
          type: 'application/x-mpegURL'
        }
      ],
      html5: {
        hls: {
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          overrideNative: true
        }
      }
    };

    playerRef.current = videojs(videoRef.current, options, () => {
      setIsReady(true);
      
      // Event listeners
      playerRef.current.on('play', () => {
        setIsPlaying(true);
        onPlay?.();
      });

      playerRef.current.on('pause', () => {
        setIsPlaying(false);
        onPause?.();
      });

      playerRef.current.on('timeupdate', () => {
        const current = playerRef.current.currentTime();
        setCurrentTime(current);
        onTimeUpdate?.(current);
      });

      playerRef.current.on('durationchange', () => {
        setDuration(playerRef.current.duration());
      });

      playerRef.current.on('volumechange', () => {
        setVolume(playerRef.current.volume());
        setIsMuted(playerRef.current.muted());
      });

      playerRef.current.on('ended', () => {
        setIsPlaying(false);
        onEnded?.();
      });

      playerRef.current.on('fullscreenchange', () => {
        setIsFullscreen(playerRef.current.isFullscreen());
      });
    });

    return () => {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [video.cloudflare_stream_id, autoplay, muted]);

  // Handle controls visibility
  const showControls_ = () => {
    setShowControlsOverlay(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => {
      if (isPlaying) {
        setShowControlsOverlay(false);
      }
    }, 3000);
    setControlsTimeout(timeout);
  };

  const hideControls = () => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    setShowControlsOverlay(false);
  };

  // Player control functions
  const togglePlay = () => {
    if (!playerRef.current) return;
    
    if (isPlaying) {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  };

  const handleSeek = (value: number[]) => {
    if (!playerRef.current || !duration) return;
    const seekTime = (value[0] / 100) * duration;
    playerRef.current.currentTime(seekTime);
  };

  const handleVolumeChange = (value: number[]) => {
    if (!playerRef.current) return;
    const newVolume = value[0] / 100;
    playerRef.current.volume(newVolume);
    if (newVolume > 0 && isMuted) {
      playerRef.current.muted(false);
    }
  };

  const toggleMute = () => {
    if (!playerRef.current) return;
    playerRef.current.muted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!playerRef.current) return;
    
    if (isFullscreen) {
      playerRef.current.exitFullscreen();
    } else {
      playerRef.current.requestFullscreen();
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  return (
    <div className={cn('video-player-container group', className)}>
      {/* Video Element */}
      <div
        className="w-full h-full"
        onMouseMove={showControls_}
        onMouseLeave={hideControls}
        onClick={showControls_}
      >
        <video
          ref={videoRef}
          className="video-js vjs-theme-city w-full h-full"
          data-setup="{}"
        />
      </div>

      {/* Live Indicator */}
      {video.is_live && showOverlays && (
        <FloatingLiveIndicator
          isLive={video.is_live}
          viewerCount={viewerCount}
          className="absolute top-4 left-4 z-30"
        />
      )}

      {/* Video Info Overlay */}
      {showOverlays && (
        <div className={cn(
          'absolute top-4 right-4 z-30 transition-opacity duration-300',
          !showControlsOverlay && isPlaying && 'opacity-0'
        )}>
          <div className="flex items-center space-x-2">
            <div className="bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-white">
              <div className="flex items-center space-x-2 text-sm">
                <Users className="w-4 h-4" />
                <span className="font-medium">{formatNumber(viewerCount)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Controls Overlay */}
      {showControls && (
        <div className={cn(
          'absolute inset-0 z-20 transition-opacity duration-300',
          !showControlsOverlay && isPlaying && 'opacity-0 pointer-events-none'
        )}>
          {/* Center Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="lg"
              variant="ghost"
              className={cn(
                'w-20 h-20 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white border-2 border-white/20 transition-all duration-200',
                isPlaying && 'scale-0 opacity-0'
              )}
              onClick={togglePlay}
            >
              <Play className="w-8 h-8 ml-1" />
            </Button>
          </div>

          {/* Bottom Controls Bar */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">
            {/* Progress Bar */}
            <div className="mb-4">
              <Slider
                value={[progress]}
                onValueChange={handleSeek}
                max={100}
                step={0.1}
                className="w-full"
                trackClassName="h-1 bg-white/20"
                rangeClassName="bg-red-500"
                thumbClassName="w-3 h-3 bg-red-500 border-2 border-white shadow-lg"
              />
              <div className="flex justify-between text-xs text-white/80 mt-1">
                <span>{formatDuration(Math.floor(currentTime))}</span>
                {duration > 0 && <span>{formatDuration(Math.floor(duration))}</span>}
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {/* Play/Pause */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20 p-2"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </Button>

                {/* Volume Controls */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleMute}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    {isMuted || volume === 0 ? (
                      <VolumeX className="w-5 h-5" />
                    ) : (
                      <Volume2 className="w-5 h-5" />
                    )}
                  </Button>
                  
                  <div className="w-20 hidden sm:block">
                    <Slider
                      value={[volumePercent]}
                      onValueChange={handleVolumeChange}
                      max={100}
                      step={1}
                      className="w-full"
                      trackClassName="h-1 bg-white/20"
                      rangeClassName="bg-white"
                      thumbClassName="w-3 h-3 bg-white border-2 border-gray-300 shadow-lg"
                    />
                  </div>
                </div>

                {/* Video Title */}
                <div className="hidden md:block text-white">
                  <div className="text-sm font-medium truncate max-w-xs">
                    {video.title}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Interaction Buttons */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                >
                  <Heart className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                >
                  <MessageCircle className="w-5 h-5" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                >
                  <Share className="w-5 h-5" />
                </Button>

                {/* Settings */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                >
                  <Settings className="w-5 h-5" />
                </Button>

                {/* Fullscreen */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20 p-2"
                >
                  {isFullscreen ? (
                    <Minimize className="w-5 h-5" />
                  ) : (
                    <Maximize className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {!isReady && (
        <div className="video-overlay">
          <div className="flex flex-col items-center space-y-4 text-white">
            <div className="loading-spinner w-8 h-8 border-2 border-white/20 border-t-white"></div>
            <div className="text-center">
              <div className="font-medium">Loading video...</div>
              <div className="text-sm text-white/80 mt-1">
                Preparing {video.title}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Verification:** 
- VideoPlayer component created with Video.js integration
- Custom controls overlay with precise Tailwind positioning
- Cloudflare Stream URL generation implemented
- shadcn/ui Slider and Button components used for controls
- Responsive design with mobile-friendly controls

### Task 2: Create Video Player Container with Chat Integration ⏳
Create a container component that combines video player with chat and interactive elements.

**File to Create:** `components/video/VideoPlayerWithChat.tsx`

```typescript
'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Users, 
  ChevronLeft, 
  ChevronRight,
  Maximize2,
  PanelRightClose,
  PanelRightOpen
} from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { Chat } from '@/components/chat/Chat';
import { InteractionOverlay } from '@/components/interactions/InteractionOverlay';
import { VideoMetadata } from './VideoMetadata';
import { cn } from '@/lib/utils/cn';
import type { Video } from '@/lib/types';

interface VideoPlayerWithChatProps {
  video: Video;
  className?: string;
  defaultChatOpen?: boolean;
  showMetadata?: boolean;
  autoplay?: boolean;
}

export function VideoPlayerWithChat({
  video,
  className,
  defaultChatOpen = true,
  showMetadata = true,
  autoplay = false
}: VideoPlayerWithChatProps) {
  const [isChatOpen, setIsChatOpen] = useState(defaultChatOpen);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleTimeUpdate = (time: number) => {
    setCurrentTime(time);
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };

  const toggleTheaterMode = () => {
    setIsTheaterMode(!isTheaterMode);
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        'flex flex-col h-screen bg-background transition-all duration-300',
        isTheaterMode && 'bg-black',
        className
      )}
    >
      {/* Video Player Section */}
      <div className={cn(
        'flex flex-1 overflow-hidden',
        isTheaterMode ? 'flex-col' : 'flex-col lg:flex-row'
      )}>
        {/* Main Video Area */}
        <div className={cn(
          'flex-1 flex flex-col min-h-0',
          isChatOpen && !isTheaterMode ? 'lg:pr-2' : ''
        )}>
          {/* Video Player */}
          <div className={cn(
            'relative bg-black flex-1',
            isTheaterMode ? 'h-screen' : 'aspect-video lg:h-auto lg:flex-1'
          )}>
            <VideoPlayer
              video={video}
              autoplay={autoplay}
              onTimeUpdate={handleTimeUpdate}
              className="w-full h-full"
            />

            {/* Interaction Overlays */}
            <InteractionOverlay
              videoId={video.id}
              currentTime={currentTime}
              className="absolute inset-0 z-10 pointer-events-none"
            />

            {/* Theater Mode Controls */}
            {!isTheaterMode && (
              <div className="absolute top-4 right-4 z-30 flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleTheaterMode}
                  className="bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm"
                >
                  <Maximize2 className="w-4 h-4" />
                  <span className="sr-only">Theater mode</span>
                </Button>
              </div>
            )}
          </div>

          {/* Video Metadata (below player in normal mode) */}
          {showMetadata && !isTheaterMode && (
            <div className="p-4 bg-background border-t border-border lg:border-t-0">
              <VideoMetadata video={video} />
            </div>
          )}
        </div>

        {/* Chat Sidebar - Desktop */}
        {isChatOpen && !isTheaterMode && (
          <div className="hidden lg:flex lg:w-80 xl:w-96 flex-col bg-card border-l border-border">
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Live Chat</h3>
                <Badge variant="secondary" className="text-xs">
                  <Users className="w-3 h-3 mr-1" />
                  1.2K
                </Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChat}
                className="p-1"
              >
                <PanelRightClose className="w-4 h-4" />
              </Button>
            </div>

            {/* Chat Component */}
            <div className="flex-1 min-h-0">
              <Chat
                videoId={video.id}
                className="h-full"
                variant="sidebar"
              />
            </div>
          </div>
        )}

        {/* Chat Toggle Button (when chat is closed) */}
        {!isChatOpen && !isTheaterMode && (
          <div className="hidden lg:block absolute top-4 right-4 z-30">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleChat}
              className="bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm"
            >
              <PanelRightOpen className="w-4 h-4" />
              <span className="sr-only">Open chat</span>
            </Button>
          </div>
        )}
      </div>

      {/* Mobile Chat Sheet */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="fixed bottom-4 right-4 z-50 shadow-lg"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Chat
              <Badge variant="secondary" className="ml-2 text-xs">
                1.2K
              </Badge>
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[70vh]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold">Live Chat</h3>
              </div>
            </div>
            <Chat
              videoId={video.id}
              className="h-full"
              variant="modal"
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Theater Mode Exit */}
      {isTheaterMode && (
        <div className="absolute top-4 left-4 z-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheaterMode}
            className="bg-black/40 hover:bg-black/60 text-white backdrop-blur-sm"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Exit Theater
          </Button>
        </div>
      )}

      {/* Theater Mode Video Info */}
      {isTheaterMode && showMetadata && (
        <div className="absolute bottom-20 left-4 right-4 z-30 pointer-events-none">
          <Card className="bg-black/60 backdrop-blur-sm border-white/10">
            <CardContent className="p-4">
              <VideoMetadata 
                video={video} 
                variant="overlay"
                className="text-white"
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
```

**Verification:** 
- VideoPlayerWithChat container created with responsive layout
- Chat sidebar integration with proper Tailwind flex classes
- Theater mode toggle with full-screen layout
- Mobile-first design with Sheet component for mobile chat
- Proper z-index layering for overlays and controls

### Task 3: Create Video Metadata Component ⏳
Create a component to display video information, stats, and related content.

**File to Create:** `components/video/VideoMetadata.tsx`

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  Share, 
  Download, 
  Bookmark, 
  Flag,
  Eye,
  Clock,
  Calendar,
  Star,
  ThumbsUp,
  MessageSquare,
  Users,
  TrendingUp
} from 'lucide-react';
import { useUser } from '@/lib/hooks/useUser';
import { useInteractions } from '@/lib/hooks/useInteractions';
import { formatNumber, formatDuration, formatRelativeTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Video } from '@/lib/types';

interface VideoMetadataProps {
  video: Video;
  className?: string;
  variant?: 'default' | 'compact' | 'overlay';
  showRelated?: boolean;
}

export function VideoMetadata({
  video,
  className,
  variant = 'default',
  showRelated = true
}: VideoMetadataProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const { user } = useUser();
  const { addReaction, addRating, getAverageRating } = useInteractions({ videoId: video.id });

  const averageRating = getAverageRating();

  const handleLike = async () => {
    if (!user) return;
    const success = await addReaction('👍');
    if (success) setIsLiked(!isLiked);
  };

  const handleBookmark = async () => {
    if (!user) return;
    setIsBookmarked(!isBookmarked);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: video.title,
        text: video.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (variant === 'overlay') {
    return (
      <div className={cn('space-y-2', className)}>
        <h2 className="text-lg font-semibold line-clamp-2">{video.title}</h2>
        {video.description && (
          <p className="text-sm opacity-80 line-clamp-2">{video.description}</p>
        )}
        <div className="flex items-center space-x-4 text-sm opacity-80">
          <div className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{formatNumber(video.view_count)} views</span>
          </div>
          {video.duration && (
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(video.duration)}</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span>{averageRating.toFixed(1)}</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold line-clamp-2">{video.title}</h2>
              {video.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {video.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatNumber(video.view_count)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ThumbsUp className="w-3 h-3" />
                  <span>{formatNumber(video.like_count)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span>{averageRating.toFixed(1)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className={cn(
                    'p-1',
                    isLiked && 'text-red-500'
                  )}
                >
                  <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBookmark}
                  className={cn(
                    'p-1',
                    isBookmarked && 'text-blue-500'
                  )}
                >
                  <Bookmark className={cn('w-4 h-4', isBookmarked && 'fill-current')} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="p-1"
                >
                  <Share className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {video.tags && video.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {video.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                    {tag}
                  </Badge>
                ))}
                {video.tags.length > 4 && (
                  <Badge variant="outline" className="text-xs px-2 py-0">
                    +{video.tags.length - 4}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant - full metadata display
  return (
    <div className={cn('space-y-6', className)}>
      {/* Video Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold leading-tight">{video.title}</h1>
          <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{formatNumber(video.view_count)} views</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{formatRelativeTime(video.created_at)}</span>
            </div>
            {video.duration && (
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(video.duration)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant={isLiked ? "default" : "outline"}
              size="sm"
              onClick={handleLike}
              className="flex items-center space-x-2"
            >
              <Heart className={cn('w-4 h-4', isLiked && 'fill-current')} />
              <span>{formatNumber(video.like_count + (isLiked ? 1 : 0))}</span>
            </Button>

            <Button
              variant={isBookmarked ? "default" : "outline"}
              size="sm"
              onClick={handleBookmark}
              className="flex items-center space-x-2"
            >
              <Bookmark className={cn('w-4 h-4', isBookmarked && 'fill-current')} />
              <span>Save</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="flex items-center space-x-2"
            >
              <Share className="w-4 h-4" />
              <span>Share</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm text-muted-foreground">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="font-medium">{averageRating.toFixed(1)}</span>
              <span>rating</span>
            </div>

            <Button variant="ghost" size="sm" className="p-1">
              <Flag className="w-4 h-4" />
              <span className="sr-only">Report</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="related">Related</TabsTrigger>
        </TabsList>

        <TabsContent value="about" className="space-y-4">
          {/* Channel Info */}
          {video.channel && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={video.channel.logo_url} />
                    <AvatarFallback 
                      className="bg-gradient-to-br from-primary to-primary/70 text-white font-bold"
                    >
                      {video.channel.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{video.channel.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {video.channel.description}
                    </p>
                  </div>
                  <Button size="sm">Follow</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {video.description && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {video.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {video.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-3 py-1">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <Eye className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold">{formatNumber(video.view_count)}</div>
                <div className="text-xs text-muted-foreground">Views</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <ThumbsUp className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold">{formatNumber(video.like_count)}</div>
                <div className="text-xs text-muted-foreground">Likes</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <MessageSquare className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
                <div className="text-2xl font-bold">1.2K</div>
                <div className="text-xs text-muted-foreground">Comments</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 text-center">
                <Star className="w-6 h-6 mx-auto mb-2 text-yellow-400 fill-current" />
                <div className="text-2xl font-bold">{averageRating.toFixed(1)}</div>
                <div className="text-xs text-muted-foreground">Rating</div>
              </CardContent>
            </Card>
          </div>

          {/* Engagement Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <TrendingUp className="w-5 h-5" />
                <span>Engagement Over Time</span>
              </CardTitle>
              <CardDescription>
                Viewer engagement and interaction metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="w-8 h-8 mx-auto mb-2" />
                  <p>Engagement chart will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="related" className="space-y-4">
          {showRelated ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Related Content</h3>
              <p className="text-muted-foreground">
                Related videos and recommendations will appear here
              </p>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>Related content is disabled</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

**Verification:** 
- VideoMetadata component created with multiple display variants
- shadcn/ui Tabs, Card, and Avatar components integrated
- Interactive buttons with proper state management
- Responsive grid layout for statistics cards
- Tailwind classes for spacing, typography, and hover states

### Task 4: Create Video Player Error Boundary ⏳
Create an error boundary specifically for video player components with recovery options.

**File to Create:** `components/video/VideoPlayerWithErrorBoundary.tsx`

```typescript
'use client';

import { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  RefreshCw, 
  Monitor, 
  Wifi, 
  Play,
  Settings,
  HelpCircle
} from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';
import { VideoPlayerWithChat } from './VideoPlayerWithChat';
import type { Video } from '@/lib/types';

interface VideoPlayerWithErrorBoundaryProps {
  video: Video;
  withChat?: boolean;
  className?: string;
  autoplay?: boolean;
}

interface VideoPlayerErrorState {
  hasError: boolean;
  error?: Error;
  errorType?: 'network' | 'playback' | 'stream' | 'permission' | 'unknown';
}

export class VideoPlayerWithErrorBoundary extends Component<
  VideoPlayerWithErrorBoundaryProps,
  VideoPlayerErrorState
> {
  constructor(props: VideoPlayerWithErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): VideoPlayerErrorState {
    // Determine error type based on error message
    let errorType: VideoPlayerErrorState['errorType'] = 'unknown';
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      errorType = 'network';
    } else if (error.message.includes('play') || error.message.includes('video')) {
      errorType = 'playback';
    } else if (error.message.includes('stream') || error.message.includes('hls')) {
      errorType = 'stream';
    } else if (error.message.includes('permission') || error.message.includes('autoplay')) {
      errorType = 'permission';
    }

    return { hasError: true, error, errorType };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Video Player Error:', error, errorInfo);
    
    // Report to analytics/monitoring service
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_map: {
          error_type: this.state.errorType,
          video_id: this.props.video.id
        }
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorType: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  getErrorConfig() {
    const { errorType } = this.state;
    
    switch (errorType) {
      case 'network':
        return {
          title: 'Network Connection Error',
          description: 'Unable to connect to the video stream. Please check your internet connection.',
          icon: Wifi,
          solutions: [
            'Check your internet connection',
            'Try refreshing the page',
            'Disable VPN if using one',
            'Try again in a few moments'
          ],
          canRetry: true
        };
        
      case 'playback':
        return {
          title: 'Video Playback Error',
          description: 'There was a problem playing this video.',
          icon: Play,
          solutions: [
            'Try refreshing the page',
            'Update your browser',
            'Clear browser cache',
            'Try a different browser'
          ],
          canRetry: true
        };
        
      case 'stream':
        return {
          title: 'Stream Unavailable',
          description: 'The video stream is currently unavailable.',
          icon: Monitor,
          solutions: [
            'The stream may have ended',
            'Try refreshing the page',
            'Check if the content is still live',
            'Contact support if the issue persists'
          ],
          canRetry: true
        };
        
      case 'permission':
        return {
          title: 'Playback Permission Required',
          description: 'Your browser requires user interaction to play videos.',
          icon: Settings,
          solutions: [
            'Click the play button to start',
            'Enable autoplay in browser settings',
            'Unmute the video player',
            'Allow media autoplay for this site'
          ],
          canRetry: true
        };
        
      default:
        return {
          title: 'Video Player Error',
          description: 'An unexpected error occurred while loading the video player.',
          icon: AlertTriangle,
          solutions: [
            'Try refreshing the page',
            'Clear your browser cache',
            'Update your browser',
            'Contact support if the issue persists'
          ],
          canRetry: true
        };
    }
  }

  render() {
    if (this.state.hasError) {
      const errorConfig = this.getErrorConfig();
      const ErrorIcon = errorConfig.icon;

      return (
        <div className={`w-full h-full min-h-[400px] flex items-center justify-center p-4 bg-muted/30 ${this.props.className}`}>
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                <ErrorIcon className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">{errorConfig.title}</CardTitle>
              <CardDescription className="text-base">
                {errorConfig.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Error Details in Development */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Development Error Details</AlertTitle>
                  <AlertDescription className="font-mono text-xs mt-2 whitespace-pre-wrap">
                    {this.state.error.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Solutions */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Try these solutions:</span>
                </h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  {errorConfig.solutions.map((solution, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2 flex-shrink-0"></span>
                      <span>{solution}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {errorConfig.canRetry && (
                  <Button
                    onClick={this.handleRetry}
                    className="flex-1 interactive-button"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={this.handleReload}
                  className="flex-1"
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Refresh Page
                </Button>
              </div>

              {/* Video Info */}
              <div className="text-center pt-2 border-t border-border">
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">{this.props.video.title}</p>
                  <p className="text-xs">Video ID: {this.props.video.id}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Render appropriate video player component
    if (this.props.withChat) {
      return (
        <VideoPlayerWithChat
          video={this.props.video}
          className={this.props.className}
          autoplay={this.props.autoplay}
        />
      );
    }

    return (
      <VideoPlayer
        video={this.props.video}
        className={this.props.className}
        autoplay={this.props.autoplay}
      />
    );
  }
}

// Functional wrapper component for easier usage
interface VideoPlayerWrapperProps {
  video: Video;
  withChat?: boolean;
  className?: string;
  autoplay?: boolean;
}

export function VideoPlayerWrapper(props: VideoPlayerWrapperProps) {
  return <VideoPlayerWithErrorBoundary {...props} />;
}
```

**Verification:** 
- VideoPlayerWithErrorBoundary created with comprehensive error handling
- Different error types identified and handled appropriately
- shadcn/ui Alert, Card components used for error display
- Recovery options provided with clear user guidance
- Development vs production error display logic

## Task Completion Checklist
Mark each task as complete when finished:

- [ ] Task 1: Base VideoPlayer component with Video.js integration ✅
- [ ] Task 2: VideoPlayerWithChat container component ✅  
- [ ] Task 3: VideoMetadata component with variants ✅
- [ ] Task 4: VideoPlayerWithErrorBoundary with error recovery ✅

## Verification Steps
After completing all tasks:

1. Check all video player component files exist:
   ```bash
   ls -la components/video/
   ```

2. Test TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```

3. Start development server and test components:
   ```bash
   npm run dev
   ```

4. Test video player functionality:
   - Verify Video.js loads correctly
   - Test custom controls overlay
   - Check responsive design
   - Test theater mode toggle
   - Verify chat integration

5. Test error boundary by:
   - Providing invalid video data
   - Simulating network errors
   - Testing error recovery

## Success Criteria
- All video player components created with proper TypeScript types
- Video.js integrated correctly with Cloudflare Stream support
- Custom controls overlay with precise Tailwind positioning
- Responsive design works across all screen sizes
- Chat integration seamless with proper layout
- Error boundaries provide user-friendly error handling
- Theater mode provides immersive viewing experience
- Interactive elements provide immediate visual feedback

## Important Notes
- Video.js CSS imported and customized with design system colors
- Cloudflare Stream URL generation handles environment variables
- Custom controls hide automatically during playback
- Chat sidebar responsive with mobile sheet fallback
- Error boundary categorizes different error types
- Accessibility features included with proper ARIA labels
- Performance optimized with proper cleanup in useEffect

## Troubleshooting
If you encounter issues:
1. Verify Video.js is properly installed and imported
2. Check Cloudflare Stream environment variables are set
3. Ensure Video.js CSS is loading correctly
4. Test with valid Cloudflare Stream ID
5. Verify real-time hooks are working properly
6. Check responsive classes at various breakpoints

## Next Step
After completing this step and marking all tasks ✅, proceed to Step 20: Create Chat Components with Real-time Features.