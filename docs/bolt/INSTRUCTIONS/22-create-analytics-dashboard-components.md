# Step 22: Create Analytics Dashboard Components

## Context
You are building Tempest, an interactive streaming platform. This step creates comprehensive analytics dashboard components for tracking viewership, engagement, revenue, and user behavior with real-time charts and metrics using Recharts and precise Tailwind CSS styling.

## Purpose
Analytics dashboards provide content creators and administrators with actionable insights into platform performance, user engagement, and content effectiveness. Components must display complex data in clear, interactive visualizations with real-time updates.

## Prerequisites
- Step 21 completed successfully
- Interactive overlay components created
- Analytics data hooks (useAnalytics) implemented
- Recharts library installed and configured
- Real-time data subscriptions working

## Task Instructions
Complete each task in order and mark as ✅ when finished:

### Task 1: Create Analytics Overview Cards ⏳
Create summary cards showing key metrics with trend indicators and real-time updates.

**File to Create:** `components/analytics/AnalyticsOverviewCards.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Eye, 
  Heart, 
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  PlayCircle,
  Star,
  DollarSign,
  Zap
} from 'lucide-react';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { formatNumber, formatDuration, formatPercentage } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface MetricCardData {
  title: string;
  value: string | number;
  change: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  icon: React.ComponentType<any>;
  color: string;
  description: string;
  prefix?: string;
  suffix?: string;
}

interface AnalyticsOverviewCardsProps {
  videoId?: string;
  timeRange?: '24h' | '7d' | '30d' | '90d';
  className?: string;
  variant?: 'compact' | 'detailed';
  showTrends?: boolean;
}

export function AnalyticsOverviewCards({
  videoId,
  timeRange = '24h',
  className,
  variant = 'detailed',
  showTrends = true
}: AnalyticsOverviewCardsProps) {
  const [metrics, setMetrics] = useState<MetricCardData[]>([]);
  const [loading, setLoading] = useState(true);
  
  const { analytics, getCurrentViewers, getTotalViewers, getAverageEngagement } = useAnalytics({
    videoId,
    timeBucket: timeRange === '24h' ? '5min' : timeRange === '7d' ? 'hour' : 'day'
  });

  // Calculate metrics from analytics data
  useEffect(() => {
    if (!analytics.length) return;

    const currentViewers = getCurrentViewers();
    const totalViewers = getTotalViewers();
    const avgEngagement = getAverageEngagement();

    // Mock calculations (in real app, these would come from processed analytics)
    const metricsData: MetricCardData[] = [
      {
        title: 'Live Viewers',
        value: formatNumber(currentViewers),
        change: Math.floor(Math.random() * 20) - 10,
        changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
        icon: Users,
        color: 'text-blue-500',
        description: 'Currently watching',
      },
      {
        title: 'Total Views',
        value: formatNumber(totalViewers),
        change: Math.floor(Math.random() * 15) + 5,
        changeType: 'increase',
        icon: Eye,
        color: 'text-green-500',
        description: 'All-time views',
      },
      {
        title: 'Engagement Rate',
        value: formatPercentage(avgEngagement),
        change: Math.floor(Math.random() * 10) - 5,
        changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
        icon: Heart,
        color: 'text-pink-500',
        description: 'User interactions',
        suffix: '%',
      },
      {
        title: 'Chat Messages',
        value: formatNumber(Math.floor(Math.random() * 1000) + 500),
        change: Math.floor(Math.random() * 25) + 10,
        changeType: 'increase',
        icon: MessageCircle,
        color: 'text-purple-500',
        description: 'Messages sent',
      },
      {
        title: 'Watch Time',
        value: formatDuration(Math.floor(Math.random() * 7200) + 1800),
        change: Math.floor(Math.random() * 30) + 5,
        changeType: 'increase',
        icon: Clock,
        color: 'text-orange-500',
        description: 'Average session',
      },
      {
        title: 'Peak Viewers',
        value: formatNumber(Math.floor(Math.random() * 5000) + 1000),
        change: Math.floor(Math.random() * 20) - 5,
        changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
        icon: TrendingUp,
        color: 'text-indigo-500',
        description: 'Highest concurrent',
      }
    ];

    if (variant === 'compact') {
      setMetrics(metricsData.slice(0, 4));
    } else {
      setMetrics(metricsData);
    }
    
    setLoading(false);
  }, [analytics, variant, getCurrentViewers, getTotalViewers, getAverageEngagement]);

  const getTrendIcon = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return <TrendingUp className="w-3 h-3 text-green-500" />;
      case 'decrease':
        return <TrendingDown className="w-3 h-3 text-red-500" />;
      default:
        return <Minus className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getTrendColor = (changeType: string) => {
    switch (changeType) {
      case 'increase':
        return 'text-green-500';
      case 'decrease':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", className)}>
        {Array.from({ length: variant === 'compact' ? 4 : 6 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="w-24 h-4 bg-muted rounded" />
                <div className="w-8 h-8 bg-muted rounded" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-16 h-8 bg-muted rounded mb-2" />
              <div className="w-full h-3 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
      variant === 'compact' && "lg:grid-cols-4",
      className
    )}>
      {metrics.map((metric, index) => {
        const Icon = metric.icon;
        
        return (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    "bg-secondary/50"
                  )}>
                    <Icon className={cn("w-4 h-4", metric.color)} />
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold">
                      {metric.prefix}{metric.value}{metric.suffix}
                    </span>
                    
                    {showTrends && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        className="flex items-center space-x-1"
                      >
                        {getTrendIcon(metric.changeType)}
                        <span className={cn(
                          "text-xs font-medium",
                          getTrendColor(metric.changeType)
                        )}>
                          {Math.abs(metric.change)}%
                        </span>
                      </motion.div>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {metric.description}
                  </p>
                  
                  {variant === 'detailed' && (
                    <div className="pt-2">
                      <Badge variant="secondary" className="text-xs">
                        {timeRange.toUpperCase()}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
```

