# Step 12: Update App Layout and Global Styles

## Context
You are building Tempest, an interactive streaming platform. This step updates the main app layout with Clerk authentication providers and enhances global CSS with design system variables and component styles.

## Prerequisites
- Step 11 completed successfully
- You are in the `tempest` project directory
- All configuration files created

## Task
Update the root layout to include authentication providers and update global styles with design system variables, component styles, and responsive utilities.

## Files to Update/Create

### 1. Update `app/layout.tsx` (Root Layout)

Replace the entire contents of `app/layout.tsx` with:

```typescript
import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Tempest - Interactive Streaming Platform',
  description: 'Transform passive video consumption into engaging, interactive experiences',
  keywords: 'streaming, interactive, video, education, entertainment',
  authors: [{ name: 'Tempest Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#000000',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: undefined,
        variables: {
          colorPrimary: '#3B82F6',
          colorBackground: '#FFFFFF',
          colorInputBackground: '#F9FAFB',
          colorInputText: '#111827',
          colorText: '#111827',
          colorTextSecondary: '#6B7280',
          colorTextOnPrimaryBackground: '#FFFFFF',
          borderRadius: '0.5rem',
        },
        elements: {
          formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
          card: 'shadow-lg border border-gray-200',
          headerTitle: 'text-2xl font-bold text-gray-900',
          headerSubtitle: 'text-gray-600',
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <div id="root" className="min-h-screen bg-background text-foreground">
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  )
}
```

### 2. Update `app/globals.css` (Global Styles)

