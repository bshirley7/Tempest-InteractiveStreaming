# Step 02: Install Core Dependencies

## Context
You are building Tempest, an interactive streaming platform. This step installs all required dependencies in one command to ensure compatibility and avoid version conflicts.

## Prerequisites
- Step 01 completed successfully
- You are in the `tempest` project directory

## Task
Install all production and development dependencies for the Tempest platform.

## Exact Commands to Execute

### Navigate to Project Directory
```bash
cd tempest
```

### Install ALL Production Dependencies (Single Command)
```bash
npm install next@15.3.3 react@19.0.0 react-dom@19.0.0 @supabase/supabase-js@^2.48.0 @supabase/auth-helpers-nextjs@^0.10.0 @supabase/auth-helpers-react@^0.5.0 @supabase/realtime-js@^2.10.9 @clerk/nextjs@^6.20.2 @radix-ui/react-avatar@^1.1.10 @radix-ui/react-dialog@^1.1.14 @radix-ui/react-dropdown-menu@^2.1.15 @radix-ui/react-label@^2.1.7 @radix-ui/react-scroll-area@^1.2.9 @radix-ui/react-select@^2.2.5 @radix-ui/react-slider@^1.3.5 @radix-ui/react-slot@^1.2.3 @radix-ui/react-switch@^2.1.5 @radix-ui/react-tabs@^1.1.12 class-variance-authority@^0.7.1 clsx@^2.1.1 tailwind-merge@^3.3.0 tailwindcss-animate@^1.0.7 lucide-react@^0.511.0 date-fns@^4.1.0 framer-motion@^12.15.0 video.js@^8.22.0 @videojs/themes@^1.0.1 @aws-sdk/client-s3@^3.823.0 @aws-sdk/s3-request-presigner@^3.823.0 recharts@^2.15.3 @sentry/nextjs@^9.30.0 dotenv@^16.5.0 @rollup/wasm-node@^4.43.0 form-data@^4.0.2
```

### Install Development Dependencies
```bash
npm install -D @types/node@^20 @types/react@^19 @types/react-dom@^19 @types/video.js@^7.3.58 tsx@^4.19.4
```

## What These Dependencies Provide

### Core Framework
- `next@15.3.3` - Next.js framework with App Router
- `react@19.0.0` - React library
- `react-dom@19.0.0` - React DOM renderer

### Database & Real-time (Supabase)
- `@supabase/supabase-js` - Supabase client
- `@supabase/auth-helpers-*` - Supabase authentication helpers
- `@supabase/realtime-js` - Real-time subscriptions

### Authentication
- `@clerk/nextjs` - Clerk authentication for Next.js

### UI Components (Radix UI)
- All `@radix-ui/react-*` packages for accessible UI components

### Styling & Animation
- `tailwind-merge`, `clsx` - CSS class utilities
- `framer-motion` - Animations
- `tailwindcss-animate` - Animation utilities

### Video & Media
- `video.js` - Video player
- `@aws-sdk/*` - For Cloudflare R2 storage

### Charts & Icons
- `recharts` - Data visualization
- `lucide-react` - Icon library

### Monitoring & Utils
- `@sentry/nextjs` - Error tracking
- `date-fns` - Date utilities

## Verification Steps
Check that installation completed successfully:

```bash
npm list --depth=0
```

Verify these key packages are installed:
- `next@15.3.3`
- `react@19.0.0`
- `@supabase/supabase-js`
- `@clerk/nextjs`
- `@sentry/nextjs`

## Success Criteria
- All dependencies installed without errors
- No version conflicts reported
- `package.json` updated with all dependencies
- `node_modules` folder created
- `package-lock.json` generated

## Next Step
After completing this step, proceed to Step 03: Create Environment Variables.