# Claude Code Implementation Instructions

## Project Context
Building an interactive streaming platform MVP for Phoenix State University. The platform transforms passive video watching into engaging experiences through real-time overlays (polls, emoji reactions, quizzes) that generate valuable behavioral data for targeted advertising.

## Tech Stack
- **Frontend**: Next.js 14+ with TypeScript and Tailwind CSS
- **UI Components**: Shadcn/ui (already installed)
- **Backend**: Convex for real-time features
- **Video Player**: Video.js 8.x
- **Animations**: Framer Motion
- **Icons**: Lucide React

## Implementation Instructions

### Phase 1: Video Player Setup

1. **Install Video.js**
```bash
npm install video.js @types/video.js
```

2. **Create VideoPlayer Component**
- Location: `/components/video-player/VideoPlayer.tsx`
- Set up Video.js with custom overlay container
- Add CSS for Netflix-style gradient controls
- Ensure overlay container has `pointer-events: none` except for interactive elements
- Include ref to video element for timeline tracking

3. **Video Player Requirements**
- Must support HLS streaming (use video.js-contrib-hls)
- Custom control bar with interaction button (lightning bolt icon)
- Timeline markers for upcoming interactions
- Mobile responsive with touch gestures
- No third-party branding visible

### Phase 2: Interactive Overlay System

1. **Create InteractionLayer Component**
- Location: `/components/interactions/InteractionLayer.tsx`
- Absolute positioned container over video
- Manages all overlay types (polls, emojis, quizzes)
- Client-side rendering only (no server-side rendering)
- Use Framer Motion for animations

2. **Implement Emoji Reactions (Priority 1)**
- Location: `/components/interactions/emoji/EmojiReactionSystem.tsx`
- Floating emojis that animate across screen (3 second duration)
- Use requestAnimationFrame for 60fps performance
- Batch multiple reactions to prevent performance issues
- 6-8 emoji options: 😍 🔥 😂 👏 ❤️ 🤯 💯 🎉
- Random parabolic paths for organic movement
- Clean up DOM elements after animation completes

3. **Implement Live Polls (Priority 2)**
- Location: `/components/interactions/poll/Poll.tsx`
- Position: bottom-left corner (20px margin, 80px from bottom)
- Real-time results using Convex subscriptions
- Smooth progress bar animations for results
- Allow vote changing
- Auto-close after 30 seconds
- Mobile: Full-width bottom sheet

### Phase 3: Convex Integration

1. **Database Schema**
```typescript
// schema.ts
export default defineSchema({
  users: defineTable({
    sessionId: v.string(),
    username: v.string(),
    joinedAt: v.number(),
  }),
  
  interactions: defineTable({
    userId: v.id("users"),
    contentId: v.string(),
    type: v.union(v.literal("poll"), v.literal("reaction"), v.literal("chat"), v.literal("rating")),
    data: v.any(),
    timestamp: v.number(),
  }).index("by_content", ["contentId", "timestamp"]),
  
  polls: defineTable({
    contentId: v.string(),
    question: v.string(),
    options: v.array(v.object({
      id: v.string(),
      text: v.string(),
      votes: v.number(),
    })),
    startTime: v.number(),
    duration: v.number(),
  }),
});
```

2. **Real-time Functions**
- `sendReaction`: Mutation for emoji reactions
- `votePoll`: Mutation for poll voting with real-time updates
- `getActiveInteractions`: Query for current overlays
- `streamInteractions`: Subscription for live updates

### Phase 4: Chat Integration

1. **Create Chat Component**
- Location: `/components/chat/Chat.tsx`
- Right sidebar (desktop) or bottom drawer (mobile)
- Support chat commands: `!poll`, `!react [emoji]`, `!rate [1-5]`
- Rate limiting: 1 message per 2 seconds
- Auto-scroll with pause on hover
- Maximum 100 messages in view (performance)

### Phase 5: Performance Requirements

1. **Critical Metrics**
- Support 5,000 concurrent users
- <500ms latency for all interactions
- 60fps animations on mid-range devices
- <3 second initial page load

2. **Optimization Techniques**
- Debounce user interactions (100ms)
- Batch Convex mutations when possible
- Use CSS transforms for GPU acceleration
- Lazy load interactive components
- Virtual scrolling for chat

### Important Implementation Notes

1. **Client-Side Rendering Only**
   - All overlays render on client
   - Use absolute positioning, not Canvas
   - Animations via CSS transforms + Framer Motion

2. **Mobile-First Design**
   - Test all features on mobile first
   - Touch targets minimum 44x44px
   - Overlays reposition for mobile viewports

3. **Accessibility Required**
   - ARIA labels for all interactive elements
   - Keyboard navigation support
   - Screen reader announcements for new interactions
   - Respect prefers-reduced-motion

4. **State Management**
   - Use React Context for interaction state
   - Convex for real-time data
   - Local state for UI animations only

5. **Error Handling**
   - Graceful degradation if Convex disconnects
   - Retry failed mutations with exponential backoff
   - Show user-friendly error messages

## Testing Checklist

Before considering any feature complete:
- [ ] Works on Chrome, Firefox, Safari (desktop and mobile)
- [ ] Handles 1000+ emoji reactions without frame drops
- [ ] Polls update in <500ms across all clients
- [ ] Memory usage stable over 30-minute session
- [ ] All interactions keyboard accessible
- [ ] Mobile gestures work smoothly
- [ ] Offline mode doesn't crash app

## File Structure
```
/components
  /video-player
    VideoPlayer.tsx
    VideoControls.tsx
    TimelineMarkers.tsx
  /interactions
    InteractionLayer.tsx
    /emoji
      EmojiReactionSystem.tsx
      FloatingEmoji.tsx
    /poll
      Poll.tsx
      PollOption.tsx
      PollResults.tsx
  /chat
    Chat.tsx
    ChatMessage.tsx
    ChatInput.tsx
/convex
  schema.ts
  interactions.ts
  polls.ts
  users.ts
```

## Priority Order
1. Video player with overlay container
2. Emoji reactions
3. Live polls  
4. Chat system
5. Timeline markers
6. Quiz overlays
7. Rating system
8. Analytics dashboard

Remember: Start simple, test often, and prioritize performance. The goal is a working demo that feels professional and handles scale, not feature completeness.