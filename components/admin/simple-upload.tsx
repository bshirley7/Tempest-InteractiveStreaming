'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Upload, 
  FileVideo, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  PlayCircle,
  FileText,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

interface VideoMetadata {
  title: string;
  author: string;
  description: string;
  duration: number;
  tags: string[];
  upload_date: string;
  thumbnail?: string;
}

interface UploadState {
  file: File | null;
  metadataFile: File | null;
  uploading: boolean;
  uploadProgress: number;
  cloudflareVideoId: string | null;
  supabaseContentId: string | null;
  error: string | null;
  completed: boolean;
}

interface Channel {
  id: string;
  name: string;
  category: string;
}

export function SimpleUpload() {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    metadataFile: null,
    uploading: false,
    uploadProgress: 0,
    cloudflareVideoId: null,
    supabaseContentId: null,
    error: null,
    completed: false
  });

  const [configCheck, setConfigCheck] = useState({
    cloudflare: false,
    supabase: false,
    loading: true
  });

  const [metadata, setMetadata] = useState({
    title: '',
    description: '',
    channel_id: '__no_channel__',
    category: 'Education',
    instructor: '',
    difficulty_level: 'Beginner',
    language: 'English',
    is_published: false
  });

  const [channels, setChannels] = useState<Channel[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Check configuration and fetch channels
  useEffect(() => {
    async function checkConfig() {
      try {
        // Check Cloudflare Stream configuration
        const cloudflareResponse = await fetch('/api/stream?limit=1');
        const cloudflareConfigured = cloudflareResponse.ok;

        // Check Supabase configuration  
        const supabaseResponse = await fetch('/api/content?limit=1');
        const supabaseConfigured = supabaseResponse.ok;

        setConfigCheck({
          cloudflare: cloudflareConfigured,
          supabase: supabaseConfigured,
          loading: false
        });

        // Fetch channels
        try {
          const channelsResponse = await fetch('/api/channels');
          if (channelsResponse.ok) {
            const data = await channelsResponse.json();
            setChannels(data.channels || []);
          }
        } catch (error) {
          console.error('Error fetching channels:', error);
        }
        
        // Fetch categories from database
        try {
          if (supabase) {
            const { data, error } = await supabase
              .from('categories')
              .select('name')
              .order('is_default', { ascending: false })
              .order('name');
              
            if (!error && data) {
              setCategories(data.map(c => c.name));
            }
          }
        } catch (error) {
          console.error('Error fetching categories:', error);
        } finally {
          setLoadingCategories(false);
        }
      } catch (error) {
        console.error('Error checking configuration:', error);
        setConfigCheck({
          cloudflare: false,
          supabase: false,
          loading: false
        });
      } finally {
        setLoadingChannels(false);
      }
    }
    checkConfig();
  }, []);

  // Parse metadata from JSON file
  const parseMetadata = useCallback((file: File): Promise<VideoMetadata | null> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const parsedMetadata = JSON.parse(text);
          resolve(parsedMetadata);
        } catch (error) {
          console.error('Error parsing metadata:', error);
          resolve(null);
        }
      };
      reader.readAsText(file);
    });
  }, []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const videoFiles = acceptedFiles.filter(file => file.type.startsWith('video/'));
    const jsonFiles = acceptedFiles.filter(file => 
      file.type === 'application/json' || file.name.endsWith('.json')
    );

    if (videoFiles.length > 0) {
      const videoFile = videoFiles[0];
      setUploadState(prev => ({ ...prev, file: videoFile, error: null }));
      
      // Auto-fill title from filename
      const title = videoFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setMetadata(prev => ({ ...prev, title }));
      toast.success('Video file selected');
    }

    if (jsonFiles.length > 0) {
      const jsonFile = jsonFiles[0];
      setUploadState(prev => ({ ...prev, metadataFile: jsonFile }));
      
      // Parse and apply metadata
      try {
        const parsedMetadata = await parseMetadata(jsonFile);
        if (parsedMetadata) {
          setMetadata(prev => ({
            ...prev,
            title: parsedMetadata.title || prev.title,
            description: parsedMetadata.description || prev.description,
            instructor: parsedMetadata.author || prev.instructor,
            // Map any other relevant fields
          }));
          toast.success('Metadata file loaded and applied');
        } else {
          toast.error('Failed to parse metadata file');
        }
      } catch (error) {
        console.error('Error processing metadata file:', error);
        toast.error('Error processing metadata file');
      }
    }

    if (videoFiles.length === 0 && jsonFiles.length === 0) {
      toast.error('Please select a video file or JSON metadata file');
    }
  }, [parseMetadata]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
      'application/json': ['.json']
    },
    multiple: false
  });

  const resetUpload = () => {
    setUploadState({
      file: null,
      metadataFile: null,
      uploading: false,
      uploadProgress: 0,
      cloudflareVideoId: null,
      supabaseContentId: null,
      error: null,
      completed: false
    });
    setMetadata(prev => ({ ...prev, title: '', description: '' }));
  };

  const uploadVideo = async () => {
    if (!uploadState.file) {
      toast.error('Please select a video file');
      return;
    }

    if (!metadata.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    setUploadState(prev => ({ 
      ...prev, 
      uploading: true, 
      uploadProgress: 0, 
      error: null,
      completed: false 
    }));

    try {
      console.log('Step 1: Getting upload URL from Cloudflare Stream...');
      
      // Step 1: Get upload URL
      const uploadUrlResponse = await fetch('/api/stream/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: metadata.title,
          requireSignedURLs: false,
          allowedOrigins: ['*']
        })
      });

      if (!uploadUrlResponse.ok) {
        const errorData = await uploadUrlResponse.json();
        console.error('Upload URL error response:', errorData);
        throw new Error(`Failed to get upload URL: ${errorData.error || uploadUrlResponse.statusText}`);
      }

      const { uploadURL, uid } = await uploadUrlResponse.json();
      console.log('Upload URL received, video UID:', uid);

      setUploadState(prev => ({ ...prev, cloudflareVideoId: uid }));

      // Step 2: Upload file to Cloudflare Stream
      console.log('Step 2: Uploading file to Cloudflare Stream...');
      
      const xhr = new XMLHttpRequest();
      
      await new Promise<void>((resolve, reject) => {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 80; // Reserve 20% for Supabase sync
            setUploadState(prev => ({ ...prev, uploadProgress: progress }));
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            console.log('File uploaded successfully to Cloudflare Stream');
            resolve();
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', uploadURL);
        xhr.send(uploadState.file);
      });

      // Step 3: Wait for processing
      console.log('Step 3: Waiting for Cloudflare Stream processing...');
      setUploadState(prev => ({ ...prev, uploadProgress: 85 }));
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 4: Update metadata in Cloudflare Stream
      console.log('Step 4: Updating metadata in Cloudflare Stream...');
      try {
        await fetch(`/api/stream/video/${uid}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: metadata.title,
            description: metadata.description,
            category: metadata.category,
            instructor: metadata.instructor,
            difficulty_level: metadata.difficulty_level,
            language: metadata.language
          })
        });
        console.log('Cloudflare Stream metadata updated');
      } catch (metaError) {
        console.warn('Failed to update Cloudflare Stream metadata:', metaError);
      }

      // Step 5: Create content record in Supabase
      console.log('Step 5: Creating content record in Supabase...');
      setUploadState(prev => ({ ...prev, uploadProgress: 90 }));

      // Prepare content data, incorporating JSON metadata if available
      let videoMetadata: any = {
        upload_date: new Date().toISOString(),
        original_filename: uploadState.file.name,
        file_size: uploadState.file.size
      };

      // If we have a metadata file, parse and include additional data
      if (uploadState.metadataFile) {
        try {
          const parsedMetadata = await parseMetadata(uploadState.metadataFile);
          if (parsedMetadata) {
            videoMetadata = {
              ...videoMetadata,
              author: parsedMetadata.author,
              upload_date_original: parsedMetadata.upload_date,
              tags: parsedMetadata.tags,
              duration_from_metadata: parsedMetadata.duration,
              thumbnail_from_metadata: parsedMetadata.thumbnail
            };
          }
        } catch (error) {
          console.warn('Could not parse metadata file for content creation:', error);
        }
      }

      const contentData = {
        title: metadata.title,
        description: metadata.description,
        channel_id: metadata.channel_id === '__no_channel__' ? null : metadata.channel_id, // Allow null for no channel
        cloudflare_video_id: uid,
        category: metadata.category,
        keywords: videoMetadata.tags || [],
        language: metadata.language,
        instructor: metadata.instructor,
        difficulty_level: metadata.difficulty_level,
        duration: videoMetadata.duration_from_metadata || 0,
        is_published: true, // Auto-publish uploaded videos
        metadata: videoMetadata
      };

      const contentResponse = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentData)
      });

      if (!contentResponse.ok) {
        const errorData = await contentResponse.json();
        throw new Error(`Supabase sync failed: ${errorData.error}`);
      }

      const contentResult = await contentResponse.json();
      console.log('Content record created in Supabase:', contentResult.data.id);

      setUploadState(prev => ({ 
        ...prev, 
        uploadProgress: 95,
        supabaseContentId: contentResult.data.id
      }));

      // Step 6: Verify sync between Cloudflare and Supabase
      console.log('Step 6: Verifying sync status...');
      try {
        const syncResponse = await fetch('/api/stream/sync-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId: uid })
        });

        if (syncResponse.ok) {
          const syncStatus = await syncResponse.json();
          console.log('Sync verification result:', syncStatus);
          
          if (syncStatus.syncStatus === 'synced') {
            toast.success('✅ Video uploaded and sync verified! Cloudflare Stream and Supabase are perfectly synced.');
          } else {
            toast.warning(`⚠️ Video uploaded but sync issues detected: ${syncStatus.issues.join(', ')}`);
          }
        } else {
          console.warn('Could not verify sync status');
          toast.success('Video uploaded successfully! (Sync verification unavailable)');
        }
      } catch (syncError) {
        console.warn('Sync verification failed:', syncError);
        toast.success('Video uploaded successfully! (Could not verify sync)');
      }

      setUploadState(prev => ({ 
        ...prev, 
        uploadProgress: 100,
        completed: true,
        uploading: false
      }));

    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadState(prev => ({ 
        ...prev, 
        error: errorMessage,
        uploading: false 
      }));
      toast.error(`Upload failed: ${errorMessage}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Configuration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Status</CardTitle>
        </CardHeader>
        <CardContent>
          {configCheck.loading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Checking configuration...</span>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                {configCheck.cloudflare ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span>Cloudflare Stream: {configCheck.cloudflare ? 'Configured' : 'Not Configured'}</span>
              </div>
              <div className="flex items-center gap-2">
                {configCheck.supabase ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span>Supabase: {configCheck.supabase ? 'Configured' : 'Not Configured'}</span>
              </div>
            </div>
          )}
          {!configCheck.loading && (!configCheck.cloudflare || !configCheck.supabase) && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Configuration Required:</strong> 
                {!configCheck.cloudflare && ' Set Cloudflare Stream environment variables.'}
                {!configCheck.supabase && ' Set Supabase environment variables.'}
                {' '}Check your .env.local file and restart the server.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Status */}
      {uploadState.completed && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold text-green-800">Upload Completed Successfully!</h3>
                <div className="text-sm text-green-700 space-y-1">
                  <p>✅ Cloudflare Stream Video ID: <code>{uploadState.cloudflareVideoId}</code></p>
                  <p>✅ Supabase Content ID: <code>{uploadState.supabaseContentId}</code></p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {uploadState.error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <h3 className="font-semibold text-red-800">Upload Failed</h3>
                <p className="text-sm text-red-700">{uploadState.error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Selection */}
      <Card>
        <CardHeader>
          <CardTitle>1. Select Files</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {(!uploadState.file && !uploadState.metadataFile) ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-primary/50'
              }`}
            >
              <input {...getInputProps()} />
              <div className="flex items-center justify-center gap-4 mb-4">
                <FileVideo className="h-12 w-12 text-muted-foreground" />
                <span className="text-2xl text-muted-foreground">+</span>
                <FileText className="h-12 w-12 text-muted-foreground" />
              </div>
              {isDragActive ? (
                <p className="text-lg font-medium">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-lg font-medium mb-2">
                    Drag & drop video and metadata files here
                  </p>
                  <p className="text-muted-foreground mb-4">
                    Video: MP4, MOV, AVI, MKV, WebM<br />
                    Metadata: JSON files (optional)
                  </p>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Browse Files
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {/* Video File */}
              {uploadState.file && (
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileVideo className="h-8 w-8 text-primary" />
                    <div>
                      <p className="font-medium">{uploadState.file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Size: {(uploadState.file.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setUploadState(prev => ({ ...prev, file: null }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Metadata File */}
              {uploadState.metadataFile && (
                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="font-medium">{uploadState.metadataFile.name}</p>
                      <p className="text-sm text-green-600">
                        ✓ Metadata loaded and applied
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setUploadState(prev => ({ ...prev, metadataFile: null }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Add more files option */}
              <div className="flex gap-2">
                {!uploadState.file && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = 'video/*';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          onDrop([file]);
                        }
                      };
                      input.click();
                    }}
                  >
                    <FileVideo className="h-4 w-4 mr-2" />
                    Add Video
                  </Button>
                )}
                {!uploadState.metadataFile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.accept = '.json,application/json';
                      input.onchange = (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0];
                        if (file) {
                          onDrop([file]);
                        }
                      };
                      input.click();
                    }}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Add Metadata JSON
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={resetUpload}>
                  Reset All
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metadata Form */}
      <Card>
        <CardHeader>
          <CardTitle>2. Video Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={metadata.title}
                onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter video title"
              />
            </div>

            <div>
              <Label htmlFor="channel">Channel (Optional)</Label>
              <Select 
                value={metadata.channel_id} 
                onValueChange={(value) => setMetadata(prev => ({ ...prev, channel_id: value }))}
                disabled={loadingChannels}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingChannels ? "Loading..." : "Select channel (optional)"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__no_channel__">No channel</SelectItem>
                  {channels.map(channel => (
                    <SelectItem key={channel.id} value={channel.id}>
                      {channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="category">Category</Label>
              <Select 
                value={metadata.category} 
                onValueChange={(value) => setMetadata(prev => ({ ...prev, category: value }))}
                disabled={loadingCategories}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingCategories ? "Loading..." : "Select category"} />
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
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                value={metadata.instructor}
                onChange={(e) => setMetadata(prev => ({ ...prev, instructor: e.target.value }))}
                placeholder="Enter instructor name"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={metadata.description}
              onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter video description"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="published"
              checked={metadata.is_published}
              onCheckedChange={(checked) => setMetadata(prev => ({ ...prev, is_published: checked }))}
            />
            <Label htmlFor="published">Publish immediately</Label>
          </div>
        </CardContent>
      </Card>

      {/* Upload Progress */}
      {uploadState.uploading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin" />
                <div>
                  <p className="font-medium">Uploading video...</p>
                  <p className="text-sm text-muted-foreground">
                    This may take a few minutes depending on file size
                  </p>
                </div>
              </div>
              <Progress value={uploadState.uploadProgress} className="h-3" />
              <p className="text-sm text-center text-muted-foreground">
                {Math.round(uploadState.uploadProgress)}% complete
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Button */}
      <div className="flex gap-4">
        <Button 
          onClick={uploadVideo}
          disabled={!uploadState.file || uploadState.uploading || !metadata.title}
          size="lg"
          className="flex-1"
        >
          {uploadState.uploading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-5 w-5 mr-2" />
              Upload Video
            </>
          )}
        </Button>

        {uploadState.completed && (
          <Button variant="outline" onClick={resetUpload}>
            Upload Another
          </Button>
        )}
      </div>

      {/* Metadata Info */}
      {uploadState.metadataFile && (
        <Card>
          <CardHeader>
            <CardTitle>Loaded Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p className="text-muted-foreground">
                The following information was loaded from <strong>{uploadState.metadataFile.name}</strong>:
              </p>
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <strong>Title:</strong> {metadata.title || 'N/A'}
                </div>
                <div>
                  <strong>Instructor:</strong> {metadata.instructor || 'N/A'}
                </div>
                <div className="col-span-2">
                  <strong>Description:</strong> {metadata.description || 'N/A'}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                You can edit these values in the form above before uploading.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Debug Info */}
      {uploadState.cloudflareVideoId && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <strong>Cloudflare Stream Video ID:</strong> {uploadState.cloudflareVideoId}
            </div>
            {uploadState.supabaseContentId && (
              <div>
                <strong>Supabase Content ID:</strong> {uploadState.supabaseContentId}
              </div>
            )}
            <div>
              <strong>Sync Status:</strong> {uploadState.completed ? '✅ Complete' : '⏳ In Progress'}
            </div>
            {uploadState.metadataFile && (
              <div>
                <strong>Metadata File:</strong> ✅ {uploadState.metadataFile.name}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}