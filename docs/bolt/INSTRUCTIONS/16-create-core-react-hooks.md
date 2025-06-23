# Step 16: Create Core React Hooks

## Context
You are building Tempest, an interactive streaming platform. This step creates essential React hooks that manage application state, data fetching, real-time subscriptions, and user interactions across the platform.

## Purpose
Custom hooks provide reusable logic for data management, real-time features, user authentication state, and component interactions. They abstract complex operations and ensure consistent behavior across components.

## Prerequisites
- Step 15 completed successfully
- Database tables created and configured
- Supabase client configuration completed
- TypeScript types defined

## Task Instructions
Complete each task in order and mark as ✅ when finished:

### Task 1: Create User Management Hook ⏳
Create a hook for managing user authentication state and profile data.

**File to Create:** `lib/hooks/useUser.ts`

```typescript
'use client';

import { useUser as useClerkUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@/lib/types';

export function useUser() {
  const { user: clerkUser, isLoaded, isSignedIn } = useClerkUser();
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSupabaseUser() {
      if (!isLoaded) return;
      
      setLoading(true);
      setError(null);

      if (!isSignedIn || !clerkUser) {
        setSupabaseUser(null);
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('clerk_id', clerkUser.id)
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            // User not found, this is expected for new users
            setSupabaseUser(null);
          } else {
            throw error;
          }
        } else {
          setSupabaseUser(data);
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch user data');
      } finally {
        setLoading(false);
      }
    }

    fetchSupabaseUser();
  }, [clerkUser, isLoaded, isSignedIn]);

  const updateUserProfile = async (updates: Partial<User>) => {
    if (!clerkUser || !supabaseUser) return false;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('clerk_id', clerkUser.id)
        .select()
        .single();

      if (error) throw error;

      setSupabaseUser(data);
      return true;
    } catch (err) {
      console.error('Error updating user profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      return false;
    }
  };

  const isAdmin = supabaseUser?.role === 'admin';
  const isModerator = supabaseUser?.role === 'moderator' || isAdmin;

  return {
    // Clerk user data
    clerkUser,
    isSignedIn,
    isLoaded,
    
    // Supabase user data
    user: supabaseUser,
    loading,
    error,
    
    // User permissions
    isAdmin,
    isModerator,
    
    // Actions
    updateUserProfile,
  };
}
```

**Verification:** 
- File created with complete user management logic
- Clerk and Supabase integration working
- Permission checking methods included

### Task 2: Create Channels Data Hook ⏳
Create a hook for fetching and managing channel data.

