# Step 09: Create Supabase Client Configuration

## Context
You are building Tempest, an interactive streaming platform. This step creates Supabase client configurations for both browser and server environments, enabling database access and real-time subscriptions.

## Prerequisites
- Step 08 completed successfully
- You are in the `tempest` project directory
- Supabase dependencies installed
- Environment variables configured

## Task
Create Supabase client files that handle authentication, database queries, and real-time subscriptions for both client and server environments.

## Files to Create

### 1. Create `lib/supabase/client.ts` (Browser Client)

```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### 2. Create `lib/supabase/server.ts` (Server Client)

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle error in middleware context
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle error in middleware context
          }
        },
      },
    }
  )
}
```

### 3. Create `lib/supabase/middleware.ts` (Middleware Client)

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired
  await supabase.auth.getUser()

  return response
}
```

### 4. Create `lib/supabase/queries.ts` (Database Queries)

```typescript
import { createClient } from './server'
import type { Channel, Video, ChatMessage, User, Analytics } from '@/lib/types'

export async function getChannels(): Promise<Channel[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('is_active', true)
    .order('name')

  if (error) throw error
  return data || []
}

export async function getChannelBySlug(slug: string): Promise<Channel | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) return null
  return data
}

export async function getVideosByChannel(channelId: string): Promise<Video[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('videos')
    .select(`
      *,
      channel:channels(*)
    `)
    .eq('channel_id', channelId)
    .not('published_at', 'is', null)
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false })

  if (error) throw error
  return data || []
}

export async function getVideoById(id: string): Promise<Video | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('videos')
    .select(`
      *,
      channel:channels(*)
    `)
    .eq('id', id)
    .single()

  if (error) return null
  return data
}

export async function getChatMessages(videoId: string, limit = 50): Promise<ChatMessage[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      *,
      user:users(id, username, avatar_url)
    `)
    .eq('video_id', videoId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return (data || []).reverse()
}

export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', clerkId)
    .single()

  if (error) return null
  return data
}

export async function getVideoAnalytics(videoId: string, timeBucket: '5min' | 'hour' | 'day' = 'hour'): Promise<Analytics[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('analytics')
    .select('*')
    .eq('video_id', videoId)
    .eq('time_bucket', timeBucket)
    .order('timestamp', { ascending: true })
    .limit(100)

  if (error) throw error
  return data || []
}
```

## File Creation Commands

```bash
# Create Supabase client files
touch lib/supabase/client.ts
touch lib/supabase/server.ts
touch lib/supabase/middleware.ts
touch lib/supabase/queries.ts
```

Then add the respective content to each file.

## Client Configuration Explanation

### Browser Client (`client.ts`)
- Used in React components and client-side code
- Handles real-time subscriptions
- Uses public anon key (safe for browser)

### Server Client (`server.ts`)
- Used in Server Components and API routes
- Handles secure database operations
- Uses cookies for authentication state

### Middleware Client (`middleware.ts`)
- Used in Next.js middleware
- Refreshes authentication sessions
- Manages cookie state between requests

### Query Functions (`queries.ts`)
- Pre-built database queries for common operations
- Includes proper TypeScript types
- Handles error cases gracefully

## Verification Steps

1. Confirm all files exist:
   ```bash
   ls -la lib/supabase/
   ```

2. Check TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```

3. Test environment variables are accessible:
   ```bash
   node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Supabase URL set' : 'Missing Supabase URL')"
   ```

## Success Criteria
- All Supabase client files created
- TypeScript compilation succeeds
- Environment variables properly referenced
- Query functions include proper type safety
- Client configurations handle both browser and server environments

## Important Notes
- Server client uses async/await for cookie handling (Next.js 15+ requirement)
- Middleware client properly manages session refresh
- Query functions include JOIN operations for related data
- Error handling prevents application crashes on database issues

## Next Step
After completing this step, proceed to Step 10: Create Cloudflare Client Configuration.