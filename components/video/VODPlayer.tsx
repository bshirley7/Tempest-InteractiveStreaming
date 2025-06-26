'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stream, StreamPlayerApi } from '@cloudflare/stream-react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VideoContent, VideoPlayerState, VideoPlayerConfig } from '@/lib/types';
import { VIDEO_QUALITIES, STREAM_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface VODPlayerProps {
  video: VideoContent;
  config?: Partial<VideoPlayerConfig>;
  onStateChange?: (state: VideoPlayerState) => void;
  onProgress?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
  autoPlay?: boolean;
  className?: string;
}

export function VODPlayer({
  video,
  config = {},
  onStateChange,
  onProgress,
  onEnded,
  autoPlay = false,
  className = '',
}: VODPlayerProps) {
  const streamRef = useRef<StreamPlayerApi>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  
  const [playerState, setPlayerState] = useState<VideoPlayerState>({
    isPlaying: false,
    isPaused: true,
    isLoading: true,
    isError: false,
    currentTime: 0,
    duration: 0,
    volume: 80,
    quality: 'auto',
    isFullscreen: false,
  });

  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const playerConfig: VideoPlayerConfig = {
    autoplay: autoPlay,
    controls: false, // Using custom controls with quality selection
    muted: false,
    loop: false,
    quality: 'auto',
    volume: 80,
    playbackRate: 1,
    subtitles: false,
    fullscreen: true,
    ...config,
  };

  // Update player state and notify parent
  const updatePlayerState = useCallback((updates: Partial<VideoPlayerState>) => {
    setPlayerState(prev => {
      const newState = { ...prev, ...updates };
      onStateChange?.(newState);
      return newState;
    });
  }, [onStateChange]);

  // Handle mouse movement for control visibility
  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    const timeout = setTimeout(() => {
      if (playerState.isPlaying) {
        setShowControls(false);
      }
    }, 3000);
    
    setControlsTimeout(timeout);
  }, [controlsTimeout, playerState.isPlaying]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);

  // Find the actual video element
  useEffect(() => {
    const findVideoElement = () => {
      if (playerContainerRef.current) {
        // Try to find video element
        let videoElement = playerContainerRef.current.querySelector('video');
        
        // If no direct video, try looking in iframe
        if (!videoElement) {
          const iframe = playerContainerRef.current.querySelector('iframe');
          if (iframe) {
            console.log('Found iframe, trying to access video inside');
            try {
              // Try to access iframe content (may fail due to CORS)
              videoElement = iframe.contentDocument?.querySelector('video');
            } catch (e) {
              console.log('Cannot access iframe content due to CORS');
            }
          }
        }
        
        // Try alternative selectors
        if (!videoElement) {
          videoElement = playerContainerRef.current.querySelector('[data-testid="videoPlayer"] video') ||
                       playerContainerRef.current.querySelector('.cf-player video') ||
                       playerContainerRef.current.querySelector('video[src], video[srcObject]');
        }
        
        if (videoElement) {
          videoRef.current = videoElement;
          console.log('Video element found:', videoElement);
          console.log('Video src:', videoElement.src);
          console.log('Video readyState:', videoElement.readyState);
          return true;
        } else {
          console.log('No video element found. Container contents:');
          console.log(playerContainerRef.current.innerHTML);
        }
      }
      return false;
    };

    // Try to find video element with multiple attempts
    let attempts = 0;
    const maxAttempts = 10;
    
    const tryFind = () => {
      attempts++;
      if (findVideoElement() || attempts >= maxAttempts) {
        return;
      }
      setTimeout(tryFind, 500);
    };
    
    tryFind();
  }, []);

  // Debug stream ref
  useEffect(() => {
    if (streamRef.current) {
      console.log('Stream ref initialized:', streamRef.current);
      console.log('Stream ref methods:', Object.getOwnPropertyNames(streamRef.current));
    }
  }, [streamRef.current]);

  // Stream event handlers
  const handleStreamReady = useCallback(() => {
    console.log('Stream ready! Video ID:', video?.cloudflare_video_id);
    updatePlayerState({ isLoading: false });
    
    if (streamRef.current) {
      const duration = streamRef.current.duration || video?.duration || 0;
      console.log('Stream duration:', duration);
      console.log('Stream ref available:', streamRef.current);
      
      // Initialize player state with current values
      updatePlayerState({ 
        duration,
        volume: streamRef.current.volume * 100 || 80,
        currentTime: streamRef.current.currentTime || 0,
        isPlaying: !streamRef.current.paused,
        isPaused: streamRef.current.paused
      });
    }
  }, [updatePlayerState, video]);

  const handlePlay = useCallback(() => {
    updatePlayerState({ isPlaying: true, isPaused: false });
  }, [updatePlayerState]);

  const handlePause = useCallback(() => {
    updatePlayerState({ isPlaying: false, isPaused: true });
  }, [updatePlayerState]);

  const handleTimeUpdate = useCallback(() => {
    if (streamRef.current) {
      const currentTime = streamRef.current.currentTime || 0;
      const duration = streamRef.current.duration || video?.duration || 0;
      
      updatePlayerState({ currentTime, duration });
      onProgress?.(currentTime, duration);
    }
  }, [updatePlayerState, onProgress, video.duration]);

  const handleEnded = useCallback(() => {
    updatePlayerState({ isPlaying: false, isPaused: true });
    onEnded?.();
  }, [updatePlayerState, onEnded]);

  const handleError = useCallback((error: any) => {
    console.error('Video player error:', error);
    console.error('Video ID:', video?.cloudflare_video_id);
    console.error('Video object:', video);
    updatePlayerState({ 
      isError: true, 
      isLoading: false,
      error: 'Failed to load video. Please try again.' 
    });
  }, [updatePlayerState, video]);

  // Control handlers
  const togglePlayPause = useCallback(() => {
    const video = videoRef.current || streamRef.current;
    if (!video) {
      console.log('No video element available');
      return;
    }

    console.log('Toggle play/pause, current state:', playerState.isPlaying);
    
    if (playerState.isPlaying) {
      video.pause();
    } else {
      video.play().catch(error => {
        console.error('Play failed:', error);
        // If autoplay fails, try to play muted
        video.muted = true;
        video.play().catch(e => console.error('Muted play also failed:', e));
      });
    }
  }, [playerState.isPlaying]);

  const handleSeek = useCallback((time: number) => {
    const video = videoRef.current || streamRef.current;
    if (video) {
      console.log('Seeking to:', time);
      video.currentTime = time;
      updatePlayerState({ currentTime: time });
    }
  }, [updatePlayerState]);

  const handleVolumeChange = useCallback((volume: number) => {
    const video = videoRef.current || streamRef.current;
    if (video) {
      console.log('Setting volume to:', volume);
      video.volume = volume / 100;
      updatePlayerState({ volume, isMuted: volume === 0 });
    }
  }, [updatePlayerState]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current || streamRef.current;
    if (video) {
      const newMutedState = !video.muted;
      console.log('Toggling mute to:', newMutedState);
      video.muted = newMutedState;
      updatePlayerState({ 
        volume: newMutedState ? 0 : playerState.volume,
        isMuted: newMutedState 
      });
    }
  }, [updatePlayerState, playerState.volume]);

  const skipTime = useCallback((seconds: number) => {
    const video = videoRef.current || streamRef.current;
    if (video) {
      const newTime = Math.max(0, Math.min(playerState.duration, playerState.currentTime + seconds));
      handleSeek(newTime);
    }
  }, [playerState.currentTime, playerState.duration, handleSeek]);

  const toggleFullscreen = useCallback(() => {
    if (!playerContainerRef.current) return;

    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen();
      updatePlayerState({ isFullscreen: true });
    } else {
      document.exitFullscreen();
      updatePlayerState({ isFullscreen: false });
    }
  }, [updatePlayerState]);

  const handleQualityChange = useCallback((quality: string) => {
    console.log('Changing quality to:', quality);
    updatePlayerState({ quality });
    
    // For Cloudflare Stream, quality is managed automatically
    // but we can try to influence it through the player API
    if (streamRef.current && typeof streamRef.current.setQuality === 'function') {
      streamRef.current.setQuality(quality);
    }
  }, [updatePlayerState]);

  // Format time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Progress percentage
  const progressPercentage = playerState.duration > 0 
    ? (playerState.currentTime / playerState.duration) * 100 
    : 0;

  // Check if video prop is valid
  if (!video || !video.cloudflare_video_id) {
    return (
      <div className={`relative bg-black rounded-lg flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center text-white">
          <p className="text-lg mb-4">No video available</p>
          <p className="text-sm text-gray-400">Video ID is missing</p>
        </div>
      </div>
    );
  }

  if (playerState.isError) {
    return (
      <div className={`relative bg-black rounded-lg flex items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center text-white">
          <p className="text-lg mb-4">Failed to load video</p>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline"
            className="text-white border-white hover:bg-white hover:text-black"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={playerContainerRef}
      className={cn("video-container-16-9 rounded-lg overflow-hidden group", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playerState.isPlaying && setShowControls(false)}
    >
      {/* Video Stream */}
      <Stream
        ref={streamRef}
        src={video.cloudflare_video_id}
        controls={true}
        autoPlay={playerConfig.autoplay}
        muted={playerConfig.muted}
        loop={playerConfig.loop}
        onCanPlay={handleStreamReady}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Click to Play Overlay - Hidden while using native controls */}
      {false && !playerState.isPlaying && !playerState.isLoading && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-black/20 cursor-pointer"
          onClick={togglePlayPause}
        >
          <div className="bg-black/60 rounded-full p-4 hover:bg-black/80 transition-colors">
            <Play className="h-12 w-12 text-white" />
          </div>
        </div>
      )}

      {/* Fallback iframe for debugging */}
      {playerState.isError && (
        <iframe
          src={`https://customer-ydgwaifmhmzkp7in.cloudflarestream.com/${video.cloudflare_video_id}/iframe?autoplay=${playerConfig.autoplay ? 'true' : 'false'}`}
          className="max-w-full max-h-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
          style={{ 
            border: 'none',
            width: 'auto',
            height: 'auto',
            aspectRatio: '16/9'
          }}
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
        />
      )}

      {/* Loading Overlay */}
      {playerState.isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Custom Controls - Temporarily hidden to debug video element access */}
      {false && (
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
        >
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="relative w-full h-1 bg-white/30 rounded-full cursor-pointer">
            <div 
              className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-150"
              style={{ width: `${progressPercentage}%` }}
            />
            <input
              type="range"
              min="0"
              max={playerState.duration}
              value={playerState.currentTime}
              onChange={(e) => handleSeek(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Play/Pause */}
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePlayPause}
              className="text-white hover:bg-white/20"
            >
              {playerState.isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
            </Button>

            {/* Skip Controls */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => skipTime(-10)}
              className="text-white hover:bg-white/20"
            >
              <SkipBack className="h-4 w-4" />
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => skipTime(10)}
              className="text-white hover:bg-white/20"
            >
              <SkipForward className="h-4 w-4" />
            </Button>

            {/* Volume Controls */}
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {playerState.volume === 0 || (videoRef.current || streamRef.current)?.muted ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              
              <div className="w-20">
                <Slider
                  value={[playerState.volume]}
                  onValueChange={([value]) => handleVolumeChange(value)}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>

            {/* Time Display */}
            <span className="text-white text-sm">
              {formatTime(playerState.currentTime)} / {formatTime(playerState.duration)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* Quality Settings */}
            <Select value={playerState.quality} onValueChange={handleQualityChange}>
              <SelectTrigger className="w-20 h-8 text-white border-white/30 bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VIDEO_QUALITIES.map((quality) => (
                  <SelectItem key={quality.value} value={quality.value}>
                    {quality.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Settings */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="text-white hover:bg-white/20"
            >
              <Settings className="h-4 w-4" />
            </Button>

            {/* Fullscreen */}
            <Button
              size="sm"
              variant="ghost"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              <Maximize className="h-4 w-4" />
            </Button>
          </div>
        </div>
        </div>
      )}

      {/* Video Info Overlay - Positioned to avoid back button */}
      <div 
        className={`absolute top-0 left-0 right-0 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Gradient background with purple tint */}
        <div className="bg-gradient-to-b from-purple-900/80 via-indigo-600/40 to-transparent pb-8 pt-24 px-6">
          <div className="max-w-3xl">
            <h3 className="text-white text-xl font-semibold mb-2">
              {video.title}
            </h3>
            {video.description && (
              <p className="text-white/90 text-sm line-clamp-3">
                {video.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}