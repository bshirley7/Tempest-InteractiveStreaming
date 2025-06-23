# Step 11: Create Sentry Configuration

## Context
You are building Tempest, an interactive streaming platform. This step creates Sentry configuration files for error tracking and performance monitoring across client, server, and edge environments.

## Prerequisites
- Step 10 completed successfully
- You are in the `tempest` project directory
- Sentry dependencies installed
- Sentry environment variables configured

## Task
Create Sentry configuration files for comprehensive error tracking and monitoring in all execution environments.

## Files to Create

### 1. Create `sentry.client.config.ts` (Browser/Client-side)

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions for development
  
  // Session Replay
  replaysOnErrorSampleRate: 1.0, // Capture 100% of sessions with errors
  replaysSessionSampleRate: 0.1, // Capture 10% of normal sessions
  
  // Debug mode (disable in production)
  debug: false,
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Integrations
  integrations: [
    Sentry.replayIntegration({
      // Mask all text content for privacy
      maskAllText: true,
      // Block all media content
      blockAllMedia: true,
    }),
    Sentry.browserTracingIntegration({
      // Track navigation and interactions
      trackInteractions: true,
    }),
  ],
  
  // Error filtering
  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development') {
      console.warn('Sentry event would be sent:', event);
      return null; // Don't send in development
    }
    
    // Filter out specific errors
    if (event.exception) {
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = error.message as string;
        // Ignore chunk loading errors
        if (message.includes('ChunkLoadError') || message.includes('Loading chunk')) {
          return null;
        }
        // Ignore network errors
        if (message.includes('NetworkError') || message.includes('fetch')) {
          return null;
        }
      }
    }
    
    return event;
  },
  
  // Performance filtering
  beforeSendTransaction(event) {
    // Sample performance data based on environment
    if (process.env.NODE_ENV === 'development') {
      return null; // Don't send performance data in development
    }
    return event;
  },
});
```

### 2. Create `sentry.server.config.ts` (Server-side)

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Debug mode
  debug: false,
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Server-specific integrations
  integrations: [
    Sentry.prismaIntegration(), // If using Prisma
    Sentry.httpIntegration({
      // Track HTTP requests
      tracing: true,
    }),
  ],
  
  // Error filtering for server
  beforeSend(event, hint) {
    // Log server errors locally in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Server error:', hint.originalException);
      return null; // Don't send in development
    }
    
    // Filter out specific server errors
    if (event.exception) {
      const error = hint.originalException;
      if (error && typeof error === 'object' && 'message' in error) {
        const message = error.message as string;
        // Ignore database connection errors in development
        if (message.includes('ECONNREFUSED') && process.env.NODE_ENV === 'development') {
          return null;
        }
        // Ignore authentication errors (these are user errors, not bugs)
        if (message.includes('Unauthorized') || message.includes('Invalid token')) {
          return null;
        }
      }
    }
    
    return event;
  },
  
  // Add user context
  beforeSendTransaction(event) {
    if (process.env.NODE_ENV === 'development') {
      return null;
    }
    return event;
  },
});
```

### 3. Create `sentry.edge.config.ts` (Edge Runtime)

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Debug mode
  debug: false,
  
  // Environment
  environment: process.env.NODE_ENV || 'development',
  
  // Minimal integrations for edge runtime
  integrations: [
    // Edge runtime has limited integrations
  ],
  
  // Error filtering for edge
  beforeSend(event, hint) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Edge error:', hint.originalException);
      return null;
    }
    
    return event;
  },
});
```

### 4. Create `lib/sentry-helpers.ts` (Helper Functions)

```typescript
import * as Sentry from "@sentry/nextjs";

export function setUserContext(user: {
  id: string;
  username?: string;
  email?: string;
  role?: string;
}) {
  Sentry.setUser({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  });
}

export function clearUserContext() {
  Sentry.setUser(null);
}

export function addBreadcrumb(message: string, category: string, level: 'info' | 'warning' | 'error' = 'info') {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    timestamp: Date.now() / 1000,
  });
}

export function captureVideoError(error: Error, videoId: string, context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'video_error');
    scope.setContext('video', {
      videoId,
      ...context,
    });
    Sentry.captureException(error);
  });
}

export function captureApiError(error: Error, endpoint: string, method: string, statusCode?: number) {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'api_error');
    scope.setContext('api', {
      endpoint,
      method,
      statusCode,
    });
    Sentry.captureException(error);
  });
}

export function captureStreamingError(error: Error, streamId: string, context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    scope.setTag('error_type', 'streaming_error');
    scope.setContext('streaming', {
      streamId,
      ...context,
    });
    Sentry.captureException(error);
  });
}

export function measurePerformance<T>(
  name: string,
  operation: () => T | Promise<T>
): Promise<T> {
  return Sentry.startSpan(
    {
      name,
      op: 'function',
    },
    async () => {
      const start = Date.now();
      try {
        const result = await operation();
        const duration = Date.now() - start;
        
        // Add performance breadcrumb
        addBreadcrumb(
          `${name} completed in ${duration}ms`,
          'performance',
          'info'
        );
        
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        addBreadcrumb(
          `${name} failed after ${duration}ms`,
          'performance',
          'error'
        );
        throw error;
      }
    }
  );
}

export function trackFeatureUsage(feature: string, userId?: string, metadata?: Record<string, any>) {
  Sentry.addBreadcrumb({
    message: `Feature used: ${feature}`,
    category: 'feature_usage',
    data: {
      feature,
      userId,
      ...metadata,
    },
    level: 'info',
  });
}
```

### 5. Create `instrumentation.ts` (Root Instrumentation)

```typescript
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config');
  }
}
```

## File Creation Commands

```bash
# Create Sentry configuration files
touch sentry.client.config.ts
touch sentry.server.config.ts
touch sentry.edge.config.ts
touch lib/sentry-helpers.ts
touch instrumentation.ts
```

Then add the respective content to each file.

## Configuration Explanation

### Client Configuration
- Tracks user interactions and errors in the browser
- Includes session replay for debugging
- Filters out development and common errors

### Server Configuration
- Monitors API routes and server-side errors
- Tracks database and external service issues
- Filters authentication-related errors

### Edge Configuration
- Minimal configuration for edge runtime
- Handles middleware and edge function errors

### Helper Functions
- User context management for tracking
- Specialized error capture for videos and streaming
- Performance measurement utilities
- Feature usage tracking

## Verification Steps

1. Confirm all files exist:
   ```bash
   ls -la sentry.*.ts
   ls -la instrumentation.ts
   ls -la lib/sentry-helpers.ts
   ```

2. Check TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```

3. Test Sentry configuration (if DSN is set):
   ```bash
   node -e "console.log(process.env.NEXT_PUBLIC_SENTRY_DSN ? 'Sentry DSN configured' : 'Sentry DSN missing')"
   ```

## Success Criteria
- All Sentry configuration files created
- TypeScript compilation succeeds
- Error filtering configured properly
- Helper functions ready for use
- Instrumentation file properly structured

## Important Notes
- Development errors are filtered out to reduce noise
- Session replay captures user interactions for debugging
- Performance monitoring tracks slow operations
- User context helps identify user-specific issues

## Next Step
After completing this step, proceed to Step 12: Update App Layout and Global Styles.