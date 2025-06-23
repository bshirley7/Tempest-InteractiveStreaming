# Step 08: Create Core Utility Files

## Context
You are building Tempest, an interactive streaming platform. This step creates essential utility functions and type definitions that will be used throughout the application.

## Purpose
Core utilities are CRITICAL for consistent TypeScript types and shared functionality. Missing or incorrect utilities will cause type errors and runtime failures.

## Prerequisites
- Step 07 completed successfully
- You are in the `tempest` project directory
- Folder structure created

## Task Instructions
Complete each task in order and mark as ✅ when finished:

### Task 1: Create Class Name Utility ⏳

**CREATE lib/utils/cn.ts with EXACT content:**

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// CRITICAL: Utility for merging Tailwind classes
// This prevents conflicts between conditional classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**⚠️ CRITICAL WARNING**: This function is required by ALL shadcn/ui components

### Task 2: Create Core Types ⏳

**CREATE lib/types/index.ts with EXACT content:**

```typescript
// CRITICAL: Core types for Tempest streaming platform
// These MUST match Supabase database schema exactly

export interface User {
  id: string;
  clerk_id: string;
  username: string;
  email?: string;
  avatar_url?: string;
  role: 'user' | 'moderator' | 'admin';
  preferences?: Record<string, any>;
  last_seen_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  banner_url?: string;
  color: string;
  category?: string;
  is_active: boolean;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Video {
  id: string;
  title: string;
  description?: string;
  channel_id: string;
  cloudflare_stream_id?: string;
  cloudflare_r2_key?: string;
  thumbnail_url?: string;
  preview_url?: string;
  duration?: number;
  view_count: number;
  like_count?: number;
  tags?: string[];
  metadata?: Record<string, any>;
  is_live: boolean;
  is_featured: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
  // Relations
  channel?: Channel;
}

export interface ChatMessage {
  id: string;
  video_id: string;
  user_id: string;
  message: string;
  is_command: boolean;
  command_type?: string;
  is_highlighted?: boolean;
  is_deleted: boolean;
  parent_id?: string;
  created_at: string;
  // Relations
  user?: User;
}

export interface Interaction {
  id: string;
  video_id: string;
  user_id: string;
  type: 'reaction' | 'poll' | 'quiz' | 'rating' | 'bookmark';
  data: Record<string, any>;
  timestamp_in_video?: number;
  created_at: string;
  // Relations
  user?: User;
}

export interface Poll {
  id: string;
  video_id: string;
  question: string;
  options: PollOption[];
  trigger_time?: number;
  duration: number;
  is_active: boolean;
  results_visible?: boolean;
  created_by: string;
  created_at: string;
  expires_at?: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface Ad {
  id: string;
  title: string;
  description?: string;
  advertiser: string;
  type: 'pre-roll' | 'mid-roll' | 'overlay' | 'banner';
  media_url: string;
  click_url?: string;
  duration?: number;
  targeting: Record<string, any>;
  budget_cents?: number;
  cost_per_impression_cents?: number;
  impressions?: number;
  clicks?: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Analytics {
  id: string;
  video_id?: string;
  timestamp: string;
  time_bucket: '5min' | 'hour' | 'day';
  viewer_count: number;
  chat_message_count: number;
  interaction_count: number;
  engagement_rate: number;
  created_at: string;
}

// CRITICAL: Component prop types
export interface VideoPlayerProps {
  video: Video;
  autoplay?: boolean;
  controls?: boolean;
  muted?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onEnded?: () => void;
}

export interface ChatProps {
  videoId: string;
  className?: string;
}

export interface InteractionOverlayProps {
  videoId: string;
  currentTime: number;
  isVisible: boolean;
}

// CRITICAL: API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// CRITICAL: Form types
export interface VideoUploadForm {
  title: string;
  description?: string;
  channel_id: string;
  tags?: string[];
  is_featured?: boolean;
  published_at?: string;
}

export interface ChannelForm {
  name: string;
  slug: string;
  description?: string;
  color: string;
  is_active: boolean;
}
```

### Task 3: Create Constants File ⏳

**CREATE lib/constants/index.ts with EXACT content:**

