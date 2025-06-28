'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ChatMessage } from '@/lib/types';

interface UseChatOptions {
  channelId?: string;
  contentId?: string;
  limit?: number;
}

export function useChat(options: UseChatOptions = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const supabase = createClient();
  
  if (!supabase) {
    throw new Error('Supabase client not configured');
  }

  // Fetch chat messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.channelId) params.append('channel_id', options.channelId);
      if (options.contentId) params.append('content_id', options.contentId);
      if (options.limit) params.append('limit', options.limit.toString());

      const response = await fetch(`/api/chat?${params}`);
      const result = await response.json();

      if (result.success) {
        setMessages(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch messages');
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [options.channelId, options.contentId, options.limit]);

  // Send new message
  const sendMessage = useCallback(async (userId: string, message: string, metadata = {}) => {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          message,
          channel_id: options.channelId,
          content_id: options.contentId,
          metadata
        })
      });

      const result = await response.json();

      if (result.success) {
        // The real-time subscription will handle adding the message to the list
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      throw err;
    }
  }, [options.channelId, options.contentId]);

  // Pin/unpin message
  const togglePinMessage = useCallback(async (messageId: string, pinned: boolean) => {
    try {
      const response = await fetch(`/api/chat/${messageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_pinned: pinned })
      });

      const result = await response.json();

      if (result.success) {
        await fetchMessages(); // Refresh the list
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to update message');
      }
    } catch (err) {
      console.error('Error updating message:', err);
      throw err;
    }
  }, [fetchMessages]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const response = await fetch(`/api/chat/${messageId}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        // The real-time subscription will handle removing the message from the list
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to delete message');
      }
    } catch (err) {
      console.error('Error deleting message:', err);
      throw err;
    }
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    let chatChannel: any;

    const setupRealtimeSubscription = () => {
      const channelName = `chat-${options.channelId || options.contentId || 'global'}`;
      
      chatChannel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'chat_messages',
            filter: options.channelId ? `channel_id=eq.${options.channelId}` : options.contentId ? `content_id=eq.${options.contentId}` : undefined
          },
          (payload) => {
            console.log('New message received:', payload);
            const newMessage = payload.new as ChatMessage;
            setMessages(prev => [newMessage, ...prev]);
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'chat_messages',
            filter: options.channelId ? `channel_id=eq.${options.channelId}` : options.contentId ? `content_id=eq.${options.contentId}` : undefined
          },
          (payload) => {
            console.log('Message updated:', payload);
            const updatedMessage = payload.new as ChatMessage;
            setMessages(prev => prev.map(msg => msg.id === updatedMessage.id ? updatedMessage : msg));
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'chat_messages'
          },
          (payload) => {
            console.log('Message deleted:', payload);
            const deletedMessage = payload.old as ChatMessage;
            setMessages(prev => prev.filter(msg => msg.id !== deletedMessage.id));
          }
        )
        .subscribe((status) => {
          console.log('Chat subscription status:', status);
          setIsConnected(status === 'SUBSCRIBED');
        });
    };

    setupRealtimeSubscription();

    return () => {
      if (chatChannel) {
        supabase.removeChannel(chatChannel);
        setIsConnected(false);
      }
    };
  }, [supabase, options.channelId, options.contentId]);

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    loading,
    error,
    isConnected,
    sendMessage,
    togglePinMessage,
    deleteMessage,
    refetch: fetchMessages
  };
}