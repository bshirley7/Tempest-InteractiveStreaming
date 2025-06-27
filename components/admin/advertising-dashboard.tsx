'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CampaignBuilder } from './campaign-builder';
import { CampaignDetail } from './campaign-detail';
import { 
  Play, 
  Image, 
  Target, 
  BarChart3,
  Plus,
  Video,
  DollarSign,
  Eye,
  MousePointer,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface AdvertisingDashboardProps {
  className?: string;
}

export function AdvertisingDashboard({ className }: AdvertisingDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleCampaignSuccess = (campaign: any) => {
    console.log('Campaign created successfully:', campaign);
    setShowCampaignForm(false);
    // Refresh campaigns list
    fetchCampaigns();
    // Navigate to the new campaign's detail view
    if (campaign?.id) {
      setSelectedCampaignId(campaign.id);
    }
  };

  const handleViewCampaign = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setActiveTab('campaigns');
  };

  const handleBackToCampaigns = () => {
    setSelectedCampaignId(null);
    setShowCampaignForm(false);
  };

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/ad-campaigns');
      const result = await response.json();
      
      if (result.success) {
        setCampaigns(result.data);
      } else {
        setError('Failed to load campaigns');
      }
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = () => {
    setActiveTab('campaigns');
    setShowCampaignForm(true);
  };

  // Calculate stats from real campaign data
  const stats = {
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.computed_status === 'active').length,
    totalAdVideos: 0, // TODO: Fetch from ad_videos table
    totalOverlayAssets: 0, // TODO: Fetch from ad_overlay_assets table
    totalPlacements: 0, // TODO: Fetch from ad_placements table
    activePlacements: 0, // TODO: Calculate from placements
    totalImpressions: campaigns.reduce((sum, c) => sum + (c.total_impressions || 0), 0),
    totalClicks: campaigns.reduce((sum, c) => sum + (c.total_clicks || 0), 0),
    totalSpend: campaigns.reduce((sum, c) => sum + (c.total_spend || 0), 0),
    ctr: campaigns.reduce((sum, c) => sum + (c.total_impressions || 0), 0) > 0 
      ? parseFloat(((campaigns.reduce((sum, c) => sum + (c.total_clicks || 0), 0) / campaigns.reduce((sum, c) => sum + (c.total_impressions || 0), 0)) * 100).toFixed(2))
      : 0,
    avgCpm: 0 // TODO: Calculate from spend and impressions
  };

  // Use real campaign data, limited to most recent 5
  const recentCampaigns = campaigns.slice(0, 5).map(campaign => ({
    id: campaign.id,
    name: campaign.name,
    advertiser: campaign.advertiser_name,
    status: campaign.computed_status,
    budget: campaign.budget_limit || 0,
    spent: campaign.total_spend || 0,
    impressions: campaign.total_impressions || 0,
    clicks: campaign.total_clicks || 0,
    ctr: campaign.total_impressions > 0 
      ? parseFloat(((campaign.total_clicks / campaign.total_impressions) * 100).toFixed(2))
      : 0
  }));

  const topPerformingPlacements = [
    {
      id: '1',
      name: 'Homepage Pre-roll',
      type: 'pre_roll',
      target: 'Global',
      impressions: 23456,
      clicks: 345,
      ctr: 1.47,
      completions: 18234
    },
    {
      id: '2',
      name: 'Lecture Videos Mid-roll',
      type: 'mid_roll',
      target: 'Academic Channel',
      impressions: 18765,
      clicks: 234,
      ctr: 1.25,
      completions: 15432
    },
    {
      id: '3',
      name: 'Campus Events End-roll',
      type: 'end_roll',
      target: 'Events Channel',
      impressions: 12345,
      clicks: 189,
      ctr: 1.53,
      completions: 9876
    }
  ];

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Advertising Management</h2>
        <p className="text-muted-foreground">
          Manage ad campaigns, videos, and placements for your streaming platform
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="videos">Ad Videos</TabsTrigger>
          <TabsTrigger value="assets">Overlay Assets</TabsTrigger>
          <TabsTrigger value="placements">Placements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeCampaigns}</div>
                <p className="text-xs text-muted-foreground">
                  of {stats.totalCampaigns} total campaigns
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Impressions</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalImpressions.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Click-through Rate</CardTitle>
                <MousePointer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.ctr}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalClicks.toLocaleString()} total clicks
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalSpend.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  ${stats.avgCpm} avg CPM
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  onClick={handleCreateCampaign}
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  variant="outline"
                >
                  <Plus className="h-6 w-6" />
                  <span>New Campaign</span>
                </Button>
                
                <Button 
                  onClick={() => setActiveTab('videos')}
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  variant="outline"
                >
                  <Video className="h-6 w-6" />
                  <span>Upload Ad Video</span>
                </Button>
                
                <Button 
                  onClick={() => setActiveTab('assets')}
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  variant="outline"
                >
                  <Image className="h-6 w-6" />
                  <span>Add Overlay Asset</span>
                </Button>
                
                <Button 
                  onClick={() => setActiveTab('placements')}
                  className="h-auto p-4 flex flex-col items-center space-y-2"
                  variant="outline"
                >
                  <Target className="h-6 w-6" />
                  <span>Create Placement</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Campaigns */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p>Loading campaigns...</p>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error}</p>
                  <Button onClick={fetchCampaigns} variant="outline">
                    Retry
                  </Button>
                </div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Campaigns Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first advertising campaign to start managing ads.
                  </p>
                  <Button onClick={() => setShowCampaignForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Campaign
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentCampaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleViewCampaign(campaign.id)}>
                      <div className="space-y-1">
                        <h4 className="font-medium">{campaign.name}</h4>
                        <p className="text-sm text-muted-foreground">{campaign.advertiser}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            ${campaign.spent.toFixed(2)} / ${campaign.budget.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-medium">{campaign.impressions.toLocaleString()} impressions</p>
                        <p className="text-sm text-muted-foreground">{campaign.clicks} clicks ({campaign.ctr}% CTR)</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Performing Placements */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Placements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformingPlacements.map((placement) => (
                  <div key={placement.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-medium">{placement.name}</h4>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{placement.type.replace('_', '-')}</Badge>
                        <span className="text-sm text-muted-foreground">{placement.target}</span>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium">{placement.ctr}% CTR</p>
                      <p className="text-sm text-muted-foreground">
                        {placement.impressions.toLocaleString()} impressions
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {placement.completions.toLocaleString()} completions
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          {selectedCampaignId ? (
            <CampaignDetail 
              campaignId={selectedCampaignId}
              onBack={handleBackToCampaigns}
            />
          ) : showCampaignForm ? (
            <CampaignBuilder 
              onSuccess={handleCampaignSuccess}
              onCancel={() => setShowCampaignForm(false)}
            />
          ) : (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Campaign Management</CardTitle>
                <Button onClick={() => setShowCampaignForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Campaign
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCampaigns.map((campaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleViewCampaign(campaign.id)}>
                      <div className="space-y-1">
                        <h4 className="font-medium">{campaign.name}</h4>
                        <p className="text-sm text-muted-foreground">{campaign.advertiser}</p>
                        <div className="flex items-center space-x-2">
                          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                            {campaign.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            ${campaign.spent.toLocaleString()} / ${campaign.budget.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-sm font-medium">{campaign.impressions.toLocaleString()} impressions</p>
                        <p className="text-sm text-muted-foreground">{campaign.clicks} clicks ({campaign.ctr}% CTR)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ad Video Library</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Ad Video Management</h3>
                <p className="text-muted-foreground mb-4">
                  Upload and manage video advertisements stored in Cloudflare Stream.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Ad Video
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Overlay Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Overlay Asset Management</h3>
                <p className="text-muted-foreground mb-4">
                  Manage image overlays stored in Cloudflare R2 for ad displays.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Overlay Asset
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="placements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ad Placements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Placement Configuration</h3>
                <p className="text-muted-foreground mb-4">
                  Configure where and how ads are shown across your content and channels.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Placement
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advertising Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Performance Analytics</h3>
                <p className="text-muted-foreground mb-4">
                  Track ad performance, engagement metrics, and campaign ROI.
                </p>
                <Button>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Detailed Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}