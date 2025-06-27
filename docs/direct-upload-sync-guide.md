# Direct Cloudflare Upload Sync Guide

This guide ensures videos uploaded directly to Cloudflare Stream sync properly to Supabase.

## 🔧 **Fixed Issues**

### Table/Column Mismatch (RESOLVED)
- **Problem**: Sync system was looking in `videos` table but writing to `content` table
- **Solution**: Updated all sync functions to use `content` table with `cloudflare_video_id` column
- **Status**: ✅ Fixed

## 📋 **Sync Process for Direct Uploads**

### 1. Upload Video to Cloudflare Stream
- Upload directly through Cloudflare dashboard
- Wait for video to reach "Ready" status
- Note: Videos in "Pending Upload" will be skipped by sync

### 2. Sync to Supabase (Multiple Options)

#### Option A: Admin Dashboard (Recommended)
1. Go to admin sync dashboard
2. Click "Force Sync Ready Videos" button
3. System will automatically:
   - Find all ready videos not in Supabase
   - Create entries in `content` table
   - Assign to default channel
   - Show success/failure counts

#### Option B: API Call
```javascript
fetch('/api/content-library/force-sync', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ sync_all_ready: true })
}).then(r => r.json()).then(console.log);
```

#### Option C: Script (Requires Auth)
```bash
node scripts/force-sync-direct-uploads.js
```

### 3. Verify Sync Status
- Use "Refresh Status" button in sync dashboard
- Check that "Missing in Supabase" count is 0
- Verify videos appear in content management

## 🎯 **Expected Behavior After Upload**

1. **Upload to Cloudflare**: Video shows "Processing" → "Ready"
2. **Run Sync**: Force sync finds new ready videos
3. **Create in Supabase**: Video appears in `content` table with:
   - `cloudflare_video_id`: Cloudflare Stream ID
   - `title`: From video metadata name
   - `channel_id`: Default channel (auto-created if needed)
   - `created_at`: Current timestamp
   - `is_published`: Default value

## 🔍 **Troubleshooting**

### Video Not Syncing
1. **Check Status**: Video must be "Ready" in Cloudflare (not "Pending Upload")
2. **Check Logs**: Browser console shows sync API responses
3. **Manual Check**: Use sync verify API to see specific video status

### No Default Channel
- System auto-creates "General Content" channel if none exist
- Uses existing active channel if available

### Permission Issues
- Ensure user has admin access
- Check Clerk user ID is in admin list or has admin role in Supabase

## 📊 **Sync Dashboard Features**

### Buttons Available
- **Delete Stuck Videos**: Removes videos stuck in "Pending Upload" >1 hour
- **Force Sync Ready Videos**: Syncs all ready videos missing from Supabase  
- **Refresh Status**: Updates sync report
- **Auto-Sync to Supabase**: Repairs specific missing videos

### Status Cards
- **Sync Health**: Percentage of videos properly synced
- **Synced Videos**: Count of videos in both systems
- **Missing in Supabase**: Videos in Cloudflare only
- **Orphaned Records**: Records in Supabase only

## 🛠 **For Developers**

### Key Files Fixed
- `lib/content-library-sync.ts`: Uses `content` table, `cloudflare_video_id` column
- `app/api/content-library/force-sync/route.ts`: Matches table structure
- `app/api/stream/sync-verify/route.ts`: Verification system
- `components/admin/sync-dashboard.tsx`: UI with all sync tools

### Database Schema
```sql
-- Content table structure
content (
  id SERIAL PRIMARY KEY,
  cloudflare_video_id TEXT, -- Cloudflare Stream UID
  title TEXT,
  description TEXT,
  channel_id INTEGER REFERENCES channels(id),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  -- ... other fields
)
```

## ✅ **Testing Steps**

1. Upload video directly to Cloudflare Stream
2. Wait for "Ready" status
3. Go to admin sync dashboard
4. Click "Force Sync Ready Videos"
5. Verify video appears in content management
6. Check sync health shows 100%

## 🎉 **Expected Results**

After following this process:
- All ready videos from Cloudflare appear in Supabase
- Sync dashboard shows 100% health
- Content management shows all videos
- Videos are properly assigned to channels
- Metadata is preserved from Cloudflare