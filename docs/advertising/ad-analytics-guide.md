# Advertising Analytics Guide

## Overview

The advertising analytics system provides comprehensive tracking and reporting capabilities for ad performance, user engagement, and campaign effectiveness. This guide covers available metrics, reporting features, and optimization strategies.

## Key Performance Indicators (KPIs)

### Primary Metrics

#### Impressions
- **Definition**: Number of times an ad was displayed to users
- **Calculation**: Counted when ad starts playing
- **Use Case**: Measure reach and exposure
- **Optimization**: Increase through better targeting and placement

#### Click-Through Rate (CTR)
- **Definition**: Percentage of impressions that resulted in clicks
- **Calculation**: (Clicks ÷ Impressions) × 100
- **Benchmark**: 1-3% for typical university content
- **Optimization**: Improve overlay design and call-to-action

#### Completion Rate
- **Definition**: Percentage of ads watched to completion
- **Calculation**: (Completions ÷ Impressions) × 100
- **Benchmark**: 70-85% for pre-roll ads
- **Optimization**: Optimize ad length and content quality

#### View-Through Rate (VTR)
- **Definition**: Percentage of impressions with meaningful engagement
- **Calculation**: Views >25% duration ÷ Impressions
- **Use Case**: Measure content effectiveness
- **Optimization**: Create more engaging content

### Secondary Metrics

#### Cost Per Impression (CPM)
- **Definition**: Cost for 1,000 ad impressions
- **Calculation**: (Total Spend ÷ Impressions) × 1,000
- **Use Case**: Budget efficiency measurement
- **Target**: Varies by campaign objectives

#### Cost Per Click (CPC)
- **Definition**: Average cost for each click
- **Calculation**: Total Spend ÷ Total Clicks
- **Use Case**: Performance marketing assessment
- **Optimization**: Focus on high-CTR placements

#### Frequency
- **Definition**: Average impressions per unique user
- **Calculation**: Total Impressions ÷ Unique Users
- **Optimal Range**: 2-4 for awareness campaigns
- **Management**: Use frequency caps to prevent fatigue

#### Reach
- **Definition**: Number of unique users who saw ads
- **Measurement**: Distinct user count in analytics
- **Use Case**: Audience coverage assessment
- **Growth**: Expand targeting or increase budget

## Analytics Data Model

### Event Types

#### Impression Events
Recorded when ad begins displaying:
```json
{
  "event_type": "impression",
  "placement_id": "uuid",
  "user_id": "user_123",
  "timestamp": "2024-01-15T10:30:00Z",
  "content_id": "uuid",
  "channel_id": "uuid",
  "session_id": "session_456",
  "user_agent": "Mozilla/5.0...",
  "ip_address": "192.168.1.1"
}
```

#### Click Events
Recorded when user interacts with overlay:
```json
{
  "event_type": "click",
  "placement_id": "uuid",
  "user_id": "user_123",
  "timestamp": "2024-01-15T10:30:15Z",
  "event_data": {
    "click_position": { "x": 150, "y": 200 },
    "cta_text": "Learn More",
    "target_url": "https://university.edu/courses"
  }
}
```

#### Completion Events
Recorded when ad finishes playing:
```json
{
  "event_type": "completion",
  "placement_id": "uuid",
  "watch_time_seconds": 30,
  "video_duration": 30,
  "timestamp": "2024-01-15T10:30:30Z"
}
```

#### Skip Events
Recorded when user skips ad:
```json
{
  "event_type": "skip",
  "placement_id": "uuid",
  "watch_time_seconds": 8,
  "skip_after_seconds": 5,
  "timestamp": "2024-01-15T10:30:23Z"
}
```

### Aggregation Periods

- **Real-time**: Current hour metrics
- **Daily**: 24-hour aggregated data
- **Weekly**: 7-day rolling averages
- **Monthly**: Calendar month summaries
- **Campaign Lifetime**: Full campaign duration

