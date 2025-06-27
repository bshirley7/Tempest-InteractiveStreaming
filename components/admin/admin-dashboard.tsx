'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChannelManagement } from './channel-management';
import { ContentManagement } from './content-management';
import { InteractionManagement } from './interaction-management';
import { UpdatesManagement } from './updates-management';
import { AnalyticsDashboard } from './analytics-dashboard';
import { ContentLibrarySync } from './content-library-sync';
import BulkUploadPage from '../../app/admin/bulk-upload/page';
import { SimpleUpload } from './simple-upload';
import { SyncDashboard } from './sync-dashboard';
import { SimpleChannelManager } from './simple-channel-manager';
import { AdvertisingDashboard } from './advertising-dashboard';
import { ContentTypeManager } from './content-type-manager';
import AdTestPage from '../../app/admin/ad-test/page';
import { 
  Tv, 
  Video, 
  MessageSquare, 
  BarChart3,
  Megaphone,
  Users,
  Play,
  Clock,
  TrendingUp,
  Upload,
  Target,
  ChevronDown
} from 'lucide-react';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSubTab, setActiveSubTab] = useState('');

  // Mock data for overview
  const stats = {
    totalChannels: 12,
    totalContent: 156,
    activeInteractions: 8,
    totalUsers: 2847,
    liveViewers: 1234,
    avgEngagement: 89
  };

  // Navigation structure
  const navItems = {
    overview: { label: 'Overview', icon: BarChart3, hasSubMenu: false },
    channels: { 
      label: 'Channels', 
      icon: Tv, 
      hasSubMenu: true,
      subItems: {
        'channels-create': { label: 'Create & Manage', icon: Tv },
        'channels-assign': { label: 'Video Assignment', icon: Video }
      }
    },
    content: { 
      label: 'Content', 
      icon: Video, 
      hasSubMenu: true,
      subItems: {
        'content-simple-upload': { label: 'Simple Upload', icon: Upload },
        'content-bulk-upload': { label: 'Bulk Upload', icon: Upload },
        'content-management': { label: 'Content Library', icon: Video },
        'content-sync': { label: 'Sync Status', icon: Clock },
        'content-types': { label: 'Content Types', icon: Target }
      }
    },
    advertising: { 
      label: 'Advertising', 
      icon: Target, 
      hasSubMenu: true,
      subItems: {
        'advertising-dashboard': { label: 'Campaigns', icon: Target },
        'advertising-test': { label: 'Ad Testing', icon: Play }
      }
    },
    campus: { 
      label: 'Campus', 
      icon: Megaphone, 
      hasSubMenu: true,
      subItems: {
        'campus-updates': { label: 'Announcements', icon: Megaphone },
        'campus-interactions': { label: 'Interactions', icon: MessageSquare }
      }
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Set default sub-tab for sections with submenus
    if (navItems[tab as keyof typeof navItems]?.hasSubMenu) {
      const firstSubItem = Object.keys(navItems[tab as keyof typeof navItems].subItems || {})[0];
      setActiveSubTab(firstSubItem || '');
    } else {
      setActiveSubTab('');
    }
  };

  const handleSubTabChange = (subTab: string) => {
    setActiveSubTab(subTab);
  };

  const renderSubNavigation = () => {
    const currentNav = navItems[activeTab as keyof typeof navItems];
    if (!currentNav?.hasSubMenu || !currentNav.subItems) return null;

    return (
      <div className="mb-6">
        <div className="border-b">
          <nav className="flex space-x-8">
            {Object.entries(currentNav.subItems).map(([key, item]) => {
              const Icon = item.icon;
              return (
                <button
                  key={key}
                  onClick={() => handleSubTabChange(key)}
                  className={`flex items-center space-x-2 py-3 px-1 border-b-2 text-sm font-medium transition-colors ${
                    activeSubTab === key
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage channels, content, and interactions for your university streaming platform
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          {Object.entries(navItems).map(([key, item]) => {
            const Icon = item.icon;
            return (
              <TabsTrigger key={key} value={key} className="flex items-center space-x-2">
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {renderSubNavigation()}

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Channels</CardTitle>
                <Tv className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalChannels}</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Content Library</CardTitle>
                <Video className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalContent}</div>
                <p className="text-xs text-muted-foreground">
                  +12 videos this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Interactions</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeInteractions}</div>
                <p className="text-xs text-muted-foreground">
                  Polls, quizzes, and ratings
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +180 new this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Live Viewers</CardTitle>
                <Play className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.liveViewers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Currently watching
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.avgEngagement}%</div>
                <p className="text-xs text-muted-foreground">
                  +5% from last week
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New channel created: "Physics 101"</p>
                      <p className="text-xs text-muted-foreground">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Content uploaded: "Quantum Mechanics Lecture"</p>
                      <p className="text-xs text-muted-foreground">4 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Poll created: "Understanding Today's Topic"</p>
                      <p className="text-xs text-muted-foreground">6 hours ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleTabChange('channels')}
                    className="p-4 border rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <Tv className="h-6 w-6 mb-2 text-primary" />
                    <p className="font-medium">Channels</p>
                    <p className="text-xs text-muted-foreground">Create and manage channels</p>
                  </button>
                  <button 
                    onClick={() => handleTabChange('content')}
                    className="p-4 border rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <Video className="h-6 w-6 mb-2 text-primary" />
                    <p className="font-medium">Content</p>
                    <p className="text-xs text-muted-foreground">Upload and manage videos</p>
                  </button>
                  <button 
                    onClick={() => handleTabChange('advertising')}
                    className="p-4 border rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <Target className="h-6 w-6 mb-2 text-primary" />
                    <p className="font-medium">Advertising</p>
                    <p className="text-xs text-muted-foreground">Manage ad campaigns</p>
                  </button>
                  <button 
                    onClick={() => handleTabChange('campus')}
                    className="p-4 border rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <Megaphone className="h-6 w-6 mb-2 text-primary" />
                    <p className="font-medium">Campus</p>
                    <p className="text-xs text-muted-foreground">Announcements and interactions</p>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Channels Section */}
        <TabsContent value="channels">
          {activeSubTab === 'channels-create' && <ChannelManagement />}
          {activeSubTab === 'channels-assign' && <SimpleChannelManager />}
        </TabsContent>

        {/* Content Section */}
        <TabsContent value="content">
          {activeSubTab === 'content-simple-upload' && <SimpleUpload />}
          {activeSubTab === 'content-bulk-upload' && <BulkUploadPage />}
          {activeSubTab === 'content-management' && (
            <div className="space-y-6">
              <ContentLibrarySync />
              <ContentManagement />
            </div>
          )}
          {activeSubTab === 'content-sync' && <SyncDashboard />}
          {activeSubTab === 'content-types' && <ContentTypeManager />}
        </TabsContent>

        {/* Advertising Section */}
        <TabsContent value="advertising">
          {activeSubTab === 'advertising-dashboard' && <AdvertisingDashboard />}
          {activeSubTab === 'advertising-test' && <AdTestPage />}
        </TabsContent>

        {/* Campus Section */}
        <TabsContent value="campus">
          {activeSubTab === 'campus-updates' && <UpdatesManagement />}
          {activeSubTab === 'campus-interactions' && <InteractionManagement />}
        </TabsContent>

      </Tabs>
    </div>
  );
}