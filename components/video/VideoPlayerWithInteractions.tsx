'use client';

import React, { useState } from 'react';
import { UnifiedVideoInteractionsConnected } from './UnifiedVideoInteractionsConnected';
import { getVideoInteractionConfig, VideoContentWithInteractions } from '@/lib/video-interactions';
import { FloatingEmojiManager } from '@/components/ui/floating-emoji';
import { PauseScreenAd } from '@/components/ads/PauseScreenAd';
import { cn } from '@/lib/utils';

// Custom XCast Icon Component
const XCastIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 175 173" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M145.1 113.005C138.27 103.645 129.85 95.4252 120.35 88.8852L100.32 75.1152L117.51 92.3052C138.85 113.645 147.4 134.905 143.67 157.315C143.42 158.565 143.08 159.835 142.69 161.095C136.56 165.605 129.86 169.375 122.72 172.285C117.78 168.965 113.24 165.135 108.86 161.395C98.65 152.665 88.09 143.645 72.45 142.075C70.84 141.925 69.22 141.855 67.62 141.855C66.02 141.855 64.4 141.925 62.78 142.075C71.58 135.085 78.42 126.425 83.18 116.225L95.62 89.5552L79.3 114.035C71.59 125.595 58.72 131.935 46.27 138.055C44.97 138.695 43.68 139.325 42.41 139.965C36.56 141.615 30.52 142.495 24.93 142.495C21.23 142.495 16.89 142.095 12.55 140.845C7.61999 134.075 3.57999 126.625 0.609985 118.645C13.89 105.355 27.49 91.5552 29.81 70.9652C30.42 67.5752 30.71 64.1552 30.68 60.7352C37.23 69.6852 45.1 77.4952 53.77 83.6252L75.08 98.6652L56.64 80.2252C37.33 60.9252 28.53 39.0552 30.46 15.2052C30.7 14.2752 31 13.3052 31.37 12.3152C37.55 7.6052 44.32 3.6352 51.57 0.575195C55.21 3.4352 58.62 6.3652 61.92 9.2252C73.5 19.2552 84.43 28.7252 101.69 30.4452H101.8L101.91 30.4552C105.17 30.4552 108.39 30.2952 111.56 29.9852C103.02 36.7152 95.8 44.8452 90.4 53.8552L82.9 66.3552L93.8 56.6652C115.44 37.4252 134.24 28.0752 151.26 28.0752C154.57 28.0752 157.83 28.4552 161.01 29.1752C166.47 36.1852 170.94 43.9952 174.23 52.3952C153.69 71.1652 143.9 91.5052 145.11 112.985L145.1 113.005Z" fill="currentColor"/>
  </svg>
);

interface VideoPlayerWithInteractionsProps {
  children: React.ReactNode;
  content?: VideoContentWithInteractions; // Video content for intelligent detection
  channelId?: string; // For live streams
  contentId?: string; // For VOD content
  viewerCount?: number;
  showControls?: boolean;
  viewerRole?: 'viewer' | 'student' | 'instructor' | 'admin';
  currentVideoTime?: number; // Current time in seconds for time-based interactions
  isPaused?: boolean; // Video pause state for pause screen ads
  enablePauseAds?: boolean; // Enable/disable pause screen ads (default: false for testing)
  enabledFeatures?: {
    chat?: boolean;
    reactions?: boolean;
    polls?: boolean;
    quiz?: boolean;
    rating?: boolean;
    updates?: boolean;
  };
  isLive?: boolean;
  className?: string;
}

