'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Interaction } from '@/lib/types';

interface UseInteractionsOptions {
  channelId?: string;
  contentId?: string;
  type?: string;
  isActive?: boolean;
}

interface InteractionResponse {
  id: string;
  interaction_id: string;
  user_id: string;
  response: string;
  response_data: Record<string, any>;
  is_correct: boolean | null;
  created_at: string;
}

export function useInteractions(options: UseInteractionsOptions = {}) {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  
  if (!supabase) {
    throw new Error('Supabase client not configured');
  }

  // Fetch interactions
  const fetchInteractions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (options.channelId) params.append('channel_id', options.channelId);
      if (options.contentId) params.append('content_id', options.contentId);
      if (options.type) params.append('type', options.type);
      if (options.isActive !== undefined) params.append('is_active', options.isActive.toString());

      const response = await fetch(`/api/interactions?${params}`);
      const result = await response.json();

      if (result.success) {
        setInteractions(result.data || []);
      } else {
        setError(result.error || 'Failed to fetch interactions');
      }
    } catch (err) {
      console.error('Error fetching interactions:', err);
      setError('Failed to fetch interactions');
    } finally {
      setLoading(false);
    }
  }, [options.channelId, options.contentId, options.type, options.isActive]);

  // Create new interaction
  const createInteraction = useCallback(async (interactionData: Partial<Interaction>) => {
    try {
      const response = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(interactionData)
      });

      const result = await response.json();

      if (result.success) {
        await fetchInteractions(); // Refresh the list
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to create interaction');
      }
    } catch (err) {
      console.error('Error creating interaction:', err);
      throw err;
    }
  }, [fetchInteractions]);

  // Update interaction
  const updateInteraction = useCallback(async (id: string, updates: Partial<Interaction>) => {
    try {
      const response = await fetch(`/api/interactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      const result = await response.json();

      if (result.success) {
        await fetchInteractions(); // Refresh the list
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to update interaction');
      }
    } catch (err) {
      console.error('Error updating interaction:', err);
      throw err;
    }
  }, [fetchInteractions]);

  // Delete interaction
  const deleteInteraction = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/interactions/${id}`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        await fetchInteractions(); // Refresh the list
      } else {
        throw new Error(result.error || 'Failed to delete interaction');
      }
    } catch (err) {
      console.error('Error deleting interaction:', err);
      throw err;
    }
  }, [fetchInteractions]);

  // Submit response to interaction
  const submitResponse = useCallback(async (interactionId: string, userId: string, response: string, responseData = {}) => {
    try {
      const apiResponse = await fetch(`/api/interactions/${interactionId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          response,
          response_data: responseData
        })
      });

      const result = await apiResponse.json();

      if (result.success) {
        await fetchInteractions(); // Refresh to get updated stats
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to submit response');
      }
    } catch (err) {
      console.error('Error submitting response:', err);
      throw err;
    }
  }, [fetchInteractions]);

  // Set up real-time subscriptions
  useEffect(() => {
    let interactionChannel: any;

    const setupRealtimeSubscription = () => {
      // Subscribe to interactions table changes
      interactionChannel = supabase
        .channel('interactions-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'interactions',
            filter: options.channelId ? `channel_id=eq.${options.channelId}` : undefined
          },
          (payload) => {
            console.log('Interaction change received:', payload);
            fetchInteractions(); // Refresh data when changes occur
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'interaction_responses'
          },
          (payload) => {
            console.log('Interaction response change received:', payload);
            fetchInteractions(); // Refresh data when responses change
          }
        )
        .subscribe();
    };

    setupRealtimeSubscription();

    return () => {
      if (interactionChannel) {
        supabase.removeChannel(interactionChannel);
      }
    };
  }, [supabase, options.channelId, fetchInteractions]);

  // Initial fetch
  useEffect(() => {
    fetchInteractions();
  }, [fetchInteractions]);

  return {
    interactions,
    loading,
    error,
    createInteraction,
    updateInteraction,
    deleteInteraction,
    submitResponse,
    refetch: fetchInteractions
  };
}