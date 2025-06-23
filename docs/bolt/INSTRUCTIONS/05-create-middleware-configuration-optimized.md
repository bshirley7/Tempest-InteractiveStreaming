# Step 05: Create Middleware Configuration

## Context
You are building Tempest, an interactive streaming platform. This step creates the middleware configuration for authentication and routing protection using Clerk.

## Purpose
Middleware runs before every request and handles authentication, redirects, and route protection. This is CRITICAL for securing admin routes and user-specific content.

## Prerequisites
- Step 04 completed successfully
- Clerk environment variables configured
- You are in the `tempest` project directory

## Task Instructions
Complete each task in order and mark as ✅ when finished:

### Task 1: Create Middleware File ⏳

**CREATE middleware.ts in root directory with EXACT content:**
```typescript
import { authMiddleware } from '@clerk/nextjs';
import { NextResponse } from 'next/server';

// CRITICAL: This config tells Clerk which routes to protect
export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    '/',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/webhooks(.*)',
    '/api/health',
    '/watch',
    '/vod',
    '/content',
  ],

  // Routes that require authentication
  ignoredRoutes: [
    '/api/webhooks/clerk',
    '/_next/static(.*)',
    '/_next/image(.*)',
    '/favicon.ico',
  ],

  // CRITICAL: After auth callback for custom logic
  afterAuth(auth, req) {
    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('redirect_url', req.url);
      return NextResponse.redirect(signInUrl);
    }

    // CRITICAL: Protect admin routes
    if (req.nextUrl.pathname.startsWith('/admin')) {
      // Check if user has admin role (implement your role check here)
      // For now, just ensure they're authenticated
      if (!auth.userId) {
        const signInUrl = new URL('/sign-in', req.url);
        signInUrl.searchParams.set('redirect_url', req.url);
        return NextResponse.redirect(signInUrl);
      }
    }

    // Allow the request to continue
    return NextResponse.next();
  },
});

// CRITICAL: Matcher configuration for middleware
export const config = {
  matcher: [
    // Skip Next.js internals and all static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
```

### Task 2: Create Types for Middleware ⏳

**CREATE types/middleware.ts:**
```typescript
// Extend Clerk's auth types if needed
export interface AuthenticatedRequest extends Request {
  auth: {
    userId: string;
    sessionId: string;
    orgId?: string;
  };
}

export interface PublicRequest extends Request {
  auth: null;
}

export type ProtectedRoute = 
  | '/admin'
  | '/admin/*'
  | '/api/admin/*'
  | '/dashboard'
  | '/dashboard/*';

export type PublicRoute = 
  | '/'
  | '/sign-in'
  | '/sign-in/*'
  | '/sign-up'
  | '/sign-up/*'
  | '/watch'
  | '/vod'
  | '/content';
```

### Task 3: Create Route Constants ⏳

**CREATE lib/constants/routes.ts:**
```typescript
// CRITICAL: Centralized route configuration
export const ROUTES = {
  // Public routes
  HOME: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  WATCH: '/watch',
  VOD: '/vod',
  CONTENT: '/content',

  // Protected routes
  ADMIN: '/admin',
  ADMIN_CONTENT: '/admin/content',
  ADMIN_USERS: '/admin/users',
  ADMIN_ANALYTICS: '/admin/analytics',

  // API routes
  API_HEALTH: '/api/health',
  API_WEBHOOKS_CLERK: '/api/webhooks/clerk',
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.HOME,
  ROUTES.SIGN_IN,
  ROUTES.SIGN_UP,
  ROUTES.WATCH,
  ROUTES.VOD,
  ROUTES.CONTENT,
] as const;

export const ADMIN_ROUTES = [
  ROUTES.ADMIN,
  ROUTES.ADMIN_CONTENT,
  ROUTES.ADMIN_USERS,
  ROUTES.ADMIN_ANALYTICS,
] as const;
```

### Task 4: Test Middleware Configuration ⏳

**CREATE app/api/health/route.ts to test public route:**
```typescript
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
}
```

**CREATE app/test-auth/page.tsx to test protected route:**
```typescript
import { auth } from '@clerk/nextjs';

export default async function TestAuthPage() {
  const { userId } = auth();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      <p>User ID: {userId || 'Not authenticated'}</p>
      <p>This page should redirect to sign-in if not authenticated.</p>
    </div>
  );
}
```

### Task 5: Verify Middleware Works ⏳

**RUN development server and test:**
```bash
npm run dev
```

**Test these scenarios:**
1. Visit http://localhost:3000/api/health - Should work without auth
2. Visit http://localhost:3000/test-auth - Should redirect to sign-in
3. Visit http://localhost:3000/admin - Should redirect to sign-in
4. Visit http://localhost:3000/ - Should work without auth

## Task Completion Checklist
Mark each task as complete:

- [ ] Task 1: middleware.ts created ✅
- [ ] Task 2: Middleware types created ✅
- [ ] Task 3: Route constants created ✅
- [ ] Task 4: Test routes created ✅
- [ ] Task 5: Middleware verified working ✅

## Critical Middleware Rules

**PUBLIC ROUTES**: Must be explicitly listed in publicRoutes array
**ADMIN PROTECTION**: All /admin/* routes require authentication
**API WEBHOOKS**: Must be in ignoredRoutes to receive external calls
**STATIC FILES**: Automatically excluded by matcher pattern

## Common Issues & Solutions

**Issue**: Infinite redirect loop
**Solution**: Ensure sign-in/sign-up pages are in publicRoutes

**Issue**: API webhooks failing with 401
**Solution**: Add webhook routes to ignoredRoutes array

**Issue**: Static files being blocked
**Solution**: Check matcher pattern excludes file extensions

**Issue**: Middleware not running
**Solution**: File must be named `middleware.ts` in root directory

## Success Criteria
- Middleware file exists in root directory
- Public routes accessible without auth
- Protected routes redirect to sign-in
- API health check works
- No infinite redirect loops

## Next Step
After all tasks show ✅, proceed to Step 06: Update Tailwind Configuration