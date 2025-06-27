'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  ArrowLeft, 
  Video, 
  Image, 
  Target, 
  Calendar,
  DollarSign,
  Eye,
  MousePointer,
  Plus,
  Play,
  RefreshCw
} from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  description?: string;
  advertiser_name: string;
  start_date: string;
  end_date: string;
  budget_limit?: number;
  daily_budget_limit?: number;
  is_active: boolean;
  total_impressions: number;
  total_clicks: number;
  total_spend: number;
  computed_status?: string;
  created_at: string;
}

interface CampaignDetailProps {
  campaignId: string;
  onBack: () => void;
}

export function CampaignDetail({ campaignId, onBack }: CampaignDetailProps) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [adVideos, setAdVideos] = useState([]);
  const [overlayAssets, setOverlayAssets] = useState([]);
  const [placements, setPlacements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showVideoForm, setShowVideoForm] = useState(false);
  const [showImageForm, setShowImageForm] = useState(false);
  const [showPlacementForm, setShowPlacementForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);

  useEffect(() => {
    fetchCampaignData();
  }, [campaignId]);

  const fetchCampaignData = async () => {
    try {
      setLoading(true);
      
      // Fetch campaign details
      const campaignResponse = await fetch(`/api/admin/ad-campaigns?id=${campaignId}`);
      const campaignData = await campaignResponse.json();
      
      if (campaignData.success && campaignData.data.length > 0) {
        setCampaign(campaignData.data[0]);
      }

      // Fetch campaign's ad videos
      const videosResponse = await fetch(`/api/admin/ad-videos?campaign_id=${campaignId}`);
      const videosData = await videosResponse.json();
      if (videosData.success) {
        setAdVideos(videosData.data);
      }

      // Fetch campaign's overlay assets (we'll need to filter these)
      const assetsResponse = await fetch(`/api/admin/ad-overlay-assets`);
      const assetsData = await assetsResponse.json();
      if (assetsData.success) {
        setOverlayAssets(assetsData.data);
      }

      // Fetch campaign's placements
      const placementsResponse = await fetch(`/api/admin/ad-placements?campaign_id=${campaignId}`);
      const placementsData = await placementsResponse.json();
      if (placementsData.success) {
        setPlacements(placementsData.data);
      }

    } catch (err) {
      console.error('Error fetching campaign data:', err);
      setError('Failed to load campaign data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVideo = async (videoData: any) => {
    try {
      setFormLoading(true);
      setFormError(null);
      
      const response = await fetch('/api/admin/ad-videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...videoData,
          campaign_id: campaignId,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to add video');
      }
      
      // Refresh data
      fetchCampaignData();
      setShowVideoForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add video');
    } finally {
      setFormLoading(false);
    }
  };
  
  const handleAddImage = async (imageData: any) => {
    try {
      setFormLoading(true);
      setFormError(null);
      
      const response = await fetch('/api/admin/ad-overlay-assets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(imageData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to add image');
      }
      
      // Refresh data
      fetchCampaignData();
      setShowImageForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to add image');
    } finally {
      setFormLoading(false);
    }
  };
  
  const handleCreatePlacement = async (placementData: any) => {
    try {
      setFormLoading(true);
      setFormError(null);
      
      const response = await fetch('/api/admin/ad-placements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...placementData,
          campaign_id: campaignId,
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create placement');
      }
      
      // Refresh data
      fetchCampaignData();
      setShowPlacementForm(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to create placement');
    } finally {
      setFormLoading(false);
    }
  };

  const handleSyncVideoStatus = async () => {
    try {
      setSyncLoading(true);
      
      const response = await fetch('/api/admin/ad-videos/sync-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ check_all: true }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to sync video status');
      }
      
      // Refresh campaign data to show updated statuses
      fetchCampaignData();
      
      console.log('Video status sync result:', result);
    } catch (err) {
      console.error('Error syncing video status:', err);
      setError('Failed to sync video status with Cloudflare Stream');
    } finally {
      setSyncLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'active': 'default',
      'upcoming': 'secondary',
      'ended': 'outline'
    };
    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p>Loading campaign details...</p>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error || 'Campaign not found'}</p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Campaigns
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button onClick={onBack} variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{campaign.name}</h1>
            <p className="text-muted-foreground">by {campaign.advertiser_name}</p>
          </div>
        </div>
        {getStatusBadge(campaign.computed_status || 'active')}
      </div>

      {/* Campaign Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Impressions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.total_impressions.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clicks</CardTitle>
            <MousePointer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaign.total_clicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {campaign.total_impressions > 0 
                ? `${((campaign.total_clicks / campaign.total_impressions) * 100).toFixed(2)}% CTR`
                : '0% CTR'
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Spend</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(campaign.total_spend)}</div>
            {campaign.budget_limit && (
              <p className="text-xs text-muted-foreground">
                of {formatCurrency(campaign.budget_limit)} budget
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schedule</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <p>{formatDate(campaign.start_date)}</p>
              <p className="text-muted-foreground">to {formatDate(campaign.end_date)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Content Management */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="videos">Ad Videos ({adVideos.length})</TabsTrigger>
          <TabsTrigger value="assets">Images ({overlayAssets.length})</TabsTrigger>
          <TabsTrigger value="placements">Placements ({placements.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {campaign.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{campaign.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Campaign Schedule</h4>
                  <p className="text-sm text-muted-foreground">
                    Starts: {formatDate(campaign.start_date)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ends: {formatDate(campaign.end_date)}
                  </p>
                </div>
                
                {(campaign.budget_limit || campaign.daily_budget_limit) && (
                  <div>
                    <h4 className="font-medium mb-2">Budget Settings</h4>
                    {campaign.budget_limit && (
                      <p className="text-sm text-muted-foreground">
                        Total Budget: {formatCurrency(campaign.budget_limit)}
                      </p>
                    )}
                    {campaign.daily_budget_limit && (
                      <p className="text-sm text-muted-foreground">
                        Daily Budget: {formatCurrency(campaign.daily_budget_limit)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Video className="h-5 w-5" />
                <span>Ad Videos</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSyncVideoStatus}
                  disabled={syncLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${syncLoading ? 'animate-spin' : ''}`} />
                  {syncLoading ? 'Syncing...' : 'Sync Status'}
                </Button>
                <Dialog open={showVideoForm} onOpenChange={setShowVideoForm}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Video
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Add Ad Video</DialogTitle>
                  </DialogHeader>
                  <VideoForm onSubmit={handleAddVideo} loading={formLoading} error={formError} />
                </DialogContent>
              </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {adVideos.length === 0 ? (
                <div className="text-center py-8">
                  <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Ad Videos</h3>
                  <p className="text-muted-foreground mb-4">
                    Upload video advertisements for this campaign.
                  </p>
                  <Dialog open={showVideoForm} onOpenChange={setShowVideoForm}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Upload First Video
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Ad Video</DialogTitle>
                      </DialogHeader>
                      <VideoForm onSubmit={handleAddVideo} loading={formLoading} error={formError} />
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {adVideos.map((video: any) => (
                    <Card key={video.id} className="p-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Play className="h-4 w-4" />
                        <span className="font-medium">{video.title}</span>
                        <Badge variant={
                          video.approval_status === 'approved' ? 'default' :
                          video.approval_status === 'processing' ? 'secondary' :
                          video.approval_status === 'rejected' ? 'destructive' :
                          'outline'
                        }>
                          {video.approval_status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {video.duration}s • {video.cloudflare_video_id}
                      </p>
                      {video.approval_status === 'pending' && (
                        <p className="text-xs text-orange-600 mt-1">
                          Upload may still be processing in Cloudflare Stream
                        </p>
                      )}
                      {video.approval_status === 'processing' && (
                        <p className="text-xs text-blue-600 mt-1">
                          Video is being processed by Cloudflare Stream
                        </p>
                      )}
                      {video.approval_status === 'rejected' && (
                        <p className="text-xs text-red-600 mt-1">
                          Video failed processing or was not found
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Image className="h-5 w-5" />
                <span>Overlay Images</span>
              </CardTitle>
              <Dialog open={showImageForm} onOpenChange={setShowImageForm}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload Overlay Image</DialogTitle>
                  </DialogHeader>
                  <ImageForm onSubmit={handleAddImage} loading={formLoading} error={formError} />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Overlay Images</h3>
                <p className="text-muted-foreground mb-4">
                  Upload image overlays to display with your ads.
                </p>
                <Dialog open={showImageForm} onOpenChange={setShowImageForm}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Upload First Image
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Upload Overlay Image</DialogTitle>
                    </DialogHeader>
                    <ImageForm onSubmit={handleAddImage} loading={formLoading} error={formError} />
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="placements" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5" />
                <span>Ad Placements</span>
              </CardTitle>
              <Dialog open={showPlacementForm} onOpenChange={setShowPlacementForm}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Placement
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Create Ad Placement</DialogTitle>
                  </DialogHeader>
                  <PlacementForm onSubmit={handleCreatePlacement} loading={formLoading} error={formError} adVideos={adVideos} overlayAssets={overlayAssets} />
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {placements.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Ad Placements</h3>
                  <p className="text-muted-foreground mb-4">
                    Create placements to control where and when your ads appear.
                  </p>
                  <Dialog open={showPlacementForm} onOpenChange={setShowPlacementForm}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create First Placement
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                      <DialogHeader>
                        <DialogTitle>Create Ad Placement</DialogTitle>
                      </DialogHeader>
                      <PlacementForm onSubmit={handleCreatePlacement} loading={formLoading} error={formError} adVideos={adVideos} overlayAssets={overlayAssets} />
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="space-y-4">
                  {placements.map((placement: any) => (
                    <Card key={placement.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{placement.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {placement.placement_type} • {placement.target_type}
                          </p>
                        </div>
                        <Badge variant={placement.is_active ? 'default' : 'secondary'}>
                          {placement.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Video Form Component
function VideoForm({ onSubmit, loading, error }: { onSubmit: (data: any) => void; loading: boolean; error: string | null }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cloudflare_video_id: '',
    duration: '',
    advertiser_name: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      duration: parseInt(formData.duration),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Video Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="cloudflare_video_id">Cloudflare Video ID *</Label>
        <Input
          id="cloudflare_video_id"
          value={formData.cloudflare_video_id}
          onChange={(e) => setFormData({ ...formData, cloudflare_video_id: e.target.value })}
          placeholder="e.g., abc123def456ghi789"
          required
        />
        <p className="text-xs text-muted-foreground">
          This is the unique ID from Cloudflare Stream. The video will be marked as "pending" until Cloudflare finishes processing.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="duration">Duration (seconds) *</Label>
        <Input
          id="duration"
          type="number"
          min="1"
          value={formData.duration}
          onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="advertiser_name">Advertiser Name</Label>
        <Input
          id="advertiser_name"
          value={formData.advertiser_name}
          onChange={(e) => setFormData({ ...formData, advertiser_name: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Adding Video...' : 'Add Video'}
      </Button>
      
      <div className="text-xs text-muted-foreground border-t pt-3">
        <p className="font-medium mb-1">📝 Note about video processing:</p>
        <ul className="space-y-1 text-xs">
          <li>• Videos start as "pending" until Cloudflare Stream processing completes</li>
          <li>• Use the "Sync Status" button to check processing progress</li>
          <li>• Only "approved" videos can be used in active ad placements</li>
        </ul>
      </div>
    </form>
  );
}

// Image Form Component
function ImageForm({ onSubmit, loading, error }: { onSubmit: (data: any) => void; loading: boolean; error: string | null }) {
  const [formData, setFormData] = useState({
    name: '',
    cloudflare_r2_url: '',
    cloudflare_r2_key: '',
    file_type: 'image/jpeg',
    alt_text: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Image Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="cloudflare_r2_url">Cloudflare R2 URL *</Label>
        <Input
          id="cloudflare_r2_url"
          type="url"
          value={formData.cloudflare_r2_url}
          onChange={(e) => setFormData({ ...formData, cloudflare_r2_url: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="cloudflare_r2_key">Cloudflare R2 Key *</Label>
        <Input
          id="cloudflare_r2_key"
          value={formData.cloudflare_r2_key}
          onChange={(e) => setFormData({ ...formData, cloudflare_r2_key: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="file_type">File Type *</Label>
        <Select value={formData.file_type} onValueChange={(value) => setFormData({ ...formData, file_type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="image/jpeg">JPEG</SelectItem>
            <SelectItem value="image/png">PNG</SelectItem>
            <SelectItem value="image/gif">GIF</SelectItem>
            <SelectItem value="image/webp">WebP</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="alt_text">Alt Text</Label>
        <Input
          id="alt_text"
          value={formData.alt_text}
          onChange={(e) => setFormData({ ...formData, alt_text: e.target.value })}
        />
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Uploading Image...' : 'Upload Image'}
      </Button>
    </form>
  );
}

// Placement Form Component
function PlacementForm({ 
  onSubmit, 
  loading, 
  error, 
  adVideos, 
  overlayAssets 
}: { 
  onSubmit: (data: any) => void; 
  loading: boolean; 
  error: string | null;
  adVideos: any[];
  overlayAssets: any[];
}) {
  const [formData, setFormData] = useState({
    name: '',
    ad_video_id: '',
    overlay_asset_id: '',
    placement_type: 'pre_roll',
    target_type: 'global',
    ad_copy: '',
    call_to_action: '',
    click_url: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      overlay_asset_id: formData.overlay_asset_id || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Placement Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="ad_video_id">Ad Video *</Label>
        <Select value={formData.ad_video_id} onValueChange={(value) => setFormData({ ...formData, ad_video_id: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select ad video" />
          </SelectTrigger>
          <SelectContent>
            {adVideos.map((video) => (
              <SelectItem key={video.id} value={video.id}>
                {video.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="placement_type">Placement Type *</Label>
        <Select value={formData.placement_type} onValueChange={(value) => setFormData({ ...formData, placement_type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pre_roll">Pre-roll</SelectItem>
            <SelectItem value="mid_roll">Mid-roll</SelectItem>
            <SelectItem value="end_roll">End-roll</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="target_type">Target Type *</Label>
        <Select value={formData.target_type} onValueChange={(value) => setFormData({ ...formData, target_type: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="global">Global (All Content)</SelectItem>
            <SelectItem value="content">Specific Content</SelectItem>
            <SelectItem value="channel">Specific Channel</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {overlayAssets.length > 0 && (
        <div className="space-y-2">
          <Label htmlFor="overlay_asset_id">Overlay Image (Optional)</Label>
          <Select value={formData.overlay_asset_id} onValueChange={(value) => setFormData({ ...formData, overlay_asset_id: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select overlay image" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No overlay</SelectItem>
              {overlayAssets.map((asset) => (
                <SelectItem key={asset.id} value={asset.id}>
                  {asset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="space-y-2">
        <Label htmlFor="ad_copy">Ad Copy</Label>
        <Textarea
          id="ad_copy"
          value={formData.ad_copy}
          onChange={(e) => setFormData({ ...formData, ad_copy: e.target.value })}
          rows={2}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="call_to_action">Call to Action</Label>
        <Input
          id="call_to_action"
          value={formData.call_to_action}
          onChange={(e) => setFormData({ ...formData, call_to_action: e.target.value })}
          placeholder="Learn More, Shop Now, etc."
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="click_url">Click URL</Label>
        <Input
          id="click_url"
          type="url"
          value={formData.click_url}
          onChange={(e) => setFormData({ ...formData, click_url: e.target.value })}
        />
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      
      <Button type="submit" disabled={loading || !formData.ad_video_id} className="w-full">
        {loading ? 'Creating Placement...' : 'Create Placement'}
      </Button>
    </form>
  );
}