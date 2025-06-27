'use client';

import React, { useState, useRef } from 'react';
import { Stream, StreamPlayerApi } from '@cloudflare/stream-react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { VideoContent } from '@/lib/types';
import { cn } from '@/lib/utils';

interface VideoPlayerSimpleProps {
  video: VideoContent;
  autoPlay?: boolean;
  className?: string;
  onEnded?: () => void;
}

export function VideoPlayerSimple({
  video,
  autoPlay = false,
  className = '',
  onEnded
}: VideoPlayerSimpleProps) {
  // Video states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [needsPlay, setNeedsPlay] = useState(!autoPlay);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const streamPlayerRef = useRef<StreamPlayerApi | null>(null);
  
  // Video event handlers
  const handleLoadedMetadata = () => {
    console.log('Video loaded successfully');
    if (streamPlayerRef.current) {
      const duration = streamPlayerRef.current.duration || video.duration || 0;
      setDuration(duration);
      setError(null);
    }
  };

  const handleTimeUpdate = () => {
    if (streamPlayerRef.current) {
      const currentTime = streamPlayerRef.current.currentTime;
      setCurrentTime(currentTime);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    onEnded?.();
  };

  const handlePlay = () => {
    setIsPlaying(true);
    console.log('Video started playing');
  };

  const handlePause = () => {
    setIsPlaying(false);
    console.log('Video paused');
  };

  const handleError = (error: any) => {
    console.error('Stream component error:', error);
    setError('Failed to load video. Please try again.');
  };


  // Player controls
  const togglePlayPause = () => {
    setHasUserInteracted(true);
    setNeedsPlay(false);
    console.log('Play button clicked - user interaction registered');
  };

  const toggleMute = () => {
    if (streamPlayerRef.current) {
      const newMuted = !isMuted;
      streamPlayerRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!video.cloudflare_video_id) {
    return (
      <div className={cn("relative w-full h-full bg-black flex items-center justify-center", className)}>
        <div className="text-white text-center">
          <p className="text-lg mb-2">No video ID available</p>
          <p className="text-sm text-gray-400">This video cannot be played</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative w-full h-full bg-black", className)}>
      {/* Basic Cloudflare Stream Component - Back to Working Version */}
      <Stream
        ref={streamPlayerRef}
        src={video.cloudflare_video_id}
        controls={true}
        autoPlay={hasUserInteracted && !needsPlay}
        onCanPlay={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleVideoEnded}
        onError={handleError}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Error Display */}
      {error && (
        <div className="absolute inset-0 bg-black/90 flex items-center justify-center z-30">
          <div className="text-center text-white">
            <p className="text-lg mb-4">{error}</p>
            <Button
              onClick={() => {
                setError(null);
                window.location.reload();
              }}
              className="bg-white text-black hover:bg-gray-200"
            >
              Retry
            </Button>
          </div>
        </div>
      )}

      {/* Play Button Overlay */}
      {needsPlay && !error && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
          <div className="text-center">
            <Button
              onClick={togglePlayPause}
              size="lg"
              className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-4"
            >
              <Play className="w-6 h-6 mr-2" />
              Play Video
            </Button>
            <p className="text-white text-sm opacity-75 mt-2">
              Basic video player (no ads)
            </p>
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="absolute top-4 right-4 z-30 bg-black/50 text-white p-2 rounded text-xs">
        <div>Video ID: {video.cloudflare_video_id}</div>
        <div>Playing: {isPlaying ? 'Yes' : 'No'}</div>
        <div>Duration: {formatTime(duration)}</div>
        <div>Current: {formatTime(currentTime)}</div>
      </div>

      {/* Custom controls hidden since we're using native controls */}
    </div>
  );
}