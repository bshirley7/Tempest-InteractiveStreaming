// Core constants for the Tempest streaming platform

export const CHANNELS = [
  {
    id: 'campus-pulse',
    name: 'Campus Pulse',
    description: 'Campus news and updates',
    category: 'news',
    logo: '/logos/campus-pulse.png',
    color: '#3B82F6', // blue-500
    sortOrder: 1,
  },
  {
    id: 'retirewise',
    name: 'RetireWise',
    description: 'Travel and culture',
    category: 'travel',
    logo: '/logos/retirewise.png',
    color: '#10B981', // emerald-500
    sortOrder: 2,
  },
  {
    id: 'mindfeed',
    name: 'MindFeed',
    description: 'Documentaries and educational content',
    category: 'education',
    logo: '/logos/mindfeed.png',
    color: '#8B5CF6', // violet-500
    sortOrder: 3,
  },
  {
    id: 'career-compass',
    name: 'Career Compass',
    description: 'Professional development and career guidance',
    category: 'professional',
    logo: '/logos/career-compass.png',
    color: '#F59E0B', // amber-500
    sortOrder: 4,
  },
  {
    id: 'quizquest',
    name: 'QuizQuest',
    description: 'Interactive trivia and games',
    category: 'interactive',
    logo: '/logos/quizquest.png',
    color: '#EF4444', // red-500
    sortOrder: 5,
  },
  {
    id: 'studybreak',
    name: 'StudyBreak',
    description: 'Entertainment and gaming',
    category: 'entertainment',
    logo: '/logos/studybreak.png',
    color: '#F97316', // orange-500
    sortOrder: 6,
  },
  {
    id: 'wellness-wave',
    name: 'Wellness Wave',
    description: 'Health and lifestyle content',
    category: 'health',
    logo: '/logos/wellness-wave.png',
    color: '#06B6D4', // cyan-500
    sortOrder: 7,
  },
  {
    id: 'how-to-hub',
    name: 'How-To Hub',
    description: 'Tutorials and DIY content',
    category: 'tutorials',
    logo: '/logos/how-to-hub.png',
    color: '#84CC16', // lime-500
    sortOrder: 8,
  },
] as const;

export const CHANNEL_CATEGORIES = [
  'news',
  'travel',
  'education',
  'professional',
  'interactive',
  'entertainment',
  'health',
  'tutorials',
] as const;

// Emoji reactions available in the platform
export const REACTIONS = [
  { emoji: '👍', label: 'Like', id: 'like' },
  { emoji: '❤️', label: 'Love', id: 'love' },
  { emoji: '😂', label: 'Laugh', id: 'laugh' },
  { emoji: '😮', label: 'Wow', id: 'wow' },
  { emoji: '😢', label: 'Sad', id: 'sad' },
  { emoji: '😡', label: 'Angry', id: 'angry' },
  { emoji: '🔥', label: 'Fire', id: 'fire' },
  { emoji: '💯', label: 'Perfect', id: 'perfect' },
  { emoji: '🤔', label: 'Thinking', id: 'thinking' },
  { emoji: '🎉', label: 'Celebrate', id: 'celebrate' },
] as const;

// Rate limiting constants
export const RATE_LIMITS = {
  CHAT_MESSAGES_PER_MINUTE: 10,
  REACTIONS_PER_MINUTE: 20,
  POLL_VOTES_PER_HOUR: 50,
  API_REQUESTS_PER_MINUTE: 100,
} as const;

// Video quality options
export const VIDEO_QUALITIES = [
  { label: 'Auto', value: 'auto' },
  { label: '1080p', value: '1080p' },
  { label: '720p', value: '720p' },
  { label: '480p', value: '480p' },
  { label: '360p', value: '360p' },
] as const;

// Streaming configuration
export const STREAM_CONFIG = {
  DEFAULT_QUALITY: 'auto',
  BUFFER_SIZE: 30, // seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // milliseconds
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
} as const;

// TV Guide configuration
export const TV_GUIDE_CONFIG = {
  HOURS_TO_SHOW: 12,
  MINUTES_PER_SLOT: 30,
  UPDATE_INTERVAL: 60000, // 1 minute
  SCROLL_SMOOTHNESS: 0.8,
} as const;

// Content types
export const CONTENT_TYPES = [
  'live',
  'vod',
  'premiere',
  'rerun',
] as const;

// User roles
export const USER_ROLES = [
  'admin',
  'moderator',
  'faculty',
  'student',
  'user',
] as const;

// Chat command prefixes
export const CHAT_COMMANDS = {
  POLL: '/poll',
  QUIZ: '/quiz',
  CLEAR: '/clear',
  TIMEOUT: '/timeout',
  BAN: '/ban',
  SLOW: '/slow',
} as const;

// Campus update priorities
export const UPDATE_PRIORITIES = [
  'low',
  'normal',
  'high',
  'urgent',
] as const;

// Interaction types
export const INTERACTION_TYPES = [
  'poll',
  'quiz',
  'rating',
  'reaction',
] as const;

// API endpoints
export const API_ENDPOINTS = {
  CONTENT: '/api/content',
  STREAM: '/api/stream',
  CHAT: '/api/chat',
  INTERACTIONS: '/api/interactions',
  SYNC: '/api/content-library/sync',
  UPLOAD: '/api/upload',
  CLOUDFLARE: '/api/cloudflare',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  VIDEO_LOAD_ERROR: 'Failed to load video. Please try again.',
  AUTH_REQUIRED: 'Authentication required. Please sign in.',
  PERMISSION_DENIED: 'Permission denied. Contact an administrator.',
  RATE_LIMITED: 'Too many requests. Please slow down.',
  SERVER_ERROR: 'Server error occurred. Please try again later.',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  VIDEO_UPLOADED: 'Video uploaded successfully!',
  SYNC_COMPLETED: 'Content sync completed successfully!',
  SETTINGS_SAVED: 'Settings saved successfully!',
  INTERACTION_CREATED: 'Interaction created successfully!',
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'tempest_user_preferences',
  VIDEO_PROGRESS: 'tempest_video_progress',
  CHAT_SETTINGS: 'tempest_chat_settings',
  THEME: 'tempest_theme',
} as const;

// Time formats
export const TIME_FORMATS = {
  SCHEDULE: 'HH:mm',
  DURATION: 'mm:ss',
  TIMESTAMP: 'yyyy-MM-dd HH:mm:ss',
  DATE_ONLY: 'yyyy-MM-dd',
} as const;

// Default values
export const DEFAULTS = {
  VIDEO_THUMBNAIL: '/images/default-thumbnail.jpg',
  USER_AVATAR: '/images/default-avatar.png',
  CHANNEL_LOGO: '/images/default-logo.png',
  POLL_DURATION: 300, // 5 minutes in seconds
  QUIZ_TIME_LIMIT: 30, // 30 seconds per question
} as const;