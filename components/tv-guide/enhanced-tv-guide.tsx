'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { format, addMinutes, isBefore, isAfter, addHours } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Radio, 
  Users, 
  Clock, 
  Star,
  Play,
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Filter
} from 'lucide-react';
import { ScheduleItem, ChannelId } from '@/lib/types';
import { CHANNELS, TV_GUIDE_CONFIG } from '@/lib/constants';
import { getTVGuideData, getCurrentProgram, getNextProgram } from '@/lib/local-scheduling';

interface EnhancedTVGuideProps {
  onProgramSelect?: (program: ScheduleItem) => void;
  onChannelSelect?: (channelId: ChannelId) => void;
  selectedChannel?: ChannelId | null;
  showTimeRange?: number; // hours to show
  autoScroll?: boolean;
  compactMode?: boolean;
  className?: string;
}

export function EnhancedTVGuide({
  onProgramSelect,
  onChannelSelect,
  selectedChannel,
  showTimeRange = 12,
  autoScroll = true,
  compactMode = false,
  className = '',
}: EnhancedTVGuideProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [guideStartTime, setGuideStartTime] = useState(new Date());
  const [tvGuideData, setTvGuideData] = useState<{
    timeSlots: Date[];
    channels: typeof CHANNELS;
    programs: Map<string, ScheduleItem[]>;
  }>({ timeSlots: [], channels: CHANNELS, programs: new Map() });
  
  const [filter, setFilter] = useState<'all' | 'live' | 'upcoming' | 'featured'>('all');
  const [hoveredProgram, setHoveredProgram] = useState<string | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentTimeIndicatorRef = useRef<HTMLDivElement>(null);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Load TV guide data
  const loadGuideData = useCallback(() => {
    const data = getTVGuideData(guideStartTime, showTimeRange);
    setTvGuideData(data);
  }, [guideStartTime, showTimeRange]);

  // Load data on mount and when start time changes
  useEffect(() => {
    loadGuideData();
  }, [loadGuideData]);

  // Auto-scroll to current time
  useEffect(() => {
    if (autoScroll && currentTimeIndicatorRef.current && scrollContainerRef.current) {
      const indicator = currentTimeIndicatorRef.current;
      const container = scrollContainerRef.current;
      
      const scrollLeft = indicator.offsetLeft - container.clientWidth / 2;
      container.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
    }
  }, [autoScroll, tvGuideData]);

  // Filter programs based on current filter
  const getFilteredPrograms = useCallback((programs: ScheduleItem[]) => {
    switch (filter) {
      case 'live':
        return programs.filter(program => 
          isBefore(program.startTime, currentTime) && isAfter(program.endTime, currentTime)
        );
      case 'upcoming':
        return programs.filter(program => isAfter(program.startTime, currentTime));
      case 'featured':
        return programs.filter(program => program.metadata?.featured);
      default:
        return programs;
    }
  }, [filter, currentTime]);

  // Calculate program position and width
  const getProgramStyle = useCallback((program: ScheduleItem) => {
    const startIndex = tvGuideData.timeSlots.findIndex(slot => 
      slot.getTime() >= program.startTime.getTime()
    );
    const endIndex = tvGuideData.timeSlots.findIndex(slot => 
      slot.getTime() >= program.endTime.getTime()
    );
    
    const slotWidth = 120; // pixels per time slot
    const left = startIndex * slotWidth;
    const width = Math.max((endIndex - startIndex) * slotWidth, slotWidth);
    
    return { left, width };
  }, [tvGuideData.timeSlots]);

  // Check if program is currently playing
  const isProgramLive = useCallback((program: ScheduleItem) => {
    return isBefore(program.startTime, currentTime) && isAfter(program.endTime, currentTime);
  }, [currentTime]);

  // Get program status
  const getProgramStatus = useCallback((program: ScheduleItem) => {
    if (isProgramLive(program)) {
      return { label: 'LIVE', variant: 'destructive' as const, icon: Radio };
    }
    if (isAfter(program.startTime, currentTime)) {
      return { label: 'UPCOMING', variant: 'secondary' as const, icon: Clock };
    }
    return { label: 'ENDED', variant: 'outline' as const, icon: null };
  }, [isProgramLive, currentTime]);

  // Navigate time range
  const navigateTime = useCallback((direction: 'prev' | 'next' | 'now') => {
    if (direction === 'now') {
      setGuideStartTime(new Date());
    } else {
      const hours = direction === 'next' ? showTimeRange : -showTimeRange;
      setGuideStartTime(prev => addHours(prev, hours));
    }
  }, [showTimeRange]);

  // Handle program click
  const handleProgramClick = useCallback((program: ScheduleItem) => {
    onProgramSelect?.(program);
    if (onChannelSelect) {
      onChannelSelect(program.channelId);
    }
  }, [onProgramSelect, onChannelSelect]);

  // Format time for display
  const formatTime = (date: Date) => format(date, 'HH:mm');
  const formatDate = (date: Date) => format(date, 'MMM dd');

  return (
    <div className={`bg-background border rounded-lg ${className}`}>
      {/* Header */}
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            TV Guide
            <Badge variant="outline" className="ml-2">
              {formatDate(guideStartTime)}
            </Badge>
          </CardTitle>
          
          <div className="flex items-center gap-2">
            {/* Filter */}
            <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
              <SelectTrigger className="w-32">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="live">Live Now</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
              </SelectContent>
            </Select>

            {/* Navigation */}
            <div className="flex items-center gap-1">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateTime('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateTime('now')}
              >
                <RotateCcw className="h-4 w-4" />
                Now
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigateTime('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Time Header */}
        <div className="sticky top-0 z-10 bg-background border-b mb-4">
          <ScrollArea>
            <div 
              ref={scrollContainerRef}
              className="flex items-center gap-0 pb-2 min-w-max"
            >
              <div className="w-48 flex-shrink-0" /> {/* Channel column spacer */}
              {tvGuideData.timeSlots.map((timeSlot, index) => (
                <div
                  key={timeSlot.getTime()}
                  className="w-30 flex-shrink-0 px-2 py-1 text-center border-l first:border-l-0"
                  style={{ width: '120px' }}
                >
                  <div className="text-sm font-medium">
                    {formatTime(timeSlot)}
                  </div>
                  {index % 2 === 0 && (
                    <div className="text-xs text-muted-foreground">
                      {format(timeSlot, 'MMM dd')}
                    </div>
                  )}
                </div>
              ))}
              
              {/* Current Time Indicator */}
              <div
                ref={currentTimeIndicatorRef}
                className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20 pointer-events-none"
                style={{
                  left: `${248 + (tvGuideData.timeSlots.findIndex(slot => 
                    slot.getTime() >= currentTime.getTime()
                  ) * 120)}px`
                }}
              >
                <div className="absolute -top-2 -left-1 w-3 h-3 bg-red-500 rounded-full" />
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Channel Grid */}
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {CHANNELS.map((channel) => {
              const channelPrograms = getFilteredPrograms(
                tvGuideData.programs.get(channel.id) || []
              );
              const currentProgram = getCurrentProgram(channel.id as ChannelId);
              const nextProgram = getNextProgram(channel.id as ChannelId);

              return (
                <div
                  key={channel.id}
                  className={`flex items-center border rounded-lg transition-colors ${
                    selectedChannel === channel.id ? 'bg-accent' : 'hover:bg-accent/50'
                  }`}
                >
                  {/* Channel Info */}
                  <div 
                    className="w-48 flex-shrink-0 p-4 cursor-pointer"
                    onClick={() => onChannelSelect?.(channel.id as ChannelId)}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: channel.color }}
                      >
                        {channel.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{channel.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {channel.category}
                        </div>
                        {currentProgram && (
                          <div className="flex items-center gap-1 mt-1">
                            {isProgramLive(currentProgram) && (
                              <Badge variant="destructive" className="text-xs">
                                <Radio className="h-2 w-2 mr-1" />
                                LIVE
                              </Badge>
                            )}
                            <Users className="h-3 w-3" />
                            <span className="text-xs">
                              {Math.floor(Math.random() * 500) + 50}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Programs Timeline */}
                  <div className="flex-1 relative h-20 overflow-hidden">
                    <div className="relative h-full min-w-max">
                      {channelPrograms.map((program) => {
                        const style = getProgramStyle(program);
                        const status = getProgramStatus(program);
                        const isHovered = hoveredProgram === program.id;
                        const isSelected = selectedChannel === channel.id;

                        return (
                          <div
                            key={program.id}
                            className={`absolute top-2 bottom-2 rounded border cursor-pointer transition-all ${
                              isProgramLive(program)
                                ? 'bg-red-100 border-red-300 dark:bg-red-950 dark:border-red-700'
                                : isSelected
                                ? 'bg-accent border-accent-foreground'
                                : 'bg-card border-border hover:bg-accent'
                            } ${isHovered ? 'z-10 scale-105 shadow-lg' : ''}`}
                            style={{
                              left: `${style.left}px`,
                              width: `${Math.max(style.width, 100)}px`,
                            }}
                            onClick={() => handleProgramClick(program)}
                            onMouseEnter={() => setHoveredProgram(program.id)}
                            onMouseLeave={() => setHoveredProgram(null)}
                          >
                            <div className="p-2 h-full flex flex-col justify-between overflow-hidden">
                              <div>
                                <div className="flex items-center gap-1 mb-1">
                                  <Badge 
                                    variant={status.variant} 
                                    className="text-xs px-1 py-0"
                                  >
                                    {status.icon && <status.icon className="h-2 w-2 mr-1" />}
                                    {status.label}
                                  </Badge>
                                  {program.type === 'premiere' && (
                                    <Star className="h-3 w-3 text-yellow-500" />
                                  )}
                                </div>
                                
                                <div className="text-sm font-medium line-clamp-1">
                                  {program.title}
                                </div>
                                
                                {!compactMode && program.description && (
                                  <div className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                    {program.description}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                                  {formatTime(program.startTime)} - {formatTime(program.endTime)}
                                </span>
                                {isProgramLive(program) && (
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                    <Play className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>

        {/* Current Programming Summary */}
        {!compactMode && (
          <div className="mt-4 p-4 bg-accent/50 rounded-lg">
            <h4 className="font-medium mb-2">Now Playing</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {CHANNELS.slice(0, 4).map((channel) => {
                const currentProgram = getCurrentProgram(channel.id as ChannelId);
                return (
                  <div key={channel.id} className="space-y-1">
                    <div className="font-medium">{channel.name}</div>
                    {currentProgram ? (
                      <div className="text-muted-foreground line-clamp-2">
                        {currentProgram.title}
                      </div>
                    ) : (
                      <div className="text-muted-foreground">No programming</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </div>
  );
}