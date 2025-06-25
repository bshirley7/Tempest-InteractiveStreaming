'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  X, 
  Play, 
  File, 
  CheckCircle, 
  AlertCircle, 
  Clock,
  Folder,
  FileVideo,
  FileText,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface VideoFile {
  file: File;
  id: string;
  metadata?: VideoMetadata;
  uploadProgress: number;
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'error';
  errorMessage?: string;
  previewUrl?: string;
}

interface VideoMetadata {
  title: string;
  author: string;
  description: string;
  duration: number;
  tags: string[];
  upload_date: string;
  thumbnail?: string;
}

interface UploadFormData {
  channel_id: string;
  category: string;
  is_published: boolean;
  instructor: string;
  difficulty_level: string;
  language: string;
}

interface Channel {
  id: string;
  name: string;
  category: string;
}

export default function BulkUploadPage() {
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [metadataFiles, setMetadataFiles] = useState<{ [key: string]: VideoMetadata }>({});
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [formData, setFormData] = useState<UploadFormData>({
    channel_id: '',
    category: 'Travel',
    is_published: false,
    instructor: '',
    difficulty_level: 'Beginner',
    language: 'English'
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const categories = [
    'Travel', 'Education', 'News', 'Sports', 'Entertainment', 'Science', 
    'Technology', 'Arts', 'Music', 'Discussion', 'Events', 'Documentary'
  ];

  // Fetch channels from database
  useEffect(() => {
    async function fetchChannels() {
      try {
        setLoadingChannels(true);
        const response = await fetch('/api/channels');
        if (response.ok) {
          const data = await response.json();
          setChannels(data.channels || []);
        } else {
          console.error('Failed to fetch channels');
          // Fallback to empty array
          setChannels([]);
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
        setChannels([]);
      } finally {
        setLoadingChannels(false);
      }
    }

    fetchChannels();
  }, []);

  // Parse metadata from JSON files
  const parseMetadata = useCallback((file: File): Promise<VideoMetadata | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const metadata = JSON.parse(text);
          resolve(metadata);
        } catch (error) {
          console.error('Error parsing metadata:', error);
          resolve(null);
        }
      };
      reader.readAsText(file);
    });
  }, []);

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const videoFiles: File[] = [];
    const metadataFiles: File[] = [];

    // Separate video and metadata files
    acceptedFiles.forEach(file => {
      if (file.type.startsWith('video/')) {
        videoFiles.push(file);
      } else if (file.name.endsWith('_metadata.json')) {
        metadataFiles.push(file);
      }
    });

    // Parse metadata files
    const metadataMap: { [key: string]: VideoMetadata } = {};
    for (const metaFile of metadataFiles) {
      const baseName = metaFile.name.replace('_metadata.json', '');
      const metadata = await parseMetadata(metaFile);
      if (metadata) {
        metadataMap[baseName] = metadata;
      }
    }

    setMetadataFiles(prev => ({ ...prev, ...metadataMap }));

    // Create video file objects
    const newVideos: VideoFile[] = videoFiles.map(file => {
      const baseName = file.name.replace(/\.[^/.]+$/, ''); // Remove extension
      const id = Math.random().toString(36).substr(2, 9);
      
      return {
        file,
        id,
        metadata: metadataMap[baseName],
        uploadProgress: 0,
        uploadStatus: 'pending',
        previewUrl: URL.createObjectURL(file)
      };
    });

    setVideos(prev => [...prev, ...newVideos]);
    toast.success(`Added ${videoFiles.length} videos and ${metadataFiles.length} metadata files`);
  }, [parseMetadata]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
      'application/json': ['.json']
    },
    multiple: true
  });

  // Remove video from list
  const removeVideo = (id: string) => {
    setVideos(prev => {
      const video = prev.find(v => v.id === id);
      if (video?.previewUrl) {
        URL.revokeObjectURL(video.previewUrl);
      }
      return prev.filter(v => v.id !== id);
    });
  };

  // Update video metadata
  const updateVideoMetadata = (id: string, field: keyof VideoMetadata, value: string) => {
    setVideos(prev => prev.map(video => {
      if (video.id === id) {
        return {
          ...video,
          metadata: {
            ...video.metadata,
            [field]: value
          } as VideoMetadata
        };
      }
      return video;
    }));
  };

  // Upload single video
  const uploadVideo = async (video: VideoFile): Promise<boolean> => {
    try {
      // Update status
      setVideos(prev => prev.map(v => 
        v.id === video.id ? { ...v, uploadStatus: 'uploading', uploadProgress: 0 } : v
      ));

      // Get upload URL
      const uploadUrlResponse = await fetch('/api/stream/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: video.metadata?.title || video.file.name,
          requireSignedURLs: false,
          allowedOrigins: ['*']
        })
      });

      if (!uploadUrlResponse.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { uploadURL, uid } = await uploadUrlResponse.json();

      // Upload file with progress tracking
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            setVideos(prev => prev.map(v => 
              v.id === video.id ? { ...v, uploadProgress: progress } : v
            ));
          }
        });

        xhr.addEventListener('load', async () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            // Wait for processing
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Update metadata
            if (video.metadata) {
              try {
                await fetch(`/api/stream/video/${uid}`, {
                  method: 'PATCH',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: video.metadata.title,
                    description: video.metadata.description,
                    category: formData.category,
                    keywords: video.metadata.tags?.join(', '),
                    instructor: formData.instructor,
                    difficulty_level: formData.difficulty_level,
                    language: formData.language
                  })
                });
              } catch (metaError) {
                console.warn('Failed to update metadata:', metaError);
              }
            }

            setVideos(prev => prev.map(v => 
              v.id === video.id ? { 
                ...v, 
                uploadStatus: 'completed', 
                uploadProgress: 100 
              } : v
            ));
            resolve(true);
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', uploadURL);
        xhr.send(video.file);
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setVideos(prev => prev.map(v => 
        v.id === video.id ? { 
          ...v, 
          uploadStatus: 'error', 
          errorMessage 
        } : v
      ));
      return false;
    }
  };

  // Start bulk upload
  const startBulkUpload = async () => {
    if (videos.length === 0) {
      toast.error('Please add videos to upload');
      return;
    }

    if (!formData.channel_id) {
      toast.error('Please select a channel');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    let completed = 0;
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      if (video.uploadStatus === 'pending') {
        await uploadVideo(video);
      }
      completed++;
      setUploadProgress((completed / videos.length) * 100);
    }

    // Sync to content library (optional)
    try {
      const syncResponse = await fetch('/api/content-library/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true, source: 'bulk-upload' })
      });
      
      if (syncResponse.ok) {
        toast.success('Videos synced to content library');
      } else if (syncResponse.status === 403) {
        console.log('Content library sync skipped - insufficient permissions');
        toast.success('Upload completed (sync skipped)');
      } else {
        throw new Error(`Sync failed: ${syncResponse.status}`);
      }
    } catch (error) {
      console.warn('Content library sync failed:', error);
      toast.success('Upload completed (sync skipped)');
    }

    setIsUploading(false);
    toast.success('Bulk upload completed!');
  };

  const completedVideos = videos.filter(v => v.uploadStatus === 'completed').length;
  const errorVideos = videos.filter(v => v.uploadStatus === 'error').length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bulk Video Upload</h1>
          <p className="text-muted-foreground">
            Upload multiple videos with metadata auto-fill
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {videos.length} videos ready
        </Badge>
      </div>

      {/* Upload Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="channel">Target Channel</Label>
            <Select 
              value={formData.channel_id} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, channel_id: value }))}
              disabled={loadingChannels}
            >
              <SelectTrigger>
                <SelectValue placeholder={loadingChannels ? "Loading channels..." : "Select channel"} />
              </SelectTrigger>
              <SelectContent>
                {loadingChannels ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading channels...
                    </div>
                  </SelectItem>
                ) : channels.length === 0 ? (
                  <SelectItem value="no-channels" disabled>
                    No channels found. Create channels first.
                  </SelectItem>
                ) : (
                  channels.map(channel => (
                    <SelectItem key={channel.id} value={channel.id}>
                      {channel.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, category: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="instructor">Instructor (Optional)</Label>
            <Input
              id="instructor"
              value={formData.instructor}
              onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
              placeholder="Enter instructor name"
            />
          </div>

          <div>
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select value={formData.difficulty_level} onValueChange={(value) => 
              setFormData(prev => ({ ...prev, difficulty_level: value }))
            }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Drop Zone */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg font-medium">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-lg font-medium mb-2">
                  Drag & drop videos and metadata files here
                </p>
                <p className="text-muted-foreground mb-4">
                  Supports MP4, MOV, AVI, MKV, WebM + JSON metadata files
                </p>
                <Button variant="outline">
                  <Folder className="h-4 w-4 mr-2" />
                  Browse Files
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Video List */}
      {videos.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileVideo className="h-5 w-5" />
              Videos to Upload ({videos.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              {completedVideos > 0 && (
                <Badge variant="default" className="bg-green-500">
                  {completedVideos} completed
                </Badge>
              )}
              {errorVideos > 0 && (
                <Badge variant="destructive">
                  {errorVideos} errors
                </Badge>
              )}
              <Button 
                onClick={startBulkUpload} 
                disabled={isUploading || videos.length === 0}
                size="sm"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Start Upload
                  </>
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isUploading && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>Overall Progress</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}
            
            <ScrollArea className="h-[400px] w-full">
              <div className="space-y-4">
                {videos.map((video, index) => (
                  <div key={video.id} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      {/* Status Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {video.uploadStatus === 'completed' && (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        {video.uploadStatus === 'error' && (
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        )}
                        {video.uploadStatus === 'uploading' && (
                          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
                        )}
                        {video.uploadStatus === 'pending' && (
                          <Clock className="h-5 w-5 text-gray-500" />
                        )}
                      </div>

                      {/* Video Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium truncate">
                            {video.metadata?.title || video.file.name}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVideo(video.id)}
                            disabled={video.uploadStatus === 'uploading'}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">
                              Size: {(video.file.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                            {video.metadata?.duration && (
                              <p className="text-muted-foreground">
                                Duration: {Math.floor(video.metadata.duration / 60)}:
                                {(video.metadata.duration % 60).toString().padStart(2, '0')}
                              </p>
                            )}
                            {video.metadata?.author && (
                              <p className="text-muted-foreground">
                                Author: {video.metadata.author}
                              </p>
                            )}
                          </div>
                          
                          {video.metadata && (
                            <div>
                              <div className="flex items-center gap-1 mb-1">
                                <FileText className="h-3 w-3" />
                                <span className="text-xs text-green-600">Metadata found</span>
                              </div>
                              {video.metadata.tags && (
                                <p className="text-xs text-muted-foreground">
                                  Tags: {video.metadata.tags.slice(0, 3).join(', ')}
                                  {video.metadata.tags.length > 3 && '...'}
                                </p>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Progress Bar for Uploading */}
                        {video.uploadStatus === 'uploading' && (
                          <div className="mt-2">
                            <Progress value={video.uploadProgress} className="h-1" />
                          </div>
                        )}

                        {/* Error Message */}
                        {video.uploadStatus === 'error' && video.errorMessage && (
                          <div className="mt-2 text-sm text-red-600">
                            Error: {video.errorMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
}