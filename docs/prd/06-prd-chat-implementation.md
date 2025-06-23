# PRD 6: Twitch-like Chat Implementation Guide

## Chat System Architecture

### Core Requirements
- Real-time message delivery (<100ms latency)
- Support for 5,000+ concurrent users
- Command system for triggering interactions
- Rate limiting and spam prevention
- Mobile-responsive design
- Emoji and mention support

## Convex Schema for Chat

```typescript
// messages table
{
  author: v.object({
    id: v.string(),
    username: v.string(),
    color: v.string(), // User color for display
  }),
  contentId: v.string(), // Links to current content
  message: v.string(),
  timestamp: v.number(),
  type: v.union(
    v.literal("message"),
    v.literal("command"),
    v.literal("system")
  ),
  metadata: v.optional(v.object({
    command: v.optional(v.string()),
    targetUser: v.optional(v.string()), // For mentions
    deleted: v.optional(v.boolean()),
  }))
}

// chatState table (for user presence)
{
  userId: v.string(),
  contentId: v.string(),
  lastSeen: v.number(),
  isTyping: v.boolean(),
  color: v.string(),
}
```

## Component Structure

### ChatContainer
**Responsibilities**:
- Manages WebSocket subscription
- Handles scroll behavior
- Coordinates child components
- Manages local message cache

**Key Features**:
- Virtual scrolling for performance
- Auto-scroll with pause on hover
- Smooth scroll to bottom button
- Message batching

### ChatMessage Component
**Structure**:
```typescript
interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
  onMention: (username: string) => void;
  onCommand: (command: Command) => void;
}
```

**Rendering Logic**:
- Username with color
- Timestamp (relative time)
- Message with emoji parsing
- Mention highlighting
- Command formatting
- Deleted message handling

### ChatInput Component
**Features**:
- Multi-line support with Shift+Enter
- Emoji picker integration
- @ mention autocomplete
- Command autocomplete
- Character counter (280 limit)
- Rate limit indicator

**Command Detection**:
```typescript
const commands = {
  '!poll': { args: ['option'], description: 'Vote in active poll' },
  '!quiz': { args: ['answer'], description: 'Answer quiz question' },
  '!react': { args: ['emoji'], description: 'Send emoji reaction' },
  '!rate': { args: ['1-5'], description: 'Rate current content' },
  '!help': { args: [], description: 'Show available commands' }
};
```

## Interaction Trigger System

### Command Processing Flow
1. User types command in chat
2. ChatInput detects command pattern
3. Command parser validates syntax
4. Command sent to Convex with metadata
5. Backend processes command
6. Triggers appropriate interaction
7. Confirmation sent back to chat

### Command Parser Implementation
```typescript
interface ParsedCommand {
  command: string;
  args: string[];
  isValid: boolean;
  error?: string;
}

function parseCommand(message: string): ParsedCommand | null {
  if (!message.startsWith('!')) return null;
  
  const parts = message.slice(1).split(' ');
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);
  
  if (!commands[`!${command}`]) {
    return { command, args, isValid: false, error: 'Unknown command' };
  }
  
  // Validate args based on command requirements
  return { command, args, isValid: true };
}
```

### Interaction Triggers

#### Poll Voting via Chat
```typescript
// User types: !poll A
// System:
1. Validates active poll exists
2. Checks if user already voted
3. Records vote in database
4. Updates poll results in real-time
5. Sends confirmation to chat
```

#### Emoji Reactions
```typescript
// User types: !react 🎉
// System:
1. Validates emoji is allowed
2. Checks rate limit (3 per 10 seconds)
3. Triggers floating emoji animation
4. Logs interaction for analytics
5. Broadcasts to all viewers
```

#### Content Rating
```typescript
// User types: !rate 5
// System:
1. Validates rating range (1-5)
2. Checks if content allows rating
3. Records rating in database
4. Updates average display
5. Thanks user in chat
```

## Real-time Features

### Message Subscription
```typescript
// Convex subscription
export const subscribeToMessages = query({
  args: { contentId: v.string() },
  handler: async (ctx, { contentId }) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_content", (q) => q.eq("contentId", contentId))
      .order("desc")
      .take(100);
  },
});
```

### Typing Indicators
```typescript
// Show who's typing
export const setTypingState = mutation({
  args: { 
    userId: v.string(),
    contentId: v.string(),
    isTyping: v.boolean() 
  },
  handler: async (ctx, args) => {
    // Update with 3-second timeout
  },
});
```

### User Presence
```typescript
// Track active users
export const updatePresence = mutation({
  args: { userId: v.string(), contentId: v.string() },
  handler: async (ctx, args) => {
    // Update last seen
    // Clean up stale presence
  },
});
```

## Performance Optimizations

### Message Batching
- Collect messages in 50ms windows
- Render batch together
- Reduces React re-renders

### Virtual Scrolling
- Only render visible messages
- Maintain scroll position
- Smooth scrolling experience

### Rate Limiting
- Client-side: Disable input when limited
- Server-side: Reject excessive messages
- Progressive delays for violations

### Message Caching
- Keep last 500 messages in memory
- Lazy load older messages
- Implement message cleanup

## Mobile Considerations

### Responsive Design
- Full-width on mobile
- Bottom sheet layout
- Larger touch targets
- Simplified command UI

### Touch Interactions
- Swipe to reply (future)
- Long press to mention
- Tap to show actions
- Pull to refresh

### Keyboard Handling
- Auto-show on focus
- Adjust viewport
- Maintain scroll position
- Hide on send

## Moderation Features

### Auto-moderation
- Profanity filter
- Spam detection
- Link blocking
- Rate limit enforcement

### Manual Moderation (Future)
- Delete messages
- Timeout users
- Ban functionality
- Mod indicators

## Analytics Integration

### Chat Metrics
- Messages per minute
- Unique chatters
- Command usage
- Engagement rate
- Peak activity times

### Interaction Tracking
- Command success rate
- Most used commands
- User participation
- Response times

## Error Handling

### Connection Issues
- Reconnection logic
- Offline message queue
- Connection status indicator
- Graceful degradation

### Command Failures
- Clear error messages
- Retry mechanisms
- Fallback options
- Help suggestions

## Testing Strategy

### Unit Tests
- Command parser
- Message validation
- Rate limiter
- Scroll behavior

### Integration Tests
- Real-time delivery
- Command execution
- Database operations
- WebSocket stability

### Load Testing
- 5,000 concurrent users
- 100 messages/second
- Command processing
- Memory usage