# Step 25: Setup Deployment Configuration

## Context
You are building Tempest, an interactive streaming platform. This step configures deployment settings, environment variables, build optimizations, and production configurations for Vercel deployment with proper monitoring and performance optimization.

## Purpose
Deployment configuration ensures the application runs efficiently in production with proper error tracking, analytics, caching, and security headers. This includes Vercel-specific optimizations and production environment setup.

## Prerequisites
- Step 24 completed successfully
- All API routes created
- Environment variables configured
- All components and features implemented

## Task Instructions
Complete each task in order and mark as ✅ when finished:

### Task 1: Create Vercel Configuration ⏳
Create Vercel configuration for optimal deployment settings.

**File to Create:** `vercel.json`

```json
{
  "framework": "nextjs",
  "regions": ["iad1", "sfo1", "lhr1", "hnd1"],
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    },
    "app/api/webhooks/**/*.ts": {
      "maxDuration": 10
    },
    "app/api/content/**/*.ts": {
      "maxDuration": 60
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    },
    {
      "source": "/videos/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/health",
      "destination": "/api/health"
    },
    {
      "source": "/sitemap.xml",
      "destination": "/api/sitemap"
    }
  ],
  "redirects": [
    {
      "source": "/admin",
      "has": [
        {
          "type": "cookie",
          "key": "__session"
        }
      ],
      "destination": "/admin/dashboard",
      "permanent": false
    }
  ],
  "env": {
    "NEXT_PUBLIC_APP_URL": "@app_url",
    "NEXT_PUBLIC_VERCEL_URL": "@vercel_url"
  }
}
```

**Verification:** 
- File created with Vercel deployment configuration
- Regional deployment settings configured
- Security headers and caching rules set
- API function timeout configurations added

### Task 2: Update Next.js Configuration for Production ⏳
Update Next.js config with production optimizations and security settings.

**File to Edit:** `next.config.js`

```javascript
const { withSentryConfig } = require('@sentry/nextjs');

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
    serverComponentsExternalPackages: ['@sentry/nextjs'],
  },
  
  // Image optimization
  images: {
    domains: [
      'cloudflarestream.com',
      'customer-stream.cloudflarestream.com',
      'imagedelivery.net',
      'avatars.githubusercontent.com',
      'img.clerk.com',
      'images.unsplash.com',
    ],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Optimize bundle size
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        common: {
          name: 'common',
          minChunks: 2,
          chunks: 'all',
          enforce: true,
        },
      },
    };

    // Add aliases for better imports
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    };

    return config;
  },

  // Compression
  compress: true,
  
  // Performance optimizations
  swcMinify: true,
  
  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          }
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0'
          }
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      {
        source: '/dashboard',
        destination: '/admin',
        permanent: false,
      },
    ];
  },

  // Rewrites for cleaner URLs
  async rewrites() {
    return [
      {
        source: '/stream/:path*',
        destination: '/watch/:path*',
      },
      {
        source: '/video/:id',
        destination: '/vod/watch/:id',
      },
    ];
  },

  // Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Enable source maps in production for better debugging
  productionBrowserSourceMaps: true,

  // Disable x-powered-by header
  poweredByHeader: false,

  // React strict mode
  reactStrictMode: true,

  // ESLint configuration
  eslint: {
    dirs: ['app', 'components', 'lib', 'scripts'],
  },

  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: false,
  },

  // Trailing slash configuration
  trailingSlash: false,

  // Output configuration for static export if needed
  output: process.env.NEXT_OUTPUT === 'export' ? 'export' : undefined,

  // Standalone output for Docker if needed
  ...(process.env.DOCKER === 'true' && {
    output: 'standalone',
  }),
};

// Sentry configuration
const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: true,
  widenClientFileUpload: true,
  reactComponentAnnotation: {
    enabled: true,
  },
  tunnelRoute: '/monitoring',
  hideSourceMaps: true,
  disableLogger: true,
  automaticVercelMonitors: true,
};

module.exports = process.env.SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
```

**Verification:** 
- File updated with production optimizations
- Security headers and caching configured
- Image optimization settings added
- Webpack bundle optimization implemented

### Task 3: Create Environment Variables Template ⏳
Create a comprehensive environment variables template for production deployment.

**File to Create:** `.env.example`

