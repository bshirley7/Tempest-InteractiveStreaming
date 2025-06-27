'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Loader2, Video, Tv, CheckCircle, AlertCircle, Search, X } from 'lucide-react';
import { toast } from 'sonner';

interface ContentItem {
  id: string;
  title: string;
  content_type: 'content' | 'advertisement';
  duration?: number;
  cloudflare_video_id: string;
  is_published: boolean;
  created_at: string;
}

export function ContentTypeManager() {
  const [content, setContent] = useState<ContentItem[]>([]);
  const [filteredContent, setFilteredContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'content' | 'advertisement'>('all');

  const fetchContent = async () => {
    try {
      setLoading(true);
      // Fetch all content regardless of type
      const response = await fetch('/api/content?limit=100&content_type=all');
      
      if (!response.ok) {
        throw new Error('Failed to fetch content');
      }

      const result = await response.json();
      if (result.success) {
        setContent(result.data || []);
        setFilteredContent(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  // Filter content based on search query and type filter
  useEffect(() => {
    let filtered = content;

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.content_type === typeFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.cloudflare_video_id.toLowerCase().includes(query)
      );
    }

    setFilteredContent(filtered);
  }, [content, searchQuery, typeFilter]);

  const updateContentType = async (contentId: string, newType: 'content' | 'advertisement') => {
    try {
      setUpdating(contentId);
      
      const response = await fetch('/api/content', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: contentId,
          content_type: newType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update content type');
      }

      const result = await response.json();
      if (result.success) {
        // Update local state
        setContent(prev => 
          prev.map(item => 
            item.id === contentId 
              ? { ...item, content_type: newType }
              : item
          )
        );
        
        toast.success(`Content marked as ${newType === 'advertisement' ? 'advertisement' : 'content'}`);
      }
    } catch (error) {
      console.error('Error updating content type:', error);
      toast.error('Failed to update content type');
    } finally {
      setUpdating(null);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'Unknown';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading content...</span>
      </div>
    );
  }

  const contentVideos = content.filter(item => item.content_type === 'content');
  const adVideos = content.filter(item => item.content_type === 'advertisement');
  
  const clearSearch = () => {
    setSearchQuery('');
    setTypeFilter('all');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Content Type Manager</h2>
        <p className="text-muted-foreground">
          Manage whether videos are educational content or advertisements
        </p>
      </div>

      {/* Search and Filter Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by title or video ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <Select value={typeFilter} onValueChange={(value: 'all' | 'content' | 'advertisement') => setTypeFilter(value)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Content</SelectItem>
                <SelectItem value="content">Content Only</SelectItem>
                <SelectItem value="advertisement">Advertisements Only</SelectItem>
              </SelectContent>
            </Select>
            
            {(searchQuery || typeFilter !== 'all') && (
              <Button variant="outline" onClick={clearSearch}>
                Clear Filters
              </Button>
            )}
          </div>
          
          {/* Search Results Info */}
          {(searchQuery || typeFilter !== 'all') && (
            <div className="mt-4 text-sm text-muted-foreground">
              Showing {filteredContent.length} of {content.length} videos
              {searchQuery && ` matching "${searchQuery}"`}
              {typeFilter !== 'all' && ` (${typeFilter} only)`}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Video className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{contentVideos.length}</p>
                <p className="text-sm text-muted-foreground">Content</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <Tv className="h-8 w-8 text-purple-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{adVideos.length}</p>
                <p className="text-sm text-muted-foreground">Advertisements</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold">{content.length}</p>
                <p className="text-sm text-muted-foreground">Total Videos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content List */}
      <Card>
        <CardHeader>
          <CardTitle>All Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredContent.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{item.title}</h3>
                    <Badge variant={item.content_type === 'advertisement' ? 'default' : 'secondary'}>
                      {item.content_type === 'advertisement' ? 'Ad' : 'Content'}
                    </Badge>
                    {!item.is_published && (
                      <Badge variant="outline">Draft</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Duration: {formatDuration(item.duration)}</span>
                    <span>ID: {item.cloudflare_video_id.substring(0, 8)}...</span>
                    <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Select
                    value={item.content_type}
                    onValueChange={(value: 'content' | 'advertisement') => 
                      updateContentType(item.id, value)
                    }
                    disabled={updating === item.id}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="advertisement">Advertisement</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {updating === item.id && (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  )}
                </div>
              </div>
            ))}
            
            {filteredContent.length === 0 && content.length > 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No content matches your search criteria.</p>
                <Button variant="outline" onClick={clearSearch} className="mt-2">
                  Clear Filters
                </Button>
              </div>
            )}
            
            {content.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No content found. Upload some videos first.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}