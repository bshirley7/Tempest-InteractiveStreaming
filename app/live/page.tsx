'use client';

import { useState, useEffect, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { ElectronicProgramGuide } from '@/components/epg/electronic-program-guide';
import { MiniVideoPlayer } from '@/components/epg/mini-video-player';
import { StreamPlayer } from '@/components/video/stream-player';
import { VideoPlayerWithInteractions } from '@/components/video/VideoPlayerWithInteractions';
import { ChatSidebar } from '@/components/chat/chat-sidebar';
import { InteractionOverlay } from '@/components/interactions/interaction-overlay';
import { Button } from '@/components/ui/button';
import { Play, Maximize2, Volume2, Settings, Grid, List } from 'lucide-react';
import { cn } from '@/lib/utils';

function LivePageContent() {
  // Check if Clerk is properly configured
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = publishableKey && !publishableKey.includes('actual-bullfrog');
  
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [showMiniPlayer, setShowMiniPlayer] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedChannelData, setSelectedChannelData] = useState<any>(null);
  const [currentProgram, setCurrentProgram] = useState<any>(null);
  const [nextProgram, setNextProgram] = useState<any>(null);

  // Mock channel data (in a real app, this would come from your data source)
  const mockChannels = {
    'campus-pulse': {
      id: 'campus-pulse',
      name: 'Campus Pulse',
      number: '001',
      logo: 'https://images.pexels.com/photos/256417/pexels-photo-256417.jpeg?auto=compress&cs=tinysrgb&w=100',
      category: 'announcements',
      isHD: true,
      currentViewers: 2147
    },
    'campus-news': {
      id: 'campus-news',
      name: 'Campus News Network',
      number: '002',
      logo: 'https://images.pexels.com/photos/1181273/pexels-photo-1181273.jpeg?auto=compress&cs=tinysrgb&w=100',
      category: 'news',
      isHD: true,
      currentViewers: 1247
    },
    'edu-channel': {
      id: 'edu-channel',
      name: 'University Education',
      number: '003',
      logo: 'https://images.pexels.com/photos/2280571/pexels-photo-2280571.jpeg?auto=compress&cs=tinysrgb&w=100',
      category: 'education',
      isHD: true,
      currentViewers: 892
    },
    'sports-network': {
      id: 'sports-network',
      name: 'Campus Sports',
      number: '004',
      logo: 'https://images.pexels.com/photos/1752757/pexels-photo-1752757.jpeg?auto=compress&cs=tinysrgb&w=100',
      category: 'sports',
      isHD: true,
      currentViewers: 3421
    },
    'arts-culture': {
      id: 'arts-culture',
      name: 'Arts & Culture',
      number: '005',
      logo: 'https://images.pexels.com/photos/1193743/pexels-photo-1193743.jpeg?auto=compress&cs=tinysrgb&w=100',
      category: 'entertainment',
      isHD: true,
      currentViewers: 567
    },
    'student-life': {
      id: 'student-life',
      name: 'Student Life TV',
      number: '006',
      logo: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=100',
      category: 'entertainment',
      isHD: true,
      currentViewers: 234
    },
    'research-docs': {
      id: 'research-docs',
      name: 'Research & Docs',
      number: '007',
      logo: 'https://images.pexels.com/photos/159490/yale-university-landscape-universities-schools-159490.jpeg?auto=compress&cs=tinysrgb&w=100',
      category: 'documentary',
      isHD: true,
      currentViewers: 445
    }
  };

  const handleChannelSelect = (channelId: string, channelData?: any) => {
    setSelectedChannel(channelId);
    setShowMiniPlayer(true);
    
    // Use provided channel data, or fallback to mock data, or create default
    let channel = channelData;
    
    if (!channel) {
      // Try mock channels first
      channel = mockChannels[channelId as keyof typeof mockChannels];
    }
    
    if (!channel) {
      // Create fallback data for unknown channels
      channel = {
        id: channelId,
        name: 'Live Channel',
        number: '001',
        logo: '',
        category: 'general',
        isHD: true,
        currentViewers: Math.floor(Math.random() * 1000) + 100
      };
    }
    
    setSelectedChannelData(channel);
    
    // Mock current and next programs
    const now = new Date();
    const currentStart = new Date(now);
    currentStart.setMinutes(0, 0, 0);
    const currentEnd = new Date(currentStart);
    currentEnd.setMinutes(30);
    
    const nextStart = new Date(currentEnd);
    const nextEnd = new Date(nextStart);
    nextEnd.setMinutes(nextStart.getMinutes() + 30);
    
    const programTitles = {
      'campus-pulse': ['Campus Updates Live', 'Important Announcements'],
      'campus-news': ['Campus Morning Update', 'Breaking News Live'],
      'edu-channel': ['Physics 101 Lecture', 'Chemistry Lab Demo'],
      'sports-network': ['Basketball Game Live', 'Sports Highlights'],
      'arts-culture': ['Art Gallery Tour', 'Music Performance'],
      'student-life': ['Dorm Life Documentary', 'Study Tips'],
      'research-docs': ['Climate Research', 'Medical Breakthroughs']
    };
    
    const titles = programTitles[channelId as keyof typeof programTitles] || ['Live Program', 'Next Program'];
    
    const currentProgramData = {
      id: `${channelId}-current`,
      title: titles[0],
      description: `Join us for ${titles[0].toLowerCase()} featuring the latest updates and insights from our university community.`,
      startTime: currentStart,
      endTime: currentEnd,
      category: channel?.category || 'general',
      rating: Math.random() > 0.5 ? Number((Math.random() * 2 + 3).toFixed(1)) : undefined,
      isLive: true,
      isNew: Math.random() > 0.7,
      thumbnail: `https://images.pexels.com/photos/${1000000 + Math.floor(Math.random() * 1000000)}/pexels-photo-${1000000 + Math.floor(Math.random() * 1000000)}.jpeg?auto=compress&cs=tinysrgb&w=400`
    };
    
    setCurrentProgram(currentProgramData);
    
    setNextProgram({
      id: `${channelId}-next`,
      title: titles[1],
      description: `Coming up next: ${titles[1].toLowerCase()} with comprehensive coverage and analysis.`,
      startTime: nextStart,
      endTime: nextEnd,
      category: channel?.category || 'general',
      isLive: false,
      isNew: false
    });
  };

  const handleCloseMiniPlayer = () => {
    setShowMiniPlayer(false);
    setSelectedChannel(null);
    setSelectedChannelData(null);
    setCurrentProgram(null);
    setNextProgram(null);
  };

  const handleExpandToFullPlayer = () => {
    setIsFullscreen(true);
    setShowMiniPlayer(false);
  };

  const handleDoubleClick = (channelId: string, channelData?: any) => {
    // First select the channel if not already selected
    if (selectedChannel !== channelId) {
      handleChannelSelect(channelId, channelData);
    }
    // Then immediately expand to fullscreen
    setTimeout(() => {
      setIsFullscreen(true);
      setShowMiniPlayer(false);
    }, 100);
  };

  const handleExitFullscreen = () => {
    setIsFullscreen(false);
    setShowMiniPlayer(true);
  };

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only redirect if Clerk is properly configured and user is not signed in
    if (mounted && isClerkConfigured && isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [mounted, isClerkConfigured, isLoaded, isSignedIn, router]);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If Clerk is not properly configured or user is signed in, allow access to live TV
  if (!isClerkConfigured || isSignedIn) {
    // Fullscreen video player mode
    if (isFullscreen && selectedChannel) {
      return (
        <div className="min-h-screen bg-black">
          <VideoPlayerWithInteractions
            channelId={selectedChannel}
            viewerCount={selectedChannelData?.currentViewers || 0}
            enabledFeatures={{
              chat: true,
              reactions: true,
              polls: true,
              quiz: false, // Usually not needed for live streams
              rating: false, // Usually not needed for live streams
              updates: true
            }}
            isLive={true}
            className="h-screen"
          >
            <div className="relative h-screen">
              <StreamPlayer 
                channelId={selectedChannel} 
                channelData={selectedChannelData}
                currentProgram={currentProgram}
                nextProgram={nextProgram}
              />
              
              {/* Fullscreen Controls */}
              <div className="absolute top-4 left-4 z-10">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleExitFullscreen}
                  className="bg-black/50 backdrop-blur text-white hover:bg-black/70"
                >
                  Exit Fullscreen
                </Button>
              </div>
            </div>
          </VideoPlayerWithInteractions>
        </div>
      );
    }

    // Main Live TV interface
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16">
          <div className="h-[calc(100vh-4rem)] flex flex-col">
            {/* Mini Video Player - Appears above EPG when channel selected */}
            {showMiniPlayer && selectedChannelData && (
              <div className="border-b bg-background p-4">
                <MiniVideoPlayer
                  channel={selectedChannelData}
                  currentProgram={currentProgram}
                  nextProgram={nextProgram}
                  onClose={handleCloseMiniPlayer}
                  onExpand={handleExpandToFullPlayer}
                  onDoubleClick={handleExpandToFullPlayer}
                />
              </div>
            )}
            
            {/* Electronic Program Guide - Full Width */}
            <div className={cn(
              "flex-1 bg-background",
              showMiniPlayer ? "h-[calc(100%-20rem)]" : "h-full"
            )}>
              <ElectronicProgramGuide 
                onChannelSelect={handleChannelSelect}
                onChannelDoubleClick={handleDoubleClick}
                selectedChannel={selectedChannel}
              />
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
}

export default function LivePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    }>
      <LivePageContent />
    </Suspense>
  );
}