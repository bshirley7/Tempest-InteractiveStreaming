# Authentication Architecture

## Overview
This application uses a **Clerk + Supabase** integration where:
- **Clerk** handles ALL authentication (login, signup, session management, security)
- **Supabase** is used ONLY for data storage (user profiles, content metadata, channel data, chat data)

## Architecture Components

### 1. Clerk Authentication (Primary)
- **Purpose**: Complete authentication system
- **Handles**: User registration, login, session management, MFA, password reset
- **Routes Protected**: `/library`, `/analytics`, `/settings`, `/admin`, `/live`
- **Configuration**: Uses Clerk v5 API with `clerkMiddleware`

### 2. Supabase Data Storage (Secondary)
- **Purpose**: Data persistence and content management
- **Stores**: User profiles, video metadata, channel data, chat messages, analytics
- **Authentication**: None - relies on Clerk user IDs for data association

### 3. Integration Layer
- **File**: `lib/clerk-supabase-sync.ts`
- **Purpose**: Synchronizes Clerk users with Supabase user profiles
- **Functions**:
  - `syncClerkUserToSupabase()` - Creates/updates user profiles
  - `getSupabaseUserProfile()` - Retrieves user data by Clerk ID
  - `validateUserOwnership()` - Ensures data belongs to authenticated user

## Implementation Details

### Middleware (`middleware.ts`)
```typescript
export default clerkMiddleware((auth, req) => {
  // Public routes (no auth required)
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protected routes (require Clerk auth)
  if (isProtectedRoute(req)) {
    auth().protect();
  }

  return NextResponse.next();
});
```

### Webhook Integration (`app/api/webhooks/clerk/route.ts`)
- **Purpose**: Automatically sync Clerk user events with Supabase
- **Events Handled**:
  - `user.created` - Creates user profile in Supabase
  - `user.updated` - Updates user profile in Supabase
  - `user.deleted` - Handles user deletion (implement as needed)

### Data Flow
1. User authenticates via Clerk (sign-in/sign-up)
2. Clerk webhook triggers user sync to Supabase
3. Application uses Clerk for auth state, Supabase for data
4. All data operations include `clerk_user_id` for ownership validation

## User Synchronization Options

### Option 1: Automatic Sync (With Webhooks)
**Best for production environments**
- Set up Clerk webhook pointing to `/api/webhooks/clerk`
- Users are automatically synced when they sign up or update profiles
- Requires `CLERK_WEBHOOK_SECRET` environment variable

### Option 2: Manual Sync (No Webhooks)
**Works without webhook setup**
- Users are synced when they first access protected content
- Uses `/api/sync-user` endpoint called from client components
- No additional configuration required

## Configuration Required

### Environment Variables (Minimum)
```bash
# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase Data Storage (Required)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Webhooks (Optional - only if using automatic sync)
CLERK_WEBHOOK_SECRET=whsec_...
```

### Supabase Schema
All data tables should include:
```sql
-- User profiles table
CREATE TABLE user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Example content table
CREATE TABLE videos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT NOT NULL REFERENCES user_profiles(clerk_user_id),
  title TEXT NOT NULL,
  -- other video fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Security Benefits
1. **Single Source of Truth**: Clerk manages all authentication logic
2. **No Auth Duplication**: Eliminates potential sync issues between auth systems
3. **Centralized Security**: Clerk handles MFA, password policies, etc.
4. **Data Isolation**: Each user's data is isolated by `clerk_user_id`

## Migration Notes
- Existing Supabase auth should be disabled
- All `useUser()` calls should use Clerk's `useUser` hook
- Data queries should filter by `clerk_user_id` from Clerk context
- Remove Supabase auth middleware and session management

## Usage Examples

### Manual User Sync (No Webhooks)
```typescript
import { useUser } from '@clerk/nextjs';
import { useUserSync } from '@/lib/user-sync-client';

export function UserProfile() {
  const { user } = useUser();
  const userSynced = useUserSync(user); // Auto-sync on component mount
  
  // Only fetch data after user is synced
  const { data } = useSWR(
    user && userSynced ? `/api/user-data?clerk_user_id=${user.id}` : null,
    fetcher
  );
}
```

### Manual Sync in Component
```typescript
import { useUser } from '@clerk/nextjs';
import { ensureUserSyncedAPI } from '@/lib/user-sync-client';

export function UserDashboard() {
  const { user } = useUser();
  const [userReady, setUserReady] = useState(false);

  useEffect(() => {
    if (user) {
      ensureUserSyncedAPI(user).then(() => {
        setUserReady(true);
      });
    }
  }, [user]);

  if (!userReady) return <div>Setting up your profile...</div>;
  // Render dashboard content
}
```

### Client-side Data Fetching
```typescript
import { useUser } from '@clerk/nextjs';

export function UserProfile() {
  const { user } = useUser();
  
  // Fetch user's data from Supabase using Clerk user ID
  const { data } = useSWR(
    user ? `/api/user-data?clerk_user_id=${user.id}` : null,
    fetcher
  );
}
```

### Server-side Data Operations
```typescript
import { auth } from '@clerk/nextjs';
import { createSupabaseClientForClerkUser } from '@/lib/clerk-supabase-sync';

export async function getUserVideos() {
  const { userId } = auth();
  if (!userId) throw new Error('Unauthorized');
  
  const { supabase } = createSupabaseClientForClerkUser(userId);
  return supabase.from('videos').select('*').eq('clerk_user_id', userId);
}
```