# Step 24: Create API Routes

## Context
You are building Tempest, an interactive streaming platform. This step creates all necessary API routes for handling webhooks, content synchronization, metadata management, and server-side operations using Next.js App Router API conventions.

## Purpose
API routes provide server-side functionality for authentication webhooks, content management, Cloudflare integration, and external service communication. These routes handle sensitive operations and data processing that cannot be performed on the client.

## Prerequisites
- Step 23 completed successfully
- Admin dashboard components created
- Supabase client configuration completed
- Cloudflare integration setup
- Clerk webhook configuration available

## Task Instructions
Complete each task in order and mark as ✅ when finished:

### Task 1: Create Clerk Webhook Handler ⏳
Create webhook handler for Clerk authentication events.

**File to Create:** `app/api/webhooks/clerk/route.ts`

```typescript
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { createClient } from '@/lib/supabase/server';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env.local');
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occurred -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret);

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occurred', {
      status: 400,
    });
  }

  // Handle the webhook
  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`Webhook with an ID of ${id} and type of ${eventType}`);
  console.log('Webhook body:', body);

  const supabase = createClient();

  try {
    switch (eventType) {
      case 'user.created':
        // Create user in Supabase
        await supabase
          .from('users')
          .insert({
            clerk_id: evt.data.id,
            email: evt.data.email_addresses[0]?.email_address,
            username: evt.data.username || evt.data.first_name || 'User',
            avatar_url: evt.data.image_url,
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        break;

      case 'user.updated':
        // Update user in Supabase
        await supabase
          .from('users')
          .update({
            email: evt.data.email_addresses[0]?.email_address,
            username: evt.data.username || evt.data.first_name || 'User',
            avatar_url: evt.data.image_url,
            updated_at: new Date().toISOString(),
          })
          .eq('clerk_id', evt.data.id);
        break;

      case 'user.deleted':
        // Soft delete user in Supabase
        await supabase
          .from('users')
          .update({
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('clerk_id', evt.data.id);
        break;

      default:
        console.log(`Unhandled webhook event type: ${eventType}`);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response('Error processing webhook', {
      status: 500,
    });
  }

  return new Response('', { status: 200 });
}
```

**Verification:** 
- File created with Clerk webhook handling
- User creation, update, and deletion events processed
- Supabase user synchronization implemented

### Task 2: Create Content Metadata API ⏳
Create API routes for managing video metadata and content operations.

**File to Create:** `app/api/content/metadata/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const createVideoSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  channel_id: z.string().uuid(),
  cloudflare_stream_id: z.string().optional(),
  thumbnail_url: z.string().url().optional(),
  duration: z.number().positive().optional(),
  is_live: z.boolean().default(false),
  is_featured: z.boolean().default(false),
  published_at: z.string().datetime().optional(),
  tags: z.array(z.string()).optional(),
});

const updateVideoSchema = createVideoSchema.partial().extend({
  id: z.string().uuid(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const channel_id = searchParams.get('channel_id');
    const featured = searchParams.get('featured');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const supabase = createClient();
    let query = supabase
      .from('videos')
      .select(`
        *,
        channel:channels(*)
      `)
      .not('published_at', 'is', null)
      .lte('published_at', new Date().toISOString())
      .order('published_at', { ascending: false });

    if (channel_id) {
      query = query.eq('channel_id', channel_id);
    }

    if (featured === 'true') {
      query = query.eq('is_featured', true);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching videos:', error);
      return NextResponse.json(
        { error: 'Failed to fetch videos' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      videos: data,
      total: count,
      limit,
      offset,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const supabase = createClient();
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = createVideoSchema.parse(body);

    const { data, error } = await supabase
      .from('videos')
      .insert({
        ...validatedData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating video:', error);
      return NextResponse.json(
        { error: 'Failed to create video' },
        { status: 500 }
      );
    }

    return NextResponse.json({ video: data }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const supabase = createClient();
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = updateVideoSchema.parse(body);
    const { id, ...updateData } = validatedData;

    const { data, error } = await supabase
      .from('videos')
      .update({
        ...updateData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating video:', error);
      return NextResponse.json(
        { error: 'Failed to update video' },
        { status: 500 }
      );
    }

    return NextResponse.json({ video: data });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const supabase = createClient();
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting video:', error);
      return NextResponse.json(
        { error: 'Failed to delete video' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

**Verification:** 
- File created with CRUD operations for video metadata
- Authentication and authorization checks implemented
- Input validation with Zod schemas
- Proper error handling and responses

### Task 3: Create Cloudflare Sync API ⏳
Create API route for synchronizing content with Cloudflare Stream and R2.

**File to Create:** `app/api/content/cloudflare-sync/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { createClient } from '@/lib/supabase/server';

const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
const CLOUDFLARE_STREAM_API_URL = `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/stream`;