```typescript
// CRITICAL: Application constants for Tempest
export const APP_NAME = 'Tempest';
export const APP_DESCRIPTION = 'Interactive Streaming Platform - Twitch for Education';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// CRITICAL: Default channel configuration
export const DEFAULT_CHANNELS = [
  {
    name: 'Campus Life',
    slug: 'campus-life',
    description: 'Student life, events, and campus culture',
    color: 'hsl(217, 91%, 60%)', // Blue
    category: 'lifestyle',
  },
  {
    name: 'Explore',
    slug: 'explore',
    description: 'Documentaries, science, and discovery',
    color: 'hsl(142, 69%, 58%)', // Green
    category: 'education',
  },
  {
    name: 'Create',
    slug: 'create',
    description: 'Art, design, and creative tutorials',
    color: 'hsl(32, 95%, 59%)', // Orange
    category: 'education',
  },
  {
    name: 'Chill',
    slug: 'chill',
    description: 'Relaxation, music, and ambient content',
    color: 'hsl(262, 69%, 65%)', // Purple
    category: 'entertainment',
  },
] as const;

// CRITICAL: Video configuration
export const VIDEO_SETTINGS = {
  MAX_UPLOAD_SIZE_MB: 500,
  MAX_UPLOAD_SIZE_BYTES: 500 * 1024 * 1024,
  SUPPORTED_FORMATS: ['mp4', 'mov', 'avi', 'webm', 'm4v'] as const,
  DEFAULT_THUMBNAIL_WIDTH: 1280,
  DEFAULT_THUMBNAIL_HEIGHT: 720,
  STREAM_QUALITY_LEVELS: ['360p', '480p', '720p', '1080p'] as const,
  CHUNK_SIZE_MB: 10,
} as const;

// CRITICAL: Chat configuration
export const CHAT_SETTINGS = {
  MAX_MESSAGE_LENGTH: 500,
  RATE_LIMIT_MESSAGES: 10,
  RATE_LIMIT_WINDOW_MS: 60 * 1000, // 1 minute
  COMMANDS: ['!poll', '!quiz', '!react', '!rate', '!bookmark'] as const,
  MODERATOR_COMMANDS: ['!timeout', '!ban', '!clear'] as const,
  MAX_EMOJIS_PER_MESSAGE: 5,
} as const;

// CRITICAL: Real-time configuration
export const REALTIME_SETTINGS = {
  RECONNECT_INTERVAL_MS: 5000,
  MAX_RECONNECT_ATTEMPTS: 10,
  HEARTBEAT_INTERVAL_MS: 30000,
  MESSAGE_BATCH_SIZE: 50,
} as const;

// CRITICAL: Analytics configuration
export const ANALYTICS_SETTINGS = {
  UPDATE_INTERVAL_MS: 5000,
  RETENTION_DAYS: 90,
  CHART_COLORS: {
    primary: 'hsl(217, 91%, 60%)',
    secondary: 'hsl(142, 69%, 58%)',
    accent: 'hsl(32, 95%, 59%)',
    danger: 'hsl(356, 69%, 61%)',
    success: 'hsl(142, 69%, 58%)',
    warning: 'hsl(32, 95%, 59%)',
  },
  METRICS: {
    VIEWER_COUNT: 'viewer_count',
    ENGAGEMENT_RATE: 'engagement_rate',
    CHAT_ACTIVITY: 'chat_activity',
    INTERACTION_COUNT: 'interaction_count',
  },
} as const;

// CRITICAL: API endpoints
export const API_ENDPOINTS = {
  // Core resources
  USERS: '/api/users',
  CHANNELS: '/api/channels',
  VIDEOS: '/api/videos',
  CHAT: '/api/chat',
  INTERACTIONS: '/api/interactions',
  ANALYTICS: '/api/analytics',
  
  // External integrations
  CLOUDFLARE_SYNC: '/api/content/cloudflare-sync',
  METADATA: '/api/content/metadata',
  
  // Webhooks
  WEBHOOKS_CLERK: '/api/webhooks/clerk',
  
  // Health checks
  HEALTH: '/api/health',
  DB_TEST: '/api/test-db',
} as const;

// CRITICAL: UI constants
export const UI_CONSTANTS = {
  HEADER_HEIGHT: '64px',
  SIDEBAR_WIDTH: '280px',
  CHAT_WIDTH: '320px',
  MOBILE_BREAKPOINT: '768px',
  TABLET_BREAKPOINT: '1024px',
  
  // Z-index scale
  Z_INDEX: {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    TOAST: 1080,
  },
} as const;

// CRITICAL: Feature flags
export const FEATURE_FLAGS = {
  ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  ENABLE_CHAT: process.env.NEXT_PUBLIC_ENABLE_CHAT === 'true',
  ENABLE_OVERLAYS: process.env.NEXT_PUBLIC_ENABLE_OVERLAYS === 'true',
  ENABLE_ADS: process.env.NEXT_PUBLIC_ENABLE_ADS === 'true',
  ENABLE_DEBUG: process.env.NEXT_PUBLIC_ENABLE_DEBUG === 'true',
  DEV_MODE: process.env.NEXT_PUBLIC_DEV_MODE === 'true',
} as const;

// CRITICAL: Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  UPLOAD_FAILED: 'File upload failed. Please try again.',
  STREAM_ERROR: 'Video stream unavailable. Please refresh the page.',
} as const;

// CRITICAL: Success messages
export const SUCCESS_MESSAGES = {
  SAVED: 'Changes saved successfully!',
  UPLOADED: 'File uploaded successfully!',
  DELETED: 'Item deleted successfully!',
  CREATED: 'Item created successfully!',
  UPDATED: 'Item updated successfully!',
} as const;
```

