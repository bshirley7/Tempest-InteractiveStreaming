'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Radio, 
  Users, 
  Play,
  Star,
  Clock,
  Eye
} from 'lucide-react';
import { ScheduleItem, ChannelId } from '@/lib/types';
import { CHANNELS } from '@/lib/constants';
import { getCurrentProgram } from '@/lib/local-scheduling';

interface ChannelRowProps {
  channelId: ChannelId;
  programs: ScheduleItem[];
  currentTime: Date;
  onProgramSelect?: (program: ScheduleItem) => void;
  onChannelSelect?: (channelId: ChannelId) => void;
  isSelected?: boolean;
  compactMode?: boolean;
  showViewerCount?: boolean;
}

export function ChannelRow({
  channelId,
  programs,
  currentTime,
  onProgramSelect,
  onChannelSelect,
  isSelected = false,
  compactMode = false,
  showViewerCount = true,
}: ChannelRowProps) {
  const [viewerCount] = useState(Math.floor(Math.random() * 1000) + 100);
  
  const channel = CHANNELS.find(c => c.id === channelId);
  const currentProgram = getCurrentProgram(channelId);
  
  if (!channel) return null;

  const isProgramLive = (program: ScheduleItem) => {
    return program.startTime <= currentTime && program.endTime > currentTime;
  };

  const getProgramStatus = (program: ScheduleItem) => {
    if (isProgramLive(program)) {
      return { label: 'LIVE', variant: 'destructive' as const, icon: Radio };
    }
    if (program.startTime > currentTime) {
      return { label: 'UPCOMING', variant: 'secondary' as const, icon: Clock };
    }
    return null;
  };

  const formatTime = (date: Date) => format(date, 'HH:mm');

  return (
    <div 
      className={`border rounded-lg transition-all duration-200 ${
        isSelected ? 'bg-accent border-accent-foreground' : 'hover:bg-accent/50'
      }`}
    >
      <div className="flex items-center">
        {/* Channel Information */}
        <div 
          className="w-48 flex-shrink-0 p-4 cursor-pointer"
          onClick={() => onChannelSelect?.(channelId)}
        >
          <div className="flex items-center gap-3">
            {/* Channel Logo/Icon */}
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md"
              style={{ backgroundColor: channel.color }}
            >
              {channel.logo ? (
                <img 
                  src={channel.logo} 
                  alt={channel.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                channel.name.charAt(0)
              )}
            </div>
            
            {/* Channel Details */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">{channel.name}</div>
              <div className="text-xs text-muted-foreground capitalize">
                {channel.category}
              </div>
              
              {/* Live Status & Metrics */}
              <div className="flex items-center gap-2 mt-1">
                {currentProgram && isProgramLive(currentProgram) && (
                  <Badge variant="destructive" className="text-xs px-1 py-0">
                    <Radio className="h-2 w-2 mr-1 animate-pulse" />
                    LIVE
                  </Badge>
                )}
                
                {showViewerCount && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{viewerCount.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Programs Timeline */}
        <div className="flex-1 p-2">
          {programs.length > 0 ? (
            <div className="space-y-2">
              {/* Current/Next Program Highlight */}
              {currentProgram && (
                <div 
                  className={`p-3 rounded-lg border-l-4 cursor-pointer transition-colors ${
                    isProgramLive(currentProgram)
                      ? 'bg-red-50 border-l-red-500 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-950'
                      : 'bg-blue-50 border-l-blue-500 hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-950'
                  }`}
                  onClick={() => onProgramSelect?.(currentProgram)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="font-medium text-sm truncate">
                          {currentProgram.title}
                        </div>
                        
                        {isProgramLive(currentProgram) && (
                          <Badge variant="destructive" className="text-xs">
                            <Radio className="h-2 w-2 mr-1" />
                            LIVE
                          </Badge>
                        )}
                        
                        {currentProgram.type === 'premiere' && (
                          <Star className="h-3 w-3 text-yellow-500" />
                        )}
                      </div>
                      
                      {!compactMode && currentProgram.description && (
                        <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {currentProgram.description}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            {formatTime(currentProgram.startTime)} - {formatTime(currentProgram.endTime)}
                          </span>
                        </div>
                        
                        {currentProgram.metadata?.category && (
                          <div className="capitalize">
                            {currentProgram.metadata.category}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {isProgramLive(currentProgram) && (
                      <Button size="sm" variant="ghost" className="ml-2">
                        <Play className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
              
              {/* Upcoming Programs (if not in compact mode) */}
              {!compactMode && (
                <div className="space-y-1">
                  {programs
                    .filter(p => p.startTime > currentTime)
                    .slice(0, 3)
                    .map((program) => {
                      const status = getProgramStatus(program);
                      
                      return (
                        <div
                          key={program.id}
                          className="p-2 rounded border cursor-pointer hover:bg-accent transition-colors"
                          onClick={() => onProgramSelect?.(program)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="text-sm font-medium truncate">
                                  {program.title}
                                </div>
                                
                                {status && (
                                  <Badge variant={status.variant} className="text-xs">
                                    {status.icon && <status.icon className="h-2 w-2 mr-1" />}
                                    {status.label}
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="text-xs text-muted-foreground">
                                {formatTime(program.startTime)} - {formatTime(program.endTime)}
                              </div>
                            </div>
                            
                            <Button size="sm" variant="ghost" className="ml-2">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              <div className="text-sm">No programming scheduled</div>
              <div className="text-xs mt-1">Check back later for updates</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}