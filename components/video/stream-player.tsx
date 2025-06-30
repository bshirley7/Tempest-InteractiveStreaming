'use client';

import { HBOMaxPlayer } from './hbo-max-player';
import { CloudflareStreamPlayer } from './cloudflare-stream-player';
import { CampusPulsePlayer } from './CampusPulsePlayer';
import { isCloudflareStreamConfigured } from '@/lib/cloudflare';

interface StreamPlayerProps {
  channelId: string;
  channelData?: any;
  currentProgram?: any;
  nextProgram?: any;
}

export function StreamPlayer({ channelId, channelData, currentProgram, nextProgram }: StreamPlayerProps) {
  // Handle Campus Pulse channel specially
  if (channelId === 'campus-pulse' || channelData?.name === 'Campus Pulse' || channelData?.category === 'announcements') {
    return (
      <CampusPulsePlayer 
        className="w-full h-full"
        isFullscreen={true}
      />
    );
  }

  // Use HBO Max style player as the primary interface for other channels
  return (
    <HBOMaxPlayer
      videoId={channelId}
      title={currentProgram?.title || channelData?.name || "Live Stream"}
      subtitle={currentProgram?.description || `Channel ${channelData?.number || channelId}`}
      isLive={true}
      viewers={channelData?.currentViewers || 2847}
    />
  );
}