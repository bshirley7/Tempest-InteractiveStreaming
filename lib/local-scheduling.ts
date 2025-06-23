// Local scheduling engine for TV guide and 24/7 programming

import { addMinutes, addHours, startOfDay, format, isAfter, isBefore, addDays } from 'date-fns';
import { ScheduleItem, ChannelId, ContentType, LocalVideoContent } from './types';
import { CHANNELS, TV_GUIDE_CONFIG } from './constants';
import { videoLibrary } from './local-video-library';

export class SchedulingEngine {
  private schedules: Map<ChannelId, ScheduleItem[]> = new Map();
  private currentPrograms: Map<ChannelId, ScheduleItem | null> = new Map();
  private scheduleCache: Map<string, ScheduleItem[]> = new Map();
  private lastUpdate: Date = new Date();

  constructor() {
    this.initializeChannels();
    this.generateSchedules();
    this.startPeriodicUpdates();
  }

  private initializeChannels() {
    CHANNELS.forEach(channel => {
      this.schedules.set(channel.id as ChannelId, []);
      this.currentPrograms.set(channel.id as ChannelId, null);
    });
  }

  // Generate 24/7 schedules for all channels
  private generateSchedules() {
    const now = new Date();
    const startTime = startOfDay(now);
    
    CHANNELS.forEach(channel => {
      const schedule = this.generateChannelSchedule(channel.id as ChannelId, startTime);
      this.schedules.set(channel.id as ChannelId, schedule);
    });
    
    this.updateCurrentPrograms();
    this.cacheSchedules();
  }

  // Generate schedule for a specific channel
  private generateChannelSchedule(channelId: ChannelId, startTime: Date): ScheduleItem[] {
    const schedule: ScheduleItem[] = [];
    const channelVideos = videoLibrary.getChannelVideos(channelId);
    
    if (channelVideos.length === 0) {
      // Create placeholder content if no videos available
      return this.generatePlaceholderSchedule(channelId, startTime);
    }

    let currentTime = startTime;
    const endTime = addDays(startTime, 7); // Generate 7 days of schedule
    
    // Create weighted playlist based on time of day
    while (currentTime < endTime) {
      const timeOfDay = currentTime.getHours();
      const video = this.selectVideoForTimeSlot(channelVideos, timeOfDay, channelId);
      
      if (video) {
        const duration = Math.max(video.duration, 30 * 60); // Minimum 30 minutes
        const endTimeSlot = addMinutes(currentTime, Math.ceil(duration / 60));
        
        const scheduleItem: ScheduleItem = {
          id: `${channelId}-${currentTime.getTime()}-${video.id}`,
          channelId,
          contentId: video.id,
          title: video.title,
          description: video.description,
          startTime: new Date(currentTime),
          endTime: endTimeSlot,
          type: this.determineContentType(timeOfDay, video),
          thumbnail: video.thumbnailPath,
          isLive: false,
          metadata: {
            originalDuration: video.duration,
            category: video.category,
            tags: video.tags,
            cloudflareId: video.cloudflareId,
          },
        };
        
        schedule.push(scheduleItem);
        currentTime = endTimeSlot;
      } else {
        // Skip to next hour if no suitable video found
        currentTime = addHours(currentTime, 1);
      }
    }
    
    return schedule;
  }

  // Generate placeholder schedule when no content is available
  private generatePlaceholderSchedule(channelId: ChannelId, startTime: Date): ScheduleItem[] {
    const schedule: ScheduleItem[] = [];
    const channel = CHANNELS.find(c => c.id === channelId);
    const channelName = channel?.name || channelId;
    
    let currentTime = startTime;
    const endTime = addDays(startTime, 1);
    
    while (currentTime < endTime) {
      const scheduleItem: ScheduleItem = {
        id: `${channelId}-placeholder-${currentTime.getTime()}`,
        channelId,
        title: `${channelName} Programming`,
        description: `Coming soon to ${channelName}`,
        startTime: new Date(currentTime),
        endTime: addHours(currentTime, 2),
        type: 'vod',
        thumbnail: '/images/placeholder-thumbnail.jpg',
        isLive: false,
        metadata: {
          isPlaceholder: true,
        },
      };
      
      schedule.push(scheduleItem);
      currentTime = addHours(currentTime, 2);
    }
    
    return schedule;
  }

