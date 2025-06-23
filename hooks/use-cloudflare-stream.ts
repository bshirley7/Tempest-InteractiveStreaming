/**
 * Custom hook for Cloudflare Stream operations
 */
import { useState, useEffect } from 'react';
import { reportError } from '@/lib/error-reporting';

interface StreamVideo {
  uid: string;
  thumbnail: string;
  readyToStream: boolean;
  status: {
    state: string;
    pctComplete: string;
  };
  meta: {
    name: string;
    [key: string]: any;
  };
  duration: number;
  playback: {
    hls: string;
    dash: string;
  };
}

interface UseStreamOptions {
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export function useStreamVideos(options: UseStreamOptions = {}) {
  const [videos, setVideos] = useState<StreamVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); 
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching videos from Cloudflare Stream API...');
      const response = await fetch('/api/stream');
      console.log('Stream API response status:', response.status);
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch (e) {
          console.error('Could not read error response:', e);
        }
        throw new Error(`HTTP error! status: ${response.status}${errorText ? ` - ${errorText}` : ''}`);
      }
      
      const data = await response.json();
      console.log('Stream API response data:', {
        success: data.success,
        videosCount: data.videos?.length || 0
      });
      
      if (data.success) {
        setVideos(data.videos);
        console.log('Successfully fetched videos:', data.videos?.length || 0);
        setError(null);
        setLastFetchTime(Date.now());
      } else {
        throw new Error(data.error || 'Failed to fetch videos');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Detailed fetch error:', {
        error: err,
        message: errorMessage,
        stack: err instanceof Error ? err.stack : 'No stack'
      });
      setError(errorMessage);
      console.error('Error fetching Stream videos:', errorMessage);
      reportError(err instanceof Error ? err : new Error(errorMessage), {
        tags: { component: 'useStreamVideos' },
        extra: { options },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
    console.log('useStreamVideos hook initialized with options:', options);

    if (options.autoRefresh) {
      const interval = setInterval(fetchVideos, options.refreshInterval || 30000);
      return () => clearInterval(interval);
    }
  }, [options.autoRefresh, options.refreshInterval]);

  return {
    videos,
    loading,
    error,
    lastFetchTime,
    refetch: fetchVideos,
  };
}

export function useStreamVideo(videoId: string) {
  const [video, setVideo] = useState<StreamVideo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!videoId) return;

    const fetchVideo = async () => {
      try {
        setLoading(true);
        console.log('Fetching specific video:', videoId);
        const response = await fetch(`/api/stream?videoId=${videoId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
          setVideo(data.video);
          console.log('Successfully fetched video:', data.video?.uid);
          setError(null);
        } else {
          throw new Error(data.error || 'Failed to fetch video');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('Error fetching specific video:', errorMessage);
        reportError(err instanceof Error ? err : new Error(errorMessage), {
          tags: { component: 'useStreamVideo' },
          extra: { videoId },
        });
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [videoId]);

  return {
    video,
    loading,
    error,
  };
}

export function useStreamUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const getUploadUrl = async (metadata?: {
    name?: string;
    requireSignedURLs?: boolean;
    allowedOrigins?: string[];
  }) => {
    try {
      console.log('Getting upload URL with metadata:', metadata);
      const response = await fetch('/api/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getUploadUrl',
          ...metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('Upload URL obtained:', data.uploadURL);
        return {
          uploadURL: data.uploadURL,
          uid: data.uid,
        };
      } else {
        throw new Error(data.error || 'Failed to get upload URL');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Error getting upload URL:', errorMessage);
      reportError(err instanceof Error ? err : new Error(errorMessage), {
        tags: { component: 'useStreamUpload' },
        extra: { metadata },
      });
      throw err;
    }
  };

  const uploadFile = async (file: File, metadata?: {
    name?: string;
    requireSignedURLs?: boolean;
    allowedOrigins?: string[];
  }) => {
    try {
      setUploading(true);
      setProgress(0);
      setError(null);
      console.log('Starting file upload:', file.name, file.size);

      // Get upload URL
      const { uploadURL, uid } = await getUploadUrl({
        name: metadata?.name || file.name,
        ...metadata,
      });

      console.log('Uploading to URL:', uploadURL);
      // Upload file
      const formData = new FormData();
      formData.append('file', file);

      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percentComplete = (event.loaded / event.total) * 100;
            console.log('Upload progress:', percentComplete + '%');
            setProgress(percentComplete);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status === 200) {
            setUploading(false);
            console.log('Upload completed successfully:', uid);
            resolve({ uid, success: true });
          } else {
            reject(new Error(`Upload failed with status: ${xhr.status}`));
          }
        });

        xhr.addEventListener('error', () => {
          console.error('Upload failed with network error');
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', uploadURL);
        xhr.send(formData);
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setUploading(false);
      console.error('Upload error:', errorMessage);
      reportError(err instanceof Error ? err : new Error(errorMessage), {
        tags: { component: 'useStreamUpload' },
        extra: { fileName: file.name, fileSize: file.size },
      });
      throw err;
    }
  };

  return {
    uploading,
    progress,
    error,
    uploadFile,
    getUploadUrl,
  };
}