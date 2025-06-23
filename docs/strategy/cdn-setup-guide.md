# CDN Setup Guide for xCast Platform

## 🚀 Option 1: Cloudflare R2 (Recommended - Easiest & Cheapest)

### Why R2?
- **$0.015 per GB stored** per month
- **FREE egress** (no bandwidth charges!)
- **Automatic CDN** included
- **5-minute setup**

### Quick Setup Steps:

1. **Create Cloudflare Account** (free)
   - Go to [cloudflare.com](https://cloudflare.com)
   - Sign up for free account

2. **Enable R2 Storage**
   ```bash
   # In Cloudflare Dashboard:
   # → R2 → Create Bucket
   # Name: "xcast-videos"
   # Location: Automatic
   ```

3. **Upload Your Videos**
   ```bash
   # Option A: Use Cloudflare Dashboard (drag & drop)
   # Option B: Use rclone for bulk upload
   
   # Install rclone
   brew install rclone  # macOS
   # or
   sudo apt install rclone  # Linux
   
   # Configure rclone
   rclone config
   # Choose "s3" → "Cloudflare R2" → Enter your credentials
   
   # Upload all videos
   rclone copy public/content r2:xcast-videos/content -P
   ```

4. **Enable Public Access**
   ```bash
   # In R2 Dashboard:
   # → Settings → Public Access
   # → Add custom domain: cdn.yourdomain.com
   # → OR use provided domain: xcast-videos.r2.dev
   ```

5. **Update Your Code** (One Line Change!)
   ```typescript
   // Before:
   videoUrl: `/content/${channel}/${filename}`
   
   // After:
   videoUrl: `https://cdn.yourdomain.com/content/${channel}/${filename}`
   ```

**That's it! Your videos are now served from 300+ global locations!**

---

## 🎯 Option 2: Bunny CDN (Also Super Easy)

### Why Bunny?
- **$0.01 per GB** bandwidth
- **$0.005 per GB** storage
- **Built for video streaming**
- **5-minute setup**

### Setup:
1. **Sign up** at [bunny.net](https://bunny.net) ($10 minimum credit)
2. **Create Storage Zone** → Choose regions
3. **Upload videos** via FTP or web panel
4. **Get your URL**: `https://yourzone.b-cdn.net/content/...`

---

## 🔧 Option 3: AWS CloudFront + S3

### Why AWS?
- **Most features**
- **Complex pricing** (~$0.085 per GB)
- **More setup steps**

### Setup:
1. Create S3 bucket
2. Upload videos
3. Create CloudFront distribution
4. Point to S3 bucket
5. Wait 15-30 minutes for deployment

---

## 💰 Cost Comparison (Monthly)

For 1TB storage + 5TB bandwidth:

| Provider | Storage | Bandwidth | Total | Notes |
|----------|---------|-----------|-------|-------|
| **Cloudflare R2** | $15 | $0 | **$15** | FREE bandwidth! |
| **Bunny CDN** | $5 | $50 | **$55** | Great performance |
| **AWS CloudFront** | $23 | $425 | **$448** | Enterprise features |

---

## 🚀 Fastest Setup (Cloudflare R2 in 5 Minutes)

### Step-by-Step with Screenshots:

1. **Create Cloudflare Account**
   - Email + Password
   - Verify email

2. **Go to R2**
   - Click "R2" in sidebar
   - Click "Create bucket"
   - Name: `xcast-videos`

3. **Upload a Test Video**
   - Click bucket name
   - Click "Upload"
   - Drag your video file
   - Wait for upload

4. **Make it Public**
   - Settings → Public Access
   - Allow public access
   - Copy the URL

5. **Test in Your App**
   ```typescript
   // components/video/LiveVideoPlayer.tsx
   const CDN_URL = "https://pub-xxxxx.r2.dev"  // Your R2 URL
   
   // Change this line:
   video.src = `${CDN_URL}${liveContent.videoUrl}`
   ```

---

## ⚡ Quick Migration Script

```bash
#!/bin/bash
# migrate-to-cdn.sh

# Install rclone if needed
which rclone || brew install rclone

# Configure (run once)
echo "Setting up Cloudflare R2..."
rclone config

# Upload all videos
echo "Uploading videos to CDN..."
rclone copy public/content r2:xcast-videos/content \
  --progress \
  --transfers 10 \
  --checkers 20

echo "✅ Done! Videos are now on CDN"
```

---

## 🎯 Environment Variables Setup

```env
# .env.local
NEXT_PUBLIC_CDN_URL=https://your-bucket.r2.dev
# or
NEXT_PUBLIC_CDN_URL=https://cdn.yourdomain.com
```

```typescript
// lib/constants.ts
export const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL || ''

// Use everywhere:
const videoUrl = `${CDN_URL}/content/${channel}/${filename}`
```

---

## 📊 Before vs After CDN

### Without CDN:
- Videos served from your Next.js server
- Limited to server location
- Server handles all traffic
- Slower for distant users

### With CDN:
- Videos served from nearest edge location
- 300+ global locations
- CDN handles traffic
- Fast for everyone

---

## ✅ CDN Checklist

- [ ] Choose provider (R2 recommended)
- [ ] Create account
- [ ] Create bucket/storage
- [ ] Upload test video
- [ ] Update video URLs in code
- [ ] Test playback
- [ ] Upload all videos
- [ ] Update environment variables

**Time to complete: 15-30 minutes**

---

## 🚨 Common Issues & Solutions

### Issue: CORS errors
```javascript
// Solution: Configure CORS in CDN
{
  "AllowedOrigins": ["*"],
  "AllowedMethods": ["GET", "HEAD"],
  "AllowedHeaders": ["*"]
}
```

### Issue: Slow initial upload
```bash
# Solution: Upload in parallel
rclone copy public/content r2:xcast-videos/content \
  --transfers 20 \
  --checkers 40
```

### Issue: Videos not playing
```typescript
// Solution: Check URL format
console.log('Video URL:', videoUrl)  // Debug URL
// Should be: https://cdn.../content/channel/video.mp4
```

---

## 🎉 That's It!

Seriously, it's that simple. Cloudflare R2 is the easiest:
1. Sign up (2 min)
2. Create bucket (1 min)
3. Upload videos (depends on size)
4. Update one line of code (1 min)

Your videos will load **3-5x faster** for users worldwide!