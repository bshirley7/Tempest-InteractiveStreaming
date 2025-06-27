'use client';

import React, { useState, useRef } from 'react';
import { Stream, StreamPlayerApi } from '@cloudflare/stream-react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { VideoContent } from '@/lib/types';
import { cn } from '@/lib/utils';

interface VideoPlayerWithAdsProps {
  video: VideoContent;
  autoPlay?: boolean;
  className?: string;
  onEnded?: () => void;
}

export function VideoPlayerWithAds({
  video,
  autoPlay = false,
  className = '',
  onEnded
}: VideoPlayerWithAdsProps) {
  // Video states
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [needsPlay, setNeedsPlay] = useState(!autoPlay);
  const [error, setError] = useState<string | null>(null);
  
  // Ad states
  const [enableAds, setEnableAds] = useState(true);
  const [useTestVast, setUseTestVast] = useState(true); // Start with test VAST
  const [isShowingAd, setIsShowingAd] = useState(false);
  
  // Refs
  const streamPlayerRef = useRef<StreamPlayerApi | null>(null);
  
  // Generate VAST URL - only if ads are enabled
  const vastUrl = enableAds 
    ? (useTestVast ? `/api/ads/vast/test` : `/api/ads/vast?position=pre_roll&content_id=${video.id}`)
    : undefined;
  
  // Video event handlers
  const handleLoadedMetadata = () => {
    console.log('Video loaded successfully');
    setError(null);
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

  // Ad event handlers
  const handleAdStart = (event: any) => {
    console.log('Ad started:', event);
    setIsShowingAd(true);
  };

  const handleAdEnd = (event: any) => {
    console.log('Ad ended:', event);
    setIsShowingAd(false);
  };

  const handleAdTimeout = (event: any) => {
    console.log('Ad timeout:', event);
    setIsShowingAd(false);
  };

  // Player controls
  const startPlayback = () => {
    setHasUserInteracted(true);
    setNeedsPlay(false);
    console.log('Play button clicked - user interaction registered');
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
      {/* Cloudflare Stream Component with Optional Ads */}
      <Stream
        ref={streamPlayerRef}
        src={video.cloudflare_video_id}
        controls={true}
        autoPlay={hasUserInteracted && !needsPlay}
        adUrl={vastUrl}
        onCanPlay={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={onEnded}
        onStreamAdStart={handleAdStart}
        onStreamAdEnd={handleAdEnd}
        onStreamAdTimeout={handleAdTimeout}
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
              onClick={startPlayback}
              size="lg"
              className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-4"
            >
              <Play className="w-6 h-6 mr-2" />
              Play Video
            </Button>
            <p className="text-white text-sm opacity-75 mt-2">
              {enableAds ? 'Ads may play before your video' : 'Video will play without ads'}
            </p>
          </div>
        </div>
      )}

      {/* Ad Indicator */}
      {isShowingAd && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-yellow-500 text-black px-3 py-1 rounded-lg text-sm font-bold animate-pulse">
            ADVERTISEMENT
          </div>
        </div>
      )}

      {/* Debug Toggles */}
      <div className="absolute top-4 right-4 z-30 flex flex-col gap-2">
        <Button
          onClick={() => setEnableAds(!enableAds)}
          size="sm"
          variant="outline"
          className="text-white border-white bg-black/50 hover:bg-white hover:text-black text-xs"
        >
          {enableAds ? 'Disable Ads' : 'Enable Ads'}
        </Button>
        {enableAds && (
          <Button
            onClick={() => setUseTestVast(!useTestVast)}
            size="sm"
            variant="outline"
            className="text-white border-white bg-black/50 hover:bg-white hover:text-black text-xs"
          >
            {useTestVast ? 'Use Real VAST' : 'Use Test VAST'}
          </Button>
        )}
      </div>

      {/* Debug Info */}
      <div className="absolute bottom-20 right-4 z-30 bg-black/50 text-white p-2 rounded text-xs">
        <div>Playing: {isPlaying ? 'Yes' : 'No'}</div>
        <div>Ads: {enableAds ? (useTestVast ? 'Test VAST' : 'Real VAST') : 'Disabled'}</div>
        <div>Ad Playing: {isShowingAd ? 'Yes' : 'No'}</div>
        {vastUrl && <div>VAST: {vastUrl}</div>}
      </div>
    </div>
  );
}