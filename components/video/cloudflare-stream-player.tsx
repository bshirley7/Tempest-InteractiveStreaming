'use client';

import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings,
  Users,
  Heart,
  Share,
  MoreVertical,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStreamEmbedUrl, isCloudflareStreamConfigured } from '@/lib/cloudflare';

interface CloudflareStreamPlayerProps {
  videoId: string;
  channelName?: string;
  channelDescription?: string;
  isLive?: boolean;
  viewers?: number;
  className?: string;
}

export function CloudflareStreamPlayer({
  videoId,
  channelName = 'Live Stream',
  channelDescription = 'University streaming content',
  isLive = false,
  viewers = 0,
  className
}: CloudflareStreamPlayerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likes, setLikes] = useState(1247);
  const [isLiked, setIsLiked] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    // Check if Cloudflare Stream is configured
    if (!isCloudflareStreamConfigured()) {
      setError('Cloudflare Stream is not properly configured');
      setIsLoading(false);
      return;
    }

    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikes(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: channelName,
          text: channelDescription,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (error) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <div className="aspect-video bg-muted flex items-center justify-center">
          <div className="text-center">
            <div className="text-destructive mb-2">⚠️</div>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <div className="aspect-video bg-muted flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Loading stream...</p>
          </div>
        </div>
      </Card>
    );
  }

  const embedUrl = getStreamEmbedUrl(videoId);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="relative aspect-video bg-black">
        {/* Cloudflare Stream iframe */}
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
          allowFullScreen
          title={channelName}
        />

        {/* Live indicator */}
        {isLive && (
          <div className="absolute top-4 left-4 z-10">
            <Badge variant="destructive" className="animate-pulse">
              <div className="h-2 w-2 bg-white rounded-full mr-2"></div>
              LIVE
            </Badge>
          </div>
        )}

        {/* Viewer count */}
        {viewers > 0 && (
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-black/50 backdrop-blur rounded-full px-3 py-1 flex items-center space-x-2 text-white text-sm">
              <Users className="h-4 w-4" />
              <span>{viewers.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Custom controls overlay (optional) */}
        <div className="absolute bottom-4 right-4 z-10 flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            className={cn(
              "bg-black/50 backdrop-blur text-white hover:bg-black/70 transition-colors",
              isLiked && "text-red-500"
            )}
          >
            <Heart className={cn("h-4 w-4 mr-1", isLiked && "fill-current")} />
            {likes.toLocaleString()}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="bg-black/50 backdrop-blur text-white hover:bg-black/70"
          >
            <Share className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="bg-black/50 backdrop-blur text-white hover:bg-black/70"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stream info */}
      <div className="p-4 border-t">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-lg">{channelName}</h3>
            <p className="text-muted-foreground text-sm mb-2">
              {channelDescription}
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              {isLive ? (
                <span className="text-red-500 font-medium">● Live Now</span>
              ) : (
                <span>Recorded Content</span>
              )}
              <span>•</span>
              <span>University Content</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}