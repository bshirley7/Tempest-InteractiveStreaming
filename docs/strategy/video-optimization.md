# Video Streaming Optimization Guide

## 🎥 Video File Optimization

### **1. Pre-Processing Videos (Recommended)**

Before adding videos to your channels, optimize them for web streaming:

```bash
# Install FFmpeg if not already installed
# Ubuntu/Debian: sudo apt-get install ffmpeg
# macOS: brew install ffmpeg
# Windows: Download from https://ffmpeg.org/download.html

# Optimize video for web streaming
ffmpeg -i input.mp4 -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -movflags +faststart output.mp4

# Create multiple quality versions
# 720p version
ffmpeg -i input.mp4 -c:v libx264 -preset fast -crf 23 -vf scale=-2:720 -c:a aac -b:a 128k -movflags +faststart output_720p.mp4

# 480p version
ffmpeg -i input.mp4 -c:v libx264 -preset fast -crf 23 -vf scale=-2:480 -c:a aac -b:a 96k -movflags +faststart output_480p.mp4

# 360p version (for poor connections)
ffmpeg -i input.mp4 -c:v libx264 -preset fast -crf 23 -vf scale=-2:360 -c:a aac -b:a 64k -movflags +faststart output_360p.mp4
```

### **2. Key Optimizations Explained**

- **`-movflags +faststart`**: Moves metadata to the beginning of the file for faster streaming start
- **`-c:v libx264`**: Uses H.264 codec for best compatibility
- **`-preset fast`**: Balances encoding speed and file size
- **`-crf 23`**: Constant Rate Factor (18-28 range, lower = better quality)

## 🚀 Server-Side Solutions

### **Option 1: Use a CDN (Recommended for Production)**

1. **Cloudflare R2 + CDN**
   - Upload videos to Cloudflare R2 (S3-compatible)
   - Serve through Cloudflare CDN for global distribution
   - Automatic caching and optimization

2. **AWS S3 + CloudFront**
   - Store videos in S3
   - Distribute via CloudFront CDN
   - Supports adaptive bitrate streaming

3. **Bunny CDN**
   - Simple video hosting solution
   - Built-in video optimization
   - Global edge servers

### **Option 2: Local Optimization (Development)**

For local development, consider:

1. **Nginx as Reverse Proxy**
   ```nginx
   location /content/ {
     # Enable caching
     add_header Cache-Control "public, max-age=31536000";
     
     # Enable range requests for better seeking
     add_header Accept-Ranges bytes;
     
     # Gzip compression for metadata
     gzip on;
     gzip_types application/json text/plain;
   }
   ```

2. **Express.js Static Server with Range Support**
   ```javascript
   app.use('/content', express.static('public/content', {
     setHeaders: (res, path) => {
       res.set('Accept-Ranges', 'bytes');
       res.set('Cache-Control', 'public, max-age=31536000');
     }
   }));
   ```

## 💻 Client-Side Optimizations

### **1. Preloading Strategy**
- Preload only metadata initially
- Start loading full video when user hovers/clicks
- Buffer ahead based on connection speed

### **2. Quality Adaptation**
- Detect user's connection speed
- Switch between quality levels dynamically
- Provide manual quality selection

### **3. Browser Optimizations**
- Use `playsinline` for mobile devices
- Start videos muted for autoplay compatibility
- Implement intersection observer to pause off-screen videos

## 🔧 Quick Fixes for Current Setup

1. **Reduce Video Bitrate**
   ```bash
   # Quick optimization for existing videos
   for file in public/content/*/*.mp4; do
     ffmpeg -i "$file" -c:v libx264 -b:v 1000k -c:a aac -b:a 128k -movflags +faststart "${file%.mp4}_optimized.mp4"
   done
   ```

2. **Enable Browser Caching**
   Add to `next.config.js`:
   ```javascript
   module.exports = {
     async headers() {
       return [
         {
           source: '/content/:path*',
           headers: [
             {
               key: 'Cache-Control',
               value: 'public, max-age=31536000, immutable',
             },
           ],
         },
       ];
     },
   };
   ```

3. **Implement Progressive Loading**
   - Load thumbnail first
   - Show loading state
   - Gradually load video

## 📊 Performance Monitoring

Track these metrics:
- Time to First Frame (TTFF)
- Buffering ratio
- Average bitrate delivered
- Rebuffering events

Use browser DevTools Network tab to identify bottlenecks.