'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Play, Clock, Video } from 'lucide-react';
import { toast } from 'sonner';

interface AdData {
  id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string;
  duration: number;
  position: string;
  cloudflare_video_id: string;
  skip_after_seconds: number;
  display_duration: number;
}

export default function AdTestPage() {
  const [loading, setLoading] = useState(false);
  const [adData, setAdData] = useState<AdData | null>(null);
  const [position, setPosition] = useState<'pre_roll' | 'mid_roll' | 'end_roll'>('pre_roll');

  const fetchAd = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ads/serve?position=${position}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch advertisement');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setAdData(result.data);
        toast.success('Advertisement loaded successfully!');
      } else {
        setAdData(null);
        toast.info(result.message || 'No advertisements available');
      }
    } catch (error) {
      console.error('Error fetching ad:', error);
      toast.error('Failed to load advertisement');
      setAdData(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Automatic Ad Serving Test</h1>
        <p className="text-muted-foreground">
          Test the automatic advertisement serving system using videos marked as advertisements in the content table.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Test Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Ad Position</label>
              <Select value={position} onValueChange={(value: 'pre_roll' | 'mid_roll' | 'end_roll') => setPosition(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pre_roll">Pre-roll (Before content)</SelectItem>
                  <SelectItem value="mid_roll">Mid-roll (During content)</SelectItem>
                  <SelectItem value="end_roll">End-roll (After content)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={fetchAd} 
              disabled={loading}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Loading Ad...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Fetch Random Advertisement
                </>
              )}
            </Button>

            <div className="text-sm text-muted-foreground">
              <p><strong>How it works:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Fetches random video marked as &apos;advertisement&apos; from content table</li>
                <li>Only returns published advertisements</li>
                <li>Automatically generates video URLs using Cloudflare Stream</li>
                <li>Includes skip controls (5 seconds)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader>
            <CardTitle>Advertisement Result</CardTitle>
          </CardHeader>
          <CardContent>
            {adData ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{adData.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{adData.description}</p>
                  </div>
                  <Badge variant="default">
                    {adData.position.replace('_', '-')}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>Duration: {formatDuration(adData.duration)}</span>
                  </div>
                  <div className="flex items-center">
                    <Video className="w-4 h-4 mr-2 text-muted-foreground" />
                    <span>Skip after: {adData.skip_after_seconds}s</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Video URL:</label>
                    <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                      {adData.video_url}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Thumbnail URL:</label>
                    <p className="text-xs font-mono bg-muted p-2 rounded break-all">
                      {adData.thumbnail_url}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Cloudflare Video ID:</label>
                    <p className="text-xs font-mono bg-muted p-2 rounded">
                      {adData.cloudflare_video_id}
                    </p>
                  </div>
                </div>

                {adData.thumbnail_url && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-2">Preview:</label>
                    <img 
                      src={adData.thumbnail_url} 
                      alt={adData.title}
                      className="w-full max-w-sm rounded border"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Video className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No advertisement loaded yet.</p>
                <p className="text-sm mt-2">Click &quot;Fetch Random Advertisement&quot; to test the system.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* API Information */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>API Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Endpoint:</h4>
              <code className="bg-muted p-2 rounded block text-sm">
                GET /api/ads/serve?position=[pre_roll|mid_roll|end_roll]
              </code>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Parameters:</h4>
              <ul className="text-sm space-y-1">
                <li><code>position</code> - Ad position: pre_roll, mid_roll, or end_roll (optional, defaults to pre_roll)</li>
                <li><code>content_id</code> - Content ID for content-specific ads (optional)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Integration Example:</h4>
              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
{`// Fetch ad for pre-roll position
const response = await fetch('/api/ads/serve?position=pre_roll');
const result = await response.json();

if (result.success && result.data) {
  const ad = result.data;
  // Play ad video using ad.video_url
  // Show skip button after ad.skip_after_seconds
  // Display for ad.display_duration seconds
}`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}