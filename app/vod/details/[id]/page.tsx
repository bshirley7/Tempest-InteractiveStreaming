'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Play, ArrowLeft, Clock, Star, Eye, Sparkles, BookOpen } from 'lucide-react';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
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
            <Button className="bg-brand-gradient hover:shadow-glow-brand transition-all duration-300">
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
              <Button 
                variant="outline" 
                size="sm" 
                className="mb-4 border-brand-purple/50 text-white bg-black/30 backdrop-blur-sm hover:bg-brand-gradient hover:border-transparent hover:shadow-glow-purple transition-all duration-300"
              >
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
              <Button size="lg" className="bg-brand-gradient hover:shadow-glow-brand transition-all duration-300 text-white font-semibold">
                <Play className="w-5 h-5 mr-2" fill="currentColor" />
                Play Now
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Content Details */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Video Information Badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                <Badge className="bg-brand-gradient text-white border-none px-4 py-2 text-sm font-medium">
                  <Sparkles className="w-4 h-4 mr-2" />
                  {content.language || 'English'}
                </Badge>
                
                <Badge className="bg-gradient-to-r from-brand-purple to-brand-indigo text-white border-none px-4 py-2 text-sm font-medium">
                  <BookOpen className="w-4 h-4 mr-2" />
                  {content.category || 'Education'}
                </Badge>
                
                {content.genre && (
                  <Badge className="bg-gradient-to-r from-brand-indigo to-brand-blue text-white border-none px-4 py-2 text-sm font-medium">
                    {content.genre}
                  </Badge>
                )}
              </div>

              {/* Description */}
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
                  Description
                </h2>
                <p className="text-gray-300 leading-relaxed">
                  {content.description || 'No description available for this video.'}
                </p>
              </div>

              {/* Tags */}
              {content.tags && content.tags.length > 0 && (
                <div className="bg-gradient-to-br from-gray-900/30 to-gray-800/20 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
                  <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
                    Tags
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {content.tags.map((tag, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="border-brand-purple/30 text-gray-300 hover:bg-brand-purple/10 hover:border-brand-purple/50 transition-all duration-300"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Objectives */}
              {content.learning_objectives && content.learning_objectives.length > 0 && (
                <div className="bg-gradient-to-br from-brand-purple/10 to-brand-indigo/10 backdrop-blur-sm rounded-xl p-6 border border-brand-purple/20">
                  <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
                    Learning Objectives
                  </h2>
                  <ul className="space-y-3">
                    {content.learning_objectives.map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <span className="inline-block w-6 h-6 rounded-full bg-brand-gradient text-white text-xs font-bold flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          {index + 1}
                        </span>
                        <span className="text-gray-300">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Prerequisites */}
            {content.prerequisites && content.prerequisites.length > 0 && (
              <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
                  Prerequisites
                </h3>
                <ul className="space-y-3">
                  {content.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-brand-purple mr-2 mt-1">▸</span>
                      <span className="text-sm text-gray-300">{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Video Stats Card */}
            <div className="bg-gradient-to-br from-brand-purple/20 to-brand-indigo/20 backdrop-blur-sm rounded-xl p-6 border border-brand-purple/30">
              <h3 className="text-lg font-semibold mb-4 text-white">Video Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-4 h-4 text-brand-purple" />
                    Duration
                  </span>
                  <span className="text-white font-medium">{formatDuration(content.duration || 0)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-300">
                    <Eye className="w-4 h-4 text-brand-indigo" />
                    Views
                  </span>
                  <span className="text-white font-medium">{formatViews(content.view_count || 1000)}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-gray-300">
                    <Star className="w-4 h-4 text-yellow-400" />
                    Rating
                  </span>
                  <span className="text-white font-medium">4.5/5.0</span>
                </div>
              </div>
            </div>

            {/* Related Content Suggestion */}
            <div className="bg-gradient-to-br from-gray-900/30 to-gray-800/20 backdrop-blur-sm rounded-xl p-6 border border-gray-700/30">
              <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
                Continue Learning
              </h3>
              <p className="text-sm text-gray-400 mb-4">
                Explore more content in {content.category || 'this category'}
              </p>
              <Link href="/library">
                <Button className="w-full bg-brand-gradient hover:shadow-glow-brand transition-all duration-300">
                  Browse Library
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}