**File to Create:** `lib/hooks/useChannels.ts`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Channel } from '@/lib/types';

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchChannels() {
      try {
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const { data, error } = await supabase
          .from('channels')
          .select('*')
          .eq('is_active', true)
          .order('name');

        if (error) throw error;

        setChannels(data || []);
      } catch (err) {
        console.error('Error fetching channels:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch channels');
      } finally {
        setLoading(false);
      }
    }

    fetchChannels();
  }, []);

  const getChannelBySlug = (slug: string): Channel | undefined => {
    return channels.find(channel => channel.slug === slug);
  };

  const getChannelById = (id: string): Channel | undefined => {
    return channels.find(channel => channel.id === id);
  };

  const refreshChannels = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setChannels(data || []);
    } catch (err) {
      console.error('Error refreshing channels:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh channels');
    } finally {
      setLoading(false);
    }
  };

  return {
    channels,
    loading,
    error,
    getChannelBySlug,
    getChannelById,
    refreshChannels,
  };
}
```

**Verification:** 
- File created with channel management logic
- Data fetching and caching implemented
- Helper methods for finding channels included

### Task 3: Create Real-time Chat Hook ⏳
Create a hook for managing real-time chat functionality.

**File to Create:** `lib/hooks/useChat.ts`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from './useUser';
import type { ChatMessage } from '@/lib/types';

interface UseChatOptions {
  videoId: string;
  limit?: number;
}

export function useChat({ videoId, limit = 50 }: UseChatOptions) {
  const { user, clerkUser } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  // Fetch initial messages
  useEffect(() => {
    async function fetchMessages() {
      try {
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const { data, error } = await supabase
          .from('chat_messages')
          .select(`
            *,
            user:users(id, username, avatar_url, role)
          `)
          .eq('video_id', videoId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;

        // Reverse to show oldest first
        setMessages((data || []).reverse());
      } catch (err) {
        console.error('Error fetching chat messages:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chat messages');
      } finally {
        setLoading(false);
      }
    }

    if (videoId) {
      fetchMessages();
    }
  }, [videoId, limit]);

  // Setup real-time subscription
  useEffect(() => {
    if (!videoId) return;

    const supabase = createClient();
    
    const subscription = supabase
      .channel(`chat_${videoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `video_id=eq.${videoId}`,
        },
        async (payload) => {
          // Fetch the complete message with user data
          const { data, error } = await supabase
            .from('chat_messages')
            .select(`
              *,
              user:users(id, username, avatar_url, role)
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && data) {
            setMessages(prev => [...prev, data]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `video_id=eq.${videoId}`,
        },
        (payload) => {
          setMessages(prev =>
            prev.map(msg =>
              msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
            )
          );
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [videoId]);

  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!user || !clerkUser || !content.trim()) return false;

    setSending(true);
    try {
      const supabase = createClient();
      
      // Check if message is a command
      const isCommand = content.startsWith('!');
      const commandType = isCommand ? content.split(' ')[0].substring(1) : null;

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          video_id: videoId,
          user_id: user.id,
          message: content.trim(),
          is_command: isCommand,
          command_type: commandType,
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      return false;
    } finally {
      setSending(false);
    }
  }, [user, clerkUser, videoId]);

  const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('user_id', user.id); // Users can only delete their own messages

      if (error) throw error;
      
      // Remove from local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      return true;
    } catch (err) {
      console.error('Error deleting message:', err);
      return false;
    }
  }, [user]);

  return {
    messages,
    loading,
    error,
    sending,
    sendMessage,
    deleteMessage,
    canSendMessages: !!user,
  };
}
```

**Verification:** 
- File created with real-time chat functionality
- Message sending and receiving implemented
- Command detection included

### Task 4: Create Video Data Hook ⏳
Create a hook for managing video content and metadata.

**File to Create:** `lib/hooks/useVideos.ts`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Video } from '@/lib/types';

interface UseVideosOptions {
  channelId?: string;
  featured?: boolean;
  limit?: number;
}

export function useVideos(options: UseVideosOptions = {}) {
  const { channelId, featured, limit = 20 } = options;
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

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

      if (channelId) {
        query = query.eq('channel_id', channelId);
      }

      if (featured !== undefined) {
        query = query.eq('is_featured', featured);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      setVideos(data || []);
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch videos');
    } finally {
      setLoading(false);
    }
  }, [channelId, featured, limit]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const getVideoById = useCallback(async (id: string): Promise<Video | null> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          channel:channels(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching video:', err);
      return null;
    }
  }, []);

  const incrementViewCount = useCallback(async (videoId: string): Promise<void> => {
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc('increment_view_count', {
        video_uuid: videoId
      });

      if (error) throw error;

      // Update local state
      setVideos(prev =>
        prev.map(video =>
          video.id === videoId
            ? { ...video, view_count: video.view_count + 1 }
            : video
        )
      );
    } catch (err) {
      console.error('Error incrementing view count:', err);
    }
  }, []);

  const searchVideos = useCallback(async (query: string): Promise<Video[]> => {
    if (!query.trim()) return [];

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('videos')
        .select(`
          *,
          channel:channels(*)
        `)
        .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
        .not('published_at', 'is', null)
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error searching videos:', err);
      return [];
    }
  }, []);

  return {
    videos,
    loading,
    error,
    refetch: fetchVideos,
    getVideoById,
    incrementViewCount,
    searchVideos,
  };
}