interface CloudflareStreamResponse {
  result: {
    uid: string;
    thumbnail: string;
    playback: {
      hls: string;
      dash: string;
    };
    status: {
      state: string;
      pctComplete: string;
    };
    meta: {
      name: string;
    };
    duration: number;
  };
  success: boolean;
  errors: any[];
  messages: any[];
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const supabase = createClient();
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { action, videoId, fileUrl } = await request.json();

    switch (action) {
      case 'upload':
        return await handleStreamUpload(fileUrl, videoId);
      case 'sync':
        return await handleStreamSync(videoId);
      case 'delete':
        return await handleStreamDelete(videoId);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Cloudflare Sync Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleStreamUpload(fileUrl: string, videoId: string) {
  try {
    const response = await fetch(CLOUDFLARE_STREAM_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: fileUrl,
        meta: {
          name: `video-${videoId}`,
        },
        uploadedFrom: 'url',
      }),
    });

    const data: CloudflareStreamResponse = await response.json();

    if (!data.success) {
      throw new Error(`Cloudflare upload failed: ${JSON.stringify(data.errors)}`);
    }

    // Update video record with Cloudflare Stream ID
    const supabase = createClient();
    await supabase
      .from('videos')
      .update({
        cloudflare_stream_id: data.result.uid,
        thumbnail_url: data.result.thumbnail,
        duration: data.result.duration,
        updated_at: new Date().toISOString(),
      })
      .eq('id', videoId);

    return NextResponse.json({
      success: true,
      streamId: data.result.uid,
      thumbnail: data.result.thumbnail,
      duration: data.result.duration,
    });
  } catch (error) {
    console.error('Stream upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload to Cloudflare Stream' },
      { status: 500 }
    );
  }
}

async function handleStreamSync(videoId: string) {
  try {
    const supabase = createClient();
    
    // Get video with Cloudflare Stream ID
    const { data: video, error } = await supabase
      .from('videos')
      .select('cloudflare_stream_id')
      .eq('id', videoId)
      .single();

    if (error || !video?.cloudflare_stream_id) {
      return NextResponse.json(
        { error: 'Video not found or no Cloudflare Stream ID' },
        { status: 404 }
      );
    }

    // Get video details from Cloudflare
    const response = await fetch(`${CLOUDFLARE_STREAM_API_URL}/${video.cloudflare_stream_id}`, {
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
    });

    const data: CloudflareStreamResponse = await response.json();

    if (!data.success) {
      throw new Error(`Cloudflare sync failed: ${JSON.stringify(data.errors)}`);
    }

    // Update video with latest Cloudflare data
    await supabase
      .from('videos')
      .update({
        thumbnail_url: data.result.thumbnail,
        duration: data.result.duration,
        updated_at: new Date().toISOString(),
      })
      .eq('id', videoId);

    return NextResponse.json({
      success: true,
      status: data.result.status,
      thumbnail: data.result.thumbnail,
      duration: data.result.duration,
    });
  } catch (error) {
    console.error('Stream sync error:', error);
    return NextResponse.json(
      { error: 'Failed to sync with Cloudflare Stream' },
      { status: 500 }
    );
  }
}

