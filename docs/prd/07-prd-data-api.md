# PRD 7: Data Models & API Documentation

## Complete Data Models

### User Model
```typescript
interface User {
  _id: Id<"users">;
  sessionId: string; // Anonymous session
  username: string; // Auto-generated or chosen
  color: string; // Chat color (hex)
  joinedAt: number; // Timestamp
  lastSeen: number; // For presence
  preferences: {
    volume: number;
    quality: string;
    enableEmojis: boolean;
  };
  stats: {
    messagesCount: number;
    interactionsCount: number;
    watchTime: number; // seconds
  };
}
```

### Content Model
```typescript
interface Content {
  _id: Id<"content">;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl: string;
  duration: number; // seconds
  channel: string;
  category: ContentCategory;
  scheduledAt: number; // timestamp
  actualStartTime?: number;
  isLive: boolean;
  metadata: {
    professor?: string;
    course?: string;
    topic?: string;
    tags: string[];
  };
  interactiveElements: InteractiveElement[];
  analytics: {
    views: number;
    avgWatchTime: number;
    peakViewers: number;
    engagementRate: number;
  };
}

type ContentCategory = 
  | "campus-pulse"      // Campus news and updates
  | "world-explorer"    // Travel and culture
  | "mind-feed"         // Documentaries and educational
  | "career-compass"    // Professional development
  | "quiz-quest"        // Interactive trivia and games
  | "study-break"       // Entertainment and gaming
  | "wellness-wave"     // Health and lifestyle
  | "how-to-hub";       // Tutorials and DIY
```

### Interactive Element Model
```typescript
interface InteractiveElement {
  _id: string;
  type: InteractionType;
  triggerTime: number; // seconds into video
  duration: number; // how long it's active
  data: PollData | QuizData | AdData | AnnouncementData;
  targeting?: TargetingRules;
}

type InteractionType = "poll" | "quiz" | "ad" | "announcement" | "rating";

interface PollData {
  question: string;
  options: {
    id: string;
    text: string;
    votes: number;
  }[];
  multipleChoice: boolean;
  showResults: boolean;
  resultsDelay?: number;
}

interface QuizData {
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation?: string;
  points: number;
}

interface AdData {
  advertiser: string;
  imageUrl?: string;
  videoUrl?: string;
  clickUrl: string;
  duration: number;
  targetingId: string;
}
```

### Interaction Model
```typescript
interface Interaction {
  _id: Id<"interactions">;
  userId: Id<"users">;
  contentId: Id<"content">;
  timestamp: number;
  type: "poll" | "quiz" | "reaction" | "chat" | "rating" | "ad-click";
  data: {
    // Poll
    pollId?: string;
    selectedOptions?: string[];
    
    // Quiz
    quizId?: string;
    answer?: string;
    isCorrect?: boolean;
    timeToAnswer?: number;
    
    // Reaction
    emoji?: string;
    
    // Chat
    message?: string;
    command?: string;
    
    // Rating
    rating?: number; // 1-5
    feedback?: string;
    
    // Ad
    adId?: string;
    action?: "view" | "click" | "dismiss";
  };
  metadata: {
    videoTime?: number; // when in video
    deviceType?: string;
    sessionDuration?: number;
  };
}
```

### Analytics Model
```typescript
interface Analytics {
  _id: Id<"analytics">;
  contentId: Id<"content">;
  timeSlot: number; // 5-minute buckets
  metrics: {
    viewers: number;
    chatMessages: number;
    interactions: {
      polls: number;
      reactions: number;
      ratings: number;
      adClicks: number;
    };
    avgEngagement: number; // percentage
  };
  demographics: {
    devices: Record<string, number>;
    locations: Record<string, number>;
    referrers: Record<string, number>;
  };
}
```

## Convex Functions API

### User Management
```typescript
// mutations/users.ts
export const createUser = mutation({
  handler: async (ctx) => {
    // Generate session ID
    // Assign random username
    // Pick random color
    // Return user object
  }
});

export const updatePreferences = mutation({
  args: {
    userId: v.id("users"),
    preferences: v.object({
      volume: v.optional(v.number()),
      quality: v.optional(v.string()),
      enableEmojis: v.optional(v.boolean()),
    })
  },
  handler: async (ctx, args) => {
    // Update user preferences
  }
});
```

### Content Queries
```typescript
// queries/content.ts
export const getSchedule = query({
  args: {
    startTime: v.number(),
    endTime: v.number(),
    channels: v.optional(v.array(v.string()))
  },
  handler: async (ctx, args) => {
    // Return content in time range
    // Group by channel
    // Include current live status
  }
});

export const getContent = query({
  args: { contentId: v.id("content") },
  handler: async (ctx, args) => {
    // Return full content object
    // Include interactive elements
    // Check if currently live
  }
});
```

