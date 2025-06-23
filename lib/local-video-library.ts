// Local video library management system for Tempest streaming platform

import { VideoContent, LocalVideoContent, ChannelId } from './types';
import { CHANNELS } from './constants';

// Video metadata management
export class VideoLibraryManager {
  private videos: Map<string, LocalVideoContent> = new Map();
  private channelVideos: Map<ChannelId, string[]> = new Map();
  private lastSync: Date = new Date();

  constructor() {
    this.initializeChannels();
    this.loadVideoLibrary();
  }

  private initializeChannels() {
    CHANNELS.forEach(channel => {
      this.channelVideos.set(channel.id as ChannelId, []);
    });
  }

  // Load video library from various sources
  private async loadVideoLibrary() {
    try {
      // Load from Supabase
      await this.loadFromDatabase();
      
      // Load from local storage as fallback
      await this.loadFromLocalStorage();
      
      // Sync with Cloudflare if needed
      if (this.shouldSync()) {
        await this.syncWithCloudflare();
      }
    } catch (error) {
      console.error('Failed to load video library:', error);
    }
  }

  // Load videos from Supabase database
  private async loadFromDatabase(): Promise<void> {
    try {
      const response = await fetch('/api/content');
      if (response.ok) {
        const { data: videos } = await response.json();
        
        videos.forEach((video: VideoContent) => {
          const localVideo: LocalVideoContent = {
            id: video.id,
            title: video.title,
            description: video.description || '',
            cloudflareId: video.cloudflare_video_id,
            thumbnailPath: video.thumbnail_url || '',
            duration: video.duration || 0,
            category: video.category || 'general',
            tags: video.tags,
            uploadedAt: video.created_at,
            lastSynced: video.last_synced_at,
            metadata: video.metadata,
          };
          
          this.addVideo(localVideo, video.channel_id as ChannelId);
        });
      }
    } catch (error) {
      console.error('Failed to load videos from database:', error);
    }
  }

