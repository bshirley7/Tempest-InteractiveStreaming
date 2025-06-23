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
  Settings
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
  isRepeat?: boolean;
  thumbnail?: string;
}

interface Channel {
  id: string;
  name: string;
  number: string;
  logo: string;
  category: string;
  isHD: boolean;
  programs: Program[];
  currentViewers?: number;
}

interface EPGProps {
  onChannelSelect: (channelId: string) => void;
  selectedChannel: string | null;
}

export function ElectronicProgramGuide({ onChannelSelect, selectedChannel }: EPGProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<Date[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const categories = [
    'all', 'news', 'education', 'sports', 'entertainment', 'documentary'
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

    // Mock channel data with realistic programming
    const mockChannels: Channel[] = [
      {
        id: 'campus-news',
        name: 'Campus News Network',
        number: '001',
        logo: 'https://images.pexels.com/photos/1181273/pexels-photo-1181273.jpeg?auto=compress&cs=tinysrgb&w=100',
        category: 'news',
        isHD: true,
        currentViewers: 1247,
        programs: generatePrograms('campus-news', slots)
      },
      {
        id: 'edu-channel',
        name: 'University Education',
        number: '002',
        logo: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=100',
        category: 'education',
        isHD: true,
        currentViewers: 892,
        programs: generatePrograms('edu-channel', slots)
      },
      {
        id: 'sports-network',
        name: 'Campus Sports',
        number: '003',
        logo: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=100',
        category: 'sports',
        isHD: true,
        currentViewers: 3421,
        programs: generatePrograms('sports-network', slots)
      },
      {
        id: 'arts-culture',
        name: 'Arts & Culture',
        number: '004',
        logo: 'https://images.pexels.com/photos/1193743/pexels-photo-1193743.jpeg?auto=compress&cs=tinysrgb&w=100',
        category: 'entertainment',
        isHD: true,
        currentViewers: 567,
        programs: generatePrograms('arts-culture', slots)
      },
      {
        id: 'student-life',
        name: 'Student Life TV',
        number: '005',
        logo: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=100',
        category: 'entertainment',
        isHD: true,
        currentViewers: 234,
        programs: generatePrograms('student-life', slots)
      },
      {
        id: 'research-docs',
        name: 'Research & Docs',
        number: '006',
        logo: 'https://images.pexels.com/photos/159490/yale-university-landscape-universities-schools-159490.jpeg?auto=compress&cs=tinysrgb&w=100',
        category: 'documentary',
        isHD: true,
        currentViewers: 445,
        programs: generatePrograms('research-docs', slots)
      }
    ];

    setChannels(mockChannels);
  }, []);

  // Update current time every minute
  useEffect(() => {
    if (!currentTime) return;
    
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const generatePrograms = (channelId: string, slots: Date[]): Program[] => {
    const programTemplates = {
      'campus-news': [
        'Campus Morning Update', 'Breaking News', 'Student Government Live', 
        'Weather & Traffic', 'Faculty Spotlight', 'Campus Events Today'
      ],
      'edu-channel': [
        'Physics 101 Lecture', 'Chemistry Lab Demo', 'Mathematics Tutorial', 
        'Computer Science Workshop', 'Biology Seminar', 'Engineering Design'
      ],
      'sports-network': [
        'Basketball Game Live', 'Soccer Match', 'Swimming Championship', 
        'Track & Field', 'Tennis Tournament', 'Sports Highlights'
      ],
      'arts-culture': [
        'Art Gallery Tour', 'Music Performance', 'Theater Production', 
        'Dance Showcase', 'Poetry Reading', 'Cultural Festival'
      ],
      'student-life': [
        'Dorm Life Documentary', 'Study Tips', 'Career Fair Coverage', 
        'Club Spotlight', 'Campus Tour', 'Student Interviews'
      ],
      'research-docs': [
        'Climate Research', 'Medical Breakthroughs', 'Space Exploration', 
        'Technology Innovation', 'Historical Archives', 'Scientific Discovery'
      ]
    };

    const templates = programTemplates[channelId as keyof typeof programTemplates] || programTemplates['campus-news'];
    
    return slots.slice(0, -1).map((slot, index) => {
      const endTime = new Date(slot);
      endTime.setMinutes(endTime.getMinutes() + 30);
      
      return {
        id: `${channelId}-${index}`,
        title: templates[index % templates.length],
        description: `Join us for ${templates[index % templates.length].toLowerCase()} featuring the latest updates and insights.`,
        startTime: slot,
        endTime: endTime,
        category: channelId.includes('news') ? 'news' : channelId.includes('edu') ? 'education' : 'entertainment',
        rating: Math.random() > 0.5 ? Number((Math.random() * 2 + 3).toFixed(1)) : undefined,
        isLive: index === 0, // First program is live
        isNew: Math.random() > 0.7,
        isRepeat: Math.random() > 0.8,
        thumbnail: `https://images.pexels.com/photos/${1000000 + Math.floor(Math.random() * 1000000)}/pexels-photo-${1000000 + Math.floor(Math.random() * 1000000)}.jpeg?auto=compress&cs=tinysrgb&w=300`
      };
    });
  };

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

  // Don't render until currentTime is initialized
  if (!currentTime) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
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
                <Card 
                  key={channel.id}
                  className={cn(
                    "cursor-pointer transition-all hover:shadow-md",
                    selectedChannel === channel.id && "ring-2 ring-primary"
                  )}
                  onClick={() => onChannelSelect(channel.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* Channel Logo */}
                      <div className="relative">
                        <img
                          src={channel.logo}
                          alt={channel.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs px-1 rounded">
                          {channel.number}
                        </div>
                      </div>

                      {/* Channel Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-lg">{channel.name}</h3>
                          {channel.isHD && <Badge variant="secondary">HD</Badge>}
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{channel.currentViewers?.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Current Program */}
                        {currentProgram && (
                          <div className="mb-3">
                            <div className="flex items-center space-x-2 mb-1">
                              <Badge variant="destructive" className="animate-pulse">
                                <Radio className="h-3 w-3 mr-1" />
                                LIVE
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                {formatTime(currentProgram.startTime)} - {formatTime(currentProgram.endTime)}
                              </span>
                            </div>
                            <h4 className="font-medium">{currentProgram.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {currentProgram.description}
                            </p>
                            <div className="mt-2">
                              <div className="w-full bg-muted rounded-full h-1">
                                <div 
                                  className="bg-primary h-1 rounded-full transition-all duration-300"
                                  style={{ width: `${getProgressPercentage(currentProgram)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Next Program */}
                        {nextProgram && (
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">Next:</span> {nextProgram.title} at {formatTime(nextProgram.startTime)}
                          </div>
                        )}
                      </div>

                      {/* Action Button */}
                      <Button
                        size="sm"
                        className="shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onChannelSelect(channel.id);
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Watch
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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
          <div className="w-48 border-r bg-muted/30">
            <div className="h-12 border-b bg-background flex items-center px-3">
              <span className="font-semibold text-sm">Channels</span>
            </div>
            <ScrollArea className="h-[calc(100%-3rem)]">
              {filteredChannels.map((channel) => (
                <div
                  key={channel.id}
                  className={cn(
                    "h-20 border-b p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                    selectedChannel === channel.id && "bg-primary/10 border-primary/50"
                  )}
                  onClick={() => onChannelSelect(channel.id)}
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src={channel.logo}
                      alt={channel.name}
                      className="w-8 h-8 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-1">
                        <span className="text-xs font-mono text-muted-foreground">
                          {channel.number}
                        </span>
                        {channel.isHD && (
                          <Badge variant="secondary" className="text-xs px-1">HD</Badge>
                        )}
                      </div>
                      <p className="font-medium text-sm truncate">{channel.name}</p>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{channel.currentViewers?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
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
                  <div key={channel.id} className="h-20 border-b flex">
                    {channel.programs.map((program, programIndex) => {
                      const duration = program.endTime.getTime() - program.startTime.getTime();
                      const width = (duration / (30 * 60 * 1000)) * 128; // 30 minutes = 128px
                      const isCurrentProgram = currentTime >= program.startTime && currentTime < program.endTime;
                      const progress = isCurrentProgram ? getProgressPercentage(program) : 0;

                      return (
                        <div
                          key={program.id}
                          className={cn(
                            "border-r p-2 cursor-pointer hover:bg-muted/50 transition-colors relative overflow-hidden",
                            isCurrentProgram && "bg-primary/5 border-primary/50",
                            program.isLive && "ring-1 ring-primary"
                          )}
                          style={{ width: `${width}px`, minWidth: `${width}px` }}
                          onClick={() => onChannelSelect(channel.id)}
                        >
                          {/* Progress bar for current program */}
                          {isCurrentProgram && (
                            <div className="absolute bottom-0 left-0 h-1 bg-primary transition-all duration-300"
                                 style={{ width: `${progress}%` }} />
                          )}

                          <div className="flex items-center space-x-1 mb-1">
                            {program.isLive && (
                              <Badge variant="destructive" className="text-xs px-1 animate-pulse">
                                LIVE
                              </Badge>
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
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* Current Time Indicator */}
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
                  style={{ 
                    left: `${((currentTime.getMinutes() / 60) * 128) + (currentTime.getHours() - timeSlots[0].getHours()) * 128}px` 
                  }}
                >
                  <div className="absolute -top-2 -left-1 w-3 h-3 bg-red-500 rounded-full" />
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}