### Task 4: Create Format Utilities ⏳

**CREATE lib/utils/format.ts with EXACT content:**

```typescript
import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

// CRITICAL: Currency formatting for ad revenue and analytics
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

// CRITICAL: Number formatting for large counts (views, followers)
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toLocaleString();
}

// CRITICAL: Duration formatting for video lengths
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// CRITICAL: Relative time for chat messages and content
export function formatRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isToday(dateObj)) {
    return format(dateObj, 'h:mm a');
  } else if (isYesterday(dateObj)) {
    return 'Yesterday';
  } else {
    return formatDistanceToNow(dateObj, { addSuffix: true });
  }
}

// CRITICAL: File size formatting for uploads
export function formatFileSize(bytes: number): string {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = bytes / Math.pow(1024, i);
  return `${Math.round(size * 100) / 100} ${sizes[i]}`;
}

// CRITICAL: Percentage formatting for analytics
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

// CRITICAL: Username formatting for display
export function formatUsername(username: string): string {
  // Remove special characters and limit length
  return username.replace(/[^a-zA-Z0-9_]/g, '').substring(0, 20);
}

// CRITICAL: Truncate text for previews
export function truncateText(text: string, maxLength: number = 100): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

// CRITICAL: Format video quality for display
export function formatVideoQuality(quality: string): string {
  const qualityMap: Record<string, string> = {
    '360p': '360p (Mobile)',
    '480p': '480p (SD)',
    '720p': '720p (HD)',
    '1080p': '1080p (Full HD)',
    '1440p': '1440p (2K)',
    '2160p': '2160p (4K)',
  };
  return qualityMap[quality] || quality;
}

// CRITICAL: Format chat timestamp
export function formatChatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'HH:mm');
}

// CRITICAL: Format analytics date range
export function formatDateRange(startDate: Date, endDate: Date): string {
  if (isToday(startDate) && isToday(endDate)) {
    return 'Today';
  } else if (isYesterday(startDate) && isYesterday(endDate)) {
    return 'Yesterday';
  } else {
    return `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d')}`;
  }
}
```

### Task 5: Create Validation Utilities ⏳

**CREATE lib/utils/validation.ts with EXACT content:**
```typescript
// CRITICAL: Input validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidUsername(username: string): boolean {
  // 3-20 characters, letters, numbers, underscores only
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
}

export function isValidVideoFile(file: File): boolean {
  const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
  return validTypes.includes(file.type);
}

export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(file.type);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

export function sanitizeFilename(filename: string): string {
  // Remove special characters and spaces
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
}

export function validateChatMessage(message: string): { valid: boolean; error?: string } {
  if (!message.trim()) {
    return { valid: false, error: 'Message cannot be empty' };
  }
  if (message.length > 500) {
    return { valid: false, error: 'Message too long (max 500 characters)' };
  }
  return { valid: true };
}
```

## Task Completion Checklist
Mark each task as complete:

- [ ] Task 1: Class name utility created ✅
- [ ] Task 2: Core types created ✅
- [ ] Task 3: Constants file created ✅
- [ ] Task 4: Format utilities created ✅
- [ ] Task 5: Validation utilities created ✅

## Verification Commands

**EXACT COMMAND - Check all files exist:**
```bash
ls -la lib/utils/ lib/types/ lib/constants/
```

**EXACT COMMAND - Test TypeScript compilation:**
```bash
npx tsc --noEmit
```

**EXACT COMMAND - Test imports work:**
```bash
node -e "console.log('Utils test'); try { require('./lib/utils/cn.ts'); console.log('CN import OK'); } catch(e) { console.error('CN import failed:', e.message); }"
```

## Critical Implementation Notes

**TYPE SAFETY**: All interfaces MUST match Supabase schema exactly
**CONSTANTS**: Use `as const` assertions for immutable configuration
**VALIDATION**: Every user input MUST be validated before processing
**FORMATTING**: Consistent formatting prevents UI display issues

## Common Issues & Solutions

**Issue**: TypeScript errors in imports
**Solution**: Ensure all files use .ts extension and proper exports

**Issue**: clsx/tailwind-merge not found
**Solution**: These will be installed with shadcn/ui in later steps

**Issue**: date-fns functions not working
**Solution**: Will be installed with dependencies in Step 02

**Issue**: Constants not updating
**Solution**: Restart dev server after changing constants

## Success Criteria
- All utility files created with proper TypeScript
- No compilation errors
- Types match database schema exactly
- Constants provide complete configuration
- Format functions handle edge cases
- Validation functions prevent security issues

## Next Step
After all tasks show ✅, proceed to Step 09: Create Supabase Client Configuration