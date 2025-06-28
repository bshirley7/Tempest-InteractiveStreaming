/**
 * Video Interaction Detection and Configuration System
 * 
 * This module determines what interactions are available for different video types
 * and manages the dynamic enablement of features based on content context.
 */

import { VideoContent } from './types';

// Enhanced video content type with interaction metadata
export interface VideoContentWithInteractions extends VideoContent {
  // Live stream specific
  is_live: boolean;
  stream_status?: 'live' | 'ended' | 'scheduled';
  
  // Interaction availability
  has_chat?: boolean;
  has_reactions?: boolean;
  has_polls?: boolean;
  has_quiz?: boolean;
  has_updates?: boolean;
  has_comments?: boolean; // VOD-specific
  
  // Interaction metadata
  active_polls?: string[]; // Array of poll IDs
  active_quizzes?: string[]; // Array of quiz IDs
  scheduled_interactions?: ScheduledInteraction[];
  
  // Source information
  source_type?: 'live' | 'vod' | 'live_recording';
  original_stream_id?: string; // If VOD is from a live stream
  
  // Moderation settings
  chat_moderation?: 'open' | 'moderated' | 'disabled';
  reactions_enabled?: boolean;
  
  // Educational content
  course_id?: string;
  lesson_id?: string;
  has_assessments?: boolean;
}

export interface ScheduledInteraction {
  id: string;
  type: 'poll' | 'quiz' | 'update';
  trigger_time?: number; // Seconds into video
  trigger_event?: 'manual' | 'auto' | 'live_only';
  content: any;
  status: 'pending' | 'active' | 'completed';
}

export interface InteractionCapabilities {
  chat: boolean;
  comments: boolean;
  reactions: boolean;
  polls: boolean;
  quiz: boolean;
  rating: boolean;
  updates: boolean;
}

export interface InteractionContext {
  videoType: 'live' | 'vod' | 'live_recording';
  isEducational: boolean;
  hasInstructor: boolean;
  isModerated: boolean;
  viewerRole: 'viewer' | 'student' | 'instructor' | 'admin';
  courseContext?: {
    courseId: string;
    lessonId: string;
    hasAssessments: boolean;
  };
}

/**
 * Determines available interactions based on video content and context
 */
export function getAvailableInteractions(
  content: VideoContentWithInteractions,
  context: Partial<InteractionContext> = {}
): InteractionCapabilities {
  const videoType = determineVideoType(content);
  const isEducational = isEducationalContent(content);
  const hasInstructor = Boolean(content.instructor);
  
  const fullContext: InteractionContext = {
    videoType,
    isEducational,
    hasInstructor,
    isModerated: content.chat_moderation !== 'open',
    viewerRole: context.viewerRole || 'viewer',
    courseContext: context.courseContext,
    ...context
  };

  return calculateInteractionCapabilities(content, fullContext);
}

/**
 * Determines the video type based on content metadata
 */
function determineVideoType(content: VideoContentWithInteractions): 'live' | 'vod' | 'live_recording' {
  if (content.is_live || content.stream_status === 'live') {
    return 'live';
  }
  
  if (content.source_type === 'live_recording' || content.original_stream_id) {
    return 'live_recording';
  }
  
  return 'vod';
}

/**
 * Checks if content is educational based on metadata
 */
function isEducationalContent(content: VideoContentWithInteractions): boolean {
  return Boolean(
    content.course_id ||
    content.lesson_id ||
    content.instructor ||
    content.difficulty_level ||
    content.learning_objectives?.length ||
    content.prerequisites?.length ||
    content.category === 'Education' ||
    content.genre === 'Educational'
  );
}

/**
 * Calculates interaction capabilities based on content and context
 */
function calculateInteractionCapabilities(
  content: VideoContentWithInteractions,
  context: InteractionContext
): InteractionCapabilities {
  const capabilities: InteractionCapabilities = {
    chat: false,
    comments: false,
    reactions: true, // Generally available for all content
    polls: false,
    quiz: false,
    rating: true, // Generally available for all content
    updates: false
  };

  // Live streams
  if (context.videoType === 'live') {
    capabilities.chat = content.chat_moderation !== 'disabled';
    capabilities.polls = hasActivePolls(content) || context.hasInstructor;
    capabilities.quiz = hasActiveQuizzes(content) || context.hasInstructor;
    capabilities.updates = hasActiveUpdates(content) || context.viewerRole === 'admin';
    capabilities.rating = false; // Typically disabled during live streams
  }
  
  // VOD content
  else if (context.videoType === 'vod') {
    capabilities.comments = true; // VOD uses comments instead of live chat
    capabilities.chat = false;
    capabilities.polls = hasStoredPolls(content);
    capabilities.quiz = hasStoredQuizzes(content);
    capabilities.updates = hasStoredUpdates(content);
    capabilities.rating = true;
  }
  
  // Live recordings (VOD from live streams)
  else if (context.videoType === 'live_recording') {
    capabilities.comments = true; // Comments for replay discussion
    capabilities.chat = false; // No live chat for recordings
    capabilities.polls = hasStoredPolls(content); // Polls from original stream
    capabilities.quiz = hasStoredQuizzes(content); // Quizzes from original stream
    capabilities.updates = hasStoredUpdates(content); // Updates from original stream
    capabilities.rating = true;
  }

  // Educational content enhancements
  if (context.isEducational) {
    if (context.courseContext?.hasAssessments) {
      capabilities.quiz = true;
    }
  }

  // Role-based modifications
  if (context.viewerRole === 'instructor' || context.viewerRole === 'admin') {
    capabilities.polls = true; // Can create polls
    capabilities.quiz = true; // Can create quizzes
    capabilities.updates = true; // Can create updates
  }

  return capabilities;
}