  // Load from local storage as backup
  private async loadFromLocalStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem('tempest_video_library');
      if (stored) {
        const { videos, channelVideos, lastSync } = JSON.parse(stored);
        
        Object.entries(videos).forEach(([id, video]) => {
          this.videos.set(id, video as LocalVideoContent);
        });
        
        Object.entries(channelVideos).forEach(([channelId, videoIds]) => {
          this.channelVideos.set(channelId as ChannelId, videoIds as string[]);
        });
        
        this.lastSync = new Date(lastSync);
      }
    } catch (error) {
      console.error('Failed to load from local storage:', error);
    }
  }

  // Sync with Cloudflare Stream
  private async syncWithCloudflare(): Promise<void> {
    try {
      const response = await fetch('/api/cloudflare/sync');
      if (response.ok) {
        const { data: cloudflareVideos } = await response.json();
        
        cloudflareVideos.forEach((cfVideo: any) => {
          if (!this.videos.has(cfVideo.uid)) {
            const localVideo: LocalVideoContent = {
              id: cfVideo.uid,
              title: cfVideo.meta?.name || `Video ${cfVideo.uid.substring(0, 8)}`,
              description: cfVideo.meta?.description || '',
              cloudflareId: cfVideo.uid,
              thumbnailPath: cfVideo.thumbnail,
              duration: cfVideo.duration || 0,
              category: cfVideo.meta?.category || 'general',
              tags: cfVideo.meta?.tags?.split(',') || [],
              uploadedAt: cfVideo.created,
              lastSynced: new Date().toISOString(),
              metadata: cfVideo.meta || {},
            };
            
            // Auto-assign to appropriate channel based on content
            const channelId = this.determineChannel(localVideo);
            this.addVideo(localVideo, channelId);
          }
        });
        
        this.lastSync = new Date();
        this.saveToLocalStorage();
      }
    } catch (error) {
      console.error('Failed to sync with Cloudflare:', error);
    }
  }

  // Determine appropriate channel for video based on content
  private determineChannel(video: LocalVideoContent): ChannelId {
    const title = video.title.toLowerCase();
    const description = video.description.toLowerCase();
    const tags = video.tags.map(tag => tag.toLowerCase());
    
    // Travel content
    if (this.matchesKeywords(title, description, tags, ['travel', 'trip', 'guide', 'city', 'country', 'vacation'])) {
      return 'retirewise';
    }
    
    // Educational content
    if (this.matchesKeywords(title, description, tags, ['lecture', 'education', 'learning', 'tutorial', 'course'])) {
      return 'mindfeed';
    }
    
    // Career content
    if (this.matchesKeywords(title, description, tags, ['career', 'job', 'business', 'startup', 'professional'])) {
      return 'career-compass';
    }
    
    // Wellness content
    if (this.matchesKeywords(title, description, tags, ['wellness', 'health', 'meditation', 'relaxation', 'stress'])) {
      return 'wellness-wave';
    }
    
    // How-to content
    if (this.matchesKeywords(title, description, tags, ['how to', 'tutorial', 'diy', 'guide', 'tips'])) {
      return 'how-to-hub';
    }
    
    // Default to Campus Pulse for general content
    return 'campus-pulse';
  }

  private matchesKeywords(title: string, description: string, tags: string[], keywords: string[]): boolean {
    const content = [title, description, ...tags].join(' ');
    return keywords.some(keyword => content.includes(keyword));
  }

  // Check if sync is needed
  private shouldSync(): boolean {
    const timeSinceSync = Date.now() - this.lastSync.getTime();
    const syncInterval = 5 * 60 * 1000; // 5 minutes
    return timeSinceSync > syncInterval;
  }

  // Add video to library
  public addVideo(video: LocalVideoContent, channelId?: ChannelId): void {
    this.videos.set(video.id, video);
    
    if (channelId && this.channelVideos.has(channelId)) {
      const channelVids = this.channelVideos.get(channelId) || [];
      if (!channelVids.includes(video.id)) {
        channelVids.push(video.id);
        this.channelVideos.set(channelId, channelVids);
      }
    }
    
    this.saveToLocalStorage();
  }

  // Remove video from library
  public removeVideo(videoId: string): void {
    this.videos.delete(videoId);
    
    // Remove from all channels
    this.channelVideos.forEach((videos, channelId) => {
      const filtered = videos.filter(id => id !== videoId);
      this.channelVideos.set(channelId, filtered);
    });
    
    this.saveToLocalStorage();
  }

  // Get video by ID
  public getVideo(videoId: string): LocalVideoContent | undefined {
    return this.videos.get(videoId);
  }

  // Get all videos
  public getAllVideos(): LocalVideoContent[] {
    return Array.from(this.videos.values());
  }

  // Get videos for specific channel
  public getChannelVideos(channelId: ChannelId): LocalVideoContent[] {
    const videoIds = this.channelVideos.get(channelId) || [];
    return videoIds.map(id => this.videos.get(id)).filter(Boolean) as LocalVideoContent[];
  }

  // Search videos
  public searchVideos(query: string): LocalVideoContent[] {
    const lowerQuery = query.toLowerCase();
    
    return this.getAllVideos().filter(video => 
      video.title.toLowerCase().includes(lowerQuery) ||
      video.description.toLowerCase().includes(lowerQuery) ||
      video.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      video.category.toLowerCase().includes(lowerQuery)
    );
  }

  // Get videos by category
  public getVideosByCategory(category: string): LocalVideoContent[] {
    return this.getAllVideos().filter(video => 
      video.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Get videos by tags
  public getVideosByTags(tags: string[]): LocalVideoContent[] {
    return this.getAllVideos().filter(video =>
      tags.some(tag => 
        video.tags.some(videoTag => 
          videoTag.toLowerCase().includes(tag.toLowerCase())
        )
      )
    );
  }

  // Get recently added videos
  public getRecentVideos(limit: number = 10): LocalVideoContent[] {
    return this.getAllVideos()
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, limit);
  }

  // Get popular videos (by view count if available)
  public getPopularVideos(limit: number = 10): LocalVideoContent[] {
    // For now, return random selection
    // In production, this would be based on actual view metrics
    const videos = this.getAllVideos();
    return videos.sort(() => Math.random() - 0.5).slice(0, limit);
  }

  // Get video statistics
  public getLibraryStats() {
    const totalVideos = this.videos.size;
    const channelStats = new Map<string, number>();
    
    CHANNELS.forEach(channel => {
      const count = this.getChannelVideos(channel.id as ChannelId).length;
      channelStats.set(channel.name, count);
    });
    
    const totalDuration = this.getAllVideos().reduce((sum, video) => sum + video.duration, 0);
    
    return {
      totalVideos,
      totalDuration,
      channelStats: Object.fromEntries(channelStats),
      lastSync: this.lastSync,
    };
  }

  // Update video metadata
  public updateVideo(videoId: string, updates: Partial<LocalVideoContent>): void {
    const video = this.videos.get(videoId);
    if (video) {
      const updatedVideo = { ...video, ...updates };
      this.videos.set(videoId, updatedVideo);
      this.saveToLocalStorage();
    }
  }

  // Save to local storage
  private saveToLocalStorage(): void {
    try {
      const data = {
        videos: Object.fromEntries(this.videos),
        channelVideos: Object.fromEntries(this.channelVideos),
        lastSync: this.lastSync.toISOString(),
      };
      
      localStorage.setItem('tempest_video_library', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save to local storage:', error);
    }
  }

  // Force sync with external sources
  public async forcSync(): Promise<void> {
    try {
      await this.syncWithCloudflare();
      await this.loadFromDatabase();
    } catch (error) {
      console.error('Force sync failed:', error);
      throw error;
    }
  }

  // Get sync status
  public getSyncStatus() {
    return {
      lastSync: this.lastSync,
      shouldSync: this.shouldSync(),
      videoCount: this.videos.size,
      channelCounts: Object.fromEntries(
        Array.from(this.channelVideos.entries()).map(([id, videos]) => [id, videos.length])
      ),
    };
  }

  // Clear all videos (useful for debugging)
  public clearLibrary(): void {
    this.videos.clear();
    this.channelVideos.clear();
    this.initializeChannels();
    localStorage.removeItem('tempest_video_library');
  }
}

// Singleton instance
export const videoLibrary = new VideoLibraryManager();

// Helper functions for easier access
export const getVideo = (id: string) => videoLibrary.getVideo(id);
export const getChannelVideos = (channelId: ChannelId) => videoLibrary.getChannelVideos(channelId);
export const searchVideos = (query: string) => videoLibrary.searchVideos(query);
export const getRecentVideos = (limit?: number) => videoLibrary.getRecentVideos(limit);
export const getPopularVideos = (limit?: number) => videoLibrary.getPopularVideos(limit);
export const getLibraryStats = () => videoLibrary.getLibraryStats();