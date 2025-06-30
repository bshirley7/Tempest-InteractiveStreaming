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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase/client';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MessageSquare, 
  BarChart3,
  Trophy,
  Star,
  Play,
  Pause,
  Clock,
  Users,
  CheckCircle,
  Video,
  BookOpen,
  Calendar,
  Target
} from 'lucide-react';
import { toast } from 'sonner';
import { ContentInteractionTemplates } from './content-interaction-templates';

interface Interaction {
  id: string;
  type: 'poll' | 'quiz' | 'rating' | 'reaction';
  title: string;
  description: string;
  question?: string; // For backwards compatibility
  options: any;
  correct_answer: string | null;
  time_limit: number | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
  content_id?: string;
  channel_id?: string;
  channels?: {
    name: string;
  };
  content?: {
    id: string;
    title: string;
  };
}

interface Channel {
  id: string;
  name: string;
}

interface Content {
  id: string;
  title: string;
}

export function InteractionManagement() {
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingInteraction, setEditingInteraction] = useState<Interaction | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedContentId, setSelectedContentId] = useState<string>('');
  const [formData, setFormData] = useState({
    type: 'poll' as 'poll' | 'quiz' | 'rating' | 'reaction',
    title: '',
    description: '',
    channel_id: '',
    content_id: '',
    options: ['', ''],
    correct_answer: '',
    time_limit: 30,
    is_active: false,
    trigger_time: '', // When in video to trigger (MM:SS format)
    auto_activate: false // Auto-activate when video reaches trigger time
  });

  useEffect(() => {
    fetchInteractions();
    fetchChannels();
    fetchContent();
  }, []);

  const fetchInteractions = async () => {
    try {
      const response = await fetch('/api/interactions');
      const result = await response.json();
      
      if (result.success) {
        setInteractions(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to fetch interactions');
      }
    } catch (error) {
      console.error('Error fetching interactions:', error);
      toast.error('Failed to load interactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabase
        .from('channels')
        .select('id, name')
        .order('name');

      if (error) throw error;
      setChannels(data || []);
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('content')
        .select('id, title')
        .eq('is_published', true)
        .order('title');

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare options based on interaction type
      let options: any = {};
      
      if (formData.type === 'poll' || formData.type === 'quiz') {
        options = formData.options
          .filter(option => option.trim())
          .map((option, index) => ({
            id: String.fromCharCode(97 + index), // a, b, c, d
            text: option.trim()
          }));
      } else if (formData.type === 'rating') {
        options = {
          scale: 5,
          labels: ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']
        };
      } else if (formData.type === 'reaction') {
        options = {
          emojis: ['👍', '❤️', '😂', '😮', '👏', '🔥']
        };
      }

      const interactionData = {
        type: formData.type,
        title: formData.title,
        description: formData.description,
        channel_id: formData.channel_id || null,
        content_id: formData.content_id || null,
        options,
        correct_answer: formData.type === 'quiz' ? formData.correct_answer : null,
        time_limit: formData.time_limit || null,
        is_active: formData.is_active,
        starts_at: formData.is_active ? new Date().toISOString() : null,
        ends_at: formData.is_active && formData.time_limit 
          ? new Date(Date.now() + formData.time_limit * 1000).toISOString() 
          : null,
        metadata: {
          trigger_time: formData.trigger_time,
          auto_activate: formData.auto_activate,
          content_specific: !!formData.content_id
        }
      };

      if (editingInteraction) {
        // Update existing interaction
        const response = await fetch(`/api/interactions`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingInteraction.id, ...interactionData })
        });

        if (!response.ok) {
          throw new Error('Failed to update interaction');
        }
        
        toast.success('Interaction updated successfully');
      } else {
        // Create new interaction
        const response = await fetch('/api/interactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(interactionData)
        });

        if (!response.ok) {
          throw new Error('Failed to create interaction');
        }
        
        toast.success('Interaction created successfully');
      }

      // Reset form and close dialog
      setFormData({
        type: 'poll',
        title: '',
        description: '',
        channel_id: '',
        content_id: '',
        options: ['', ''],
        correct_answer: '',
        time_limit: 30,
        is_active: false,
        trigger_time: '',
        auto_activate: false
      });
      setIsCreateDialogOpen(false);
      setEditingInteraction(null);
      fetchInteractions();
    } catch (error) {
      console.error('Error saving interaction:', error);
      toast.error('Failed to save interaction');
    }
  };

  const handleEdit = (interaction: Interaction) => {
    setEditingInteraction(interaction);
    
    // Extract options based on type
    let options = ['', ''];
    if (interaction.type === 'poll' || interaction.type === 'quiz') {
      options = interaction.options.map((opt: any) => opt.text || '');
    }
    
    setFormData({
      type: interaction.type,
      title: interaction.title,
      description: interaction.description || interaction.question || '',
      channel_id: '', // Would need to fetch from relations
      content_id: '', // Would need to fetch from relations
      options,
      correct_answer: interaction.correct_answer || '',
      time_limit: interaction.time_limit || 30,
      is_active: interaction.is_active,
      trigger_time: interaction.metadata?.trigger_time || '',
      auto_activate: interaction.metadata?.auto_activate || false
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (interactionId: string) => {
    if (!confirm('Are you sure you want to delete this interaction?')) return;

    try {
      const response = await fetch(`/api/interactions`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: interactionId })
      });

      if (!response.ok) {
        throw new Error('Failed to delete interaction');
      }
      
      toast.success('Interaction deleted successfully');
      fetchInteractions();
    } catch (error) {
      console.error('Error deleting interaction:', error);
      toast.error('Failed to delete interaction');
    }
  };

  const toggleActive = async (interaction: Interaction) => {
    try {
      const newActiveState = !interaction.is_active;
      const updateData: any = { 
        id: interaction.id,
        type: interaction.type,
        title: interaction.title,
        description: interaction.description,
        options: interaction.options,
        correct_answer: interaction.correct_answer,
        content_id: interaction.content_id,
        channel_id: interaction.channel_id,
        metadata: interaction.metadata,
        is_active: newActiveState
      };

      if (newActiveState) {
        updateData.starts_at = new Date().toISOString();
        if (interaction.time_limit) {
          updateData.ends_at = new Date(Date.now() + interaction.time_limit * 1000).toISOString();
        }
      } else {
        updateData.ends_at = new Date().toISOString();
      }

      const response = await fetch('/api/interactions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        throw new Error('Failed to toggle interaction');
      }
      
      toast.success(`Interaction ${newActiveState ? 'activated' : 'deactivated'}`);
      fetchInteractions();
    } catch (error) {
      console.error('Error toggling interaction:', error);
      toast.error('Failed to toggle interaction');
    }
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, '']
    });
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData({
        ...formData,
        options: formData.options.filter((_, i) => i !== index)
      });
    }
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      options: newOptions
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'poll':
        return <BarChart3 className="h-4 w-4" />;
      case 'quiz':
        return <Trophy className="h-4 w-4" />;
      case 'rating':
        return <Star className="h-4 w-4" />;
      case 'reaction':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'poll':
        return 'bg-blue-500/20 text-blue-700 dark:text-blue-300';
      case 'quiz':
        return 'bg-orange-500/20 text-orange-700 dark:text-orange-300';
      case 'rating':
        return 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300';
      case 'reaction':
        return 'bg-purple-500/20 text-purple-700 dark:text-purple-300';
      default:
        return 'bg-gray-500/20 text-gray-700 dark:text-gray-300';
    }
  };

  const filteredInteractions = interactions.filter(interaction => {
    // Filter by content first - need to check the actual field from the database join
    if (selectedContentId && selectedContentId !== 'all') {
      // The interaction might have content_id field directly or through join
      const interactionContentId = interaction.content_id || interaction.content?.id;
      if (interactionContentId !== selectedContentId) {
        return false;
      }
    }
    
    // Then filter by tab
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return interaction.is_active;
    return interaction.type === activeTab;
  });

  const selectedContent = selectedContentId && selectedContentId !== 'all' 
    ? content.find(c => c.id === selectedContentId) 
    : null;

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
          <h2 className="text-2xl font-bold">Interaction Management</h2>
          <p className="text-muted-foreground">Create and manage polls, quizzes, ratings, and reactions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingInteraction(null);
              setFormData({
                type: 'poll',
                title: '',
                description: '',
                channel_id: '',
                content_id: '',
                options: ['', ''],
                correct_answer: '',
                time_limit: 30,
                is_active: false,
                trigger_time: '',
                auto_activate: false
              });
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Interaction
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingInteraction ? 'Edit Interaction' : 'Create New Interaction'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interaction type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="poll">Poll</SelectItem>
                    <SelectItem value="quiz">Quiz</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="reaction">Reaction</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter interaction title"
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">Question</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter your question"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="channel">Channel</Label>
                  <Select
                    value={formData.channel_id}
                    onValueChange={(value) => setFormData({ ...formData, channel_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a channel (optional)" />
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

                <div>
                  <Label htmlFor="content">Video Content</Label>
                  <Select
                    value={formData.content_id}
                    onValueChange={(value) => setFormData({ ...formData, content_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select video (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {content.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          <div className="flex items-center space-x-2">
                            <Video className="w-4 h-4" />
                            <span>{item.title}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {(formData.type === 'poll' || formData.type === 'quiz') && (
                <div>
                  <Label>Options</Label>
                  <div className="space-y-2">
                    {formData.options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Input
                          value={option}
                          onChange={(e) => updateOption(index, e.target.value)}
                          placeholder={`Option ${index + 1}`}
                          required
                        />
                        {formData.options.length > 2 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeOption(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {formData.options.length < 6 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addOption}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Option
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {formData.type === 'quiz' && (
                <div>
                  <Label htmlFor="correct_answer">Correct Answer</Label>
                  <Select
                    value={formData.correct_answer}
                    onValueChange={(value) => setFormData({ ...formData, correct_answer: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select correct answer" />
                    </SelectTrigger>
                    <SelectContent>
                      {formData.options.map((option, index) => (
                        option.trim() && (
                          <SelectItem key={index} value={String.fromCharCode(97 + index)}>
                            {String.fromCharCode(65 + index)}: {option}
                          </SelectItem>
                        )
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="time_limit">Time Limit (seconds)</Label>
                  <Input
                    id="time_limit"
                    type="number"
                    value={formData.time_limit}
                    onChange={(e) => setFormData({ ...formData, time_limit: parseInt(e.target.value) || 30 })}
                    min="10"
                    max="300"
                  />
                </div>

                {formData.content_id && (
                  <div>
                    <Label htmlFor="trigger_time">Trigger Time (MM:SS)</Label>
                    <Input
                      id="trigger_time"
                      value={formData.trigger_time}
                      onChange={(e) => setFormData({ ...formData, trigger_time: e.target.value })}
                      placeholder="e.g., 05:30"
                      pattern="[0-9]{1,2}:[0-9]{2}"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label htmlFor="is_active">Activate immediately</Label>
                </div>

                {formData.content_id && formData.trigger_time && (
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto_activate"
                      checked={formData.auto_activate}
                      onCheckedChange={(checked) => setFormData({ ...formData, auto_activate: checked })}
                    />
                    <Label htmlFor="auto_activate">Auto-activate at trigger time</Label>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingInteraction ? 'Update' : 'Create'} Interaction
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Content Filter and Templates */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <Label>Filter by Video Content</Label>
                <Select value={selectedContentId} onValueChange={setSelectedContentId}>
                  <SelectTrigger className="w-[300px]">
                    <SelectValue placeholder="All videos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All videos</SelectItem>
                    {content.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        <div className="flex items-center space-x-2">
                          <Video className="w-4 h-4" />
                          <span>{item.title}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedContent && (
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Video className="w-3 h-3" />
                    <span>{selectedContent.title}</span>
                  </Badge>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-sm text-muted-foreground">
                    {filteredInteractions.length} interaction(s)
                  </span>
                </div>
              )}
            </div>

            {selectedContent && (
              <ContentInteractionTemplates
                contentId={selectedContent.id}
                contentTitle={selectedContent.title}
                onTemplateApplied={() => {
                  fetchInteractions();
                  toast.success('Interaction templates applied successfully!');
                }}
              />
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="poll">Polls</TabsTrigger>
          <TabsTrigger value="quiz">Quizzes</TabsTrigger>
          <TabsTrigger value="rating">Ratings</TabsTrigger>
          <TabsTrigger value="reaction">Reactions</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredInteractions.map((interaction) => (
              <Card key={interaction.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      {getTypeIcon(interaction.type)}
                      <CardTitle className="text-lg line-clamp-1">{interaction.title}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Badge className={getTypeColor(interaction.type)}>
                        {interaction.type}
                      </Badge>
                      {interaction.is_active ? (
                        <Badge variant="default">
                          <Play className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline">
                          <Pause className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {interaction.description || interaction.question}
                    </p>

                    {/* Content Info */}
                    {interaction.content && (
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" className="flex items-center space-x-1">
                          <Video className="w-3 h-3" />
                          <span className="truncate max-w-[100px]">{interaction.content.title}</span>
                        </Badge>
                      </div>
                    )}

                    {/* Trigger Time Info */}
                    {interaction.metadata?.trigger_time && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Badge variant="outline" className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>@{interaction.metadata.trigger_time}</span>
                        </Badge>
                        {interaction.metadata?.auto_activate && (
                          <Badge variant="secondary" className="text-xs">
                            Auto-trigger
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      {interaction.time_limit && (
                        <div className="flex items-center space-x-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{interaction.time_limit}s</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{Math.floor(Math.random() * 500) + 50}</span>
                      </div>
                    </div>

                    {(interaction.type === 'poll' || interaction.type === 'quiz') && (
                      <div className="space-y-1">
                        {interaction.options.slice(0, 3).map((option: any, index: number) => (
                          <div key={index} className="flex items-center space-x-2 text-sm">
                            <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-xs">
                              {String.fromCharCode(65 + index)}
                            </span>
                            <span className="truncate">{option.text}</span>
                            {interaction.type === 'quiz' && interaction.correct_answer === option.id && (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            )}
                          </div>
                        ))}
                        {interaction.options.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{interaction.options.length - 3} more options
                          </p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(interaction)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(interaction.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant={interaction.is_active ? "destructive" : "default"}
                        onClick={() => toggleActive(interaction)}
                      >
                        {interaction.is_active ? (
                          <>
                            <Pause className="h-4 w-4 mr-1" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-1" />
                            Start
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredInteractions.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No interactions yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first interaction to engage with your audience
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Interaction
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}