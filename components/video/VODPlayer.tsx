'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { StreamVideo, StreamVideoApi } from '@cloudflare/stream-react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, SkipBack, SkipForward } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VideoContent, VideoPlayerState, VideoPlayerConfig } from '@/lib/types';
import { VIDEO_QUALITIES, STREAM_CONFIG } from '@/lib/constants';

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
  const streamRef = useRef<StreamVideoApi>(null);
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
    controls: false, // We'll use custom controls
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

  // Stream event handlers
  const handleStreamReady = useCallback(() => {
    updatePlayerState({ isLoading: false });
    
    if (streamRef.current) {
      const duration = streamRef.current.duration || video.duration || 0;
      updatePlayerState({ duration });
    }
  }, [updatePlayerState, video.duration]);

  const handlePlay = useCallback(() => {
    updatePlayerState({ isPlaying: true, isPaused: false });
  }, [updatePlayerState]);

  const handlePause = useCallback(() => {
    updatePlayerState({ isPlaying: false, isPaused: true });
  }, [updatePlayerState]);

  const handleTimeUpdate = useCallback(() => {
    if (streamRef.current) {
      const currentTime = streamRef.current.currentTime || 0;
      const duration = streamRef.current.duration || video.duration || 0;
      
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
    updatePlayerState({ 
      isError: true, 
      isLoading: false,
      error: 'Failed to load video. Please try again.' 
    });
  }, [updatePlayerState]);

  // Control handlers
  const togglePlayPause = useCallback(() => {
    if (!streamRef.current) return;

    if (playerState.isPlaying) {
      streamRef.current.pause();
    } else {
      streamRef.current.play();
    }
  }, [playerState.isPlaying]);

  const handleSeek = useCallback((time: number) => {
    if (streamRef.current) {
      streamRef.current.currentTime = time;
      updatePlayerState({ currentTime: time });
    }
  }, [updatePlayerState]);

  const handleVolumeChange = useCallback((volume: number) => {
    if (streamRef.current) {
      streamRef.current.volume = volume / 100;
      updatePlayerState({ volume });
    }
  }, [updatePlayerState]);

  const toggleMute = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.muted = !streamRef.current.muted;
    }
  }, []);

  const skipTime = useCallback((seconds: number) => {
    if (streamRef.current) {
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
    updatePlayerState({ quality });
    // Note: Cloudflare Stream automatically handles quality switching
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
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => playerState.isPlaying && setShowControls(false)}
    >
      {/* Video Stream */}
      <StreamVideo
        ref={streamRef}
        src={video.cloudflare_video_id}
        controls={false}
        autoPlay={playerConfig.autoplay}
        muted={playerConfig.muted}
        loop={playerConfig.loop}
        onCanPlay={handleStreamReady}
        onPlay={handlePlay}
        onPause={handlePause}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleError}
        className="w-full h-full"
        style={{ aspectRatio: '16/9' }}
      />

      {/* Loading Overlay */}
      {playerState.isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Custom Controls */}
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
                {playerState.volume === 0 ? (
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

      {/* Video Info Overlay */}
      <div 
        className={`absolute top-4 left-4 right-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <h3 className="text-white text-lg font-semibold mb-1">{video.title}</h3>
        {video.description && (
          <p className="text-white/80 text-sm line-clamp-2">{video.description}</p>
        )}
      </div>
    </div>
  );
}