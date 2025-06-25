'use client';

import { supabase } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/types';

type ChannelRow = Database['public']['Tables']['channels']['Row'];

export interface EPGChannel {
  id: string;
  name: string;
  number: string;
  logo: string;
  category: string;
  isHD: boolean;
  isLive: boolean;
  currentViewers?: number;
  programs: EPGProgram[];
}

export interface EPGProgram {
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

/**
 * Fetch channels from Supabase for EPG display
 * @param liveOnly - If true, only fetch channels that are currently live
 */
export async function fetchChannels(liveOnly: boolean = false): Promise<EPGChannel[]> {
  if (!supabase) {
    console.warn('Supabase not configured, returning mock channels for demo');
    return getMockChannels();
  }

  try {
    let query = supabase
      .from('channels')
      .select('*');
    
    // Filter for live channels only if requested
    if (liveOnly) {
      query = query.eq('is_live', true);
    }
    
    const { data: channels, error } = await query.order('name');

    if (error) {
      console.error('Error fetching channels:', error);
      return getMockChannels();
    }

    if (!channels || channels.length === 0) {
      console.warn('No channels found in database, returning mock channels');
      return getMockChannels();
    }

    // Transform Supabase channels to EPG format
    return channels.map((channel, index) => transformChannelToEPG(channel, index + 1));
  } catch (error) {
    console.error('Failed to fetch channels:', error);
    return getMockChannels();
  }
}

/**
 * Transform Supabase channel to EPG format
 */
function transformChannelToEPG(channel: ChannelRow, channelNumber: number): EPGChannel {
  // Generate time slots for the next 6 hours in 30-minute intervals
  const slots: Date[] = [];
  const now = new Date();
  now.setMinutes(0, 0, 0); // Round to nearest hour
  
  for (let i = 0; i < 12; i++) {
    const slot = new Date(now);
    slot.setMinutes(i * 30);
    slots.push(slot);
  }

  // Prioritize SVG content, then logo_url, then thumbnail_url, then empty (will use fallback)
  let logoUrl = '';
  if (channel.logo_svg) {
    // For SVG content, create a data URL
    logoUrl = `data:image/svg+xml,${encodeURIComponent(channel.logo_svg)}`;
  } else if (channel.logo_url) {
    logoUrl = channel.logo_url;
  } else if (channel.thumbnail_url) {
    logoUrl = channel.thumbnail_url;
  }
  // Don't use default images - let the component handle text fallback

  return {
    id: channel.id,
    name: channel.name,
    number: channelNumber.toString().padStart(3, '0'),
    logo: logoUrl,
    category: channel.category,
    isHD: true, // Assume all channels support HD
    isLive: channel.is_live,
    currentViewers: Math.floor(Math.random() * 5000) + 100, // Mock viewer count
    programs: generatePrograms(channel.id, channel.name, channel.category, slots)
  };
}

/**
 * Generate mock programs for a channel
 */
function generatePrograms(channelId: string, channelName: string, category: string, slots: Date[]): EPGProgram[] {
  const programTemplates = getCategoryPrograms(category);
  
  return slots.slice(0, -1).map((slot, index) => {
    const endTime = new Date(slot);
    endTime.setMinutes(endTime.getMinutes() + 30);
    
    return {
      id: `${channelId}-${index}`,
      title: programTemplates[index % programTemplates.length],
      description: `Join us for ${programTemplates[index % programTemplates.length].toLowerCase()} on ${channelName}.`,
      startTime: slot,
      endTime: endTime,
      category: category,
      rating: Math.random() > 0.5 ? Number((Math.random() * 2 + 3).toFixed(1)) : undefined,
      isLive: index === 0, // First program is live
      isNew: Math.random() > 0.7,
      isRepeat: Math.random() > 0.8,
      thumbnail: `https://images.pexels.com/photos/${1000000 + Math.floor(Math.random() * 1000000)}/pexels-photo-${1000000 + Math.floor(Math.random() * 1000000)}.jpeg?auto=compress&cs=tinysrgb&w=300`
    };
  });
}

/**
 * Get program templates based on category
 */
function getCategoryPrograms(category: string): string[] {
  const programMap: Record<string, string[]> = {
    'news': [
      'Campus Morning Update', 'Breaking News', 'Student Government Live', 
      'Weather & Traffic', 'Faculty Spotlight', 'Campus Events Today'
    ],
    'education': [
      'Physics 101 Lecture', 'Chemistry Lab Demo', 'Mathematics Tutorial', 
      'Computer Science Workshop', 'Biology Seminar', 'Engineering Design'
    ],
    'sports': [
      'Basketball Game Live', 'Soccer Match', 'Swimming Championship', 
      'Track & Field', 'Tennis Tournament', 'Sports Highlights'
    ],
    'entertainment': [
      'Art Gallery Tour', 'Music Performance', 'Theater Production', 
      'Dance Showcase', 'Poetry Reading', 'Cultural Festival'
    ],
    'documentary': [
      'Climate Research', 'Medical Breakthroughs', 'Space Exploration', 
      'Technology Innovation', 'Historical Archives', 'Scientific Discovery'
    ]
  };

  return programMap[category] || programMap['education'];
}

/**
 * Get default logo based on category
 */
function getDefaultChannelLogo(category: string): string {
  const logoMap: Record<string, string> = {
    'news': 'https://images.pexels.com/photos/1181273/pexels-photo-1181273.jpeg?auto=compress&cs=tinysrgb&w=100',
    'education': 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=100',
    'sports': 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=100',
    'entertainment': 'https://images.pexels.com/photos/1193743/pexels-photo-1193743.jpeg?auto=compress&cs=tinysrgb&w=100',
    'documentary': 'https://images.pexels.com/photos/159490/yale-university-landscape-universities-schools-159490.jpeg?auto=compress&cs=tinysrgb&w=100'
  };

  return logoMap[category] || logoMap['education'];
}

/**
 * Fallback mock channels if Supabase is not available
 */
function getMockChannels(): EPGChannel[] {
  // Generate time slots for the next 6 hours in 30-minute intervals
  const slots: Date[] = [];
  const now = new Date();
  now.setMinutes(0, 0, 0); // Round to nearest hour
  
  for (let i = 0; i < 12; i++) {
    const slot = new Date(now);
    slot.setMinutes(i * 30);
    slots.push(slot);
  }

  const mockChannels = [
    {
      id: 'campus-news',
      name: 'Campus News Network',
      category: 'news'
    },
    {
      id: 'edu-channel',
      name: 'University Education',
      category: 'education'
    },
    {
      id: 'sports-network',
      name: 'Campus Sports',
      category: 'sports'
    },
    {
      id: 'arts-culture',
      name: 'Arts & Culture',
      category: 'entertainment'
    },
    {
      id: 'research-docs',
      name: 'Research & Docs',
      category: 'documentary'
    }
  ];

  return mockChannels.map((channel, index) => ({
    id: channel.id,
    name: channel.name,
    number: (index + 1).toString().padStart(3, '0'),
    logo: getDefaultChannelLogo(channel.category),
    category: channel.category,
    isHD: true,
    isLive: index === 0, // First channel is live
    currentViewers: Math.floor(Math.random() * 5000) + 100,
    programs: generatePrograms(channel.id, channel.name, channel.category, slots)
  }));
}