## Reporting Dashboard

### Campaign Performance Report

#### Overview Section
- Total impressions across all placements
- Overall CTR and completion rates
- Budget utilization and remaining funds
- Campaign status and remaining duration

#### Placement Breakdown
- Performance by placement type (pre-roll, mid-roll, end-roll)
- Top-performing placements by CTR
- Placement-level budget allocation
- Targeting effectiveness analysis

#### Audience Insights
- User engagement patterns
- Peak viewing times and days
- Content category performance
- Channel-specific metrics

### Detailed Analytics Views

#### Time Series Analysis
```sql
-- Daily performance over time
SELECT 
  DATE(timestamp) as date,
  COUNT(*) FILTER (WHERE event_type = 'impression') as impressions,
  COUNT(*) FILTER (WHERE event_type = 'click') as clicks,
  COUNT(*) FILTER (WHERE event_type = 'completion') as completions,
  COUNT(*) FILTER (WHERE event_type = 'skip') as skips,
  ROUND(
    COUNT(*) FILTER (WHERE event_type = 'click')::float / 
    NULLIF(COUNT(*) FILTER (WHERE event_type = 'impression'), 0) * 100, 
    2
  ) as ctr
FROM ad_analytics 
WHERE campaign_id = $1 
  AND timestamp >= $2 
  AND timestamp <= $3
GROUP BY DATE(timestamp)
ORDER BY date;
```

#### Placement Performance Comparison
```sql
-- Compare placement effectiveness
SELECT 
  ap.name as placement_name,
  ap.placement_type,
  ap.target_type,
  COUNT(*) FILTER (WHERE aa.event_type = 'impression') as impressions,
  COUNT(*) FILTER (WHERE aa.event_type = 'click') as clicks,
  COUNT(*) FILTER (WHERE aa.event_type = 'completion') as completions,
  ROUND(
    COUNT(*) FILTER (WHERE aa.event_type = 'click')::float / 
    NULLIF(COUNT(*) FILTER (WHERE aa.event_type = 'impression'), 0) * 100, 
    2
  ) as ctr,
  ROUND(
    COUNT(*) FILTER (WHERE aa.event_type = 'completion')::float / 
    NULLIF(COUNT(*) FILTER (WHERE aa.event_type = 'impression'), 0) * 100, 
    2
  ) as completion_rate
FROM ad_placements ap
LEFT JOIN ad_analytics aa ON ap.id = aa.placement_id
WHERE ap.campaign_id = $1
GROUP BY ap.id, ap.name, ap.placement_type, ap.target_type
ORDER BY ctr DESC;
```

### Automated Reporting

#### Daily Summary Email
Automated report sent to campaign managers:
- Yesterday's performance summary
- Key metric changes vs. previous day
- Budget spend and remaining allocation
- Top-performing and underperforming placements

#### Weekly Performance Review
Comprehensive weekly analysis:
- Week-over-week performance trends
- Audience engagement analysis
- Content performance insights
- Optimization recommendations

#### Campaign Completion Report
End-of-campaign summary:
- Overall campaign objectives achievement
- ROI and cost-effectiveness analysis
- Audience reach and frequency distribution
- Recommendations for future campaigns

## Advanced Analytics Features

### Cohort Analysis

Track user behavior patterns over time:
```sql
-- User engagement cohorts by first ad exposure
WITH user_first_impression AS (
  SELECT 
    user_id,
    MIN(DATE(timestamp)) as first_impression_date
  FROM ad_analytics 
  WHERE event_type = 'impression'
    AND user_id IS NOT NULL
  GROUP BY user_id
),
cohort_data AS (
  SELECT 
    ufi.first_impression_date as cohort_date,
    DATE(aa.timestamp) as activity_date,
    DATE(aa.timestamp) - ufi.first_impression_date as days_since_first,
    COUNT(DISTINCT aa.user_id) as active_users
  FROM user_first_impression ufi
  JOIN ad_analytics aa ON ufi.user_id = aa.user_id
  WHERE aa.event_type = 'impression'
  GROUP BY ufi.first_impression_date, DATE(aa.timestamp)
)
SELECT 
  cohort_date,
  days_since_first,
  active_users,
  active_users::float / FIRST_VALUE(active_users) OVER (
    PARTITION BY cohort_date ORDER BY days_since_first
  ) as retention_rate
FROM cohort_data
ORDER BY cohort_date, days_since_first;
```

