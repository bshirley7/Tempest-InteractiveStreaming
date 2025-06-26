'use client';

import React, { useState } from 'react';
import { 
  getVideoInteractionConfig, 
  getInteractionProfile, 
  VideoContentWithInteractions,
  INTERACTION_PROFILES 
} from '@/lib/video-interactions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// Sample video content with different configurations
const SAMPLE_VIDEOS: VideoContentWithInteractions[] = [
  {
    id: '1',
    title: 'Live Programming Lecture',
    cloudflare_video_id: 'sample-1',
    is_live: true,
    source_type: 'live',
    instructor: 'Dr. Smith',
    course_id: 'CS101',
    lesson_id: 'lesson-1',
    has_assessments: true,
    chat_moderation: 'moderated',
    category: 'Education',
    difficulty_level: 'Intermediate',
    learning_objectives: ['Understand React hooks', 'Build interactive components'],
    keywords: [],
    language: 'English',
    learning_objectives: ['Learn React'],
    prerequisites: ['JavaScript basics'],
    tags: ['programming', 'react'],
    is_featured: false,
    is_published: true,
    view_count: 0,
    like_count: 0,
    sync_status: 'synced',
    thumbnail_source: '',
    thumbnail_metadata: {},
    stream_metadata: {},
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Gaming Live Stream',
    cloudflare_video_id: 'sample-2',
    is_live: true,
    source_type: 'live',
    category: 'Entertainment',
    genre: 'Gaming',
    chat_moderation: 'open',
    reactions_enabled: true,
    keywords: [],
    language: 'English',
    learning_objectives: [],
    prerequisites: [],
    tags: ['gaming', 'entertainment'],
    is_featured: false,
    is_published: true,
    view_count: 0,
    like_count: 0,
    sync_status: 'synced',
    difficulty_level: 'Beginner',
    thumbnail_source: '',
    thumbnail_metadata: {},
    stream_metadata: {},
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Recorded Course Module',
    cloudflare_video_id: 'sample-3',
    is_live: false,
    source_type: 'vod',
    instructor: 'Prof. Johnson',
    course_id: 'MATH201',
    lesson_id: 'lesson-5',
    has_assessments: true,
    has_quiz: true,
    category: 'Education',
    difficulty_level: 'Advanced',
    learning_objectives: ['Master calculus concepts'],
    keywords: [],
    language: 'English',
    learning_objectives: ['Learn Calculus'],
    prerequisites: ['Algebra'],
    tags: ['math', 'calculus'],
    is_featured: false,
    is_published: true,
    view_count: 0,
    like_count: 0,
    sync_status: 'synced',
    thumbnail_source: '',
    thumbnail_metadata: {},
    stream_metadata: {},
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '4',
    title: 'Movie Night Recording',
    cloudflare_video_id: 'sample-4',
    is_live: false,
    source_type: 'vod',
    category: 'Entertainment',
    genre: 'Movies',
    reactions_enabled: true,
    keywords: [],
    language: 'English',
    learning_objectives: [],
    prerequisites: [],
    tags: ['movies', 'entertainment'],
    is_featured: false,
    is_published: true,
    view_count: 0,
    like_count: 0,
    sync_status: 'synced',
    difficulty_level: 'Beginner',
    thumbnail_source: '',
    thumbnail_metadata: {},
    stream_metadata: {},
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '5',
    title: 'Recorded Lecture from Live Stream',
    cloudflare_video_id: 'sample-5',
    is_live: false,
    source_type: 'live_recording',
    original_stream_id: 'original-stream-1',
    instructor: 'Dr. Wilson',
    course_id: 'PHY301',
    has_polls: true,
    has_quiz: true,
    has_updates: true,
    category: 'Education',
    difficulty_level: 'Advanced',
    keywords: [],
    language: 'English',
    learning_objectives: ['Understand quantum physics'],
    prerequisites: ['Classical mechanics'],
    tags: ['physics', 'quantum'],
    is_featured: false,
    is_published: true,
    view_count: 0,
    like_count: 0,
    sync_status: 'synced',
    thumbnail_source: '',
    thumbnail_metadata: {},
    stream_metadata: {},
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

const VIEWER_ROLES = ['viewer', 'student', 'instructor', 'admin'] as const;

export function InteractionDetectionDemo() {
  const [selectedVideo, setSelectedVideo] = useState<VideoContentWithInteractions>(SAMPLE_VIDEOS[0]);
  const [selectedRole, setSelectedRole] = useState<'viewer' | 'student' | 'instructor' | 'admin'>('viewer');

  const config = getVideoInteractionConfig(selectedVideo, selectedRole);
  const profile = getInteractionProfile(selectedVideo);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Video Interaction Detection Demo</h1>
        <p className="text-gray-600">
          This demo shows how interactions are automatically detected and configured based on video type and user role.
        </p>
      </div>

      {/* Video Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Video Content</CardTitle>
          <CardDescription>Choose a video to see its interaction configuration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {SAMPLE_VIDEOS.map((video) => (
              <Button
                key={video.id}
                variant={selectedVideo.id === video.id ? 'default' : 'outline'}
                onClick={() => setSelectedVideo(video)}
                className="h-auto p-3 text-left justify-start"
              >
                <div>
                  <div className="font-medium text-sm">{video.title}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {video.source_type} • {video.category}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Viewer Role</CardTitle>
          <CardDescription>User role affects available interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {VIEWER_ROLES.map((role) => (
              <Button
                key={role}
                variant={selectedRole === role ? 'default' : 'outline'}
                onClick={() => setSelectedRole(role)}
                className="capitalize"
              >
                {role}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Video Context */}
        <Card>
          <CardHeader>
            <CardTitle>Video Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">Type:</span>
              <Badge variant={config.context.videoType === 'live' ? 'destructive' : 'secondary'}>
                {config.context.videoType}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium">Profile:</span>
              <Badge variant="outline">{profile}</Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium">Educational:</span>
              <Badge variant={config.context.isEducational ? 'default' : 'secondary'}>
                {config.context.isEducational ? 'Yes' : 'No'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium">Has Instructor:</span>
              <Badge variant={config.context.hasInstructor ? 'default' : 'secondary'}>
                {config.context.hasInstructor ? 'Yes' : 'No'}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium">Moderated:</span>
              <Badge variant={config.context.isModerated ? 'destructive' : 'default'}>
                {config.context.isModerated ? 'Yes' : 'No'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Interaction Features */}
        <Card>
          <CardHeader>
            <CardTitle>Available Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(config.features).map(([feature, enabled]) => (
                <div
                  key={feature}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg border",
                    enabled ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"
                  )}
                >
                  <span className="font-medium capitalize">
                    {feature === 'chat' && config.context.videoType !== 'live' ? 'Comments' : feature}
                  </span>
                  <Badge variant={enabled ? 'default' : 'secondary'}>
                    {enabled ? 'Enabled' : 'Disabled'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capabilities Detail */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Capabilities</CardTitle>
          <CardDescription>
            How the system determines interaction availability
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Logic Applied:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {config.context.videoType === 'live' && (
                  <>
                    <li>• Live streams enable real-time chat and reactions</li>
                    <li>• Polls and quizzes available for instructors</li>
                    <li>• Updates available for admins and instructors</li>
                    <li>• Rating typically disabled during live streams</li>
                  </>
                )}
                {config.context.videoType === 'vod' && (
                  <>
                    <li>• VOD content uses comments instead of live chat</li>
                    <li>• Polls and quizzes available if pre-configured</li>
                    <li>• Rating enabled for content feedback</li>
                  </>
                )}
                {config.context.videoType === 'live_recording' && (
                  <>
                    <li>• Recordings preserve interactions from original stream</li>
                    <li>• Comments enabled for replay discussion</li>
                    <li>• Original polls and quizzes remain accessible</li>
                  </>
                )}
                {config.context.isEducational && (
                  <li>• Educational content enables quizzes and assessments</li>
                )}
                {selectedRole === 'instructor' || selectedRole === 'admin' ? (
                  <li>• Instructor/Admin role enables all interaction creation tools</li>
                ) : (
                  <li>• Viewer role has standard interaction permissions</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}