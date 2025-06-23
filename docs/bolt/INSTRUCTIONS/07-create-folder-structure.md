# Step 07: Create Project Folder Structure

## Context
You are building Tempest, an interactive streaming platform. This step creates the complete folder structure that organizes all components, utilities, and pages according to the Tempest architecture.

## Prerequisites
- Step 06 completed successfully
- You are in the `tempest` project directory
- All previous configuration steps completed

## Task
Create the complete folder structure for Tempest in a single command to ensure proper organization and avoid missing directories.

## Exact Command to Execute

Run this single command to create ALL folders at once:

```bash
mkdir -p app/{auth/sign-in/\[\[...sign-in\]\],auth/sign-up/\[\[...sign-up\]\],watch,vod/details/\[id\],vod/watch/\[id\],content,admin/content/\[id\]/edit,admin/channels,admin/categories,admin/schedule,admin/ads,admin/upload,api/webhooks/clerk,api/content/cloudflare-sync,api/content/metadata,api/sentry-example-api} components/{ui,layout,tv-guide,video,chat,interactions,ads,analytics,admin} lib/{supabase,cloudflare,hooks,utils} public/{images/channels,images/thumbnails,images/ads,fonts} scripts styles
```

## Folder Structure Created

### App Directory (Next.js 15 App Router)
```
app/
├── auth/
│   ├── sign-in/[[...sign-in]]/    # Clerk sign-in pages
│   └── sign-up/[[...sign-up]]/    # Clerk sign-up pages
├── watch/                         # Live streaming watch page
├── vod/                          # Video on Demand
│   ├── details/[id]/             # Video details pages
│   └── watch/[id]/               # VOD player pages
├── content/                      # Content browsing
├── admin/                        # Admin dashboard
│   ├── content/[id]/edit/        # Content editing
│   ├── channels/                 # Channel management
│   ├── categories/               # Category management
│   ├── schedule/                 # Schedule management
│   ├── ads/                      # Ad management
│   └── upload/                   # Video upload
└── api/                          # API routes
    ├── webhooks/clerk/           # Clerk webhooks
    ├── content/cloudflare-sync/  # Cloudflare sync API
    ├── content/metadata/         # Video metadata API
    └── sentry-example-api/       # Sentry test API
```

### Components Directory
```
components/
├── ui/                 # shadcn/ui components
├── layout/            # Header, footer, navigation
├── tv-guide/          # TV guide components
├── video/             # Video player components
├── chat/              # Real-time chat system
├── interactions/      # Polls, quizzes, reactions
├── ads/               # Advertisement components
├── analytics/         # Analytics dashboard
└── admin/             # Admin-specific components
```

### Library Directory
```
lib/
├── supabase/          # Supabase client and utilities
├── cloudflare/        # Cloudflare R2 and Stream
├── hooks/             # Custom React hooks
└── utils/             # Utility functions
```

### Public Assets Directory
```
public/
├── images/
│   ├── channels/      # Channel logos
│   ├── thumbnails/    # Video thumbnails
│   └── ads/           # Advertisement images
└── fonts/             # Custom fonts
```

### Additional Directories
```
scripts/               # Build and utility scripts
styles/                # Additional CSS files
```

## Verification Steps

Verify the folder structure was created correctly:

```bash
tree -d -L 4
```

Or check key directories exist:
```bash
ls -la app/
ls -la components/
ls -la lib/
ls -la public/
```

## Success Criteria
- All app routes folders created with correct Next.js naming conventions
- Dynamic routes use proper bracket notation `[id]` and `[[...sign-in]]`
- Component folders organized by feature
- Library folders separated by service
- Public asset folders ready for media files
- No errors during folder creation

## Important Notes
- Dynamic route folders use brackets: `[id]`, `[[...sign-in]]`
- The folder structure follows Next.js 15 App Router conventions
- Component organization follows feature-based architecture
- Admin routes are separated from public routes

## Next Step
After completing this step, proceed to Step 08: Create Core Utility Files.