### Attribution Analysis

Track user journey from impression to conversion:
```sql
-- Multi-touch attribution analysis
WITH user_touchpoints AS (
  SELECT 
    user_id,
    placement_id,
    event_type,
    timestamp,
    LAG(event_type) OVER (
      PARTITION BY user_id 
      ORDER BY timestamp
    ) as previous_event,
    LEAD(event_type) OVER (
      PARTITION BY user_id 
      ORDER BY timestamp
    ) as next_event
  FROM ad_analytics 
  WHERE user_id IS NOT NULL
    AND timestamp >= $1 -- date range start
    AND timestamp <= $2 -- date range end
)
SELECT 
  placement_id,
  COUNT(*) FILTER (WHERE event_type = 'impression') as impressions,
  COUNT(*) FILTER (WHERE event_type = 'click') as clicks,
  COUNT(*) FILTER (
    WHERE event_type = 'click' 
    AND next_event IS NOT NULL
  ) as clicks_with_followup,
  COUNT(*) FILTER (
    WHERE previous_event = 'impression' 
    AND event_type = 'click'
  ) as direct_clicks
FROM user_touchpoints
GROUP BY placement_id;
```

### Predictive Analytics

#### Budget Pacing Prediction
```sql
-- Predict campaign budget depletion
WITH daily_spend AS (
  SELECT 
    DATE(timestamp) as date,
    COUNT(*) as daily_impressions
  FROM ad_analytics 
  WHERE campaign_id = $1 
    AND event_type = 'impression'
    AND timestamp >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY DATE(timestamp)
),
avg_daily_spend AS (
  SELECT AVG(daily_impressions) as avg_impressions
  FROM daily_spend
)
SELECT 
  c.budget_limit,
  c.total_spend,
  c.budget_limit - c.total_spend as remaining_budget,
  ads.avg_impressions * (c.budget_limit - c.total_spend) / 
    NULLIF(c.daily_budget_limit, 0) as predicted_days_remaining
FROM ad_campaigns c
CROSS JOIN avg_daily_spend ads
WHERE c.id = $1;
```

## Performance Optimization

### A/B Testing Framework

#### Test Setup
```sql
-- Create placement variants for testing
INSERT INTO ad_placements (
  name, ad_video_id, campaign_id, placement_type, 
  target_type, target_id, weight, is_active
) VALUES 
  ('Test A - Original CTA', $1, $2, 'pre_roll', 'global', NULL, 50, true),
  ('Test B - Updated CTA', $3, $2, 'pre_roll', 'global', NULL, 50, true);
```

#### Statistical Significance Testing
```sql
-- Calculate statistical significance between variants
WITH variant_performance AS (
  SELECT 
    ap.name as variant_name,
    COUNT(*) FILTER (WHERE aa.event_type = 'impression') as impressions,
    COUNT(*) FILTER (WHERE aa.event_type = 'click') as clicks,
    COUNT(*) FILTER (WHERE aa.event_type = 'click')::float / 
      NULLIF(COUNT(*) FILTER (WHERE aa.event_type = 'impression'), 0) as ctr
  FROM ad_placements ap
  LEFT JOIN ad_analytics aa ON ap.id = aa.placement_id
  WHERE ap.campaign_id = $1
    AND ap.name LIKE 'Test%'
  GROUP BY ap.id, ap.name
)
SELECT 
  variant_name,
  impressions,
  clicks,
  ROUND(ctr * 100, 2) as ctr_percent,
  -- Chi-square test statistic for CTR comparison
  CASE 
    WHEN LAG(ctr) OVER (ORDER BY variant_name) IS NOT NULL THEN
      ABS(ctr - LAG(ctr) OVER (ORDER BY variant_name)) / 
      SQRT((ctr * (1-ctr) / impressions) + 
           (LAG(ctr) OVER (ORDER BY variant_name) * 
            (1-LAG(ctr) OVER (ORDER BY variant_name)) / 
            LAG(impressions) OVER (ORDER BY variant_name)))
    ELSE NULL
  END as z_score
FROM variant_performance;
```

