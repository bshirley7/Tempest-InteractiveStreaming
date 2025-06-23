# Streaming Optimization Guide for xCast

## 🎯 Target: 2Mbps Video Streams

### Adobe Media Encoder Settings for 2Mbps:
```
Video Codec: H.264
Profile: High
Level: 4.0
Bitrate: 2000 kbps (CBR or VBR 2-pass)
Max Bitrate: 2500 kbps
Buffer Size: 4000 kbps
Keyframe Interval: 2 seconds
Audio: AAC 128kbps, 44.1kHz
```

## 🚀 Platform Optimizations

### 1. **Video Preloading Strategy**
- Preload next video when current is 80% complete
- Use hidden video element to buffer ahead
- Seamless transitions between programs

### 2. **Adaptive Buffer Management**
```javascript
// Monitor buffer health
if (bufferSize < 5 seconds) {
  // Poor connection - reduce quality
} else if (bufferSize < 15 seconds) {
  // Medium connection - maintain quality
} else {
  // Good connection - optimal quality
}
```

### 3. **CDN Implementation**
```javascript
// Use Cloudflare R2 + CDN
const VIDEO_CDN_URL = "https://cdn.xcast.example.com"

// Serve videos from CDN instead of local
videoUrl: `${VIDEO_CDN_URL}/content/${channel}/${filename}`
```

### 4. **HTTP/2 Server Push**
```nginx
# Nginx config for HTTP/2 push
location /watch {
    http2_push /content/manifest.json;
    http2_push /content/thumbnail.jpg;
    http2_push_preload on;
}
```

### 5. **Service Worker Caching**
```javascript
// Cache video segments
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/content/')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(response => {
          return caches.open('video-cache').then(cache => {
            cache.put(event.request, response.clone());
            return response;
          });
        });
      })
    );
  }
});
```

### 6. **Lazy Loading with Intersection Observer**
```javascript
// Only load videos when visible
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const video = entry.target;
      video.src = video.dataset.src;
      observer.unobserve(video);
    }
  });
});
```

### 7. **WebRTC for Ultra-Low Latency**
```javascript
// For live events - WebRTC streaming
const pc = new RTCPeerConnection({
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
});

// Add video track
const stream = await navigator.mediaDevices.getUserMedia({ video: true });
stream.getTracks().forEach(track => pc.addTrack(track, stream));
```

### 8. **Progressive Enhancement**
```javascript
// Start with poster image
<video poster="/thumbnails/video-poster.jpg">
  
// Load low-quality preview on hover
onMouseEnter={() => loadPreview('360p')}

// Load full quality on play
onPlay={() => loadFullQuality('2mbps')}
```

### 9. **Bandwidth Detection**
```javascript
// Measure connection speed
async function measureBandwidth() {
  const startTime = Date.now();
  const response = await fetch('/test-file-1mb.bin');
  const data = await response.blob();
  const endTime = Date.now();
  
  const duration = (endTime - startTime) / 1000; // seconds
  const bitsLoaded = data.size * 8;
  const speedBps = bitsLoaded / duration;
  const speedMbps = speedBps / (1024 * 1024);
  
  return speedMbps;
}
```

### 10. **Smart Chunking**
```bash
# Split videos into 6-second chunks for streaming
ffmpeg -i input.mp4 -c copy -map 0 -segment_time 6 -f segment output%03d.mp4
```

## 📊 Performance Metrics to Monitor

1. **Time to First Frame (TTFF)**
   - Target: < 2 seconds
   - Measure: Video element 'loadeddata' event

2. **Rebuffering Ratio**
   - Target: < 1%
   - Measure: Time spent buffering / Total watch time

3. **Startup Failure Rate**
   - Target: < 0.5%
   - Measure: Video error events

4. **Average Bitrate Delivered**
   - Target: 1.8-2.0 Mbps
   - Measure: Bytes downloaded / Time

## 🛠️ Implementation Priority

1. **Immediate** (Big Impact, Easy):
   - Video preloading for next program
   - Buffer health monitoring
   - Connection quality indicators

2. **Short-term** (Big Impact, Medium Effort):
   - CDN integration (Cloudflare R2)
   - Service Worker caching
   - Bandwidth detection

3. **Long-term** (Advanced Features):
   - WebRTC for live events
   - HLS/DASH adaptive streaming
   - Multi-CDN failover

## 💡 Quick Wins for 2Mbps Streams

1. **Optimize Keyframe Interval**
   ```bash
   # 2-second keyframes for faster seeking
   -g 60 -keyint_min 60 -sc_threshold 0
   ```

2. **Enable Fast Start**
   ```bash
   -movflags +faststart
   ```

3. **Use x264 Presets**
   ```bash
   # Slower preset = better compression
   -preset slow -tune film
   ```

4. **Two-Pass Encoding**
   ```bash
   # First pass
   -pass 1 -b:v 2000k -f null /dev/null
   # Second pass
   -pass 2 -b:v 2000k output.mp4
   ```

## 🎥 Adobe Media Encoder Export Settings

### Preset: "Web - 1080p HD (2Mbps)"
- Format: H.264
- Preset: Match Source - High bitrate
- Output:
  - Width: 1920 (or source)
  - Height: 1080 (or source)
  - Frame Rate: Match source
- Video:
  - Bitrate Encoding: VBR, 2 Pass
  - Target Bitrate: 2 Mbps
  - Maximum Bitrate: 2.5 Mbps
  - Key Frame Distance: 60 frames
- Audio:
  - Format: AAC
  - Bitrate: 128 kbps
  - Sample Rate: 44.1 kHz

This configuration ensures consistent quality while staying within your 2Mbps target!