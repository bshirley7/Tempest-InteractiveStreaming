'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Move, 
  Eye, 
  EyeOff, 
  Save,
  X,
  GripVertical,
  Grid3X3,
  LayoutList,
  MonitorPlay
} from 'lucide-react';
import { VideoContent } from '@/lib/types';

interface ContentShelf {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  layout_style: 'row' | 'grid' | 'hero';
  aspect_ratio: '16:9' | 'poster' | 'square';
  max_items: number;
  is_active: boolean;
  content?: VideoContent[];
}

interface ShelfFormData {
  name: string;
  description: string;
  layout_style: 'row' | 'grid' | 'hero';
  aspect_ratio: '16:9' | 'poster' | 'square';
  max_items: number;
}

export function ContentShelfManager() {
  const [shelves, setShelves] = useState<ContentShelf[]>([]);
  const [allContent, setAllContent] = useState<VideoContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingShelf, setEditingShelf] = useState<ContentShelf | null>(null);
  const [selectedShelf, setSelectedShelf] = useState<ContentShelf | null>(null);
  const [assignmentMode, setAssignmentMode] = useState(false);

  const [formData, setFormData] = useState<ShelfFormData>({
    name: '',
    description: '',
    layout_style: 'row',
    aspect_ratio: '16:9',
    max_items: 12
  });

  // Fetch shelves and content
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Fetching content shelves...');
      
      // Fetch shelves with content
      const shelvesResponse = await fetch('/api/content-shelves?include_content=true');
      console.log('📡 Shelves response status:', shelvesResponse.status);
      
      if (!shelvesResponse.ok) {
        throw new Error(`HTTP ${shelvesResponse.status}: ${shelvesResponse.statusText}`);
      }
      
      const shelvesResult = await shelvesResponse.json();
      console.log('📦 Shelves result:', shelvesResult);
      
      if (shelvesResult.success) {
        setShelves(shelvesResult.data || []);
        console.log('✅ Loaded', shelvesResult.data?.length || 0, 'shelves');
      } else {
        throw new Error(shelvesResult.error || 'Failed to fetch shelves');
      }

      // Fetch all content for assignment
      console.log('🔄 Fetching content for assignment...');
      const contentResponse = await fetch('/api/content?status=published&limit=200');
      console.log('📡 Content response status:', contentResponse.status);
      
      if (contentResponse.ok) {
        const contentResult = await contentResponse.json();
        console.log('📦 Content result:', contentResult);
        
        if (contentResult.success) {
          setAllContent(contentResult.data || []);
          console.log('✅ Loaded', contentResult.data?.length || 0, 'content items');
        }
      } else {
        console.warn('⚠️ Could not fetch content for assignment');
      }

    } catch (err) {
      console.error('❌ Error fetching data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateShelf = async () => {
    try {
      const response = await fetch('/api/content-shelves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          display_order: shelves.length + 1
        })
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchData();
        setShowCreateForm(false);
        resetForm();
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error creating shelf:', err);
      setError('Failed to create shelf');
    }
  };

  const handleUpdateShelf = async (shelf: ContentShelf) => {
    try {
      const response = await fetch(`/api/content-shelves/${shelf.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shelf)
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchData();
        setEditingShelf(null);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error updating shelf:', err);
      setError('Failed to update shelf');
    }
  };

  const handleDeleteShelf = async (shelfId: string) => {
    if (!confirm('Are you sure you want to delete this shelf?')) return;

    try {
      const response = await fetch(`/api/content-shelves/${shelfId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchData();
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error deleting shelf:', err);
      setError('Failed to delete shelf');
    }
  };

  const handleAssignContent = async (shelfId: string, contentId: string) => {
    try {
      const response = await fetch(`/api/content-shelves/${shelfId}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_id: contentId })
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchData();
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error assigning content:', err);
      setError('Failed to assign content');
    }
  };

  const handleRemoveContent = async (shelfId: string, contentId: string) => {
    try {
      const response = await fetch(`/api/content-shelves/${shelfId}/assignments?content_id=${contentId}`, {
        method: 'DELETE'
      });

      const result = await response.json();
      
      if (result.success) {
        await fetchData();
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error removing content:', err);
      setError('Failed to remove content');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      layout_style: 'row',
      aspect_ratio: '16:9',
      max_items: 12
    });
  };

  const getLayoutIcon = (style: string) => {
    switch (style) {
      case 'grid': return <Grid3X3 className="w-4 h-4" />;
      case 'hero': return <MonitorPlay className="w-4 h-4" />;
      default: return <LayoutList className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Content Shelf Manager</h2>
          <p className="text-gray-400">Create and manage custom content shelves for your library</p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-purple-600 hover:bg-purple-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Shelf
        </Button>
      </div>

      {error && (
        <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded">
          {error}
          <Button
            onClick={() => setError(null)}
            size="sm"
            variant="ghost"
            className="ml-2 text-red-400 hover:text-red-300"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Create/Edit Form */}
      {(showCreateForm || editingShelf) && (
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingShelf ? 'Edit Shelf' : 'Create New Shelf'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
              <input
                type="text"
                value={editingShelf ? editingShelf.name : formData.name}
                onChange={(e) => {
                  if (editingShelf) {
                    setEditingShelf({ ...editingShelf, name: e.target.value });
                  } else {
                    setFormData({ ...formData, name: e.target.value });
                  }
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                placeholder="Shelf name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Max Items</label>
              <input
                type="number"
                value={editingShelf ? editingShelf.max_items : formData.max_items}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 12;
                  if (editingShelf) {
                    setEditingShelf({ ...editingShelf, max_items: value });
                  } else {
                    setFormData({ ...formData, max_items: value });
                  }
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                min="1"
                max="50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Layout Style</label>
              <select
                value={editingShelf ? editingShelf.layout_style : formData.layout_style}
                onChange={(e) => {
                  const value = e.target.value as 'row' | 'grid' | 'hero';
                  if (editingShelf) {
                    setEditingShelf({ ...editingShelf, layout_style: value });
                  } else {
                    setFormData({ ...formData, layout_style: value });
                  }
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="row">Row (Horizontal scroll)</option>
                <option value="grid">Grid (2x4 layout)</option>
                <option value="hero">Hero (Large featured)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Aspect Ratio</label>
              <select
                value={editingShelf ? editingShelf.aspect_ratio : formData.aspect_ratio}
                onChange={(e) => {
                  const value = e.target.value as '16:9' | 'poster' | 'square';
                  if (editingShelf) {
                    setEditingShelf({ ...editingShelf, aspect_ratio: value });
                  } else {
                    setFormData({ ...formData, aspect_ratio: value });
                  }
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
              >
                <option value="16:9">16:9 (Widescreen)</option>
                <option value="poster">Poster (Tall)</option>
                <option value="square">Square</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
              <textarea
                value={editingShelf ? editingShelf.description || '' : formData.description}
                onChange={(e) => {
                  if (editingShelf) {
                    setEditingShelf({ ...editingShelf, description: e.target.value });
                  } else {
                    setFormData({ ...formData, description: e.target.value });
                  }
                }}
                className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white"
                placeholder="Shelf description"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateForm(false);
                setEditingShelf(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => editingShelf ? handleUpdateShelf(editingShelf) : handleCreateShelf()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {editingShelf ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      )}

      {/* Shelves List */}
      <div className="space-y-4">
        {shelves.map((shelf) => (
          <div key={shelf.id} className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <GripVertical className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold text-white">{shelf.name}</h3>
                      <Badge variant="outline" className="text-xs">
                        {getLayoutIcon(shelf.layout_style)}
                        <span className="ml-1">{shelf.layout_style}</span>
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {shelf.aspect_ratio}
                      </Badge>
                      {!shelf.is_active && (
                        <Badge variant="destructive" className="text-xs">Inactive</Badge>
                      )}
                    </div>
                    {shelf.description && (
                      <p className="text-gray-400 text-sm mt-1">{shelf.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge className="bg-purple-600 text-white">
                    {shelf.content?.length || 0} / {shelf.max_items}
                  </Badge>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedShelf(selectedShelf?.id === shelf.id ? null : shelf)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingShelf(shelf)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteShelf(shelf.id)}
                    className="text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Shelf Content & Assignment */}
            {selectedShelf?.id === shelf.id && (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-medium">Assigned Content</h4>
                  <Button
                    size="sm"
                    onClick={() => setAssignmentMode(!assignmentMode)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {assignmentMode ? 'Done' : 'Assign Content'}
                  </Button>
                </div>

                {assignmentMode && (
                  <div className="mb-6 bg-gray-900 rounded-lg p-4">
                    <h5 className="text-white font-medium mb-3">Available Content</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                      {allContent
                        .filter(content => !shelf.content?.find(c => c.id === content.id))
                        .map((content) => (
                          <div key={content.id} className="bg-gray-800 p-3 rounded border">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{content.title}</p>
                                <p className="text-gray-400 text-xs">{content.category || content.genre}</p>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => handleAssignContent(shelf.id, content.id)}
                                className="ml-2 bg-green-600 hover:bg-green-700"
                              >
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {shelf.content?.map((content) => (
                    <div key={content.id} className="bg-gray-700 p-3 rounded border">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{content.title}</p>
                          <p className="text-gray-400 text-xs">{content.category || content.genre}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveContent(shelf.id, content.id)}
                          className="ml-2 text-red-400 border-red-400 hover:bg-red-400 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {(!shelf.content || shelf.content.length === 0) && (
                  <div className="text-center py-8 text-gray-500">
                    No content assigned to this shelf yet.
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {shelves.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No content shelves created yet. Create your first shelf to get started!
        </div>
      )}
    </div>
  );
}