'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Loader2, 
  RefreshCw,
  Settings,
  Download,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface SyncReport {
  summary: {
    totalCloudflareVideos: number;
    totalSupabaseVideos: number;
    synced: number;
    missingInSupabase: number;
    missingInCloudflare: number;
  };
  issues: {
    missingInSupabase: Array<{
      cloudflareVideoId: string;
      title: string;
      uploadedAt: string;
      ready: boolean;
    }>;
    missingInCloudflare: Array<{
      cloudflareVideoId: string;
      supabaseId: string;
      title: string;
      createdAt: string;
    }>;
  };
  lastChecked: string;
}

export function SyncDashboard() {
  const [syncReport, setSyncReport] = useState<SyncReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [repairing, setRepairing] = useState(false);
  const [forceSyncing, setForceSyncing] = useState(false);
  const [cleaningUp, setCleaningUp] = useState(false);

  const fetchSyncReport = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/stream/sync-verify');
      if (response.ok) {
        const report = await response.json();
        setSyncReport(report);
      } else {
        toast.error('Failed to fetch sync report');
      }
    } catch (error) {
      console.error('Error fetching sync report:', error);
      toast.error('Error fetching sync report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncReport();
  }, []);

  const repairMissingInSupabase = async () => {
    if (!syncReport?.issues.missingInSupabase.length) return;
    
    setRepairing(true);
    try {
      const videoIds = syncReport.issues.missingInSupabase.map(item => item.cloudflareVideoId);
      
      const response = await fetch('/api/stream/sync-repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoIds, autoFix: true })
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Repair completed: ${result.summary.created} videos synced to Supabase`);
        await fetchSyncReport(); // Refresh the report
      } else {
        toast.error('Failed to repair sync issues');
      }
    } catch (error) {
      console.error('Error repairing sync:', error);
      toast.error('Error repairing sync issues');
    } finally {
      setRepairing(false);
    }
  };

  const markOrphanedVideos = async () => {
    if (!syncReport?.issues.missingInCloudflare.length) return;
    
    setRepairing(true);
    try {
      const videoIds = syncReport.issues.missingInCloudflare.map(item => item.cloudflareVideoId);
      
      const response = await fetch(`/api/stream/sync-repair?action=mark_deleted&videoIds=${videoIds.join(',')}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Marked ${result.summary.updated} orphaned videos as unpublished`);
        await fetchSyncReport(); // Refresh the report
      } else {
        toast.error('Failed to mark orphaned videos');
      }
    } catch (error) {
      console.error('Error marking orphaned videos:', error);
      toast.error('Error marking orphaned videos');
    } finally {
      setRepairing(false);
    }
  };

  const handleForceSync = async () => {
    setForceSyncing(true);
    try {
      toast.info('Starting force sync for all ready videos...');
      
      const response = await fetch('/api/content-library/force-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sync_all_ready: true }),
      });
      
      const result = await response.json();
      
      // Log the full response for debugging
      console.log('Force sync API response:', result);
      
      if (result.success) {
        toast.success(`Force sync completed! Created: ${result.summary.created}, Updated: ${result.summary.updated}`);
        
        // Log detailed results
        console.log('Force sync results:', result);
        console.log('Detailed sync results:', result.results);
        
        // Log any errors
        if (result.summary.errors > 0) {
          console.error('Sync errors found:');
          result.results.forEach((r, i) => {
            if (r.action === 'error') {
              console.error(`Error ${i + 1}:`, r);
            }
          });
        }
        
        if (result.summary.created > 0) {
          toast.success(`🎉 ${result.summary.created} videos synced from Cloudflare to Supabase!`);
        } else if (result.summary.total_processed === 0) {
          toast.info('All ready videos are already synced!');
        }
        
        // Refresh the sync report to show updated status
        await fetchSyncReport();
      } else {
        console.error('Force sync failed with result:', result);
        throw new Error(result.error || result.details || 'Force sync failed');
      }
    } catch (error) {
      console.error('Force sync error:', error);
      toast.error(`Force sync failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setForceSyncing(false);
    }
  };

  const handleCleanupStuckVideos = async () => {
    setCleaningUp(true);
    try {
      // First, do a dry run to see what would be deleted
      toast.info('Analyzing stuck videos...');
      
      const dryRunResponse = await fetch('/api/stream/cleanup-stuck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dry_run: true, max_age_hours: 1 }),
      });
      
      const dryRunResult = await dryRunResponse.json();
      
      if (!dryRunResult.success) {
        throw new Error(dryRunResult.error || 'Failed to analyze stuck videos');
      }
      
      const stuckCount = dryRunResult.stuck_videos?.length || 0;
      
      if (stuckCount === 0) {
        toast.success('No stuck videos found! 🎉');
        return;
      }
      
      // Show confirmation with details
      const confirmed = window.confirm(
        `Found ${stuckCount} stuck videos (pending upload >1 hour).\n\n` +
        `This will permanently delete these videos from Cloudflare Stream.\n` +
        `They cannot be recovered after deletion.\n\n` +
        `Continue with cleanup?`
      );
      
      if (!confirmed) {
        toast.info('Cleanup cancelled');
        return;
      }
      
      toast.info(`Deleting ${stuckCount} stuck videos...`);
      
      // Perform actual cleanup
      const cleanupResponse = await fetch('/api/stream/cleanup-stuck', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dry_run: false, max_age_hours: 1 }),
      });
      
      const cleanupResult = await cleanupResponse.json();
      
      if (cleanupResult.success) {
        const { deleted, failed } = cleanupResult.summary;
        
        if (deleted > 0) {
          toast.success(`🗑️ Cleanup complete! Deleted ${deleted} stuck videos`);
        }
        
        if (failed > 0) {
          toast.warning(`⚠️ ${failed} videos could not be deleted. Check manually.`);
        }
        
        // Refresh the sync report to show updated status
        await fetchSyncReport();
      } else {
        throw new Error(cleanupResult.error || 'Cleanup failed');
      }
      
    } catch (error) {
      console.error('Cleanup error:', error);
      toast.error(`Cleanup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setCleaningUp(false);
    }
  };

  const syncHealthPercentage = syncReport 
    ? (syncReport.summary.synced / Math.max(syncReport.summary.totalCloudflareVideos, syncReport.summary.totalSupabaseVideos, 1)) * 100
    : 0;

  const getHealthColor = (percentage: number) => {
    if (percentage >= 95) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getHealthBadge = (percentage: number) => {
    if (percentage >= 95) return <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">Excellent</span>;
    if (percentage >= 80) return <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">Good</span>;
    return <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-800">Needs Attention</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Video Sync Dashboard</h2>
          <p className="text-muted-foreground">Monitor sync status between Cloudflare Stream and Supabase</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            onClick={handleCleanupStuckVideos} 
            disabled={loading || cleaningUp}
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className={`h-4 w-4 mr-2 ${cleaningUp ? 'animate-pulse' : ''}`} />
            {cleaningUp ? 'Cleaning Up...' : 'Delete Stuck Videos'}
          </Button>
          <Button 
            onClick={handleForceSync} 
            disabled={loading || forceSyncing}
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className={`h-4 w-4 mr-2 ${forceSyncing ? 'animate-pulse' : ''}`} />
            {forceSyncing ? 'Force Syncing...' : 'Force Sync Ready Videos'}
          </Button>
          <Button onClick={fetchSyncReport} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        </div>
      </div>

      {loading && !syncReport ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Analyzing sync status...</span>
            </div>
          </CardContent>
        </Card>
      ) : syncReport ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sync Health</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  <div className={`text-2xl font-bold ${getHealthColor(syncHealthPercentage)}`}>
                    {Math.round(syncHealthPercentage)}%
                  </div>
                  {getHealthBadge(syncHealthPercentage)}
                </div>
                <Progress value={syncHealthPercentage} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Synced Videos</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{syncReport.summary.synced}</div>
                <p className="text-xs text-muted-foreground">
                  Properly synced between both platforms
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Missing in Supabase</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{syncReport.summary.missingInSupabase}</div>
                <p className="text-xs text-muted-foreground">
                  Videos in Cloudflare only
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Orphaned Records</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{syncReport.summary.missingInCloudflare}</div>
                <p className="text-xs text-muted-foreground">
                  Records in Supabase only
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Issues and Actions */}
          {(syncReport.summary.missingInSupabase > 0 || syncReport.summary.missingInCloudflare > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Sync Issues Found</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {syncReport.summary.missingInSupabase > 0 && (
                  <div className="p-4 border border-yellow-200 rounded-lg bg-yellow-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-yellow-800">
                        {syncReport.summary.missingInSupabase} Videos Missing in Supabase
                      </h3>
                      <Button 
                        size="sm" 
                        onClick={repairMissingInSupabase} 
                        disabled={repairing}
                        className="bg-yellow-600 hover:bg-yellow-700"
                      >
                        {repairing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Download className="h-4 w-4 mr-2" />
                        )}
                        Auto-Sync to Supabase
                      </Button>
                    </div>
                    <p className="text-sm text-yellow-700 mb-3">
                      These videos exist in Cloudflare Stream but are missing from your Supabase database.
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {syncReport.issues.missingInSupabase.slice(0, 5).map((video) => (
                        <div key={video.cloudflareVideoId} className="text-xs bg-white p-2 rounded border">
                          <strong>{video.title}</strong> ({video.cloudflareVideoId})
                          <span className="ml-2 text-muted-foreground">
                            {video.ready ? '✅ Ready' : '⏳ Processing'}
                          </span>
                        </div>
                      ))}
                      {syncReport.issues.missingInSupabase.length > 5 && (
                        <div className="text-xs text-yellow-600">
                          ... and {syncReport.issues.missingInSupabase.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {syncReport.summary.missingInCloudflare > 0 && (
                  <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-red-800">
                        {syncReport.summary.missingInCloudflare} Orphaned Records
                      </h3>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={markOrphanedVideos} 
                        disabled={repairing}
                      >
                        {repairing ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Mark as Unpublished
                      </Button>
                    </div>
                    <p className="text-sm text-red-700 mb-3">
                      These records exist in Supabase but their videos are missing from Cloudflare Stream.
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {syncReport.issues.missingInCloudflare.slice(0, 5).map((video) => (
                        <div key={video.cloudflareVideoId} className="text-xs bg-white p-2 rounded border">
                          <strong>{video.title}</strong> ({video.cloudflareVideoId})
                          <span className="ml-2 text-muted-foreground">
                            Supabase ID: {video.supabaseId}
                          </span>
                        </div>
                      ))}
                      {syncReport.issues.missingInCloudflare.length > 5 && (
                        <div className="text-xs text-red-600">
                          ... and {syncReport.issues.missingInCloudflare.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* All Good */}
          {syncReport.summary.missingInSupabase === 0 && syncReport.summary.missingInCloudflare === 0 && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-green-800">Perfect Sync! 🎉</h3>
                    <p className="text-sm text-green-700">
                      All videos are properly synced between Cloudflare Stream and Supabase.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-xs text-muted-foreground text-center">
            Last checked: {new Date(syncReport.lastChecked).toLocaleString()}
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-muted-foreground">
              No sync data available. Click refresh to check sync status.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}