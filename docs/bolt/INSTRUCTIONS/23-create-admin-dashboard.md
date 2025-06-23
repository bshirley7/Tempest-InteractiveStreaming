# Step 23: Create Admin Dashboard

## Context
You are building Tempest, an interactive streaming platform. This step creates comprehensive admin dashboard components for content management, user moderation, analytics oversight, and platform administration using precise Tailwind CSS classes and shadcn/ui components.

## Purpose
The admin dashboard provides platform administrators with powerful tools to manage content, moderate users, monitor system health, and analyze platform performance. Components must be intuitive, responsive, and provide efficient workflows for administrative tasks.

## Prerequisites
- Step 22 completed successfully
- Analytics dashboard components created
- User authentication with admin role checking implemented
- Admin-specific API routes available
- Data management hooks created

## Task Instructions
Complete each task in order and mark as ✅ when finished:

### Task 1: Create Admin Dashboard Layout ⏳
Create the main admin dashboard layout with navigation and responsive sidebar.

**File to Create:** `components/admin/AdminDashboardLayout.tsx`

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard,
  Users,
  PlayCircle,
  BarChart3,
  Settings,
  Shield,
  MessageSquare,
  Upload,
  Calendar,
  DollarSign,
  AlertTriangle,
  Menu,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  Activity
} from 'lucide-react';
import { useUser } from '@/lib/hooks/useUser';
import { cn } from '@/lib/utils/cn';

interface AdminDashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

interface NavigationItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  badge?: string | number;
  description: string;
  children?: NavigationItem[];
}

const NAVIGATION_ITEMS: NavigationItem[] = [
  {
    title: 'Overview',
    href: '/admin',
    icon: LayoutDashboard,
    description: 'Dashboard overview and key metrics'
  },
  {
    title: 'Content Management',
    href: '/admin/content',
    icon: PlayCircle,
    description: 'Manage videos, channels, and media',
    children: [
      { title: 'All Content', href: '/admin/content', icon: PlayCircle, description: 'View all content' },
      { title: 'Upload', href: '/admin/upload', icon: Upload, description: 'Upload new content' },
      { title: 'Channels', href: '/admin/channels', icon: Calendar, description: 'Manage channels' },
      { title: 'Schedule', href: '/admin/schedule', icon: Calendar, description: 'Content scheduling' }
    ]
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
    badge: '12',
    description: 'Manage users and permissions'
  },
  {
    title: 'Moderation',
    href: '/admin/moderation',
    icon: Shield,
    badge: '3',
    description: 'Content and chat moderation',
    children: [
      { title: 'Reports', href: '/admin/moderation/reports', icon: AlertTriangle, description: 'User reports' },
      { title: 'Chat Logs', href: '/admin/moderation/chat', icon: MessageSquare, description: 'Chat moderation' }
    ]
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    description: 'Platform analytics and insights'
  },
  {
    title: 'Revenue',
    href: '/admin/revenue',
    icon: DollarSign,
    description: 'Revenue tracking and monetization'
  },
  {
    title: 'System Health',
    href: '/admin/system',
    icon: Activity,
    description: 'System monitoring and health'
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    description: 'Platform configuration'
  }
];

