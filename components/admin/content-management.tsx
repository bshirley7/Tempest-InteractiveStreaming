'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase/client';
import { useStreamVideos, useStreamUpload } from '@/hooks/use-cloudflare-stream';
import { Plus, Edit, Trash2, Video, Upload, Eye, Star, Clock, Play, FileVideo, Search, Filter, Grid, List, MoreVertical, ExternalLink, FolderSync as Sync, RefreshCw, Link, CheckCircle, AlertCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Content {
  id: string;
  title: string;
  description: string | null;
  cloudflare_video_id: string;
  thumbnail_url: string | null;
  thumbnail_source: string | null;
  thumbnail_metadata: any;
  duration: number | null;
  category: string | null;
  genre: string | null;
  keywords: string[];
  language: string;
  instructor: string | null;
  difficulty_level: string;
  target_audience: string | null;
  learning_objectives: string[];
  prerequisites: string[];
  tags: string[];
  is_featured: boolean;
  is_published: boolean;
  sync_status: string | null;
  last_synced_at: string | null;
  stream_metadata: any;
  metadata: any;
  created_at: string;
  updated_at: string;
  channels?: {
    name: string;
  };
  content_channels?: Array<{
    channel_id: string;
    channels?: {
      id: string;
      name: string;
    };
  }>;
}

interface Channel {
  id: string;
  name: string;
}

interface StreamVideo {
  uid: string;
  thumbnail: string;
  readyToStream: boolean;
  status: {
    state: string;
    pctComplete: string;
  };
  meta: {
    name: string;
    [key: string]: any;
  };
  duration: number;
  playback: {
    hls: string;
    dash: string;
  };
  created: string;
  modified: string;
  size: number;
}

export function ContentManagement() {
  const [content, setContent] = useState<Content[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null);
  const [selectedMetadataFile, setSelectedMetadataFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>('');
  // Removed customCategories and customGenres - now using database
  const [newCategory, setNewCategory] = useState('');
  const [newGenre, setNewGenre] = useState('');
  const [activeTab, setActiveTab] = useState('content-library');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    channel_ids: [] as string[], // Changed to array for multiple channels
    category: '',
    genre: '',
    keywords: '',
    language: 'English',
    instructor: '',
    difficulty_level: 'Beginner',
    target_audience: '',
    learning_objectives: '',
    prerequisites: '',
    tags: '',
    thumbnail_url: '',
    thumbnail_source: 'url',
    is_featured: false,
    is_published: false
  });

  // Use the Cloudflare Stream hook
  const { videos: streamVideos, loading: streamLoading, error: streamError, refetch: refetchStreamVideos } = useStreamVideos({
    autoRefresh: false,
    refreshInterval: 30000
  });
  const { uploading, progress, uploadFile } = useStreamUpload();

  const [categories, setCategories] = useState<string[]>([]);
  const [genres, setGenres] = useState<string[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingGenres, setLoadingGenres] = useState(true);

  const difficultyLevels = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Expert'
  ];

  useEffect(() => {
    fetchContent();
    fetchChannels();
    fetchCategories();
    fetchGenres();
    
    // Log component initialization
    console.log('Content Management initialized');
    console.log('Supabase available:', !!supabase);
    console.log('Stream videos loading:', streamLoading);
    console.log('Stream error:', streamError);
  }, []);

  // Log stream videos when they change
  useEffect(() => {
    console.log('Stream videos updated:', {
      count: streamVideos?.length || 0,
      videos: streamVideos,
      loading: streamLoading,
      error: streamError
    });
  }, [streamVideos, streamLoading, streamError]);

  const fetchContent = async () => {
    try {
      if (!supabase) {
        console.warn('Supabase not available, using mock data');
        setContent([]);
        setLoading(false);
        return;
      }

      console.log('Fetching content from Supabase...');
      const { data, error } = await supabase
        .from('content')
        .select(`
          *,
          content_channels!left (
            channel_id,
            channels (
              id,
              name
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      console.log('Content fetched successfully:', data?.length || 0, 'items');
      // Log first item to see structure
      if (data && data.length > 0) {
        console.log('First content item structure:', data[0]);
        console.log('Content channels:', data[0].content_channels);
      }
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      toast.error('Failed to load content');
      setContent([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      if (!supabase) {
        console.warn('Supabase not available for channels');
        setChannels([]);
        return;
      }

      const { data, error } = await supabase
        .from('channels')
        .select('id, name')
        .order('name');

      if (error) {
        console.error('Error fetching channels:', error);
        return;
      }
      
      setChannels(data || []);
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      if (!supabase) {
        setLoadingCategories(false);
        return;
      }

      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('is_default', { ascending: false }) // Show default categories first
        .order('name');

      if (error) {
        console.error('Error fetching categories:', error);
        return;
      }
      
      setCategories(data?.map(c => c.name) || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchGenres = async () => {
    try {
      if (!supabase) {
        setLoadingGenres(false);
        return;
      }

      const { data, error } = await supabase
        .from('genres')
        .select('name')
        .order('is_default', { ascending: false }) // Show default genres first
        .order('name');

      if (error) {
        console.error('Error fetching genres:', error);
        return;
      }
      
      setGenres(data?.map(g => g.name) || []);
    } catch (error) {
      console.error('Error fetching genres:', error);
    } finally {
      setLoadingGenres(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a video file');
        return;
      }
      
      // Validate file size (max 2GB)
      const maxSize = 2 * 1024 * 1024 * 1024; // 2GB
      if (file.size > maxSize) {
        toast.error('File size must be less than 2GB');
        return;
      }
      
      setSelectedFile(file);
      console.log('Video file selected:', file.name, file.size);
    }
  };

  const handleThumbnailSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Thumbnail must be less than 5MB');
      return;
    }

    setSelectedThumbnailFile(file);
    
    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setThumbnailPreview(previewUrl);
    setFormData(prev => ({ 
      ...prev, 
      thumbnail_url: previewUrl,
      thumbnail_source: 'upload'
    }));
    
    console.log('Thumbnail file selected:', file.name, file.size);
  };

  const handleMetadataSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('json') && !file.name.endsWith('.json')) {
      toast.error('Please select a JSON file');
      return;
    }

    // Validate file size (max 1MB)
    const maxSize = 1024 * 1024; // 1MB
    if (file.size > maxSize) {
      toast.error('Metadata file must be less than 1MB');
      return;
    }

    setSelectedMetadataFile(file);
    
    // Parse and apply metadata
    try {
      const text = await file.text();
      const parsedMetadata = JSON.parse(text);
      
      // Apply metadata to form
      setFormData(prev => ({
        ...prev,
        title: parsedMetadata.title || prev.title,
        description: parsedMetadata.description || prev.description,
        category: parsedMetadata.category || prev.category,
        genre: parsedMetadata.genre || prev.genre,
        keywords: Array.isArray(parsedMetadata.keywords) 
          ? parsedMetadata.keywords.join(', ')
          : parsedMetadata.keywords || prev.keywords,
        language: parsedMetadata.language || prev.language,
        instructor: parsedMetadata.author || parsedMetadata.instructor || prev.instructor,
        difficulty_level: parsedMetadata.difficulty_level || prev.difficulty_level,
        target_audience: parsedMetadata.target_audience || prev.target_audience,
        learning_objectives: Array.isArray(parsedMetadata.learning_objectives)
          ? parsedMetadata.learning_objectives.join(', ')
          : parsedMetadata.learning_objectives || prev.learning_objectives,
        prerequisites: Array.isArray(parsedMetadata.prerequisites)
          ? parsedMetadata.prerequisites.join(', ')
          : parsedMetadata.prerequisites || prev.prerequisites,
        tags: Array.isArray(parsedMetadata.tags)
          ? parsedMetadata.tags.join(', ')
          : parsedMetadata.tags || prev.tags,
        // Handle thumbnail from JSON
        thumbnail_url: parsedMetadata.thumbnail || parsedMetadata.thumbnail_url || prev.thumbnail_url,
      }));

      // Set thumbnail preview if provided in JSON
      if (parsedMetadata.thumbnail || parsedMetadata.thumbnail_url) {
        setThumbnailPreview(parsedMetadata.thumbnail || parsedMetadata.thumbnail_url);
        setFormData(prev => ({
          ...prev,
          thumbnail_source: 'url'
        }));
      }
      
      toast.success('Metadata imported successfully');
      console.log('Metadata file imported:', file.name, parsedMetadata);
    } catch (error) {
      console.error('Error parsing metadata file:', error);
      toast.error('Failed to parse metadata file. Please check the JSON format.');
    }
  };

  const addCustomCategory = async () => {
    if (!newCategory.trim() || categories.includes(newCategory)) {
      return;
    }

    try {
      if (!supabase) {
        toast.error('Database not configured');
        return;
      }

      const { error } = await supabase
        .from('categories')
        .insert({
          name: newCategory.trim(),
          description: `Custom category created by user`,
          is_default: false
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('Category already exists');
        } else {
          throw error;
        }
        return;
      }

      // Update local state
      setCategories(prev => [...prev, newCategory.trim()]);
      setFormData(prev => ({ ...prev, category: newCategory.trim() }));
      setNewCategory('');
      toast.success(`Category "${newCategory}" added and saved`);
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to save category');
    }
  };

  const addCustomGenre = async () => {
    if (!newGenre.trim() || genres.includes(newGenre)) {
      return;
    }

    try {
      if (!supabase) {
        toast.error('Database not configured');
        return;
      }

      const { error } = await supabase
        .from('genres')
        .insert({
          name: newGenre.trim(),
          description: `Custom genre created by user`,
          is_default: false
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          toast.error('Genre already exists');
        } else {
          throw error;
        }
        return;
      }

      // Update local state
      setGenres(prev => [...prev, newGenre.trim()]);
      setFormData(prev => ({ ...prev, genre: newGenre.trim() }));
      setNewGenre('');
      toast.success(`Genre "${newGenre}" added and saved`);
    } catch (error) {
      console.error('Error adding genre:', error);
      toast.error('Failed to save genre');
    }
  };

  const uploadThumbnail = async (): Promise<string | null> => {
    if (!selectedThumbnailFile) return null;

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedThumbnailFile);
      uploadFormData.append('type', 'thumbnail');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }

      const result = await response.json();
      
      if (result.success) {
        console.log('Thumbnail uploaded successfully:', result.url);
        return result.url;
      } else {
        throw new Error(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Thumbnail upload error:', error);
      toast.error(`Failed to upload thumbnail: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let cloudflareVideoId = editingContent?.cloudflare_video_id;
      let thumbnailUrl = formData.thumbnail_url;

      // Upload new video if file is selected
      if (selectedFile) {
        console.log('Starting video upload to Cloudflare Stream...');
        const uploadResult = await uploadFile(selectedFile, {
          name: formData.title || selectedFile.name,
        });
        cloudflareVideoId = uploadResult.uid as string;
        console.log('Video uploaded with ID:', cloudflareVideoId);
      }

      // Upload thumbnail if selected
      if (selectedThumbnailFile) {
        console.log('Uploading thumbnail...');
        const uploadedThumbnailUrl = await uploadThumbnail();
        if (uploadedThumbnailUrl) {
          thumbnailUrl = uploadedThumbnailUrl;
        }
      }

      if (!cloudflareVideoId) {
        toast.error('Video upload is required');
        return;
      }

      if (!supabase) {
        toast.error('Database not configured');
        return;
      }

      const contentData = {
        title: formData.title,
        description: formData.description || null,
        channel_id: formData.channel_ids.length > 0 ? formData.channel_ids[0] : null, // For backward compatibility, use first channel
        cloudflare_video_id: cloudflareVideoId,
        category: formData.category || null,
        genre: formData.genre || null,
        keywords: formData.keywords ? formData.keywords.split(',').map(k => k.trim()).filter(k => k) : [],
        language: formData.language,
        instructor: formData.instructor || null,
        difficulty_level: formData.difficulty_level,
        target_audience: formData.target_audience || null,
        learning_objectives: formData.learning_objectives ? formData.learning_objectives.split(',').map(o => o.trim()).filter(o => o) : [],
        prerequisites: formData.prerequisites ? formData.prerequisites.split(',').map(p => p.trim()).filter(p => p) : [],
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
        thumbnail_url: thumbnailUrl || null,
        thumbnail_source: formData.thumbnail_source,
        thumbnail_metadata: selectedThumbnailFile ? {
          fileName: selectedThumbnailFile.name,
          fileSize: selectedThumbnailFile.size,
          fileType: selectedThumbnailFile.type,
          uploadedAt: new Date().toISOString()
        } : null,
        is_featured: formData.is_featured,
        is_published: formData.is_published,
        sync_status: 'synced',
        last_synced_at: new Date().toISOString(),
        metadata: {
          originalFileName: selectedFile?.name,
          fileSize: selectedFile?.size,
          uploadedAt: new Date().toISOString()
        }
      };

      // Use API route for content creation/update to handle channel relationships properly
      console.log('Saving content and channel relationships via API...');
      
      const apiData = {
        ...contentData,
        channel_ids: formData.channel_ids
      };
      
      let response;
      if (editingContent) {
        // Update existing content
        response = await fetch('/api/content', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: editingContent.id,
            ...apiData,
            updated_at: new Date().toISOString()
          }),
        });
      } else {
        // Create new content
        response = await fetch('/api/content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(apiData),
        });
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save content');
      }
      
      const result = await response.json();
      console.log('Content and channels saved successfully:', result);
      toast.success(editingContent ? 'Content updated successfully' : 'Content created successfully');

      // Reset form and close dialog
      resetForm();
      setIsCreateDialogOpen(false);
      setEditingContent(null);
      fetchContent();
      
      // Refresh stream videos to show the new upload
      refetchStreamVideos();
    } catch (error) {
      console.error('Error saving content:', error);
      toast.error('Failed to save content');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      channel_ids: [],
      category: '',
      genre: '',
      keywords: '',
      language: 'English',
      instructor: '',
      difficulty_level: 'Beginner',
      target_audience: '',
      learning_objectives: '',
      prerequisites: '',
      tags: '',
      thumbnail_url: '',
      thumbnail_source: 'url',
      is_featured: false,
      is_published: false
    });
    setSelectedFile(null);
    setSelectedThumbnailFile(null);
    setSelectedMetadataFile(null);
    setThumbnailPreview('');
    setNewCategory('');
    setNewGenre('');
  };

  const handleEdit = (contentItem: Content) => {
    setEditingContent(contentItem);
    
    // Extract channel IDs from content_channels relationship
    const channelIds = contentItem.content_channels?.map(cc => cc.channel_id) || [];
    console.log('Loading content for edit:', {
      contentId: contentItem.id,
      title: contentItem.title,
      contentChannels: contentItem.content_channels,
      extractedChannelIds: channelIds
    });
    
    setFormData({
      title: contentItem.title,
      description: contentItem.description || '',
      channel_ids: channelIds,
      category: contentItem.category || '',
      genre: contentItem.genre || '',
      keywords: contentItem.keywords.join(', '),
      language: contentItem.language,
      instructor: contentItem.instructor || '',
      difficulty_level: contentItem.difficulty_level,
      target_audience: contentItem.target_audience || '',
      learning_objectives: contentItem.learning_objectives.join(', '),
      prerequisites: contentItem.prerequisites.join(', '),
      tags: contentItem.tags.join(', '),
      thumbnail_url: contentItem.thumbnail_url || '',
      thumbnail_source: contentItem.thumbnail_source || 'url',
      is_featured: contentItem.is_featured,
      is_published: contentItem.is_published
    });
    setThumbnailPreview(contentItem.thumbnail_url || '');
    setSelectedMetadataFile(null); // Clear any previously selected metadata file
    setNewCategory('');
    setNewGenre('');
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (contentId: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;

    try {
      if (!supabase) {
        toast.error('Database not configured');
        return;
      }

      const { error } = await supabase
        .from('content')
        .delete()
        .eq('id', contentId);

      if (error) throw error;
      toast.success('Content deleted successfully');
      fetchContent();
    } catch (error) {
      console.error('Error deleting content:', error);
      toast.error('Failed to delete content');
    }
  };

  const togglePublished = async (contentItem: Content) => {
    try {
      if (!supabase) {
        toast.error('Database not configured');
        return;
      }

      const { error } = await supabase
        .from('content')
        .update({ 
          is_published: !contentItem.is_published,
          updated_at: new Date().toISOString()
        })
        .eq('id', contentItem.id);

      if (error) throw error;
      toast.success(`Content ${!contentItem.is_published ? 'published' : 'unpublished'}`);
      fetchContent();
    } catch (error) {
      console.error('Error updating publish status:', error);
      toast.error('Failed to update publish status');
    }
  };

  const toggleFeatured = async (contentItem: Content) => {
    try {
      if (!supabase) {
        toast.error('Database not configured');
        return;
      }

      const { error } = await supabase
        .from('content')
        .update({ 
          is_featured: !contentItem.is_featured,
          updated_at: new Date().toISOString()
        })
        .eq('id', contentItem.id);

      if (error) throw error;
      toast.success(`Content ${!contentItem.is_featured ? 'featured' : 'unfeatured'}`);
      fetchContent();
    } catch (error) {
      console.error('Error updating featured status:', error);
      toast.error('Failed to update featured status');
    }
  };

  const syncWithStream = async (contentItem: Content) => {
    try {
      if (!supabase) {
        toast.error('Database not configured');
        return;
      }

      // Update metadata from Stream
      const response = await fetch(`/api/stream?videoId=${contentItem.cloudflare_video_id}`);
      const data = await response.json();
      
      if (data.success && data.video) {
        const streamVideo = data.video;
        
        const { error } = await supabase
          .from('content')
          .update({
            duration: streamVideo.duration || null,
            sync_status: 'synced',
            last_synced_at: new Date().toISOString(),
            stream_metadata: streamVideo,
            updated_at: new Date().toISOString()
          })
          .eq('id', contentItem.id);

        if (error) throw error;
        toast.success('Content synced with Stream');
        fetchContent();
      } else {
        throw new Error(data.error || 'Failed to fetch video from Stream');
      }
    } catch (error) {
      console.error('Error syncing with Stream:', error);
      toast.error('Failed to sync with Stream');
    }
  };

  const linkStreamVideo = async (streamVideo: StreamVideo) => {
    try {
      if (!supabase) {
        toast.error('Database not configured');
        return;
      }

      // Create new content entry linked to this Stream video
      const contentData = {
        title: streamVideo.meta.name || 'Untitled Video',
        description: streamVideo.meta.description || null,
        cloudflare_video_id: streamVideo.uid,
        duration: streamVideo.duration || null,
        category: streamVideo.meta.category || null,
        genre: streamVideo.meta.genre || null,
        keywords: streamVideo.meta.keywords ? streamVideo.meta.keywords.split(',').map((k: string) => k.trim()) : [],
        language: streamVideo.meta.language || 'English',
        instructor: streamVideo.meta.instructor || null,
        difficulty_level: streamVideo.meta.difficulty_level || 'Beginner',
        target_audience: streamVideo.meta.target_audience || null,
        learning_objectives: streamVideo.meta.learning_objectives ? streamVideo.meta.learning_objectives.split(',').map((o: string) => o.trim()) : [],
        prerequisites: streamVideo.meta.prerequisites ? streamVideo.meta.prerequisites.split(',').map((p: string) => p.trim()) : [],
        tags: [],
        thumbnail_url: streamVideo.thumbnail || null,
        thumbnail_source: 'stream',
        is_featured: false,
        is_published: false,
        sync_status: 'synced',
        last_synced_at: new Date().toISOString(),
        stream_metadata: streamVideo,
        metadata: {
          linkedFromStream: true,
          streamCreated: streamVideo.created,
          streamModified: streamVideo.modified
        }
      };

      const { error } = await supabase
        .from('content')
        .insert(contentData);

      if (error) throw error;
      toast.success('Stream video linked to content library');
      fetchContent();
    } catch (error) {
      console.error('Error linking Stream video:', error);
      toast.error('Failed to link Stream video');
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return 'Unknown';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getSyncStatusIcon = (status: string | null) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'out_of_sync':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSyncStatusColor = (status: string | null) => {
    switch (status) {
      case 'synced':
        return 'bg-green-500/20 text-green-700 dark:text-green-300';
      case 'out_of_sync':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
      case 'error':
        return 'bg-red-500/20 text-red-700 dark:text-red-300';
      case 'pending':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    }
  };

  const getCategoryColor = (category: string | null) => {
    if (!category) return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    
    const colors: Record<string, string> = {
      'Lecture': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
      'Tutorial': 'bg-green-500/20 text-green-700 dark:text-green-300',
      'Seminar': 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
      'Workshop': 'bg-orange-500/20 text-orange-700 dark:text-orange-300',
      'Conference': 'bg-red-500/20 text-red-700 dark:text-red-300',
      'Documentary': 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300',
      'Interview': 'bg-pink-500/20 text-pink-700 dark:text-pink-300',
      'Presentation': 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
      'Discussion': 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
      'Event': 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
  };

  // Filter and sort content
  const filteredContent = content.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.instructor && item.instructor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.keywords.some(keyword => keyword.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'published' && item.is_published) ||
      (statusFilter === 'draft' && !item.is_published) ||
      (statusFilter === 'featured' && item.is_featured);
    
    return matchesSearch && matchesCategory && matchesStatus;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'duration':
        aValue = a.duration || 0;
        bValue = b.duration || 0;
        break;
      case 'updated_at':
        aValue = new Date(a.updated_at).getTime();
        bValue = new Date(b.updated_at).getTime();
        break;
      default:
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Filter orphaned Stream videos (not linked to content)
  const orphanedStreamVideos = streamVideos?.filter(streamVideo => 
    !content.some(contentItem => contentItem.cloudflare_video_id === streamVideo.uid)
  ) || [];

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
          <h2 className="text-2xl font-bold">Content Management</h2>
          <p className="text-muted-foreground">Upload and manage video content with Cloudflare Stream integration</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingContent(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Content
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingContent ? 'Edit Content' : 'Upload New Content'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingContent && (
                <div>
                  <Label htmlFor="video">Video File</Label>
                  <Input
                    id="video"
                    type="file"
                    accept="video/*"
                    onChange={handleFileSelect}
                    required
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
                    </p>
                  )}
                </div>
              )}
              
              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Uploading to Cloudflare Stream...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter content title"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={formData.language}
                    onValueChange={(value) => setFormData({ ...formData, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English">English</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* JSON Metadata Import */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center justify-between mb-3">
                  <Label htmlFor="metadata">Import Metadata from JSON</Label>
                  {selectedMetadataFile && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedMetadataFile(null);
                        toast.info('Metadata file cleared');
                      }}
                    >
                      Clear
                    </Button>
                  )}
                </div>
                <Input
                  id="metadata"
                  type="file"
                  accept=".json,application/json"
                  onChange={handleMetadataSelect}
                />
                {selectedMetadataFile && (
                  <p className="text-sm text-green-600 mt-2 flex items-center">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Metadata imported from: {selectedMetadataFile.name}
                  </p>
                )}
                <div className="text-xs text-muted-foreground mt-1 space-y-1">
                  <p>Upload a JSON file to automatically fill in title, description, keywords, and other metadata</p>
                  <details className="mt-2">
                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">View expected JSON format</summary>
                    <pre className="mt-2 p-2 bg-muted rounded text-xs overflow-x-auto">
{JSON.stringify({
  "title": "Sample Video Title",
  "description": "Detailed description of the video content",
  "category": "Lecture",
  "genre": "Educational", 
  "keywords": ["education", "tutorial", "learning"],
  "language": "English",
  "author": "Instructor Name",
  "instructor": "Dr. Smith",
  "difficulty_level": "Intermediate",
  "target_audience": "Graduate students",
  "learning_objectives": ["Understand concepts", "Apply knowledge"],
  "prerequisites": ["Basic knowledge", "Previous course"],
  "tags": ["course", "university", "academic"],
  "thumbnail": "https://example.com/thumbnail.jpg"
}, null, 2)}
                    </pre>
                  </details>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter content description"
                  rows={3}
                />
              </div>
              
              {/* Multiple Channel Selection */}
              <div>
                <Label htmlFor="channels">Channels (Optional)</Label>
                <div className="space-y-2">
                  <div className="border rounded-lg p-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {channels.map((channel) => (
                        <div key={channel.id} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`channel-${channel.id}`}
                            checked={formData.channel_ids.includes(channel.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({
                                  ...prev,
                                  channel_ids: [...prev.channel_ids, channel.id]
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  channel_ids: prev.channel_ids.filter(id => id !== channel.id)
                                }));
                              }
                            }}
                            className="rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <Label 
                            htmlFor={`channel-${channel.id}`}
                            className="text-sm font-normal cursor-pointer"
                          >
                            {channel.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    {channels.length === 0 && (
                      <p className="text-sm text-muted-foreground">No channels available. Create channels in Channel Management.</p>
                    )}
                  </div>
                  {formData.channel_ids.length > 0 && (
                    <div className="text-xs text-muted-foreground">
                      Selected {formData.channel_ids.length} channel{formData.channel_ids.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <div className="space-y-2">
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add new category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomCategory())}
                        className="text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCustomCategory}
                        disabled={!newCategory.trim()}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <div className="space-y-2">
                    <Select
                      value={formData.genre}
                      onValueChange={(value) => setFormData({ ...formData, genre: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select genre" />
                      </SelectTrigger>
                      <SelectContent>
                        {genres.map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add new genre"
                        value={newGenre}
                        onChange={(e) => setNewGenre(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomGenre())}
                        className="text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCustomGenre}
                        disabled={!newGenre.trim()}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instructor">Instructor</Label>
                  <Input
                    id="instructor"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    placeholder="Instructor name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select
                    value={formData.difficulty_level}
                    onValueChange={(value) => setFormData({ ...formData, difficulty_level: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyLevels.map((level) => (
                        <SelectItem key={level} value={level}>
                          {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="target_audience">Target Audience</Label>
                <Input
                  id="target_audience"
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value })}
                  placeholder="e.g., Undergraduate students, Graduate students"
                />
              </div>

              <div>
                <Label htmlFor="learning_objectives">Learning Objectives</Label>
                <Textarea
                  id="learning_objectives"
                  value={formData.learning_objectives}
                  onChange={(e) => setFormData({ ...formData, learning_objectives: e.target.value })}
                  placeholder="Enter learning objectives separated by commas"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="prerequisites">Prerequisites</Label>
                <Textarea
                  id="prerequisites"
                  value={formData.prerequisites}
                  onChange={(e) => setFormData({ ...formData, prerequisites: e.target.value })}
                  placeholder="Enter prerequisites separated by commas"
                  rows={2}
                />
              </div>
              
              <div>
                <Label htmlFor="keywords">Keywords</Label>
                <Input
                  id="keywords"
                  value={formData.keywords}
                  onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  placeholder="Enter keywords separated by commas"
                />
              </div>
              
              <div>
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Enter tags separated by commas"
                />
              </div>

              {/* Thumbnail Upload */}
              <div>
                <Label htmlFor="thumbnail">Thumbnail</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <Input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailSelect}
                      className="flex-1"
                    />
                    <Select
                      value={formData.thumbnail_source}
                      onValueChange={(value) => setFormData({ ...formData, thumbnail_source: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="url">URL</SelectItem>
                        <SelectItem value="upload">Upload</SelectItem>
                        <SelectItem value="stream">Stream</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.thumbnail_source === 'url' && (
                    <Input
                      value={formData.thumbnail_url}
                      onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                      placeholder="Enter thumbnail URL"
                    />
                  )}
                  
                  {thumbnailPreview && (
                    <div className="w-32 h-20 border rounded overflow-hidden">
                      <img
                        src={thumbnailPreview}
                        alt="Thumbnail preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_featured"
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                  />
                  <Label htmlFor="is_featured">Featured</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_published"
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                  <Label htmlFor="is_published">Published</Label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploading}>
                  {uploading ? 'Uploading...' : editingContent ? 'Update' : 'Upload'} Content
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs for Content Library and Stream Videos */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="content-library">Content Library ({content.length})</TabsTrigger>
          <TabsTrigger value="cloudflare-stream">
            Cloudflare Stream ({streamVideos?.length || 0})
            {streamLoading && <Loader2 className="h-3 w-3 ml-2 animate-spin" />}
          </TabsTrigger>
        </TabsList>

        {/* Content Library Tab */}
        <TabsContent value="content-library" className="space-y-6">
          {/* Filters and Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="featured">Featured</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at">Created</SelectItem>
                  <SelectItem value="updated_at">Updated</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="duration">Duration</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'compact' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('compact')}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content Display */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((item) => (
                <Card key={item.id} className="relative overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <Video className="h-5 w-5 text-primary" />
                        <CardTitle className="text-lg line-clamp-1">{item.title}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getSyncStatusIcon(item.sync_status)}
                        {item.is_featured && (
                          <Badge variant="secondary">
                            <Star className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                        {item.is_published ? (
                          <Badge variant="default">Published</Badge>
                        ) : (
                          <Badge variant="outline">Draft</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {item.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        {item.category && (
                          <Badge className={getCategoryColor(item.category)}>
                            {item.category}
                          </Badge>
                        )}
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(item.duration)}</span>
                        </div>
                      </div>
                      
                      {/* Display associated channels */}
                      {item.content_channels && item.content_channels.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          <span className="text-xs text-muted-foreground">Channels:</span>
                          {item.content_channels.map((cc, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {cc.channels?.name || cc.channel?.name || 'Channel'}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {item.thumbnail_url && (
                        <div className="aspect-video bg-muted rounded-md overflow-hidden relative">
                          <img
                            src={item.thumbnail_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <Play className="h-8 w-8 text-white" />
                          </div>
                        </div>
                      )}

                      {item.instructor && (
                        <div className="text-sm text-muted-foreground">
                          <strong>Instructor:</strong> {item.instructor}
                        </div>
                      )}

                      {item.keywords.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {item.keywords.slice(0, 3).map((keyword, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                          {item.keywords.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{item.keywords.length - 3} more
                            </Badge>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleFeatured(item)}
                          >
                            <Star className={`h-4 w-4 ${item.is_featured ? 'fill-current' : ''}`} />
                          </Button>
                          {item.sync_status !== 'synced' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => syncWithStream(item)}
                            >
                              <Sync className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant={item.is_published ? "outline" : "default"}
                          onClick={() => togglePublished(item)}
                        >
                          {item.is_published ? 'Unpublish' : 'Publish'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {viewMode === 'list' && (
            <div className="space-y-4">
              {filteredContent.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      {/* Thumbnail */}
                      <div className="w-24 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                        {item.thumbnail_url ? (
                          <img
                            src={item.thumbnail_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      {/* Content Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-lg truncate">{item.title}</h3>
                          {getSyncStatusIcon(item.sync_status)}
                          {item.is_featured && (
                            <Badge variant="secondary" className="text-xs">
                              <Star className="h-3 w-3 mr-1" />
                              Featured
                            </Badge>
                          )}
                          {item.is_published ? (
                            <Badge variant="default" className="text-xs">Published</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Draft</Badge>
                          )}
                        </div>
                        
                        {item.description && (
                          <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                            {item.description}
                          </p>
                        )}
                        
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          {item.category && (
                            <Badge className={getCategoryColor(item.category)} variant="outline">
                              {item.category}
                            </Badge>
                          )}
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatDuration(item.duration)}</span>
                          </div>
                          {item.instructor && (
                            <span>by {item.instructor}</span>
                          )}
                          <span>{item.difficulty_level}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        {item.sync_status !== 'synced' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => syncWithStream(item)}
                          >
                            <Sync className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant={item.is_published ? "outline" : "default"}
                          onClick={() => togglePublished(item)}
                        >
                          {item.is_published ? 'Unpublish' : 'Publish'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {viewMode === 'compact' && (
            <div className="space-y-2">
              {filteredContent.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="w-8 h-8 bg-muted rounded flex items-center justify-center flex-shrink-0">
                    <Video className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium truncate">{item.title}</h4>
                      {getSyncStatusIcon(item.sync_status)}
                      {item.is_featured && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{formatDuration(item.duration)}</span>
                      {item.category && <span>• {item.category}</span>}
                      {item.instructor && <span>• {item.instructor}</span>}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button size="sm" variant="ghost" onClick={() => handleEdit(item)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    {item.sync_status !== 'synced' && (
                      <Button size="sm" variant="ghost" onClick={() => syncWithStream(item)}>
                        <Sync className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredContent.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileVideo className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No content found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all' 
                    ? 'Try adjusting your filters or search terms'
                    : 'Upload your first video to get started with content management'
                  }
                </p>
                {!searchQuery && categoryFilter === 'all' && statusFilter === 'all' && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Content
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Cloudflare Stream Tab */}
        <TabsContent value="cloudflare-stream" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Cloudflare Stream Videos</h3>
              <p className="text-sm text-muted-foreground">
                Videos stored in Cloudflare Stream. Link orphaned videos to your content library.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="default"
                onClick={async () => {
                  try {
                    const response = await fetch('/api/content-library/sync', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' }
                    });
                    const data = await response.json();
                    if (response.ok) {
                      toast.success(`Bulk sync completed: ${data.created} created, ${data.updated} updated`);
                      fetchContent();
                      refetchStreamVideos();
                    } else {
                      throw new Error(data.error || 'Sync failed');
                    }
                  } catch (error) {
                    console.error('Bulk sync error:', error);
                    toast.error('Bulk sync failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
                  }
                }}
                disabled={streamLoading}
              >
                <Sync className="h-4 w-4 mr-2" />
                Bulk Sync All
              </Button>
              <Button
                variant="outline"
                onClick={refetchStreamVideos}
                disabled={streamLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${streamLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {streamError && (
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <h4 className="font-medium text-red-800 dark:text-red-200">
                      Failed to load Cloudflare Stream videos
                    </h4>
                    <p className="text-sm text-red-600 dark:text-red-300">
                      {streamError}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {streamLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading Cloudflare Stream videos...</p>
              </div>
            </div>
          ) : streamVideos && streamVideos.length > 0 ? (
            <div className="space-y-4">
              {/* Linked Videos */}
              {streamVideos.filter(video => 
                content.some(contentItem => contentItem.cloudflare_video_id === video.uid)
              ).length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-green-600 dark:text-green-400">
                    ✓ Linked Videos ({streamVideos.filter(video => 
                      content.some(contentItem => contentItem.cloudflare_video_id === video.uid)
                    ).length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {streamVideos
                      .filter(video => content.some(contentItem => contentItem.cloudflare_video_id === video.uid))
                      .map((video) => {
                        const linkedContent = content.find(item => item.cloudflare_video_id === video.uid);
                        return (
                          <Card key={video.uid} className="border-green-200 dark:border-green-800">
                            <CardContent className="p-4">
                              <div className="space-y-3">
                                <div className="aspect-video bg-muted rounded overflow-hidden">
                                  <img
                                    src={video.thumbnail}
                                    alt={video.meta.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                
                                <div>
                                  <h4 className="font-medium line-clamp-1">{video.meta.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Linked to: {linkedContent?.title}
                                  </p>
                                </div>
                                
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span>{formatDuration(video.duration)}</span>
                                  <Badge variant="outline" className={
                                    video.readyToStream ? 'border-green-500 text-green-600' : 'border-yellow-500 text-yellow-600'
                                  }>
                                    {video.readyToStream ? 'Ready' : video.status.state}
                                  </Badge>
                                </div>
                                
                                <div className="flex items-center space-x-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => window.open(video.playback.hls, '_blank')}
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => handleEdit(linkedContent!)}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Orphaned Videos */}
              {orphanedStreamVideos.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3 text-yellow-600 dark:text-yellow-400">
                    ⚠ Orphaned Videos ({orphanedStreamVideos.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {orphanedStreamVideos.map((video) => (
                      <Card key={video.uid} className="border-yellow-200 dark:border-yellow-800">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="aspect-video bg-muted rounded overflow-hidden">
                              <img
                                src={video.thumbnail}
                                alt={video.meta.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            <div>
                              <h4 className="font-medium line-clamp-1">{video.meta.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                Created: {new Date(video.created).toLocaleDateString()}
                              </p>
                            </div>
                            
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span>{formatDuration(video.duration)}</span>
                              <Badge variant="outline" className={
                                video.readyToStream ? 'border-green-500 text-green-600' : 'border-yellow-500 text-yellow-600'
                              }>
                                {video.readyToStream ? 'Ready' : video.status.state}
                              </Badge>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="w-full"
                                onClick={() => window.open(video.playback.hls, '_blank')}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="default"
                                className="w-full"
                                onClick={() => linkStreamVideo(video)}
                              >
                                <Link className="h-3 w-3 mr-1" />
                                Link
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileVideo className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No videos found in Cloudflare Stream</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Upload your first video to get started
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Content
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}