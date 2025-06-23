# ENHANCED Step 22: Create Analytics Components (Sonnet-Optimized)

## CRITICAL FOR CLAUDE SONNET
- Recharts requires EXACT component structure
- Data processing patterns must be preserved
- Real-time updates need proper state management
- Copy chart configurations EXACTLY

## Task Instructions

### Task 1: Create Recharts Wrapper Components ⏳

**REASONING**: Recharts needs specific data structures and responsive containers. These wrapper components prevent common integration issues.

**File to Create:** `components/analytics/ChartComponents.tsx`

```typescript
'use client';

import { 
  ResponsiveContainer,
  LineChart,
  Line,
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
  Legend,
  ReferenceLine
} from 'recharts';
import { cn } from '@/lib/utils/cn';

// CRITICAL: Custom tooltip component for consistent styling
export function CustomTooltip({ active, payload, label, labelFormatter, formatter }: any) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
      {label && (
        <p className="font-medium mb-2">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      {payload.map((entry: any, index: number) => (
        <div key={index} className="flex items-center space-x-2 text-sm">
          <div 
            className="w-3 h-3 rounded"
            style={{ backgroundColor: entry.color }}
          />
          <span className="capitalize">
            {entry.dataKey.replace(/([A-Z])/g, ' $1').toLowerCase()}:
          </span>
          <span className="font-medium">
            {formatter ? formatter(entry.value, entry.dataKey) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

// CRITICAL: Responsive chart wrapper
interface ResponsiveChartProps {
  height?: number;
  children: React.ReactNode;
  className?: string;
}

export function ResponsiveChart({ height = 300, children, className }: ResponsiveChartProps) {
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </div>
  );
}

// CRITICAL: Chart theme configuration
export const chartTheme = {
  grid: {
    stroke: 'hsl(var(--border))',
    strokeDasharray: '3 3',
    opacity: 0.3
  },
  axis: {
    axisLine: false,
    tickLine: false,
    tick: { 
      fontSize: 12,
      fill: 'hsl(var(--muted-foreground))'
    }
  },
  colors: {
    primary: 'hsl(var(--primary))',
    secondary: 'hsl(var(--secondary))',
    accent: 'hsl(var(--accent))',
    muted: 'hsl(var(--muted))',
    blue: '#3b82f6',
    green: '#10b981',
    yellow: '#f59e0b',
    red: '#ef4444',
    purple: '#8b5cf6',
    orange: '#f97316'
  }
};
```

### Task 2: Create Viewer Count Chart ⏳

**File to Create:** `components/analytics/ViewerCountChart.tsx`

```typescript
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Brush } from 'recharts';
import { Users, TrendingUp, Clock, Refresh } from 'lucide-react';
import { useAnalytics } from '@/lib/hooks/useAnalytics';
import { formatNumber, formatTime } from '@/lib/utils/format';
import { ResponsiveChart, CustomTooltip, chartTheme } from './ChartComponents';
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

  // CRITICAL: Analytics hook with proper configuration
  const { analytics, loading, refetch } = useAnalytics({
    videoId,
    timeBucket: selectedTimeRange === '1h' ? '5min' : selectedTimeRange === '6h' ? '5min' : 'hour',
    limit: selectedTimeRange === '1h' ? 12 : selectedTimeRange === '6h' ? 72 : 168
  });

  // CRITICAL: Data processing with memoization
  const processedData = useMemo(() => {
    if (!analytics.length) return [];

    return analytics.map((record, index) => {
      const timestamp = new Date(record.timestamp);
      return {
        timestamp: record.timestamp,
        viewerCount: record.viewer_count,
        time: formatTime(timestamp),
        formattedTime: timestamp.toLocaleString(),
        isPeak: false
      };
    });
  }, [analytics]);

  // CRITICAL: Peak detection and statistics calculation
  useEffect(() => {
    if (processedData.length === 0) return;

    const viewerCounts = processedData.map(d => d.viewerCount);
    const peak = Math.max(...viewerCounts);
    const average = viewerCounts.reduce((sum, count) => sum + count, 0) / viewerCounts.length;

    setPeakViewers(peak);
    setAverageViewers(Math.round(average));

    // Mark peaks if enabled
    if (showPeaks) {
      const dataWithPeaks = processedData.map((point, index) => {
        if (index > 0 && index < processedData.length - 1) {
          const prev = processedData[index - 1];
          const next = processedData[index + 1];
          
          // Mark as peak if higher than neighbors and above average
          if (point.viewerCount > prev.viewerCount && 
              point.viewerCount > next.viewerCount &&
              point.viewerCount > average * 1.2) {
            return { ...point, isPeak: true };
          }
        }
        return point;
      });
      
      setChartData(dataWithPeaks);
    } else {
      setChartData(processedData);
    }
  }, [processedData, showPeaks, averageViewers]);

  // CRITICAL: Auto-refresh functionality
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

  // CRITICAL: Custom tooltip with proper formatting
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

            {/* Refresh Button */}
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
          <ResponsiveChart height={height}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid {...chartTheme.grid} />
              <XAxis 
                dataKey="time"
                {...chartTheme.axis}
              />
              <YAxis 
                {...chartTheme.axis}
                tickFormatter={formatNumber}
              />
              <Tooltip content={customTooltip} />
              
              {/* Average line */}
              <ReferenceLine 
                y={averageViewers} 
                stroke={chartTheme.colors.purple}
                strokeDasharray="5 5"
                label={{ value: "Average", position: "topRight" }}
              />

              {/* Main line */}
              <Line
                type="monotone"
                dataKey="viewerCount"
                stroke={chartTheme.colors.blue}
                strokeWidth={2}
                dot={false}
                activeDot={{ 
                  r: 4, 
                  fill: chartTheme.colors.blue,
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
                          fill={chartTheme.colors.yellow}
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
                  stroke={chartTheme.colors.blue}
                  fill={chartTheme.colors.blue}
                  fillOpacity={0.1}
                />
              )}
            </LineChart>
          </ResponsiveChart>
        )}
      </CardContent>
    </Card>
  );
}
```