// Hook for single video
export function useVideo(videoId: string) {
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideo() {
      if (!videoId) return;

      try {
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const { data, error } = await supabase
          .from('videos')
          .select(`
            *,
            channel:channels(*)
          `)
          .eq('id', videoId)
          .single();

        if (error) throw error;
        setVideo(data);
      } catch (err) {
        console.error('Error fetching video:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch video');
      } finally {
        setLoading(false);
      }
    }

    fetchVideo();
  }, [videoId]);

  return { video, loading, error };
}
```

**Verification:** 
- File created with video management logic
- Search functionality implemented
- View count tracking included

### Task 5: Create Analytics Hook ⏳
Create a hook for managing analytics data and real-time metrics.

**File to Create:** `lib/hooks/useAnalytics.ts`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Analytics } from '@/lib/types';

interface UseAnalyticsOptions {
  videoId?: string;
  timeBucket?: '5min' | 'hour' | 'day';
  limit?: number;
}

export function useAnalytics(options: UseAnalyticsOptions = {}) {
  const { videoId, timeBucket = 'hour', limit = 24 } = options;
  const [analytics, setAnalytics] = useState<Analytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      let query = supabase
        .from('analytics')
        .select('*')
        .eq('time_bucket', timeBucket)
        .order('timestamp', { ascending: true });

      if (videoId) {
        query = query.eq('video_id', videoId);
      }

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      setAnalytics(data || []);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [videoId, timeBucket, limit]);

  useEffect(() => {
    fetchAnalytics();

    // Set up polling for real-time updates
    const interval = setInterval(fetchAnalytics, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [fetchAnalytics]);

  const getTotalViewers = useCallback((): number => {
    return analytics.reduce((sum, record) => sum + record.viewer_count, 0);
  }, [analytics]);

  const getAverageEngagement = useCallback((): number => {
    if (analytics.length === 0) return 0;
    const total = analytics.reduce((sum, record) => sum + record.engagement_rate, 0);
    return total / analytics.length;
  }, [analytics]);

  const getCurrentViewers = useCallback((): number => {
    if (analytics.length === 0) return 0;
    return analytics[analytics.length - 1]?.viewer_count || 0;
  }, [analytics]);

  return {
    analytics,
    loading,
    error,
    refetch: fetchAnalytics,
    getTotalViewers,
    getAverageEngagement,
    getCurrentViewers,
  };
}

// Hook for real-time viewer count
export function useViewerCount(videoId: string) {
  const [viewerCount, setViewerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!videoId) return;

    const supabase = createClient();

    // Initial fetch
    const fetchInitialCount = async () => {
      try {
        const { data, error } = await supabase
          .from('analytics')
          .select('viewer_count')
          .eq('video_id', videoId)
          .eq('time_bucket', '5min')
          .order('timestamp', { ascending: false })
          .limit(1)
          .single();

        if (!error && data) {
          setViewerCount(data.viewer_count);
        }
      } catch (err) {
        console.error('Error fetching initial viewer count:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialCount();

    // Real-time subscription
    const subscription = supabase
      .channel(`analytics_${videoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'analytics',
          filter: `video_id=eq.${videoId}`,
        },
        (payload) => {
          if (payload.new.time_bucket === '5min') {
            setViewerCount(payload.new.viewer_count);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'analytics',
          filter: `video_id=eq.${videoId}`,
        },
        (payload) => {
          if (payload.new.time_bucket === '5min') {
            setViewerCount(payload.new.viewer_count);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [videoId]);

  return { viewerCount, loading };
}
```

**Verification:** 
- File created with analytics functionality
- Real-time viewer count tracking implemented
- Aggregation methods included

### Task 6: Create Interactions Hook ⏳
Create a hook for managing user interactions like polls, reactions, and ratings.

**File to Create:** `lib/hooks/useInteractions.ts`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from './useUser';
import type { Interaction, Poll } from '@/lib/types';

interface UseInteractionsOptions {
  videoId: string;
}

export function useInteractions({ videoId }: UseInteractionsOptions) {
  const { user } = useUser();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch interactions
  useEffect(() => {
    async function fetchInteractions() {
      if (!videoId) return;

      try {
        setLoading(true);
        setError(null);

        const supabase = createClient();
        const { data, error } = await supabase
          .from('interactions')
          .select(`
            *,
            user:users(id, username, avatar_url)
          `)
          .eq('video_id', videoId)
          .order('created_at', { ascending: false })
          .limit(100);

        if (error) throw error;
        setInteractions(data || []);
      } catch (err) {
        console.error('Error fetching interactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch interactions');
      } finally {
        setLoading(false);
      }
    }

    fetchInteractions();
  }, [videoId]);

  // Real-time subscription for new interactions
  useEffect(() => {
    if (!videoId) return;

    const supabase = createClient();
    
    const subscription = supabase
      .channel(`interactions_${videoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'interactions',
          filter: `video_id=eq.${videoId}`,
        },
        async (payload) => {
          // Fetch complete interaction with user data
          const { data, error } = await supabase
            .from('interactions')
            .select(`
              *,
              user:users(id, username, avatar_url)
            `)
            .eq('id', payload.new.id)
            .single();

          if (!error && data) {
            setInteractions(prev => [data, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [videoId]);

  const createInteraction = useCallback(async (
    type: Interaction['type'],
    data: Record<string, any>,
    timestampInVideo?: number
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('interactions')
        .insert({
          video_id: videoId,
          user_id: user.id,
          type,
          data,
          timestamp_in_video: timestampInVideo,
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error creating interaction:', err);
      setError(err instanceof Error ? err.message : 'Failed to create interaction');
      return false;
    }
  }, [user, videoId]);

  const addReaction = useCallback(async (emoji: string, timestampInVideo?: number): Promise<boolean> => {
    return createInteraction('reaction', { emoji }, timestampInVideo);
  }, [createInteraction]);

  const addRating = useCallback(async (rating: number, timestampInVideo?: number): Promise<boolean> => {
    if (rating < 1 || rating > 5) return false;
    return createInteraction('rating', { rating }, timestampInVideo);
  }, [createInteraction]);

  const addBookmark = useCallback(async (timestampInVideo?: number): Promise<boolean> => {
    return createInteraction('bookmark', { timestamp: timestampInVideo }, timestampInVideo);
  }, [createInteraction]);

  // Get interactions by type
  const getInteractionsByType = useCallback((type: Interaction['type']): Interaction[] => {
    return interactions.filter(interaction => interaction.type === type);
  }, [interactions]);

  // Get reaction counts
  const getReactionCounts = useCallback((): Record<string, number> => {
    const reactions = getInteractionsByType('reaction');
    const counts: Record<string, number> = {};
    
    reactions.forEach(reaction => {
      const emoji = reaction.data.emoji;
      counts[emoji] = (counts[emoji] || 0) + 1;
    });
    
    return counts;
  }, [getInteractionsByType]);

  // Get average rating
  const getAverageRating = useCallback((): number => {
    const ratings = getInteractionsByType('rating');
    if (ratings.length === 0) return 0;
    
    const sum = ratings.reduce((total, rating) => total + rating.data.rating, 0);
    return sum / ratings.length;
  }, [getInteractionsByType]);

  return {
    interactions,
    loading,
    error,
    createInteraction,
    addReaction,
    addRating,
    addBookmark,
    getInteractionsByType,
    getReactionCounts,
    getAverageRating,
  };
}

// Hook for managing polls
export function usePolls(videoId: string) {
  const { user } = useUser();
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPolls() {
      if (!videoId) return;

      try {
        setLoading(true);
        const supabase = createClient();
        const { data, error } = await supabase
          .from('polls')
          .select('*')
          .eq('video_id', videoId)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setPolls(data || []);
      } catch (err) {
        console.error('Error fetching polls:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch polls');
      } finally {
        setLoading(false);
      }
    }

    fetchPolls();
  }, [videoId]);

  const votePoll = useCallback(async (pollId: string, optionId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const supabase = createClient();
      
      // Record the vote as an interaction
      const { error } = await supabase
        .from('interactions')
        .insert({
          video_id: videoId,
          user_id: user.id,
          type: 'poll',
          data: { poll_id: pollId, option_id: optionId },
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error voting on poll:', err);
      return false;
    }
  }, [user, videoId]);

  const getActivePoll = useCallback((): Poll | null => {
    return polls.find(poll => poll.is_active) || null;
  }, [polls]);

  return {
    polls,
    loading,
    error,
    votePoll,
    getActivePoll,
  };
}
```

**Verification:** 
- File created with interaction management logic
- Real-time updates implemented
- Poll voting functionality included

## Task Completion Checklist
Mark each task as complete when finished:

- [ ] Task 1: User management hook created ✅
- [ ] Task 2: Channels data hook created ✅  
- [ ] Task 3: Real-time chat hook created ✅
- [ ] Task 4: Video data hook created ✅
- [ ] Task 5: Analytics hook created ✅
- [ ] Task 6: Interactions hook created ✅

## Verification Steps
After completing all tasks:

1. Check all hook files exist:
   ```bash
   ls -la lib/hooks/
   ```

2. Test TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```

3. Verify imports work correctly:
   ```bash
   npm run dev
   ```

## Success Criteria
- All 6 custom hooks created successfully
- TypeScript compilation succeeds without errors
- Real-time subscriptions properly configured
- Error handling implemented in all hooks
- User authentication state managed correctly
- Data fetching and caching logic working

## Important Notes
- Hooks use Supabase real-time subscriptions for live features
- User authentication integrates Clerk with Supabase
- Error handling provides user-friendly messages
- All hooks follow React best practices with proper cleanup
- TypeScript types ensure type safety across components

## Troubleshooting
If you encounter issues:
1. Verify Supabase client configuration is correct
2. Check that database tables and RLS policies are set up
3. Ensure environment variables are properly configured
4. Test database connectivity with the test API route

## Next Step
After completing this step and marking all tasks ✅, proceed to Step 17: Create Core UI Components.