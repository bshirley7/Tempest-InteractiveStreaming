'use client';

import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw,
  RotateCw,
  Subtitles,
  Settings,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { InteractiveSidebar } from './interactive-sidebar';

interface HBOMaxPlayerProps {
  videoId: string;
  title: string;
  subtitle?: string;
  isLive?: boolean;
  viewers?: number;
  className?: string;
}

export function HBOMaxPlayer({
  videoId,
  title,
  subtitle,
  isLive = false,
  viewers = 0,
  className
}: HBOMaxPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([80]);
  const [currentTime, setCurrentTime] = useState(5); // Start at 5 seconds like HBO
  const [duration, setDuration] = useState(3653); // 1:00:53 like in the image
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSubtitles, setShowSubtitles] = useState(false);

  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Simulate video progress
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => Math.min(prev + 1, duration));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, duration]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (!showSidebar) {
        setShowControls(false);
      }
    }, 3000);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleSeek = (value: number[]) => {
    setCurrentTime(value[0]);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value);
    setIsMuted(value[0] === 0);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = (currentTime / duration) * 100;

  return (
    <div className={cn("relative", className)}>
      <Card className="overflow-hidden bg-black">
        <div 
          ref={playerRef}
          className="relative aspect-video bg-black group cursor-pointer"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => !showSidebar && setShowControls(false)}
        >
          {/* Video content area */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-black/50 flex items-center justify-center">
            {/* HBO Logo (large, centered like in the image) */}
            <div className="text-center text-white">
              <div className="text-8xl font-bold mb-4 tracking-wider opacity-60">
                HBO
              </div>
            </div>
          </div>

          {/* Live indicator */}
          {isLive && (
            <div className="absolute top-4 left-4 z-10">
              <Badge variant="destructive" className="animate-pulse">
                <div className="h-2 w-2 bg-white rounded-full mr-2"></div>
                LIVE
              </Badge>
            </div>
          )}

          {/* Viewer count */}
          {viewers > 0 && (
            <div className="absolute top-4 right-16 z-10">
              <div className="bg-black/50 backdrop-blur rounded px-2 py-1 text-white text-sm">
                {viewers.toLocaleString()} viewers
              </div>
            </div>
          )}

          {/* Tempest Icon - Far Right */}
          <div className="absolute top-4 right-4 z-20">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSidebar(!showSidebar)}
              className="bg-black/50 backdrop-blur text-white hover:bg-black/70 rounded-full p-2"
            >
              <img 
                src="/icon.svg" 
                alt="Tempest" 
                className="h-6 w-6"
              />
            </Button>
          </div>

          {/* Controls */}
          <div className={cn(
            "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent transition-opacity duration-300",
            showControls || !isPlaying ? "opacity-100" : "opacity-0"
          )}>
            {/* Progress bar */}
            <div className="px-6 pt-8 pb-4">
              <Slider
                value={[currentTime]}
                max={duration}
                step={1}
                className="cursor-pointer"
                onValueChange={handleSeek}
              />
              <div className="flex justify-between text-xs text-white/70 mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control buttons */}
            <div className="flex items-center justify-between px-6 pb-6">
              <div className="flex items-center space-x-4">
                {/* Play/Pause */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePlayPause}
                  className="text-white hover:bg-white/20 p-2"
                >
                  {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                </Button>

                {/* Rewind/Forward */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  <span className="text-xs ml-1">15</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                >
                  <RotateCw className="h-5 w-5" />
                  <span className="text-xs ml-1">15</span>
                </Button>

                {/* Volume */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMute}
                    className="text-white hover:bg-white/20 p-2"
                  >
                    {isMuted || volume[0] === 0 ? (
                      <VolumeX className="h-5 w-5" />
                    ) : (
                      <Volume2 className="h-5 w-5" />
                    )}
                  </Button>
                  <div className="w-20">
                    <Slider
                      value={volume}
                      max={100}
                      step={1}
                      onValueChange={handleVolumeChange}
                      className="cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {/* Subtitles */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSubtitles(!showSubtitles)}
                  className={cn(
                    "text-white hover:bg-white/20 p-2",
                    showSubtitles && "bg-white/20"
                  )}
                >
                  <Subtitles className="h-5 w-5" />
                </Button>

                {/* Settings */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                >
                  <Settings className="h-5 w-5" />
                </Button>

                {/* Fullscreen */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 p-2"
                >
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom info bar - HBO Max style */}
        <div className="bg-black text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img 
                src="/logo.svg" 
                alt="Tempest" 
                className="h-6"
              />
            </div>
            <div>
              <h3 className="font-semibold text-lg">{title}</h3>
              {subtitle && (
                <p className="text-white/70 text-sm">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="text-right text-sm text-white/70">
            curated by University Partners
          </div>
        </div>
      </Card>

      {/* Interactive Sidebar */}
      <InteractiveSidebar 
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        channelId={videoId}
        isLive={isLive}
      />
    </div>
  );
}