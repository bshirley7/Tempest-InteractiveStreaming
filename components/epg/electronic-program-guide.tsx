'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Calendar,
  Filter,
  Search,
  Grid,
  List,
  Play,
  Radio,
  Star,
  Users,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { CurrentTimeIndicator } from './current-time-indicator';
import { fetchChannels, EPGChannel, EPGProgram } from '@/lib/services/channel-service';

// Use types from the channel service
type Program = EPGProgram;
type Channel = EPGChannel;

interface EPGProps {
  onChannelSelect: (channelId: string, channelData?: Channel) => void;
  onChannelDoubleClick?: (channelId: string, channelData?: Channel) => void;
  selectedChannel: string | null;
}

export function ElectronicProgramGuide({ onChannelSelect, onChannelDoubleClick, selectedChannel }: EPGProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<Date[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories = [
    'all', 'announcements', 'news', 'education', 'sports', 'entertainment', 'documentary'
  ];

  useEffect(() => {
    // Initialize current time
    setCurrentTime(new Date());
    
    // Generate time slots for the next 6 hours in 30-minute intervals
    const slots: Date[] = [];
    const now = new Date();
    now.setMinutes(0, 0, 0); // Round to nearest hour
    
    for (let i = 0; i < 12; i++) {
      const slot = new Date(now);
      slot.setMinutes(i * 30);
      slots.push(slot);
    }
    setTimeSlots(slots);

    // Fetch channels from Supabase
    const loadChannels = async () => {
      try {
        setLoading(true);
        const channelData = await fetchChannels();
        setChannels(channelData);
      } catch (error) {
        console.error('Failed to load channels:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChannels();
  }, []);

  // Update current time every minute
  useEffect(() => {
    if (!currentTime) return;
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);


  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const getCurrentProgram = (channel: Channel) => {
    if (!currentTime) return null;
    return channel.programs.find(program => 
      currentTime >= program.startTime && currentTime < program.endTime
    );
  };

  const getProgressPercentage = (program: Program) => {
    if (!currentTime) return 0;
    const total = program.endTime.getTime() - program.startTime.getTime();
    const elapsed = currentTime.getTime() - program.startTime.getTime();
    return Math.max(0, Math.min(100, (elapsed / total) * 100));
  };

  const filteredChannels = channels.filter(channel => {
    const categoryMatch = selectedCategory === 'all' || channel.category === selectedCategory;
    const searchMatch = searchQuery === '' || 
      channel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      channel.programs.some(program => 
        program.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    return categoryMatch && searchMatch;
  });

  const scrollToCurrentTime = () => {
    if (!currentTime || !scrollRef.current) return;
    if (scrollRef.current) {
      const currentHour = currentTime.getHours();
      const scrollPosition = (currentHour - 6) * 120; // Approximate scroll position
      scrollRef.current.scrollLeft = Math.max(0, scrollPosition);
    }
  };

  // Don't render until currentTime is initialized and channels are loaded
  if (!currentTime || loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-sm text-muted-foreground">
          {loading ? 'Loading channels...' : 'Initializing...'}
        </span>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="h-full flex flex-col">
        {/* Header Controls */}
        <div className="p-4 border-b bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-semibold">{formatDate(currentTime)}</span>
              <Clock className="h-4 w-4 text-muted-foreground ml-4" />
              <span className="text-sm text-muted-foreground">{formatTime(currentTime)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="whitespace-nowrap"
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Channel List */}
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {filteredChannels.map((channel) => {
              const currentProgram = getCurrentProgram(channel);
              const nextProgram = channel.programs.find(p => p.startTime > currentTime);
              
              return (
                <motion.div
                  key={channel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20",
                      "hover:scale-[1.02] border border-white/10 backdrop-blur-sm",
                      "bg-gradient-to-br from-gray-800/40 via-gray-700/30 to-gray-800/40",
                      "hover:bg-gradient-to-br hover:from-purple-500/10 hover:via-indigo-500/10 hover:to-blue-500/10",
                      selectedChannel === channel.id && "ring-2 ring-purple-500/50 bg-gradient-to-r from-purple-600/20 via-indigo-500/15 to-blue-500/20"
                    )}
                    onClick={() => onChannelSelect(channel.id, channel)}
                    onDoubleClick={() => onChannelDoubleClick?.(channel.id, channel)}
                  >
                  <CardContent className="p-0 h-48 relative overflow-hidden">
                    {/* Full-width background logo */}
                    {channel.logo ? (
                      <>
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          className="absolute inset-0 w-full h-full object-contain p-4"
                          onError={(e) => {
                            // Fallback to channel initials if logo fails to load
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              const fallback = document.createElement('div');
                              fallback.className = 'absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/30 to-primary/20 text-primary-foreground font-bold text-4xl';
                              fallback.textContent = channel.name.split(' ').map(word => word[0]).join('').substring(0, 3).toUpperCase();
                              parent.appendChild(fallback);
                            }
                          }}
                        />
                        {/* Gradient overlay for better text readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/30 to-primary/20 text-primary-foreground font-bold text-4xl">
                        {channel.name.split(' ').map(word => word[0]).join('').substring(0, 3).toUpperCase()}
                      </div>
                    )}

                    {/* Content overlay */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-between">
                      {/* Current Program */}
                      {currentProgram && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <motion.div
                              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white shadow-lg shadow-purple-500/30"
                              animate={{ scale: [1, 1.05, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            >
                              <Radio className="h-3 w-3 mr-1" />
                              LIVE
                            </motion.div>
                            <span className="text-sm text-white/90">
                              {formatTime(currentProgram.startTime)} - {formatTime(currentProgram.endTime)}
                            </span>
                          </div>
                          <h4 className="font-semibold text-lg text-white">{currentProgram.title}</h4>
                          <p className="text-sm text-white/80 line-clamp-2">
                            {currentProgram.description}
                          </p>
                        </div>
                      )}

                      {/* Bottom section */}
                      <div className="space-y-2">
                        {/* Progress bar */}
                        {currentProgram && (
                          <div className="w-full bg-white/20 rounded-full h-1">
                            <div 
                              className="bg-white h-1 rounded-full transition-all duration-300"
                              style={{ width: `${getProgressPercentage(currentProgram)}%` }}
                            />
                          </div>
                        )}
                        
                        {/* Next program and watch button */}
                        <div className="flex items-center justify-between">
                          {nextProgram && (
                            <div className="text-sm text-white/70">
                              <span className="font-medium">Next:</span> {nextProgram.title}
                            </div>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            className="ml-auto"
                            onClick={(e) => {
                              e.stopPropagation();
                              onChannelSelect(channel.id, channel);
                            }}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Watch
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                </motion.div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header Controls */}
      <div className="p-4 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-primary" />
              <span className="font-semibold">{formatDate(currentTime)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{formatTime(currentTime)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={scrollToCurrentTime}
            >
              <Clock className="h-4 w-4 mr-1" />
              Now
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="whitespace-nowrap"
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* EPG Grid */}
      <div className="flex-1 overflow-hidden">
        <div className="flex h-full">
          {/* Channel Column */}
          <div className="w-56 border-r bg-muted/30">
            <div className="h-12 border-b bg-background flex items-center px-3">
              <span className="font-semibold text-sm">Channels</span>
            </div>
            <ScrollArea className="h-[calc(100%-3rem)]">
              {filteredChannels.map((channel) => (
                <motion.div
                  key={channel.id}
                  className={cn(
                    "h-20 border-b p-2 cursor-pointer transition-all duration-300 group",
                    "hover:bg-gradient-to-r hover:from-purple-500/8 hover:via-indigo-500/8 hover:to-blue-500/8",
                    "hover:scale-[1.005]",
                    selectedChannel === channel.id && "bg-gradient-to-r from-purple-600/20 via-indigo-500/15 to-blue-500/20 border-purple-500/50"
                  )}
                  onClick={() => onChannelSelect(channel.id, channel)}
                  onDoubleClick={() => onChannelDoubleClick?.(channel.id, channel)}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: 1.005, transition: { duration: 0.2 } }}
                >
                  {/* Full-width logo display */}
                  {channel.logo ? (
                    <div className="relative w-full h-full">
                      <img
                        src={channel.logo}
                        alt={channel.name}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          // Fallback to channel initials if logo fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent) {
                            const fallback = document.createElement('div');
                            fallback.className = 'absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/30 to-primary/20 text-primary-foreground font-bold text-lg';
                            fallback.textContent = channel.name.split(' ').map(word => word[0]).join('').substring(0, 3).toUpperCase();
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                      {/* Optional gradient overlay for depth */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-primary/20 text-primary-foreground font-bold text-lg px-4">
                      <div>
                        <div className="text-center">{channel.name.split(' ').map(word => word[0]).join('').substring(0, 3).toUpperCase()}</div>
                        <div className="text-xs mt-1 opacity-80">{channel.name}</div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </ScrollArea>
          </div>

          {/* Time Grid */}
          <div className="flex-1 overflow-hidden">
            {/* Time Header */}
            <div className="h-12 border-b bg-background flex">
              <ScrollArea className="w-full" ref={scrollRef}>
                <div className="flex">
                  {timeSlots.map((slot, index) => (
                    <div
                      key={index}
                      className={cn(
                        "w-32 h-12 border-r flex items-center justify-center text-sm font-medium",
                        slot.getHours() === currentTime.getHours() && "bg-primary/10 text-primary"
                      )}
                    >
                      {formatTime(slot)}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Program Grid */}
            <ScrollArea className="h-[calc(100%-3rem)]">
              <div className="relative">
                {filteredChannels.map((channel, channelIndex) => (
                  <motion.div 
                    key={channel.id} 
                    className="h-20 border-b flex group hover:bg-gradient-to-r hover:from-purple-500/5 hover:via-indigo-500/5 hover:to-blue-500/5 transition-all duration-300"
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: channelIndex * 0.05 }}
                  >
                    {channel.programs.map((program, programIndex) => {
                      const duration = program.endTime.getTime() - program.startTime.getTime();
                      const width = (duration / (30 * 60 * 1000)) * 128; // 30 minutes = 128px
                      const isCurrentProgram = currentTime >= program.startTime && currentTime < program.endTime;
                      const progress = isCurrentProgram ? getProgressPercentage(program) : 0;

                      return (
                        <motion.div
                          key={program.id}
                          className={cn(
                            "border-r p-2 cursor-pointer transition-all duration-300 relative overflow-hidden group",
                            "hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/20",
                            "border border-white/10 backdrop-blur-sm rounded-lg m-0.5",
                            isCurrentProgram 
                              ? "bg-gradient-to-br from-purple-600/30 via-indigo-500/20 to-blue-500/30 border-purple-500/50"
                              : "bg-gradient-to-br from-gray-800/40 via-gray-700/30 to-gray-800/40 hover:bg-gradient-to-br hover:from-purple-500/10 hover:via-indigo-500/10 hover:to-blue-500/10",
                            program.isLive && "ring-2 ring-purple-500/50"
                          )}
                          style={{ width: `${width}px`, minWidth: `${width}px` }}
                          onClick={() => onChannelSelect(channel.id, channel)}
                    onDoubleClick={() => onChannelDoubleClick?.(channel.id, channel)}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.3, delay: programIndex * 0.05 }}
                          whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                        >
                          {/* Progress bar for current program */}
                          {isCurrentProgram && (
                            <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-300"
                                 style={{ width: `${progress}%` }} />
                          )}

                          <div className="flex items-center space-x-1 mb-1">
                            {program.isLive && (
                              <motion.div
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 text-white shadow-lg shadow-purple-500/30"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                ● LIVE
                              </motion.div>
                            )}
                            {program.isNew && (
                              <Badge variant="secondary" className="text-xs px-1">NEW</Badge>
                            )}
                            {program.rating && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="text-xs">{program.rating}</span>
                              </div>
                            )}
                          </div>

                          <h4 className="font-medium text-sm line-clamp-1 mb-1">
                            {program.title}
                          </h4>
                          
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {program.description}
                          </p>

                          <div className="absolute top-1 right-1 text-xs text-muted-foreground">
                            {formatTime(program.startTime)}
                          </div>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                ))}

                {/* Current Time Indicator */}
                <CurrentTimeIndicator 
                  startTime={timeSlots[0]} 
                  endTime={timeSlots[timeSlots.length - 1]} 
                  className="bg-gradient-to-b from-purple-500 via-indigo-500 to-blue-500"
                />
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}