  // Select appropriate video for time slot
  private selectVideoForTimeSlot(
    videos: LocalVideoContent[], 
    hour: number, 
    channelId: ChannelId
  ): LocalVideoContent | null {
    if (videos.length === 0) return null;
    
    // Filter videos based on time-appropriate content
    let suitableVideos = videos.filter(video => {
      const duration = video.duration;
      
      // Morning content (6-12): Shorter educational content
      if (hour >= 6 && hour < 12) {
        return duration <= 45 * 60 && this.isEducationalContent(video);
      }
      
      // Afternoon content (12-18): Varied content
      if (hour >= 12 && hour < 18) {
        return duration <= 90 * 60;
      }
      
      // Evening content (18-22): Longer, entertaining content
      if (hour >= 18 && hour < 22) {
        return duration >= 30 * 60;
      }
      
      // Late night (22-6): Relaxing or ambient content
      return this.isRelaxingContent(video) || duration >= 60 * 60;
    });
    
    // Fallback to all videos if no suitable ones found
    if (suitableVideos.length === 0) {
      suitableVideos = videos;
    }
    
    // Select random video from suitable options
    return suitableVideos[Math.floor(Math.random() * suitableVideos.length)];
  }

  // Check if content is educational
  private isEducationalContent(video: LocalVideoContent): boolean {
    const keywords = ['lecture', 'tutorial', 'education', 'learning', 'course', 'how-to'];
    const content = (video.title + ' ' + video.description + ' ' + video.tags.join(' ')).toLowerCase();
    return keywords.some(keyword => content.includes(keyword));
  }

  // Check if content is relaxing
  private isRelaxingContent(video: LocalVideoContent): boolean {
    const keywords = ['relaxing', 'meditation', 'ambient', 'peaceful', 'calm', 'sleep', 'nature'];
    const content = (video.title + ' ' + video.description + ' ' + video.tags.join(' ')).toLowerCase();
    return keywords.some(keyword => content.includes(keyword));
  }

  // Determine content type based on time and video
  private determineContentType(hour: number, video: LocalVideoContent): ContentType {
    // Live content during peak hours
    if ((hour >= 8 && hour <= 10) || (hour >= 19 && hour <= 21)) {
      return Math.random() < 0.3 ? 'live' : 'vod';
    }
    
    // Premieres during evening
    if (hour >= 20 && hour <= 22) {
      return Math.random() < 0.2 ? 'premiere' : 'vod';
    }
    
    // Reruns during late night/early morning
    if (hour >= 0 && hour <= 6) {
      return 'rerun';
    }
    
    return 'vod';
  }

  // Update current programs for all channels
  private updateCurrentPrograms() {
    const now = new Date();
    
    this.schedules.forEach((schedule, channelId) => {
      const currentProgram = schedule.find(item => 
        isBefore(item.startTime, now) && isAfter(item.endTime, now)
      );
      
      this.currentPrograms.set(channelId, currentProgram || null);
    });
  }

  // Cache schedules for quick retrieval
  private cacheSchedules() {
    this.scheduleCache.clear();
    
    // Cache daily schedules
    for (let i = 0; i < 7; i++) {
      const date = addDays(new Date(), i);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      CHANNELS.forEach(channel => {
        const schedule = this.getChannelScheduleForDate(channel.id as ChannelId, date);
        this.scheduleCache.set(`${channel.id}-${dateKey}`, schedule);
      });
    }
  }

