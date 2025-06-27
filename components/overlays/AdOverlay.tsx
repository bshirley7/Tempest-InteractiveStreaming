'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Stream } from '@cloudflare/stream-react';
import { Button } from '@/components/ui/button';
import { X, SkipForward, Volume2, VolumeX, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AdContent {
  id: string;
  title: string;
  description?: string;
  type: 'video' | 'image';
  // For video ads
  cloudflare_video_id?: string;
  duration?: number;
  // For image ads
  image_url?: string;
  display_duration?: number;
  // Common properties
  click_url?: string;
  call_to_action?: string;
  skip_after_seconds?: number;
  position: 'pre_roll' | 'mid_roll' | 'end_roll' | 'overlay';
}

interface AdOverlayProps {
  ad: AdContent;
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
  onClose?: () => void;
  onInteraction?: (action: string) => void;
  className?: string;
  allowSkip?: boolean;
  allowClose?: boolean;
  showControls?: boolean;
}

export function AdOverlay({
  ad,
  isVisible,
  onComplete,
  onSkip,
  onClose,
  onInteraction,
  className = '',
  allowSkip = true,
  allowClose = false,
  showControls = true
}: AdOverlayProps) {
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [skipAvailable, setSkipAvailable] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  
  const videoRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const skipTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize ad when it becomes visible
  useEffect(() => {
    if (isVisible && ad) {
      const duration = ad.type === 'video' ? (ad.duration || 15) : (ad.display_duration || 10);
      setTimeRemaining(duration);
      setSkipAvailable(false);
      setHasStarted(false);
      
      // Start skip timer if skip is allowed
      if (allowSkip && ad.skip_after_seconds && ad.skip_after_seconds > 0) {
        skipTimerRef.current = setTimeout(() => {
          setSkipAvailable(true);
        }, ad.skip_after_seconds * 1000);
      }

      // For image ads, start countdown immediately
      if (ad.type === 'image') {
        setHasStarted(true);
        startImageTimer(duration);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (skipTimerRef.current) {
        clearTimeout(skipTimerRef.current);
      }
    };
  }, [isVisible, ad, allowSkip]);

  // Start image ad timer
  const startImageTimer = (duration: number) => {
    let timeLeft = duration;
    setTimeRemaining(timeLeft);
    
    timerRef.current = setInterval(() => {
      timeLeft -= 1;
      setTimeRemaining(timeLeft);
      
      if (timeLeft <= 0) {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        onComplete();
      }
    }, 1000);
  };

  // Handle video events
  const handleVideoReady = useCallback(() => {
    if (videoRef.current) {
      setHasStarted(true);
      const duration = videoRef.current.duration || ad.duration || 15;
      setTimeRemaining(Math.ceil(duration));
    }
  }, [ad.duration]);

  const handleVideoPlay = useCallback(() => {
    setIsPlaying(true);
    onInteraction?.('play');
  }, [onInteraction]);

  const handleVideoPause = useCallback(() => {
    setIsPlaying(false);
    onInteraction?.('pause');
  }, [onInteraction]);

  const handleVideoTimeUpdate = useCallback(() => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime || 0;
      const duration = videoRef.current.duration || ad.duration || 15;
      const remaining = Math.ceil(duration - currentTime);
      setTimeRemaining(Math.max(0, remaining));
    }
  }, [ad.duration]);

  const handleVideoEnded = useCallback(() => {
    setIsPlaying(false);
    onInteraction?.('complete');
    onComplete();
  }, [onComplete, onInteraction]);

  // Handle user interactions
  const handleSkip = () => {
    onInteraction?.('skip');
    onSkip();
  };

  const handleClose = () => {
    onInteraction?.('close');
    onClose?.();
  };

  const handleClick = () => {
    onInteraction?.('click');
    if (ad.click_url) {
      window.open(ad.click_url, '_blank', 'noopener,noreferrer');
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      const newMutedState = !videoRef.current.muted;
      videoRef.current.muted = newMutedState;
      setIsMuted(newMutedState);
      onInteraction?.(newMutedState ? 'mute' : 'unmute');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isVisible || !ad) {
    return null;
  }

  return (
    <div className={cn(
      "absolute inset-0 z-50 bg-black/95 flex items-center justify-center",
      className
    )}>
      {/* Ad Content */}
      <div className="relative w-full h-full">
        {/* Video Ad */}
        {ad.type === 'video' && ad.cloudflare_video_id && (
          <Stream
            ref={videoRef}
            src={ad.cloudflare_video_id}
            controls={false}
            autoPlay={true}
            muted={isMuted}
            onCanPlay={handleVideoReady}
            onPlay={handleVideoPlay}
            onPause={handleVideoPause}
            onTimeUpdate={handleVideoTimeUpdate}
            onEnded={handleVideoEnded}
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        )}

        {/* Image Ad */}
        {ad.type === 'image' && ad.image_url && (
          <div 
            className="w-full h-full flex items-center justify-center cursor-pointer"
            onClick={ad.click_url ? handleClick : undefined}
          >
            <img
              src={ad.image_url}
              alt={ad.title}
              className="max-w-full max-h-full object-contain"
              onLoad={() => setHasStarted(true)}
            />
          </div>
        )}

        {/* Ad Controls Overlay */}
        {showControls && hasStarted && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Top Bar */}
            <div className="absolute top-0 left-0 right-0 p-4">
              <div className="flex items-center justify-between">
                {/* Ad Info */}
                <div className="flex items-center space-x-3 pointer-events-auto">
                  <div className="bg-yellow-500 text-black px-3 py-1 rounded-full text-xs font-bold">
                    AD
                  </div>
                  <div className="bg-black/80 backdrop-blur-sm rounded-lg px-3 py-2">
                    <p className="text-white text-sm font-medium">{ad.title}</p>
                    <p className="text-gray-300 text-xs">
                      {timeRemaining > 0 ? `${timeRemaining}s remaining` : 'Finishing...'}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center space-x-2 pointer-events-auto">
                  {/* Volume Control (Video Only) */}
                  {ad.type === 'video' && (
                    <Button
                      onClick={toggleMute}
                      size="sm"
                      variant="ghost"
                      className="text-white bg-black/50 hover:bg-black/70"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </Button>
                  )}

                  {/* Close Button */}
                  {allowClose && (
                    <Button
                      onClick={handleClose}
                      size="sm"
                      variant="ghost"
                      className="text-white bg-black/50 hover:bg-black/70"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center justify-between">
                {/* Call to Action */}
                {ad.call_to_action && ad.click_url && (
                  <Button
                    onClick={handleClick}
                    className="bg-white text-black hover:bg-gray-200 pointer-events-auto"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {ad.call_to_action}
                  </Button>
                )}

                {/* Skip Button */}
                {allowSkip && skipAvailable && (
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    className="bg-black/50 border-white/30 text-white hover:bg-white/20 pointer-events-auto ml-auto"
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Skip Ad
                  </Button>
                )}

                {/* Skip Timer */}
                {allowSkip && !skipAvailable && ad.skip_after_seconds && (
                  <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm ml-auto">
                    Skip in {Math.max(0, ad.skip_after_seconds - (ad.type === 'video' ? 
                      ((ad.duration || 15) - timeRemaining) : 
                      ((ad.display_duration || 10) - timeRemaining)
                    ))}s
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div 
                className="h-full bg-white transition-all duration-1000"
                style={{
                  width: `${100 - (timeRemaining / (ad.type === 'video' ? (ad.duration || 15) : (ad.display_duration || 10)) * 100)}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Click Overlay for Image Ads */}
        {ad.type === 'image' && ad.click_url && (
          <div 
            className="absolute inset-0 cursor-pointer flex items-center justify-center"
            onClick={handleClick}
          >
            <div className="absolute inset-0 bg-transparent hover:bg-white/5 transition-colors" />
          </div>
        )}
      </div>
    </div>
  );
}