# Step 03: Create Environment Variables

## Context
You are building Tempest, an interactive streaming platform. This step creates the environment configuration file with all required variables for external services.

## Purpose
Environment variables configure connections to Clerk (auth), Supabase (database), Cloudflare (video/storage), and Sentry (monitoring). Missing or incorrect values will cause runtime failures.

## Prerequisites
- Step 02 completed successfully
- You are in the `tempest` project directory
- You have access to service dashboards (or will use placeholder values)

## Task Instructions
Complete each task in order and mark as ✅ when finished:

### Task 1: Create Environment File ⏳

**EXACT COMMAND:**
```bash
# Create .env.local file
touch .env.local
```

**⚠️ CRITICAL**: Use `.env.local` NOT `.env` for Next.js

### Task 2: Add Complete Environment Variables ⏳

**COPY THIS ENTIRE BLOCK EXACTLY into .env.local:**
```bash
# =============================================================================
# TEMPEST STREAMING PLATFORM - ENVIRONMENT VARIABLES
# =============================================================================

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
CLERK_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
CLERK_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Clerk URLs (automatic routing)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Database URL (from Supabase)
DATABASE_URL=postgresql://postgres:XXXXXXXXXXXX@db.xxxxxxxxxxxxxxxxxxxx.supabase.co:5432/postgres

# Cloudflare Configuration
CLOUDFLARE_ACCOUNT_ID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
CLOUDFLARE_API_TOKEN=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
CLOUDFLARE_ZONE_ID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN=customer-xxxxxxxxxxxxx

# Cloudflare R2 Storage
CLOUDFLARE_R2_ACCESS_KEY_ID=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
CLOUDFLARE_R2_SECRET_ACCESS_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
CLOUDFLARE_R2_BUCKET_NAME=tempest-storage
CLOUDFLARE_R2_PUBLIC_URL=https://pub-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.r2.dev

# Sentry Configuration
SENTRY_DSN=https://XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX@XXXXXXXXXXXX.ingest.sentry.io/XXXXXXXXXXXXX
SENTRY_ORG=tempest
SENTRY_PROJECT=tempest-streaming
SENTRY_AUTH_TOKEN=sntrys_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NEXT_PUBLIC_SENTRY_DSN=https://XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX@XXXXXXXXXXXX.ingest.sentry.io/XXXXXXXXXXXXX

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Tempest
NODE_ENV=development

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_OVERLAYS=true
NEXT_PUBLIC_ENABLE_ADS=false
NEXT_PUBLIC_ENABLE_DEBUG=true

# Development Specific
NEXT_PUBLIC_DEV_MODE=true
ENABLE_MOCK_DATA=true
```

### Task 3: Update .gitignore ⏳

**VERIFY these lines exist in .gitignore:**
```bash
# Check if .env.local is already ignored
grep -n ".env.local" .gitignore

# If not found, add it
echo "
# Environment variables
.env.local
.env.production.local
.env.development.local
.env.test.local
" >> .gitignore
```

### Task 4: Create Environment Template ⏳

**CREATE .env.example for documentation:**
```bash
# Copy without sensitive values
cp .env.local .env.example

# Open .env.example and replace all values with placeholders
echo "# Copy this file to .env.local and fill in your values

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=your_database_url

# Cloudflare Configuration
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN=your_subdomain

# Sentry Configuration
SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_SENTRY_DSN=your_public_sentry_dsn

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development" > .env.example
```

### Task 5: Verify Environment Loading ⏳

**CREATE test file to verify env vars:**
```bash
# Create test file
echo "// Test environment variables loading
console.log('Environment Check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('Clerk Key exists:', !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
console.log('Supabase URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Cloudflare configured:', !!process.env.CLOUDFLARE_ACCOUNT_ID);
console.log('Sentry configured:', !!process.env.SENTRY_DSN);" > test-env.js

# Run test
node test-env.js

# Clean up
rm test-env.js
```

## Task Completion Checklist
Mark each task as complete:

- [ ] Task 1: .env.local file created ✅
- [ ] Task 2: All environment variables added ✅
- [ ] Task 3: .gitignore updated ✅
- [ ] Task 4: .env.example template created ✅
- [ ] Task 5: Environment loading verified ✅

## Critical Environment Variables

**THESE MUST BE SET (even with placeholder values):**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`

**WITHOUT THESE, THE APP WILL NOT START**

## Service Configuration Notes

### Clerk Setup
1. Sign up at https://clerk.com
2. Create new application
3. Copy keys from dashboard
4. Set webhook endpoint later

### Supabase Setup
1. Sign up at https://supabase.com
2. Create new project
3. Copy URL and keys from Settings > API
4. Database URL from Settings > Database

### Cloudflare Setup (Optional for MVP)
1. Sign up at https://cloudflare.com
2. Get Account ID from dashboard
3. Create API token with Stream permissions
4. Can use placeholder values initially

### Sentry Setup (Optional for MVP)
1. Sign up at https://sentry.io
2. Create new project (Next.js)
3. Copy DSN from project settings
4. Can use placeholder values initially

## Common Issues & Solutions

**Issue**: Environment variables not loading
**Solution**: Restart dev server after changing .env.local

**Issue**: "Missing publishable key" error
**Solution**: Ensure variable names start with `NEXT_PUBLIC_` for client-side access

**Issue**: Build fails with env errors
**Solution**: Check for typos in variable names, they are case-sensitive

## Success Criteria
- .env.local file exists with all variables
- .env.example exists as template
- .gitignore includes .env.local
- No sensitive data in .env.example
- Test confirms variables are accessible

## Next Step
After all tasks show ✅, proceed to Step 04: Configure Next.js Settings