async function handleStreamDelete(videoId: string) {
  try {
    const supabase = createClient();
    
    // Get video with Cloudflare Stream ID
    const { data: video, error } = await supabase
      .from('videos')
      .select('cloudflare_stream_id')
      .eq('id', videoId)
      .single();

    if (error || !video?.cloudflare_stream_id) {
      return NextResponse.json(
        { error: 'Video not found or no Cloudflare Stream ID' },
        { status: 404 }
      );
    }

    // Delete from Cloudflare Stream
    const response = await fetch(`${CLOUDFLARE_STREAM_API_URL}/${video.cloudflare_stream_id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Cloudflare delete failed: ${response.statusText}`);
    }

    // Clear Cloudflare Stream ID from video
    await supabase
      .from('videos')
      .update({
        cloudflare_stream_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', videoId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Stream delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete from Cloudflare Stream' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const supabase = createClient();
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('clerk_id', userId)
      .single();

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get sync status for all videos
    const { data: videos, error } = await supabase
      .from('videos')
      .select('id, title, cloudflare_stream_id, updated_at')
      .not('cloudflare_stream_id', 'is', null);

    if (error) {
      throw error;
    }

    const syncStatus = await Promise.all(
      videos.map(async (video) => {
        try {
          const response = await fetch(`${CLOUDFLARE_STREAM_API_URL}/${video.cloudflare_stream_id}`, {
            headers: {
              'Authorization': `Bearer ${CLOUDFLARE_API_TOKEN}`,
            },
          });

          if (response.ok) {
            const data: CloudflareStreamResponse = await response.json();
            return {
              videoId: video.id,
              title: video.title,
              streamId: video.cloudflare_stream_id,
              status: data.result.status.state,
              lastSync: video.updated_at,
              inSync: true,
            };
          } else {
            return {
              videoId: video.id,
              title: video.title,
              streamId: video.cloudflare_stream_id,
              status: 'error',
              lastSync: video.updated_at,
              inSync: false,
            };
          }
        } catch (error) {
          return {
            videoId: video.id,
            title: video.title,
            streamId: video.cloudflare_stream_id,
            status: 'error',
            lastSync: video.updated_at,
            inSync: false,
          };
        }
      })
    );

    return NextResponse.json({ syncStatus });
  } catch (error) {
    console.error('Sync status error:', error);
    return NextResponse.json(
      { error: 'Failed to get sync status' },
      { status: 500 }
    );
  }
}
```

**Verification:** 
- File created with Cloudflare Stream integration
- Upload, sync, and delete operations implemented
- Proper error handling and status checking
- Admin authentication and authorization

### Task 4: Create Sentry Test API ⏳
Create API route for testing Sentry error tracking integration.

**File to Create:** `app/api/sentry-example-api/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const shouldError = searchParams.get('error') === 'true';

  try {
    // Add some context to Sentry
    Sentry.setTag('api-route', 'sentry-example');
    Sentry.setContext('request-info', {
      method: 'GET',
      url: request.url,
      userAgent: request.headers.get('user-agent'),
    });

    if (shouldError) {
      // This will trigger a Sentry error report
      throw new Error('This is a test error for Sentry integration');
    }

    // Simulate some processing
    const data = {
      message: 'API route is working correctly',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      sentryConfigured: !!process.env.SENTRY_DSN,
    };

    // Add a breadcrumb
    Sentry.addBreadcrumb({
      message: 'API route executed successfully',
      category: 'api',
      level: 'info',
      data,
    });

    return NextResponse.json(data);
  } catch (error) {
    // Capture the error with Sentry
    Sentry.captureException(error, {
      tags: {
        section: 'api-route-test',
      },
      extra: {
        requestUrl: request.url,
        timestamp: new Date().toISOString(),
      },
    });

    console.error('Sentry test API error:', error);
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        sentryEventId: Sentry.lastEventId(),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Set user context for Sentry
    Sentry.setUser({
      id: body.userId || 'anonymous',
      email: body.userEmail,
    });

    // Add request data as context
    Sentry.setContext('request-data', {
      body,
      timestamp: new Date().toISOString(),
    });

    // Simulate different types of errors based on input
    if (body.errorType) {
      switch (body.errorType) {
        case 'validation':
          throw new Error('Validation error: Invalid input data');
        case 'database':
          throw new Error('Database connection failed');
        case 'auth':
          throw new Error('Authentication failed: Invalid credentials');
        case 'network':
          throw new Error('Network timeout: External service unavailable');
        default:
          throw new Error('Generic error for testing');
      }
    }

    // Successful response
    const response = {
      message: 'POST request processed successfully',
      receivedData: body,
      timestamp: new Date().toISOString(),
    };

    Sentry.addBreadcrumb({
      message: 'POST request processed',
      category: 'api',
      level: 'info',
      data: response,
    });

    return NextResponse.json(response);
  } catch (error) {
    // Enhanced error reporting with more context
    Sentry.captureException(error, {
      tags: {
        method: 'POST',
        endpoint: 'sentry-example-api',
      },
      level: 'error',
      extra: {
        requestBody: await request.text().catch(() => 'Could not read body'),
        headers: Object.fromEntries(request.headers.entries()),
      },
    });

    return NextResponse.json(
      {
        error: 'Failed to process POST request',
        message: error instanceof Error ? error.message : 'Unknown error',
        sentryEventId: Sentry.lastEventId(),
      },
      { status: 500 }
    );
  }
}
```

**Verification:** 
- File created with Sentry integration testing
- Error simulation with different error types
- Proper context and breadcrumb tracking
- User context setting for error attribution

## Task Completion Checklist
Mark each task as complete when finished:

- [ ] Task 1: Clerk webhook handler created ✅
- [ ] Task 2: Content metadata API created ✅  
- [ ] Task 3: Cloudflare sync API created ✅
- [ ] Task 4: Sentry test API created ✅

## Verification Steps
After completing all tasks:

1. Check all API route files exist:
   ```bash
   ls -la app/api/
   ls -la app/api/webhooks/clerk/
   ls -la app/api/content/
   ```

2. Test TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```

3. Test API routes:
   ```bash
   npm run dev
   curl http://localhost:3000/api/sentry-example-api
   ```

## Success Criteria
- All 4 API routes created successfully
- TypeScript compilation succeeds without errors
- Webhook handling properly implemented
- Authentication and authorization working
- Error handling and logging implemented
- Cloudflare integration functional

## Important Notes
- API routes use Next.js App Router conventions
- Authentication checks implemented for protected routes
- Input validation with Zod schemas
- Proper error handling and logging
- Cloudflare Stream integration for video management
- Sentry integration for error tracking

## Troubleshooting
If you encounter issues:
1. Verify environment variables are properly set
2. Check Clerk webhook configuration
3. Ensure Cloudflare API tokens have correct permissions
4. Test Sentry DSN configuration
5. Validate Supabase client configuration

## Next Step
After completing this step and marking all tasks ✅, proceed to Step 25: Setup Deployment Configuration.