### Real-time Subscriptions
```typescript
// subscriptions/realtime.ts
export const subscribeToInteractions = query({
  args: { contentId: v.id("content") },
  handler: async (ctx, args) => {
    // Return latest interactions
    // Used for emoji reactions
    // Updates every 100ms
  }
});

export const subscribeToViewers = query({
  args: { contentId: v.id("content") },
  handler: async (ctx, args) => {
    // Return current viewer count
    // Update every 5 seconds
  }
});

export const subscribeToPollResults = query({
  args: { pollId: v.string() },
  handler: async (ctx, args) => {
    // Return real-time poll results
    // Update on each vote
  }
});
```

### Interaction Mutations
```typescript
// mutations/interactions.ts
export const submitPollVote = mutation({
  args: {
    userId: v.id("users"),
    contentId: v.id("content"),
    pollId: v.string(),
    optionIds: v.array(v.string())
  },
  handler: async (ctx, args) => {
    // Validate poll is active
    // Check user hasn't voted
    // Record vote
    // Update results
    // Log interaction
  }
});

export const sendReaction = mutation({
  args: {
    userId: v.id("users"),
    contentId: v.id("content"),
    emoji: v.string(),
    videoTime: v.number()
  },
  handler: async (ctx, args) => {
    // Rate limit check
    // Validate emoji
    // Broadcast reaction
    // Log interaction
  }
});

export const rateContent = mutation({
  args: {
    userId: v.id("users"),
    contentId: v.id("content"),
    rating: v.number(),
    feedback: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    // Validate rating 1-5
    // Check if already rated
    // Update content analytics
    // Log interaction
  }
});
```

### Chat Functions
```typescript
// mutations/chat.ts
export const sendMessage = mutation({
  args: {
    userId: v.id("users"),
    contentId: v.id("content"),
    message: v.string(),
    type: v.union(v.literal("message"), v.literal("command"))
  },
  handler: async (ctx, args) => {
    // Rate limit check
    // Profanity filter
    // Command detection
    // Store message
    // Trigger interactions if command
  }
});

export const processCommand = action({
  args: {
    userId: v.id("users"),
    contentId: v.id("content"),
    command: v.string(),
    args: v.array(v.string())
  },
  handler: async (ctx, args) => {
    // Parse command type
    // Validate permissions
    // Execute command
    // Return result
  }
});
```

### Analytics Functions
```typescript
// mutations/analytics.ts
export const trackEvent = mutation({
  args: {
    userId: v.id("users"),
    contentId: v.id("content"),
    event: v.string(),
    data: v.any()
  },
  handler: async (ctx, args) => {
    // Store event
    // Update aggregates
    // Check for milestones
  }
});

export const getEngagementMetrics = query({
  args: {
    contentId: v.id("content"),
    timeRange: v.object({
      start: v.number(),
      end: v.number()
    })
  },
  handler: async (ctx, args) => {
    // Calculate engagement rate
    // Get interaction breakdown
    // Return time series data
  }
});
```

### Ad Targeting
```typescript
// queries/ads.ts
export const getTargetedAd = query({
  args: {
    userId: v.id("users"),
    contentId: v.id("content"),
    placementType: v.string()
  },
  handler: async (ctx, args) => {
    // Get user interaction history
    // Apply targeting rules
    // Select best ad
    // Log impression
  }
});
```

## WebSocket Events

### Client → Server Events
- `join_content`: User joins stream
- `leave_content`: User leaves stream
- `send_message`: Chat message
- `send_reaction`: Emoji reaction
- `vote_poll`: Poll submission
- `update_presence`: Heartbeat

### Server → Client Events
- `new_message`: Chat update
- `reaction_burst`: Emoji animations
- `poll_update`: Results change
- `viewer_count`: Audience size
- `interaction_trigger`: New overlay

## Performance Considerations

### Database Indexes
```typescript
// Convex indexes
messages: ["by_content", "by_timestamp"]
interactions: ["by_user", "by_content", "by_type"]
analytics: ["by_content_time", "by_time_slot"]
```

### Caching Strategy
- User sessions: 24 hours
- Content metadata: 1 hour
- Poll results: Real-time
- Analytics: 5-minute aggregates

### Rate Limits
- Chat: 1 message per 2 seconds
- Reactions: 3 per 10 seconds
- Polls: 1 vote per poll
- API calls: 100 per minute