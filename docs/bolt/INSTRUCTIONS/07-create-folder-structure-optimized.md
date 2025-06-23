# Step 07: Create Project Folder Structure

## Context
You are building Tempest, an interactive streaming platform. This step creates the complete folder structure that organizes all components, utilities, and pages according to the Tempest architecture.

## Purpose
Proper folder structure is CRITICAL for Next.js routing and component organization. Missing folders will cause routing failures and import errors.

## Prerequisites
- Step 06 completed successfully
- You are in the `tempest` project directory
- All previous configuration steps completed

## Task Instructions
Complete each task in order and mark as ✅ when finished:

### Task 1: Create App Directory Structure ⏳

**EXACT COMMAND - Create all app routes:**
```bash
mkdir -p app/auth/sign-in/"[[...sign-in]]" app/auth/sign-up/"[[...sign-up]]" app/watch app/vod/details/"[id]" app/vod/watch/"[id]" app/content app/admin/content/"[id]"/edit app/admin/channels app/admin/categories app/admin/schedule app/admin/ads app/admin/upload app/api/webhooks/clerk app/api/content/cloudflare-sync app/api/content/metadata app/api/sentry-example-api app/test-tailwind app/test-auth
```

### Task 2: Create Components Structure ⏳

**EXACT COMMAND - Create component folders:**
```bash
mkdir -p components/ui components/layout components/tv-guide components/video components/chat components/interactions components/ads components/analytics components/admin components/auth
```

### Task 3: Create Library Structure ⏳

**EXACT COMMAND - Create lib folders:**
```bash
mkdir -p lib/supabase lib/cloudflare lib/hooks lib/utils lib/constants lib/types lib/validators
```

### Task 4: Create Assets Structure ⏳

**EXACT COMMAND - Create public folders:**
```bash
mkdir -p public/images/channels public/images/thumbnails public/images/ads public/images/logos public/fonts public/videos public/audio
```

### Task 5: Create Additional Directories ⏳

**EXACT COMMAND - Create remaining folders:**
```bash
mkdir -p scripts styles docs/api types
```

### Task 6: Verify Folder Structure ⏳

**EXACT COMMAND - Check directory structure:**
```bash
find . -type d -name "node_modules" -prune -o -type d -print | head -50
```

**EXACT COMMAND - Verify key routes exist:**
```bash
ls -la app/auth/sign-in/
ls -la app/vod/watch/
ls -la app/admin/
ls -la components/
ls -la lib/
```

## Task Completion Checklist
Mark each task as complete:

- [ ] Task 1: App directory structure created ✅
- [ ] Task 2: Components structure created ✅
- [ ] Task 3: Library structure created ✅
- [ ] Task 4: Assets structure created ✅
- [ ] Task 5: Additional directories created ✅
- [ ] Task 6: Structure verified ✅

## Complete Folder Structure Reference

### App Routes (Next.js 15 App Router)
```
app/
├── auth/
│   ├── sign-in/[[...sign-in]]/    # Clerk catch-all sign-in
│   └── sign-up/[[...sign-up]]/    # Clerk catch-all sign-up
├── watch/                         # Live streaming page
├── vod/
│   ├── details/[id]/             # Video details
│   └── watch/[id]/               # VOD player
├── content/                      # Content browsing
├── admin/
│   ├── content/[id]/edit/        # Dynamic edit pages
│   ├── channels/                 # Channel management
│   ├── categories/               # Categories
│   ├── schedule/                 # Scheduling
│   ├── ads/                      # Ad management
│   └── upload/                   # Upload interface
├── test-tailwind/                # Config testing
├── test-auth/                    # Auth testing
└── api/
    ├── webhooks/clerk/           # Auth webhooks
    ├── content/
    │   ├── cloudflare-sync/      # Video sync
    │   └── metadata/             # Metadata API
    └── sentry-example-api/       # Error tracking
```

### Components Organization
```
components/
├── ui/                 # shadcn/ui base components
├── layout/            # Navigation, header, footer
├── tv-guide/          # Channel grid, program listings
├── video/             # Video.js player, controls
├── chat/              # Real-time messaging
├── interactions/      # Polls, reactions, overlays
├── ads/               # Advertisement rendering
├── analytics/         # Charts and metrics
├── admin/             # Admin interface components
└── auth/              # Authentication components
```

### Library Structure
```
lib/
├── supabase/          # Database client & types
├── cloudflare/        # Stream & R2 storage
├── hooks/             # Custom React hooks
├── utils/             # Helper functions
├── constants/         # App constants
├── types/             # TypeScript definitions
└── validators/        # Data validation schemas
```

### Assets & Resources
```
public/
├── images/
│   ├── channels/      # Channel brand assets
│   ├── thumbnails/    # Video preview images
│   ├── ads/           # Advertisement media
│   └── logos/         # Platform branding
├── fonts/             # Custom typography
├── videos/            # Demo/placeholder videos
└── audio/             # Sound effects, alerts
```

## Critical Folder Notes

**DYNAMIC ROUTES**: Use exact bracket notation - `[id]` NOT `{id}`
**CATCH-ALL ROUTES**: Use double brackets - `[[...sign-in]]`
**COMPONENT ORGANIZATION**: Group by feature, not file type
**ASSET STRUCTURE**: Organize by content type for easy management

## Common Issues & Solutions

**Issue**: "Cannot resolve module" errors
**Solution**: Ensure folder names match import paths exactly

**Issue**: Dynamic routes not working
**Solution**: Check bracket notation is correct: `[id]` not `{id}`

**Issue**: Clerk auth pages not found
**Solution**: Verify catch-all structure: `[[...sign-in]]`

**Issue**: Asset imports failing
**Solution**: Ensure public folder structure matches import paths

## Success Criteria
- All Next.js dynamic routes use proper bracket notation
- Component folders organized by feature area
- Library structure supports modular imports
- Asset folders ready for media management
- No permission or creation errors
- Verification commands show expected structure

## Next Step
After all tasks show ✅, proceed to Step 08: Create Core Utility Files