**Verification:** 
- File created with analytics overview cards
- Real-time metrics calculation implemented
- Trend indicators and animations included
- Responsive grid layout configured

### Task 2: Create Viewer Count Chart ⏳
Create a real-time chart showing viewer count over time with interactive features.

**File to Create:** `components/analytics/ViewerCountChart.tsx`

```typescript
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Brush
} from 'recharts';
import { 
  Users, 
  TrendingUp, 
  Clock, 
  Maximize2,
  Download,
  Refresh
} from 'lucide-react';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { formatNumber, formatTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface ViewerCountChartProps {
  videoId: string;
  timeRange?: '1h' | '6h' | '24h' | '7d';
  className?: string;
  showBrush?: boolean;
  showPeaks?: boolean;
  autoRefresh?: boolean;
  height?: number;
}

interface ChartDataPoint {
  timestamp: string;
  viewerCount: number;
  time: string;
  formattedTime: string;
  isPeak?: boolean;
}

export function ViewerCountChart({
  videoId,
  timeRange = '24h',
  className,
  showBrush = true,
  showPeaks = true,
  autoRefresh = true,
  height = 400
}: ViewerCountChartProps) {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [peakViewers, setPeakViewers] = useState(0);
  const [averageViewers, setAverageViewers] = useState(0);

  const { analytics, loading, refetch } = useAnalytics({
    videoId,
    timeBucket: selectedTimeRange === '1h' ? '5min' : selectedTimeRange === '6h' ? '5min' : 'hour',
    limit: selectedTimeRange === '1h' ? 12 : selectedTimeRange === '6h' ? 72 : 168
  });

  // Process analytics data for chart
  const processedData = useMemo(() => {
    if (!analytics.length) return [];

    const data = analytics.map((record, index) => {
      const timestamp = new Date(record.timestamp);
      return {
        timestamp: record.timestamp,
        viewerCount: record.viewer_count,
        time: formatTime(timestamp),
        formattedTime: timestamp.toLocaleString(),
        isPeak: false
      };
    });

    // Find peaks if enabled
    if (showPeaks && data.length > 2) {
      data.forEach((point, index) => {
        if (index > 0 && index < data.length - 1) {
          const prev = data[index - 1];
          const next = data[index + 1];
          
          // Mark as peak if higher than both neighbors and above average
          if (point.viewerCount > prev.viewerCount && 
              point.viewerCount > next.viewerCount &&
              point.viewerCount > averageViewers * 1.2) {
            point.isPeak = true;
          }
        }
      });
    }

    return data;
  }, [analytics, showPeaks, averageViewers]);

  // Calculate statistics
  useEffect(() => {
    if (processedData.length === 0) return;

    const viewerCounts = processedData.map(d => d.viewerCount);
    const peak = Math.max(...viewerCounts);
    const average = viewerCounts.reduce((sum, count) => sum + count, 0) / viewerCounts.length;

    setPeakViewers(peak);
    setAverageViewers(Math.round(average));
    setChartData(processedData);
  }, [processedData]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetch();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, refetch]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleTimeRangeChange = (newRange: string) => {
    setSelectedTimeRange(newRange as any);
  };

  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium">{data.formattedTime}</p>
        <div className="flex items-center space-x-2 mt-1">
          <Users className="w-4 h-4 text-blue-500" />
          <span className="text-sm">
            {formatNumber(data.viewerCount)} viewers
          </span>
          {data.isPeak && (
            <Badge variant="secondary" className="text-xs">
              Peak
            </Badge>
          )}
        </div>
      </div>
    );
  };

  const timeRangeOptions = [
    { value: '1h', label: '1 Hour' },
    { value: '6h', label: '6 Hours' },
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' }
  ];

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span>Viewer Count</span>
            </CardTitle>
            <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <TrendingUp className="w-4 h-4" />
                <span>Peak: {formatNumber(peakViewers)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>Avg: {formatNumber(averageViewers)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Time Range Selector */}
            <div className="flex bg-muted rounded-lg p-1">
              {timeRangeOptions.map((option) => (
                <Button
                  key={option.value}
                  variant={selectedTimeRange === option.value ? "secondary" : "ghost"}
                  size="sm"
                  className="text-xs h-7"
                  onClick={() => handleTimeRangeChange(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>

            {/* Action Buttons */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-8 w-8 p-0"
            >
              <motion.div
                animate={{ rotate: isRefreshing ? 360 : 0 }}
                transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
              >
                <Refresh className="w-4 h-4" />
              </motion.div>
            </Button>

            <Button variant="outline" size="sm" className="h-8 w-8 p-0">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-pulse text-muted-foreground">
              Loading chart data...
            </div>
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex items-center justify-center h-96 text-muted-foreground">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No viewer data available</p>
            </div>
          </div>
        ) : (
          <div style={{ width: '100%', height }}>
            <ResponsiveContainer>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="time"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatNumber}
                  className="text-muted-foreground"
                />
                <Tooltip content={customTooltip} />
                
                {/* Average line */}
                <ReferenceLine 
                  y={averageViewers} 
                  stroke="#6366f1" 
                  strokeDasharray="5 5"
                  label={{ value: "Average", position: "topRight" }}
                />

                <Line
                  type="monotone"
                  dataKey="viewerCount"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ 
                    r: 4, 
                    fill: "#3b82f6",
                    stroke: "#ffffff",
                    strokeWidth: 2
                  }}
                />

                {/* Peak indicators */}
                {showPeaks && (
                  <Line
                    type="monotone"
                    dataKey="viewerCount"
                    stroke="transparent"
                    dot={(props: any) => {
                      if (props.payload?.isPeak) {
                        return (
                          <circle
                            cx={props.cx}
                            cy={props.cy}
                            r={6}
                            fill="#f59e0b"
                            stroke="#ffffff"
                            strokeWidth={2}
                          />
                        );
                      }
                      return null;
                    }}
                  />
                )}

                {/* Brush for zooming */}
                {showBrush && chartData.length > 20 && (
                  <Brush 
                    dataKey="time" 
                    height={30}
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Verification:** 
- File created with interactive viewer count chart
- Real-time data updates and auto-refresh implemented
- Peak detection and reference lines included
- Time range selector and zoom functionality added

### Task 3: Create Engagement Analytics Chart ⏳
Create charts showing user engagement metrics like reactions, chat activity, and interactions.

**File to Create:** `components/analytics/EngagementChart.tsx`

```typescript
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  Heart, 
  MessageCircle, 
  ThumbsUp, 
  Star,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { useInteractions } from '@/lib/hooks/useInteractions';
