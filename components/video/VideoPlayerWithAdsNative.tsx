'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Stream, StreamPlayerApi } from '@cloudflare/stream-react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { VideoContent } from '@/lib/types';
import { cn } from '@/lib/utils';

interface VideoPlayerWithAdsNativeProps {
  video: VideoContent;
  autoPlay?: boolean;
  className?: string;
  onEnded?: () => void;
}

export function VideoPlayerWithAdsNative({
  video,
  autoPlay = false,
  className = '',
  onEnded
}: VideoPlayerWithAdsNativeProps) {
  // Video states
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [needsPlay, setNeedsPlay] = useState(!autoPlay);
  
  // Ad states
  const [isShowingAd, setIsShowingAd] = useState(false);
  const [currentAd, setCurrentAd] = useState<any>(null);
  
  // Refs
  const streamPlayerRef = useRef<StreamPlayerApi | null>(null);
  
  // Generate VAST URL for ads - disable ads if the video itself is an advertisement
  const [enableAds, setEnableAds] = useState(video.content_type !== 'advertisement');
  const [useTestVast, setUseTestVast] = useState(false); // For debugging
  
  const vastUrl = enableAds 
    ? (useTestVast 
        ? `/api/ads/test-vast` 
        : `/api/ads/vast?position=pre_roll&content_id=${video.id}`)
    : undefined;
  
  // Video event handlers
  const handleLoadedMetadata = () => {
    if (streamPlayerRef.current) {
      const duration = streamPlayerRef.current.duration || video.duration || 0;
      setDuration(duration);
      console.log('Video loaded, duration:', duration);
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
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  // Ad event handlers
  const handleAdStart = (event: any) => {
    console.log('Ad started:', event);
    setIsShowingAd(true);
    setCurrentAd({ title: 'Advertisement' }); // You could extract ad info from event
  };

  const handleAdEnd = (event: any) => {
    console.log('Ad ended:', event);
    setIsShowingAd(false);
    setCurrentAd(null);
  };

  const handleAdTimeout = (event: any) => {
    console.log('Ad timeout:', event);
    setIsShowingAd(false);
    setCurrentAd(null);
    // Optionally disable ads if they consistently fail
    // setEnableAds(false);
  };

  // Player controls
  const togglePlayPause = () => {
    setHasUserInteracted(true);
    setNeedsPlay(false);
    
    if (streamPlayerRef.current) {
      if (isPlaying) {
        streamPlayerRef.current.pause();
      } else {
        streamPlayerRef.current.play().catch(console.error);
      }
    }
  };

  const toggleMute = () => {
    if (streamPlayerRef.current) {
      const newMuted = !isMuted;
      streamPlayerRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    if (streamPlayerRef.current) {
      streamPlayerRef.current.volume = newVolume;
      setVolume(newVolume);
      setIsMuted(newVolume === 0);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Update enableAds when video content changes
  useEffect(() => {
    setEnableAds(video.content_type !== 'advertisement');
  }, [video.content_type]);

  return (
    <div className={cn("relative w-full h-full bg-black", className)}>
      {/* Cloudflare Stream Component with Native Ad Support */}
      <Stream
        ref={streamPlayerRef}
        src={video.cloudflare_video_id}
        controls={false}
        autoPlay={hasUserInteracted && !needsPlay}
        adUrl={vastUrl}
        onCanPlay={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={handleVideoEnded}
        onStreamAdStart={handleAdStart}
        onStreamAdEnd={handleAdEnd}
        onStreamAdTimeout={handleAdTimeout}
        onError={(error) => {
          console.error('Stream error:', error, 'Video ID:', video.cloudflare_video_id);
          // If there's an error and we're trying to use ads, disable them and retry
          if (enableAds) {
            console.log('Disabling ads due to error and retrying...');
            setEnableAds(false);
          }
        }}
        onStreamAdStart={handleAdStart}
        onStreamAdEnd={handleAdEnd}
        onStreamAdTimeout={handleAdTimeout}
        style={{ width: '100%', height: '100%' }}
      />

      {/* Play Button Overlay */}
      {needsPlay && (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-20">
          <div className="text-center">
            <Button
              onClick={togglePlayPause}
              size="lg"
              className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-4 mb-2"
            >
              <Play className="w-6 h-6 mr-2" />
              Play Video
            </Button>
            <p className="text-white text-sm opacity-75 mt-2">
              {enableAds ? (useTestVast ? 'Test ad will play' : 'Ads may play before your video') : 'No ads will play'}
            </p>
          </div>
        </div>
      )}

      {/* Debug Controls - Top Right */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        {enableAds && (
          <Button
            onClick={() => setUseTestVast(!useTestVast)}
            size="sm"
            variant="outline"
            className="text-white border-white bg-black/50 hover:bg-white hover:text-black text-xs"
          >
            {useTestVast ? 'Real Ads' : 'Test Ad'}
          </Button>
        )}
        <Button
          onClick={() => setEnableAds(!enableAds)}
          size="sm"
          variant="outline"
          className="text-white border-white bg-black/50 hover:bg-white hover:text-black text-xs"
        >
          {enableAds ? 'No Ads' : 'Ads On'}
        </Button>
      </div>
      

      {/* Ad Info Indicator */}
      {isShowingAd && currentAd && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-yellow-500 text-black px-3 py-1 rounded-lg text-sm font-bold">
            ADVERTISEMENT
          </div>
        </div>
      )}

      {/* Basic Video Controls */}
      {!needsPlay && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-black/80 rounded-lg p-3 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                onClick={togglePlayPause}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </Button>
              
              <Button
                onClick={toggleMute}
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
            
            <div className="text-white text-sm">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}