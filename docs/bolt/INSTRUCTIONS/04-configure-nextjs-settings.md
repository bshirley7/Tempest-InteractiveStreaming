# Step 04: Configure Next.js Settings

## Context
You are building Temptest, an interactive streaming platform. This step configures Next.js with Sentry integration and proper image domains for Cloudflare services.

## Prerequisites
- Step 03 completed successfully
- You are in the `temptest` project directory
- `.env.local` file exists

## Task
Replace the default `next.config.js` with Temptest-specific configuration including Sentry integration and Cloudflare image domains.

## Exact File to Replace

Replace the entire contents of `next.config.js` with:

```javascript
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.dev',
      },
      {
        protocol: 'https',
        hostname: '*.cloudflarestream.com',
      },
      {
        protocol: 'https',
        hostname: 'customer-*.cloudflarestream.com',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@aws-sdk/client-s3'],
  },
};

module.exports = withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: "/monitoring",
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: false,
  }
);
```

## Configuration Explanations

### Next.js Core Settings
- `reactStrictMode: true` - Enables React strict mode for better debugging
- `images.remotePatterns` - Allows Next.js Image component to load from Cloudflare domains

### Sentry Integration
- `withSentryConfig` - Wraps Next.js config with Sentry monitoring
- `silent: true` - Reduces build output noise
- `tunnelRoute: "/monitoring"` - Custom route for Sentry requests
- `hideSourceMaps: true` - Keeps source maps private in production

### AWS SDK Configuration
- `serverComponentsExternalPackages` - Prevents bundling issues with AWS SDK used for Cloudflare R2

## File Replacement Command
Simply overwrite the existing `next.config.js` file with the content above.

## Verification Steps
1. Confirm `next.config.js` contains the Sentry configuration
2. Confirm image domains include Cloudflare patterns
3. Confirm AWS SDK is in external packages list
4. Run a syntax check:
   ```bash
   node -c next.config.js
   ```

## Success Criteria
- `next.config.js` updated with Temptest configuration
- No syntax errors when checking the file
- Sentry integration configured
- Cloudflare image domains whitelisted
- AWS SDK external package configuration set

## Important Notes
- This configuration requires environment variables to be set (done in Step 03)
- Sentry will only be active when `SENTRY_ORG` and `SENTRY_PROJECT` are provided
- Image optimization will work for Cloudflare R2 and Stream domains

## Next Step
After completing this step, proceed to Step 05: Create Middleware Configuration.