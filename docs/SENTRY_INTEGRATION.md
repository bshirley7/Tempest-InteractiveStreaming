# Sentry Integration for xCast

This document outlines the Sentry error tracking integration implemented in the xCast streaming platform.

## Overview

Sentry is integrated to provide comprehensive error tracking, performance monitoring, and user session replay for the xCast platform. This helps identify and fix issues before they impact users during the Bolt.new conversion process.

## Configuration

### Environment Variables

Add these to your `.env.local`:

```env
NEXT_PUBLIC_SENTRY_DSN=https://6716680954c64b6b3b37e897d6b27edd@o4509517155074048.ingest.us.sentry.io/4509517155729408
SENTRY_ORG=labelle-xl
SENTRY_PROJECT=javascript-nextjs
SENTRY_AUTH_TOKEN=[your_auth_token]
```

### Configuration Files

- `sentry.client.config.ts` - Client-side configuration with session replay
- `sentry.server.config.ts` - Server-side configuration
- `sentry.edge.config.ts` - Edge runtime configuration
- `app/instrumentation.ts` - Next.js instrumentation setup
- `next.config.js` - Webpack plugin configuration

## Features Implemented

### 1. Error Boundaries

- `components/ErrorBoundary.tsx` - Generic error boundary with Sentry integration
- `components/video/VideoPlayerWithErrorBoundary.tsx` - Video player wrapper

### 2. Custom Error Tracking

Located in `lib/sentry-helpers.ts`:

```typescript
captureError(error, {
  component: 'VideoPlayer',
  action: 'playback_failed',
  channelId: 'explore',
  contentId: 'video-123',
  extra: { videoUrl: '...', userAgent: '...' }
})
```

### 3. Performance Monitoring

- 10% sampling rate in production
- 100% sampling rate in development
- Custom transactions for key user flows

### 4. Session Replay

- 10% of normal sessions recorded
- 100% of error sessions recorded
- Privacy-first (all text masked, media blocked)

## Components with Sentry Integration

### Video Player (`components/video/OptimizedVideoPlayer.tsx`)

**Tracked Events:**
- Autoplay failures
- Video loading errors
- Playback errors with detailed context

**Error Context Includes:**
- Video URL
- Error codes and messages
- Network/ready states
- Current playback position

### Chat System (`components/chat/Chat.tsx`)

**Tracked Events:**
- Message sending failures
- Poll creation errors
- Command processing failures

**Error Context Includes:**
- Message content length
- User information
- Content ID
- Command type

### User Context Tracking

`lib/hooks/useSentryUser.ts` automatically sets user context when authenticated:

```typescript
Sentry.setUser({
  id: user.id,
  email: user.email,
  username: user.username
});
```

## Error Filtering

The integration includes smart filtering to reduce noise:

### Client-side Filtering
- Network errors (expected in streaming)
- Convex connection errors in development
- Browser extension conflicts

### Server-side Filtering
- Rate limit errors (429s)
- Authentication errors in development
- Expected Cloudflare errors

## Testing Sentry Integration

Visit `/test-sentry` to test various error scenarios:

1. **Basic Error** - Simple exception capture
2. **Contextual Error** - Error with metadata
3. **Unhandled Error** - Simulate runtime errors
4. **Performance Tracking** - Test transaction recording
5. **User Context** - Verify user identification

## Dashboard Access

Access your Sentry dashboard at:
- **Project URL**: https://labelle-xl.sentry.io/issues/?project=4509517155729408
- **Organization**: labelle-xl
- **Project**: javascript-nextjs

## Production Deployment

### Source Maps

Source maps are automatically uploaded during production builds via the Sentry webpack plugin. This enables:
- Readable stack traces
- Line-level error reporting
- Better debugging context

### Rate Limiting

The free tier provides 5,000 events/month, which should be sufficient for development and early production.

## Best Practices Implemented

1. **Contextual Errors** - All errors include component, action, and relevant IDs
2. **User Privacy** - Session replays mask sensitive data
3. **Performance Impact** - Minimal overhead with sampling
4. **Error Recovery** - Components attempt graceful degradation
5. **Development Filtering** - Reduced noise during development

## Integration with Bolt.new

When converting to Bolt.new instructions, include:

1. Package dependency: `@sentry/nextjs`
2. Environment variables setup
3. Configuration files
4. Error boundary components
5. Helper functions for error tracking

This will ensure error tracking is available from day one of the Bolt.new deployment.

## Monitoring Key Metrics

Track these metrics in your Sentry dashboard:

- **Video Playback Errors** - Critical for streaming platform
- **Chat System Errors** - User engagement issues
- **Authentication Errors** - User onboarding problems
- **API/Convex Errors** - Backend integration issues
- **Performance Transactions** - Page load and interaction times

## Support

For Sentry-related questions:
- Check error patterns in dashboard
- Review error context and user sessions
- Use session replay for visual debugging
- Filter errors by component/action tags