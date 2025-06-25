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
import { supabase } from '@/lib/supabase/client';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Tv, 
  Users, 
  Eye,
  Settings,
  Radio,
  Upload,
  Image,
  X
} from 'lucide-react';
import { toast } from 'sonner';

interface Channel {
  id: string;
  name: string;
  description: string | null;
  category: string;
  thumbnail_url: string | null;
  logo_url: string | null;
  logo_svg: string | null;
  logo_metadata: any;
  is_live: boolean;
  stream_key: string | null;
  cloudflare_stream_id: string | null;
  settings: any;
  created_at: string;
  updated_at: string;
}

export function ChannelManagement() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingChannel, setEditingChannel] = useState<Channel | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    thumbnail_url: '',
    logo_url: '',
    logo_svg: '',
    is_live: false
  });
  const [selectedLogoFile, setSelectedLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [customCategory, setCustomCategory] = useState('');
  const [showCustomCategory, setShowCustomCategory] = useState(false);
  
  const predefinedCategories = [
    'Education',
    'News',
    'Sports',
    'Entertainment',
    'Science',
    'Technology',
    'Arts',
    'Music',
    'Discussion',
    'Events',
    'Travel',
    'Announcements',
    'Health',
    'Business',
    'Lifestyle',
    'Documentary',
    'Tutorial',
    'Other'
  ];

  useEffect(() => {
    fetchChannels();
    
    // Log Supabase status for debugging
    console.log('Channel Management - Supabase status:', {
      supabaseExists: !!supabase,
      isConfigured: supabase !== null
    });
  }, []);

  const fetchChannels = async () => {
    try {
      if (!supabase) {
        console.warn('Supabase not available, using mock data');
        // Set mock data for demo purposes
        setChannels([
          {
            id: 'mock-1',
            name: 'Demo Channel 1',
            description: 'This is a demo channel',
            category: 'Education',
            thumbnail_url: null,
            logo_url: null,
            logo_svg: null,
            logo_metadata: null,
            is_live: false,
            stream_key: null,
            cloudflare_stream_id: null,
            settings: {},
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('channels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }
      setChannels(data || []);
    } catch (error) {
      console.error('Error fetching channels:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to load channels: ${errorMessage}`);
      
      // Set empty array on error
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Check if Supabase is available
      if (!supabase) {
        toast.error('Database not configured. Channel management requires Supabase setup.');
        return;
      }

      let logoUrl = formData.logo_url;
      let logoSvg = formData.logo_svg;

      // Upload logo to R2 if a file is selected
      if (selectedLogoFile) {
        setUploadingLogo(true);
        setUploadProgress(0);

        try {
          // For SVG files, prioritize storing content directly in database
          const isSvg = selectedLogoFile.type === 'image/svg+xml' || selectedLogoFile.name.toLowerCase().endsWith('.svg');
          
          if (isSvg) {
            // Use the sanitized SVG content we already have
            logoSvg = formData.logo_svg;
            setUploadProgress(50);
            
            // Still upload to R2 as backup, but don't block on it
            try {
              const uploadFormData = new FormData();
              uploadFormData.append('file', selectedLogoFile);
              uploadFormData.append('type', 'logo');

              const uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                body: uploadFormData,
              });

              if (uploadResponse.ok) {
                const uploadResult = await uploadResponse.json();
                if (uploadResult.success) {
                  logoUrl = uploadResult.url; // Store as backup
                }
              }
            } catch (backupError) {
              console.warn('Backup upload failed, but proceeding with SVG content:', backupError);
            }
            setUploadProgress(100);
          } else {
            // For non-SVG images, upload to R2 is required
            const uploadFormData = new FormData();
            uploadFormData.append('file', selectedLogoFile);
            uploadFormData.append('type', 'logo');

            const uploadResponse = await fetch('/api/upload', {
              method: 'POST',
              body: uploadFormData,
            });

            if (!uploadResponse.ok) {
              const errorText = await uploadResponse.text();
              throw new Error(`Upload failed: ${errorText}`);
            }

            const uploadResult = await uploadResponse.json();
            
            if (uploadResult.success) {
              logoUrl = uploadResult.url;
              logoSvg = ''; // Clear SVG content for non-SVG files
              setUploadProgress(100);
            } else {
              throw new Error(uploadResult.error || 'Upload failed');
            }
          }
        } catch (uploadError) {
          console.error('Logo upload error:', uploadError);
          toast.error(`Failed to upload logo: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
          setUploadingLogo(false);
          return;
        } finally {
          setUploadingLogo(false);
        }
      }

      const channelData = {
        name: formData.name,
        description: formData.description || null,
        category: formData.category,
        thumbnail_url: formData.thumbnail_url || null,
        logo_url: logoUrl || null,
        logo_svg: logoSvg || null,
        logo_metadata: selectedLogoFile ? {
          fileName: selectedLogoFile.name,
          fileSize: selectedLogoFile.size,
          fileType: selectedLogoFile.type,
          uploadedAt: new Date().toISOString(),
          r2Key: logoUrl ? logoUrl.split('/').pop() : null
        } : editingChannel?.logo_metadata || null,
        is_live: formData.is_live,
        stream_key: `stream_${Date.now()}`, // Generate unique stream key
        settings: {}
      };

      if (editingChannel) {
        // Update existing channel
        // First try with all columns
        let updateData = {
          ...channelData,
          updated_at: new Date().toISOString()
        };
        
        let { data, error } = await supabase
          .from('channels')
          .update(updateData)
          .eq('id', editingChannel.id)
          .select();

        // If it fails due to schema cache, try removing problematic columns
        if (error && (error.message.includes('logo_metadata') || error.message.includes('logo_svg') || error.message.includes('logo_url'))) {
          console.warn('Schema cache issue detected, retrying without logo columns');
          
          // Remove all logo-related columns that might not exist
          const safeUpdateData = { ...updateData };
          delete safeUpdateData.logo_metadata;
          delete safeUpdateData.logo_svg;
          delete safeUpdateData.logo_url;
          
          const retryResult = await supabase
            .from('channels')
            .update(safeUpdateData)
            .eq('id', editingChannel.id)
            .select();
            
          data = retryResult.data;
          error = retryResult.error;
          
          // Show warning to user about limited functionality
          if (!error) {
            toast.warning('Channel updated but logo changes were not saved. Please run the schema migration.');
          }
        }

        if (error) {
          console.error('Supabase update error:', error);
          throw new Error(`Update failed: ${error.message}`);
        }
        
        console.log('Channel updated successfully:', data);
        toast.success('Channel updated successfully');
      } else {
        // Create new channel
        const { data, error } = await supabase
          .from('channels')
          .insert(channelData)
          .select();

        if (error) {
          console.error('Supabase insert error:', error);
          throw new Error(`Creation failed: ${error.message}`);
        }
        
        console.log('Channel created successfully:', data);
        toast.success('Channel created successfully');
      }

      // Reset form and close dialog
      setFormData({
        name: '',
        description: '',
        category: '',
        thumbnail_url: '',
        logo_url: '',
        logo_svg: '',
        is_live: false
      });
      setSelectedLogoFile(null);
      setLogoPreview('');
      setIsCreateDialogOpen(false);
      setEditingChannel(null);
      
      // Refresh the channels list
      await fetchChannels();
    } catch (error) {
      console.error('Error saving channel:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Failed to save channel: ${errorMessage}`);
    }
  };

  const handleEdit = (channel: Channel) => {
    setEditingChannel(channel);
    
    // Check if category is custom (not in predefined list)
    const isCustomCategory = !predefinedCategories.includes(channel.category);
    
    setFormData({
      name: channel.name,
      description: channel.description || '',
      category: channel.category,
      thumbnail_url: channel.thumbnail_url || '',
      logo_url: channel.logo_url || '',
      logo_svg: channel.logo_svg || '',
      is_live: channel.is_live
    });
    
    if (isCustomCategory) {
      setShowCustomCategory(true);
      setCustomCategory(channel.category);
    } else {
      setShowCustomCategory(false);
      setCustomCategory('');
    }
    
    setLogoPreview(channel.logo_svg || channel.logo_url || '');
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (channelId: string) => {
    if (!confirm('Are you sure you want to delete this channel?')) return;

    try {
      if (!supabase) {
        toast.error('Database not configured');
        return;
      }

      const { error } = await supabase
        .from('channels')
        .delete()
        .eq('id', channelId);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }
      
      toast.success('Channel deleted successfully');
      await fetchChannels();
    } catch (error) {
      console.error('Error deleting channel:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to delete channel: ${errorMessage}`);
    }
  };

  const toggleLiveStatus = async (channel: Channel) => {
    try {
      if (!supabase) {
        toast.error('Database not configured');
        return;
      }

      const { error } = await supabase
        .from('channels')
        .update({ 
          is_live: !channel.is_live,
          updated_at: new Date().toISOString()
        })
        .eq('id', channel.id);

      if (error) {
        console.error('Toggle live status error:', error);
        throw error;
      }
      
      toast.success(`Channel ${!channel.is_live ? 'went live' : 'stopped streaming'}`);
      await fetchChannels();
    } catch (error) {
      console.error('Error updating live status:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Failed to update live status: ${errorMessage}`);
    }
  };

  const sanitizeSvg = (svgContent: string): string => {
    // Remove dangerous scripts and event handlers
    return svgContent
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/on\w+\s*=\s*["'][^"']*["']/g, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '');
  };

  const handleLogoFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    const isSvg = file.type === 'image/svg+xml' || file.name.toLowerCase().endsWith('.svg');
    const isValidImage = validTypes.includes(file.type);
    
    if (!isSvg && !isValidImage) {
      toast.error('Please select an SVG, PNG, JPG, or WebP file');
      return;
    }

    // Validate file size (max 2MB for logos to ensure fast loading)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      toast.error('Logo file must be less than 2MB for optimal performance');
      return;
    }

    setSelectedLogoFile(file);

    // Handle SVG files
    if (isSvg) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const rawContent = e.target?.result as string;
        const sanitizedContent = sanitizeSvg(rawContent);
        
        // Validate SVG content
        if (!sanitizedContent.includes('<svg')) {
          toast.error('Invalid SVG file');
          return;
        }
        
        setFormData(prev => ({ ...prev, logo_svg: sanitizedContent, logo_url: '' }));
        setLogoPreview(sanitizedContent);
      };
      reader.readAsText(file);
    } else {
      // For other image types, create a preview URL
      const previewUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, logo_url: previewUrl, logo_svg: '' }));
      setLogoPreview(previewUrl);
    }
  };

  const clearLogo = () => {
    setSelectedLogoFile(null);
    setLogoPreview('');
    setFormData(prev => ({ ...prev, logo_url: '', logo_svg: '' }));
  };

  const renderChannelLogo = (channel: Channel) => {
    // Prioritize SVG content for better quality
    if (channel.logo_svg) {
      return (
        <div 
          className="w-8 h-8 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
          dangerouslySetInnerHTML={{ __html: channel.logo_svg }}
        />
      );
    } else if (channel.logo_url) {
      return (
        <img
          src={channel.logo_url}
          alt={`${channel.name} logo`}
          className="w-8 h-8 object-contain"
          onError={(e) => {
            // Fallback to default icon if image fails to load
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement?.insertAdjacentHTML(
              'afterbegin', 
              '<svg class="h-5 w-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M21 6.5l-1 .5v3l1 .5v7.5a1 1 0 01-1 1H4a1 1 0 01-1-1V11l1-.5v-3L3 6.5V4a1 1 0 011-1h16a1 1 0 011 1v2.5zM19 8H5v1l2 1v9h10v-9l2-1V8z"/></svg>'
            );
          }}
        />
      );
    } else {
      return <Tv className="h-5 w-5 text-primary" />;
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Education': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
      'News': 'bg-red-500/20 text-red-700 dark:text-red-300',
      'Sports': 'bg-green-500/20 text-green-700 dark:text-green-300',
      'Entertainment': 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
      'Science': 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-300',
      'Technology': 'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
      'Arts': 'bg-pink-500/20 text-pink-700 dark:text-pink-300',
      'Music': 'bg-orange-500/20 text-orange-700 dark:text-orange-300',
      'Discussion': 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
      'Events': 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300',
      'Travel': 'bg-teal-500/20 text-teal-700 dark:text-teal-300',
      'Announcements': 'bg-amber-500/20 text-amber-700 dark:text-amber-300',
      'Health': 'bg-rose-500/20 text-rose-700 dark:text-rose-300',
      'Business': 'bg-slate-500/20 text-slate-700 dark:text-slate-300',
      'Lifestyle': 'bg-violet-500/20 text-violet-700 dark:text-violet-300',
      'Documentary': 'bg-stone-500/20 text-stone-700 dark:text-stone-300',
      'Tutorial': 'bg-lime-500/20 text-lime-700 dark:text-lime-300'
    };
    
    // For custom categories, generate a color based on the category name
    if (!colors[category]) {
      // Simple hash function to generate consistent colors for custom categories
      let hash = 0;
      for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash);
      }
      const colorOptions = [
        'bg-blue-500/20 text-blue-700 dark:text-blue-300',
        'bg-green-500/20 text-green-700 dark:text-green-300',
        'bg-purple-500/20 text-purple-700 dark:text-purple-300',
        'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300',
        'bg-pink-500/20 text-pink-700 dark:text-pink-300',
        'bg-indigo-500/20 text-indigo-700 dark:text-indigo-300',
        'bg-red-500/20 text-red-700 dark:text-red-300',
        'bg-orange-500/20 text-orange-700 dark:text-orange-300'
      ];
      return colorOptions[Math.abs(hash) % colorOptions.length];
    }
    
    return colors[category];
  };

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
          <h2 className="text-2xl font-bold">Channel Management</h2>
          <p className="text-muted-foreground">Create and manage streaming channels</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingChannel(null);
              setFormData({
                name: '',
                description: '',
                category: '',
                thumbnail_url: '',
                logo_url: '',
                logo_svg: '',
                is_live: false
              });
              setSelectedLogoFile(null);
              setLogoPreview('');
              setShowCustomCategory(false);
              setCustomCategory('');
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Channel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingChannel ? 'Edit Channel' : 'Create New Channel'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Channel Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter channel name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter channel description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                {!showCustomCategory ? (
                  <Select
                    value={formData.category}
                    onValueChange={(value) => {
                      if (value === 'custom') {
                        setShowCustomCategory(true);
                        setFormData({ ...formData, category: '' });
                      } else {
                        setFormData({ ...formData, category: value });
                      }
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {predefinedCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom" className="font-medium text-primary">
                        + Add Custom Category
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        id="customCategory"
                        value={customCategory}
                        onChange={(e) => {
                          setCustomCategory(e.target.value);
                          setFormData({ ...formData, category: e.target.value });
                        }}
                        placeholder="Enter custom category name"
                        required
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setShowCustomCategory(false);
                          setCustomCategory('');
                          setFormData({ ...formData, category: '' });
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter a custom category name (e.g., Travel, Announcements, etc.)
                    </p>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="thumbnail">Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  value={formData.thumbnail_url}
                  onChange={(e) => setFormData({ ...formData, thumbnail_url: e.target.value })}
                  placeholder="https://example.com/thumbnail.jpg"
                  type="url"
                />
              </div>
              
              <div>
                <Label htmlFor="logo">Channel Logo</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Input
                      id="logo"
                      type="file"
                      accept=".svg,.png,.jpg,.jpeg,.webp,image/svg+xml,image/png,image/jpeg,image/webp"
                      onChange={handleLogoFileSelect}
                      className="cursor-pointer flex-1"
                      disabled={uploadingLogo}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('logo')?.click()}
                      disabled={uploadingLogo}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Browse
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>• <strong>SVG files</strong> are recommended for crisp logos at any size</p>
                    <p>• PNG, JPG, WebP also supported (max 2MB)</p>
                    <p>• SVG content is stored in database, images uploaded to Cloudflare R2</p>
                  </div>
                  
                  {/* Upload Progress */}
                  {uploadingLogo && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Uploading logo...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}
                  
                  {/* Logo Preview */}
                  {logoPreview && (
                    <div className="flex items-center space-x-3 p-3 border rounded-lg bg-muted/50">
                      <div className="w-16 h-16 flex items-center justify-center border rounded bg-background">
                        {formData.logo_svg ? (
                          <div 
                            className="w-14 h-14 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                            dangerouslySetInnerHTML={{ __html: formData.logo_svg }}
                          />
                        ) : (
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="w-14 h-14 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement?.insertAdjacentHTML(
                                'afterbegin', 
                                '<div class="w-14 h-14 flex items-center justify-center text-muted-foreground"><svg class="h-8 w-8" fill="currentColor" viewBox="0 0 24 24"><path d="M21 6.5l-1 .5v3l1 .5v7.5a1 1 0 01-1 1H4a1 1 0 01-1-1V11l1-.5v-3L3 6.5V4a1 1 0 011-1h16a1 1 0 011 1v2.5zM19 8H5v1l2 1v9h10v-9l2-1V8z"/></svg></div>'
                              );
                            }}
                          />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {formData.logo_svg ? 'SVG Logo' : 'Image Logo'} Preview
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {selectedLogoFile?.name || 'Current logo'} 
                          {selectedLogoFile && ` (${(selectedLogoFile.size / 1024).toFixed(1)} KB)`}
                        </p>
                        {formData.logo_svg && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                            ✓ Vector format - scales perfectly
                          </p>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={clearLogo}
                        disabled={uploadingLogo}
                        title="Remove logo"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="is_live"
                  checked={formData.is_live}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_live: checked })}
                />
                <Label htmlFor="is_live">Start as live channel</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploadingLogo}>
                  {uploadingLogo ? 'Uploading...' : editingChannel ? 'Update' : 'Create'} Channel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {channels.map((channel) => (
          <Card key={channel.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  {renderChannelLogo(channel)}
                  <CardTitle className="text-lg">{channel.name}</CardTitle>
                </div>
                <div className="flex items-center space-x-1">
                  {channel.is_live && (
                    <Badge variant="destructive" className="animate-pulse">
                      <Radio className="h-3 w-3 mr-1" />
                      LIVE
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {channel.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {channel.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between">
                  <Badge className={getCategoryColor(channel.category)}>
                    {channel.category}
                  </Badge>
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{Math.floor(Math.random() * 1000) + 100}</span>
                  </div>
                </div>

                {channel.thumbnail_url && (
                  <div className="aspect-video bg-muted rounded-md overflow-hidden">
                    <img
                      src={channel.thumbnail_url}
                      alt={channel.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(channel)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(channel.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant={channel.is_live ? "destructive" : "default"}
                    onClick={() => toggleLiveStatus(channel)}
                  >
                    {channel.is_live ? 'Stop Stream' : 'Go Live'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {channels.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Tv className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No channels yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first streaming channel to get started
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Channel
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}