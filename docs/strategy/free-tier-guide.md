# Free Tier Guide for xCast Demo

## 🎉 Cloudflare R2 Free Tier

### What You Get FREE:
- **10 GB storage** per month
- **1 million requests** per month  
- **UNLIMITED bandwidth** (egress) - This is HUGE!

### For Your Demo:
- 10 GB = ~5 hours of 2Mbps video
- 1M requests = ~10,000 unique viewers
- Unlimited streaming = No bandwidth costs ever!

### Real Numbers:
```
Your "How to Record" video: 54MB
10 GB free tier = ~185 similar videos
or ~92 hours of content at 2Mbps
```

## 📊 Free Tier Breakdown by Service

### Cloudflare (BEST for demos):
| Feature | Free Tier | Your Demo Needs | Fits? |
|---------|-----------|-----------------|-------|
| Storage | 10 GB/month | ~5-10 GB | ✅ YES |
| Bandwidth | UNLIMITED | Any amount | ✅ YES |
| Requests | 1M/month | ~50K | ✅ YES |
| **Total Cost** | **$0** | | **FREE!** |

### AWS S3 + CloudFront:
| Feature | Free Tier | Your Demo Needs | Fits? |
|---------|-----------|-----------------|-------|
| S3 Storage | 5 GB (12 months) | ~5-10 GB | ⚠️ Close |
| CloudFront | 1 TB (12 months) | ~500 GB | ✅ YES |
| Requests | 2M (12 months) | ~50K | ✅ YES |
| **After 12 months** | **~$90/month** | | ❌ Expensive |

### Bunny CDN:
| Feature | Free Tier | Your Demo Needs | Fits? |
|---------|-----------|-----------------|-------|
| Storage | None | ~5-10 GB | ❌ NO |
| Bandwidth | None | ~500 GB | ❌ NO |
| **Minimum** | **$10** | | 💰 Cheap but not free |

## 🚀 Maximizing Free Tier for Demo

### 1. **Video Optimization Strategy**
```bash
# Keep best quality under 10GB total
# Example allocation:
- 2 hours per channel × 6 channels = 12 hours
- At 2Mbps = ~1.8 GB per hour
- 12 hours × 1.8 GB = ~22 GB

# Solution: Use 1.5 Mbps for demo
- 12 hours × 1.35 GB = ~16 GB
- Or: 8 hours at 2Mbps = ~14 GB
```

### 2. **Smart Content Selection**
```
Channel 1: Campus Pulse - 2 hours best content
Channel 2: Career Compass - 2 hours key videos  
Channel 3: How To Hub - 1.5 hours tutorials
Channel 4: Study Break - 1.5 hours highlights
Channel 5: Wellness Wave - 1 hour meditation
Channel 6: World Explorer - 2 hours travel

Total: 10 hours @ 2Mbps = ~18GB
With 1.5Mbps encoding = ~13.5GB (close to free tier)
```

### 3. **Demo Day Strategy**
```javascript
// For hackathon demo, upload only what you'll show
const DEMO_VIDEOS = {
  'campus-pulse': ['welcome-week.mp4', 'campus-tour.mp4'],
  'career-compass': ['interview-tips.mp4', 'resume-guide.mp4'],
  'how-to-hub': ['recording-tutorial.mp4'],
  // ... just key videos for each channel
}
// Total: ~5GB - Well within free tier!
```

## 💡 Free Tier Hacks

### 1. **Multiple Buckets**
```bash
# Create multiple R2 buckets (each gets 10GB free)
xcast-videos-1  # First 10GB
xcast-videos-2  # Next 10GB
# Note: Slightly more complex URL management
```

### 2. **Rotation Strategy**
```javascript
// Upload new content, remove old
// Stay under 10GB by rotating content
const MAX_SIZE_GB = 9.5 // Leave buffer
```

### 3. **Compress for Demo**
```bash
# 1.5 Mbps instead of 2 Mbps for demo
# 25% more content in same space
ffmpeg -i input.mp4 -b:v 1500k -b:a 128k output.mp4
```

## 📈 When You'll Need to Pay

### Scenario 1: Growing Popular
- 1,000 daily users × 1 hour viewing = 1 TB/month bandwidth
- Cloudflare R2: Still $0 (free bandwidth!)
- AWS: ~$85/month
- Your server without CDN: 💥 Crashed

### Scenario 2: More Content  
- 50 GB storage (25 hours @ 2Mbps)
- Cloudflare R2: $0.60/month (just storage overage)
- AWS S3: $1.15/month + bandwidth costs

### Scenario 3: Going Viral
- 10,000 concurrent viewers
- Cloudflare R2: $0 bandwidth + minimal storage
- AWS: ~$850/month bandwidth
- Your server: ☠️

## 🎯 Demo Day Optimization

### Pre-Demo Checklist:
```bash
# 1. Upload only demo content (5GB max)
rclone copy demo-videos/ r2:xcast-demo/content

# 2. Test all channels
for channel in campus-pulse career-compass how-to-hub; do
  echo "Testing $channel..."
  curl -I https://your-bucket.r2.dev/content/$channel/test.mp4
done

# 3. Warm up CDN cache
# Visit each video URL once to cache at edge
```

### Demo Script Videos:
```
Opening: campus-pulse/welcome-week.mp4 (2 min)
Feature 1: how-to-hub/tutorial.mp4 (3 min)
Feature 2: career-compass/tips.mp4 (2 min)
Live Chat: wellness-wave/meditation.mp4 (5 min)
Closing: world-explorer/highlights.mp4 (2 min)

Total: 14 minutes of content = ~250MB
```

## 🏆 Hackathon Judge Impressions

**Without CDN:**
"The streaming is a bit slow..."
"It's buffering for me..."
"Crashed when we all tried to watch"

**With CDN (Free Tier):**
"Wow, instant loading!"
"Smooth streaming, nice!"
"Handles our whole judging panel perfectly"

## 💰 Post-Demo Costs

If your demo is successful and you want to continue:

### Small Scale (100 users/day):
- Cloudflare R2: ~$2/month
- AWS: ~$50/month
- Bunny: ~$10/month

### Medium Scale (1,000 users/day):
- Cloudflare R2: ~$5/month  
- AWS: ~$200/month
- Bunny: ~$30/month

### The R2 Advantage:
**FREE BANDWIDTH means costs barely increase with users!**

## ✅ Action Plan for Free Demo

1. **Calculate your content size**
   ```bash
   du -sh public/content/*
   # Pick best videos totaling <10GB
   ```

2. **Sign up for Cloudflare** (free, no credit card)

3. **Create R2 bucket**

4. **Upload demo videos only**
   ```bash
   # Just upload what you need for demo
   rclone copy public/content/campus-pulse/welcome-week.mp4 r2:xcast/content/campus-pulse/
   # ... repeat for demo videos
   ```

5. **Update .env.local**
   ```env
   NEXT_PUBLIC_CDN_URL=https://pub-xxxxx.r2.dev
   ```

6. **Demo with confidence!**

You'll have professional-grade streaming that rivals Netflix/YouTube, completely FREE for your hackathon demo! 🚀