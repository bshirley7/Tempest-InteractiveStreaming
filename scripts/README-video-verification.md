# Video ID Verification Scripts

This directory contains several scripts for querying, verifying, and managing Cloudflare video IDs stored in the database.

## Available Scripts

### 1. `verify-video-ids.js` - Comprehensive Video ID Verification
**Command:** `npm run verify:videos`

This script provides the most comprehensive verification of Cloudflare video IDs:

- ✅ Queries all videos from the database with detailed information
- ✅ Shows Cloudflare video IDs, titles, channels, sync status, and publication status
- ✅ Verifies video IDs against Cloudflare Stream API (if credentials are available)
- ✅ Identifies missing videos and orphaned videos
- ✅ Provides summary statistics and easy-to-copy video ID list

**Features:**
- Database video listing with full metadata
- Cross-verification with Cloudflare Stream
- Orphaned video detection
- Missing video identification
- Summary statistics
- Color-coded output for easy reading

### 2. `query-video-ids.js` - Simple Database Query
**Command:** `npm run query:videos`

A lightweight script for quick database queries:

**Usage Options:**
```bash
npm run query:videos                    # Show all videos with details
npm run query:videos -- --published-only # Show only published videos
npm run query:videos -- --ids-only      # Show only video IDs
npm run query:videos -- --help          # Show help
```

**Features:**
- Fast database-only queries (no external API calls)
- Filtering options for published videos
- IDs-only mode for easy copying
- Summary statistics
- Channel breakdown

### 3. `test-content-api.js` - Content API Testing
**Command:** `npm run test:content`

Tests the content API endpoint that serves video data to the frontend:

- ✅ Tests the `/api/content` endpoint
- ✅ Shows published videos as they appear to users
- ✅ Includes channel information and metadata
- ✅ Provides content count and summary

### 4. `verify-setup.js` - Database Setup Verification
**Command:** `npm run verify:setup`

Comprehensive database verification script:

- ✅ Verifies all database tables exist
- ✅ Shows content counts for all tables
- ✅ Displays sample videos and channels
- ✅ Checks for admin users
- ✅ Provides setup status and next steps

## Database Schema Reference

The `content` table contains the following key fields for video management:

```sql
CREATE TABLE public.content (
  id UUID PRIMARY KEY,
  title TEXT NOT NULL,
  cloudflare_video_id TEXT UNIQUE NOT NULL,  -- The Cloudflare Stream video ID
  channel_id UUID REFERENCES channels(id),
  duration INTEGER,
  is_published BOOLEAN DEFAULT false,
  sync_status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  -- ... other fields
);
```

## Quick Reference Commands

```bash
# View all video IDs with full details
npm run verify:videos

# Quick database query - all videos
npm run query:videos

# Quick database query - published only
npm run query:videos -- --published-only

# Quick database query - just the IDs
npm run query:videos -- --ids-only

# Test the content API
npm run test:content

# Verify entire database setup
npm run verify:setup

# Sync missing videos from Cloudflare Stream
npm run sync:simple
```

## Understanding Video States

### Sync Status
- **`synced`** ✅ - Video successfully synced from Cloudflare Stream
- **`pending`** ⏳ - Video waiting to be synced
- **`error`** ❌ - Sync failed for this video

### Publication Status
- **`is_published: true`** 🟢 - Video is visible to users
- **`is_published: false`** 🔴 - Video is hidden from users

### Verification Results
- **Exists in Cloudflare** ✅ - Video ID found in both database and Cloudflare Stream
- **Missing from Cloudflare** ❌ - Video ID in database but not found in Cloudflare Stream
- **Orphaned in Cloudflare** ⚠️ - Video exists in Cloudflare Stream but not in database

## Troubleshooting

### Common Issues

1. **"Missing Supabase environment variables"**
   - Check your `.env.local` file contains `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

2. **"Content table does not exist"**
   - Run `npm run db:setup` to create the database tables

3. **"No videos found in database"**
   - Run `npm run sync:simple` to sync videos from Cloudflare Stream

4. **"Missing Cloudflare credentials"**
   - Add `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` to `.env.local` for full verification

### Required Environment Variables

```env
# Required for database access
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional for Cloudflare verification
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
```

## Script Dependencies

All scripts use:
- `dotenv` for environment variable loading
- `@supabase/supabase-js` for database queries
- Built-in Node.js `https` module for API calls (no external fetch dependencies)

## Output Examples

### Video ID List (from verify-video-ids.js)
```
🎯 Cloudflare Video IDs in Database:

1. Introduction to React Hooks
   📺 Video ID: a1b2c3d4e5f6g7h8i9j0
   📋 Database ID: 123e4567-e89b-12d3-a456-426614174000
   📺 Channel: Campus Pulse
   ⏱️  Duration: 15:30
   🟢 Published: true
   ✅ Sync Status: synced
   📅 Created: Dec 22, 2024
```

### Simple Query (from query-video-ids.js)
```
📋 Cloudflare Video IDs:
1. a1b2c3d4e5f6g7h8i9j0
2. b2c3d4e5f6g7h8i9j0k1
3. c3d4e5f6g7h8i9j0k1l2
```

This comprehensive set of scripts provides everything needed to verify, query, and manage Cloudflare video IDs in your database.