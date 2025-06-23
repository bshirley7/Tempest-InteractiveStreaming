'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Radio, 
  Users, 
  Clock, 
  Star,
  Flame,
  TrendingUp 
} from 'lucide-react';

interface Channel {
  id: string;
  name: string;
  category: string;
  viewers: number;
  isLive: boolean;
  thumbnail: string;
  description: string;
  university: string;
  logo?: string;
  logoSvg?: string;
  rating: number;
  trending: boolean;
}

interface TVGuideProps {
  onChannelSelect: (channelId: string) => void;
  selectedChannel: string | null;
}

export function TVGuide({ onChannelSelect, selectedChannel }: TVGuideProps) {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [filter, setFilter] = useState<'all' | 'live' | 'trending'>('all');

  useEffect(() => {
    // Simulate fetching channels
    const mockChannels: Channel[] = [
      {
        id: '1',
        name: 'Campus News Live',
        name: 'Campus Pulse',
        category: 'News',
        viewers: 1247,
        isLive: true,
        thumbnail: 'https://images.pexels.com/photos/1181273/pexels-photo-1181273.jpeg?auto=compress&cs=tinysrgb&w=300',
        description: 'Daily campus news and announcements',
        university: 'State University',
        rating: 4.5,
        trending: true,
        logoSvg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
      },
      {
        id: '2',
        name: 'Chemistry 101',
        category: 'Education',
        viewers: 892,
        isLive: true,
        thumbnail: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=300',
        description: 'Introduction to General Chemistry',
        university: 'Tech Institute',
        rating: 4.8,
        trending: false,
        logoSvg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>'
      },
      {
        id: '3',
        name: 'Basketball Championship',
        category: 'Sports',
        viewers: 3421,
        isLive: true,
        thumbnail: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=300',
        description: 'Live coverage of the championship game',
        university: 'Metro College',
        rating: 4.9,
        trending: true,
        logo: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=50'
      },
      {
        id: '4',
        name: 'Art Workshop',
        category: 'Creative',
        viewers: 234,
        isLive: false,
        thumbnail: 'https://images.pexels.com/photos/1193743/pexels-photo-1193743.jpeg?auto=compress&cs=tinysrgb&w=300',
        description: 'Digital art techniques and tutorials',
        university: 'Arts Academy',
        rating: 4.3,
        trending: false,
        logoSvg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
      },
      {
        id: '5',
        name: 'Student Debate',
        category: 'Discussion',
        viewers: 567,
        isLive: true,
        thumbnail: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=300',
        description: 'Weekly student debate on current topics',
        university: 'Liberal Arts College',
        rating: 4.2,
        trending: false,
        logoSvg: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'
      }
    ];
    setChannels(mockChannels);
  }, []);

  const filteredChannels = channels.filter(channel => {
    if (filter === 'live') return channel.isLive;
    if (filter === 'trending') return channel.trending;
    return true;
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      'News': 'bg-red-500/20 text-red-700 dark:text-red-300',
      'Education': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
      'Sports': 'bg-green-500/20 text-green-700 dark:text-green-300',
      'Creative': 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
      'Discussion': 'bg-orange-500/20 text-orange-700 dark:text-orange-300',
    };
    return colors[category as keyof typeof colors] || 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
  };

  const renderChannelLogo = (channel: Channel) => {
    if (channel.logoSvg) {
      return (
        <div 
          className="w-6 h-6 flex items-center justify-center text-primary"
          dangerouslySetInnerHTML={{ __html: channel.logoSvg }}
        />
      );
    } else if (channel.logo) {
      return (
        <img
          src={channel.logo}
          alt={`${channel.name} logo`}
          className="w-6 h-6 object-contain rounded"
          onError={(e) => {
            // Fallback to default icon if image fails to load
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextElementSibling?.classList.remove('hidden');
          }}
        />
      );
    } else {
      return <Radio className="h-4 w-4 text-primary" />;
    }
  };
  return (
    <Card className="h-[calc(100vh-8rem)]">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center">
            <Radio className="h-5 w-5 mr-2" />
            TV Guide
          </span>
        </CardTitle>
        
        {/* Filter Buttons */}
        <div className="flex space-x-1">
          <Button
            variant={filter === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('all')}
            className="text-xs"
          >
            All
          </Button>
          <Button
            variant={filter === 'live' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('live')}
            className="text-xs"
          >
            <div className="h-2 w-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
            Live
          </Button>
          <Button
            variant={filter === 'trending' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter('trending')}
            className="text-xs"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Trending
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-4 space-y-3">
            {filteredChannels.map((channel) => (
              <div
                key={channel.id}
                className={`
                  p-3 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md
                  ${selectedChannel === channel.id 
                    ? 'border-primary bg-primary/5 shadow-md' 
                    : 'border-border hover:border-primary/50'
                  }
                `}
                onClick={() => onChannelSelect(channel.id)}
              >
                <div className="flex items-start space-x-3">
                  {/* Thumbnail */}
                  <div className="relative">
                    {/* Channel Logo Overlay */}
                    <div className="absolute -top-1 -left-1 w-6 h-6 bg-background border border-border rounded-full flex items-center justify-center z-10">
                      {renderChannelLogo(channel)}
                    </div>
                    <img
                      src={channel.thumbnail}
                      alt={channel.name}
                      className="w-16 h-12 rounded object-cover"
                    />
                    {channel.isLive && (
                      <div className="absolute top-1 left-1">
                        <Badge variant="destructive" className="text-xs px-1 py-0">
                          LIVE
                        </Badge>
                      </div>
                    )}
                    {channel.trending && (
                      <div className="absolute top-1 right-1">
                        <Flame className="h-3 w-3 text-orange-500" />
                      </div>
                    )}
                  </div>
                  
                  {/* Channel Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{channel.name}</h4>
                    <p className="text-xs text-muted-foreground truncate mb-1">
                      {channel.description}
                    </p>
                    
                    {/* Category and University */}
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary" className={`text-xs ${getCategoryColor(channel.category)}`}>
                        {channel.category}
                      </Badge>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {channel.viewers.toLocaleString()}
                        </div>
                        <div className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-500" />
                          {channel.rating}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground truncate">
                        {channel.university}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}