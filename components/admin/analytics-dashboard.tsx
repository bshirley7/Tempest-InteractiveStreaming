'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase/client';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Eye,
  MessageSquare,
  Clock,
  Star,
  Play,
  Download,
  Calendar,
  Activity
} from 'lucide-react';

interface AnalyticsData {
  totalViews: number;
  totalUsers: number;
  avgEngagement: number;
  totalInteractions: number;
  topChannels: Array<{
    name: string;
    views: number;
    engagement: number;
  }>;
  topContent: Array<{
    title: string;
    views: number;
    duration: number;
  }>;
  interactionStats: Array<{
    type: string;
    count: number;
    avgParticipation: number;
  }>;
  viewerTrends: Array<{
    date: string;
    viewers: number;
    engagement: number;
  }>;
}

export function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('views');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // In a real implementation, this would fetch from your analytics table
      // For now, we'll use mock data
      const mockData: AnalyticsData = {
        totalViews: 45678,
        totalUsers: 2847,
        avgEngagement: 89,
        totalInteractions: 1234,
        topChannels: [
          { name: 'Physics 101', views: 12345, engagement: 92 },
          { name: 'Chemistry Lab', views: 9876, engagement: 87 },
          { name: 'Math Fundamentals', views: 8765, engagement: 85 },
          { name: 'Biology Basics', views: 7654, engagement: 83 },
          { name: 'Computer Science', views: 6543, engagement: 90 }
        ],
        topContent: [
          { title: 'Quantum Mechanics Introduction', views: 5432, duration: 3600 },
          { title: 'Organic Chemistry Basics', views: 4321, duration: 2700 },
          { title: 'Calculus Fundamentals', views: 3210, duration: 4200 },
          { title: 'Cell Biology Overview', views: 2109, duration: 3300 },
          { title: 'Programming Concepts', views: 1987, duration: 5400 }
        ],
        interactionStats: [
          { type: 'Polls', count: 456, avgParticipation: 78 },
          { type: 'Quizzes', count: 234, avgParticipation: 65 },
          { type: 'Ratings', count: 345, avgParticipation: 82 },
          { type: 'Reactions', count: 1234, avgParticipation: 95 }
        ],
        viewerTrends: [
          { date: '2024-01-20', viewers: 2100, engagement: 85 },
          { date: '2024-01-21', viewers: 2300, engagement: 87 },
          { date: '2024-01-22', viewers: 2150, engagement: 83 },
          { date: '2024-01-23', viewers: 2450, engagement: 89 },
          { date: '2024-01-24', viewers: 2600, engagement: 91 },
          { date: '2024-01-25', viewers: 2800, engagement: 88 },
          { date: '2024-01-26', viewers: 2847, engagement: 89 }
        ]
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalytics(mockData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 90) return 'text-green-600';
    if (engagement >= 80) return 'text-yellow-600';
    if (engagement >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load analytics data</p>
        <Button onClick={fetchAnalytics} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
          <p className="text-muted-foreground">Track performance and engagement metrics</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +8% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Engagement</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.avgEngagement}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +5% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interactions</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalInteractions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 inline mr-1" />
              +15% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Channels */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Top Performing Channels
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topChannels.map((channel, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium">{channel.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {channel.views.toLocaleString()} views
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getEngagementColor(channel.engagement)}`}>
                      {channel.engagement}%
                    </p>
                    <p className="text-xs text-muted-foreground">engagement</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Play className="h-5 w-5 mr-2" />
              Top Content
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topContent.map((content, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium line-clamp-1">{content.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {content.views.toLocaleString()} views
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{formatDuration(content.duration)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interaction Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Interaction Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {analytics.interactionStats.map((stat, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{stat.type}</h4>
                  <Badge variant="secondary">{stat.count}</Badge>
                </div>
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Participation Rate</span>
                    <span className={getEngagementColor(stat.avgParticipation)}>
                      {stat.avgParticipation}%
                    </span>
                  </div>
                  <Progress value={stat.avgParticipation} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Viewer Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Viewer Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2 text-center">
              {analytics.viewerTrends.map((trend, index) => (
                <div key={index} className="space-y-2">
                  <div className="text-xs text-muted-foreground">
                    {new Date(trend.date).toLocaleDateString([], { weekday: 'short' })}
                  </div>
                  <div className="relative h-20 bg-muted rounded flex items-end justify-center">
                    <div 
                      className="bg-primary rounded-t w-full transition-all duration-300"
                      style={{ 
                        height: `${(trend.viewers / Math.max(...analytics.viewerTrends.map(t => t.viewers))) * 100}%`,
                        minHeight: '4px'
                      }}
                    />
                  </div>
                  <div className="text-xs font-medium">{trend.viewers}</div>
                  <div className={`text-xs ${getEngagementColor(trend.engagement)}`}>
                    {trend.engagement}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="h-5 w-5 mr-2" />
            Real-time Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Current viewers</span>
              <span className="font-bold text-green-600">2,847</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Active interactions</span>
              <span className="font-bold text-blue-600">8</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Messages per minute</span>
              <span className="font-bold text-purple-600">156</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Average session duration</span>
              <span className="font-bold text-orange-600">24m 32s</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}