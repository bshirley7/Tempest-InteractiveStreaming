'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase/client';
import { Plus, Video, Trash2, Save } from 'lucide-react';
import { toast } from 'sonner';

interface Content {
  id: string;
  title: string;
  cloudflare_video_id: string;
  thumbnail_url: string | null;
}

interface Channel {
  id: string;
  name: string;
}

interface ContentChannel {
  content_id: string;
  channel_id: string;
  content?: Content;
  channels?: Channel;
}

export function SimpleChannelManager() {
  const [content, setContent] = useState<Content[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [contentChannels, setContentChannels] = useState<ContentChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<string>('');
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [contentResult, channelsResult, contentChannelsResult] = await Promise.all([
        supabase.from('content').select('id, title, cloudflare_video_id, thumbnail_url').order('title'),
        supabase.from('channels').select('id, name').order('name'),
        supabase.from('content_channels').select(`
          content_id,
          channel_id,
          content:content_id(id, title, cloudflare_video_id, thumbnail_url),
          channels:channel_id(id, name)
        `)
      ]);

      if (contentResult.error) throw contentResult.error;
      if (channelsResult.error) throw channelsResult.error;
      if (contentChannelsResult.error) throw contentChannelsResult.error;

      setContent(contentResult.data || []);
      setChannels(channelsResult.data || []);
      setContentChannels(contentChannelsResult.data || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const assignContentToChannel = async () => {
    if (!selectedContent || !selectedChannel) {
      toast.error('Please select both content and channel');
      return;
    }

    try {
      // Check if assignment already exists
      const existing = contentChannels.find(
        cc => cc.content_id === selectedContent && cc.channel_id === selectedChannel
      );

      if (existing) {
        toast.error('This content is already assigned to this channel');
        return;
      }

      // Use API to create assignment (bypasses RLS issues)
      const response = await fetch('/api/content-channels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_id: selectedContent,
          channel_id: selectedChannel,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Assignment failed:', data);
        throw new Error(data.error || 'Failed to assign content to channel');
      }

      toast.success('Content assigned to channel successfully');
      setSelectedContent('');
      setSelectedChannel('');
      setIsAssignDialogOpen(false);
      fetchData(); // Refresh data
      
    } catch (error) {
      console.error('Error assigning content:', error);
      toast.error('Failed to assign content to channel');
    }
  };

  const removeAssignment = async (contentId: string, channelId: string) => {
    try {
      const response = await fetch('/api/content-channels', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content_id: contentId,
          channel_id: channelId,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Remove assignment failed:', data);
        throw new Error(data.error || 'Failed to remove assignment');
      }

      toast.success('Assignment removed successfully');
      fetchData(); // Refresh data
      
    } catch (error) {
      console.error('Error removing assignment:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to remove assignment');
    }
  };

  const getContentByChannel = () => {
    const grouped = channels.map(channel => ({
      channel,
      assignments: contentChannels.filter(cc => cc.channel_id === channel.id)
    }));
    return grouped;
  };

  const unassignedContent = content.filter(
    c => !contentChannels.some(cc => cc.content_id === c.id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Simple Channel Manager</h2>
          <p className="text-muted-foreground">Easily assign videos to channels</p>
        </div>
        
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Assign Content
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Content to Channel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Content</label>
                <Select value={selectedContent} onValueChange={setSelectedContent}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose content..." />
                  </SelectTrigger>
                  <SelectContent>
                    {content.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Select Channel</label>
                <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose channel..." />
                  </SelectTrigger>
                  <SelectContent>
                    {channels.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>
                        {channel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={assignContentToChannel}>
                  <Save className="h-4 w-4 mr-2" />
                  Assign
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Unassigned Content */}
      {unassignedContent.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Video className="h-5 w-5 mr-2" />
              Unassigned Content ({unassignedContent.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unassignedContent.map((item) => (
                <div key={item.id} className="border rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    {item.thumbnail_url && (
                      <img
                        src={item.thumbnail_url}
                        alt={item.title}
                        className="w-16 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{item.title}</p>
                      <Badge variant="outline" className="text-xs">Unassigned</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Content by Channel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {getContentByChannel().map(({ channel, assignments }) => (
          <Card key={channel.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{channel.name}</span>
                <Badge variant="secondary">{assignments.length} videos</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <p className="text-muted-foreground text-sm">No content assigned</p>
              ) : (
                <div className="space-y-3">
                  {assignments.map((assignment) => (
                    <div key={`${assignment.content_id}-${assignment.channel_id}`} className="flex items-center space-x-3 p-2 border rounded">
                      {assignment.content?.thumbnail_url && (
                        <img
                          src={assignment.content.thumbnail_url}
                          alt={assignment.content?.title}
                          className="w-12 h-8 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {assignment.content?.title}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeAssignment(assignment.content_id, assignment.channel_id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}