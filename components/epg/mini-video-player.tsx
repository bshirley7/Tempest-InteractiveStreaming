'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize2,
  Radio,
  Clock,
  Star,
  Users,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Program {
  id: string;
  title: string;
  description: string;
  startTime: Date;
  endTime: Date;
  category: string;
  rating?: number;
  isLive: boolean;
  isNew?: boolean;
  thumbnail?: string;
}

interface Channel {
  id: string;
  name: string;
  number: string;
  logo: string;
  category: string;
  isHD: boolean;
  currentViewers?: number;
}

interface MiniVideoPlayerProps {
  channel: Channel;
  currentProgram: Program | null;
  nextProgram?: Program | null;
  onClose: () => void;
  onExpand?: () => void;
  className?: string;
}

export function MiniVideoPlayer({ 
  channel, 
  currentProgram, 
  nextProgram,
  onClose, 
  onExpand,
  className 
}: MiniVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getProgressPercentage = (program: Program) => {
    const total = program.endTime.getTime() - program.startTime.getTime();
    const elapsed = currentTime.getTime() - program.startTime.getTime();
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  };

  const getRemainingTime = (program: Program) => {
    const remaining = program.endTime.getTime() - currentTime.getTime();
    const minutes = Math.floor(remaining / (1000 * 60));
    return minutes > 0 ? `${minutes}m left` : 'Ending soon';
  };

  return (
    <Card className={cn("overflow-hidden shadow-lg", className)}>
      <CardContent className="p-0">
        <div className="flex h-48">
          {/* Video Player */}
          <div className="w-80 relative bg-black">
            {/* Video Content */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-black/50 flex items-center justify-center">
              {currentProgram?.thumbnail ? (
                <img
                  src={currentProgram.thumbnail}
                  alt={currentProgram.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center text-white">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Play className="h-8 w-8 ml-1" />
                  </div>
                  <p className="text-sm font-medium">{channel.name}</p>
                  <p className="text-xs text-white/70">Channel {channel.number}</p>
                </div>
              )}
            </div>

            {/* Live Indicator */}
            {currentProgram?.isLive && (
              <div className="absolute top-3 left-3">
                <Badge variant="destructive" className="animate-pulse">
                  <Radio className="h-3 w-3 mr-1" />
                  LIVE
                </Badge>
              </div>
            )}

            {/* Channel Info */}
            <div className="absolute top-3 right-3 flex items-center space-x-2">
              <div className="bg-black/70 backdrop-blur rounded px-2 py-1 flex items-center space-x-2">
                <div className="w-6 h-6 rounded overflow-hidden bg-white/10 flex items-center justify-center">
                  {channel.logo ? (
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Fallback to channel name if logo fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="w-full h-full flex items-center justify-center text-white font-bold text-[8px] text-center leading-none">
                              ${channel.name.split(' ').map(word => word[0]).join('').substring(0, 3)}
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-[8px] text-center leading-none">
                      {channel.name.split(' ').map(word => word[0]).join('').substring(0, 3)}
                    </div>
                  )}
                </div>
                <span className="text-white text-xs font-medium">{channel.number}</span>
                {channel.isHD && (
                  <Badge variant="secondary" className="text-xs px-1">HD</Badge>
                )}
              </div>
            </div>

            {/* Viewer Count */}
            {channel.currentViewers && (
              <div className="absolute bottom-12 left-3">
                <div className="bg-black/70 backdrop-blur rounded px-2 py-1 flex items-center space-x-1 text-white text-xs">
                  <Users className="h-3 w-3" />
                  <span>{channel.currentViewers.toLocaleString()}</span>
                </div>
              </div>
            )}

            {/* Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="text-white hover:bg-white/20 p-1"
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMuted(!isMuted)}
                    className="text-white hover:bg-white/20 p-1"
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  {onExpand && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={onExpand}
                      className="text-white hover:bg-white/20 p-1"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-white hover:bg-white/20 p-1"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Program Information */}
          <div className="flex-1 p-4 bg-background">
            <div className="h-full flex flex-col">
              {/* Channel Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {channel.logo ? (
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-8 h-8 rounded object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary text-xs font-bold';
                          fallback.textContent = channel.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase();
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-8 h-8 rounded bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">
                      {channel.name.split(' ').map(word => word[0]).join('').substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{channel.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>Channel {channel.number}</span>
                      {channel.isHD && <Badge variant="secondary" className="text-xs">HD</Badge>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Program */}
              {currentProgram ? (
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {currentProgram.isLive && (
                      <Badge variant="destructive" className="animate-pulse">
                        <Radio className="h-3 w-3 mr-1" />
                        LIVE
                      </Badge>
                    )}
                    {currentProgram.isNew && (
                      <Badge variant="secondary">NEW</Badge>
                    )}
                    {currentProgram.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                        <span className="text-sm">{currentProgram.rating}</span>
                      </div>
                    )}
                  </div>

                  <h4 className="font-bold text-xl mb-2">{currentProgram.title}</h4>
                  
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-3">
                    {currentProgram.description}
                  </p>

                  {/* Time Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {formatTime(currentProgram.startTime)} - {formatTime(currentProgram.endTime)}
                        </span>
                      </div>
                      <span className="text-primary font-medium">
                        {getRemainingTime(currentProgram)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <Progress value={getProgressPercentage(currentProgram)} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Started {formatTime(currentProgram.startTime)}</span>
                        <span>Ends {formatTime(currentProgram.endTime)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Next Program */}
                  {nextProgram && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-muted-foreground">Up Next:</span>
                        <span className="text-sm text-muted-foreground">
                          {formatTime(nextProgram.startTime)}
                        </span>
                      </div>
                      <h5 className="font-medium">{nextProgram.title}</h5>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {nextProgram.description}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No program information available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}