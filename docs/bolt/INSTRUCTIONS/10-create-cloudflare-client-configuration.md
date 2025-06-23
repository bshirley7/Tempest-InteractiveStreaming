# Step 10: Create Cloudflare Client Configuration

## Context
You are building Tempest, an interactive streaming platform. This step creates Cloudflare client configurations for R2 storage (file uploads) and Stream (video delivery), enabling video upload and streaming capabilities.

## Prerequisites
- Step 09 completed successfully
- You are in the `tempest` project directory
- AWS SDK dependencies installed
- Cloudflare environment variables configured

## Task
Create Cloudflare client files that handle R2 storage operations and Stream API interactions for video management.

## Files to Create

### 1. Create `lib/cloudflare/r2.ts` (R2 Storage Client)

```typescript
import { S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToR2(
  key: string,
  file: Buffer | Uint8Array,
  contentType: string = 'application/octet-stream'
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
    Key: key,
    Body: file,
    ContentType: contentType,
  });

  await r2Client.send(command);
  return `${process.env.CLOUDFLARE_R2_PUBLIC_URL}/${key}`;
}

export async function getSignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(r2Client, command, { expiresIn });
}

export async function getSignedDownloadUrl(
  key: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
    Key: key,
  });

  return await getSignedUrl(r2Client, command, { expiresIn });
}

export async function deleteFromR2(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: process.env.CLOUDFLARE_R2_BUCKET_NAME!,
    Key: key,
  });

  await r2Client.send(command);
}

export function generateR2Key(type: 'video' | 'thumbnail' | 'asset', filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `${type}s/${timestamp}_${sanitizedFilename}`;
}
```

### 2. Create `lib/cloudflare/stream.ts` (Stream API Client)

```typescript
interface CloudflareStreamResponse {
  result?: {
    uid: string;
    thumbnail: string;
    thumbnailTimestampPct: number;
    readyToStream: boolean;
    status: {
      state: string;
      pctComplete: string;
    };
    meta: Record<string, any>;
    created: string;
    modified: string;
    size: number;
    preview: string;
    allowedOrigins: string[];
    requireSignedURLs: boolean;
    uploaded: string;
    uploadExpiry: string;
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
  };
  success: boolean;
  errors: any[];
  messages: any[];
}

export class CloudflareStreamClient {
  private apiToken: string;
  private accountId: string;
  private baseUrl: string;

  constructor() {
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN!;
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
    this.baseUrl = `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/stream`;
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Cloudflare Stream API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async uploadVideo(file: File | Buffer, metadata: Record<string, any> = {}): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('meta', JSON.stringify(metadata));

    const response = await fetch(`${this.baseUrl}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const data: CloudflareStreamResponse = await response.json();
    if (!data.success || !data.result) {
      throw new Error('Upload failed: ' + JSON.stringify(data.errors));
    }

    return data.result.uid;
  }

  async getVideoDetails(videoId: string): Promise<CloudflareStreamResponse['result']> {
    const data: CloudflareStreamResponse = await this.request(`/${videoId}`);
    if (!data.success || !data.result) {
      throw new Error('Failed to get video details: ' + JSON.stringify(data.errors));
    }
    return data.result;
  }

  async deleteVideo(videoId: string): Promise<void> {
    const data = await this.request(`/${videoId}`, { method: 'DELETE' });
    if (!data.success) {
      throw new Error('Failed to delete video: ' + JSON.stringify(data.errors));
    }
  }

  async updateVideoMetadata(videoId: string, metadata: Record<string, any>): Promise<void> {
    const data = await this.request(`/${videoId}`, {
      method: 'POST',
      body: JSON.stringify({ meta: metadata }),
    });
    if (!data.success) {
      throw new Error('Failed to update metadata: ' + JSON.stringify(data.errors));
    }
  }

  getStreamUrl(videoId: string): string {
    const subdomain = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN;
    return `https://${subdomain}.cloudflarestream.com/${videoId}/manifest/video.m3u8`;
  }

  getThumbnailUrl(videoId: string, timestamp?: number): string {
    const subdomain = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN;
    const timeParam = timestamp ? `?time=${timestamp}s` : '';
    return `https://${subdomain}.cloudflarestream.com/${videoId}/thumbnails/thumbnail.jpg${timeParam}`;
  }

  getEmbedUrl(videoId: string): string {
    const subdomain = process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN;
    return `https://${subdomain}.cloudflarestream.com/${videoId}/iframe`;
  }
}

