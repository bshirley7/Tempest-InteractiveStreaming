# PRD 4: Component Architecture

## Component Hierarchy

```
App
├── Layout
│   ├── Header
│   │   ├── Logo
│   │   ├── Navigation
│   │   └── UserMenu
│   ├── Sidebar (mobile)
│   └── Footer
├── Pages
│   ├── HomePage
│   │   └── TVGuide
│   ├── WatchPage
│   │   ├── VideoPlayer
│   │   ├── Chat
│   │   └── InteractionLayer
│   └── AnalyticsPage
│       └── Dashboard
└── Providers
    ├── ConvexProvider
    ├── InteractionProvider
    └── ThemeProvider
```

## Core Components

### 1. TVGuide Component
**Path**: `/components/tv-guide/`
- `TVGuide.tsx` - Main container
- `ChannelRow.tsx` - Individual channel display
- `ProgramCell.tsx` - Individual program block
- `TimeHeader.tsx` - Time slot headers
- `CurrentTimeIndicator.tsx` - Moving time line

**Props**:
- `channels`: Channel[]
- `programs`: Program[]
- `onProgramClick`: (programId: string) => void

### 2. VideoPlayer Component
**Path**: `/components/video-player/`
- `VideoPlayer.tsx` - Main player wrapper
- `VideoControls.tsx` - Custom control bar
- `TimelineMarkers.tsx` - Interactive timeline
- `QualitySelector.tsx` - Quality options
- `VolumeControl.tsx` - Volume slider
- `FullscreenButton.tsx` - Fullscreen toggle

**Props**:
- `videoUrl`: string
- `onTimeUpdate`: (time: number) => void
- `markers`: TimelineMarker[]
- `autoplay`: boolean

### 3. Chat Component (Twitch-like)
**Path**: `/components/chat/`
- `Chat.tsx` - Main chat container
- `ChatMessage.tsx` - Individual message
- `ChatInput.tsx` - Message input with commands
- `ChatUserList.tsx` - Active users
- `ChatEmotePicker.tsx` - Emoji selector
- `ChatCommandParser.tsx` - Command processing

**Key Features**:
- Auto-scroll with pause on hover
- Message batching for performance
- Command parsing (!poll, !react, etc.)
- Rate limiting logic
- Mention highlighting
- Mod tools (future)

**Props**:
- `contentId`: string
- `userId`: string
- `onCommand`: (command: ChatCommand) => void

### 4. InteractionLayer Component
**Path**: `/components/interactions/`
- `InteractionLayer.tsx` - Overlay container
- `PollOverlay.tsx` - Poll display
- `EmojiReaction.tsx` - Floating emoji
- `QuizOverlay.tsx` - Quiz questions
- `RatingOverlay.tsx` - Rating prompt
- `AdOverlay.tsx` - Advertisement display

**Props**:
- `interactions`: Interaction[]
- `videoRef`: RefObject<HTMLVideoElement>
- `onInteraction`: (type: string, data: any) => void

### 5. Poll Component
**Path**: `/components/interactions/poll/`
- `Poll.tsx` - Poll container
- `PollOption.tsx` - Individual option
- `PollResults.tsx` - Real-time results
- `PollTimer.tsx` - Countdown timer

**Props**:
- `question`: string
- `options`: PollOption[]
- `onVote`: (optionId: string) => void
- `showResults`: boolean

### 6. EmojiReactionSystem Component
**Path**: `/components/interactions/emoji/`
- `EmojiReactionSystem.tsx` - Manager
- `FloatingEmoji.tsx` - Individual emoji
- `EmojiSelector.tsx` - Emoji picker
- `ReactionBatch.tsx` - Performance batching

**Props**:
- `enabled`: boolean
- `availableEmojis`: string[]
- `onReaction`: (emoji: string) => void

### 7. Analytics Dashboard
**Path**: `/components/analytics/`
- `Dashboard.tsx` - Main container
- `ViewerChart.tsx` - Concurrent viewers
- `EngagementChart.tsx` - Interaction rates
- `MetricCard.tsx` - Key metrics
- `HeatMap.tsx` - Interaction timeline

**Props**:
- `timeRange`: TimeRange
- `contentId`: string
- `metrics`: AnalyticsData

### 8. Ad Components
**Path**: `/components/ads/`
- `AdManager.tsx` - Ad scheduling logic
- `VideoAd.tsx` - Video advertisements
- `DisplayAd.tsx` - Banner ads
- `SponsoredCard.tsx` - Sponsored content
- `AdTargeting.tsx` - Targeting engine

**Props**:
- `userId`: string
- `interactions`: UserInteraction[]
- `onAdEvent`: (event: AdEvent) => void

## Shared Components

### 9. UI Components (from Shadcn)
**Path**: `/components/ui/`
- `Card` - Content containers
- `Button` - Interactive elements
- `Dialog` - Modal windows
- `Progress` - Loading states
- `Badge` - Status indicators
- `Sheet` - Side panels
- `Toast` - Notifications
- `ScrollArea` - Custom scrolling
- `Tabs` - Content switching
- `Avatar` - User representations
- `Input` - Form inputs

### 10. Layout Components
**Path**: `/components/layout/`
- `Header.tsx` - App header
- `Navigation.tsx` - Main nav
- `Sidebar.tsx` - Mobile menu
- `Footer.tsx` - App footer
- `Container.tsx` - Content wrapper

## Utility Components

### 11. Loading States
**Path**: `/components/loading/`
- `VideoSkeleton.tsx` - Video placeholder
- `ChatSkeleton.tsx` - Chat placeholder
- `GridSkeleton.tsx` - TV guide placeholder
- `Spinner.tsx` - Generic loader

### 12. Error Boundaries
**Path**: `/components/error/`
- `ErrorBoundary.tsx` - Error catching
- `ErrorFallback.tsx` - Error display
- `RetryButton.tsx` - Retry logic

## Component Communication

### Context Providers
1. **InteractionContext**
   - Manages all interactive features
   - Coordinates between video and overlays
   - Handles chat commands

2. **ConvexContext**
   - Real-time data subscriptions
   - Database mutations
   - WebSocket management

3. **UserContext**
   - Session management
   - User preferences
   - Interaction history

### Event System
- Chat commands trigger interactions
- Video timeline triggers overlays
- User actions update analytics
- Real-time sync across components

## Mobile Responsiveness

### Responsive Strategies
- TV Guide: Horizontal scroll on mobile
- Video Player: Full-width with gesture controls
- Chat: Bottom sheet on mobile
- Overlays: Repositioned for mobile
- Analytics: Stacked cards on mobile

### Touch Interactions
- Swipe to change channels
- Tap to show/hide controls
- Long press for options
- Pinch to zoom (future)