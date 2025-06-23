# Step 09: Create Supabase Client Configuration

## Context
You are building Tempest, an interactive streaming platform. This step creates the Supabase client configuration for database operations and real-time subscriptions.

## Purpose
Proper Supabase configuration is CRITICAL for database access, authentication integration with Clerk, and real-time features. Incorrect setup will cause data fetching failures and break real-time subscriptions.

## Prerequisites
- Step 08 completed successfully
- Supabase environment variables configured
- You are in the `tempest` project directory

## Task Instructions
Complete each task in order and mark as ✅ when finished:

### Task 1: Create Supabase Client Files ⏳

**CREATE lib/supabase/client.ts with EXACT content:**
```typescript
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

// CRITICAL: Client-side Supabase client for use in Client Components
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// CRITICAL: Singleton pattern for consistent client instance
let client: ReturnType<typeof createClient> | undefined;

export function getClient() {
  if (!client) {
    client = createClient();
  }
  return client;
}
```

**⚠️ CRITICAL WARNING**: Do NOT use service role key in client-side code

### Task 2: Create Server-Side Supabase Client ⏳

**CREATE lib/supabase/server.ts with EXACT content:**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

// CRITICAL: Server-side Supabase client for use in Server Components
export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch (error) {
            // CRITICAL: Handle cookie errors in Server Components
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options });
          } catch (error) {
            // Handle cookie errors in Server Components
          }
        },
      },
    }
  );
}
```

### Task 3: Create Database Types ⏳

**CREATE lib/supabase/types.ts with EXACT content:**
```typescript
// CRITICAL: Database types for type safety
// These will be replaced with generated types later

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          clerk_id: string;
          email: string | null;
          username: string;
          avatar_url: string | null;
          role: 'user' | 'moderator' | 'admin';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          clerk_id: string;
          email?: string | null;
          username: string;
          avatar_url?: string | null;
          role?: 'user' | 'moderator' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          clerk_id?: string;
          email?: string | null;
          username?: string;
          avatar_url?: string | null;
          role?: 'user' | 'moderator' | 'admin';
          created_at?: string;
          updated_at?: string;
        };
      };
      channels: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          color: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          color: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          color?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      videos: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          channel_id: string;
          cloudflare_stream_id: string | null;
          thumbnail_url: string | null;
          duration: number | null;
          view_count: number;
          is_live: boolean;
          is_featured: boolean;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          channel_id: string;
          cloudflare_stream_id?: string | null;
          thumbnail_url?: string | null;
          duration?: number | null;
          view_count?: number;
          is_live?: boolean;
          is_featured?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          channel_id?: string;
          cloudflare_stream_id?: string | null;
          thumbnail_url?: string | null;
          duration?: number | null;
          view_count?: number;
          is_live?: boolean;
          is_featured?: boolean;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      chat_messages: {
        Row: {
          id: string;
          video_id: string;
          user_id: string;
          message: string;
          is_command: boolean;
          command_type: string | null;
          is_deleted: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          video_id: string;
          user_id: string;
          message: string;
          is_command?: boolean;
          command_type?: string | null;
          is_deleted?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          video_id?: string;
          user_id?: string;
          message?: string;
          is_command?: boolean;
          command_type?: string | null;
          is_deleted?: boolean;
          created_at?: string;
        };
      };
      interactions: {
        Row: {
          id: string;
          video_id: string;
          user_id: string;
          type: 'reaction' | 'poll' | 'quiz' | 'rating' | 'bookmark';
          data: Record<string, any>;
          timestamp_in_video: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          video_id: string;
          user_id: string;
          type: 'reaction' | 'poll' | 'quiz' | 'rating' | 'bookmark';
          data: Record<string, any>;
          timestamp_in_video?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          video_id?: string;
          user_id?: string;
          type?: 'reaction' | 'poll' | 'quiz' | 'rating' | 'bookmark';
          data?: Record<string, any>;
          timestamp_in_video?: number | null;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {
      increment_view_count: {
        Args: { video_uuid: string };
        Returns: void;
      };
    };
    Enums: {
      user_role: 'user' | 'moderator' | 'admin';
      interaction_type: 'reaction' | 'poll' | 'quiz' | 'rating' | 'bookmark';
    };
  };
};

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
```

### Task 4: Create Supabase Middleware ⏳

**CREATE lib/supabase/middleware.ts with EXACT content:**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// CRITICAL: Middleware to refresh auth tokens
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Set cookie on request
          request.cookies.set({
            name,
            value,
            ...options,
          });
          // Set cookie on response
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          // Remove cookie on request
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          // Remove cookie on response
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // CRITICAL: This will refresh the session if expired
  await supabase.auth.getUser();

  return response;
}
```

### Task 5: Test Supabase Connection ⏳

**CREATE app/api/test-db/route.ts:**
```typescript
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createClient();
    
    // Test database connection
    const { data, error } = await supabase
      .from('channels')
      .select('count')
      .limit(1);

    if (error) {
      return NextResponse.json({
        status: 'error',
        message: error.message,
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'connected',
      timestamp: new Date().toISOString(),
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
```

**Test the connection:**
```bash
npm run dev
# Visit http://localhost:3000/api/test-db
```

## Task Completion Checklist
Mark each task as complete:

- [ ] Task 1: Client-side Supabase client created ✅
- [ ] Task 2: Server-side Supabase client created ✅
- [ ] Task 3: Database types created ✅
- [ ] Task 4: Supabase middleware created ✅
- [ ] Task 5: Connection tested successfully ✅

## Critical Configuration Notes

**CLIENT vs SERVER**: Always use appropriate client for the context
**TYPE SAFETY**: Use Database types for all queries
**ERROR HANDLING**: Always handle Supabase errors
**REAL-TIME**: Client supports subscriptions, server does not

## Common Issues & Solutions

**Issue**: "Supabase client is not configured"
**Solution**: Check environment variables are set correctly

**Issue**: TypeScript errors on queries
**Solution**: Ensure types match your database schema

**Issue**: Real-time subscriptions not working
**Solution**: Use client-side client, not server-side

**Issue**: Authentication not syncing with Clerk
**Solution**: Users are created via webhook, not Supabase auth

## Success Criteria
- Both client and server Supabase clients created
- Database types properly defined
- Test API returns "connected" status
- No TypeScript errors
- Proper separation of client/server code

## Next Step
After all tasks show ✅, proceed to Step 10: Create Cloudflare Client Configuration