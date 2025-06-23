'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface SyncStatus {
  cloudflare_videos: number;
  supabase_videos: number;
  missing_videos: number;
  is_synced: boolean;
  last_checked: string;
}

interface SyncResult {
  cloudflare_stream_id: string;
  title: string;
  action: 'created' | 'updated' | 'skipped' | 'error';
  error?: string;
}

interface SyncSummary {
  total_cloudflare_videos: number;
  total_synced: number;
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  results: SyncResult[];
}

export function ContentLibrarySync() {
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [lastSyncResult, setLastSyncResult] = useState<SyncSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkSyncStatus = async () => {
    setIsCheckingStatus(true);
    setError(null);
    
    try {
      const response = await fetch('/api/content-library/sync');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to check sync status');
      }
      
      setSyncStatus(data.sync_status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check sync status');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const runSync = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/content-library/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: false })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Sync failed');
      }
      
      setLastSyncResult(data);
      await checkSyncStatus(); // Refresh status after sync
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!syncStatus) return null;
    
    if (syncStatus.is_synced) {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Synced</Badge>;
    } else {
      return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Out of Sync</Badge>;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'updated': return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case 'skipped': return <CheckCircle className="w-4 h-4 text-gray-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Content Library Sync</CardTitle>
          <CardDescription>
            Sync your Cloudflare Stream videos with the content library. This ensures all videos are properly organized and accessible.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="font-medium">Sync Status</h3>
              {syncStatus ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {getStatusBadge()}
                    <span className="text-sm text-muted-foreground">
                      Last checked: {new Date(syncStatus.last_checked).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div>Cloudflare Videos: <span className="font-mono">{syncStatus.cloudflare_videos}</span></div>
                    <div>Library Videos: <span className="font-mono">{syncStatus.supabase_videos}</span></div>
                    {syncStatus.missing_videos > 0 && (
                      <div className="text-orange-600">
                        Missing Videos: <span className="font-mono">{syncStatus.missing_videos}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Click "Check Status" to see sync status</div>
              )}
            </div>
            
            <div className="space-x-2">
              <Button 
                variant="outline" 
                onClick={checkSyncStatus}
                disabled={isCheckingStatus}
                size="sm"
              >
                {isCheckingStatus ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Check Status
              </Button>
              
              <Button 
                onClick={runSync}
                disabled={isLoading || isCheckingStatus}
                size="sm"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Sync Now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {lastSyncResult && (
        <Card>
          <CardHeader>
            <CardTitle>Last Sync Results</CardTitle>
            <CardDescription>
              Summary of the most recent content library sync operation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{lastSyncResult.created}</div>
                <div className="text-sm text-green-700">Created</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{lastSyncResult.updated}</div>
                <div className="text-sm text-blue-700">Updated</div>
              </div>
              <div className="text-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-600">{lastSyncResult.skipped}</div>
                <div className="text-sm text-gray-700">Skipped</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{lastSyncResult.errors}</div>
                <div className="text-sm text-red-700">Errors</div>
              </div>
            </div>

            {lastSyncResult.results.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Video Details</h4>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {lastSyncResult.results.map((result, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                      {getActionIcon(result.action)}
                      <span className="font-mono text-xs text-gray-500">{result.cloudflare_stream_id}</span>
                      <span className="flex-1 truncate">{result.title}</span>
                      <Badge variant="outline" className="text-xs">{result.action}</Badge>
                      {result.error && (
                        <span className="text-red-500 text-xs truncate max-w-xs" title={result.error}>
                          {result.error}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}