```bash
# =============================================================================
# TEMPEST STREAMING PLATFORM - ENVIRONMENT VARIABLES
# =============================================================================

# Application Configuration
NEXT_PUBLIC_APP_URL=https://tempest.your-domain.com
NEXT_PUBLIC_APP_NAME="Tempest"
NEXT_PUBLIC_APP_DESCRIPTION="Interactive Streaming Platform"
NODE_ENV=production

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Database Configuration
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

# Cloudflare Configuration
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
CLOUDFLARE_ZONE_ID=your-zone-id
NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN=customer-subdomain

# Cloudflare R2 Storage
CLOUDFLARE_R2_ACCESS_KEY_ID=your-access-key-id
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-secret-access-key
CLOUDFLARE_R2_BUCKET_NAME=tempest-storage
CLOUDFLARE_R2_PUBLIC_URL=https://pub-xxxxxxxxx.r2.dev

# Sentry Configuration
SENTRY_DSN=https://xxxxxxxxx@xxxxxxxxx.ingest.sentry.io/xxxxxxxxx
SENTRY_ORG=your-org-name
SENTRY_PROJECT=tempest-streaming
SENTRY_AUTH_TOKEN=your-auth-token
NEXT_PUBLIC_SENTRY_DSN=https://xxxxxxxxx@xxxxxxxxx.ingest.sentry.io/xxxxxxxxx

# Analytics and Monitoring
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your-analytics-id
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_OVERLAYS=true
NEXT_PUBLIC_ENABLE_ADS=true
NEXT_PUBLIC_ENABLE_DEBUG=false

# Rate Limiting
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# External Services
WEBHOOK_SECRET=your-webhook-secret
ENCRYPTION_KEY=your-32-char-encryption-key

# Development/Staging Specific
NEXT_PUBLIC_DEV_MODE=false
ENABLE_MOCK_DATA=false
BYPASS_AUTH=false

# Performance Configuration
NEXT_PUBLIC_MAX_CONCURRENT_STREAMS=5000
NEXT_PUBLIC_CDN_URL=https://cdn.your-domain.com
NEXT_PUBLIC_VIDEO_QUALITY_DEFAULT=720p

# Security Configuration
CSRF_SECRET=your-csrf-secret
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=https://tempest.your-domain.com

# Email Configuration (if needed)
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@domain.com
SMTP_PASSWORD=your-email-password
FROM_EMAIL=noreply@tempest.your-domain.com

# Social Media Integration (optional)
TWITTER_API_KEY=your-twitter-api-key
YOUTUBE_API_KEY=your-youtube-api-key

# Backup and Storage
BACKUP_BUCKET=tempest-backups
BACKUP_ENCRYPTION_KEY=your-backup-encryption-key

# =============================================================================
# INSTRUCTIONS FOR DEPLOYMENT
# =============================================================================

# 1. Copy this file to .env.local for local development
# 2. Replace all placeholder values with actual credentials
# 3. For Vercel deployment, add these as environment variables in dashboard
# 4. For other platforms, ensure all variables are properly set
# 5. Never commit actual credentials to version control

# =============================================================================
# SECURITY NOTES
# =============================================================================

# - All API keys and secrets should be generated with appropriate permissions
# - Use different keys for development, staging, and production
# - Regularly rotate secrets and API keys
# - Enable webhook signature verification where available
# - Use HTTPS only for all external communications
# - Monitor environment variable access and usage

# =============================================================================
# VERIFICATION CHECKLIST
# =============================================================================

# □ All Clerk keys configured and webhook endpoint set
# □ Supabase project created with proper RLS policies
# □ Cloudflare Stream and R2 configured with proper permissions
# □ Sentry project created and DSN configured
# □ All external service integrations tested
# □ Rate limiting configured if using Upstash Redis
# □ Domain and SSL certificate configured
# □ CDN and caching configured
# □ Monitoring and alerting set up
# □ Backup and disaster recovery planned
```

**Verification:** 
- File created with comprehensive environment variables
- All service configurations included
- Security notes and instructions provided
- Verification checklist added

### Task 4: Create Deployment Scripts ⏳
Create scripts for automated deployment and health checks.

**File to Create:** `scripts/deploy.sh`

