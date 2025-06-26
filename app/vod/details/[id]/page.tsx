'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Play, ArrowLeft, Clock, Star, Eye, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VideoContent } from '@/lib/types';

export default function VODDetailsPage() {
  const params = useParams();
  const [content, setContent] = useState<VideoContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`;
    }
    if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`;
    }
    return views.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-purple mx-auto mb-4"></div>
          <p>Loading video details...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Content Not Found</h2>
          <p className="text-gray-400 mb-6">{error || 'The requested video could not be found.'}</p>
          <Link href="/library">
            <Button className="bg-brand-gradient hover:shadow-glow-brand">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Library
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={content.thumbnail_url || "/placeholder-video.svg"}
          alt={content.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        <div className="absolute bottom-0 left-0 p-8 lg:p-12 max-w-4xl">
          <div className="mb-4">
            <Link href="/library">
              <Button variant="outline" size="sm" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Library
              </Button>
            </Link>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {content.title}
          </h1>
          
          <div className="flex items-center gap-4 mb-6 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDuration(content.duration || 0)}
            </span>
            
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-current text-yellow-400" />
              4.5
            </span>
            
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {formatViews(content.view_count || 1000)} views
            </span>
            
            <Badge variant="secondary">{content.category || 'Education'}</Badge>
          </div>

          <div className="flex items-center gap-4">
            <Link href={`/vod/watch/${content.id}`}>
              <Button size="lg" className="bg-white text-black hover:bg-gray-200">
                <Play className="w-5 h-5 mr-2" fill="currentColor" />
                Play
              </Button>
            </Link>
            
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-black">
              <Share2 className="w-5 h-5 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </div>

      {/* Content Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h2 className="text-xl font-semibold mb-3">Description</h2>
                <p className="text-gray-300 leading-relaxed">
                  {content.description || 'No description available for this video.'}
                </p>
              </div>

              {/* Tags */}
              {content.tags && content.tags.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {content.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Objectives */}
              {content.learning_objectives && content.learning_objectives.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold mb-3">Learning Objectives</h2>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    {content.learning_objectives.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Video Info */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Video Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Language:</span>
                  <span>{content.language || 'English'}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Category:</span>
                  <span>{content.category || 'Education'}</span>
                </div>
                
                {content.genre && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Genre:</span>
                    <span>{content.genre}</span>
                  </div>
                )}
                
                {content.difficulty_level && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Difficulty:</span>
                    <span>{content.difficulty_level}</span>
                  </div>
                )}

                {content.instructor && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Instructor:</span>
                    <span>{content.instructor}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Prerequisites */}
            {content.prerequisites && content.prerequisites.length > 0 && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Prerequisites</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
                  {content.prerequisites.map((prereq, index) => (
                    <li key={index}>{prereq}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}