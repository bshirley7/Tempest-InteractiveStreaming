# Intelligent Video Interaction Detection System

## Overview

The platform now features an intelligent system that automatically detects and configures appropriate interactions based on video content type, context, and user role. This eliminates manual configuration and ensures optimal user experience.

## How It Works

### 1. **Automatic Detection**
The system analyzes video metadata to determine:
- **Video Type**: Live, VOD, or Live Recording
- **Content Category**: Educational vs Entertainment
- **User Context**: Role and permissions
- **Available Features**: Based on content configuration

### 2. **Smart Configuration**
Based on detection results, the system automatically enables/disables:
- **Chat vs Comments**: Live streams get chat, VOD gets comments
- **Educational Features**: Quizzes and assessments for courses
- **Moderation Settings**: Based on content and user role
- **Real-time Features**: Polls and reactions for appropriate contexts

## Interaction Rules by Content Type

### 🔴 **Live Streams**
```typescript
// Automatically enabled:
✅ Real-time Chat (if not disabled)
✅ Live Reactions 
✅ Polls (if triggered by instructor/admin)
✅ Quiz (if triggered by instructor/admin)
✅ Updates (if available/triggered)
❌ Rating (disabled during live)
❌ Comments (use chat instead)
```

**Use Cases:**
- Live lectures with Q&A
- Interactive gaming streams
- Live events with audience participation

### 📹 **VOD Content**
```typescript
// Automatically enabled:
✅ Comments (replaces live chat)
✅ Reactions
✅ Polls (if pre-configured)
✅ Quiz (if pre-configured) 
✅ Rating
✅ Updates (if pre-configured)
❌ Live Chat (not applicable)
```

**Use Cases:**
- Course modules with assessments
- Entertainment content with ratings
- Educational videos with embedded quizzes

### 🎬 **Live Recordings**
```typescript
// Automatically enabled:
✅ Comments (for replay discussion)
✅ Reactions
✅ Polls (preserved from original stream)
✅ Quiz (preserved from original stream)
✅ Rating
✅ Updates (preserved from original stream)
❌ Live Chat (archived)
```

**Use Cases:**
- Recorded lectures with original interactions
- Live stream replays with preserved polls
- Educational content from live sessions

## Role-Based Permissions

### 👤 **Viewer**
- Can participate in all available interactions
- Cannot create polls, quizzes, or updates
- Standard reaction and chat permissions

### 🎓 **Student** 
- Enhanced access to educational features
- Can participate in course assessments
- Access to course-specific interactions

### 👨‍🏫 **Instructor**
- Can create and trigger polls during live streams
- Can create and manage quizzes
- Can post course updates and announcements
- Enhanced moderation capabilities

### 🔧 **Admin**
- Full access to all interaction features
- Can enable/disable interactions globally
- Advanced moderation and management tools

## Implementation

### Automatic Usage
```typescript
// Simply pass the video content - system handles everything
<VideoPlayerWithInteractions content={videoContent}>
  <VODPlayer video={videoContent} />
</VideoPlayerWithInteractions>
```

### Manual Override (if needed)
```typescript
// Override automatic detection
<VideoPlayerWithInteractions 
  content={videoContent}
  enabledFeatures={{
    chat: false,
    reactions: true,
    polls: false,
    quiz: true,
    rating: true,
    updates: false
  }}
>
  <VODPlayer video={videoContent} />
</VideoPlayerWithInteractions>
```

## Content Metadata Schema

### Required Fields for Detection
```typescript
interface VideoContentWithInteractions {
  // Basic content info
  id: string;
  title: string;
  cloudflare_video_id: string;
  
  // Interaction detection fields
  source_type?: 'live' | 'vod' | 'live_recording';
  is_live?: boolean;
  stream_status?: 'live' | 'ended' | 'scheduled';
  
  // Educational context
  instructor?: string;
  course_id?: string;
  lesson_id?: string;
  has_assessments?: boolean;
  learning_objectives?: string[];
  
  // Interaction availability
  has_chat?: boolean;
  has_polls?: boolean;
  has_quiz?: boolean;
  has_updates?: boolean;
  chat_moderation?: 'open' | 'moderated' | 'disabled';
  
  // Content classification
  category?: string;
  genre?: string;
  difficulty_level?: string;
}
```

## Detection Logic Examples

### Educational Live Lecture
```typescript
Input: {
  is_live: true,
  instructor: "Dr. Smith",
  course_id: "CS101",
  category: "Education"
}

Output: {
  chat: true,        // Live discussion
  reactions: true,   // Student feedback
  polls: true,       // Instructor can poll
  quiz: true,        // Live assessments
  rating: false,     // No rating during live
  updates: true      // Course announcements
}
```

### Entertainment VOD
```typescript
Input: {
  is_live: false,
  source_type: "vod",
  category: "Entertainment",
  genre: "Comedy"
}

Output: {
  chat: false,       // Comments instead
  reactions: true,   // Viewer engagement
  polls: false,      // Not applicable
  quiz: false,       // Not educational
  rating: true,      // Content rating
  updates: false     // No announcements
}
```

### Recorded Educational Stream
```typescript
Input: {
  is_live: false,
  source_type: "live_recording",
  original_stream_id: "stream-123",
  instructor: "Prof. Wilson",
  has_polls: true,
  has_quiz: true
}

Output: {
  chat: false,       // Comments for replay
  reactions: true,   // Engagement
  polls: true,       // From original stream
  quiz: true,        // From original stream  
  rating: true,      // Post-viewing rating
  updates: true      // Course announcements
}
```

## Benefits

### 🎯 **For Users**
- **Contextual Experience**: Only relevant interactions shown
- **Intuitive Interface**: No confusion about available features
- **Optimal Engagement**: Right tools for each content type

### 🔧 **For Developers**
- **No Manual Configuration**: System handles complexity
- **Consistent Behavior**: Predictable interaction patterns
- **Easy Maintenance**: Central logic for all video types

### 📊 **For Content Creators**
- **Automatic Optimization**: Best interactions for content type
- **Role-Based Access**: Appropriate tools for each user
- **Flexible Override**: Manual control when needed

## Future Enhancements

### Planned Features
- **AI Content Analysis**: Automatic categorization
- **Usage Analytics**: Interaction effectiveness metrics
- **Dynamic Enablement**: Time-based interaction scheduling
- **Personalization**: User preference learning

### Advanced Rules
- **Time-Based Logic**: Different interactions at video timestamps
- **Audience-Adaptive**: Interactions based on viewer demographics
- **Performance-Driven**: Enable/disable based on engagement metrics

This intelligent system ensures every video has the perfect set of interactions, creating an optimal viewing experience while maintaining simplicity for both users and developers.