/**
 * Helper functions to check for active/stored interactions
 */
function hasActivePolls(content: VideoContentWithInteractions): boolean {
  return Boolean(content.active_polls?.length || content.has_polls);
}

function hasActiveQuizzes(content: VideoContentWithInteractions): boolean {
  return Boolean(content.active_quizzes?.length || content.has_quiz);
}

function hasActiveUpdates(content: VideoContentWithInteractions): boolean {
  return Boolean(content.has_updates);
}

function hasStoredPolls(content: VideoContentWithInteractions): boolean {
  return Boolean(
    content.has_polls ||
    content.scheduled_interactions?.some(i => i.type === 'poll')
  );
}

function hasStoredQuizzes(content: VideoContentWithInteractions): boolean {
  return Boolean(
    content.has_quiz ||
    content.scheduled_interactions?.some(i => i.type === 'quiz') ||
    content.has_assessments
  );
}

function hasStoredUpdates(content: VideoContentWithInteractions): boolean {
  return Boolean(
    content.has_updates ||
    content.scheduled_interactions?.some(i => i.type === 'update')
  );
}

/**
 * Get interaction configuration for specific video content
 */
export function getVideoInteractionConfig(
  content: VideoContentWithInteractions,
  viewerRole: InteractionContext['viewerRole'] = 'viewer'
): {
  capabilities: InteractionCapabilities;
  context: InteractionContext;
  features: Record<string, boolean>;
} {
  const context: InteractionContext = {
    videoType: determineVideoType(content),
    isEducational: isEducationalContent(content),
    hasInstructor: Boolean(content.instructor),
    isModerated: content.chat_moderation !== 'open',
    viewerRole,
    courseContext: content.course_id ? {
      courseId: content.course_id,
      lessonId: content.lesson_id || '',
      hasAssessments: Boolean(content.has_assessments)
    } : undefined
  };

  const capabilities = calculateInteractionCapabilities(content, context);

  // Convert capabilities to feature flags for UnifiedVideoInteractions
  const features = {
    chat: capabilities.chat || capabilities.comments,
    reactions: capabilities.reactions,
    polls: capabilities.polls,
    quiz: capabilities.quiz,
    rating: capabilities.rating,
    updates: capabilities.updates
  };

  return { capabilities, context, features };
}

/**
 * Predefined interaction profiles for common video types
 */
export const INTERACTION_PROFILES = {
  LIVE_LECTURE: {
    chat: true,
    reactions: true,
    polls: true,
    quiz: true,
    rating: false,
    updates: true
  },
  
  LIVE_ENTERTAINMENT: {
    chat: true,
    reactions: true,
    polls: true,
    quiz: false,
    rating: false,
    updates: false
  },
  
  VOD_COURSE: {
    chat: false, // Comments instead
    reactions: true,
    polls: true,
    quiz: true,
    rating: true,
    updates: true
  },
  
  VOD_ENTERTAINMENT: {
    chat: false, // Comments instead
    reactions: true,
    polls: false,
    quiz: false,
    rating: true,
    updates: false
  },
  
  RECORDED_LECTURE: {
    chat: false, // Comments instead
    reactions: true,
    polls: true, // From original stream
    quiz: true, // From original stream
    rating: true,
    updates: true // From original stream
  }
} as const;

/**
 * Get interaction profile name for content
 */
export function getInteractionProfile(
  content: VideoContentWithInteractions
): keyof typeof INTERACTION_PROFILES | 'CUSTOM' {
  const videoType = determineVideoType(content);
  const isEducational = isEducationalContent(content);

  if (videoType === 'live') {
    return isEducational ? 'LIVE_LECTURE' : 'LIVE_ENTERTAINMENT';
  } else if (videoType === 'live_recording') {
    return 'RECORDED_LECTURE';
  } else { // VOD
    return isEducational ? 'VOD_COURSE' : 'VOD_ENTERTAINMENT';
  }
}