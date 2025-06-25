'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChannelManagement } from './channel-management';
import { ContentManagement } from './content-management';
import { InteractionManagement } from './interaction-management';
import { UpdatesManagement } from './updates-management';
import { AnalyticsDashboard } from './analytics-dashboard';
import { ContentLibrarySync } from './content-library-sync';
import BulkUploadPage from '../../app/admin/bulk-upload/page';
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
  Upload
} from 'lucide-react';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data for overview
  const stats = {
    totalChannels: 12,
    totalContent: 156,
    activeInteractions: 8,
    totalUsers: 2847,
    liveViewers: 1234,
    avgEngagement: 89
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage channels, content, and interactions for your university streaming platform
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="channels">Channels</TabsTrigger>
          <TabsTrigger value="bulk-upload">Bulk Upload</TabsTrigger>
          <TabsTrigger value="updates">Updates</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="interactions">Interactions</TabsTrigger>
        </TabsList>

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
                    onClick={() => setActiveTab('channels')}
                    className="p-4 border rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <Tv className="h-6 w-6 mb-2 text-primary" />
                    <p className="font-medium">Create Channel</p>
                    <p className="text-xs text-muted-foreground">Set up a new streaming channel</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('updates')}
                    className="p-4 border rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <Megaphone className="h-6 w-6 mb-2 text-primary" />
                    <p className="font-medium">Campus Updates</p>
                    <p className="text-xs text-muted-foreground">Manage campus announcements</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('bulk-upload')}
                    className="p-4 border rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <Upload className="h-6 w-6 mb-2 text-primary" />
                    <p className="font-medium">Bulk Upload</p>
                    <p className="text-xs text-muted-foreground">Upload multiple videos with metadata</p>
                  </button>
                  <button 
                    onClick={() => setActiveTab('interactions')}
                    className="p-4 border rounded-lg hover:bg-muted transition-colors text-left"
                  >
                    <MessageSquare className="h-6 w-6 mb-2 text-primary" />
                    <p className="font-medium">Create Poll</p>
                    <p className="text-xs text-muted-foreground">Engage with your audience</p>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="channels">
          <ChannelManagement />
        </TabsContent>

        <TabsContent value="bulk-upload">
          <BulkUploadPage />
        </TabsContent>

        <TabsContent value="updates">
          <UpdatesManagement />
        </TabsContent>

        <TabsContent value="content">
          <div className="space-y-6">
            <ContentLibrarySync />
            <ContentManagement />
          </div>
        </TabsContent>

        <TabsContent value="interactions">
          <InteractionManagement />
        </TabsContent>

      </Tabs>
    </div>
  );
}