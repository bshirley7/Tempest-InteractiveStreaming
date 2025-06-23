# Step 03: Create Environment Variables

## Context
You are building Temptest, an interactive streaming platform. This step creates the environment variables file that will store all API keys and configuration needed for external services.

## Prerequisites
- Step 02 completed successfully
- You are in the `temptest` project directory

## Task
Create the `.env.local` file with all required environment variables for Temptest services.

## Exact File to Create

Create `.env.local` in the root directory with this exact content:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
CLERK_ADMIN_USER_ID=

# Cloudflare Configuration
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=

# Cloudflare R2 Storage
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=temptest-media
CLOUDFLARE_R2_PUBLIC_URL=
CLOUDFLARE_R2_ENDPOINT=

# Cloudflare Stream
CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN=
NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN=

# Sentry Error Tracking
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Feature Flags
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ADS=true
```

## Environment Variable Explanations

### Supabase Variables
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Server-side service role key

### Clerk Variables
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Public Clerk key
- `CLERK_SECRET_KEY` - Private Clerk key
- URL configurations for sign-in/sign-up flows

### Cloudflare Variables
- R2 storage credentials for video files
- Stream configuration for video delivery
- Account and API credentials

### Sentry Variables
- Error tracking and monitoring configuration

## File Creation Command
```bash
touch .env.local
```

Then copy the content above into the file.

## Important Notes
1. **DO NOT** commit this file to version control
2. All empty values must be filled by the user with their actual API keys
3. The `NEXT_PUBLIC_` prefix makes variables available to the browser
4. Variables without this prefix are server-side only

## Update .gitignore
Ensure `.env.local` is in your `.gitignore` (should already be there by default):

```gitignore
# Local env files
.env*.local
```

## Verification Steps
1. Confirm `.env.local` file exists in project root
2. Confirm file contains all required variables
3. Confirm `.env.local` is listed in `.gitignore`

## Success Criteria
- `.env.local` file created with all variables
- File structure matches exactly
- Ready for user to populate with actual values

## Next Step
After completing this step, proceed to Step 04: Configure Next.js Settings.