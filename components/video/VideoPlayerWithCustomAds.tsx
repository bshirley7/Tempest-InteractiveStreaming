'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Stream, StreamPlayerApi } from '@cloudflare/stream-react';
import { Button } from '@/components/ui/button';
import { Play, SkipForward, X } from 'lucide-react';
import { VideoContent } from '@/lib/types';
import { cn } from '@/lib/utils';

interface Ad {
  id: string;
  title: string;
  cloudflare_video_id: string;
  click_url?: string;
  duration: number;
}

interface VideoPlayerWithCustomAdsProps {
  video: VideoContent;
  autoPlay?: boolean;
  className?: string;
  onEnded?: () => void;
}

export function VideoPlayerWithCustomAds({
  video,
  autoPlay = false,
  className = '',
  onEnded
}: VideoPlayerWithCustomAdsProps) {
  // Video states
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const [needsPlay, setNeedsPlay] = useState(!autoPlay);
  const [error, setError] = useState<string | null>(null);
  
  // Ad states - disable ads if the video itself is an advertisement
  const [enableAds, setEnableAds] = useState(video.content_type !== 'advertisement');
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [isShowingAd, setIsShowingAd] = useState(false);
  const [adTimeLeft, setAdTimeLeft] = useState(0);
  const [canSkipAd, setCanSkipAd] = useState(false);
  const [adStarted, setAdStarted] = useState(false);
  const [adIsPlaying, setAdIsPlaying] = useState(false);
  const [showManualPlay, setShowManualPlay] = useState(false);
  
  // Refs
  const streamPlayerRef = useRef<StreamPlayerApi | null>(null);
  const adStreamRef = useRef<StreamPlayerApi | null>(null);
  const adTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch ad from database
  const fetchAd = async () => {
    try {
      const response = await fetch('/api/ads/serve');
      if (response.ok) {
        const adData = await response.json();
        if (adData.success && adData.data) {
          const ad: Ad = {
            id: adData.data.id,
            title: adData.data.title,
            cloudflare_video_id: adData.data.cloudflare_video_id,
            click_url: adData.data.vast_click_through_url,
            duration: adData.data.duration || 15
          };
          setCurrentAd(ad);
          return ad;
        }
      }
    } catch (error) {
      console.error('Failed to fetch ad:', error);
    }
    return null;
  };

  // Start ad countdown timer
  const startAdTimer = (duration: number) => {
    setAdTimeLeft(duration);
    setCanSkipAd(false);
    
    if (adTimerRef.current) {
      clearInterval(adTimerRef.current);
    }
    
    adTimerRef.current = setInterval(() => {
      setAdTimeLeft(prev => {
        const newTime = prev - 1;
        if (newTime <= duration - 5) {
          setCanSkipAd(true);
        }
        if (newTime <= 0) {
          skipAd();
          return 0;
        }
        return newTime;
      });
    }, 1000);
  };

  // Skip ad and start main video
  const skipAd = () => {
    if (adTimerRef.current) {
      clearInterval(adTimerRef.current);
    }
    
    if (adStreamRef.current) {
      adStreamRef.current.pause();
    }
    
    setIsShowingAd(false);
    setCurrentAd(null);
    setAdStarted(false);
    setAdTimeLeft(0);
    setCanSkipAd(false);
    setShowManualPlay(false);
    
    // Start main video automatically since user has already interacted
    console.log('Ad finished, starting main video');
    setTimeout(() => {
      if (streamPlayerRef.current) {
        try {
          console.log('Attempting to autoplay main video');
          streamPlayerRef.current.play();
        } catch (error) {
          console.error('Main video autoplay failed:', error);
        }
      }
    }, 500);
  };

  // Handle ad click
  const handleAdClick = () => {
    if (currentAd?.click_url) {
      window.open(currentAd.click_url, '_blank');
    }
  };

  // Play button handler
  const startPlayback = async () => {
    setHasUserInteracted(true);
    setNeedsPlay(false);
    
    if (enableAds && !adStarted) {
      // Try to load and show ad first
      const ad = await fetchAd();
      if (ad && ad.cloudflare_video_id) {
        setIsShowingAd(true);
        setAdStarted(true);
        setAdIsPlaying(false);
        setShowManualPlay(false);
        console.log('Loading ad:', ad.title);
        
        // Show manual play button after a delay if ad doesn't autoplay
        setTimeout(() => {
          if (!adIsPlaying) {
            setShowManualPlay(true);
            console.log('Showing manual play button');
          }
        }, 2000);
      } else {
        console.log('No ad available, starting main video');
      }
    }
  };

  // Main video event handlers
  const handleLoadedMetadata = () => {
    console.log('Main video loaded successfully');
    setError(null);
    
    // If we just finished an ad and main video is loaded, try to play it
    if (hasUserInteracted && !isShowingAd && !needsPlay) {
      setTimeout(() => {
        if (!isPlaying && streamPlayerRef.current) {
          console.log('Main video loaded after ad, attempting autoplay');
          try {
            streamPlayerRef.current.play();
          } catch (error) {
            console.error('Main video autoplay after ad failed:', error);
          }
        }
      }, 200);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    console.log('Main video started playing');
  };

  const handlePause = () => {
    setIsPlaying(false);
    console.log('Main video paused');
  };

  const handleError = (error: any) => {
    console.error('Stream component error:', error);
    setError('Failed to load video. Please try again.');
  };

  // Ad stream event handlers
  const handleAdStreamPlay = () => {
    console.log('Ad stream started playing');
    setAdIsPlaying(true);
    setShowManualPlay(false);
    // Start the timer now that ad is actually playing
    if (currentAd && adTimeLeft === 0) {
      startAdTimer(currentAd.duration);
    }
  };

  const handleAdStreamPause = () => {
    console.log('Ad stream paused');
    setAdIsPlaying(false);
  };

  const handleAdStreamEnded = () => {
    console.log('Ad stream ended naturally');
    setAdIsPlaying(false);
    skipAd();
  };

  const handleAdStreamError = (error: any) => {
    console.error('Ad stream failed to load:', error);
    skipAd();
  };

  const handleAdStreamReady = () => {
    console.log('Ad stream ready');
    console.log('Ad stream ref:', adStreamRef.current);
    console.log('Ad stream ref methods:', adStreamRef.current ? Object.getOwnPropertyNames(adStreamRef.current) : 'No ref');
    
    // Try to play the ad manually if autoplay didn't work
    setTimeout(() => {
      if (adStreamRef.current && !adIsPlaying) {
        console.log('Attempting to manually play ad...');
        console.log('Available methods:', Object.getOwnPropertyNames(adStreamRef.current));
        try {
          // Try different ways to play
          if (typeof adStreamRef.current.play === 'function') {
            console.log('Using play() method');
            adStreamRef.current.play();
          } else {
            console.log('play() method not available, trying alternative approaches');
            // Try to find the actual video element inside the Stream component
            const container = document.querySelector('[data-testid="cf-stream"]') || 
                            document.querySelector('iframe[src*="cloudflarestream.com"]');
            console.log('Found container:', container);
          }
        } catch (error) {
          console.error('Manual ad play failed:', error);
        }
      }
    }, 1000);
  };

  // Update enableAds when video content changes
  useEffect(() => {
    setEnableAds(video.content_type !== 'advertisement');
  }, [video.content_type]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (adTimerRef.current) {
        clearInterval(adTimerRef.current);
      }
    };
  }, []);

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
      {/* Ad Stream Player */}
      {isShowingAd && currentAd && (
        <div className="absolute inset-0 z-20" onClick={handleAdClick} style={{ cursor: currentAd.click_url ? 'pointer' : 'default' }}>
          <Stream
            ref={adStreamRef}
            src={currentAd.cloudflare_video_id}
            controls={true}
            autoPlay={true}
            muted={false}
            onCanPlay={handleAdStreamReady}
            onPlay={handleAdStreamPlay}
            onPause={handleAdStreamPause}
            onEnded={handleAdStreamEnded}
            onError={handleAdStreamError}
            style={{ width: '100%', height: '100%' }}
          />
          
          {/* Manual Play Button - Center Screen */}
          {!adIsPlaying && showManualPlay && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10">
              <Button
                onClick={() => {
                  console.log('Manual play button clicked');
                  console.log('Ad stream ref:', adStreamRef.current);
                  
                  if (adStreamRef.current) {
                    console.log('Trying to play ad...');
                    console.log('Available methods:', Object.getOwnPropertyNames(adStreamRef.current));
                    
                    // Try multiple approaches
                    try {
                      if (typeof adStreamRef.current.play === 'function') {
                        console.log('Calling play() method');
                        const result = adStreamRef.current.play();
                        console.log('Play result:', result);
                      } else {
                        console.log('No play() method available');
                      }
                      
                      // Try setting autoplay and triggering reload
                      console.log('Trying to trigger autoplay...');
                      
                      // Try to find and click the actual play button in the iframe
                      setTimeout(() => {
                        const iframe = document.querySelector('iframe[src*="cloudflarestream.com"]');
                        if (iframe) {
                          console.log('Found iframe:', iframe);
                          try {
                            const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
                            const playButton = iframeDoc?.querySelector('button[aria-label*="play"], .play-button, [data-testid*="play"]');
                            if (playButton) {
                              console.log('Found play button in iframe:', playButton);
                              playButton.click();
                            }
                          } catch (e) {
                            console.log('Cannot access iframe content (CORS)');
                          }
                        }
                      }, 100);
                      
                    } catch (error) {
                      console.error('Failed to play ad:', error);
                    }
                  }
                }}
                size="lg"
                className="bg-white text-black hover:bg-gray-200 text-lg px-8 py-4"
              >
                <Play className="w-6 h-6 mr-2" />
                Play Ad
              </Button>
            </div>
          )}

          {/* Ad Overlay Controls */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 bg-gradient-to-t from-black/50 to-transparent pointer-events-none">
            {/* Top Bar */}
            <div className="flex justify-between items-start">
              <div className="bg-yellow-500 text-black px-3 py-1 rounded-lg text-sm font-bold">
                ADVERTISEMENT
              </div>
              <div className="text-white text-sm bg-black/50 px-2 py-1 rounded">
                {adTimeLeft}s
              </div>
            </div>
            
            {/* Bottom Bar */}
            <div className="flex justify-end items-end">
              <div className="flex gap-2 pointer-events-auto">
                {canSkipAd && (
                  <Button
                    onClick={skipAd}
                    size="sm"
                    className="bg-white/20 text-white hover:bg-white/30 border border-white/30"
                  >
                    <SkipForward className="w-4 h-4 mr-1" />
                    Skip Ad
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Video Player */}
      <Stream
        ref={streamPlayerRef}
        src={video.cloudflare_video_id}
        controls={!isShowingAd}
        autoPlay={hasUserInteracted && !needsPlay && !isShowingAd}
        onCanPlay={handleLoadedMetadata}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={onEnded}
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
      {needsPlay && !error && !isShowingAd && (
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

    </div>
  );
}