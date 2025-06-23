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
import { supabase } from '@/lib/supabase/client';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Megaphone, 
  Calendar,
  MapPin,
  Clock,
  ExternalLink,
  Image,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';

interface CampusUpdate {
  id: string;
  title: string;
  content: string;
  category: 'news' | 'event' | 'alert' | 'announcement' | 'academic';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  location: string | null;
  date: string | null;
  time: string | null;
  link: string | null;
  background_image: string;
  is_active: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

export function UpdatesManagement() {
  const [updates, setUpdates] = useState<CampusUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<CampusUpdate | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'announcement' as 'news' | 'event' | 'alert' | 'announcement' | 'academic',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    location: '',
    date: '',
    time: '',
    link: '',
    background_image: '',
    is_active: true,
    expires_at: ''
  });

  const categories = [
    { value: 'news', label: 'News', icon: Megaphone },
    { value: 'event', label: 'Event', icon: Calendar },
    { value: 'alert', label: 'Alert', icon: AlertTriangle },
    { value: 'announcement', label: 'Announcement', icon: Megaphone },
    { value: 'academic', label: 'Academic', icon: Calendar }
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-blue-500/20 text-blue-700 dark:text-blue-300' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300' },
    { value: 'high', label: 'High', color: 'bg-orange-500/20 text-orange-700 dark:text-orange-300' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-500/20 text-red-700 dark:text-red-300' }
  ];

  // Pexels campus/university images for backgrounds
  const backgroundImages = [
    'https://images.pexels.com/photos/207692/pexels-photo-207692.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1454360/pexels-photo-1454360.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/159490/yale-university-landscape-universities-schools-159490.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1205651/pexels-photo-1205651.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1438081/pexels-photo-1438081.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/289737/pexels-photo-289737.jpeg?auto=compress&cs=tinysrgb&w=800',
    'https://images.pexels.com/photos/1181298/pexels-photo-1181298.jpeg?auto=compress&cs=tinysrgb&w=800'
  ];

  useEffect(() => {
    fetchUpdates();
  }, []);

  const fetchUpdates = async () => {
    try {
      if (!supabase) {
        // Mock data for demo
        setUpdates([
          {
            id: 'mock-1',
            title: 'Campus Library Extended Hours',
            content: 'The main library will be open 24/7 during finals week to support student study needs.',
            category: 'announcement',
            priority: 'medium',
            location: 'Main Library',
            date: '2024-12-15',
            time: '00:00',
            link: 'https://library.university.edu/hours',
            background_image: backgroundImages[0],
            is_active: true,
            expires_at: '2024-12-22T23:59:59Z',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          },
          {
            id: 'mock-2',
            title: 'Weather Alert: Campus Closure',
            content: 'Due to severe weather conditions, all campus activities are cancelled today. Stay safe!',
            category: 'alert',
            priority: 'urgent',
            location: 'Entire Campus',
            date: '2024-01-27',
            time: '06:00',
            link: null,
            background_image: backgroundImages[1],
            is_active: true,
            expires_at: '2024-01-28T23:59:59Z',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ]);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('campus_updates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUpdates(data || []);
    } catch (error) {
      console.error('Error fetching updates:', error);
      toast.error('Failed to load campus updates');
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (!supabase) {
        toast.error('Database not configured. Updates management requires Supabase setup.');
        return;
      }

      const updateData = {
        title: formData.title,
        content: formData.content,
        category: formData.category,
        priority: formData.priority,
        location: formData.location || null,
        date: formData.date || null,
        time: formData.time || null,
        link: formData.link || null,
        background_image: formData.background_image || backgroundImages[0],
        is_active: formData.is_active,
        expires_at: formData.expires_at || null
      };

      if (editingUpdate) {
        const { error } = await supabase
          .from('campus_updates')
          .update({
            ...updateData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingUpdate.id);

        if (error) throw error;
        toast.success('Update modified successfully');
      } else {
        const { error } = await supabase
          .from('campus_updates')
          .insert(updateData);

        if (error) throw error;
        toast.success('Update created successfully');
      }

      // Reset form and close dialog
      setFormData({
        title: '',
        content: '',
        category: 'announcement',
        priority: 'medium',
        location: '',
        date: '',
        time: '',
        link: '',
        background_image: '',
        is_active: true,
        expires_at: ''
      });
      setIsCreateDialogOpen(false);
      setEditingUpdate(null);
      fetchUpdates();
    } catch (error) {
      console.error('Error saving update:', error);
      toast.error('Failed to save update');
    }
  };

  const handleEdit = (update: CampusUpdate) => {
    setEditingUpdate(update);
    setFormData({
      title: update.title,
      content: update.content,
      category: update.category,
      priority: update.priority,
      location: update.location || '',
      date: update.date || '',
      time: update.time || '',
      link: update.link || '',
      background_image: update.background_image,
      is_active: update.is_active,
      expires_at: update.expires_at || ''
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (updateId: string) => {
    if (!confirm('Are you sure you want to delete this update?')) return;

    try {
      if (!supabase) {
        toast.error('Database not configured');
        return;
      }

      const { error } = await supabase
        .from('campus_updates')
        .delete()
        .eq('id', updateId);

      if (error) throw error;
      toast.success('Update deleted successfully');
      fetchUpdates();
    } catch (error) {
      console.error('Error deleting update:', error);
      toast.error('Failed to delete update');
    }
  };

  const toggleActive = async (update: CampusUpdate) => {
    try {
      if (!supabase) {
        toast.error('Database not configured');
        return;
      }

      const { error } = await supabase
        .from('campus_updates')
        .update({ 
          is_active: !update.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', update.id);

      if (error) throw error;
      toast.success(`Update ${!update.is_active ? 'activated' : 'deactivated'}`);
      fetchUpdates();
    } catch (error) {
      console.error('Error toggling update status:', error);
      toast.error('Failed to update status');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'news': 'bg-blue-500/20 text-blue-700 dark:text-blue-300',
      'event': 'bg-green-500/20 text-green-700 dark:text-green-300',
      'alert': 'bg-red-500/20 text-red-700 dark:text-red-300',
      'announcement': 'bg-purple-500/20 text-purple-700 dark:text-purple-300',
      'academic': 'bg-orange-500/20 text-orange-700 dark:text-orange-300'
    };
    return colors[category] || 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
  };

  const getPriorityColor = (priority: string) => {
    return priorities.find(p => p.value === priority)?.color || 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
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
          <h2 className="text-2xl font-bold">Campus Updates Management</h2>
          <p className="text-muted-foreground">Create and manage campus announcements and updates</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingUpdate(null);
              setFormData({
                title: '',
                content: '',
                category: 'announcement',
                priority: 'medium',
                location: '',
                date: '',
                time: '',
                link: '',
                background_image: '',
                is_active: true,
                expires_at: ''
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Update
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingUpdate ? 'Edit Campus Update' : 'Create New Campus Update'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter update title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Enter update content"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Main Library, Student Center"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Date (Optional)</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="time">Time (Optional)</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="link">Link (Optional)</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://example.com/more-info"
                />
              </div>

              <div>
                <Label htmlFor="background_image">Background Image</Label>
                <Select
                  value={formData.background_image}
                  onValueChange={(value) => setFormData({ ...formData, background_image: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select background image" />
                  </SelectTrigger>
                  <SelectContent>
                    {backgroundImages.map((image, index) => (
                      <SelectItem key={index} value={image}>
                        Campus Background {index + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.background_image && (
                  <div className="mt-2">
                    <img
                      src={formData.background_image}
                      alt="Background preview"
                      className="w-full h-20 object-cover rounded border"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="expires_at">Expires At (Optional)</Label>
                <Input
                  id="expires_at"
                  type="datetime-local"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingUpdate ? 'Update' : 'Create'} Update
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {updates.map((update) => (
          <Card key={update.id} className="relative overflow-hidden">
            {/* Background Image */}
            <div className="absolute inset-0 opacity-20">
              <img
                src={update.background_image}
                alt="Background"
                className="w-full h-full object-cover"
              />
            </div>
            
            <CardHeader className="relative pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg line-clamp-1">{update.title}</CardTitle>
                </div>
                <div className="flex items-center space-x-1">
                  <Badge className={getCategoryColor(update.category)}>
                    {update.category}
                  </Badge>
                  {update.is_active ? (
                    <Badge variant="default">Active</Badge>
                  ) : (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="relative">
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {update.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <Badge className={getPriorityColor(update.priority)}>
                    {update.priority.toUpperCase()}
                  </Badge>
                  {update.priority === 'urgent' && (
                    <Badge variant="destructive" className="animate-pulse">
                      URGENT
                    </Badge>
                  )}
                </div>

                {(update.location || update.date || update.time) && (
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {update.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{update.location}</span>
                      </div>
                    )}
                    {(update.date || update.time) && (
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {update.date && update.time 
                            ? `${update.date} at ${update.time}`
                            : update.date || update.time
                          }
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {update.link && (
                  <div className="flex items-center space-x-1 text-xs text-primary">
                    <ExternalLink className="h-3 w-3" />
                    <span>Has link</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(update)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(update.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    size="sm"
                    variant={update.is_active ? "destructive" : "default"}
                    onClick={() => toggleActive(update)}
                  >
                    {update.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {updates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No campus updates yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first campus update to keep students informed
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Update
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}