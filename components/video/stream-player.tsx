'use client';

import { HBOMaxPlayer } from './hbo-max-player';
import { CloudflareStreamPlayer } from './cloudflare-stream-player';
import { isCloudflareStreamConfigured } from '@/lib/cloudflare';
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
  Settings,
  Users,
  Heart,
  Share,
  MoreVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StreamPlayerProps {
  channelId: string;
  channelData?: any;
  currentProgram?: any;
  nextProgram?: any;
}

export function StreamPlayer({ channelId, channelData, currentProgram, nextProgram }: StreamPlayerProps) {
  // Use HBO Max style player as the primary interface
  return (
    <HBOMaxPlayer
      videoId={channelId}
      title={currentProgram?.title || channelData?.name || "Live Stream"}
      subtitle={currentProgram?.description || `Channel ${channelData?.number || channelId}`}
      isLive={true}
      viewers={channelData?.currentViewers || 2847}
    />
  );

  // If Cloudflare Stream is configured, use the Cloudflare player
  // if (isCloudflareStreamConfigured()) {
  //   return (
  //     <CloudflareStreamPlayer
  //       videoId={channelId}
  //       channelName="Campus News Live"
  //       channelDescription="Daily campus news and announcements from State University"
  //       isLive={true}
  //       viewers={2847}
  //     />
  //   );
  // }

  // Fallback to mock player
  // const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState([80]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [likes, setLikes] = useState(1247);
  const [isLiked, setIsLiked] = useState(false);
  const [viewers, setViewers] = useState(2847);

  const playerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Simulate video progress
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
        setDuration(3600); // 1 hour duration
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return hours > 0 
      ? `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="overflow-hidden">
      <div 
        ref={playerRef}
        className="relative aspect-video bg-black group cursor-pointer"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setShowControls(false)}
      >
        {/* Video placeholder */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-blue-900/50 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="h-8 w-8 ml-1" />
            </div>
            <p className="text-lg font-medium">Live Stream</p>
            <p className="text-sm text-white/70">Channel {channelId}</p>
          </div>
        </div>

        {/* Live indicator */}
        <div className="absolute top-4 left-4 z-10">
          <Badge variant="destructive" className="animate-pulse">
            <div className="h-2 w-2 bg-white rounded-full mr-2"></div>
            LIVE
          </Badge>
        </div>

        {/* Viewer count */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black/50 backdrop-blur rounded-full px-3 py-1 flex items-center space-x-2 text-white text-sm">
            <Users className="h-4 w-4" />
            <span>{viewers.toLocaleString()}</span>
          </div>
        </div>

        {/* Controls */}
        <div className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
          showControls || !isPlaying ? "opacity-100" : "opacity-0"
        )}>
          {/* Progress bar */}
          <div className="mb-4">
            <Slider
              value={[currentTime]}
              max={duration}
              step={1}
              className="cursor-pointer"
              onValueChange={(value) => setCurrentTime(value[0])}
            />
            <div className="flex justify-between text-xs text-white/70 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Play/Pause */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePlayPause}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              {/* Volume */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleMute}
                  className="text-white hover:bg-white/20"
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
                    onValueChange={setVolume}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Like button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={cn(
                  "text-white hover:bg-white/20 transition-colors",
                  isLiked && "text-red-500"
                )}
              >
                <Heart className={cn("h-5 w-5 mr-1", isLiked && "fill-current")} />
                {likes.toLocaleString()}
              </Button>

              {/* Share button */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Share className="h-5 w-5" />
              </Button>

              {/* Settings */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Settings className="h-5 w-5" />
              </Button>

              {/* More options */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>

              {/* Fullscreen */}
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Maximize className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stream info */}
      <div className="p-4 border-t">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">Campus News Live</h3>
            <p className="text-muted-foreground text-sm mb-2">
              Daily campus news and announcements from State University
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>Started 2 hours ago</span>
              <span>•</span>
              <span>News</span>
              <span>•</span>
              <span>State University</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}