# Step 02: Install Core Dependencies

## Context
You are building Tempest, an interactive streaming platform. This step installs all required dependencies with exact versions to ensure compatibility.

## Purpose
Installing the correct package versions is CRITICAL. Version mismatches will cause build failures and runtime errors in later steps.

## Prerequisites
- Step 01 completed successfully
- You are in the `tempest` project directory
- npm is available

## Task Instructions
Complete each task in order and mark as ✅ when finished:

### Task 1: Install Authentication Dependencies ⏳

**EXACT COMMANDS TO RUN IN SEQUENCE:**
```bash
# Clerk authentication
npm install @clerk/nextjs@^5.7.5 @clerk/themes@^2.1.42
```

**Verification:**
```bash
npm list @clerk/nextjs
# Should show: @clerk/nextjs@5.7.5 or higher
```

### Task 2: Install Database Dependencies ⏳

**EXACT COMMANDS:**
```bash
# Supabase packages
npm install @supabase/supabase-js@^2.48.0 @supabase/auth-helpers-nextjs@^0.10.0 @supabase/auth-helpers-react@^0.5.0 @supabase/realtime-js@^2.10.9
```

**⚠️ CRITICAL**: These exact versions prevent real-time subscription issues

### Task 3: Install Video Player Dependencies ⏳

**EXACT COMMANDS:**
```bash
# Video.js and themes
npm install video.js@^8.17.0 @videojs/themes@^1.0.1
npm install -D @types/video.js@^7.3.58
```

**IMPORTANT**: @types/video.js is a dev dependency (note the -D flag)

### Task 4: Install UI Component Libraries ⏳

**EXACT COMMANDS IN ORDER:**
```bash
# Radix UI primitives (required for shadcn/ui)
npm install @radix-ui/react-avatar@^1.0.4 @radix-ui/react-dialog@^1.0.5 @radix-ui/react-dropdown-menu@^2.0.6 @radix-ui/react-label@^2.0.2 @radix-ui/react-select@^2.0.0 @radix-ui/react-separator@^1.0.3 @radix-ui/react-slot@^1.0.2 @radix-ui/react-switch@^1.0.3 @radix-ui/react-tabs@^1.0.4 @radix-ui/react-toast@^1.1.5

# Additional Radix components
npm install @radix-ui/react-slider@^1.1.2 @radix-ui/react-progress@^1.0.3 @radix-ui/react-scroll-area@^1.0.5 @radix-ui/react-tooltip@^1.0.7

# UI utilities
npm install class-variance-authority@^0.7.0 clsx@^2.1.0 tailwind-merge@^2.5.5
npm install cmdk@^0.2.1 react-day-picker@^8.10.1
```

### Task 5: Install Animation and Chart Libraries ⏳

**EXACT COMMANDS:**
```bash
# Framer Motion for animations
npm install framer-motion@^11.11.0

# Recharts for analytics
npm install recharts@^2.13.3

# Utility libraries
npm install lucide-react@^0.441.0 date-fns@^3.6.0 zod@^3.23.8
```

### Task 6: Install Development Dependencies ⏳

**EXACT COMMANDS:**
```bash
# Development tools
npm install -D @types/node@^20.17.9 @tailwindcss/typography@^0.5.15 tailwindcss-animate@^1.0.7
```

### Task 7: Install Monitoring Dependencies ⏳

**EXACT COMMANDS:**
```bash
# Sentry for error tracking
npm install @sentry/nextjs@^8.42.0
```

### Task 8: Verify All Dependencies ⏳

**Create verification script:**
```bash
# Create a verification file
echo '{
  "dependencies": {
    "@clerk/nextjs": "^5.7.5",
    "@clerk/themes": "^2.1.42",
    "@supabase/supabase-js": "^2.48.0",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/auth-helpers-react": "^0.5.0",
    "@supabase/realtime-js": "^2.10.9",
    "video.js": "^8.17.0",
    "@videojs/themes": "^1.0.1",
    "framer-motion": "^11.11.0",
    "recharts": "^2.13.3",
    "lucide-react": "^0.441.0",
    "date-fns": "^3.6.0",
    "zod": "^3.23.8",
    "@sentry/nextjs": "^8.42.0"
  }
}' > required-deps.json

# Check if all are installed
npm list --depth=0
```

## Task Completion Checklist
Mark each task as complete:

- [ ] Task 1: Authentication dependencies installed ✅
- [ ] Task 2: Database dependencies installed ✅
- [ ] Task 3: Video player dependencies installed ✅
- [ ] Task 4: UI component libraries installed ✅
- [ ] Task 5: Animation and chart libraries installed ✅
- [ ] Task 6: Development dependencies installed ✅
- [ ] Task 7: Monitoring dependencies installed ✅
- [ ] Task 8: All dependencies verified ✅

## Critical Package Version Reference

**EXACT VERSIONS TO VERIFY:**
```json
{
  "@clerk/nextjs": "^5.7.5",
  "@supabase/supabase-js": "^2.48.0",
  "video.js": "^8.17.0",
  "framer-motion": "^11.11.0",
  "recharts": "^2.13.3",
  "@sentry/nextjs": "^8.42.0"
}
```

## Common Issues & Solutions

**Issue**: npm ERR! peer dep missing
**Solution**: Add `--legacy-peer-deps` flag to install commands

**Issue**: Module not found errors
**Solution**: Delete node_modules and package-lock.json, then run `npm install`

**Issue**: TypeScript errors for packages
**Solution**: Ensure all @types packages are installed as devDependencies

## Success Criteria
- All packages installed without errors
- No peer dependency warnings
- `npm list` shows all required packages
- package.json contains all dependencies with correct versions

## Next Step
After all tasks show ✅, proceed to Step 03: Create Environment Variables