export function AdminDashboardLayout({ children, className }: AdminDashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const pathname = usePathname();
  const { user, isAdmin } = useUser();

  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <Link href="/admin" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">T</span>
          </div>
          <div>
            <h2 className="font-bold text-lg">Admin Panel</h2>
            <p className="text-sm text-muted-foreground">Tempest Dashboard</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedItems.includes(item.title);
            const itemIsActive = isActive(item.href);

            return (
              <div key={item.title}>
                {hasChildren ? (
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start h-auto p-3",
                      "hover:bg-secondary/80 transition-colors",
                      itemIsActive && "bg-secondary text-secondary-foreground"
                    )}
                    onClick={() => toggleExpanded(item.title)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5" />
                        <div className="text-left">
                          <div className="font-medium">{item.title}</div>
                          <div className="text-xs text-muted-foreground hidden lg:block">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {item.badge && (
                          <Badge variant="destructive" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </motion.div>
                      </div>
                    </div>
                  </Button>
                ) : (
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start h-auto p-3",
                        "hover:bg-secondary/80 transition-colors",
                        itemIsActive && "bg-secondary text-secondary-foreground"
                      )}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center space-x-3">
                          <Icon className="w-5 h-5" />
                          <div className="text-left">
                            <div className="font-medium">{item.title}</div>
                            <div className="text-xs text-muted-foreground hidden lg:block">
                              {item.description}
                            </div>
                          </div>
                        </div>
                        {item.badge && (
                          <Badge variant="destructive" className="text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </Button>
                  </Link>
                )}

                {/* Expanded Children */}
                <AnimatePresence>
                  {hasChildren && isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden ml-6 mt-1 space-y-1"
                    >
                      {item.children?.map((child) => {
                        const ChildIcon = child.icon;
                        const childIsActive = isActive(child.href);

                        return (
                          <Link key={child.href} href={child.href}>
                            <Button
                              variant="ghost"
                              className={cn(
                                "w-full justify-start h-9 px-3",
                                "hover:bg-secondary/60 transition-colors",
                                childIsActive && "bg-secondary/80 text-secondary-foreground"
                              )}
                            >
                              <ChildIcon className="w-4 h-4 mr-3" />
                              <span className="text-sm">{child.title}</span>
                            </Button>
                          </Link>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user?.username?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{user?.username}</p>
            <p className="text-xs text-muted-foreground">Administrator</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full">
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don't have permission to access the admin dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 h-16">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SidebarContent />
            </SheetContent>
          </Sheet>

          <h1 className="font-semibold">Admin Dashboard</h1>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-80 lg:fixed lg:inset-y-0 bg-card border-r border-border">
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-80">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

**Verification:** 
- File created with comprehensive admin layout
- Responsive sidebar with mobile sheet implementation
- Navigation with nested items and badges
- User permission checking and access control

### Task 2: Create Content Management Interface ⏳
Create components for managing videos, channels, and media content.

**File to Create:** `components/admin/ContentManagement.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Upload,
  Play,
  Pause,
  Calendar,
  Users,
  Clock,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useVideos } from '@/lib/hooks/useVideos';
import { useChannels } from '@/lib/hooks/useChannels';
import { formatNumber, formatDuration, formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Video, Channel } from '@/lib/types';

interface ContentManagementProps {
  className?: string;
}

interface ContentStats {
  totalVideos: number;
  totalChannels: number;
  totalViews: number;
  totalDuration: number;
  publishedToday: number;
  pendingReview: number;
}

export function ContentManagement({ className }: ContentManagementProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('all');
  const [contentStats, setContentStats] = useState<ContentStats>({
    totalVideos: 0,
    totalChannels: 0,
    totalViews: 0,
    totalDuration: 0,
    publishedToday: 0,
    pendingReview: 0
  });

  const { videos, loading: videosLoading } = useVideos();
  const { channels, loading: channelsLoading } = useChannels();

  // Calculate content statistics
  useEffect(() => {
    if (videos.length === 0) return;

    const stats: ContentStats = {
      totalVideos: videos.length,
      totalChannels: channels.length,
      totalViews: videos.reduce((sum, video) => sum + video.view_count, 0),
      totalDuration: videos.reduce((sum, video) => sum + (video.duration || 0), 0),
      publishedToday: videos.filter(video => {
        const publishedDate = new Date(video.published_at || '');
        const today = new Date();
        return publishedDate.toDateString() === today.toDateString();
      }).length,
      pendingReview: Math.floor(Math.random() * 10) // Mock pending reviews
    };

    setContentStats(stats);
  }, [videos, channels]);

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         video.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesChannel = selectedChannel === 'all' || video.channel_id === selectedChannel;
    return matchesSearch && matchesChannel;
  });

  const getStatusBadge = (video: Video) => {
    if (video.published_at && new Date(video.published_at) <= new Date()) {
      return (
        <Badge variant="default" className="bg-green-500 hover:bg-green-600">
          <CheckCircle className="w-3 h-3 mr-1" />
          Published
        </Badge>
      );
    } else if (video.published_at) {
      return (
        <Badge variant="secondary">
          <Clock className="w-3 h-3 mr-1" />
          Scheduled
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline">
          <AlertCircle className="w-3 h-3 mr-1" />
          Draft
        </Badge>
      );
    }
  };

  const handleVideoAction = (action: string, video: Video) => {
    console.log(`${action} action for video:`, video.id);
    // Implement actual actions here
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Content Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Videos</p>
                <p className="text-2xl font-bold">{formatNumber(contentStats.totalVideos)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Channels</p>
                <p className="text-2xl font-bold">{formatNumber(contentStats.totalChannels)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Views</p>
                <p className="text-2xl font-bold">{formatNumber(contentStats.totalViews)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Duration</p>
                <p className="text-2xl font-bold">{formatDuration(contentStats.totalDuration)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Published Today</p>
                <p className="text-2xl font-bold">{formatNumber(contentStats.publishedToday)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{formatNumber(contentStats.pendingReview)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Content Management</CardTitle>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Upload Content
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="videos" className="space-y-4">
            <TabsList>
              <TabsTrigger value="videos">Videos</TabsTrigger>
              <TabsTrigger value="channels">Channels</TabsTrigger>
            </TabsList>

            <TabsContent value="videos" className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search videos..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="px-3 py-2 bg-background border border-border rounded-md text-sm"
                >
                  <option value="all">All Channels</option>
                  {channels.map(channel => (
                    <option key={channel.id} value={channel.id}>
                      {channel.name}
                    </option>
                  ))}
                </select>

                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  More Filters
                </Button>
              </div>

              {/* Videos Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Video</TableHead>
                      <TableHead>Channel</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Published</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredVideos.map((video, index) => (
                      <motion.tr
                        key={video.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group"
                      >
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="w-16 h-9 bg-muted rounded overflow-hidden">
                              {video.thumbnail_url ? (
                                <img 
                                  src={video.thumbnail_url} 
                                  alt={video.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  <Play className="w-4 h-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{video.title}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {video.description}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {channels.find(c => c.id === video.channel_id)?.name || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(video)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                            <span>{formatNumber(video.view_count)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {video.duration ? formatDuration(video.duration) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {video.published_at ? formatDate(video.published_at) : 'Not published'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleVideoAction('view', video)}>
                                <Eye className="w-4 h-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleVideoAction('edit', video)}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleVideoAction('delete', video)}
                                className="text-destructive"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="channels" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {channels.map((channel, index) => (
                  <motion.div
                    key={channel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className={cn(
                              "w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold",
                              `channel-${channel.slug}`
                            )}>
                              {channel.name.charAt(0)}
                            </div>
                            <div>
                              <h3 className="font-semibold">{channel.name}</h3>
                              <p className="text-sm text-muted-foreground">{channel.slug}</p>
                            </div>
                          </div>
                          <Badge variant={channel.is_active ? "default" : "secondary"}>
                            {channel.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {channel.description}
                        </p>

                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            <Play className="w-4 h-4 text-muted-foreground" />
                            <span>{videos.filter(v => v.channel_id === channel.id).length} videos</span>
                          </div>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Verification:** 
- File created with comprehensive content management interface
- Video and channel management with filtering and search
- Statistical overview cards with key metrics
- Action menus for content operations

### Task 3: Create User Management Interface ⏳
Create components for managing users, roles, and permissions.

**File to Create:** `components/admin/UserManagement.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Shield,
  UserCheck,
  UserX,
  Crown,
  Users,
  UserPlus,
  Calendar,
  Activity,
  Ban,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { formatNumber, formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface UserManagementProps {
  className?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  role: 'user' | 'moderator' | 'admin';
  status: 'active' | 'suspended' | 'banned';
  created_at: string;
  last_active: string;
  total_messages: number;
  total_interactions: number;
  warnings: number;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  suspendedUsers: number;
  moderators: number;
  admins: number;
}

// Mock user data
const MOCK_USERS: User[] = [
  {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    avatar_url: '',
    role: 'admin',
    status: 'active',
    created_at: '2024-01-15T10:00:00Z',
    last_active: '2024-01-20T14:30:00Z',
    total_messages: 1250,
    total_interactions: 450,
    warnings: 0
  },
  {
    id: '2',
    username: 'jane_smith',
    email: 'jane@example.com',
    avatar_url: '',
    role: 'moderator',
    status: 'active',
    created_at: '2024-01-10T08:00:00Z',
    last_active: '2024-01-20T16:45:00Z',
    total_messages: 890,
    total_interactions: 320,
    warnings: 1
  },
  {
    id: '3',
    username: 'user123',
    email: 'user123@example.com',
    avatar_url: '',
    role: 'user',
    status: 'suspended',
    created_at: '2024-01-05T12:00:00Z',
    last_active: '2024-01-18T09:15:00Z',
    total_messages: 45,
    total_interactions: 12,
    warnings: 3
  }
];

export function UserManagement({ className }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [userStats, setUserStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    suspendedUsers: 0,
    moderators: 0,
    admins: 0
  });

  // Calculate user statistics
  useEffect(() => {
    const stats: UserStats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      newUsersToday: users.filter(u => {
        const createdDate = new Date(u.created_at);
        const today = new Date();
        return createdDate.toDateString() === today.toDateString();
      }).length,
      suspendedUsers: users.filter(u => u.status === 'suspended' || u.status === 'banned').length,
      moderators: users.filter(u => u.role === 'moderator').length,
      admins: users.filter(u => u.role === 'admin').length
    };
    setUserStats(stats);
  }, [users]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <Badge variant="destructive">
            <Crown className="w-3 h-3 mr-1" />
            Admin
          </Badge>
        );
      case 'moderator':
        return (
          <Badge variant="secondary">
            <Shield className="w-3 h-3 mr-1" />
            Moderator
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Users className="w-3 h-3 mr-1" />
            User
          </Badge>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Active
          </Badge>
        );
      case 'suspended':
        return (
          <Badge variant="secondary">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Suspended
          </Badge>
        );
      case 'banned':
        return (
          <Badge variant="destructive">
            <Ban className="w-3 h-3 mr-1" />
            Banned
          </Badge>
        );
      default:
        return null;
    }
  };

  const handleUserAction = (action: string, user: User) => {
    console.log(`${action} action for user:`, user.id);
    // Implement actual actions here
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{formatNumber(userStats.totalUsers)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{formatNumber(userStats.activeUsers)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">New Today</p>
                <p className="text-2xl font-bold">{formatNumber(userStats.newUsersToday)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Suspended</p>
                <p className="text-2xl font-bold">{formatNumber(userStats.suspendedUsers)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Moderators</p>
                <p className="text-2xl font-bold">{formatNumber(userStats.moderators)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Crown className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{formatNumber(userStats.admins)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>User Management</CardTitle>
            <Button>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-md text-sm"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="user">User</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-background border border-border rounded-md text-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="banned">Banned</option>
            </select>

            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              More Filters
            </Button>
          </div>

          {/* Users Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Messages</TableHead>
                  <TableHead>Interactions</TableHead>
                  <TableHead>Warnings</TableHead>
                  <TableHead>Last Active</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group"
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatar_url} />
                          <AvatarFallback>
                            {user.username.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{user.username}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(user.role)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(user.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Activity className="w-4 h-4 text-muted-foreground" />
                        <span>{formatNumber(user.total_messages)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatNumber(user.total_interactions)}
                    </TableCell>
                    <TableCell>
                      {user.warnings > 0 ? (
                        <Badge variant="destructive" className="text-xs">
                          {user.warnings}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {formatDate(user.last_active)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleUserAction('view', user)}>
                            <UserCheck className="w-4 h-4 mr-2" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUserAction('edit', user)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {user.status === 'active' ? (
                            <DropdownMenuItem 
                              onClick={() => handleUserAction('suspend', user)}
                              className="text-yellow-600"
                            >
                              <UserX className="w-4 h-4 mr-2" />
                              Suspend
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem 
                              onClick={() => handleUserAction('activate', user)}
                              className="text-green-600"
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            onClick={() => handleUserAction('ban', user)}
                            className="text-destructive"
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            Ban User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Verification:** 
- File created with comprehensive user management interface
- User filtering by role and status
- Statistical overview with user metrics
- Action menus for user operations and moderation

### Task 4: Create System Health Monitor ⏳
Create components for monitoring platform health and performance metrics.

**File to Create:** `components/admin/SystemHealthMonitor.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { 
  Activity,
  Server,
  Database,
  Wifi,
  HardDrive,
  Cpu,
  MemoryStick,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Clock,
  Zap,
  Globe,
  Shield
} from 'lucide-react';
import { formatNumber, formatPercentage } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface SystemHealthMonitorProps {
  className?: string;
}

interface SystemMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: number;
  responseTime: number;
  errorRate: number;
  activeConnections: number;
}

interface HealthStatus {
  overall: 'healthy' | 'warning' | 'critical';
  services: {
    api: 'online' | 'degraded' | 'offline';
    database: 'online' | 'degraded' | 'offline';
    streaming: 'online' | 'degraded' | 'offline';
    cdn: 'online' | 'degraded' | 'offline';
    auth: 'online' | 'degraded' | 'offline';
  };
}

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  resolved: boolean;
}

export function SystemHealthMonitor({ className }: SystemHealthMonitorProps) {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpu: 45,
    memory: 67,
    disk: 34,
    network: 89,
    uptime: 99.9,
    responseTime: 245,
    errorRate: 0.02,
    activeConnections: 1247
  });

  const [healthStatus, setHealthStatus] = useState<HealthStatus>({
    overall: 'healthy',
    services: {
      api: 'online',
      database: 'online',
      streaming: 'online',
      cdn: 'degraded',
      auth: 'online'
    }
  });

  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'warning',
      title: 'High Memory Usage',
      message: 'Memory usage has exceeded 65% for the past 15 minutes',
      timestamp: '2024-01-20T14:30:00Z',
      resolved: false
    },
    {
      id: '2',
      type: 'info',
      title: 'CDN Performance',
      message: 'CDN response times are slightly elevated in EU region',
      timestamp: '2024-01-20T13:45:00Z',
      resolved: false
    }
  ]);

  const [performanceData, setPerformanceData] = useState<any[]>([]);

  // Generate mock performance data
  useEffect(() => {
    const data = [];
    for (let i = 23; i >= 0; i--) {
      const time = new Date();
      time.setHours(time.getHours() - i);
      
      data.push({
        time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cpu: Math.random() * 40 + 30,
        memory: Math.random() * 30 + 50,
        network: Math.random() * 20 + 70,
        responseTime: Math.random() * 100 + 200
      });
    }
    setPerformanceData(data);
  }, []);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpu: Math.max(0, Math.min(100, prev.cpu + (Math.random() - 0.5) * 10)),
        memory: Math.max(0, Math.min(100, prev.memory + (Math.random() - 0.5) * 5)),
        responseTime: Math.max(100, prev.responseTime + (Math.random() - 0.5) * 50),
        activeConnections: Math.max(0, prev.activeConnections + Math.floor((Math.random() - 0.5) * 100))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded':
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'offline':
      case 'critical':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-500 hover:bg-green-600">Online</Badge>;
      case 'degraded':
        return <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">Degraded</Badge>;
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default:
        return <Activity className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overall Health Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon(healthStatus.overall)}
              <span>System Health Overview</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="animate-pulse">
                <Activity className="w-3 h-3 mr-1" />
                Live
              </Badge>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Server className="w-6 h-6 text-blue-500" />
              </div>
              <p className="text-sm font-medium">API Server</p>
              {getStatusBadge(healthStatus.services.api)}
            </div>

            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Database className="w-6 h-6 text-green-500" />
              </div>
              <p className="text-sm font-medium">Database</p>
              {getStatusBadge(healthStatus.services.database)}
            </div>

            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Zap className="w-6 h-6 text-purple-500" />
              </div>
              <p className="text-sm font-medium">Streaming</p>
              {getStatusBadge(healthStatus.services.streaming)}
            </div>

            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Globe className="w-6 h-6 text-orange-500" />
              </div>
              <p className="text-sm font-medium">CDN</p>
              {getStatusBadge(healthStatus.services.cdn)}
            </div>

            <div className="text-center p-4 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-indigo-500" />
              </div>
              <p className="text-sm font-medium">Auth</p>
              {getStatusBadge(healthStatus.services.auth)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Cpu className="w-5 h-5 text-blue-500" />
                <span className="font-medium">CPU Usage</span>
              </div>
              <span className="text-2xl font-bold">{metrics.cpu.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.cpu} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {metrics.cpu > 80 ? 'High usage detected' : 'Normal operation'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <MemoryStick className="w-5 h-5 text-green-500" />
                <span className="font-medium">Memory</span>
              </div>
              <span className="text-2xl font-bold">{metrics.memory.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.memory} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {metrics.memory > 70 ? 'Consider scaling up' : 'Healthy levels'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <HardDrive className="w-5 h-5 text-purple-500" />
                <span className="font-medium">Disk Usage</span>
              </div>
              <span className="text-2xl font-bold">{metrics.disk.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.disk} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              Plenty of space available
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Wifi className="w-5 h-5 text-orange-500" />
                <span className="font-medium">Network</span>
              </div>
              <span className="text-2xl font-bold">{metrics.network.toFixed(1)}%</span>
            </div>
            <Progress value={metrics.network} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              High bandwidth utilization
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Resource Usage (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <AreaChart data={performanceData}>
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
                    className="text-muted-foreground"
                  />
                  <Tooltip 
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    stackId="1"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                    name="CPU %"
                  />
                  <Area
                    type="monotone"
                    dataKey="memory"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Memory %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Response Time (24h)</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <LineChart data={performanceData}>
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
                    className="text-muted-foreground"
                  />
                  <Tooltip 
                    labelStyle={{ color: 'hsl(var(--foreground))' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value) => [`${value}ms`, 'Response Time']}
                  />
                  <Line
                    type="monotone"
                    dataKey="responseTime"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>System Alerts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
              <p>No active alerts. System is running smoothly.</p>
            </div>
          ) : (
            alerts.map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Alert className={cn(
                  alert.type === 'error' && "border-red-500 bg-red-50 dark:bg-red-950",
                  alert.type === 'warning' && "border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                )}>
                  <div className="flex items-start space-x-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <AlertTitle className="flex items-center justify-between">
                        <span>{alert.title}</span>
                        <span className="text-sm text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </AlertTitle>
                      <AlertDescription className="mt-1">
                        {alert.message}
                      </AlertDescription>
                      {!alert.resolved && (
                        <Button variant="outline" size="sm" className="mt-3">
                          Mark as Resolved
                        </Button>
                      )}
                    </div>
                  </div>
                </Alert>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

**Verification:** 
- File created with comprehensive system health monitoring
- Real-time metrics display with progress bars
- Performance charts with resource usage trends
- Alert system with different severity levels

## Task Completion Checklist
Mark each task as complete when finished:

- [ ] Task 1: Admin dashboard layout created ✅
- [ ] Task 2: Content management interface created ✅  
- [ ] Task 3: User management interface created ✅
- [ ] Task 4: System health monitor created ✅

## Verification Steps
After completing all tasks:

1. Check all admin files exist:
   ```bash
   ls -la components/admin/
   ```

2. Test TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```

3. Verify admin route protection works:
   ```bash
   npm run dev
   ```

## Success Criteria
- All 4 admin components created successfully
- TypeScript compilation succeeds without errors
- Admin-only access control implemented
- Responsive design across all admin interfaces
- Real-time data updates working
- Interactive charts and tables functional

## Important Notes
- Components check for admin permissions
- Responsive layouts for mobile admin access
- Real-time updates for system monitoring
- Comprehensive data management interfaces
- Security considerations for admin operations

## Troubleshooting
If you encounter issues:
1. Verify user permission checking works
2. Check admin route protection
3. Ensure data hooks are properly configured
4. Test responsive layouts on mobile devices

## Next Step
After completing this step and marking all tasks ✅, proceed to Step 24: Create API Routes.