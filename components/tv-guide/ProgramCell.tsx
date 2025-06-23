'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Radio, 
  Play, 
  Clock,
  Star,
  Users,
  Eye,
  Calendar,
  Tag
} from 'lucide-react';
import { ScheduleItem } from '@/lib/types';

interface ProgramCellProps {
  program: ScheduleItem;
  currentTime: Date;
  onProgramSelect?: (program: ScheduleItem) => void;
  width: number;
  height?: number;
  showDetails?: boolean;
  interactive?: boolean;
  className?: string;
}

export function ProgramCell({
  program,
  currentTime,
  onProgramSelect,
  width,
  height = 80,
  showDetails = true,
  interactive = true,
  className = '',
}: ProgramCellProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [viewerCount] = useState(Math.floor(Math.random() * 500) + 50);

  const isProgramLive = () => {
    return program.startTime <= currentTime && program.endTime > currentTime;
  };

  const isProgramUpcoming = () => {
    return program.startTime > currentTime;
  };

  const isProgramEnded = () => {
    return program.endTime <= currentTime;
  };

  const getProgramStatus = () => {
    if (isProgramLive()) {
      return { label: 'LIVE', variant: 'destructive' as const, icon: Radio };
    }
    if (isProgramUpcoming()) {
      return { label: 'UPCOMING', variant: 'secondary' as const, icon: Clock };
    }
    return { label: 'ENDED', variant: 'outline' as const, icon: null };
  };

  const getProgramTypeIcon = () => {
    switch (program.type) {
      case 'live':
        return <Radio className="h-3 w-3 text-red-500" />;
      case 'premiere':
        return <Star className="h-3 w-3 text-yellow-500" />;
      case 'rerun':
        return <Clock className="h-3 w-3 text-gray-500" />;
      default:
        return <Play className="h-3 w-3 text-blue-500" />;
    }
  };

  const formatTime = (date: Date) => format(date, 'HH:mm');
  const formatDuration = () => {
    const durationMs = program.endTime.getTime() - program.startTime.getTime();
    const minutes = Math.round(durationMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

  const status = getProgramStatus();
  
  const cellContent = (
    <div
      className={`relative border rounded-lg cursor-pointer transition-all duration-200 overflow-hidden ${
        isProgramLive()
          ? 'bg-red-50 border-red-300 hover:bg-red-100 dark:bg-red-950/50 dark:border-red-700 dark:hover:bg-red-950'
          : isProgramUpcoming()
          ? 'bg-blue-50 border-blue-300 hover:bg-blue-100 dark:bg-blue-950/50 dark:border-blue-700 dark:hover:bg-blue-950'
          : 'bg-gray-50 border-gray-300 hover:bg-gray-100 dark:bg-gray-950/50 dark:border-gray-700 dark:hover:bg-gray-950'
      } ${isHovered && interactive ? 'scale-105 shadow-lg z-10' : ''} ${className}`}
      style={{ 
        width: `${Math.max(width, 100)}px`, 
        height: `${height}px`,
        minWidth: '100px'
      }}
      onClick={() => interactive && onProgramSelect?.(program)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Program Content */}
      <div className="p-2 h-full flex flex-col justify-between">
        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-1 flex-wrap">
            <Badge variant={status.variant} className="text-xs px-1 py-0">
              {status.icon && <status.icon className="h-2 w-2 mr-1" />}
              {status.label}
            </Badge>
            
            {getProgramTypeIcon()}
            
            {program.metadata?.featured && (
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
            )}
          </div>
          
          <div className="text-sm font-medium line-clamp-2 leading-tight">
            {program.title}
          </div>
        </div>

        {/* Details */}
        {showDetails && (
          <div className="space-y-1">
            {program.description && height > 60 && (
              <div className="text-xs text-muted-foreground line-clamp-2">
                {program.description}
              </div>
            )}
            
            <div className="flex items-center justify-between text-xs">
              <div className="text-muted-foreground">
                {formatTime(program.startTime)} - {formatTime(program.endTime)}
              </div>
              
              {isProgramLive() && interactive && (
                <Button size="sm" variant="ghost" className="h-5 w-5 p-0">
                  <Play className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Hover Overlay */}
      {isHovered && interactive && (
        <div className="absolute inset-0 bg-black/5 dark:bg-white/5 pointer-events-none" />
      )}

      {/* Live Indicator Pulse */}
      {isProgramLive() && (
        <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
      )}
    </div>
  );

  // Wrap with tooltip if interactive and has details
  if (interactive && showDetails) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {cellContent}
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs">
            <div className="space-y-2">
              <div className="font-medium">{program.title}</div>
              
              {program.description && (
                <div className="text-sm text-muted-foreground">
                  {program.description}
                </div>
              )}
              
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(program.startTime)} - {formatTime(program.endTime)}</span>
                </div>
                
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDuration()}</span>
                </div>
              </div>
              
              {program.metadata?.category && (
                <div className="flex items-center gap-1 text-xs">
                  <Tag className="h-3 w-3" />
                  <span className="capitalize">{program.metadata.category}</span>
                </div>
              )}
              
              {isProgramLive() && (
                <div className="flex items-center gap-1 text-xs text-red-500">
                  <Users className="h-3 w-3" />
                  <span>{viewerCount} viewers</span>
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return cellContent;
}