import { formatNumber, formatPercentage } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface EngagementChartProps {
  videoId: string;
  timeRange?: '1h' | '6h' | '24h' | '7d';
  className?: string;
  showRealtimeUpdates?: boolean;
}

interface EngagementData {
  timestamp: string;
  reactions: number;
  messages: number;
  polls: number;
  ratings: number;
  total: number;
  time: string;
}

interface ReactionDistribution {
  emoji: string;
  count: number;
  percentage: number;
  color: string;
}

const ENGAGEMENT_COLORS = {
  reactions: '#f59e0b',
  messages: '#3b82f6',
  polls: '#8b5cf6',
  ratings: '#06d6a0',
  total: '#6366f1'
};

const EMOJI_COLORS = {
  '❤️': '#ef4444',
  '😂': '#f59e0b',
  '😮': '#3b82f6',
  '👍': '#22c55e',
  '🔥': '#f97316',
  '⭐': '#eab308',
  '😢': '#6366f1',
  '😠': '#dc2626',
  '⚡': '#8b5cf6',
  '🎯': '#06b6d4'
};

export function EngagementChart({
  videoId,
  timeRange = '24h',
  className,
  showRealtimeUpdates = true
}: EngagementChartProps) {
  const [engagementData, setEngagementData] = useState<EngagementData[]>([]);
  const [reactionDistribution, setReactionDistribution] = useState<ReactionDistribution[]>([]);
  const [activeTab, setActiveTab] = useState('timeline');
  const [totalEngagements, setTotalEngagements] = useState(0);

  const { 
    interactions, 
    getInteractionsByType, 
    getReactionCounts 
  } = useInteractions({ videoId });

  // Process interaction data
  const processedData = useMemo(() => {
    if (!interactions.length) return { timeline: [], reactions: [] };

    // Group interactions by time intervals
    const timeInterval = timeRange === '1h' ? 5 : timeRange === '6h' ? 15 : 60; // minutes
    const intervals = new Map<string, EngagementData>();

    interactions.forEach(interaction => {
      const timestamp = new Date(interaction.created_at);
      const intervalKey = Math.floor(timestamp.getTime() / (timeInterval * 60 * 1000)) * timeInterval * 60 * 1000;
      const intervalTime = new Date(intervalKey);
      const key = intervalTime.toISOString();

      if (!intervals.has(key)) {
        intervals.set(key, {
          timestamp: key,
          reactions: 0,
          messages: 0,
          polls: 0,
          ratings: 0,
          total: 0,
          time: intervalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }

      const data = intervals.get(key)!;
      switch (interaction.type) {
        case 'reaction':
          data.reactions++;
          break;
        case 'poll':
          data.polls++;
          break;
        case 'rating':
          data.ratings++;
          break;
      }
      data.total++;
    });

    // Convert to array and sort
    const timeline = Array.from(intervals.values()).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Process reaction distribution
    const reactionCounts = getReactionCounts();
    const totalReactions = Object.values(reactionCounts).reduce((sum, count) => sum + count, 0);
    
    const reactions = Object.entries(reactionCounts)
      .map(([emoji, count]) => ({
        emoji,
        count,
        percentage: totalReactions > 0 ? (count / totalReactions) * 100 : 0,
        color: EMOJI_COLORS[emoji as keyof typeof EMOJI_COLORS] || '#6b7280'
      }))
      .sort((a, b) => b.count - a.count);

    return { timeline, reactions };
  }, [interactions, timeRange, getReactionCounts]);

  useEffect(() => {
    setEngagementData(processedData.timeline);
    setReactionDistribution(processedData.reactions);
    setTotalEngagements(interactions.length);
  }, [processedData, interactions.length]);

  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div 
              className="w-3 h-3 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className="capitalize">{entry.dataKey}:</span>
            <span className="font-medium">{formatNumber(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  const pieTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{data.emoji}</span>
          <div>
            <p className="font-medium">{formatNumber(data.count)} reactions</p>
            <p className="text-sm text-muted-foreground">
              {formatPercentage(data.percentage)}% of total
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-purple-500" />
            <span>Engagement Analytics</span>
          </CardTitle>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-muted-foreground">
              Total: {formatNumber(totalEngagements)} interactions
            </div>
            {showRealtimeUpdates && (
              <Badge variant="secondary" className="animate-pulse">
                Live
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="timeline" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Timeline</span>
            </TabsTrigger>
            <TabsTrigger value="breakdown" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Breakdown</span>
            </TabsTrigger>
            <TabsTrigger value="reactions" className="flex items-center space-x-2">
              <PieChartIcon className="w-4 h-4" />
              <span>Reactions</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="mt-6">
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={formatNumber}
                    className="text-muted-foreground"
                  />
                  <Tooltip content={customTooltip} />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stackId="1"
                    stroke={ENGAGEMENT_COLORS.total}
                    fill={ENGAGEMENT_COLORS.total}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="breakdown" className="mt-6">
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="time"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={formatNumber}
                    className="text-muted-foreground"
                  />
                  <Tooltip content={customTooltip} />
                  <Legend />
                  <Bar dataKey="reactions" stackId="a" fill={ENGAGEMENT_COLORS.reactions} />
                  <Bar dataKey="messages" stackId="a" fill={ENGAGEMENT_COLORS.messages} />
                  <Bar dataKey="polls" stackId="a" fill={ENGAGEMENT_COLORS.polls} />
                  <Bar dataKey="ratings" stackId="a" fill={ENGAGEMENT_COLORS.ratings} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="reactions" className="mt-6">
            <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
              {/* Pie Chart */}
              <div className="flex-1" style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={reactionDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ emoji, percentage }) => `${emoji} ${percentage.toFixed(1)}%`}
                    >
                      {reactionDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={pieTooltip} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Reaction List */}
              <div className="flex-1 space-y-3">
                <h4 className="font-semibold text-sm">Top Reactions</h4>
                {reactionDistribution.slice(0, 8).map((reaction, index) => (
                  <motion.div
                    key={reaction.emoji}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{reaction.emoji}</span>
                      <div>
                        <p className="font-medium">{formatNumber(reaction.count)}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatPercentage(reaction.percentage)}%
                        </p>
                      </div>
                    </div>
                    <div 
                      className="w-2 h-8 rounded"
                      style={{ backgroundColor: reaction.color }}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
```

**Verification:** 
- File created with comprehensive engagement analytics
- Multiple chart types (area, bar, pie) implemented
- Tabbed interface for different views
- Real-time reaction distribution tracking

### Task 4: Create Revenue Analytics Dashboard ⏳
Create charts and metrics for tracking advertisement revenue and monetization.

**File to Create:** `components/analytics/RevenueAnalytics.tsx`

```typescript
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  PlayCircle,
  Users,
  MousePointer,
  Eye,
  Calendar
} from 'lucide-react';
import { formatNumber, formatCurrency, formatPercentage } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface RevenueAnalyticsProps {
  videoId?: string;
  timeRange?: '24h' | '7d' | '30d' | '90d';
  className?: string;
}

interface RevenueData {
  date: string;
  adRevenue: number;
  sponsorRevenue: number;
  subscriptionRevenue: number;
  totalRevenue: number;
  adImpressions: number;
  adClicks: number;
  ctr: number; // Click-through rate
  cpm: number; // Cost per mille
}

interface AdPerformance {
  adType: string;
  impressions: number;
  clicks: number;
  revenue: number;
  ctr: number;
  cpm: number;
  color: string;
}

interface RevenueMetrics {
  totalRevenue: number;
  revenueGrowth: number;
  avgCPM: number;
  avgCTR: number;
  totalImpressions: number;
  totalClicks: number;
  conversionRate: number;
  projectedMonthly: number;
}

export function RevenueAnalytics({
  videoId,
  timeRange = '30d',
  className
}: RevenueAnalyticsProps) {
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [adPerformance, setAdPerformance] = useState<AdPerformance[]>([]);
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    totalRevenue: 0,
    revenueGrowth: 0,
    avgCPM: 0,
    avgCTR: 0,
    totalImpressions: 0,
    totalClicks: 0,
    conversionRate: 0,
    projectedMonthly: 0
  });
  const [loading, setLoading] = useState(true);

  // Mock data generation (in real app, this would come from backend)
  useEffect(() => {
    const generateMockData = () => {
      const days = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const data: RevenueData[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        const baseRevenue = Math.random() * 500 + 100;
        const adRevenue = baseRevenue * (0.6 + Math.random() * 0.2);
        const sponsorRevenue = baseRevenue * (0.2 + Math.random() * 0.1);
        const subscriptionRevenue = baseRevenue * (0.1 + Math.random() * 0.1);
        
        const impressions = Math.floor(Math.random() * 10000) + 5000;
        const clicks = Math.floor(impressions * (0.01 + Math.random() * 0.04));
        const ctr = (clicks / impressions) * 100;
        const cpm = (adRevenue / impressions) * 1000;

        data.push({
          date: date.toISOString().split('T')[0],
          adRevenue,
          sponsorRevenue,
          subscriptionRevenue,
          totalRevenue: adRevenue + sponsorRevenue + subscriptionRevenue,
          adImpressions: impressions,
          adClicks: clicks,
          ctr,
          cpm
        });
      }

      return data;
    };

    const generateAdPerformance = (): AdPerformance[] => {
      return [
        {
          adType: 'Pre-roll',
          impressions: 15420,
          clicks: 462,
          revenue: 1284.50,
          ctr: 3.0,
          cpm: 8.33,
          color: '#3b82f6'
        },
        {
          adType: 'Mid-roll',
          impressions: 8930,
          clicks: 267,
          revenue: 892.15,
          ctr: 2.99,
          cpm: 9.99,
          color: '#10b981'
        },
        {
          adType: 'Banner',
          impressions: 22560,
          clicks: 338,
          revenue: 451.20,
          ctr: 1.5,
          cpm: 2.00,
          color: '#f59e0b'
        },
        {
          adType: 'Overlay',
          impressions: 12800,
          clicks: 384,
          revenue: 640.00,
          ctr: 3.0,
          cpm: 5.00,
          color: '#8b5cf6'
        }
      ];
    };

    const mockRevenueData = generateMockData();
    const mockAdPerformance = generateAdPerformance();
    
    setRevenueData(mockRevenueData);
    setAdPerformance(mockAdPerformance);

    // Calculate metrics
    const totalRevenue = mockRevenueData.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalImpressions = mockAdPerformance.reduce((sum, ad) => sum + ad.impressions, 0);
    const totalClicks = mockAdPerformance.reduce((sum, ad) => sum + ad.clicks, 0);
    const avgCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    const avgCPM = totalImpressions > 0 ? (totalRevenue / totalImpressions) * 1000 : 0;

    setMetrics({
      totalRevenue,
      revenueGrowth: Math.random() * 20 + 5, // 5-25% growth
      avgCPM,
      avgCTR,
      totalImpressions,
      totalClicks,
      conversionRate: Math.random() * 5 + 2, // 2-7% conversion
      projectedMonthly: totalRevenue * (30 / (mockRevenueData.length || 1))
    });

    setLoading(false);
  }, [timeRange]);

  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
        <p className="font-medium mb-2">{new Date(label).toLocaleDateString()}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2 text-sm">
            <div 
              className="w-3 h-3 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className="capitalize">{entry.dataKey.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
            <span className="font-medium">{formatCurrency(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={cn("space-y-6", className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="w-48 h-6 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="w-full h-64 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Revenue Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-500">+{formatPercentage(metrics.revenueGrowth)}%</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg CPM</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.avgCPM)}</p>
                <p className="text-sm text-muted-foreground mt-2">Cost per 1K impressions</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Click Rate</p>
                <p className="text-2xl font-bold">{formatPercentage(metrics.avgCTR)}%</p>
                <p className="text-sm text-muted-foreground mt-2">{formatNumber(metrics.totalClicks)} total clicks</p>
              </div>
              <MousePointer className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Projected Monthly</p>
                <p className="text-2xl font-bold">{formatCurrency(metrics.projectedMonthly)}</p>
                <p className="text-sm text-muted-foreground mt-2">Based on current trend</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Timeline Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DollarSign className="w-5 h-5 text-green-500" />
            <span>Revenue Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  className="text-muted-foreground"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatCurrency}
                  className="text-muted-foreground"
                />
                <Tooltip content={customTooltip} />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="totalRevenue" 
                  stroke="#22c55e" 
                  strokeWidth={3}
                  name="Total Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="adRevenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="Ad Revenue"
                />
                <Line 
                  type="monotone" 
                  dataKey="sponsorRevenue" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Sponsor Revenue"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Ad Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <PlayCircle className="w-5 h-5 text-blue-500" />
            <span>Ad Performance by Type</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={adPerformance}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="adType"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  className="text-muted-foreground"
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                  tickFormatter={formatCurrency}
                  className="text-muted-foreground"
                />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value as number) : formatNumber(value as number),
                    name
                  ]}
                />
                <Bar dataKey="revenue" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ad Performance Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {adPerformance.map((ad, index) => (
              <motion.div
                key={ad.adType}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-secondary/30 rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{ad.adType}</h4>
                  <div 
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: ad.color }}
                  />
                </div>
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Revenue:</span>
                    <span className="font-medium">{formatCurrency(ad.revenue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CTR:</span>
                    <span className="font-medium">{formatPercentage(ad.ctr)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">CPM:</span>
                    <span className="font-medium">{formatCurrency(ad.cpm)}</span>
                  </div>
                </div>

                <Progress value={ad.ctr * 10} className="h-2" />
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Verification:** 
- File created with comprehensive revenue analytics
- Multiple revenue streams tracking implemented
- Ad performance metrics and comparisons
- Projected revenue calculations included

## Task Completion Checklist
Mark each task as complete when finished:

- [ ] Task 1: Analytics overview cards created ✅
- [ ] Task 2: Viewer count chart created ✅  
- [ ] Task 3: Engagement analytics chart created ✅
- [ ] Task 4: Revenue analytics dashboard created ✅

## Verification Steps
After completing all tasks:

1. Check all analytics files exist:
   ```bash
   ls -la components/analytics/
   ```

2. Test TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```

3. Verify Recharts integration:
   ```bash
   npm run dev
   ```

## Success Criteria
- All 4 analytics components created successfully
- TypeScript compilation succeeds without errors
- Recharts charts render correctly
- Real-time data updates working
- Responsive design across screen sizes
- Interactive tooltips and legends implemented

## Important Notes
- Components use Recharts for data visualization
- Real-time updates via analytics hooks
- Currency and number formatting utilities
- Responsive chart containers for mobile
- Color schemes consistent with design system

## Troubleshooting
If you encounter issues:
1. Verify Recharts is properly installed
2. Check analytics hook data structure
3. Ensure formatting utilities are available
4. Test chart responsiveness on mobile

## Next Step
After completing this step and marking all tasks ✅, proceed to Step 23: Create Admin Dashboard.