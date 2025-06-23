/**
 * Cloudflare Stream API client
 */
import { CLOUDFLARE_STREAM_CONFIG, isCloudflareStreamConfigured } from './cloudflare';

interface StreamVideo {
  uid: string;
  thumbnail: string;
  thumbnailTimestampPct: number;
  readyToStream: boolean;
  status: {
    state: string;
    pctComplete: string;
    errorReasonCode: string;
    errorReasonText: string;
  };
  meta: {
    name: string;
    [key: string]: any;
  };
  created: string;
  modified: string;
  size: number;
  preview: string;
  allowedOrigins: string[];
  requireSignedURLs: boolean;
  uploaded: string;
  uploadExpiry: string | null;
  maxSizeBytes: number;
  maxDurationSeconds: number;
  duration: number;
  input: {
    width: number;
    height: number;
  };
  playback: {
    hls: string;
    dash: string;
  };
  watermark?: {
    uid: string;
  };
}

interface StreamListResponse {
  result: StreamVideo[];
  success: boolean;
  errors: any[];
  messages: any[];
  result_info: {
    page: number;
    per_page: number;
    count: number;
    total_count: number;
  };
}

/**
 * Base API request to Cloudflare Stream
 */
async function streamApiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  console.log('Making Stream API request to:', endpoint);
  
  if (!isCloudflareStreamConfigured()) {
    const error = new Error('Cloudflare Stream is not properly configured. Please set CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_STREAM_API_TOKEN, and CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN environment variables.');
    throw error;
  }

  const url = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_STREAM_CONFIG.accountId}/stream${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${CLOUDFLARE_STREAM_CONFIG.apiToken}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  console.log('Stream API response status:', response.status);
  
  if (!response.ok) {
    let errorText = '';
    try {
      errorText = await response.text();
      console.error('Stream API error response:', errorText);
    } catch (e) {
      console.error('Could not read error response:', e);
    }
    
    const error = new Error(`Stream API request failed: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
    console.error('Full Stream API error:', {
      url, status: response.status, statusText: response.statusText, errorText
    });
    throw error;
  }

  return response;
}

/**
 * List all videos in Stream
 */
export async function listStreamVideos(options?: {
  search?: string;
  limit?: number;
  asc?: boolean;
  status?: string;
}): Promise<StreamVideo[]> {
  const params = new URLSearchParams();
  if (options?.search) params.append('search', options.search);
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.asc !== undefined) params.append('asc', options.asc.toString());
  if (options?.status) params.append('status', options.status);

  const queryString = params.toString();
  const endpoint = queryString ? `?${queryString}` : '';
  
  const response = await streamApiRequest(endpoint);
  let data: StreamListResponse;
  try {
    data = await response.json();
  } catch (e) {
    throw new Error(`Failed to parse Stream API response: ${e}`);
  }
  
  return data.result;
}

/**
 * Get a specific video from Stream
 */
export async function getStreamVideo(videoId: string): Promise<StreamVideo> {
  const response = await streamApiRequest(`/${videoId}`);
  const data = await response.json();
  
  return data.result;
}

/**
 * Delete a video from Stream
 */
export async function deleteStreamVideo(videoId: string): Promise<boolean> {
  const response = await streamApiRequest(`/${videoId}`, {
    method: 'DELETE',
  });
  
  const data = await response.json();
  return data.success;
}

/**
 * Update video metadata
 */
export async function updateStreamVideo(
  videoId: string,
  metadata: Partial<{
    // Basic metadata
    name: string;
    description: string;
    requireSignedURLs: boolean;
    allowedOrigins: string[];
    thumbnailTimestampPct: number;
    // Extended metadata for educational content
    category?: string;
    genre?: string;
    keywords?: string;
    language?: string;
    instructor?: string;
    difficulty_level?: string;
    target_audience?: string;
    learning_objectives?: string;
    prerequisites?: string;
  }>
): Promise<StreamVideo> {
  console.log('Updating Stream video metadata:', videoId, metadata);
  
  // Prepare metadata object for Cloudflare API
  const apiMetadata: any = {
    name: metadata.name,
    requireSignedURLs: metadata.requireSignedURLs,
    allowedOrigins: metadata.allowedOrigins,
    thumbnailTimestampPct: metadata.thumbnailTimestampPct
  };
  
  // Add custom metadata fields
  const customMetadata: any = {};
  
  // Add description to custom metadata if provided
  if (metadata.description) {
    customMetadata.description = metadata.description;
  }
  
  // Add educational metadata fields if provided
  if (metadata.category) customMetadata.category = metadata.category;
  if (metadata.genre) customMetadata.genre = metadata.genre;
  if (metadata.keywords) customMetadata.keywords = metadata.keywords;
  if (metadata.language) customMetadata.language = metadata.language;
  if (metadata.instructor) customMetadata.instructor = metadata.instructor;
  if (metadata.difficulty_level) customMetadata.difficulty_level = metadata.difficulty_level;
  if (metadata.target_audience) customMetadata.target_audience = metadata.target_audience;
  if (metadata.learning_objectives) customMetadata.learning_objectives = metadata.learning_objectives;
  if (metadata.prerequisites) customMetadata.prerequisites = metadata.prerequisites;
  
  // Add custom metadata to the API request if we have any
  if (Object.keys(customMetadata).length > 0) {
    apiMetadata.meta = customMetadata;
  }
  
  const response = await streamApiRequest(`/${videoId}`, {
    method: 'POST',
    body: JSON.stringify(apiMetadata),
  });
  
  const data = await response.json();
  console.log('Stream API update response:', data);
  return data.result;
}

/**
 * Get direct upload URL for Stream
 */
export async function getStreamUploadUrl(metadata?: {
  name?: string;
  requireSignedURLs?: boolean;
  allowedOrigins?: string[];
  thumbnailTimestampPct?: number;
  watermark?: string;
}): Promise<{
  uploadURL: string;
  uid: string;
}> {
  const response = await streamApiRequest('/direct_upload', {
    method: 'POST',
    body: JSON.stringify({
      maxDurationSeconds: 21600, // 6 hours max
      ...metadata,
    }),
  });
  
  const data = await response.json();
  return data.result;
}

/**
 * Create a live input for streaming
 */
export async function createLiveInput(metadata?: {
  name?: string;
  recording?: {
    mode: 'off' | 'automatic';
    timeoutSeconds?: number;
    requireSignedURLs?: boolean;
    allowedOrigins?: string[];
  };
}): Promise<{
  uid: string;
  rtmps: {
    url: string;
    streamKey: string;
  };
  rtmpsPlayback: {
    url: string;
    streamKey: string;
  };
  srt: {
    url: string;
    streamId: string;
  };
  webRTC: {
    url: string;
  };
  status: string;
  meta: any;
  created: string;
  modified: string;
}> {
  const response = await streamApiRequest('/live_inputs', {
    method: 'POST',
    body: JSON.stringify({
      recording: {
        mode: 'automatic',
        timeoutSeconds: 10,
        ...metadata?.recording,
      },
      meta: metadata?.name ? { name: metadata.name } : {},
    }),
  });
  
  const data = await response.json();
  return data.result;
}