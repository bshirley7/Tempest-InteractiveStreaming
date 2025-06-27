# Advertising System Technical Guide

## API Documentation

### Authentication

All admin API endpoints require authentication and admin/faculty role permissions. The system uses service role authentication for elevated database operations.

```typescript
// Example authenticated request
const response = await fetch('/api/admin/ad-videos', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${userToken}`,
    'Content-Type': 'application/json'
  }
});
```

### Ad Videos API (`/api/admin/ad-videos`)

#### GET - List Ad Videos
Retrieve paginated list of ad videos with filtering options.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `search` (string): Search in title, description, advertiser
- `campaign_id` (uuid): Filter by campaign
- `is_active` (boolean): Filter by active status
- `approval_status` (string): pending, approved, rejected

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Spring Campaign Video",
      "cloudflare_video_id": "cf_video_id",
      "duration": 30,
      "approval_status": "approved",
      "campaign": {
        "id": "uuid",
        "name": "Spring Semester"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "total": 50,
    "hasNext": true
  }
}
```

#### POST - Create Ad Video
Upload new ad video with metadata.

**Request Body:**
```json
{
  "title": "New Ad Video",
  "description": "Video description",
  "cloudflare_video_id": "cf_video_id",
  "thumbnail_url": "https://...",
  "duration": 30,
  "advertiser_name": "University Marketing",
  "campaign_id": "uuid"
}
```

#### PUT - Update Ad Video
Update existing ad video metadata.

#### DELETE - Remove Ad Video
Delete ad video (only if not used in active placements).

### Ad Campaigns API (`/api/admin/ad-campaigns`)

#### GET - List Campaigns
Retrieve campaigns with computed status and filtering.

**Query Parameters:**
- `status` (string): upcoming, active, ended
- Standard pagination and search parameters

#### POST - Create Campaign
Create new advertising campaign.

**Request Body:**
```json
{
  "name": "Spring Semester Campaign",
  "advertiser_name": "University Marketing",
  "start_date": "2024-01-01T00:00:00Z",
  "end_date": "2024-06-01T00:00:00Z",
  "budget_limit": 5000.00,
  "daily_budget_limit": 100.00,
  "target_audience": {
    "demographics": ["students", "faculty"]
  },
  "targeting_rules": {
    "channels": ["academic", "events"]
  }
}
```

### Ad Overlay Assets API (`/api/admin/ad-overlay-assets`)

#### POST - Upload Overlay Asset
Upload image overlay to Cloudflare R2.

**Request Body:**
```json
{
  "name": "Campaign Overlay",
  "cloudflare_r2_url": "https://r2.example.com/image.png",
  "cloudflare_r2_key": "overlays/campaign-1.png",
  "file_type": "image/png",
  "file_size": 245760,
  "dimensions": {
    "width": 1920,
    "height": 1080
  },
  "alt_text": "Spring campaign promotional overlay"
}
```

### Ad Placements API (`/api/admin/ad-placements`)

#### POST - Create Placement
Configure ad placement with targeting and scheduling.

**Request Body:**
```json
{
  "name": "Homepage Pre-roll",
  "ad_video_id": "uuid",
  "campaign_id": "uuid",
  "overlay_asset_id": "uuid",
  "placement_type": "pre_roll",
  "target_type": "global",
  "ad_copy": "Discover new courses this semester!",
  "call_to_action": "Learn More",
  "click_url": "https://university.edu/courses",
  "display_duration": 30,
  "skip_after_seconds": 5,
  "priority": 10,
  "frequency_cap": 3,
  "weight": 5
}
```

### Ad Serving API (`/api/ads/serve`)

#### GET - Request Ads
Public API for video players to request appropriate ads.