```bash
#!/bin/bash

# =============================================================================
# TEMPEST DEPLOYMENT SCRIPT
# =============================================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="tempest-streaming"
BUILD_DIR=".next"
DEPLOYMENT_ENV=${1:-production}

echo -e "${BLUE}🚀 Starting Tempest Deployment${NC}"
echo -e "${BLUE}Environment: ${DEPLOYMENT_ENV}${NC}"
echo -e "${BLUE}Timestamp: $(date)${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Pre-deployment checks
echo -e "${BLUE}🔍 Running pre-deployment checks...${NC}"

# Check Node.js version
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

NODE_VERSION=$(node --version)
print_status "Node.js version: $NODE_VERSION"

# Check npm version
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

NPM_VERSION=$(npm --version)
print_status "npm version: $NPM_VERSION"

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found"
    exit 1
fi

print_status "package.json found"

# Environment variables check
echo -e "\n${BLUE}🔧 Checking environment variables...${NC}"

required_vars=(
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"
    "CLERK_SECRET_KEY"
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "CLOUDFLARE_ACCOUNT_ID"
    "SENTRY_DSN"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    else
        print_status "$var is set"
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_error "Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo -e "  ${RED}- $var${NC}"
    done
    echo ""
    echo "Please set these variables before deployment."
    exit 1
fi

# Install dependencies
echo -e "\n${BLUE}📦 Installing dependencies...${NC}"
npm ci
print_status "Dependencies installed"

# Type checking
echo -e "\n${BLUE}🔍 Running type checks...${NC}"
if npm run type-check; then
    print_status "Type checking passed"
else
    print_error "Type checking failed"
    exit 1
fi

# Linting
echo -e "\n${BLUE}🧹 Running linter...${NC}"
if npm run lint; then
    print_status "Linting passed"
else
    print_warning "Linting warnings found (continuing anyway)"
fi

# Testing (if tests exist)
if npm run test --if-present > /dev/null 2>&1; then
    echo -e "\n${BLUE}🧪 Running tests...${NC}"
    if npm run test; then
        print_status "Tests passed"
    else
        print_error "Tests failed"
        exit 1
    fi
fi

# Build application
echo -e "\n${BLUE}🏗️ Building application...${NC}"
if npm run build; then
    print_status "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

# Check build output
if [ ! -d "$BUILD_DIR" ]; then
    print_error "Build directory not found"
    exit 1
fi

BUILD_SIZE=$(du -sh $BUILD_DIR | cut -f1)
print_status "Build size: $BUILD_SIZE"

# Database migrations (if needed)
if [ -f "scripts/migrate.sh" ]; then
    echo -e "\n${BLUE}🗄️ Running database migrations...${NC}"
    if bash scripts/migrate.sh; then
        print_status "Database migrations completed"
    else
        print_error "Database migrations failed"
        exit 1
    fi
fi

# Security scan (if available)
if command -v npm audit &> /dev/null; then
    echo -e "\n${BLUE}🔒 Running security audit...${NC}"
    if npm audit --audit-level moderate; then
        print_status "Security audit passed"
    else
        print_warning "Security vulnerabilities found (check npm audit output)"
    fi
fi

# Pre-deployment health check
echo -e "\n${BLUE}❤️ Running health checks...${NC}"

# Check if required services are accessible
if curl -f -s "$NEXT_PUBLIC_SUPABASE_URL/health" > /dev/null; then
    print_status "Supabase is accessible"
else
    print_warning "Supabase health check failed"
fi

# Deployment
echo -e "\n${BLUE}🚀 Deploying to ${DEPLOYMENT_ENV}...${NC}"

case $DEPLOYMENT_ENV in
    "production")
        if command -v vercel &> /dev/null; then
            vercel --prod --yes
            print_status "Deployed to Vercel production"
        else
            print_error "Vercel CLI not found"
            exit 1
        fi
        ;;
    "staging")
        if command -v vercel &> /dev/null; then
            vercel --yes
            print_status "Deployed to Vercel staging"
        else
            print_error "Vercel CLI not found"
            exit 1
        fi
        ;;
    *)
        print_error "Unknown deployment environment: $DEPLOYMENT_ENV"
        exit 1
        ;;
esac

# Post-deployment verification
echo -e "\n${BLUE}✅ Running post-deployment checks...${NC}"

# Wait a moment for deployment to propagate
sleep 10

# Get deployment URL (for Vercel)
if command -v vercel &> /dev/null; then
    DEPLOYMENT_URL=$(vercel ls --scope $(vercel whoami) | grep $PROJECT_NAME | head -1 | awk '{print $2}')
    if [ ! -z "$DEPLOYMENT_URL" ]; then
        echo -e "${BLUE}🌐 Deployment URL: https://$DEPLOYMENT_URL${NC}"
        
        # Basic health check
        if curl -f -s "https://$DEPLOYMENT_URL/api/health" > /dev/null; then
            print_status "Application health check passed"
        else
            print_warning "Application health check failed"
        fi
    fi
fi

# Cleanup
echo -e "\n${BLUE}🧹 Cleaning up...${NC}"
# Remove any temporary files if needed
print_status "Cleanup completed"

# Success message
echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}Environment: ${DEPLOYMENT_ENV}${NC}"
echo -e "${GREEN}Timestamp: $(date)${NC}"

if [ ! -z "$DEPLOYMENT_URL" ]; then
    echo -e "${GREEN}URL: https://$DEPLOYMENT_URL${NC}"
fi

echo ""
echo -e "${BLUE}📋 Next steps:${NC}"
echo "1. Verify the application is working correctly"
echo "2. Run end-to-end tests if available"
echo "3. Monitor logs for any errors"
echo "4. Update documentation if needed"
echo ""

exit 0
```

