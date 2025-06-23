# Content Library Sync Guide

## Overview

Your Cloudflare Stream videos were "orphaned" because they existed in Cloudflare but weren't connected to your Supabase content library. This guide explains how to sync them and keep your content organized.

## The Problem

- **Cloudflare Stream**: Stores and streams your videos
- **Supabase Database**: Manages video metadata, channels, and organization
- **The Gap**: Videos in Cloudflare weren't linked to your content management system

## The Solution

I've created a **Content Library Sync System** that:

1. **Fetches all videos** from Cloudflare Stream
2. **Imports them** into your Supabase content library  
3. **Organizes them** by channels (defaults to "Explore" channel)
4. **Preserves metadata** like titles, descriptions, tags, and custom fields
5. **Tracks sync status** to prevent duplicates

## How to Use

### Step 1: Access Admin Panel
- Log in as an admin user
- Navigate to `/admin` page
- Look for the "Content Library Sync" section

### Step 2: Check Current Status
- Click **"Check Status"** to see:
  - How many videos are in Cloudflare Stream
  - How many are imported to your library  
  - How many are missing

### Step 3: Run the Sync
- Click **"Sync Now"** to import all missing videos
- The system will:
  - Create new video records for unimported videos
  - Update existing records if metadata changed
  - Skip videos that are already synced
  - Report any errors

### Step 4: View Results
After sync completes, you'll see:
- **Created**: New videos added to library
- **Updated**: Existing videos with updated metadata
- **Skipped**: Videos already in sync
- **Errors**: Any videos that failed to import

## API Endpoints

### Get Sync Status
```bash
GET /api/content-library/sync
```
Returns current sync status and statistics.

### Trigger Sync
```bash
POST /api/content-library/sync
Content-Type: application/json

{
  "force": false
}
```
Starts a content library sync operation.

## What Gets Synced

### Basic Video Data
- **Title**: From Cloudflare video name
- **Description**: From custom metadata
- **Duration**: Video length in seconds
- **Thumbnail**: Cloudflare thumbnail URL
- **Preview**: Cloudflare preview URL

### Custom Metadata
- **Category/Genre**: For content organization
- **Tags**: Extracted from keywords and categories
- **Educational Fields**: Instructor, difficulty level, learning objectives
- **Language**: Content language

### Channel Assignment
- Videos are assigned to the **"Explore"** channel by default
- You can move them to different channels after import
- Future enhancement: Auto-assign based on video metadata

## Database Schema

Videos are stored in the `videos` table with this structure:

```sql
videos (
  id                    UUID PRIMARY KEY
  title                 TEXT NOT NULL
  description           TEXT
  channel_id            UUID REFERENCES channels(id)
  cloudflare_stream_id  TEXT UNIQUE -- Links to Cloudflare
  thumbnail_url         TEXT
  preview_url           TEXT
  duration              INTEGER -- seconds
  tags                  TEXT[] -- searchable tags
  metadata              JSONB -- custom fields
  published_at          TIMESTAMP
  created_at            TIMESTAMP
  updated_at            TIMESTAMP
)
```

## Best Practices

### Regular Syncing
- Run sync after uploading new videos to Cloudflare
- Check status periodically to catch any drift
- Set up automated syncing for production environments

### Content Organization
- After sync, organize videos into appropriate channels
- Add meaningful descriptions and tags
- Set proper publication dates for scheduling

### Monitoring
- Monitor sync errors and resolve Cloudflare API issues
- Keep track of orphaned videos (in library but not in Cloudflare)
- Regularly backup your content library data

## Troubleshooting

### Common Issues

**"No active channels found"**
- Create at least one channel in your database first
- Default channels should be: Campus Life, Explore, Create, Chill

**"Cloudflare Stream not configured"**
- Check environment variables:
  - `CLOUDFLARE_ACCOUNT_ID`
  - `CLOUDFLARE_STREAM_API_TOKEN`
  - `CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN`

**"Admin access required"**
- Ensure your user has `role = 'admin'` in the users table
- Sync your user profile first using `/api/sync-user`

**Videos not appearing in library**
- Check if videos are published (`published_at` is set)
- Verify channel assignment is correct
- Look for errors in sync results

### Error Resolution

1. **API Rate Limits**: Cloudflare has rate limits - sync will retry automatically
2. **Database Errors**: Check Supabase connection and table schema
3. **Permission Errors**: Verify admin role and authentication

## Manual Sync (No Admin UI)

If you need to trigger sync programmatically:

```javascript
// Check status
const status = await fetch('/api/content-library/sync');
const statusData = await status.json();

// Run sync
const sync = await fetch('/api/content-library/sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ force: false })
});
const syncData = await sync.json();
```

## Next Steps

1. **Run your first sync** to import existing videos
2. **Organize content** by moving videos to appropriate channels  
3. **Set up regular syncing** for new uploads
4. **Enhance metadata** with descriptions, tags, and custom fields
5. **Monitor performance** and adjust sync frequency as needed

Your content library should now be fully connected to your Cloudflare Stream videos! 🎉