'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VideoPlayerWithCustomAds } from '@/components/video/VideoPlayerWithCustomAds';
import { VideoContent } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function VODWatchPage() {
  const params = useParams();
  const router = useRouter();
  const [content, setContent] = useState<VideoContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showControls, setShowControls] = useState(false);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/content/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Content not found');
          } else {
            setError('Failed to load content');
          }
          return;
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
          setContent(result.data);
        } else {
          setError('Failed to load content');
        }
      } catch (err) {
        setError('Failed to fetch content');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchContent();
    }
  }, [params.id]);

  const handleMouseMove = () => {
    setShowControls(true);
    
    // Clear existing timeout
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    
    // Set new timeout to hide controls after 3 seconds
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    
    setControlsTimeout(timeout);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading video...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-white">Unable to Load Video</h2>
          <p className="text-gray-400 mb-6">{error || 'The requested video could not be found.'}</p>
          <Button 
            onClick={() => router.push('/library')}
            className="bg-white text-black hover:bg-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Library
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black" onMouseMove={handleMouseMove}>
      {/* Back Button Overlay - Integrated with gradient */}
      <div 
        className={cn(
          "absolute top-6 left-6 transition-opacity duration-300 z-50",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <Button
          onClick={() => router.push(`/vod/details/${content.id}`)}
          variant="ghost"
          size="default"
          className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Video Player with Custom Ads Support */}
      <VideoPlayerWithCustomAds
        video={content}
        className="w-full h-full"
        autoPlay={false}
        onEnded={() => {
          // Optionally redirect or show related content
          console.log('Video completed');
        }}
      />
    </div>
  );
}