**File to Create:** `app/api/health/route.ts`

```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const startTime = Date.now();
  
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    checks: {
      database: 'unknown',
      auth: 'unknown',
      sentry: 'unknown',
    },
    responseTime: 0,
  };

  // Database check
  try {
    const supabase = createClient();
    const { error } = await supabase.from('channels').select('count').limit(1);
    health.checks.database = error ? 'unhealthy' : 'healthy';
  } catch (error) {
    health.checks.database = 'unhealthy';
  }

  // Auth service check
  health.checks.auth = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'healthy' : 'unhealthy';

  // Sentry check
  health.checks.sentry = process.env.SENTRY_DSN ? 'healthy' : 'unhealthy';

  // Calculate response time
  health.responseTime = Date.now() - startTime;

  // Determine overall status
  const allChecksHealthy = Object.values(health.checks).every(check => check === 'healthy');
  health.status = allChecksHealthy ? 'healthy' : 'degraded';

  const statusCode = health.status === 'healthy' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
```

**Verification:** 
- Deployment script created with comprehensive checks
- Health check API endpoint created
- Error handling and validation implemented
- Post-deployment verification included

### Task 5: Create Docker Configuration (Optional) ⏳
Create Docker configuration for containerized deployment.

**File to Create:** `Dockerfile`

```dockerfile
# =============================================================================
# TEMPEST STREAMING PLATFORM - DOCKERFILE
# =============================================================================

# Use the official Node.js runtime as base image
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci --only=production

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start the application
CMD ["node", "server.js"]
```

**File to Create:** `docker-compose.yml`

```yaml
# =============================================================================
# TEMPEST STREAMING PLATFORM - DOCKER COMPOSE
# =============================================================================

version: '3.8'

services:
  tempest:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_APP_URL=http://localhost:3000
    env_file:
      - .env.local
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.tempest.rule=Host(`tempest.localhost`)"
      - "traefik.http.services.tempest.loadbalancer.server.port=3000"

  # Optional: Redis for caching (if using Upstash locally)
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data

  # Optional: Load balancer/reverse proxy
  traefik:
    image: traefik:v2.10
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    restart: unless-stopped

volumes:
  redis_data:

networks:
  default:
    name: tempest-network
```

**File to Create:** `.dockerignore`

```
# Dependencies
node_modules
npm-debug.log*

# Build outputs
.next
out
dist
build

# Environment files
.env*
!.env.example

# Git
.git
.gitignore

# Documentation
README.md
docs/

# IDE files
.vscode
.idea
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage
*.lcov

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache
.cache
.parcel-cache

# Next.js
.next/
out/

# Nuxt.js
.nuxt
dist

# Gatsby files
.cache/
public

# Storybook build outputs
.out
.storybook-out

# Temporary folders
tmp/
temp/

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Testing
coverage/
.nyc_output

# Misc
*.tsbuildinfo
.eslintcache

# Vercel
.vercel

# Sentry
.sentryclirc
```

**Verification:** 
- Docker configuration created for containerized deployment
- Multi-stage build for optimization
- Health checks and security best practices
- Docker Compose for local development

## Task Completion Checklist
Mark each task as complete when finished:

- [ ] Task 1: Vercel configuration created ✅
- [ ] Task 2: Next.js production config updated ✅  
- [ ] Task 3: Environment variables template created ✅
- [ ] Task 4: Deployment scripts created ✅
- [ ] Task 5: Docker configuration created ✅

## Verification Steps
After completing all tasks:

1. Check all deployment files exist:
   ```bash
   ls -la vercel.json next.config.js .env.example
   ls -la scripts/deploy.sh
   ls -la Dockerfile docker-compose.yml
   ```

2. Test build process:
   ```bash
   npm run build
   npm run start
   ```

3. Test health endpoint:
   ```bash
   curl http://localhost:3000/api/health
   ```

## Success Criteria
- All deployment configuration files created
- Production optimizations implemented
- Security headers and caching configured
- Environment variables documented
- Health checks and monitoring setup
- Docker configuration for containerization

## Important Notes
- All configurations optimized for production use
- Security headers and best practices implemented
- Environment variables properly documented
- Deployment scripts include comprehensive checks
- Health monitoring and error tracking configured

## Troubleshooting
If you encounter issues:
1. Verify all environment variables are set correctly
2. Check build process completes without errors
3. Test health endpoint returns 200 status
4. Ensure all external services are configured
5. Validate Docker build if using containerization

## Final Step
This completes the comprehensive setup for Tempest streaming platform. All components, features, and deployment configurations are now documented and ready for implementation in Bolt.new.