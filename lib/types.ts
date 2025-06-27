// TypeScript type definitions for the Tempest streaming platform

import { CHANNELS, CHANNEL_CATEGORIES, CONTENT_TYPES, USER_ROLES, INTERACTION_TYPES, UPDATE_PRIORITIES, REACTIONS } from './constants';

// Channel Types
export type ChannelId = typeof CHANNELS[number]['id'];
export type ChannelCategory = typeof CHANNEL_CATEGORIES[number];

export interface Channel {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: ChannelCategory;
  thumbnail_url?: string;
  logo_url?: string;
  is_active: boolean;
  is_featured: boolean;
  sort_order: number;
  settings: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Content/Video Types
export type ContentType = typeof CONTENT_TYPES[number];

export interface VideoContent {
  id: string;
  title: string;
  description?: string;
  channel_id?: string;
  cloudflare_video_id: string;
  thumbnail_url?: string;
  thumbnail_source: string;
  thumbnail_metadata: Record<string, any>;
  duration?: number;
  category?: string;
  genre?: string;
  keywords: string[];
  language: string;
  instructor?: string;
  difficulty_level: string;
  target_audience?: string;
  learning_objectives: string[];
  prerequisites: string[];
  tags: string[];
  content_type: 'content' | 'advertisement';
  is_featured: boolean;
  is_published: boolean;
  is_live: boolean;
  view_count: number;
  like_count: number;
  sync_status: string;
  last_synced_at?: string;
  stream_metadata: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  
  // Interaction metadata
  source_type?: 'live' | 'vod' | 'live_recording';
  original_stream_id?: string;
  stream_status?: 'live' | 'ended' | 'scheduled';
  has_chat?: boolean;
  has_reactions?: boolean;
  has_polls?: boolean;
  has_quiz?: boolean;
  has_updates?: boolean;
  has_comments?: boolean;
  chat_moderation?: 'open' | 'moderated' | 'disabled';
  reactions_enabled?: boolean;
  course_id?: string;
  lesson_id?: string;
  has_assessments?: boolean;
}

export interface LocalVideoContent {
  id: string;
  title: string;
  description: string;
  cloudflareId: string;
  thumbnailPath: string;
  duration: number;
  category: string;
  tags: string[];
  uploadedAt: string;
  lastSynced?: string;
  metadata?: Record<string, any>;
}

// User Types
export type UserRole = typeof USER_ROLES[number];

export interface UserProfile {
  id: string;
  clerk_user_id: string;
  email?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  role: UserRole;
  preferences: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Program/Schedule Types
export interface Program {
  id: string;
  channel_id: string;
  content_id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  is_live: boolean;
  is_repeat: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ScheduleItem {
  id: string;
  channelId: ChannelId;
  contentId?: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  type: ContentType;
  thumbnail?: string;
  isLive?: boolean;
  metadata?: Record<string, any>;
}

// Interaction Types
export type InteractionType = typeof INTERACTION_TYPES[number];

export interface Interaction {
  id: string;
  channel_id?: string;
  content_id?: string;
  created_by?: string;
  type: InteractionType;
  title: string;
  description?: string;
  options: any[];
  correct_answer?: string;
  is_active: boolean;
  starts_at?: string;
  ends_at?: string;
  results: Record<string, any>;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface UserInteraction {
  id: string;
  interaction_id: string;
  user_id: string;
  response?: string;
  response_data: Record<string, any>;
  created_at: string;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  duration?: number;
  isActive: boolean;
  allowMultipleVotes?: boolean;
  results?: PollResults;
  createdAt: Date;
  expiresAt: Date;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface PollResults {
  totalVotes: number;
  options: PollOption[];
  winningOption?: PollOption;
}

// Multi-question Quiz Types
export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  timeLimit?: number;
  passingScore?: number;
  isActive: boolean;
  createdAt: Date;
}

export interface QuizQuestion {
  id: string;
  question: string;
  answers: QuizAnswer[];
  correctAnswer: string;
  points?: number;
  explanation?: string;
}

export interface QuizAnswer {
  id: string;
  text: string;
}

export interface QuizResults {
  quizId: string;
  score: number;
  totalScore: number;
  correctAnswers: number;
  totalQuestions: number;
  timeSpent: number;
  answers: Record<string, string>;
}

// Legacy single-question quiz (kept for compatibility)
export interface SingleQuiz {
  id: string;
  question: string;
  options: QuizOption[];
  correctAnswer: string;
  timeLimit: number;
  isActive: boolean;
  results?: SingleQuizResults;
  createdAt: Date;
  expiresAt: Date;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface SingleQuizResults {
  totalParticipants: number;
  correctAnswers: number;
  averageTime: number;
}

// Emoji Reaction Types
export type EmojiType = 
  | 'heart' 
  | 'thumbs_up' 
  | 'laugh' 
  | 'surprise' 
  | 'fire' 
  | 'star' 
  | 'zap' 
  | 'sad';

export interface EmojiReaction {
  id: string;
  emoji: EmojiType;
  timestamp: Date;
  userId: string;
}

// Rating Types
export type RatingType = 'stars' | 'thumbs';

export interface Rating {
  id: string;
  contentId: string;
  userId: string;
  rating: number;
  type: RatingType;
  timestamp: Date;
}

// Chat Types
export interface ChatMessage {
  id: string;
  channel_id?: string;
  content_id?: string;
  user_id: string;
  message: string;
  is_pinned: boolean;
  is_deleted: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface ChatUser {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  role: UserRole;
  isOnline: boolean;
  isModerator: boolean;
}

// Reaction Types
export type ReactionId = typeof REACTIONS[number]['id'];

export interface Reaction {
  id: ReactionId;
  emoji: string;
  label: string;
  count: number;
  userReacted: boolean;
}

// Campus Update Types
export type UpdatePriority = typeof UPDATE_PRIORITIES[number];

export interface CampusUpdate {
  id: string;
  title: string;
  description?: string;
  content?: string;
  type: string;
  priority: UpdatePriority;
  author_id?: string;
  channel_id?: string;
  is_active: boolean;
  starts_at?: string;
  ends_at?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

// Analytics Types
export interface AnalyticsEvent {
  id: string;
  user_id?: string;
  channel_id?: string;
  content_id?: string;
  event_type: string;
  event_data: Record<string, any>;
  session_id?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface ViewershipMetrics {
  totalViewers: number;
  peakViewers: number;
  averageWatchTime: number;
  engagementRate: number;
  chatActivity: number;
  interactionRate: number;
}

export interface ContentMetrics {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  completionRate: number;
  averageRating: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Video Player Types
export interface VideoPlayerConfig {
  autoplay: boolean;
  controls: boolean;
  muted: boolean;
  loop: boolean;
  quality: string;
  volume: number;
  playbackRate: number;
  subtitles: boolean;
  fullscreen: boolean;
}

export interface VideoPlayerState {
  isPlaying: boolean;
  isPaused: boolean;
  isLoading: boolean;
  isError: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  quality: string;
  isFullscreen: boolean;
  error?: string;
}

// Upload Types
export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface VideoUpload {
  id: string;
  file: File;
  progress: UploadProgress;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  error?: string;
  cloudflareId?: string;
  metadata?: Record<string, any>;
}

// Settings Types
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  autoplay: boolean;
  notifications: boolean;
  chatEnabled: boolean;
  language: string;
  videoQuality: string;
  volume: number;
  subtitles: boolean;
}

export interface ChannelSettings {
  isLive: boolean;
  chatEnabled: boolean;
  reactionsEnabled: boolean;
  pollsEnabled: boolean;
  moderationLevel: 'none' | 'low' | 'medium' | 'high';
  allowedRoles: UserRole[];
}

// Cloudflare Stream Types
export interface CloudflareStreamVideo {
  uid: string;
  thumbnail: string;
  thumbnailTimestampPct: number;
  readyToStream: boolean;
  status: {
    state: string;
    step?: string;
    pctComplete?: string;
  };
  meta: {
    name?: string;
    description?: string;
    [key: string]: any;
  };
  created: string;
  modified: string;
  scheduledDeletion?: string;
  size: number;
  preview: string;
  allowedOrigins: string[];
  requireSignedURLs: boolean;
  uploaded: string;
  uploadExpiry: string;
  maxSizeBytes: number;
  maxDurationSeconds: number;
  duration: number;
  input: {
    width: number;
    height: number;
  };
  playback: {
    hls: string;
    dash: string;
  };
  watermark?: {
    uid: string;
    size: number;
    height: number;
    width: number;
    created: string;
    downloadedFrom: string;
    name: string;
    opacity: number;
    padding: number;
    scale: number;
    position: string;
  };
  nft?: {
    accountId: string;
    token: string;
  };
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

// Navigation Types
export interface NavigationItem {
  label: string;
  href: string;
  icon?: string;
  badge?: string | number;
  children?: NavigationItem[];
  requireAuth?: boolean;
  requiredRoles?: UserRole[];
}

// Theme Types
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    muted: string;
    border: string;
  };
  fonts: {
    sans: string;
    mono: string;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
}

// Feature Flag Types
export interface FeatureFlags {
  enableLiveStreaming: boolean;
  enableInteractions: boolean;
  enableChat: boolean;
  enableAnalytics: boolean;
  enableUploads: boolean;
  enableNotifications: boolean;
  enableSentryLogging: boolean;
  maintenanceMode: boolean;
}