### Task 3: Create Engagement Analytics Chart ⏳

**File to Create:** `components/analytics/EngagementChart.tsx`

```typescript
'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Legend
} from 'recharts';
import { Activity, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { useInteractions } from '@/lib/hooks/useInteractions';
import { formatNumber, formatPercentage } from '@/lib/utils/format';
import { ResponsiveChart, CustomTooltip, chartTheme } from './ChartComponents';
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

// CRITICAL: Engagement type colors configuration
const ENGAGEMENT_COLORS = {
  reactions: chartTheme.colors.yellow,
  messages: chartTheme.colors.blue,
  polls: chartTheme.colors.purple,
  ratings: chartTheme.colors.green,
  total: chartTheme.colors.primary
};

// CRITICAL: Emoji color mapping
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

  // CRITICAL: Interactions hook for real-time data
  const { 
    interactions, 
    getInteractionsByType, 
    getReactionCounts 
  } = useInteractions({ videoId });

  // CRITICAL: Data processing with proper time bucketing
  const processedData = useMemo(() => {
    if (!interactions.length) return { timeline: [], reactions: [] };

    // Time interval based on range
    const timeInterval = timeRange === '1h' ? 5 : timeRange === '6h' ? 15 : 60; // minutes
    const intervals = new Map<string, EngagementData>();

    // STEP 1: Group interactions by time intervals
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
        // Note: Messages would come from chat data
      }
      data.total++;
    });

    // STEP 2: Convert to array and sort
    const timeline = Array.from(intervals.values()).sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // STEP 3: Process reaction distribution
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

  // CRITICAL: Update state when processed data changes
  useEffect(() => {
    setEngagementData(processedData.timeline);
    setReactionDistribution(processedData.reactions);
    setTotalEngagements(interactions.length);
  }, [processedData, interactions.length]);

  // CRITICAL: Custom tooltip for engagement data
  const engagementTooltip = ({ active, payload, label }: any) => {
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

  // CRITICAL: Custom tooltip for pie chart
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
            <ResponsiveChart height={300}>
              <AreaChart data={engagementData}>
                <CartesianGrid {...chartTheme.grid} />
                <XAxis 
                  dataKey="time"
                  {...chartTheme.axis}
                />
                <YAxis 
                  {...chartTheme.axis}
                  tickFormatter={formatNumber}
                />
                <Tooltip content={engagementTooltip} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stackId="1"
                  stroke={ENGAGEMENT_COLORS.total}
                  fill={ENGAGEMENT_COLORS.total}
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveChart>
          </TabsContent>

          <TabsContent value="breakdown" className="mt-6">
            <ResponsiveChart height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid {...chartTheme.grid} />
                <XAxis 
                  dataKey="time"
                  {...chartTheme.axis}
                />
                <YAxis 
                  {...chartTheme.axis}
                  tickFormatter={formatNumber}
                />
                <Tooltip content={engagementTooltip} />
                <Legend />
                <Bar dataKey="reactions" stackId="a" fill={ENGAGEMENT_COLORS.reactions} />
                <Bar dataKey="messages" stackId="a" fill={ENGAGEMENT_COLORS.messages} />
                <Bar dataKey="polls" stackId="a" fill={ENGAGEMENT_COLORS.polls} />
                <Bar dataKey="ratings" stackId="a" fill={ENGAGEMENT_COLORS.ratings} />
              </BarChart>
            </ResponsiveChart>
          </TabsContent>

          <TabsContent value="reactions" className="mt-6">
            <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
              {/* Pie Chart */}
              <div className="flex-1">
                <ResponsiveChart height={300}>
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
                </ResponsiveChart>
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

**⚠️ CRITICAL SONNET WARNINGS:**

1. **DO NOT modify the Recharts component structure** - it will break rendering
2. **DO NOT change the data processing patterns** - they handle real-time updates properly  
3. **DO NOT remove the ResponsiveChart wrapper** - it ensures proper sizing
4. **DO NOT modify the color configurations** - they maintain design consistency

**Verification Steps:**
- All chart components render without errors
- Real-time data updates work correctly
- Responsive design works on mobile
- Tooltips display properly formatted data