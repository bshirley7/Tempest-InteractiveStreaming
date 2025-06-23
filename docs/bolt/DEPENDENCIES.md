# TEMPTEST - Complete Dependencies List

Based on the current phoenix-streaming codebase with Supabase integration for scalable data persistence

## Core Framework Dependencies

```json
{
  "dependencies": {
    "next": "15.3.3",
    "react": "19.0.0",
    "react-dom": "19.0.0"
  }
}
```

## Database & Real-time (Supabase)

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.48.0",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/auth-helpers-react": "^0.5.0",
    "@supabase/realtime-js": "^2.10.9"
  }
}
```

## Authentication

```json
{
  "dependencies": {
    "@clerk/nextjs": "^6.20.2"
  }
}
```

## Video Player & Streaming

```json
{
  "dependencies": {
    "video.js": "^8.22.0",
    "@videojs/themes": "^1.0.1"
  }
}
```

## UI Components (Radix UI)

```json
{
  "dependencies": {
    "@radix-ui/react-avatar": "^1.1.10",
    "@radix-ui/react-dialog": "^1.1.14",
    "@radix-ui/react-dropdown-menu": "^2.1.15",
    "@radix-ui/react-label": "^2.1.7",
    "@radix-ui/react-scroll-area": "^1.2.9",
    "@radix-ui/react-select": "^2.2.5",
    "@radix-ui/react-slider": "^1.3.5",
    "@radix-ui/react-slot": "^1.2.3",
    "@radix-ui/react-switch": "^1.2.5",
    "@radix-ui/react-tabs": "^1.1.12"
  }
}
```

## Styling & Animation

```json
{
  "dependencies": {
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "tailwind-merge": "^3.3.0",
    "tailwindcss-animate": "^1.0.7",
    "framer-motion": "^12.15.0"
  }
}
```

## Data Visualization

```json
{
  "dependencies": {
    "recharts": "^2.15.3"
  }
}
```

## Utilities

```json
{
  "dependencies": {
    "lucide-react": "^0.511.0",
    "date-fns": "^4.1.0",
    "dotenv": "^16.5.0"
  }
}
```

## Cloud Storage (AWS SDK for Cloudflare R2)

```json
{
  "dependencies": {
    "@aws-sdk/client-s3": "^3.823.0",
    "@aws-sdk/s3-request-presigner": "^3.823.0"
  }
}
```

## Error Tracking

```json
{
  "dependencies": {
    "@sentry/nextjs": "^9.30.0"
  }
}
```

## Build Tools

```json
{
  "dependencies": {
    "@rollup/wasm-node": "^4.43.0",
    "form-data": "^4.0.2"
  }
}
```

## Development Dependencies

```json
{
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/video.js": "^7.3.58",
    "autoprefixer": "^10",
    "eslint": "^8",
    "eslint-config-next": "15.3.3",
    "postcss": "^8",
    "tailwindcss": "^3",
    "tsx": "^4.19.4",
    "typescript": "^5"
  }
}
```

## Optional Dependencies

```json
{
  "optionalDependencies": {
    "@rollup/rollup-win32-x64-msvc": "^4.43.0"
  }
}
```

## External Service Requirements

### 1. Supabase (Database & Real-time)
- **Purpose**: Store user data, video metadata, chat history, analytics
- **Required Environment Variables**:
  ```
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  ```
- **Database Tables Required**:
  - `users` - User profiles and preferences
  - `videos` - Video metadata and information
  - `channels` - Channel configuration
  - `chat_messages` - Chat history
  - `interactions` - User interactions (polls, reactions, ratings)
  - `analytics` - Aggregated analytics data
  - `schedules` - Video scheduling
  - `ads` - Advertisement configuration

### 2. Clerk (Authentication)
- **Purpose**: User authentication and session management
- **Required Environment Variables**:
  ```
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
  CLERK_SECRET_KEY
  NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
  NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
  CLERK_ADMIN_USER_ID=user_2y232PRIhXVR9omfFBhPQdG6DZU
  ```

### 3. Cloudflare R2 (Object Storage)
- **Purpose**: Video file and asset storage
- **Required Environment Variables**:
  ```
  CLOUDFLARE_ACCOUNT_ID=fc69c06fe170cae7c73e2293be724b70
  CLOUDFLARE_R2_ACCESS_KEY_ID
  CLOUDFLARE_R2_SECRET_ACCESS_KEY
  CLOUDFLARE_R2_BUCKET_NAME=xcast-media
  CLOUDFLARE_R2_PUBLIC_URL
  ```

### 4. Cloudflare Stream (Video Streaming)
- **Purpose**: Adaptive video streaming and processing
- **Required Environment Variables**:
  ```
  CLOUDFLARE_API_TOKEN
  CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN
  ```

### 5. Sentry (Error Tracking)
- **Purpose**: Application monitoring and error tracking
- **Required Environment Variables**:
  ```
  SENTRY_DSN
  SENTRY_AUTH_TOKEN
  NEXT_PUBLIC_SENTRY_DSN
  SENTRY_ORG=labelle-xl
  SENTRY_PROJECT=javascript-nextjs
  ```

## Important Architecture Notes

1. **Hybrid Architecture**: Combines Supabase for persistent data with Cloudflare for media delivery
2. **Real-time Features**: Supabase handles WebSocket connections for chat and live updates
3. **Media Storage**: Videos stored in Cloudflare R2, metadata in Supabase
4. **Authentication Flow**: Clerk handles auth, syncs with Supabase user profiles
5. **Scalability**: Database-driven architecture ensures proper scaling in production

## Installation Commands

```bash
# Create Next.js project
npx create-next-app@latest temptest --typescript --tailwind --app --no-src-dir --import-alias "@/*"

# Install all dependencies
npm install

# Install shadcn/ui CLI (for additional components)
npx shadcn@latest init

# Run development server
npm run dev
```

## Scripts Available

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test:cloudflare": "tsx scripts/test-cloudflare.ts",
    "test:video": "tsx scripts/test-single-video.ts",
    "migrate:videos": "tsx scripts/migrate-videos-batch.ts",
    "migrate:cloudflare": "tsx scripts/migrate-to-cloudflare.ts",
    "sync:content": "node scripts/sync-content.js",
    "schedule:generate": "tsx scripts/schedule-generator.ts --command=generate"
  }
}
```

## Version Compatibility

- Next.js 15.3.3 requires React 19
- All Radix UI components are latest versions
- Video.js 8.22.0 for modern browser support
- TypeScript 5+ for latest features
- Tailwind CSS 3+ for modern utility classes