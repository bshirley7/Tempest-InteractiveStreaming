'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Calendar } from 'lucide-react';
import { VideoPlayerWithCustomAds } from '@/components/video/VideoPlayerWithCustomAds';
import { VideoContent } from '@/lib/types';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    id: string;
    title: string;
    description?: string;
    videoUrl?: string;
    cloudflare_video_id?: string;
    category?: string;
    createdAt?: string;
    duration?: string;
    generatedBy?: string;
    process?: string;
    content_type?: string;
  } | null;
}

export function VideoModal({ isOpen, onClose, video }: VideoModalProps) {
  // Debug logging
  React.useEffect(() => {
    if (video && isOpen) {
      console.log('VideoModal received video data:', video);
      console.log('Video cloudflare_video_id:', video.cloudflare_video_id);
      console.log('Video videoUrl:', video.videoUrl);
    }
  }, [video, isOpen]);

  // Extract Cloudflare video ID from videoUrl or use cloudflare_video_id
  const getCloudflareVideoId = () => {
    if (video?.cloudflare_video_id) {
      console.log('Using cloudflare_video_id:', video.cloudflare_video_id);
      return video.cloudflare_video_id;
    }
    
    // Extract from videoUrl if it contains a Cloudflare video ID
    if (video?.videoUrl) {
      // Handle URLs like /vod/details/video-id or direct video IDs
      const match = video.videoUrl.match(/([a-f0-9-]{36})/);
      if (match) {
        console.log('Extracted video ID from URL:', match[1]);
        return match[1];
      }
    }
    
    console.log('No video ID found');
    return null;
  };

  // Convert video modal data to VideoContent format
  const convertToVideoContent = (): VideoContent | null => {
    if (!video) {
      console.log('No video data provided to convertToVideoContent');
      return null;
    }
    
    const videoId = getCloudflareVideoId();
    if (!videoId) {
      console.log('No video ID found in convertToVideoContent');
      return null;
    }

    const videoContent = {
      id: video.id,
      title: video.title,
      description: video.description || '',
      cloudflare_video_id: videoId,
      content_type: video.content_type || 'advertisement',
      duration: 0,
      view_count: 0,
      thumbnail_url: '',
      created_at: video.createdAt || new Date().toISOString(),
      is_published: true,
      category: video.category || '',
      tags: [],
      metadata: {}
    };
    
    console.log('Converted video content:', videoContent);
    return videoContent;
  };

  const videoId = getCloudflareVideoId();
  const videoContent = convertToVideoContent();

  if (!video) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full bg-black border-zinc-800">
        <DialogHeader className="pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-white">{video.title}</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-zinc-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Video Player with Custom Ads (matches VOD watch pages) */}
          {videoContent ? (
            <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
              <VideoPlayerWithCustomAds
                video={videoContent}
                autoPlay={false}
                className="w-full h-full"
                onEnded={() => {
                  console.log('Video completed in modal');
                }}
              />
            </div>
          ) : (
            <div className="w-full aspect-video bg-gray-800 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-400">
                <p className="mb-2">Video not available</p>
                <p className="text-sm">Could not find Cloudflare video ID</p>
                {video.videoUrl && (
                  <p className="text-xs mt-2 font-mono">{video.videoUrl}</p>
                )}
              </div>
            </div>
          )}

          {/* Video Info */}
          <div className="space-y-3">
            {video.description && (
              <p className="text-gray-300">{video.description}</p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-400">
                {video.generatedBy && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-blue-400 font-medium">AI Generated</span>
                  </div>
                )}
                {video.createdAt && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(video.createdAt).toLocaleDateString()}
                  </div>
                )}
                {video.duration && (
                  <span>{video.duration}</span>
                )}
              </div>
              
              {video.category && (
                <Badge variant="outline" className="border-yellow-400 text-yellow-400">
                  {video.category}
                </Badge>
              )}
            </div>

            {video.process && (
              <p className="text-xs text-gray-500 italic">{video.process}</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}