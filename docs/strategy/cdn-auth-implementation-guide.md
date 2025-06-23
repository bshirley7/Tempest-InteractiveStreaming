# CDN & Authentication Implementation Guide for xCast

## Table of Contents
1. [Overview](#overview)
2. [CDN Implementation](#cdn-implementation)
3. [Authentication Implementation](#authentication-implementation)
4. [Integration Strategy](#integration-strategy)
5. [Timeline & Milestones](#timeline--milestones)

---

## Overview

### Project Goals
- **Optimize video delivery** with adaptive bitrate streaming for varying network conditions
- **Implement user authentication** for personalized experiences and data collection
- **Enable rate limiting** to protect CDN resources and manage costs
- **Enhance ad targeting** through user profile data collection
- **Improve user engagement** with seamless onboarding and viewing experience

### Expected Outcomes
- YouTube-like adaptive video quality switching
- Reduced buffering and improved playback performance
- Rich user profiles for targeted advertising
- Secure, rate-limited content delivery
- Enhanced analytics and user insights
- Scalable infrastructure ready for growth

---

## CDN Implementation

### Goal
Transform static video file serving into dynamic, adaptive streaming that automatically adjusts quality based on user bandwidth, similar to YouTube, Netflix, and other major platforms.

### Strategy: Cloudflare Stream

#### Why Cloudflare Stream?
- **Automatic transcoding**: Converts videos to multiple resolutions/bitrates
- **Built-in player**: HLS/DASH support with quality switching
- **Cost-effective**: $5 per 1,000 minutes watched (not stored)
- **Integration**: Works seamlessly with existing Cloudflare setup
- **Analytics**: Built-in video analytics dashboard

#### Implementation Structure

##### 1. Video Upload Pipeline
```javascript
// app/api/upload/route.ts
import { Stream } from '@cloudflare/stream-react';

export async function POST(request: Request) {
  const formData = await request.formData();
  const video = formData.get('video') as File;
  
  // Upload to Cloudflare Stream
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/stream`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STREAM_API_TOKEN}`,
      },
      body: formData,
    }
  );
  
  const { result } = await response.json();
  
  // Store video metadata in Convex
  await convex.mutation(api.content.addVideo, {
    streamId: result.uid,
    title: formData.get('title'),
    duration: result.duration,
    thumbnail: result.thumbnail,
    status: result.status,
  });
  
  return NextResponse.json({ streamId: result.uid });
}
```

##### 2. Video Player Component
```typescript
// components/video/StreamPlayer.tsx
import Stream from '@cloudflare/stream-react';

export function StreamPlayer({ streamId, userId }: StreamPlayerProps) {
  const { getToken } = useAuth();
  
  // Generate signed URL with user context
  const signedUrl = useSignedStreamUrl(streamId, userId);
  
  return (
    <Stream
      src={streamId}
      controls
      autoplay={false}
      muted={false}
      responsive={true}
      letterbox={true}
      primaryColor="#9333ea"
      posterTimestamp={10}
      onPlay={() => trackEvent('video_play', { streamId, userId })}
      onPause={() => trackEvent('video_pause', { streamId, userId })}
      onEnded={() => trackEvent('video_complete', { streamId, userId })}
      onError={(e) => trackEvent('video_error', { streamId, error: e })}
    />
  );
}
```

##### 3. Quality Settings
```typescript
// lib/stream-config.ts
export const STREAM_PROFILES = {
  // Cloudflare Stream automatically generates these
  '240p': { width: 426, height: 240, bitrate: '400k' },
  '360p': { width: 640, height: 360, bitrate: '800k' },
  '480p': { width: 854, height: 480, bitrate: '1400k' },
  '720p': { width: 1280, height: 720, bitrate: '2800k' },
  '1080p': { width: 1920, height: 1080, bitrate: '5000k' },
};
```

### Alternative: DIY HLS Implementation

If Cloudflare Stream is too expensive, implement your own HLS:

#### Conversion Script
```bash
#!/bin/bash
# scripts/convert-to-hls.sh

INPUT=$1
OUTPUT_DIR=$2
FILENAME=$(basename "$INPUT" .mp4)

mkdir -p "$OUTPUT_DIR/$FILENAME"

# Generate multiple quality versions
ffmpeg -i "$INPUT" \
  -filter_complex "[0:v]split=3[v1][v2][v3]; \
  [v1]scale=w=640:h=360[v1out]; \
  [v2]scale=w=854:h=480[v2out]; \
  [v3]scale=w=1280:h=720[v3out]" \
  -map "[v1out]" -c:v:0 libx264 -b:v:0 800k \
  -map "[v2out]" -c:v:1 libx264 -b:v:1 1400k \
  -map "[v3out]" -c:v:2 libx264 -b:v:2 2800k \
  -map a:0 -map a:0 -map a:0 -c:a aac -b:a:0 96k -b:a:1 128k -b:a:2 192k \
  -f hls \
  -hls_time 6 \
  -hls_playlist_type vod \
  -hls_flags independent_segments \
  -hls_segment_type mpegts \
  -hls_segment_filename "$OUTPUT_DIR/$FILENAME/stream_%v/segment_%03d.ts" \
  -master_pl_name master.m3u8 \
  -var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2" \
  "$OUTPUT_DIR/$FILENAME/stream_%v/playlist.m3u8"

# Generate thumbnail
ffmpeg -i "$INPUT" -ss 00:00:10 -vframes 1 "$OUTPUT_DIR/$FILENAME/thumbnail.jpg"
```

### Expectations

#### Performance Metrics
- **Initial load time**: < 3 seconds
- **Quality switch time**: < 2 seconds
- **Buffering ratio**: < 1%
- **Playback success rate**: > 99%

#### Cost Projections
```
Cloudflare Stream:
- 1,000 users × 2 hours/month = 2,000 hours
- 2,000 hours = 120,000 minutes
- Cost: 120 × $5 = $600/month

Cloudflare R2 (DIY):
- Storage: 100GB = $1.50/month
- Bandwidth: Unlimited (free)
- Processing: Your server costs
```

---

## Authentication Implementation

### Goal
Implement a robust authentication system that enables personalized experiences, secure content access, and rich user profiling for enhanced ad targeting.

### Strategy: Clerk Authentication

#### Why Clerk?
- **Easy integration**: Drop-in React components
- **Social logins**: Google, GitHub, Discord support
- **User metadata**: Store custom profile data
- **Webhooks**: Sync with your database
- **Security**: SOC 2 compliant, built-in 2FA

#### Implementation Structure

##### 1. Initial Setup
```bash
npm install @clerk/nextjs
```

```typescript
// app/layout.tsx
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#9333ea',
          colorBackground: '#18181b',
        },
      }}
    >
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  )
}
```

##### 2. User Onboarding Flow
```typescript
// app/onboarding/page.tsx
import { useUser } from '@clerk/nextjs'
import { useState } from 'react'

export default function OnboardingPage() {
  const { user } = useUser()
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState({
    interests: [],
    campus: '',
    major: '',
    yearOfStudy: '',
    contentPreferences: [],
    adConsent: false,
  })

  const steps = [
    <InterestsSelector onSelect={(interests) => 
      setProfile(prev => ({ ...prev, interests }))} />,
    <CampusInfoForm onSubmit={(info) => 
      setProfile(prev => ({ ...prev, ...info }))} />,
    <ContentPreferences onSelect={(prefs) => 
      setProfile(prev => ({ ...prev, contentPreferences: prefs }))} />,
    <PrivacySettings onConsent={(consent) => 
      setProfile(prev => ({ ...prev, adConsent: consent }))} />,
  ]

  const completeOnboarding = async () => {
    // Update Clerk user metadata
    await user.update({
      publicMetadata: {
        ...profile,
        onboardingCompleted: true,
        onboardingDate: new Date().toISOString(),
      }
    })

    // Sync with Convex
    await convex.mutation(api.users.createProfile, {
      clerkId: user.id,
      ...profile,
    })

    router.push('/tv-guide')
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="max-w-2xl w-full p-8">
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`h-2 flex-1 mx-1 rounded-full ${
                  i <= step 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                    : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>
        </div>

        {steps[step - 1]}

        <div className="flex justify-between mt-8">
          {step > 1 && (
            <button onClick={() => setStep(step - 1)}>
              Previous
            </button>
          )}
          {step < 4 ? (
            <button onClick={() => setStep(step + 1)}>
              Next
            </button>
          ) : (
            <button onClick={completeOnboarding}>
              Complete Setup
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

##### 3. Protected Routes & Rate Limiting
```typescript
// middleware.ts
import { authMiddleware, redirectToSignIn } from '@clerk/nextjs'
import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'

export default authMiddleware({
  publicRoutes: ['/', '/vod', '/tv-guide'],
  
  async afterAuth(auth, req) {
    // Handle unauthenticated users
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url })
    }

    // Check rate limits for video endpoints
    if (req.url.includes('/api/stream/')) {
      const identifier = auth.userId || req.ip
      const { success, remaining } = await rateLimit.check(identifier)
      
      if (!success) {
        return NextResponse.json(
          { error: 'Rate limit exceeded' },
          { 
            status: 429,
            headers: {
              'X-RateLimit-Remaining': remaining.toString(),
              'Retry-After': '3600',
            }
          }
        )
      }
    }

    // Check if user needs onboarding
    if (auth.userId) {
      const user = await clerkClient.users.getUser(auth.userId)
      if (!user.publicMetadata.onboardingCompleted && 
          !req.url.includes('/onboarding')) {
        return NextResponse.redirect(new URL('/onboarding', req.url))
      }
    }

    return NextResponse.next()
  },
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
```

##### 4. User Data Collection & Ad Targeting
```typescript
// lib/user-targeting.ts
import { currentUser } from '@clerk/nextjs'

export interface UserTargetingProfile {
  demographics: {
    ageGroup?: string
    campus?: string
    major?: string
    yearOfStudy?: string
  }
  interests: string[]
  behavior: {
    viewingHistory: ViewingRecord[]
    avgWatchTime: number
    preferredGenres: string[]
    activeHours: number[]
    deviceTypes: string[]
  }
  engagement: {
    adClickRate: number
    contentCompletionRate: number
    shareRate: number
    commentRate: number
  }
}

export async function getUserTargetingProfile(): Promise<UserTargetingProfile> {
  const user = await currentUser()
  if (!user) throw new Error('No user found')

  // Get user metadata from Clerk
  const metadata = user.publicMetadata as UserMetadata

  // Get behavioral data from Convex
  const viewingData = await convex.query(api.analytics.getUserViewingData, {
    userId: user.id,
  })

  // Calculate targeting metrics
  const profile: UserTargetingProfile = {
    demographics: {
      ageGroup: calculateAgeGroup(user.birthday),
      campus: metadata.campus,
      major: metadata.major,
      yearOfStudy: metadata.yearOfStudy,
    },
    interests: metadata.interests || [],
    behavior: {
      viewingHistory: viewingData.history,
      avgWatchTime: viewingData.avgWatchTime,
      preferredGenres: analyzeGenres(viewingData.history),
      activeHours: analyzeActiveHours(viewingData.sessions),
      deviceTypes: viewingData.devices,
    },
    engagement: {
      adClickRate: viewingData.adClicks / viewingData.adImpressions,
      contentCompletionRate: viewingData.completedVideos / viewingData.startedVideos,
      shareRate: viewingData.shares / viewingData.views,
      commentRate: viewingData.comments / viewingData.views,
    },
  }

  return profile
}
```

##### 5. Enhanced Ad Selection
```typescript
// lib/ad-targeting.ts
export async function selectTargetedAd(
  userId: string,
  contentContext: ContentContext
): Promise<Ad> {
  const profile = await getUserTargetingProfile()
  
  // Score ads based on user profile
  const ads = await getAvailableAds()
  const scoredAds = ads.map(ad => ({
    ad,
    score: calculateAdScore(ad, profile, contentContext),
  }))
  
  // Sort by score and return best match
  scoredAds.sort((a, b) => b.score - a.score)
  
  // Track ad impression
  await trackAdImpression({
    userId,
    adId: scoredAds[0].ad.id,
    targetingScore: scoredAds[0].score,
    context: contentContext,
  })
  
  return scoredAds[0].ad
}

function calculateAdScore(
  ad: Ad, 
  profile: UserTargetingProfile,
  context: ContentContext
): number {
  let score = 0
  
  // Interest matching (40% weight)
  const interestMatch = ad.targetInterests.filter(i => 
    profile.interests.includes(i)
  ).length
  score += (interestMatch / ad.targetInterests.length) * 40
  
  // Demographic matching (30% weight)
  if (ad.targetCampus?.includes(profile.demographics.campus)) score += 10
  if (ad.targetMajor?.includes(profile.demographics.major)) score += 10
  if (ad.targetYear?.includes(profile.demographics.yearOfStudy)) score += 10
  
  // Behavioral matching (20% weight)
  if (profile.behavior.avgWatchTime > 300 && ad.type === 'long-form') score += 10
  if (profile.behavior.preferredGenres.includes(context.genre)) score += 10
  
  // Engagement history (10% weight)
  if (profile.engagement.adClickRate > 0.05) score += 10
  
  return score
}
```

### Expectations

#### User Experience
- **Onboarding completion rate**: > 80%
- **Sign-up to first video**: < 3 minutes
- **Profile data completeness**: > 70%
- **Return user rate**: > 60%

#### Security & Performance
- **Authentication time**: < 500ms
- **Token refresh**: Automatic & seamless
- **Rate limit accuracy**: 99.9%
- **Zero security breaches**

---

## Integration Strategy

### Phase 1: Authentication (Week 1)
1. **Day 1-2**: Clerk setup & basic auth flow
2. **Day 3-4**: Onboarding UI & user metadata
3. **Day 5-6**: Protected routes & middleware
4. **Day 7**: Testing & refinement

### Phase 2: CDN Migration (Week 2)
1. **Day 1-2**: Cloudflare Stream account & API setup
2. **Day 3-4**: Video upload pipeline
3. **Day 5-6**: Player integration & quality switching
4. **Day 7**: Performance testing

### Phase 3: Integration & Optimization (Week 3)
1. **Day 1-2**: Signed URLs & rate limiting
2. **Day 3-4**: Analytics & tracking
3. **Day 5-6**: Ad targeting optimization
4. **Day 7**: Load testing & optimization

### Database Schema Updates

```typescript
// convex/schema.ts additions
export default defineSchema({
  // ... existing schema ...
  
  userProfiles: defineTable({
    clerkId: v.string(),
    interests: v.array(v.string()),
    campus: v.string(),
    major: v.string(),
    yearOfStudy: v.string(),
    contentPreferences: v.array(v.string()),
    adConsent: v.boolean(),
    onboardingCompleted: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerkId", ["clerkId"]),
    
  viewingSessions: defineTable({
    userId: v.string(),
    contentId: v.id("content"),
    streamId: v.string(),
    startTime: v.number(),
    endTime: v.optional(v.number()),
    watchDuration: v.number(),
    qualityChanges: v.array(v.object({
      timestamp: v.number(),
      from: v.string(),
      to: v.string(),
    })),
    bufferingEvents: v.array(v.object({
      timestamp: v.number(),
      duration: v.number(),
    })),
    device: v.string(),
    browser: v.string(),
    ipHash: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_content", ["contentId"])
    .index("by_time", ["startTime"]),
    
  adImpressions: defineTable({
    userId: v.string(),
    adId: v.string(),
    contentId: v.id("content"),
    timestamp: v.number(),
    targetingScore: v.number(),
    shown: v.boolean(),
    clicked: v.boolean(),
    watchTime: v.number(),
    context: v.object({
      genre: v.string(),
      timeOfDay: v.string(),
      dayOfWeek: v.string(),
    }),
  })
    .index("by_user", ["userId"])
    .index("by_ad", ["adId"])
    .index("by_time", ["timestamp"]),
})
```

---

## Timeline & Milestones

### Week 1: Foundation
- [ ] Clerk account setup
- [ ] Basic authentication flow
- [ ] User onboarding UI
- [ ] Protected routes implementation
- [ ] User metadata storage

### Week 2: CDN Implementation
- [ ] Cloudflare Stream setup
- [ ] Video upload pipeline
- [ ] Player integration
- [ ] Quality switching tests
- [ ] Performance benchmarks

### Week 3: Integration
- [ ] Signed URL generation
- [ ] Rate limiting implementation
- [ ] Analytics integration
- [ ] Ad targeting algorithm
- [ ] A/B testing setup

### Week 4: Optimization
- [ ] Performance tuning
- [ ] Cost optimization
- [ ] Security audit
- [ ] Documentation
- [ ] Launch preparation

### Success Metrics

#### Technical KPIs
- Page load time: < 2 seconds
- Video start time: < 3 seconds
- Auth response time: < 500ms
- API response time: < 200ms
- Uptime: > 99.9%

#### Business KPIs
- User sign-up rate: > 30%
- Onboarding completion: > 80%
- Ad CTR improvement: > 50%
- User retention: > 60%
- Cost per user: < $0.10/month

### Cost Breakdown

#### Monthly Estimates (1000 Users)
```
Clerk Authentication:
- Free tier: 5,000 MAU
- Cost: $0

Cloudflare Stream:
- 2 hours/user/month = 2,000 hours
- 120,000 minutes @ $5/1000min = $600
- Alternative: R2 Storage = ~$10

Convex Database:
- Free tier likely sufficient
- Cost: $0

Total: $600-610/month (or $10 with DIY HLS)
```

### Risk Mitigation

1. **CDN Costs**: Monitor usage closely, implement strict rate limits
2. **Authentication Issues**: Have fallback anonymous viewing
3. **Performance**: Implement caching at every level
4. **Security**: Regular audits, penetration testing
5. **Scalability**: Design for 10x growth from day one

---

## Next Steps

1. **Create Clerk account** at clerk.com
2. **Set up Cloudflare Stream** trial
3. **Review this guide** with your team
4. **Create implementation tickets** in your project management tool
5. **Begin Phase 1** implementation

This guide should be treated as a living document and updated as you learn more about your users and their needs.