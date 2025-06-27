# Advertising System Overview

## Introduction

The advertising system provides comprehensive ad management capabilities for the university streaming platform, supporting pre-roll, midroll, and end-roll advertisements for both library content and live channels.

## Architecture

### Core Components

1. **Ad Videos**: Video advertisements stored in Cloudflare Stream
2. **Ad Campaigns**: Campaign management with targeting and scheduling
3. **Overlay Assets**: Image overlays stored in Cloudflare R2
4. **Ad Placements**: Configuration for where and how ads are shown
5. **Analytics**: Performance tracking and reporting

### Data Flow

```
Content Request → Ad Serving API → Database Query → Ad Selection → Video Player
                                       ↓
Analytics API ← User Interaction ← Ad Display ← Overlay Rendering
```

## Database Schema

### Ad Videos Table
Stores video advertisements with metadata and approval workflow.

**Key Fields:**
- `cloudflare_video_id`: Unique identifier from Cloudflare Stream
- `duration`: Video length in seconds (required for scheduling)
- `approval_status`: Workflow state (pending, approved, rejected)
- `campaign_id`: Optional association with campaigns

### Ad Campaigns Table
Manages advertising campaigns with budgets and targeting.

**Key Fields:**
- `start_date`/`end_date`: Campaign scheduling
- `budget_limit`/`daily_budget_limit`: Spending controls
- `target_audience`: Demographic targeting data
- `targeting_rules`: Content/channel targeting configuration

### Ad Overlay Assets Table
Stores image overlays for visual ad components.

**Key Fields:**
- `cloudflare_r2_url`: Public URL for the image
- `cloudflare_r2_key`: R2 object key for management
- `dimensions`: Image width/height for proper rendering
- `file_type`: MIME type validation

### Ad Placements Table
Configures ad placement rules and targeting.

**Key Fields:**
- `placement_type`: pre_roll, mid_roll, or end_roll
- `target_type`: content, channel, or global
- `target_id`: Specific content/channel ID (null for global)
- `frequency_cap`: Maximum views per user per day
- `priority`/`weight`: Selection algorithm parameters

### Ad Analytics Table
Tracks ad performance and user interactions.

**Key Events:**
- `impression`: Ad was displayed to user
- `click`: User clicked on ad overlay/CTA
- `completion`: User watched entire ad
- `skip`: User skipped ad (if allowed)
- `error`: Technical error during ad playback

## Ad Serving Algorithm

### Selection Process

1. **Filter Applicable Ads**
   - Match placement type (pre_roll, mid_roll, end_roll)
   - Match target type and ID
   - Check campaign active dates
   - Respect time-of-day and day-of-week constraints
   - Validate frequency caps

2. **Prioritize and Weight**
   - Sort by priority (higher numbers first)
   - Apply weighted random selection within priority groups
   - Consider campaign budgets and daily limits

3. **Frequency Capping**
   - Track user impressions per placement per day
   - Respect individual placement frequency caps
   - Implement global frequency limits if needed

### Targeting Options

- **Global**: Shows to all users on all content
- **Channel**: Targets specific streaming channels
- **Content**: Targets individual videos/content items
- **Time-based**: Restrict to specific hours or days
- **Audience**: Demographic and behavioral targeting (future enhancement)

## Integration Points

### Video Players
Ad serving integrates with existing video players:
- Cloudflare Stream Player
- Custom video components
- Live stream players

### Content Management
- Leverage existing content-channel relationships
- Respect content categorization and metadata
- Support both VOD and live content

### Analytics System
- Extend existing analytics infrastructure
- Real-time performance tracking
- Revenue and engagement reporting

## Security Considerations

### Access Control
- Admin-only access to ad management
- Role-based permissions for different operations
- Audit logging for all ad-related changes

### Content Validation
- Image format and size validation for overlays
- Video content screening for ad videos
- URL validation for click-through links

### Data Privacy
- Anonymous analytics collection option
- GDPR/privacy compliance considerations
- User consent management for tracking

## Performance Optimization

### Caching Strategy
- Cache ad selection results for anonymous users
- Pre-load overlay assets for better UX
- CDN distribution for global performance

### Database Optimization
- Efficient indexing for ad selection queries
- Optimized analytics aggregation
- Proper query patterns for frequency capping

## Monitoring and Alerts

### Key Metrics
- Ad fill rate (percentage of requests served)
- Click-through rates by placement type
- Revenue per impression (RPM)
- Technical error rates

### Alert Conditions
- Campaign budget exhaustion
- Low ad fill rates
- High error rates
- Performance degradation

## Future Enhancements

### Advanced Features
- Real-time bidding integration
- Machine learning for ad optimization
- Advanced audience segmentation
- Cross-platform tracking

### Technical Improvements
- Server-side ad insertion for live streams
- Advanced fraud detection
- Enhanced analytics and reporting
- Mobile app integration