# Step 05: Create Middleware Configuration

## Context
You are building Temptest, an interactive streaming platform. This step creates middleware for Clerk authentication that protects admin routes while allowing public access to viewing content.

## Prerequisites
- Step 04 completed successfully
- You are in the `temptest` project directory
- Clerk dependency installed

## Task
Create `middleware.ts` in the project root to handle authentication routing and protect admin areas.

## Exact File to Create

Create `middleware.ts` in the root directory with this exact content:

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

## Code Explanation

### Route Protection
- `isProtectedRoute` - Defines which routes require authentication
- `/admin(.*)` - Protects all admin routes and subroutes
- Public routes (watch, vod, content) remain accessible without login

### Middleware Function
- `clerkMiddleware` - Clerk's Next.js middleware
- `auth().protect()` - Redirects unauthenticated users to sign-in
- Only applies protection to matched routes

### Matcher Configuration
- Excludes static files (`.+\\.[\\w]+$`)
- Excludes Next.js internal routes (`_next`)
- Includes root path and API routes
- Covers all dynamic routes

## File Creation Command
```bash
touch middleware.ts
```

Then add the content above to the file.

## Verification Steps
1. Confirm `middleware.ts` exists in project root (same level as `package.json`)
2. Confirm file contains the exact content above
3. Check TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```

## Authentication Flow
With this middleware:
- **Public Access**: `/`, `/watch`, `/vod`, `/content` - No login required
- **Protected Access**: `/admin/*` - Requires authentication
- **Automatic Redirect**: Unauthenticated users go to `/sign-in`
- **Post-Login Redirect**: Users return to originally requested page

## Success Criteria
- `middleware.ts` file created in project root
- File contains exact Clerk middleware configuration
- TypeScript compilation succeeds
- Route protection configured for admin areas only

## Important Notes
- This file must be in the project root, not in the `app` directory
- The matcher pattern is critical for performance
- Admin routes will redirect to Clerk sign-in page when accessed without authentication

## Next Step
After completing this step, proceed to Step 06: Update Tailwind Configuration.