**Query Parameters:**
- `content_id` (uuid): Content being played
- `channel_id` (uuid): Channel being watched
- `placement_type` (string): pre_roll, mid_roll, end_roll
- `user_id` (string): Clerk user ID (optional)
- `session_id` (string): Tracking session
- `limit` (number): Maximum ads to return

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "placement_id": "uuid",
      "ad_video": {
        "id": "uuid",
        "cloudflare_video_id": "cf_id"
      },
      "overlay": {
        "id": "uuid",
        "url": "https://r2.example.com/overlay.png"
      },
      "content": {
        "ad_copy": "Join us this semester!",
        "call_to_action": "Register Now",
        "click_url": "https://university.edu/register"
      },
      "settings": {
        "display_duration": 30,
        "skip_after_seconds": 5
      },
      "tracking": {
        "session_id": "session_123",
        "placement_type": "pre_roll"
      }
    }
  ]
}
```

#### POST - Record Analytics
Track ad events and user interactions.

**Request Body:**
```json
{
  "placement_id": "uuid",
  "event_type": "impression",
  "user_id": "user_123",
  "content_id": "uuid",
  "session_id": "session_123",
  "watch_time_seconds": 25,
  "event_data": {
    "video_position": 0,
    "user_agent": "Mozilla/5.0..."
  }
}
```

## Database Functions

### get_applicable_ads()
Server-side function for efficient ad selection.

```sql
SELECT * FROM get_applicable_ads(
  p_content_id := 'uuid',
  p_channel_id := 'uuid', 
  p_placement_type := 'pre_roll',
  p_user_id := 'user_123'
);
```

**Returns:**
- `placement_id`: Placement identifier
- `ad_video_id`: Video to play
- `cloudflare_video_id`: Cloudflare Stream ID
- `overlay_asset_id`: Overlay image ID
- `overlay_url`: Direct R2 URL
- `ad_copy`: Text content
- `display_duration`: Overlay duration
- `priority`: Selection priority
- `weight`: Random selection weight

### record_ad_analytics()
Function to record analytics and update counters.

```sql
SELECT record_ad_analytics(
  p_placement_id := 'uuid',
  p_event_type := 'impression',
  p_user_id := 'user_123',
  p_content_id := 'uuid',
  p_session_id := 'session_123'
);
```

**Side Effects:**
- Inserts analytics record
- Updates frequency tracking
- Increments placement counters
- Updates campaign metrics

## Video Player Integration

### React Hook Example

```typescript
import { useEffect, useState } from 'react';

interface AdData {
  placement_id: string;
  ad_video: { cloudflare_video_id: string };
  overlay?: { url: string };
  content: {
    ad_copy?: string;
    call_to_action?: string;
    click_url?: string;
  };
  settings: {
    display_duration: number;
    skip_after_seconds: number;
  };
}