export function VideoPlayerWithInteractions({
  children,
  content,
  channelId,
  contentId,
  viewerCount = 0,
  showControls = false,
  viewerRole = 'viewer',
  currentVideoTime = 0,
  isPaused = false,
  enablePauseAds = false,
  enabledFeatures,
  isLive = false,
  className = ''
}: VideoPlayerWithInteractionsProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mouseTimer, setMouseTimer] = useState<NodeJS.Timeout | null>(null);
  const [controlsVisible, setControlsVisible] = useState(showControls);
  const [showPauseAd, setShowPauseAd] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Handle pause screen ad analytics
  const handleAdImpression = async (adId: string) => {
    try {
      await fetch('/api/ads/pause-screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId, action: 'impression' })
      });
    } catch (error) {
      console.error('Failed to track ad impression:', error);
    }
  };

  const handleAdClick = async (adId: string) => {
    try {
      await fetch('/api/ads/pause-screen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adId, action: 'click' })
      });
    } catch (error) {
      console.error('Failed to track ad click:', error);
    }
  };

  // Intelligent interaction detection
  const interactionConfig = React.useMemo(() => {
    if (content) {
      return getVideoInteractionConfig(content, viewerRole);
    }
    
    // Fallback to manual configuration
    return {
      features: enabledFeatures || {
        chat: true,
        reactions: true,
        polls: true,
        quiz: true,
        rating: true,
        updates: true
      },
      context: {
        videoType: isLive ? 'live' : 'vod',
        isEducational: false,
        hasInstructor: false,
        isModerated: false,
        viewerRole
      },
      capabilities: {
        chat: true,
        comments: false,
        reactions: true,
        polls: true,
        quiz: true,
        rating: true,
        updates: true
      }
    };
  }, [content, viewerRole, enabledFeatures, isLive]);

  // Handle pause screen ad visibility
  React.useEffect(() => {
    if (enablePauseAds && isPaused && !isLive) {
      // Small delay to avoid showing ad immediately on pause
      const timer = setTimeout(() => {
        setShowPauseAd(true);
      }, 1000); // 1 second delay
      
      return () => clearTimeout(timer);
    } else {
      setShowPauseAd(false);
    }
  }, [enablePauseAds, isPaused, isLive]);

  const handleMouseMove = () => {
    setControlsVisible(true);
    
    // Clear existing timer
    if (mouseTimer) {
      clearTimeout(mouseTimer);
    }
    
    // Set new timer to hide controls after 3 seconds
    const timer = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
    
    setMouseTimer(timer);
  };

  const handleMouseLeave = () => {
    setControlsVisible(false);
    if (mouseTimer) {
      clearTimeout(mouseTimer);
    }
  };

  React.useEffect(() => {
    // Cleanup timer on unmount
    return () => {
      if (mouseTimer) {
        clearTimeout(mouseTimer);
      }
    };
  }, [mouseTimer]);

  return (
    <div 
      ref={containerRef}
      className={cn("relative w-full h-full", className)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Video Player Content */}
      {children}
      
      {/* Floating Emoji Manager */}
      <FloatingEmojiManager containerRef={containerRef} />

      {/* Interaction Sidebar Notch Button */}
      <div 
        className={cn(
          "absolute right-0 top-1/2 -translate-y-1/2 transition-all duration-300 ease-out",
          sidebarOpen ? "translate-x-72" : "translate-x-0"
        )}
      >
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={cn(
            "relative bg-black/80 hover:bg-black text-white p-3 rounded-l-lg transition-opacity duration-300",
            "border-l border-t border-b border-white/20",
            controlsVisible || sidebarOpen || showControls ? "opacity-100" : "opacity-0"
          )}
        >
          <XCastIcon className="w-5 h-5" />
          {/* Notification dot for live streams or active interactions */}
          {(interactionConfig.context.videoType === 'live' || interactionConfig.features.chat) && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          )}
        </button>
      </div>

      {/* Unified Interaction System */}
      <UnifiedVideoInteractionsConnected
        channelId={channelId}
        contentId={contentId}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onClose={() => setSidebarOpen(false)}
        position="right"
        mode="sidebar"
        viewerCount={viewerCount}
        isLive={isLive}
        currentVideoTime={currentVideoTime}
        enabledFeatures={interactionConfig.features}
      />

      {/* Pause Screen Ad */}
      <PauseScreenAd
        isVisible={showPauseAd}
        onClose={() => setShowPauseAd(false)}
        onAdClick={handleAdClick}
        onAdImpression={handleAdImpression}
      />
    </div>
  );
}