  // Get schedule for specific channel and date
  private getChannelScheduleForDate(channelId: ChannelId, date: Date): ScheduleItem[] {
    const schedule = this.schedules.get(channelId) || [];
    const startOfTargetDay = startOfDay(date);
    const endOfTargetDay = addDays(startOfTargetDay, 1);
    
    return schedule.filter(item => 
      item.startTime >= startOfTargetDay && item.startTime < endOfTargetDay
    );
  }

  // Start periodic updates
  private startPeriodicUpdates() {
    setInterval(() => {
      this.updateCurrentPrograms();
      
      // Regenerate schedules every hour
      if (Date.now() - this.lastUpdate.getTime() > 60 * 60 * 1000) {
        this.generateSchedules();
        this.lastUpdate = new Date();
      }
    }, TV_GUIDE_CONFIG.UPDATE_INTERVAL);
  }

  // Public API methods

  // Get current program for channel
  public getCurrentProgram(channelId: ChannelId): ScheduleItem | null {
    return this.currentPrograms.get(channelId) || null;
  }

  // Get next program for channel
  public getNextProgram(channelId: ChannelId): ScheduleItem | null {
    const now = new Date();
    const schedule = this.schedules.get(channelId) || [];
    
    return schedule.find(item => isAfter(item.startTime, now)) || null;
  }

  // Get schedule for specific channel and time range
  public getChannelSchedule(
    channelId: ChannelId, 
    startTime?: Date, 
    endTime?: Date
  ): ScheduleItem[] {
    const schedule = this.schedules.get(channelId) || [];
    
    if (!startTime && !endTime) {
      return schedule;
    }
    
    const start = startTime || new Date();
    const end = endTime || addHours(start, TV_GUIDE_CONFIG.HOURS_TO_SHOW);
    
    return schedule.filter(item => 
      item.startTime < end && item.endTime > start
    );
  }

  // Get schedule for all channels in time range
  public getAllChannelsSchedule(startTime?: Date, endTime?: Date): Map<ChannelId, ScheduleItem[]> {
    const result = new Map<ChannelId, ScheduleItem[]>();
    
    CHANNELS.forEach(channel => {
      const schedule = this.getChannelSchedule(channel.id as ChannelId, startTime, endTime);
      result.set(channel.id as ChannelId, schedule);
    });
    
    return result;
  }

  // Get TV guide data for UI
  public getTVGuideData(startTime?: Date, hours?: number): {
    timeSlots: Date[];
    channels: typeof CHANNELS;
    programs: Map<string, ScheduleItem[]>;
  } {
    const start = startTime || new Date();
    const hoursToShow = hours || TV_GUIDE_CONFIG.HOURS_TO_SHOW;
    const end = addHours(start, hoursToShow);
    
    // Generate time slots
    const timeSlots: Date[] = [];
    let currentSlot = start;
    while (currentSlot < end) {
      timeSlots.push(new Date(currentSlot));
      currentSlot = addMinutes(currentSlot, TV_GUIDE_CONFIG.MINUTES_PER_SLOT);
    }
    
    // Get programs for each channel
    const programs = new Map<string, ScheduleItem[]>();
    CHANNELS.forEach(channel => {
      const schedule = this.getChannelSchedule(channel.id as ChannelId, start, end);
      programs.set(channel.id, schedule);
    });
    
    return {
      timeSlots,
      channels: CHANNELS,
      programs,
    };
  }

