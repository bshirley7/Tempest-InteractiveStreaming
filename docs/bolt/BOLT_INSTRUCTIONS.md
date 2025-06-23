# EXACT INSTRUCTIONS FOR BOLT.NEW

## Project: TEMPTEST - Interactive Streaming Platform

### IMPORTANT: Follow these instructions EXACTLY in order. Do not make your own decisions about architecture or implementation.

## Pre-Setup Requirements

Before starting, ensure the user has:
1. Supabase account with a new project created
2. Clerk account with a new application
3. Cloudflare account with R2 and Stream enabled
4. Sentry account with a new project

## PHASE 1: Project Initialization

### Step 1.1: Create Next.js Project
```bash
npx create-next-app@latest temptest --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```
When prompted, select:
- TypeScript: Yes
- ESLint: Yes  
- Tailwind CSS: Yes
- App Router: Yes
- Import alias: @/*

### Step 1.2: Install ALL Dependencies at Once
```bash
cd temptest
npm install next@15.3.3 react@19.0.0 react-dom@19.0.0 @supabase/supabase-js@^2.48.0 @supabase/auth-helpers-nextjs@^0.10.0 @supabase/auth-helpers-react@^0.5.0 @supabase/realtime-js@^2.10.9 @clerk/nextjs@^6.20.2 @radix-ui/react-avatar@^1.1.10 @radix-ui/react-dialog@^1.1.14 @radix-ui/react-dropdown-menu@^2.1.15 @radix-ui/react-label@^2.1.7 @radix-ui/react-scroll-area@^1.2.9 @radix-ui/react-select@^2.2.5 @radix-ui/react-slider@^1.3.5 @radix-ui/react-slot@^1.2.3 @radix-ui/react-switch@^1.2.5 @radix-ui/react-tabs@^1.1.12 class-variance-authority@^0.7.1 clsx@^2.1.1 tailwind-merge@^3.3.0 tailwindcss-animate@^1.0.7 lucide-react@^0.511.0 date-fns@^4.1.0 framer-motion@^12.15.0 video.js@^8.22.0 @videojs/themes@^1.0.1 @aws-sdk/client-s3@^3.823.0 @aws-sdk/s3-request-presigner@^3.823.0 recharts@^2.15.3 @sentry/nextjs@^9.30.0 dotenv@^16.5.0 @rollup/wasm-node@^4.43.0 form-data@^4.0.2
```

### Step 1.3: Install Dev Dependencies
```bash
npm install -D @types/node@^20 @types/react@^19 @types/react-dom@^19 @types/video.js@^7.3.58 tsx@^4.19.4
```

### Step 1.4: Create Environment Variables
Create `.env.local` file with this exact content (user must fill in their values):
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
CLERK_ADMIN_USER_ID=

# Cloudflare
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=temptest-media
CLOUDFLARE_R2_PUBLIC_URL=
CLOUDFLARE_R2_ENDPOINT=

# Cloudflare Stream
CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN=
NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN=

# Sentry
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

## PHASE 2: Core Configuration Files

### Step 2.1: Create next.config.js
```javascript
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '*.cloudflarestream.com',
      },
    ],
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

### Step 2.2: Create middleware.ts
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

### Step 2.3: Update tailwind.config.ts
Replace the entire file with:
```typescript
import type { Config } from 'tailwindcss'

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

## PHASE 3: Create Folder Structure

### Step 3.1: Create ALL folders at once
```bash
mkdir -p app/{(auth)/sign-in/[[...sign-in]],watch,vod/{details/[id],watch/[id]},content,admin/{content/[id]/edit,channels,categories,schedule,ads,upload},api/{webhooks/clerk,content/{cloudflare-sync,metadata},sentry-example-api}}
mkdir -p components/{ui,layout,tv-guide,video,chat,interactions,ads,analytics,admin}
mkdir -p lib/{supabase,cloudflare,hooks,utils}
mkdir -p public/{images/{channels,thumbnails,ads},fonts}
mkdir -p scripts
mkdir -p styles
```

## PHASE 4: Create Core Library Files

### Step 4.1: Create lib/utils/cn.ts
```typescript
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Step 4.2: Create lib/supabase/client.ts
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

### Step 4.3: Create lib/supabase/server.ts
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

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

### Step 4.4: Create lib/cloudflare/r2.ts
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

### Step 4.5: Create lib/types.ts
```typescript
export interface User {
  id: string
  clerk_id: string
  username: string
  email?: string
  avatar_url?: string
  role: 'viewer' | 'moderator' | 'admin'
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
  channel?: Channel
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

## PHASE 5: Create Sentry Configuration

### Step 5.1: Create sentry.client.config.ts
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

### Step 5.2: Create sentry.server.config.ts
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
});
```

### Step 5.3: Create sentry.edge.config.ts
```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
  debug: false,
});
```

## PHASE 6: Create App Structure

### Step 6.1: Update app/globals.css
Add these custom CSS variables at the top of the file after the Tailwind directives:
```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
 
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}
```

### Step 6.2: Create app/layout.tsx
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

### Step 6.3: Create app/page.tsx
```typescript
export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Welcome to Temptest</h1>
      <p className="text-lg text-muted-foreground">
        Interactive streaming platform - Setup in progress...
      </p>
      <div className="mt-8 p-4 bg-muted rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Setup Checklist</h2>
        <ul className="list-disc list-inside space-y-2">
          <li>✓ Next.js project created</li>
          <li>✓ Dependencies installed</li>
          <li>✓ Environment variables configured</li>
          <li>◯ Database tables created</li>
          <li>◯ Authentication configured</li>
          <li>◯ Components built</li>
        </ul>
      </div>
    </div>
  )
}
```

## PHASE 7: Initialize Shadcn/UI

### Step 7.1: Initialize Shadcn
```bash
npx shadcn@latest init
```
When prompted:
- Style: Default
- Base color: Slate
- CSS variables: Yes

### Step 7.2: Add ALL Shadcn components
```bash
npx shadcn@latest add button card dialog dropdown-menu input label scroll-area select sheet slider switch tabs badge progress avatar toast
```

## PHASE 8: Database Setup

### Step 8.1: Create Database Tables
Tell the user to run this SQL in their Supabase SQL editor:
```sql
-- Copy the ENTIRE content from DATABASE_SCHEMA.md
-- Run all CREATE TABLE statements
-- Run all CREATE INDEX statements
-- Run all CREATE FUNCTION statements
-- Run all CREATE TRIGGER statements
-- Run all CREATE POLICY statements
-- Enable realtime for required tables
```

## PHASE 9: Create Authentication Pages

### Step 9.1: Create app/(auth)/sign-in/[[...sign-in]]/page.tsx
```typescript
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignIn />
    </div>
  );
}
```

### Step 9.2: Create app/(auth)/sign-up/[[...sign-up]]/page.tsx
```typescript
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <SignUp />
    </div>
  );
}
```

## PHASE 10: Test Setup

### Step 10.1: Create API test route app/api/test-db/route.ts
```typescript
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
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

### Step 10.2: Run Development Server
```bash
npm run dev
```

### Step 10.3: Verify Everything Works
1. Navigate to http://localhost:3000
2. Test database at http://localhost:3000/api/test-db
3. Test authentication at http://localhost:3000/sign-in

## CRITICAL REMINDERS FOR BOLT.NEW

1. **NEVER** skip steps or combine them
2. **ALWAYS** use exact package versions specified
3. **NEVER** create files not listed in FILE_STRUCTURE.md
4. **ALWAYS** wait for database setup before creating data-dependent components
5. **NEVER** modify the architecture without explicit user instruction
6. **ALWAYS** test after each phase completion
7. **NEVER** use different UI libraries or state management solutions
8. **ALWAYS** follow the exact folder structure provided

## NEXT STEPS AFTER BASIC SETUP

Once the above is complete and verified working:
1. Implement TV Guide components
2. Create Video Player with Cloudflare Stream
3. Build Real-time Chat system
4. Add Interactive Overlays
5. Create Admin Dashboard
6. Implement Analytics
7. Add Advertisement System

Each of these should be implemented following the exact specifications in FILE_STRUCTURE.md and using the patterns established in the setup.