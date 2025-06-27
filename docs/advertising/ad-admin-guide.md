# Advertising Administration Guide

## Getting Started

The advertising system is accessible through the Admin Dashboard under the "Advertising" tab. This guide covers how to create and manage advertisements for your streaming platform.

## Campaign Management

### Creating a New Campaign

1. **Navigate to Campaigns**
   - Go to Admin Dashboard → Advertising → Campaigns
   - Click "Create New Campaign"

2. **Basic Information**
   - **Name**: Descriptive campaign name
   - **Advertiser**: Organization or department name
   - **Description**: Optional campaign details

3. **Scheduling**
   - **Start Date**: When campaign becomes active
   - **End Date**: When campaign expires
   - Campaigns automatically activate/deactivate based on dates

4. **Budget Settings**
   - **Total Budget**: Maximum spend for entire campaign
   - **Daily Budget**: Maximum spend per day (optional)
   - Leave blank for unlimited budgets

5. **Targeting Rules**
   - **Content Targeting**: Target specific videos
   - **Channel Targeting**: Target specific channels
   - **Audience Targeting**: Demographic filters (future enhancement)

### Managing Existing Campaigns

- **Edit**: Update campaign settings, budgets, and targeting
- **Pause/Resume**: Temporarily disable active campaigns
- **Delete**: Remove campaigns (only if no associated content)
- **View Analytics**: Track campaign performance metrics

## Ad Video Management

### Uploading Ad Videos

1. **Video Requirements**
   - Supported formats: MP4, MOV, AVI
   - Recommended resolution: 1920x1080 (1080p)
   - Maximum file size: 500MB
   - Duration: Typically 15-60 seconds

2. **Upload Process**
   - Navigate to Ad Videos → Upload Ad Video
   - Select video file from computer
   - Video automatically uploads to Cloudflare Stream
   - Wait for processing completion

3. **Video Metadata**
   - **Title**: Descriptive name for the ad
   - **Description**: Optional details about the advertisement
   - **Advertiser**: Organization name
   - **Category**: Type of advertisement (commercial, PSA, etc.)
   - **Campaign**: Associate with existing campaign (optional)

### Video Approval Workflow

1. **Pending Status**: Newly uploaded videos await approval
2. **Review Process**: Admin reviews content for appropriateness
3. **Approval Actions**:
   - **Approve**: Video becomes available for placements
   - **Reject**: Video blocked from use
   - **Request Changes**: Send back for modifications

### Managing Ad Videos

- **Edit Metadata**: Update title, description, and associations
- **Preview**: View video before creating placements
- **Deactivate**: Temporarily disable without deletion
- **Delete**: Remove video (only if not used in active placements)

## Overlay Assets Management

### Image Requirements

- **Formats**: PNG, JPEG, GIF (no animation)
- **Recommended Size**: 1920x1080 for full overlay
- **Smaller Overlays**: 400x300 for corner/banner overlays
- **File Size**: Maximum 5MB per image
- **Transparency**: PNG with alpha channel supported

### Uploading Overlay Assets

1. **Navigate to Overlay Assets**
   - Go to Advertising → Overlay Assets
   - Click "Upload Overlay Asset"

2. **Asset Information**
   - **Name**: Descriptive asset name
   - **Alt Text**: Accessibility description
   - **Image File**: Select from computer

3. **Upload Process**
   - Image uploads to Cloudflare R2
   - Automatic dimension detection
   - Immediate availability for placements

### Best Practices for Overlays

- **Clear Text**: Ensure readability on video backgrounds
- **Call-to-Action**: Include clear action buttons
- **Brand Consistency**: Match university/department branding
- **Mobile Friendly**: Consider smaller screen displays

## Ad Placement Configuration

### Placement Types

1. **Pre-roll**: Plays before content starts
   - Most effective for brand awareness
   - Users expect ads at this position
   - Recommended duration: 15-30 seconds

2. **Mid-roll**: Plays during content breaks
   - Best for longer content (>10 minutes)
   - Natural break points preferred
   - Can interrupt user experience if poorly placed

3. **End-roll**: Plays after content completes
   - Good for call-to-action messages
   - Lower completion rates than pre-roll
   - Opportunity for related content promotion

### Creating Placements

1. **Basic Setup**
   - **Name**: Descriptive placement name
   - **Ad Video**: Select approved video
   - **Campaign**: Associate with campaign
   - **Overlay Asset**: Optional image overlay

2. **Targeting Configuration**
   - **Global**: Shows on all content
   - **Channel**: Target specific streaming channels
   - **Content**: Target individual videos

3. **Display Settings**
   - **Skip Options**: Allow skip after X seconds
   - **Duration**: How long overlay displays
   - **Priority**: Higher numbers show first
   - **Weight**: For random selection within priority

4. **Frequency Control**
   - **Frequency Cap**: Max views per user per day
   - **Time Restrictions**: Limit to specific hours
   - **Day Restrictions**: Limit to specific weekdays

### Targeting Strategies

- **Broad Targeting**: Use global placements for general announcements
- **Channel Targeting**: Match ad content to channel themes
- **Content Targeting**: Promote related services on specific videos
- **Time-based**: Show dining ads before meal times

## Analytics and Reporting

### Key Metrics

1. **Impressions**: Number of times ad was displayed
2. **Clicks**: User interactions with overlay/CTA
3. **Completion Rate**: Percentage of users who watched full ad
4. **Click-through Rate (CTR)**: Clicks divided by impressions
5. **Cost Metrics**: If using budget tracking

### Viewing Analytics

1. **Campaign Level**: Overall campaign performance
2. **Placement Level**: Individual placement metrics
3. **Time-based**: Performance over time periods
4. **Comparative**: Compare different campaigns/placements

### Optimizing Performance

- **A/B Testing**: Create multiple placements for same campaign
- **Time Analysis**: Identify peak performance hours
- **Content Analysis**: Find best-performing content types
- **Audience Insights**: Understand user engagement patterns

## Content Guidelines

### Acceptable Content

- University announcements and news
- Academic program promotions
- Student services advertisements
- Campus event promotions
- Educational content and resources

### Prohibited Content

- Commercial advertisements (unless specifically approved)
- Political campaigns or messaging
- Inappropriate or offensive content
- Competing educational institutions
- Content violating university policies

### Review Process

1. **Automatic Screening**: Basic content validation
2. **Manual Review**: Admin approval for all content
3. **Community Standards**: Adherence to university guidelines
4. **Legal Compliance**: Copyright and licensing verification

## Troubleshooting

### Common Issues

1. **Video Won't Upload**
   - Check file format and size limits
   - Ensure stable internet connection
   - Try different browser if issues persist

2. **Ads Not Displaying**
   - Verify campaign is active and within date range
   - Check placement targeting settings
   - Confirm video approval status

3. **Low Performance**
   - Review targeting settings for accuracy
   - Consider placement type appropriateness
   - Analyze audience engagement patterns

### Getting Help

- **Technical Issues**: Contact IT support
- **Content Questions**: Reach out to marketing team
- **Policy Concerns**: Consult university communications office
- **System Training**: Schedule admin training session

## Best Practices Summary

1. **Plan Campaigns**: Define clear objectives and target audiences
2. **Quality Content**: Invest in professional video and overlay creation
3. **Strategic Placement**: Choose appropriate timing and positioning
4. **Monitor Performance**: Regularly review analytics and optimize
5. **User Experience**: Balance monetization with viewer satisfaction
6. **Compliance**: Ensure all content meets university standards