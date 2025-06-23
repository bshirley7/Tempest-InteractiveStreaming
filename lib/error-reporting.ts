/**
 * Error reporting utilities using Sentry
 */
import * as Sentry from '@sentry/nextjs';

/**
 * Report an error to Sentry with additional context
 */
export function reportError(
  error: Error | string,
  context?: {
    user?: { id: string; email?: string; username?: string };
    tags?: Record<string, string>;
    extra?: Record<string, any>;
    level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug';
  }
) {
  Sentry.withScope((scope) => {
    if (context?.user) {
      scope.setUser(context.user);
    }
    
    if (context?.tags) {
      Object.entries(context.tags).forEach(([key, value]) => {
        scope.setTag(key, value);
      });
    }
    
    if (context?.extra) {
      Object.entries(context.extra).forEach(([key, value]) => {
        scope.setExtra(key, value);
      });
    }
    
    if (context?.level) {
      scope.setLevel(context.level);
    }
    
    if (typeof error === 'string') {
      Sentry.captureMessage(error);
    } else {
      Sentry.captureException(error);
    }
  });
}

/**
 * Report a performance issue
 */
export function reportPerformance(
  name: string,
  duration: number,
  context?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message: `Performance: ${name}`,
    level: 'info',
    data: {
      duration,
      ...context,
    },
  });
}

/**
 * Set user context for error reporting
 */
export function setUserContext(user: {
  id: string;
  email?: string;
  username?: string;
  university?: string;
  role?: string;
}) {
  Sentry.setUser(user);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category?: string,
  level?: 'fatal' | 'error' | 'warning' | 'info' | 'debug',
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    level: level || 'info',
    data,
  });
}

/**
 * Capture user feedback
 */
export function captureUserFeedback(feedback: {
  name: string;
  email: string;
  comments: string;
}) {
  Sentry.captureUserFeedback(feedback);
}