  // Schedule a specific video at a specific time
  public scheduleVideo(
    channelId: ChannelId,
    videoId: string,
    startTime: Date,
    duration?: number
  ): boolean {
    const video = videoLibrary.getVideo(videoId);
    if (!video) return false;
    
    const videoDuration = duration || video.duration || 30 * 60;
    const endTime = addMinutes(startTime, Math.ceil(videoDuration / 60));
    
    const scheduleItem: ScheduleItem = {
      id: `${channelId}-scheduled-${startTime.getTime()}-${videoId}`,
      channelId,
      contentId: videoId,
      title: video.title,
      description: video.description,
      startTime,
      endTime,
      type: 'vod',
      thumbnail: video.thumbnailPath,
      isLive: false,
      metadata: {
        scheduled: true,
        originalDuration: video.duration,
        category: video.category,
        tags: video.tags,
      },
    };
    
    // Insert into schedule
    const schedule = this.schedules.get(channelId) || [];
    
    // Remove conflicting programs
    const filteredSchedule = schedule.filter(item => 
      item.endTime <= startTime || item.startTime >= endTime
    );
    
    filteredSchedule.push(scheduleItem);
    filteredSchedule.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    this.schedules.set(channelId, filteredSchedule);
    this.cacheSchedules();
    
    return true;
  }

  // Remove scheduled program
  public removeScheduledProgram(channelId: ChannelId, programId: string): boolean {
    const schedule = this.schedules.get(channelId) || [];
    const originalLength = schedule.length;
    
    const filteredSchedule = schedule.filter(item => item.id !== programId);
    
    if (filteredSchedule.length < originalLength) {
      this.schedules.set(channelId, filteredSchedule);
      this.cacheSchedules();
      return true;
    }
    
    return false;
  }

  // Get schedule statistics
  public getScheduleStats() {
    const stats = {
      totalPrograms: 0,
      channelStats: new Map<string, number>(),
      averageProgramLength: 0,
      contentTypeDistribution: new Map<ContentType, number>(),
    };
    
    let totalDuration = 0;
    
    this.schedules.forEach((schedule, channelId) => {
      stats.totalPrograms += schedule.length;
      stats.channelStats.set(channelId, schedule.length);
      
      schedule.forEach(program => {
        const duration = program.endTime.getTime() - program.startTime.getTime();
        totalDuration += duration;
        
        const currentCount = stats.contentTypeDistribution.get(program.type) || 0;
        stats.contentTypeDistribution.set(program.type, currentCount + 1);
      });
    });
    
    stats.averageProgramLength = totalDuration / stats.totalPrograms / 1000 / 60; // minutes
    
    return stats;
  }

  // Force regenerate all schedules
  public regenerateSchedules(): void {
    this.generateSchedules();
  }

  // Get program by ID
  public getProgram(programId: string): ScheduleItem | null {
    for (const schedule of this.schedules.values()) {
      const program = schedule.find(item => item.id === programId);
      if (program) return program;
    }
    return null;
  }

  // Search programs
  public searchPrograms(query: string): ScheduleItem[] {
    const results: ScheduleItem[] = [];
    const lowerQuery = query.toLowerCase();
    
    this.schedules.forEach(schedule => {
      schedule.forEach(program => {
        if (
          program.title.toLowerCase().includes(lowerQuery) ||
          program.description?.toLowerCase().includes(lowerQuery)
        ) {
          results.push(program);
        }
      });
    });
    
    return results.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }
}

// Singleton instance
export const schedulingEngine = new SchedulingEngine();

// Helper functions
export const getCurrentProgram = (channelId: ChannelId) => 
  schedulingEngine.getCurrentProgram(channelId);

export const getNextProgram = (channelId: ChannelId) => 
  schedulingEngine.getNextProgram(channelId);

export const getChannelSchedule = (channelId: ChannelId, startTime?: Date, endTime?: Date) => 
  schedulingEngine.getChannelSchedule(channelId, startTime, endTime);

export const getTVGuideData = (startTime?: Date, hours?: number) => 
  schedulingEngine.getTVGuideData(startTime, hours);

export const scheduleVideo = (channelId: ChannelId, videoId: string, startTime: Date, duration?: number) => 
  schedulingEngine.scheduleVideo(channelId, videoId, startTime, duration);

export const searchPrograms = (query: string) => 
  schedulingEngine.searchPrograms(query);