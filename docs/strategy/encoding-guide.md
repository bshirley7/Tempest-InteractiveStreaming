# Video Encoding Guide for xCast Platform

## 🎯 Why Re-encode Videos?

Re-encoding your videos can provide:
- **50-80% file size reduction** without noticeable quality loss
- **Faster loading times** and less buffering
- **Better compatibility** across devices
- **Adaptive streaming** with multiple quality levels

## 📊 Recommended Encoding Settings

### **Standard Web Streaming Profile**
```bash
# Single quality encode (recommended for most content)
ffmpeg -i input.mp4 \
  -c:v libx264 \              # H.264 codec (best compatibility)
  -preset medium \            # Balance between speed and compression
  -crf 23 \                   # Quality (18-28, lower = better)
  -maxrate 2000k \           # Max bitrate 2Mbps
  -bufsize 4000k \           # Buffer size
  -c:a aac \                 # AAC audio codec
  -b:a 128k \                # Audio bitrate
  -movflags +faststart \     # Web optimization
  output.mp4
```

### **Multi-Quality Encoding** (for adaptive streaming)

| Quality | Resolution | Video Bitrate | Audio Bitrate | Use Case |
|---------|------------|---------------|---------------|----------|
| 1080p   | 1920x1080  | 2500kbps     | 192kbps      | High-speed internet |
| 720p    | 1280x720   | 1500kbps     | 128kbps      | Standard streaming |
| 480p    | 854x480    | 800kbps      | 96kbps       | Mobile/slow internet |
| 360p    | 640x360    | 400kbps      | 64kbps       | Very slow connections |

## 🚀 Quick Start

### **Option 1: Batch Encode All Videos**
```bash
# Run the provided script
./scripts/batch-encode-videos.sh
```

This will:
- Process all videos in your content folders
- Create multiple quality versions
- Preserve metadata files
- Show space savings

### **Option 2: Encode Individual Video**
```bash
# High quality for lectures/tutorials
ffmpeg -i input.mp4 -c:v libx264 -preset slow -crf 22 -c:a aac -b:a 128k -movflags +faststart output.mp4

# Medium quality for general content  
ffmpeg -i input.mp4 -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k -movflags +faststart output.mp4

# Low quality for long videos
ffmpeg -i input.mp4 -c:v libx264 -preset fast -crf 25 -c:a aac -b:a 96k -movflags +faststart output.mp4
```

## 📈 Encoding Strategy by Content Type

### **Educational Content** (lectures, tutorials)
- **Priority**: Clear visuals and audio
- **Settings**: CRF 22-23, higher bitrate
- **Resolution**: Maintain original if possible

### **Entertainment** (shows, events)
- **Priority**: Smooth playback
- **Settings**: CRF 23-24, medium bitrate
- **Resolution**: 720p minimum

### **Background/Ambient** (music, nature)
- **Priority**: Small file size
- **Settings**: CRF 24-26, lower bitrate
- **Resolution**: 480p-720p acceptable

## 🔧 Advanced Optimizations

### **Two-Pass Encoding** (best quality/size ratio)
```bash
# First pass
ffmpeg -i input.mp4 -c:v libx264 -preset slow -b:v 2000k -pass 1 -an -f null /dev/null

# Second pass
ffmpeg -i input.mp4 -c:v libx264 -preset slow -b:v 2000k -pass 2 -c:a aac -b:a 128k output.mp4
```

### **Hardware Acceleration** (if available)
```bash
# NVIDIA GPU encoding
ffmpeg -hwaccel cuda -i input.mp4 -c:v h264_nvenc -preset slow -crf 23 -c:a copy output.mp4

# Intel QuickSync
ffmpeg -hwaccel qsv -i input.mp4 -c:v h264_qsv -preset slow -crf 23 -c:a copy output.mp4
```

## 📊 Before/After Comparison

Typical results from re-encoding:

| Original | Encoded | Savings | Quality Impact |
|----------|---------|---------|----------------|
| 500MB    | 150MB   | 70%     | Minimal        |
| 1GB      | 250MB   | 75%     | Minimal        |
| 2GB      | 400MB   | 80%     | Very slight    |

## ⚡ Performance Tips

1. **Use the script** for batch processing
2. **Test different CRF values** (22-25 range)
3. **Consider your audience's internet speed**
4. **Keep originals** as backup
5. **Monitor playback** after encoding

## 🎯 Recommended Workflow

1. **Backup originals**
   ```bash
   cp -r public/content public/content-backup
   ```

2. **Run batch encoding**
   ```bash
   ./scripts/batch-encode-videos.sh
   ```

3. **Test playback** in the app

4. **Replace if satisfied**
   ```bash
   mv public/content public/content-old
   mv public/content-encoded public/content
   ```

## 🔍 Checking Results

```bash
# Compare file sizes
du -sh public/content-backup/* | sort -h
du -sh public/content-encoded/* | sort -h

# Check video properties
ffprobe -v error -show_format -show_streams video.mp4
```

## 💡 Pro Tips

- **CRF 23** is the sweet spot for most content
- **Preset "medium"** balances speed and quality
- **Two-pass encoding** for critical content
- **Keep one high-quality master** for future needs
- **Test on slowest target device** first

The batch encoding script will handle everything automatically and show you the space savings. Most users see 60-80% reduction in file sizes with minimal quality loss!