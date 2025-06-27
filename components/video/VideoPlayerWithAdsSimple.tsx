'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Stream } from '@cloudflare/stream-react';
import { Button } from '@/components/ui/button';
import { VideoContent } from '@/lib/types';
import { cn } from '@/lib/utils';

interface AdData {
  id: string;
  title: string;
  description: string;
  cloudflare_video_id: string;
  duration: number;
  skip_after_seconds: number;
}

interface VideoPlayerWithAdsSimpleProps {
  video: VideoContent;
  autoPlay?: boolean;
  className?: string;
  onEnded?: () => void;
}

export function VideoPlayerWithAdsSimple({
  video,
  autoPlay = false,
  className = '',
  onEnded
}: VideoPlayerWithAdsSimpleProps) {
  const [currentAd, setCurrentAd] = useState<AdData | null>(null);
  const [isPlayingAd, setIsPlayingAd] = useState(false);
  const [mainVideoStarted, setMainVideoStarted] = useState(false);
  const [skipAvailable, setSkipAvailable] = useState(false);
  const [adTimeLeft, setAdTimeLeft] = useState(0);

  // Fetch advertisement
  const fetchAd = async (position: string) => {
    try {
      const response = await fetch(`/api/ads/serve?position=${position}&content_id=${video.id}`);
      const result = await response.json();
      
      if (result.success && result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('Failed to fetch ad:', error);
      return null;
    }
  };

  // Play advertisement
  const playAd = async (position: string) => {
    const ad = await fetchAd(position);
    if (!ad) {
      // No ad available, continue with main content
      if (position === 'pre_roll') {
        setMainVideoStarted(true);
      } else if (position === 'end_roll') {
        onEnded?.();
      }
      return;
    }

    setCurrentAd(ad);
    setIsPlayingAd(true);
    setSkipAvailable(false);
    setAdTimeLeft(ad.duration);

    // Enable skip after specified seconds
    setTimeout(() => {
      setSkipAvailable(true);
    }, ad.skip_after_seconds * 1000);
  };

  // Skip advertisement
  const skipAd = () => {
    setIsPlayingAd(false);
    setCurrentAd(null);
    setSkipAvailable(false);

    if (!mainVideoStarted) {
      setMainVideoStarted(true);
    } else {
      onEnded?.();
    }
  };

  // Handle ad completion
  const handleAdEnded = () => {
    skipAd();
  };

  // Initialize with pre-roll ad
  useEffect(() => {
    if (autoPlay) {
      playAd('pre_roll');
    } else {
      setMainVideoStarted(true);
    }
  }, [autoPlay]);

  return (
    <div className={cn("relative w-full h-full bg-black", className)}>
      {/* Advertisement Player */}
      {isPlayingAd && currentAd && (
        <div className="absolute inset-0 z-10">
          <Stream
            src={currentAd.cloudflare_video_id}
            controls={false}
            autoPlay={true}
            muted={false}
            onEnded={handleAdEnded}
            style={{ width: '100%', height: '100%' }}
          />

          {/* Ad Overlay */}
          <div className="absolute top-4 left-4 right-4">
            <div className="bg-black/80 rounded-lg p-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-500 text-black px-2 py-1 rounded text-xs font-bold">
                  AD
                </div>
                <div className="text-white">
                  <p className="text-sm font-medium">{currentAd.title}</p>
                  <p className="text-xs text-gray-300">Advertisement</p>
                </div>
              </div>

              {skipAvailable && (
                <Button
                  onClick={skipAd}
                  size="sm"
                  className="bg-white/20 hover:bg-white/30 text-white"
                >
                  Skip Ad
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Video Player */}
      {mainVideoStarted && !isPlayingAd && (
        <div className="w-full h-full">
          <Stream
            src={video.cloudflare_video_id}
            controls={true}
            autoPlay={true}
            onEnded={() => playAd('end_roll')}
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      )}

      {/* Initial Play Button */}
      {!mainVideoStarted && !isPlayingAd && (
        <div className="absolute inset-0 bg-black flex items-center justify-center">
          <Button
            onClick={() => playAd('pre_roll')}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4"
          >
            ▶ Play Video
          </Button>
        </div>
      )}
    </div>
  );
}