### Optimization Recommendations

#### Placement Optimization
1. **Time-based Analysis**: Identify peak performance hours
2. **Content Type Matching**: Align ad content with video categories
3. **Audience Segmentation**: Target based on viewing behavior
4. **Frequency Optimization**: Adjust caps based on performance

#### Creative Optimization
1. **Message Testing**: A/B test different ad copy variations
2. **Visual Design**: Test overlay layouts and call-to-action buttons
3. **Duration Optimization**: Find optimal ad length for completion
4. **Personalization**: Customize content based on user segments

## Data Export and Integration

### CSV Export Format
```csv
Date,Campaign,Placement,Type,Impressions,Clicks,CTR,Completions,Completion_Rate
2024-01-15,Spring Campaign,Homepage Pre-roll,pre_roll,1250,28,2.24%,1180,94.4%
2024-01-15,Spring Campaign,Lecture Mid-roll,mid_roll,890,15,1.69%,756,84.9%
```

### API Integration
```typescript
// Export analytics data via API
const exportAnalytics = async (campaignId: string, dateRange: DateRange) => {
  const response = await fetch('/api/admin/analytics/export', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      campaign_id: campaignId,
      start_date: dateRange.start,
      end_date: dateRange.end,
      format: 'csv',
      metrics: ['impressions', 'clicks', 'completions']
    })
  });
  
  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `campaign_${campaignId}_analytics.csv`;
  a.click();
};
```

### Third-Party Integrations

#### Google Analytics Integration
```javascript
// Track ad events in Google Analytics
const trackAdEvent = (eventType, placementId, campaignName) => {
  gtag('event', eventType, {
    event_category: 'Advertisement',
    event_label: campaignName,
    custom_parameter_1: placementId,
    value: eventType === 'click' ? 1 : 0
  });
};
```

#### Data Warehouse Export
```sql
-- Daily ETL process for data warehouse
COPY (
  SELECT 
    DATE(timestamp) as date,
    campaign_id,
    placement_id,
    event_type,
    COUNT(*) as event_count,
    COUNT(DISTINCT user_id) as unique_users
  FROM ad_analytics 
  WHERE DATE(timestamp) = CURRENT_DATE - 1
  GROUP BY DATE(timestamp), campaign_id, placement_id, event_type
) TO '/exports/ad_analytics_daily.csv' WITH CSV HEADER;
```

## Privacy and Compliance

### Data Retention Policy
- **Raw Analytics**: 13 months retention
- **Aggregated Data**: 7 years retention
- **Personal Identifiers**: Anonymized after 6 months
- **IP Addresses**: Hashed immediately, purged after 30 days

### GDPR Compliance
```sql
-- User data deletion for GDPR compliance
DELETE FROM ad_analytics 
WHERE user_id = $1 
  AND timestamp < CURRENT_DATE - INTERVAL '6 months';

-- Anonymize recent data
UPDATE ad_analytics 
SET user_id = NULL, ip_address = NULL
WHERE user_id = $1 
  AND timestamp >= CURRENT_DATE - INTERVAL '6 months';
```

### Privacy Controls
- **Opt-out Tracking**: Respect user privacy preferences
- **Anonymous Analytics**: Support for cookieless tracking
- **Data Minimization**: Collect only necessary metrics
- **Consent Management**: Integration with consent platforms