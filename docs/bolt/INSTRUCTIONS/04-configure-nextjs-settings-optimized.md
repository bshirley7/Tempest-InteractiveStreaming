# Step 04: Configure Next.js Settings

## Context
You are building Tempest, an interactive streaming platform. This step configures Next.js with production-ready settings, security headers, and optimizations.

## Purpose
Proper Next.js configuration is CRITICAL for video streaming, authentication, and performance. Incorrect settings will cause build failures and runtime issues.

## Prerequisites
- Step 03 completed successfully
- Environment variables configured in .env.local
- You are in the `tempest` project directory

## Task Instructions
Complete each task in order and mark as ✅ when finished:

### Task 1: Create Next.js Configuration ⏳

**DELETE existing next.config.js and CREATE new next.config.js:**
```bash
rm -f next.config.js next.config.mjs
```

**CREATE next.config.js with EXACT content:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // CRITICAL: Enable App Router features
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  
  // CRITICAL: Image optimization for streaming platform
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
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // CRITICAL: Headers for security and performance
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

  // CRITICAL: Redirects for auth flow
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

  // TypeScript and ESLint
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

module.exports = nextConfig;
```

### Task 2: Configure TypeScript Settings ⏳

**UPDATE tsconfig.json with EXACT content:**
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

### Task 3: Configure ESLint ⏳

**UPDATE .eslintrc.json with EXACT content:**
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

### Task 4: Create Additional Config Files ⏳

**CREATE .nvmrc for Node version:**
```bash
echo "18.17.0" > .nvmrc
```

**CREATE .prettierrc for code formatting:**
```json
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
```

**CREATE .prettierignore:**
```bash
echo "node_modules
.next
out
public
*.min.js
*.min.css
package-lock.json
yarn.lock
.env*" > .prettierignore
```

### Task 5: Verify Configuration ⏳

**RUN these verification commands:**
```bash
# Test TypeScript configuration
npx tsc --noEmit

# Test ESLint configuration
npm run lint

# Test Next.js configuration
npm run build
```

**Expected output:**
- TypeScript: No errors (warnings OK)
- ESLint: May show some warnings
- Build: Should complete successfully

## Task Completion Checklist
Mark each task as complete:

- [ ] Task 1: Next.js configuration created ✅
- [ ] Task 2: TypeScript settings updated ✅
- [ ] Task 3: ESLint configured ✅
- [ ] Task 4: Additional config files created ✅
- [ ] Task 5: Configuration verified ✅

## Critical Configuration Points

**IMAGE DOMAINS**: All external image sources MUST be listed in remotePatterns
**HEADERS**: Security headers are required for production
**TYPESCRIPT**: strict mode is enabled - do not disable
**BUILD ERRORS**: Both TypeScript and ESLint will fail builds on errors

## Common Issues & Solutions

**Issue**: Images not loading from external sources
**Solution**: Add domain to images.remotePatterns in next.config.js

**Issue**: Build fails with TypeScript errors
**Solution**: Fix the errors - do not set ignoreBuildErrors to true

**Issue**: CORS errors on API routes
**Solution**: Check headers configuration in next.config.js

**Issue**: Large file uploads failing
**Solution**: serverActions.bodySizeLimit is set to 10mb

## Success Criteria
- next.config.js exists with all settings
- TypeScript strict mode enabled
- ESLint configured properly
- Build completes without errors
- All config files created

## Next Step
After all tasks show ✅, proceed to Step 05: Create Middleware Configuration