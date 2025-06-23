# TEMPTEST - Complete File Structure

This document provides the exact file and folder structure for Bolt.new to create. Each file listed should be created with the specified purpose.

```
temptest/
├── .env.local                          # Environment variables (create from template)
├── .gitignore                          # Git ignore rules
├── next.config.js                      # Next.js configuration with Sentry
├── tailwind.config.ts                  # Tailwind CSS configuration
├── tsconfig.json                       # TypeScript configuration
├── package.json                        # Project dependencies
├── middleware.ts                       # Clerk authentication middleware
├── instrumentation.ts                  # Sentry initialization
├── sentry.client.config.ts            # Sentry client configuration
├── sentry.server.config.ts            # Sentry server configuration
├── sentry.edge.config.ts              # Sentry edge configuration
│
├── app/                                # Next.js App Router
│   ├── layout.tsx                      # Root layout with providers
│   ├── page.tsx                        # Homepage (TV Guide)
│   ├── providers.tsx                   # Client-side providers wrapper
│   ├── globals.css                     # Global styles with Tailwind
│   ├── global-error.tsx               # Global error boundary
│   │
│   ├── (auth)/                         # Authentication routes group
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx           # Clerk sign-in page
│   │   └── sign-up/
│   │       └── [[...sign-up]]/
│   │           └── page.tsx           # Clerk sign-up page
│   │
│   ├── watch/                          # Live streaming pages
│   │   └── page.tsx                    # Channel watch page
│   │
│   ├── vod/                            # Video on Demand
│   │   ├── page.tsx                    # VOD library
│   │   ├── details/
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Video details page
│   │   └── watch/
│   │       └── [id]/
│   │           └── page.tsx           # VOD player page
│   │
│   ├── content/                        # Content browsing
│   │   └── page.tsx                    # Content grid/list view
│   │
│   ├── admin/                          # Admin dashboard
│   │   ├── layout.tsx                  # Admin layout with auth check
│   │   ├── page.tsx                    # Admin dashboard home
│   │   ├── AdminDashboardClient.tsx    # Client component for dashboard
│   │   ├── content/
│   │   │   ├── page.tsx               # Content management
│   │   │   ├── VideoEditModal.tsx     # Video editing modal
│   │   │   └── [id]/
│   │   │       └── edit/
│   │   │           └── page.tsx       # Edit specific content
│   │   ├── channels/
│   │   │   └── page.tsx               # Channel management
│   │   ├── categories/
│   │   │   └── page.tsx               # Category management
│   │   ├── schedule/
│   │   │   └── page.tsx               # Schedule management
│   │   ├── ads/
│   │   │   └── page.tsx               # Ad management
│   │   └── upload/
│   │       └── page.tsx               # Video upload interface
│   │
│   └── api/                            # API routes
│       ├── webhooks/
│       │   └── clerk/
│       │       └── route.ts           # Clerk webhook handler
│       ├── content/
│       │   ├── cloudflare-sync/
│       │   │   └── route.ts           # Sync with Cloudflare
│       │   └── metadata/
│       │       └── route.ts           # Video metadata endpoints
│       └── sentry-example-api/
│           └── route.ts               # Sentry test endpoint
│
├── components/                         # Reusable components
│   ├── ErrorBoundary.tsx              # Error boundary wrapper
│   ├── ui/                            # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── sheet.tsx
│   │   ├── slider.tsx
│   │   ├── switch.tsx
│   │   ├── tabs.tsx
│   │   ├── badge.tsx
│   │   ├── progress.tsx
│   │   ├── avatar.tsx
│   │   └── toast.tsx
│   │
│   ├── layout/
│   │   ├── Header.tsx                 # Main navigation header
│   │   ├── Footer.tsx                 # Site footer
│   │   └── Sidebar.tsx                # Mobile/desktop sidebar
│   │
│   ├── tv-guide/
│   │   ├── TVGuide.tsx                # Main TV guide component
│   │   ├── ChannelCard.tsx            # Individual channel card
│   │   ├── ScheduleGrid.tsx           # Schedule timeline
│   │   └── LiveIndicator.tsx          # Live status indicator
│   │
│   ├── video/
│   │   ├── VideoPlayer.tsx            # Main video player wrapper
│   │   ├── OptimizedVideoPlayer.tsx   # Performance optimized player
│   │   ├── VideoPlayerWithErrorBoundary.tsx
│   │   ├── VideoControls.tsx          # Custom video controls
│   │   ├── VideoOverlay.tsx           # Interactive overlay container
│   │   └── VideoMetadata.tsx          # Video info display
│   │
│   ├── chat/
│   │   ├── Chat.tsx                   # Main chat component
│   │   ├── ChatMessage.tsx            # Individual message
│   │   ├── ChatInput.tsx              # Message input field
│   │   ├── ChatCommands.tsx           # Command processor
│   │   └── EmojiPicker.tsx            # Emoji selector
│   │
│   ├── interactions/
│   │   ├── PollOverlay.tsx            # Poll voting overlay
│   │   ├── QuizOverlay.tsx            # Quiz question overlay
│   │   ├── EmojiReaction.tsx          # Floating emoji animations
│   │   ├── RatingWidget.tsx           # 5-star rating component
│   │   └── InteractionManager.tsx     # Orchestrates all interactions
│   │
│   ├── ads/
│   │   ├── AdOverlay.tsx              # Overlay ad component
│   │   ├── PreRollAd.tsx              # Pre-roll video ad
│   │   ├── MidRollAd.tsx              # Mid-roll video ad
│   │   └── AdTargeting.tsx            # Ad selection logic
│   │
│   ├── analytics/
│   │   ├── ViewerChart.tsx            # Real-time viewer count
│   │   ├── EngagementChart.tsx        # Interaction metrics
│   │   ├── RevenueChart.tsx           # Ad revenue tracking
│   │   └── DashboardGrid.tsx          # Analytics layout
│   │
│   └── admin/
│       ├── CloudflareSyncPanel.tsx    # Cloudflare sync UI
│       ├── ContentTable.tsx           # Content management table
│       ├── UploadForm.tsx             # Video upload form
│       └── ScheduleCalendar.tsx       # Visual schedule editor
│
├── lib/                                # Utility functions and configs
│   ├── supabase/
│   │   ├── client.ts                  # Supabase client setup
│   │   ├── server.ts                  # Server-side Supabase
│   │   ├── middleware.ts              # Supabase middleware
│   │   └── types.ts                   # Database types
│   │
│   ├── cloudflare/
│   │   ├── r2.ts                      # R2 storage client
│   │   ├── stream.ts                  # Stream API client
│   │   └── cloudflare-sync.ts        # Sync utilities
│   │
│   ├── hooks/
│   │   ├── useUser.ts                 # User state hook
│   │   ├── useChannels.ts             # Channels data hook
│   │   ├── useChat.ts                 # Chat subscription hook
│   │   ├── useInteractions.ts         # Interaction hooks
│   │   ├── useFavorites.ts            # Favorites management
│   │   ├── useAnalytics.ts            # Analytics tracking
│   │   └── useSentryUser.ts           # Sentry user context
│   │
│   ├── utils/
│   │   ├── cn.ts                      # Class name utility
│   │   ├── format.ts                  # Date/time formatters
│   │   ├── constants.ts               # App constants
│   │   └── helpers.ts                 # General helpers
│   │
│   ├── types.ts                       # TypeScript interfaces
│   ├── sentry-helpers.ts              # Sentry utilities
│   └── video-metadata-manager.ts      # Video metadata handling
│
├── public/                             # Static assets
│   ├── favicon.ico
│   ├── logo.png
│   ├── images/
│   │   ├── channels/                  # Channel logos
│   │   ├── thumbnails/                # Video thumbnails
│   │   └── ads/                       # Ad creatives
│   └── fonts/                         # Custom fonts
│
├── scripts/                            # Build and utility scripts
│   ├── setup-database.ts              # Supabase schema setup
│   ├── seed-content.ts                # Initial content seeding
│   ├── migrate-videos.ts              # Video migration to Cloudflare
│   ├── generate-schedule.ts           # Schedule generator
│   └── sync-metadata.ts               # Metadata sync script
│
├── styles/                             # Additional styles
│   ├── video-player.css               # Video.js custom styles
│   └── animations.css                 # Framer Motion helpers
│
└── docs/                               # Documentation
    ├── API.md                         # API documentation
    ├── DEPLOYMENT.md                  # Deployment guide
    └── bolt/                          # Bolt.new specific docs
        ├── PROJECT_OVERVIEW.md
        ├── DEPENDENCIES.md
        ├── FILE_STRUCTURE.md          # This file
        ├── SETUP_INSTRUCTIONS.md
        └── DATABASE_SCHEMA.md
```

## Key Implementation Notes

1. **App Router Structure**: All pages use Next.js 15 App Router conventions
2. **Client Components**: Mark interactive components with 'use client'
3. **Server Components**: Default for data fetching and static content
4. **API Routes**: Use route.ts files for API endpoints
5. **Middleware**: Handles authentication checks globally
6. **Error Boundaries**: Implement at multiple levels for resilience
7. **Type Safety**: Every file should have proper TypeScript types

## Component Guidelines

- **Naming**: Use PascalCase for components
- **Structure**: One component per file
- **Exports**: Use named exports for components
- **Props**: Define interfaces for all component props
- **Hooks**: Custom hooks in lib/hooks folder
- **State**: Use Zustand for complex state, Context for simple state

## File Creation Priority

1. Core structure (app/, components/, lib/)
2. Authentication flow (Clerk integration)
3. Database setup (Supabase tables and types)
4. Video player implementation
5. Real-time features (chat, interactions)
6. Admin dashboard
7. Analytics and monitoring