Replace the entire contents of `app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 221.2 83.2% 53.3%;
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
    --ring: 221.2 83.2% 53.3%;
    --radius: 0.5rem;
    
    /* Tempest-specific variables */
    --channel-campus: 342 75% 68%;     /* #FF6B6B */
    --channel-explore: 167 85% 59%;    /* #4ECDC4 */
    --channel-create: 198 83% 60%;     /* #45B7D1 */
    --channel-chill: 142 47% 69%;      /* #96CEB4 */
    
    --video-player-bg: 0 0% 7%;        /* #121212 */
    --chat-bg: 0 0% 96%;               /* #F5F5F5 */
    --overlay-bg: 0 0% 0% / 0.8;       /* rgba(0,0,0,0.8) */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 217.2 91.2% 59.8%;
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
    --ring: 224.3 76.3% 94.1%;
    
    /* Dark mode channel colors (slightly muted) */
    --channel-campus: 342 65% 58%;
    --channel-explore: 167 75% 49%;
    --channel-create: 198 73% 50%;
    --channel-chill: 142 37% 59%;
    
    --video-player-bg: 0 0% 7%;
    --chat-bg: 0 0% 12%;
    --overlay-bg: 0 0% 0% / 0.9;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
  
  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }
  
  /* Focus styles */
  *:focus-visible {
    @apply outline-none ring-2 ring-ring ring-offset-2 ring-offset-background;
  }
  
  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  
  ::-webkit-scrollbar-track {
    @apply bg-muted;
  }
  
  ::-webkit-scrollbar-thumb {
    @apply bg-border rounded-full;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    @apply bg-muted-foreground;
  }
}

@layer components {
  /* Channel-specific colors */
  .channel-campus {
    @apply bg-[hsl(var(--channel-campus))] text-white;
  }
  
  .channel-explore {
    @apply bg-[hsl(var(--channel-explore))] text-white;
  }
  
  .channel-create {
    @apply bg-[hsl(var(--channel-create))] text-white;
  }
  
  .channel-chill {
    @apply bg-[hsl(var(--channel-chill))] text-white;
  }
  
  /* Video player styles */
  .video-player-container {
    @apply relative bg-[hsl(var(--video-player-bg))] rounded-lg overflow-hidden;
    aspect-ratio: 16 / 9;
  }
  
  .video-overlay {
    @apply absolute inset-0 bg-[hsl(var(--overlay-bg))] flex items-center justify-center z-10;
  }
  
  /* Chat styles */
  .chat-container {
    @apply bg-[hsl(var(--chat-bg))] border border-border rounded-lg;
  }
  
  .chat-message {
    @apply px-3 py-2 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors;
  }
  
  /* Interactive elements */
  .interactive-button {
    @apply bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md transition-colors duration-200 font-medium;
  }
  
  .interactive-button:disabled {
    @apply opacity-50 cursor-not-allowed hover:bg-primary;
  }
  
  /* TV Guide grid */
  .tv-guide-grid {
    @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4;
  }
  
  .tv-guide-card {
    @apply bg-card text-card-foreground border border-border rounded-lg p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer;
  }
  
  .tv-guide-card:hover {
    @apply shadow-xl transform scale-[1.02];
  }
  
  /* Loading states */
  .loading-skeleton {
    @apply animate-pulse bg-muted rounded;
  }
  
  .loading-spinner {
    @apply animate-spin rounded-full border-2 border-muted border-t-primary;
  }
  
  /* Admin dashboard */
  .admin-card {
    @apply bg-card text-card-foreground p-6 rounded-lg border border-border shadow-sm;
  }
  
  .admin-stat {
    @apply flex items-center justify-between p-4 bg-muted/50 rounded-md;
  }
  
  /* Responsive utilities */
  .container-responsive {
    @apply container mx-auto px-4 sm:px-6 lg:px-8;
  }
  
  /* Animation utilities */
  .fade-in {
    @apply animate-in fade-in-0 duration-200;
  }
  
  .slide-up {
    @apply animate-in slide-in-from-bottom-2 duration-300;
  }
  
  .scale-in {
    @apply animate-in zoom-in-95 duration-150;
  }
}

@layer utilities {
  /* Aspect ratio utilities */
  .aspect-video {
    aspect-ratio: 16 / 9;
  }
  
  .aspect-square {
    aspect-ratio: 1 / 1;
  }
  
  /* Typography utilities */
  .text-gradient {
    @apply bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent;
  }
  
  /* Layout utilities */
  .center-absolute {
    @apply absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2;
  }
  
  /* Interaction utilities */
  .hover-lift {
    @apply transition-transform duration-200 hover:scale-105;
  }
  
  .press-down {
    @apply transition-transform duration-75 active:scale-95;
  }
}

/* Video.js custom styles */
.video-js {
  @apply w-full h-full;
}

.video-js .vjs-big-play-button {
  @apply border-none bg-primary/80 hover:bg-primary;
  border-radius: 50% !important;
  width: 80px !important;
  height: 80px !important;
  line-height: 80px !important;
  margin-top: -40px !important;
  margin-left: -40px !important;
}

.video-js .vjs-control-bar {
  @apply bg-black/60 backdrop-blur-sm;
}

.video-js .vjs-progress-control .vjs-progress-holder {
  @apply bg-white/20;
}

.video-js .vjs-progress-control .vjs-play-progress {
  @apply bg-primary;
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
}

/* Reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 3. Create `app/page.tsx` (Updated Homepage)

Replace the entire contents of `app/page.tsx` with:

```typescript
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container-responsive py-16">
        <div className="text-center space-y-8">
          {/* Hero Section */}
          <div className="space-y-4">
            <h1 className="text-6xl font-bold text-gradient">
              Welcome to Tempest
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Interactive streaming platform that transforms passive video consumption 
              into engaging, data-rich experiences.
            </p>
          </div>
          
          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            <div className="admin-card text-center space-y-3 hover-lift">
              <div className="w-12 h-12 bg-channel-campus rounded-lg mx-auto flex items-center justify-center">
                <span className="text-white text-xl">📺</span>
              </div>
              <h3 className="font-semibold">Live Streaming</h3>
              <p className="text-sm text-muted-foreground">
                Real-time interactive streaming with live chat and polls
              </p>
            </div>
            
            <div className="admin-card text-center space-y-3 hover-lift">
              <div className="w-12 h-12 bg-channel-explore rounded-lg mx-auto flex items-center justify-center">
                <span className="text-white text-xl">🎯</span>
              </div>
              <h3 className="font-semibold">Smart Targeting</h3>
              <p className="text-sm text-muted-foreground">
                Behavioral ad targeting for increased engagement
              </p>
            </div>
            
            <div className="admin-card text-center space-y-3 hover-lift">
              <div className="w-12 h-12 bg-channel-create rounded-lg mx-auto flex items-center justify-center">
                <span className="text-white text-xl">📊</span>
              </div>
              <h3 className="font-semibold">Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Real-time analytics and engagement tracking
              </p>
            </div>
            
            <div className="admin-card text-center space-y-3 hover-lift">
              <div className="w-12 h-12 bg-channel-chill rounded-lg mx-auto flex items-center justify-center">
                <span className="text-white text-xl">📱</span>
              </div>
              <h3 className="font-semibold">Mobile First</h3>
              <p className="text-sm text-muted-foreground">
                Optimized for mobile devices and touch interactions
              </p>
            </div>
          </div>
          
          {/* Setup Status */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="admin-card">
              <h2 className="text-2xl font-semibold mb-6 text-center">Setup Progress</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Next.js Project</span>
                  <span className="text-green-600">✓ Complete</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Dependencies Installed</span>
                  <span className="text-green-600">✓ Complete</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Configuration Files</span>
                  <span className="text-green-600">✓ Complete</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Database Setup</span>
                  <span className="text-yellow-600">⏳ Pending</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Authentication</span>
                  <span className="text-yellow-600">⏳ Pending</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Components Built</span>
                  <span className="text-yellow-600">⏳ Pending</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## File Update Commands

Simply replace the contents of each file with the provided code above.

## Updates Explanation

### Root Layout Updates
- Added Clerk provider with custom theming
- Configured proper metadata for SEO
- Added viewport and theme color meta tags
- Included Inter font for consistent typography

### Global Styles Updates
- Added CSS custom properties for design system
- Included channel-specific color variables
- Added component utility classes
- Included Video.js styling
- Added responsive utilities and animations
- Added dark mode support

### Homepage Updates
- Created hero section with gradient text
- Added feature showcase grid
- Included setup progress tracker
- Used design system classes

## Verification Steps

1. Check that files were updated:
   ```bash
   head -20 app/layout.tsx
   head -20 app/globals.css
   head -20 app/page.tsx
   ```

2. Test TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Visit http://localhost:3000 to see the updated homepage

## Success Criteria
- All files updated with new content
- TypeScript compilation succeeds
- Development server starts without errors
- Homepage displays with proper styling
- Design system classes work correctly

## Important Notes
- Custom CSS variables enable consistent theming
- Clerk provider includes custom appearance configuration
- Video.js styles are included for future video player
- Responsive utilities ensure mobile-first design

## Next Step
After completing this step, proceed to Step 13: Initialize Shadcn/UI Components.