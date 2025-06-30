'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Image as ImageIcon, Plus, Trash2, ExternalLink, Copy, CheckCircle } from 'lucide-react';

const companies = [
  'HungryHawk',
  'LiquidThunder', 
  'OutwestSteakhouse',
  'GalacticPizza',
  'PhoenixStateUniversity',
  'CubaTechnologies',
  'PrimeZoom',
  'CampusCash',
  'FitFlexGym'
];

const categories = [
  'general',
  'product-spotlight',
  'promotions', 
  'seasonal',
  'social-media',
  'display-ads',
  'banner-ads'
];

interface AdImage {
  id: string;
  title: string;
  description: string;
  company: string;
  category: string;
  filename: string;
  createdAt: string;
}

export function DirectR2Images() {
  const [images, setImages] = useState<AdImage[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Get R2 bucket URL from env (client-side)
  const [r2BucketUrl, setR2BucketUrl] = useState('');
  
  useEffect(() => {
    // Get the URL from environment variable or allow manual input
    const envUrl = process.env.NEXT_PUBLIC_R2_BUCKET_URL || '';
    setR2BucketUrl(envUrl);
  }, []);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    company: '',
    category: 'general',
    filename: ''
  });

  // Load images from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('r2AdImages');
    if (saved) {
      setImages(JSON.parse(saved));
    }
  }, []);

  // Save images to localStorage whenever images change
  useEffect(() => {
    localStorage.setItem('r2AdImages', JSON.stringify(images));
  }, [images]);

  const getImageUrl = (filename: string) => {
    return r2BucketUrl.endsWith('/') ? `${r2BucketUrl}${filename}` : `${r2BucketUrl}/${filename}`;
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      company: '',
      category: 'general',
      filename: ''
    });
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.company || !formData.filename) {
      alert('Please fill in title, company, and filename');
      return;
    }

    if (editingId) {
      // Update existing image
      setImages(images.map(img => 
        img.id === editingId 
          ? { ...img, ...formData }
          : img
      ));
    } else {
      // Add new image
      const newImage: AdImage = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date().toISOString()
      };
      setImages([newImage, ...images]);
    }

    resetForm();
  };

  const handleEdit = (image: AdImage) => {
    setFormData({
      title: image.title,
      description: image.description,
      company: image.company,
      category: image.category,
      filename: image.filename
    });
    setEditingId(image.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this image reference?')) {
      setImages(images.filter(img => img.id !== id));
    }
  };

  const copyUrl = (filename: string) => {
    const url = getImageUrl(filename);
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const imagesByCompany = companies.reduce((acc, company) => {
    acc[company] = images.filter(img => img.company === company);
    return acc;
  }, {} as Record<string, AdImage[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            R2 Ad Campaign Images
          </CardTitle>
          <CardDescription>
            Manage direct links to images in your R2 bucket root directory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* R2 Bucket URL Configuration */}
          <div className="space-y-2">
            <Label>R2 Bucket URL</Label>
            <Input
              value={r2BucketUrl}
              onChange={(e) => setR2BucketUrl(e.target.value)}
              placeholder="https://your-bucket.r2.cloudflarestorage.com"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Enter your R2 bucket&apos;s public URL. Images will be accessed as: [URL]/filename.jpg
            </p>
          </div>

          {!r2BucketUrl ? (
            <div className="text-center py-4 text-muted-foreground">
              Please enter your R2 bucket URL above to continue
            </div>
          ) : !showForm ? (
            <div className="text-center">
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Image Reference
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="e.g., Hungry Hawk Summer Special"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Company</Label>
                  <Select value={formData.company} onValueChange={(value) => setFormData({...formData, company: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company} value={company}>
                          {company}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Filename in R2 Root</Label>
                  <Input
                    value={formData.filename}
                    onChange={(e) => setFormData({...formData, filename: e.target.value})}
                    placeholder="image.jpg"
                    required
                  />
                  {formData.filename && r2BucketUrl && (
                    <p className="text-xs text-muted-foreground font-mono">
                      Full URL: {getImageUrl(formData.filename)}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description (Optional)</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the ad image..."
                  rows={3}
                />
              </div>

              {/* Preview */}
              {formData.filename && r2BucketUrl && (
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="border rounded-lg p-4">
                    <img 
                      src={getImageUrl(formData.filename)} 
                      alt="Preview" 
                      className="max-w-xs max-h-32 object-contain rounded"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling!.style.display = 'block';
                      }}
                    />
                    <div className="text-sm text-muted-foreground" style={{ display: 'none' }}>
                      Image not found or failed to load. Check the filename.
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit">
                  {editingId ? 'Update Image' : 'Add Image'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Images by Company */}
      {companies.map((company) => {
        const companyImages = imagesByCompany[company];
        if (companyImages.length === 0) return null;

        return (
          <Card key={company}>
            <CardHeader>
              <CardTitle>{company} ({companyImages.length} images)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companyImages.map((image) => (
                  <Card key={image.id} className="overflow-hidden">
                    <div className="aspect-video relative">
                      <img 
                        src={getImageUrl(image.filename)} 
                        alt={image.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/api/placeholder/400/225';
                        }}
                      />
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-medium mb-1">{image.title}</h4>
                      <p className="text-xs text-muted-foreground font-mono mb-2">
                        {image.filename}
                      </p>
                      {image.description && (
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {image.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline">{image.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(image.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyUrl(image.filename)}
                          className="flex-1"
                        >
                          {copiedUrl === getImageUrl(image.filename) ? (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          ) : (
                            <Copy className="w-3 h-3 mr-1" />
                          )}
                          {copiedUrl === getImageUrl(image.filename) ? 'Copied!' : 'Copy URL'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(getImageUrl(image.filename), '_blank')}
                        >
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(image)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(image.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}

      {images.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-8">
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No images yet</h3>
            <p className="text-muted-foreground mb-4">
              Add references to images already uploaded to your R2 bucket root
            </p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add First Image
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}