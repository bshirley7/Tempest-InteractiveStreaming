# Step 08: Create Core Utility Files

## Context
You are building Tempest, an interactive streaming platform. This step creates essential utility functions and type definitions that will be used throughout the application.

## Prerequisites
- Step 07 completed successfully
- You are in the `tempest` project directory
- Folder structure created

## Task
Create core utility files including class name utilities, TypeScript type definitions, and constants used across the application.

## Files to Create

### 1. Create `lib/utils/cn.ts`

```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### 2. Create `lib/types.ts`

```typescript
export interface User {
  id: string
  clerk_id: string
  username: string
  email?: string
  avatar_url?: string
  role: 'viewer' | 'moderator' | 'admin'
  preferences: Record<string, any>
  last_seen_at?: string
  created_at: string
  updated_at: string
}

export interface Channel {
  id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  banner_url?: string
  color?: string
  category?: string
  is_active: boolean
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Video {
  id: string
  title: string
  description?: string
  channel_id: string
  cloudflare_stream_id?: string
  cloudflare_r2_key?: string
  thumbnail_url?: string
  preview_url?: string
  duration?: number
  view_count: number
  like_count: number
  tags: string[]
  metadata: Record<string, any>
  is_live: boolean
  is_featured: boolean
  published_at?: string
  created_at: string
  updated_at: string
  channel?: Channel
}

export interface ChatMessage {
  id: string
  video_id: string
  user_id: string
  message: string
  is_command: boolean
  command_type?: string
  is_highlighted: boolean
  is_deleted: boolean
  parent_id?: string
  created_at: string
  user?: User
}

export interface Interaction {
  id: string
  video_id: string
  user_id: string
  type: 'poll' | 'quiz' | 'reaction' | 'rating' | 'share' | 'bookmark'
  data: Record<string, any>
  timestamp_in_video?: number
  created_at: string
  user?: User
}

export interface Poll {
  id: string
  video_id: string
  question: string
  options: PollOption[]
  trigger_time?: number
  duration: number
  is_active: boolean
  results_visible: boolean
  created_by: string
  created_at: string
}

export interface PollOption {
  id: string
  text: string
  votes: number
}

export interface Ad {
  id: string
  title: string
  advertiser?: string
  type: 'pre-roll' | 'mid-roll' | 'overlay' | 'banner'
  media_url?: string
  click_url?: string
  duration?: number
  target_criteria: Record<string, any>
  budget_cents?: number
  cost_per_impression_cents?: number
  impressions: number
  clicks: number
  is_active: boolean
  start_date?: string
  end_date?: string
  created_at: string
  updated_at: string
}

export interface Schedule {
  id: string
  channel_id: string
  video_id: string
  start_time: string
  end_time: string
  is_recurring: boolean
  recurrence_rule?: string
  created_at: string
  updated_at: string
  channel?: Channel
  video?: Video
}

export interface Analytics {
  id: string
  video_id: string
  timestamp: string
  time_bucket: '5min' | 'hour' | 'day'
  viewer_count: number
  unique_viewers: number
  chat_messages: number
  interactions: number
  ad_impressions: number
  ad_revenue_cents: number
  average_watch_time: number
  engagement_rate: number
}
```

### 3. Create `lib/utils/constants.ts`

```typescript
export const APP_NAME = 'Tempest'
export const APP_DESCRIPTION = 'Interactive Streaming Platform'

// Channels
export const DEFAULT_CHANNELS = [
  {
    name: 'Campus Life',
    slug: 'campus-life',
    description: 'Student life, events, and campus culture',
    color: '#FF6B6B',
    category: 'lifestyle'
  },
  {
    name: 'Explore',
    slug: 'explore',
    description: 'Documentaries, science, and discovery',
    color: '#4ECDC4',
    category: 'education'
  },
  {
    name: 'Create',
    slug: 'create',
    description: 'Art, design, and creative tutorials',
    color: '#45B7D1',
    category: 'education'
  },
  {
    name: 'Chill',
    slug: 'chill',
    description: 'Relaxation, music, and ambient content',
    color: '#96CEB4',
    category: 'entertainment'
  }
]

// Video settings
export const VIDEO_SETTINGS = {
  MAX_UPLOAD_SIZE_MB: 500,
  SUPPORTED_FORMATS: ['mp4', 'mov', 'avi', 'webm'],
  DEFAULT_THUMBNAIL_WIDTH: 1280,
  DEFAULT_THUMBNAIL_HEIGHT: 720,
  STREAM_QUALITY_LEVELS: ['720p', '1080p', '1440p', '2160p']
}

// Chat settings
export const CHAT_SETTINGS = {
  MAX_MESSAGE_LENGTH: 500,
  RATE_LIMIT_MESSAGES: 10,
  RATE_LIMIT_WINDOW_MS: 60000,
  COMMANDS: ['!poll', '!quiz', '!react', '!rate']
}

// Analytics settings
export const ANALYTICS_SETTINGS = {
  UPDATE_INTERVAL_MS: 5000,
  RETENTION_DAYS: 90,
  CHART_COLORS: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444'
  }
}

// API endpoints
export const API_ENDPOINTS = {
  USERS: '/api/users',
  CHANNELS: '/api/channels',
  VIDEOS: '/api/videos',
  CHAT: '/api/chat',
  INTERACTIONS: '/api/interactions',
  ANALYTICS: '/api/analytics',
  CLOUDFLARE_SYNC: '/api/content/cloudflare-sync',
  METADATA: '/api/content/metadata'
}
```

### 4. Create `lib/utils/format.ts`

```typescript
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns'

export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cents / 100)
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}

export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  
  if (isToday(dateObj)) {
    return format(dateObj, 'h:mm a')
  } else if (isYesterday(dateObj)) {
    return 'Yesterday'
  } else {
    return formatDistanceToNow(dateObj, { addSuffix: true })
  }
}

export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 Bytes'
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}
```

## File Creation Commands

```bash
# Create utility files
touch lib/utils/cn.ts
touch lib/types.ts
touch lib/utils/constants.ts
touch lib/utils/format.ts
```

Then add the respective content to each file.

## Verification Steps

1. Confirm all files exist:
   ```bash
   ls -la lib/utils/
   ls -la lib/types.ts
   ```

2. Check TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```

## Success Criteria
- All utility files created with correct TypeScript types
- No TypeScript compilation errors
- Utility functions ready for use across the application
- Type definitions match database schema
- Constants file includes all necessary app configuration

## Important Notes
- The `cn` utility combines clsx and tailwind-merge for optimal class handling
- Type definitions match the database schema from previous documentation
- Constants file provides centralized configuration
- Format utilities handle common display needs (currency, time, file sizes)

## Next Step
After completing this step, proceed to Step 09: Create Supabase Client Configuration.