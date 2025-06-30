'use client';

import React, { useState, useEffect } from 'react';
import { VideoPlayerWithInteractions } from '@/components/video/VideoPlayerWithInteractions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  Eye, 
  EyeOff, 
  Plus,
  RefreshCw,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestAd {
  id: string;
  title: string;
  message: string;
  cta_text: string;
  cta_link: string;
  image_url: string;
  company_logo_url?: string;
  is_active: boolean;
  priority: number;
  impression_count: number;
  click_count: number;
}

export default function PauseAdsTestPage() {
  // Video player state
  const [isPlaying, setIsPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration] = useState(300); // 5 minutes
  
  // Ad system state
  const [enablePauseAds, setEnablePauseAds] = useState(true);
  const [ads, setAds] = useState<TestAd[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Test ad creation
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAd, setNewAd] = useState({
    title: 'Test Your Skills Today',
    message: 'Join our advanced programming bootcamp and master the latest technologies.',
    cta_text: 'Learn More',
    cta_link: 'https://example.com/test',
    image_url: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=1920&h=1080&fit=crop',
    company_logo_url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=80&fit=crop'
  });

  // Simulate video time progression
  useEffect(() => {
    if (isPlaying && !isPaused) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return prev + 1;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isPlaying, isPaused, duration]);

  // Fetch ads
  const fetchAds = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test/pause-ads');
      const result = await response.json();
      if (result.success) {
        setAds(result.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch ads:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle ad status
  const toggleAdStatus = async (adId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/test/pause-ads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: adId, is_active: isActive })
      });
      
      if (response.ok) {
        fetchAds();
      }
    } catch (error) {
      console.error('Failed to toggle ad status:', error);
    }
  };

  // Create test ad
  const createTestAd = async () => {
    try {
      console.log('Creating test ad with data:', newAd);
      
      const response = await fetch('/api/test/pause-ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAd)
      });
      
      const result = await response.json();
      console.log('API Response:', result);
      
      if (response.ok && result.success) {
        alert('✅ Test ad created successfully!');
        setShowCreateForm(false);
        fetchAds();
        // Reset form
        setNewAd({
          title: 'Test Your Skills Today',
          message: 'Join our advanced programming bootcamp and master the latest technologies.',
          cta_text: 'Learn More',
          cta_link: 'https://example.com/test',
          image_url: 'https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=1920&h=1080&fit=crop',
          company_logo_url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=200&h=80&fit=crop'
        });
      } else {
        alert(`❌ Failed to create ad: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Failed to create test ad:', error);
      alert(`❌ Network error: ${error.message}`);
    }
  };

  // Video controls
  const handlePlayPause = () => {
    if (isPlaying) {
      setIsPaused(!isPaused);
    } else {
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Load ads on mount
  useEffect(() => {
    fetchAds();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Pause Screen Ads Test Page</h1>
          <p className="text-gray-400">Test pause screen advertisements with live controls</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Player Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Mock Video Player */}
            <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
              <VideoPlayerWithInteractions
                isPaused={isPaused}
                enablePauseAds={enablePauseAds}
                currentVideoTime={currentTime}
                contentId="test-video"
                className="w-full h-full"
              >
                {/* Mock Video Content */}
                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">
                      {isPaused ? <Pause /> : isPlaying ? <Play /> : <Square />}
                    </div>
                    <div className="text-2xl font-bold mb-2">Test Video Player</div>
                    <div className="text-lg opacity-75">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </div>
                    {isPaused && (
                      <div className="mt-4 text-yellow-300">
                        🎯 Pause screen ad should appear now!
                      </div>
                    )}
                  </div>
                </div>
              </VideoPlayerWithInteractions>
            </div>

            {/* Video Controls */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Video Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handlePlayPause}
                    variant={isPlaying && !isPaused ? "default" : "outline"}
                    size="lg"
                  >
                    {isPaused ? <Play className="w-4 h-4 mr-2" /> : <Pause className="w-4 h-4 mr-2" />}
                    {isPaused ? 'Resume' : 'Pause'}
                  </Button>
                  
                  <Button onClick={handleStop} variant="outline">
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={enablePauseAds}
                      onCheckedChange={setEnablePauseAds}
                      id="enable-ads"
                    />
                    <Label htmlFor="enable-ads">Enable Pause Ads</Label>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-400">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(currentTime / duration) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Status */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Status: </span>
                    <Badge variant={isPlaying ? (isPaused ? "destructive" : "default") : "secondary"}>
                      {isPlaying ? (isPaused ? "Paused" : "Playing") : "Stopped"}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-400">Ads: </span>
                    <Badge variant={enablePauseAds ? "default" : "secondary"}>
                      {enablePauseAds ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ad Management Section */}
          <div className="space-y-4">
            {/* Ad List */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Pause Ads
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={fetchAds}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                    <Button size="sm" onClick={() => setShowCreateForm(true)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Manage and test pause screen advertisements
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {loading ? (
                  <div className="text-center py-4 text-gray-400">Loading ads...</div>
                ) : ads.length === 0 ? (
                  <div className="text-center py-4 text-gray-400">
                    No ads found. Create one to test!
                  </div>
                ) : (
                  ads.map((ad) => (
                    <div key={ad.id} className="border border-gray-600 rounded-lg p-3 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{ad.title}</h4>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">{ad.message}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleAdStatus(ad.id, !ad.is_active)}
                        >
                          {ad.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant={ad.is_active ? "default" : "secondary"}>
                          {ad.is_active ? "Active" : "Inactive"}
                        </Badge>
                        <div className="text-gray-400">
                          {ad.impression_count} views • {ad.click_count} clicks
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Quick Test Instructions */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg">🧪 How to Test</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">1</span>
                    <span>Create or activate an ad using the controls above</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">2</span>
                    <span>Ensure &quot;Enable Pause Ads&quot; is turned on</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">3</span>
                    <span>Click &quot;Pause&quot; to pause the video</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">4</span>
                    <span>Pause ad should appear after 1 second</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">5</span>
                    <span>Test closing the ad and clicking the CTA</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Create Ad Form */}
        {showCreateForm && (
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Create Test Ad</CardTitle>
                <Button variant="ghost" onClick={() => setShowCreateForm(false)}>
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newAd.title}
                    onChange={(e) => setNewAd({ ...newAd, title: e.target.value })}
                    placeholder="Eye-catching title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cta">CTA Text</Label>
                  <Input
                    id="cta"
                    value={newAd.cta_text}
                    onChange={(e) => setNewAd({ ...newAd, cta_text: e.target.value })}
                    placeholder="Learn More"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="link">CTA Link</Label>
                  <Input
                    id="link"
                    value={newAd.cta_link}
                    onChange={(e) => setNewAd({ ...newAd, cta_link: e.target.value })}
                    placeholder="https://example.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="image">Background Image URL</Label>
                  <Input
                    id="image"
                    value={newAd.image_url}
                    onChange={(e) => setNewAd({ ...newAd, image_url: e.target.value })}
                    placeholder="Background image URL"
                  />
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    value={newAd.message}
                    onChange={(e) => setNewAd({ ...newAd, message: e.target.value })}
                    placeholder="Compelling description of your offer"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
                <Button onClick={createTestAd}>
                  Create Test Ad
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}