export const streamClient = new CloudflareStreamClient();
```

### 3. Create `lib/cloudflare/sync.ts` (Sync Utilities)

```typescript
import { streamClient } from './stream';
import { createClient } from '@/lib/supabase/server';
import type { Video } from '@/lib/types';

export interface VideoSyncResult {
  success: boolean;
  videoId?: string;
  error?: string;
  details?: any;
}

export async function syncVideoToDatabase(
  cloudflareStreamId: string,
  videoData: Partial<Video>
): Promise<VideoSyncResult> {
  try {
    // Get video details from Cloudflare Stream
    const streamDetails = await streamClient.getVideoDetails(cloudflareStreamId);
    
    if (!streamDetails.readyToStream) {
      return {
        success: false,
        error: 'Video not ready for streaming yet'
      };
    }

    // Prepare video data for database
    const videoRecord: Partial<Video> = {
      ...videoData,
      cloudflare_stream_id: cloudflareStreamId,
      thumbnail_url: streamClient.getThumbnailUrl(cloudflareStreamId),
      preview_url: streamDetails.preview,
      duration: Math.round(streamDetails.duration),
      metadata: {
        ...videoData.metadata,
        cloudflare: {
          size: streamDetails.size,
          input: streamDetails.input,
          status: streamDetails.status
        }
      }
    };

    // Save to Supabase
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('videos')
      .insert([videoRecord])
      .select()
      .single();

    if (error) {
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      videoId: data.id,
      details: data
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown sync error'
    };
  }
}

export async function validateCloudflareVideo(streamId: string): Promise<boolean> {
  try {
    const details = await streamClient.getVideoDetails(streamId);
    return details.readyToStream && details.status.state === 'ready';
  } catch {
    return false;
  }
}

export async function generateVideoThumbnails(
  streamId: string,
  timestamps: number[] = [10, 30, 60]
): Promise<string[]> {
  return timestamps.map(timestamp => 
    streamClient.getThumbnailUrl(streamId, timestamp)
  );
}
```

## File Creation Commands

```bash
# Create Cloudflare client files
touch lib/cloudflare/r2.ts
touch lib/cloudflare/stream.ts
touch lib/cloudflare/sync.ts
```

Then add the respective content to each file.

## Configuration Explanation

### R2 Storage Client (`r2.ts`)
- Handles file uploads to Cloudflare R2
- Generates signed URLs for secure uploads/downloads
- Manages file deletion and key generation
- Compatible with AWS S3 API

### Stream API Client (`stream.ts`)
- Manages video uploads to Cloudflare Stream
- Handles video metadata and status checking
- Provides streaming URLs and thumbnail generation
- Includes proper TypeScript interfaces

### Sync Utilities (`sync.ts`)
- Synchronizes Cloudflare Stream videos with Supabase database
- Validates video processing status
- Generates multiple thumbnail options
- Handles error cases gracefully

## Verification Steps

1. Confirm all files exist:
   ```bash
   ls -la lib/cloudflare/
   ```

2. Check TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```

3. Verify environment variables:
   ```bash
   node -e "console.log(process.env.CLOUDFLARE_ACCOUNT_ID ? 'Cloudflare configured' : 'Missing Cloudflare config')"
   ```

## Success Criteria
- All Cloudflare client files created
- TypeScript compilation succeeds
- R2 and Stream clients properly configured
- Sync utilities ready for video processing
- Environment variables properly referenced

## Important Notes
- R2 client uses AWS S3 SDK for compatibility
- Stream client includes proper error handling
- Sync utilities bridge Cloudflare and Supabase
- URL generation includes customer subdomain for Stream

## Next Step
After completing this step, proceed to Step 11: Create Sentry Configuration Files.