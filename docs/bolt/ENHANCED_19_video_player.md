# ENHANCED Step 19: Create Video Player Components (Sonnet-Optimized)

## Context
You are building Tempest. This step creates the video player with Video.js integration. **This is the most complex component - follow EXACTLY.**

## CRITICAL FOR CLAUDE SONNET
- Video.js requires EXACT initialization sequence
- Real-time features need precise cleanup patterns  
- Copy all code EXACTLY - do not modify
- Pay special attention to useEffect dependencies

## Task Instructions

### Task 1: Create Base Video Player Component ⏳

**REASONING**: Video.js needs dynamic import to prevent SSR issues, exact initialization options for Cloudflare Stream, and mandatory cleanup to prevent memory leaks.

**File to Create:** `components/video/VideoPlayer.tsx`

**COMPLETE REFERENCE IMPLEMENTATION** (Copy this EXACTLY):

```typescript
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings,
  Users,
  MessageCircle,
  Heart
} from 'lucide-react';
import { useViewerCount } from '@/lib/hooks/useAnalytics';
import { formatNumber } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

// CRITICAL: Exact interface required for Cloudflare Stream
interface Video {
  id: string;
  title: string;
  description?: string;
  cloudflare_stream_id?: string;
  thumbnail_url?: string;
  duration?: number;
  is_live: boolean;
  channel_id: string;
}

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

// CRITICAL: State machine pattern prevents race conditions
type PlayerState = 'loading' | 'ready' | 'playing' | 'paused' | 'error' | 'ended';

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
  // CRITICAL: Refs for Video.js - do not change
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null);
  
  // CRITICAL: State management - exact pattern required
  const [playerState, setPlayerState] = useState<PlayerState>('loading');
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(muted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControlsOverlay, setShowControlsOverlay] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  const { viewerCount } = useViewerCount(video.id);

  // CRITICAL: Cloudflare Stream URL generation - exact format required
  const getStreamUrl = useCallback(() => {
    if (!video.cloudflare_stream_id) return null;
    
    const subdomain = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN;
    if (!subdomain) {
      console.error('NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN not configured');
      return null;
    }
    
    return `https://${subdomain}.cloudflarestream.com/${video.cloudflare_stream_id}/manifest/video.m3u8`;
  }, [video.cloudflare_stream_id]);

  // CRITICAL: Video.js initialization - EXACT sequence required
  useEffect(() => {
    if (!videoRef.current || !video.cloudflare_stream_id) {
      setPlayerState('error');
      return;
    }

    const streamUrl = getStreamUrl();
    if (!streamUrl) {
      setPlayerState('error');
      return;
    }

    // STEP 1: Dynamic import prevents SSR issues
    let player: any;
    
    const initializePlayer = async () => {
      try {
        // Import Video.js and CSS
        const videojs = (await import('video.js')).default;
        await import('video.js/dist/video-js.css');
        await import('@videojs/themes/dist/city/index.css');

        // STEP 2: Player options - EXACT configuration for Cloudflare Stream
        const options = {
          controls: showControls,
          responsive: true,
          fluid: true,
          autoplay: autoplay,
          muted: isMuted,
          preload: 'metadata',
          playbackRates: [0.5, 1, 1.25, 1.5, 2],
          sources: [{
            src: streamUrl,
            type: 'application/x-mpegURL'
          }],
          html5: {
            hls: {
              enableLowInitialPlaylist: true,
              smoothQualityChange: true,
              overrideNative: true
            }
          },
          techOrder: ['html5'],
          plugins: {}
        };

        // STEP 3: Initialize player
        player = videojs(videoRef.current, options);

        // STEP 4: Event listeners - CRITICAL for state management
        player.ready(() => {
          console.log('Video.js player ready');
          setPlayerState('ready');
          setDuration(player.duration() || 0);
        });

        player.on('loadstart', () => {
          console.log('Video load started');
          setPlayerState('loading');
        });

        player.on('canplay', () => {
          console.log('Video can play');
          setPlayerState('ready');
        });

        player.on('play', () => {
          console.log('Video playing');
          setPlayerState('playing');
          onPlay?.();
        });

        player.on('pause', () => {
          console.log('Video paused');
          setPlayerState('paused');
          onPause?.();
        });

        player.on('ended', () => {
          console.log('Video ended');
          setPlayerState('ended');
          onEnded?.();
        });

        player.on('error', (error: any) => {
          console.error('Video.js error:', error);
          setPlayerState('error');
        });

        player.on('timeupdate', () => {
          const time = player.currentTime();
          setCurrentTime(time);
          onTimeUpdate?.(time);
        });

        player.on('volumechange', () => {
          setVolume(player.volume());
          setIsMuted(player.muted());
        });

        player.on('durationchange', () => {
          setDuration(player.duration());
        });

        player.on('fullscreenchange', () => {
          setIsFullscreen(player.isFullscreen());
        });

        // STEP 5: Store player reference
        playerRef.current = player;

      } catch (error) {
        console.error('Failed to initialize Video.js:', error);
        setPlayerState('error');
      }
    };

    initializePlayer();

    // STEP 6: MANDATORY cleanup function
    return () => {
      if (player && typeof player.dispose === 'function') {
        try {
          player.dispose();
          console.log('Video.js player disposed');
        } catch (error) {
          console.error('Error disposing player:', error);
        }
      }
      playerRef.current = null;
    };
  }, [video.cloudflare_stream_id, getStreamUrl, autoplay, isMuted, showControls, onPlay, onPause, onEnded, onTimeUpdate]);

  // CRITICAL: Controls visibility management
  useEffect(() => {
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }

    if (playerState === 'playing') {
      const timeout = setTimeout(() => {
        setShowControlsOverlay(false);
      }, 3000);
      setControlsTimeout(timeout);
    } else {
      setShowControlsOverlay(true);
    }

    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [playerState, controlsTimeout]);

  // CRITICAL: Player control functions
  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    
    if (playerState === 'playing') {
      playerRef.current.pause();
    } else {
      playerRef.current.play();
    }
  }, [playerState]);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    
    const newMuted = !playerRef.current.muted();
    playerRef.current.muted(newMuted);
    setIsMuted(newMuted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!playerRef.current) return;
    
    if (playerRef.current.isFullscreen()) {
      playerRef.current.exitFullscreen();
    } else {
      playerRef.current.requestFullscreen();
    }
  }, []);

  const handleMouseMove = useCallback(() => {
    setShowControlsOverlay(true);
    
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    if (playerState === 'playing') {
      const timeout = setTimeout(() => {
        setShowControlsOverlay(false);
      }, 3000);
      setControlsTimeout(timeout);
    }
  }, [playerState, controlsTimeout]);

  // CRITICAL: Error state rendering
  if (playerState === 'error') {
    return (
      <div className={cn(
        "relative w-full aspect-video bg-black rounded-lg flex items-center justify-center",
        className
      )}>
        <div className="text-center text-white">
          <div className="text-xl mb-2">⚠️</div>
          <div className="text-sm">Failed to load video</div>
          <div className="text-xs text-gray-400 mt-1">
            {video.cloudflare_stream_id ? 'Stream not available' : 'No stream ID'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "relative w-full aspect-video bg-black rounded-lg overflow-hidden group",
        className
      )}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControlsOverlay(false)}
    >
      {/* CRITICAL: Video element with exact attributes */}
      <video
        ref={videoRef}
        className="video-js vjs-default-skin vjs-theme-city w-full h-full"
        data-setup="{}"
        playsInline
        crossOrigin="anonymous"
      />

      {/* Loading State */}
      {playerState === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Custom Controls Overlay */}
      {showControls && showControlsOverlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none">
          {/* Top Info Bar */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto">
            <div className="flex items-center space-x-3">
              <Badge variant="destructive" className="animate-pulse">
                <div className="w-2 h-2 bg-white rounded-full mr-1.5"></div>
                {video.is_live ? 'LIVE' : 'VOD'}
              </Badge>
              {video.is_live && (
                <div className="flex items-center space-x-1 text-white text-sm">
                  <Users className="w-4 h-4" />
                  <span>{formatNumber(viewerCount)}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={toggleFullscreen}
              >
                <Maximize className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Center Play Button */}
          {(playerState === 'paused' || playerState === 'ready') && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-auto">
              <Button
                variant="ghost"
                size="lg"
                className="w-20 h-20 rounded-full bg-black/50 hover:bg-black/70 text-white border-2 border-white/50"
                onClick={togglePlay}
              >
                <Play className="w-8 h-8 ml-1" />
              </Button>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-4 left-4 right-4 pointer-events-auto">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                  onClick={togglePlay}
                >
                  {playerState === 'playing' ? 
                    <Pause className="w-5 h-5" /> : 
                    <Play className="w-5 h-5" />
                  }
                </Button>
                
                <div className="text-sm">
                  {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')} / {Math.floor(duration / 60)}:{(Math.floor(duration % 60)).toString().padStart(2, '0')}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {showOverlays && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20"
                    >
                      <Heart className="w-5 h-5" />
                    </Button>
                  </>
                )}
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**⚠️ CRITICAL SONNET WARNINGS:**

1. **DO NOT modify the useEffect dependency array** - it will break Video.js initialization
2. **DO NOT remove the cleanup function** - it prevents memory leaks
3. **DO NOT change the Video.js options object** - it's configured for Cloudflare Stream
4. **DO NOT remove any event listeners** - they're all required for proper state management

**Verification Steps:**
- File created at exact path: `components/video/VideoPlayer.tsx`
- No TypeScript errors when importing
- Component renders without crashing
- Video.js initializes properly with Cloudflare Stream URLs

### Task 2: Create Optimized Video Player Wrapper ⏳

**File to Create:** `components/video/OptimizedVideoPlayer.tsx`

```typescript
'use client';

import { memo, useMemo } from 'react';
import { VideoPlayer } from './VideoPlayer';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import type { Video } from '@/lib/types';

interface OptimizedVideoPlayerProps {
  video: Video;
  autoplay?: boolean;
  className?: string;
}

// CRITICAL: Memo prevents unnecessary re-renders
const OptimizedVideoPlayerComponent = memo(function OptimizedVideoPlayer({
  video,
  autoplay = false,
  className
}: OptimizedVideoPlayerProps) {
  // CRITICAL: Memoize player props to prevent re-initialization
  const playerProps = useMemo(() => ({
    video,
    autoplay,
    muted: autoplay, // Auto-mute if autoplay for browser compliance
    showControls: true,
    showOverlays: true,
    className
  }), [video.id, video.cloudflare_stream_id, autoplay, className]);

  return (
    <ErrorBoundary fallback={<VideoPlayerError />}>
      <VideoPlayer {...playerProps} />
    </ErrorBoundary>
  );
});

// CRITICAL: Error fallback component
function VideoPlayerError() {
  return (
    <div className="w-full aspect-video bg-black rounded-lg flex items-center justify-center">
      <div className="text-center text-white">
        <div className="text-xl mb-2">⚠️</div>
        <div className="text-sm">Video player error</div>
        <div className="text-xs text-gray-400 mt-1">Please refresh the page</div>
      </div>
    </div>
  );
}

export { OptimizedVideoPlayerComponent as OptimizedVideoPlayer };
```

**Verification:** Component properly memoized and wrapped with error boundary.