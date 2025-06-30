# Build Optimization Instructions

This document provides step-by-step instructions to align the build configuration with docs/bolt requirements.

## Prerequisites
- Ensure you're in the project root directory
- Have npm available
- Backup your current configuration files

## Step 1: Fix Package Dependencies

### 1.1 Remove Conflicting Dependencies
```bash
# Remove packages with incorrect versions
npm uninstall @clerk/nextjs @supabase/ssr @supabase/supabase-js
```

### 1.2 Install Required Dependencies with Correct Versions
```bash
# Authentication (Clerk v5 instead of v6)
npm install @clerk/nextjs@^5.7.5 @clerk/themes@^2.1.42

# Database packages with exact versions
npm install @supabase/supabase-js@^2.48.0 @supabase/auth-helpers-nextjs@^0.10.0 @supabase/auth-helpers-react@^0.5.0 @supabase/realtime-js@^2.10.9

# Video player dependencies (currently missing)
npm install video.js@^8.17.0 @videojs/themes@^1.0.1
npm install -D @types/video.js@^7.3.58

# Missing UI dependencies
npm install @radix-ui/react-accordion@^1.1.2 @radix-ui/react-alert-dialog@^1.0.5 @radix-ui/react-aspect-ratio@^1.0.3 @radix-ui/react-collapsible@^1.0.3 @radix-ui/react-context-menu@^2.1.5 @radix-ui/react-hover-card@^1.0.7 @radix-ui/react-menubar@^1.0.4 @radix-ui/react-navigation-menu@^1.1.4 @radix-ui/react-popover@^1.0.7 @radix-ui/react-radio-group@^1.1.3 @radix-ui/react-toggle@^1.0.3 @radix-ui/react-toggle-group@^1.0.4

# Additional missing dependencies
npm install @tailwindcss/typography@^0.5.15
```

### 1.3 Add Missing Scripts to package.json
Add the following script to the "scripts" section:
```json
"type-check": "tsc --noEmit"
```

## Step 2: Update Next.js Configuration

### 2.1 Backup Current Configuration
```bash
cp next.config.js next.config.js.backup
```

### 2.2 Create Optimized Configuration
Replace the entire next.config.js with the following:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable App Router features
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  
  // Image optimization for streaming platform
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudflarestream.com',
      },
      {
        protocol: 'https',
        hostname: '**.imagedelivery.net',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'img.clerk.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: '**.r2.dev',
      },
      {
        protocol: 'https',
        hostname: 'videodelivery.net',
      },
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Security and performance headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },

  // Redirects for auth flow
  async redirects() {
    return [
      {
        source: '/sign-in',
        has: [
          {
            type: 'cookie',
            key: '__session',
          },
        ],
        destination: '/',
        permanent: false,
      },
    ];
  },

  // Performance optimizations
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,

  // TypeScript and ESLint - DO NOT ignore errors
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Keep OpenTelemetry support
  transpilePackages: ['@opentelemetry/instrumentation'],
};

// Only enable Sentry in production with proper configuration
const { withSentryConfig } = require('@sentry/nextjs');
const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
const shouldUseSentry = SENTRY_DSN && process.env.NODE_ENV === 'production';

module.exports = shouldUseSentry ? withSentryConfig(
  nextConfig,
  {
    silent: true,
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
  },
  {
    widenClientFileUpload: true,
    transpileClientSDK: true,
    tunnelRoute: '/monitoring',
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
  }
) : nextConfig;
```

## Step 3: Update TypeScript Configuration

### 3.1 Backup Current Configuration
```bash
cp tsconfig.json tsconfig.json.backup
```

### 3.2 Update tsconfig.json
Replace the entire tsconfig.json with:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## Step 4: Create Missing Configuration Files

### 4.1 Create Node Version File
```bash
echo "18.17.0" > .nvmrc
```

### 4.2 Create Prettier Configuration
```bash
cat > .prettierrc << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 80,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "lf"
}
EOF
```

### 4.3 Create Prettier Ignore File
```bash
cat > .prettierignore << 'EOF'
node_modules
.next
out
public
*.min.js
*.min.css
package-lock.json
yarn.lock
.env*
EOF
```

## Step 5: Update ESLint Configuration

### 5.1 Update .eslintrc.json
```json
{
  "extends": [
    "next/core-web-vitals"
  ],
  "rules": {
    "@next/next/no-img-element": "off",
    "react-hooks/exhaustive-deps": "warn",
    "react/no-unescaped-entities": "off"
  },
  "ignorePatterns": [
    "node_modules/",
    ".next/",
    "out/",
    "public/",
    "*.config.js"
  ]
}
```

## Step 6: Environment Variables Update

Ensure your .env.local has all required variables:
```bash
# Remove hardcoded NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY from next.config.js
# Add it to .env.local instead
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YWN0dWFsLWJ1bGxmcm9nLTk3LmNsZXJrLmFjY291bnRzLmRldiQ
```

## Step 7: Clean and Rebuild

### 7.1 Clean Installation
```bash
# Remove node_modules and lock file
rm -rf node_modules package-lock.json

# Clean Next.js cache
rm -rf .next

# Reinstall dependencies
npm install
```

### 7.2 Verify Configuration
```bash
# Test TypeScript
npm run type-check

# Test ESLint
npm run lint

# Test build
npm run build
```

## Verification Checklist

- [ ] All dependencies installed with correct versions
- [ ] No peer dependency warnings
- [ ] TypeScript compilation passes
- [ ] ESLint runs without errors
- [ ] Build completes successfully
- [ ] All configuration files created
- [ ] Security headers configured
- [ ] Image domains properly configured

## Troubleshooting

### If you encounter peer dependency issues:
```bash
npm install --legacy-peer-deps
```

### If TypeScript errors persist:
1. Check that all type definitions are installed
2. Ensure strict mode is enabled but not causing issues
3. Run `npm run type-check` to see specific errors

### If build fails:
1. Check for any hardcoded environment variables in next.config.js
2. Ensure all required environment variables are in .env.local
3. Verify no syntax errors in configuration files

## Next Steps

After completing all steps:
1. Run development server: `npm run dev`
2. Test that images load properly
3. Verify authentication flow works
4. Check that TypeScript strict mode is working
5. Ensure ESLint is catching issues during development