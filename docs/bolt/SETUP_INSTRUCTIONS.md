# TEMPTEST - Step-by-Step Setup Instructions for Bolt.new

## Prerequisites Setup

Before starting with Bolt.new, ensure you have accounts and API keys for:
1. Clerk (Authentication)
2. Supabase (Database)
3. Cloudflare (R2 Storage & Stream)
4. Sentry (Error Tracking)

## Phase 1: Project Initialization (Steps 1-10)

### Step 1: Create Next.js Project
```bash
npx create-next-app@latest tempest --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```
Select:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- App Router: Yes
- Import alias: @/*

### Step 2: Install Core Dependencies
```bash
npm install next@15.3.3 react@19.0.0 react-dom@19.0.0
```

### Step 3: Install Database Dependencies (Supabase)
```bash
npm install @supabase/supabase-js@^2.48.0 @supabase/auth-helpers-nextjs@^0.10.0 @supabase/auth-helpers-react@^0.5.0 @supabase/realtime-js@^2.10.9
```

### Step 4: Install Authentication (Clerk)
```bash
npm install @clerk/nextjs@^6.20.2
```

### Step 5: Install UI Dependencies
```bash
npm install @radix-ui/react-avatar@^1.1.10 @radix-ui/react-dialog@^1.1.14 @radix-ui/react-dropdown-menu@^2.1.15 @radix-ui/react-label@^2.1.7 @radix-ui/react-scroll-area@^1.2.9 @radix-ui/react-select@^2.2.5 @radix-ui/react-slider@^1.3.5 @radix-ui/react-slot@^1.2.3 @radix-ui/react-switch@^1.2.5 @radix-ui/react-tabs@^1.1.12
```

### Step 6: Install Utility Dependencies
```bash
npm install class-variance-authority@^0.7.1 clsx@^2.1.1 tailwind-merge@^3.3.0 tailwindcss-animate@^1.0.7 lucide-react@^0.511.0 date-fns@^4.1.0 framer-motion@^12.15.0
```

### Step 7: Install Video & Media Dependencies
```bash
npm install video.js@^8.22.0 @videojs/themes@^1.0.1 @aws-sdk/client-s3@^3.823.0 @aws-sdk/s3-request-presigner@^3.823.0
```

### Step 8: Install Analytics & Monitoring
```bash
npm install recharts@^2.15.3 @sentry/nextjs@^9.30.0
```

### Step 9: Install Development Dependencies
```bash
npm install -D @types/node@^20 @types/react@^19 @types/react-dom@^19 @types/video.js@^7.3.58 tsx@^4.19.4
```

### Step 10: Initialize Shadcn/UI
```bash
npx shadcn@latest init
```
Select:
- Style: Default
- Base color: Slate
- CSS variables: Yes

## Phase 2: Configuration Setup (Steps 11-20)

### Step 11: Create Environment Variables File
Create `.env.local` with:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
CLERK_ADMIN_USER_ID=your_admin_user_id

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_key
CLOUDFLARE_R2_BUCKET_NAME=temptest-media
CLOUDFLARE_R2_PUBLIC_URL=your_r2_public_url
CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN=your_stream_subdomain

# Sentry
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_SENTRY_DSN=your_public_sentry_dsn
SENTRY_AUTH_TOKEN=your_sentry_auth_token
SENTRY_ORG=your_org
SENTRY_PROJECT=your_project
```

### Step 12: Configure Next.js
Create `next.config.js`:
```javascript
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['your-r2-domain.r2.dev', 'customer-subdomain.cloudflarestream.com'],
  },
};

module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
  }
);
```

### Step 13: Configure TypeScript
Update `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### Step 14: Configure Tailwind CSS
Update `tailwind.config.ts`:
```typescript
import type { Config } from 'tailwindcss'
import { fontFamily } from "tailwindcss/defaultTheme"

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

### Step 15: Create Clerk Middleware
Create `middleware.ts`:
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/admin(.*)',
])

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect()
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

### Step 16: Setup Supabase Client
Create `lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Step 17: Setup Supabase Server Client
Create `lib/supabase/server.ts`:
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle error
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle error
          }
        },
      },
    }
  )
}
```

### Step 18: Create Root Layout
Create `app/layout.tsx`:
```typescript
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Temptest - Interactive Streaming Platform',
  description: 'Transform passive video consumption into engaging experiences',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
```

### Step 19: Install Shadcn Components
```bash
npx shadcn@latest add button card dialog dropdown-menu input label scroll-area select sheet slider switch tabs badge progress avatar toast
```

### Step 20: Create lib/cn.ts Utility
Create `lib/utils/cn.ts`:
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## Phase 3: Database Setup (Steps 21-30)

### Step 21: Create Supabase Tables
Run in Supabase SQL editor:
```sql
-- Users table (synced with Clerk)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Channels table
CREATE TABLE channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  logo_url TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Videos table
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  channel_id UUID REFERENCES channels(id),
  cloudflare_stream_id TEXT,
  cloudflare_r2_key TEXT,
  thumbnail_url TEXT,
  duration INTEGER,
  view_count INTEGER DEFAULT 0,
  is_live BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id),
  user_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  is_command BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Interactions table
CREATE TABLE interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id),
  user_id UUID REFERENCES users(id),
  type TEXT NOT NULL, -- 'poll', 'quiz', 'reaction', 'rating'
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Ads table
CREATE TABLE ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- 'pre-roll', 'mid-roll', 'overlay'
  media_url TEXT,
  target_criteria JSONB,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Schedules table
CREATE TABLE schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES channels(id),
  video_id UUID REFERENCES videos(id),
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Analytics table
CREATE TABLE analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id UUID REFERENCES videos(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  viewer_count INTEGER DEFAULT 0,
  interaction_count INTEGER DEFAULT 0,
  chat_messages INTEGER DEFAULT 0,
  ad_impressions INTEGER DEFAULT 0
);
```

### Step 22: Create Database Types
Create `lib/supabase/types.ts`:
```typescript
export interface User {
  id: string
  clerk_id: string
  username: string
  email?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Channel {
  id: string
  name: string
  slug: string
  description?: string
  logo_url?: string
  color?: string
  is_active: boolean
  created_at: string
}

export interface Video {
  id: string
  title: string
  description?: string
  channel_id: string
  cloudflare_stream_id?: string
  cloudflare_r2_key?: string
  thumbnail_url?: string
  duration?: number
  view_count: number
  is_live: boolean
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  video_id: string
  user_id: string
  message: string
  is_command: boolean
  created_at: string
  user?: User
}

export interface Interaction {
  id: string
  video_id: string
  user_id: string
  type: 'poll' | 'quiz' | 'reaction' | 'rating'
  data: any
  created_at: string
}
```

### Step 23: Enable Realtime
In Supabase dashboard:
1. Go to Database > Replication
2. Enable replication for tables: chat_messages, interactions, analytics
3. Set up Row Level Security policies

### Step 24: Create RLS Policies
```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Users can read all users
CREATE POLICY "Users can view all users" ON users
  FOR SELECT USING (true);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = clerk_id);

-- Anyone can read chat messages
CREATE POLICY "Anyone can read chat messages" ON chat_messages
  FOR SELECT USING (true);

-- Authenticated users can insert chat messages
CREATE POLICY "Authenticated users can send messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Anyone can read interactions
CREATE POLICY "Anyone can read interactions" ON interactions
  FOR SELECT USING (true);

-- Authenticated users can create interactions
CREATE POLICY "Authenticated users can create interactions" ON interactions
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

### Step 25: Create Cloudflare R2 Configuration
Create `lib/cloudflare/r2.ts`:
```typescript
import { S3Client } from "@aws-sdk/client-s3";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
});
```

### Step 26: Create Basic Homepage
Create `app/page.tsx`:
```typescript
export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to Temptest</h1>
      <p className="text-lg text-muted-foreground">
        Interactive streaming platform coming soon...
      </p>
    </div>
  )
}
```

### Step 27: Create Sentry Configuration
Create `sentry.client.config.ts`:
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});
```

### Step 28: Test Database Connection
Create a test API route `app/api/test-db/route.ts`:
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('channels')
    .select('*')
    .limit(5)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  
  return NextResponse.json({ channels: data })
}
```

### Step 29: Run Development Server
```bash
npm run dev
```

### Step 30: Verify Setup
1. Navigate to http://localhost:3000
2. Check that the homepage loads
3. Test API at http://localhost:3000/api/test-db
4. Verify Clerk authentication works
5. Check Sentry is receiving events

## Phase 4: Core Features Implementation (Steps 31-40)

### Step 31: Create TV Guide Component
Follow the component structure in FILE_STRUCTURE.md to implement:
- components/tv-guide/TVGuide.tsx
- components/tv-guide/ChannelCard.tsx
- components/tv-guide/ScheduleGrid.tsx

### Step 32: Implement Video Player
Create video player with Cloudflare Stream integration:
- components/video/VideoPlayer.tsx
- components/video/OptimizedVideoPlayer.tsx

### Step 33: Add Real-time Chat
Implement chat with Supabase real-time:
- components/chat/Chat.tsx
- components/chat/ChatMessage.tsx
- components/chat/ChatInput.tsx

### Step 34: Create Interactive Overlays
Build interaction system:
- components/interactions/PollOverlay.tsx
- components/interactions/EmojiReaction.tsx
- components/interactions/InteractionManager.tsx

### Step 35: Implement Admin Dashboard
Create admin pages:
- app/admin/page.tsx
- app/admin/content/page.tsx
- app/admin/upload/page.tsx

### Step 36: Add Analytics Dashboard
Build analytics components:
- components/analytics/ViewerChart.tsx
- components/analytics/EngagementChart.tsx
- components/analytics/DashboardGrid.tsx

### Step 37: Create Ad System
Implement advertising:
- components/ads/AdOverlay.tsx
- components/ads/PreRollAd.tsx
- components/ads/AdTargeting.tsx

### Step 38: Setup Content Upload
Create upload workflow:
- Cloudflare Stream integration
- Thumbnail generation
- Metadata management

### Step 39: Implement Schedule System
Build scheduling features:
- Schedule generator
- Calendar view
- Auto-scheduling

### Step 40: Final Testing
1. Test all user flows
2. Verify real-time features
3. Check mobile responsiveness
4. Performance optimization
5. Deploy to production

## Important Notes for Bolt.new

1. **Follow Exact Order**: Steps must be completed sequentially
2. **Verify Each Step**: Test after each major phase
3. **Use Exact Versions**: Don't update package versions
4. **Environment Variables**: Set all required vars before testing
5. **Database First**: Ensure Supabase tables exist before coding
6. **Type Safety**: Generate types from database schema
7. **Error Handling**: Implement error boundaries early
8. **Mobile Testing**: Test on mobile after each feature

## Troubleshooting Common Issues

1. **Clerk Auth Issues**: Verify webhook endpoint and middleware
2. **Supabase Connection**: Check service role key and RLS policies
3. **Cloudflare CORS**: Configure proper CORS headers
4. **Video Playback**: Ensure Stream customer subdomain is correct
5. **Real-time Updates**: Verify Supabase replication is enabled