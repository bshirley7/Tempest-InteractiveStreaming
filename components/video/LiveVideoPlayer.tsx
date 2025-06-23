'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { StreamVideo, StreamVideoApi } from '@cloudflare/stream-react';
import { Play, Pause, Volume2, VolumeX, Maximize, Radio, Users, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { ScheduleItem, VideoPlayerState, VideoPlayerConfig } from '@/lib/types';
import { STREAM_CONFIG } from '@/lib/constants';

interface LiveVideoPlayerProps {
  program: ScheduleItem;
  config?: Partial<VideoPlayerConfig>;
  onStateChange?: (state: VideoPlayerState) => void;
  onViewerCountChange?: (count: number) => void;
  autoPlay?: boolean;
  showChat?: boolean;
  className?: string;
}

export function LiveVideoPlayer({
  program,
  config = {},
  onStateChange,
  onViewerCountChange,
  autoPlay = true,
  showChat = true,
  className = '',
}: LiveVideoPlayerProps) {
  const streamRef = useRef<StreamVideoApi>(null);
  const playerContainerRef = useRef<HTMLDivElement>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  
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

  const [liveState, setLiveState] = useState({
    isLive: program.isLive || false,
    viewerCount: Math.floor(Math.random() * 500) + 50, // Simulated viewer count
    chatCount: Math.floor(Math.random() * 100) + 10,
    connectionQuality: 'good' as 'poor' | 'fair' | 'good' | 'excellent',
  });

  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  const playerConfig: VideoPlayerConfig = {
    autoplay: autoPlay,
    controls: false,
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

  // Start heartbeat for live stream monitoring
  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }

    heartbeatRef.current = setInterval(() => {
      // Simulate connection quality monitoring
      const qualities = ['poor', 'fair', 'good', 'excellent'] as const;
      const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
      
      // Simulate viewer count fluctuation
      const viewerChange = Math.floor(Math.random() * 20) - 10;
      const newViewerCount = Math.max(1, liveState.viewerCount + viewerChange);
      
      setLiveState(prev => ({
        ...prev,
        connectionQuality: randomQuality,
        viewerCount: newViewerCount,
        chatCount: Math.floor(newViewerCount * 0.2) + Math.floor(Math.random() * 10),
      }));

      onViewerCountChange?.(newViewerCount);
    }, STREAM_CONFIG.HEARTBEAT_INTERVAL);
  }, [liveState.viewerCount, onViewerCountChange]);

  // Stream event handlers
  const handleStreamReady = useCallback(() => {
    updatePlayerState({ isLoading: false });
    startHeartbeat();
  }, [updatePlayerState, startHeartbeat]);

  const handlePlay = useCallback(() => {
    updatePlayerState({ isPlaying: true, isPaused: false });
  }, [updatePlayerState]);

  const handlePause = useCallback(() => {
    updatePlayerState({ isPlaying: false, isPaused: true });
  }, [updatePlayerState]);

  const handleError = useCallback((error: any) => {
    console.error('Live stream error:', error);
    updatePlayerState({ 
      isError: true, 
      isLoading: false,
      error: 'Live stream connection failed. Attempting to reconnect...' 
    });
    
    // Attempt reconnection after delay
    setTimeout(() => {
      if (streamRef.current) {
        streamRef.current.load();
        updatePlayerState({ isError: false, isLoading: true });
      }
    }, STREAM_CONFIG.RETRY_DELAY);
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current);
      }
    };
  }, [controlsTimeout]);

  // Get connection quality color
  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'fair': return 'text-yellow-400';
      case 'poor': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Format viewer count
  const formatViewerCount = (count: number): string => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (playerState.isError) {
    return (
      <div className={`relative bg-black rounded-lg flex flex-col items-center justify-center min-h-[400px] ${className}`}>
        <div className="text-center text-white mb-4">
          <Radio className="h-12 w-12 mx-auto mb-4 text-red-400" />
          <p className="text-lg mb-2">Live Stream Unavailable</p>
          <p className="text-sm text-gray-400">{playerState.error}</p>
        </div>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          className="text-white border-white hover:bg-white hover:text-black"
        >
          Retry Connection
        </Button>
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
        src={program.metadata?.cloudflareId || program.contentId || ''}
        controls={false}
        autoPlay={playerConfig.autoplay}
        muted={playerConfig.muted}
        onCanPlay={handleStreamReady}
        onPlay={handlePlay}
        onPause={handlePause}
        onError={handleError}
        className="w-full h-full"
        style={{ aspectRatio: '16/9' }}
      />

      {/* Loading Overlay */}
      {playerState.isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p>Connecting to live stream...</p>
          </div>
        </div>
      )}

      {/* Live Indicators */}
      <div 
        className={`absolute top-4 left-4 right-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            {/* Live Badge */}
            {liveState.isLive && (
              <Badge variant="destructive" className="bg-red-600 text-white">
                <Radio className="h-3 w-3 mr-1 animate-pulse" />
                LIVE
              </Badge>
            )}
            
            {/* Program Info */}
            <div>
              <h3 className="text-white text-lg font-semibold mb-1">{program.title}</h3>
              {program.description && (
                <p className="text-white/80 text-sm line-clamp-2">{program.description}</p>
              )}
            </div>
          </div>

          {/* Viewer Stats */}
          <div className="text-right space-y-1">
            <div className="flex items-center text-white text-sm">
              <Users className="h-4 w-4 mr-1" />
              <span>{formatViewerCount(liveState.viewerCount)}</span>
            </div>
            
            {showChat && (
              <div className="flex items-center text-white/80 text-sm">
                <MessageCircle className="h-4 w-4 mr-1" />
                <span>{liveState.chatCount}</span>
              </div>
            )}
            
            {/* Connection Quality */}
            <div className={`text-xs ${getQualityColor(liveState.connectionQuality)}`}>
              {liveState.connectionQuality.toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Controls */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Live Progress Indicator (Red bar for live streams) */}
        {liveState.isLive && (
          <div className="mb-4">
            <div className="w-full h-1 bg-white/30 rounded-full">
              <div className="h-full bg-red-500 rounded-full animate-pulse" style={{ width: '100%' }} />
            </div>
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* Play/Pause - Limited for live streams */}
            <Button
              size="sm"
              variant="ghost"
              onClick={togglePlayPause}
              className="text-white hover:bg-white/20"
              disabled={liveState.isLive}
            >
              {playerState.isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5" />
              )}
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

            {/* Live Status */}
            {liveState.isLive ? (
              <span className="text-red-400 text-sm font-medium">
                LIVE NOW
              </span>
            ) : (
              <span className="text-white/60 text-sm">
                Scheduled Program
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Quality Indicator */}
            <Badge 
              variant="outline" 
              className={`text-xs border-white/30 ${getQualityColor(liveState.connectionQuality)}`}
            >
              {liveState.connectionQuality}
            </Badge>

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

      {/* Channel Branding */}
      <div 
        className={`absolute top-4 right-4 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="bg-black/50 rounded-lg px-3 py-1">
          <span className="text-white text-sm font-medium">
            {program.channelId.toUpperCase()}
          </span>
        </div>
      </div>
    </div>
  );
}