export function useAdServing(contentId: string, channelId: string) {
  const [preRollAds, setPreRollAds] = useState<AdData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAds = async (placementType: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        content_id: contentId,
        channel_id: channelId,
        placement_type: placementType,
        session_id: generateSessionId()
      });

      const response = await fetch(`/api/ads/serve?${params}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      return [];
    } catch (error) {
      console.error('Error fetching ads:', error);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const recordEvent = async (
    placementId: string, 
    eventType: string, 
    additionalData = {}
  ) => {
    try {
      await fetch('/api/ads/serve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placement_id: placementId,
          event_type: eventType,
          content_id: contentId,
          channel_id: channelId,
          ...additionalData
        })
      });
    } catch (error) {
      console.error('Error recording ad event:', error);
    }
  };

  return {
    fetchAds,
    recordEvent,
    loading
  };
}
```

### Ad Player Component

```typescript
import { useState, useEffect } from 'react';
import { useAdServing } from './use-ad-serving';

interface AdPlayerProps {
  contentId: string;
  channelId: string;
  onAdComplete: () => void;
  onAdSkip: () => void;
}

export function AdPlayer({ 
  contentId, 
  channelId, 
  onAdComplete, 
  onAdSkip 
}: AdPlayerProps) {
  const [currentAd, setCurrentAd] = useState<AdData | null>(null);
  const [showSkip, setShowSkip] = useState(false);
  const [watchTime, setWatchTime] = useState(0);
  const { fetchAds, recordEvent } = useAdServing(contentId, channelId);

  useEffect(() => {
    loadPreRollAds();
  }, []);

  const loadPreRollAds = async () => {
    const ads = await fetchAds('pre_roll');
    if (ads.length > 0) {
      setCurrentAd(ads[0]);
      recordEvent(ads[0].placement_id, 'impression');
    }
  };

  const handleVideoProgress = (currentTime: number) => {
    setWatchTime(currentTime);
    
    if (currentAd && currentTime >= currentAd.settings.skip_after_seconds) {
      setShowSkip(true);
    }
  };

  const handleAdComplete = () => {
    if (currentAd) {
      recordEvent(currentAd.placement_id, 'completion', {
        watch_time_seconds: watchTime
      });
    }
    onAdComplete();
  };

  const handleSkip = () => {
    if (currentAd) {
      recordEvent(currentAd.placement_id, 'skip', {
        watch_time_seconds: watchTime
      });
    }
    onAdSkip();
  };

  const handleOverlayClick = () => {
    if (currentAd?.content.click_url) {
      recordEvent(currentAd.placement_id, 'click');
      window.open(currentAd.content.click_url, '_blank');
    }
  };

  if (!currentAd) return null;

  return (
    <div className="relative">
      {/* Cloudflare Stream Player */}
      <iframe
        src={`https://iframe.cloudflarestream.com/${currentAd.ad_video.cloudflare_video_id}`}
        allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
        allowFullScreen
        onLoad={() => recordEvent(currentAd.placement_id, 'impression')}
      />
      
      {/* Overlay Content */}
      {currentAd.overlay && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${currentAd.overlay.url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          {currentAd.content.ad_copy && (
            <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-75 text-white p-4 rounded pointer-events-auto">
              <p className="text-lg">{currentAd.content.ad_copy}</p>
              {currentAd.content.call_to_action && (
                <button
                  onClick={handleOverlayClick}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  {currentAd.content.call_to_action}
                </button>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Skip Button */}
      {showSkip && (
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 bg-gray-800 text-white px-3 py-1 rounded text-sm hover:bg-gray-700"
        >
          Skip Ad
        </button>
      )}
    </div>
  );
}
```

## Error Handling

### API Error Responses

```typescript
// Standard error response format
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE", // Optional error code
  "details": {} // Optional additional details
}
```

### Common Error Codes

- `400`: Invalid request parameters
- `401`: Authentication required
- `403`: Insufficient permissions
- `404`: Resource not found
- `409`: Conflict (e.g., trying to delete used resource)
- `500`: Internal server error

### Client-Side Error Handling

```typescript
const handleApiCall = async () => {
  try {
    const response = await fetch('/api/admin/ad-videos');
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error);
    }
    
    return data.data;
  } catch (error) {
    console.error('API call failed:', error);
    // Show user-friendly error message
    showErrorNotification('Failed to load ad videos');
    return [];
  }
};
```

## Performance Considerations

### Database Optimization

1. **Indexing Strategy**
   - Placement targeting queries optimized
   - Analytics time-series indexing
   - Frequency capping lookups optimized

2. **Query Patterns**
   - Use database functions for complex logic
   - Minimize N+1 query problems
   - Efficient pagination implementation

3. **Caching Strategy**
   - Cache ad selection for anonymous users
   - Redis for frequency cap tracking
   - CDN for overlay assets

### Monitoring Metrics

- Ad serving response time
- Database query performance
- Cache hit rates
- Error rates by endpoint
- User experience metrics (load times)

## Security Best Practices

### Data Validation

1. **Input Sanitization**
   - Validate all user inputs
   - Sanitize file uploads
   - Check URL formats

2. **File Upload Security**
   - Validate file types and sizes
   - Scan for malicious content
   - Use separate storage domain

3. **Analytics Privacy**
   - Anonymize IP addresses
   - Respect user privacy settings
   - Comply with data protection laws

### Access Control

1. **API Security**
   - Require authentication for admin endpoints
   - Validate user roles and permissions
   - Rate limiting for public endpoints

2. **Database Security**
   - Use service role for privileged operations
   - Implement RLS policies
   - Audit sensitive operations