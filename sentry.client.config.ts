// This file configures the initialization of Sentry on the browser side.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    
    // Adjust this value in production, or use tracesSampler for greater control
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    
    // Setting this option to true will print useful information to the console while you're setting up Sentry.
    debug: process.env.NODE_ENV === 'development',
    
    // Environment
    environment: process.env.NODE_ENV,
    
    // Release tracking
    release: process.env.NEXT_PUBLIC_APP_VERSION || 'development',
    
    // Only use tunnel route if we're in production and have proper server setup
    // This prevents the "Failed to fetch" error when tunnel route isn't available
    ...(process.env.NODE_ENV === 'production' && {
      tunnel: '/monitoring'
    }),
    
    // Client-specific configuration
    beforeSend(event, hint) {
      // Filter out certain errors in development
      if (process.env.NODE_ENV === 'development') {
        // Don't send network errors that are common in development
        const error = hint.originalException;
        if (error instanceof Error && (
          error.message.includes('Failed to fetch') ||
          error.message.includes('NetworkError') ||
          error.message.includes('ERR_NETWORK')
        )) {
          return null;
        }
      }
      return event;
    },
  });
}