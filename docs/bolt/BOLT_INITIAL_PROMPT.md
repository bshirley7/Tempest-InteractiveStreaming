# Bolt.new Initial Setup Prompt

## Project Overview
You are building **Tempest**, an interactive streaming platform - "Twitch for Education" - that transforms passive video consumption into engaging, data-rich experiences with real-time overlays, chat, and targeted advertising.

## CRITICAL: Optimized for Claude Sonnet

**These instructions are specifically optimized for Claude Sonnet's capabilities in Bolt.new. They include explicit task breakdowns, complete code implementations, and comprehensive error prevention.**

## How to Use These Instructions

### **MANDATORY: Task-Based Execution**

1. **Task Checkboxes**: Each step contains tasks marked with ⏳. Complete ALL tasks before proceeding.

2. **EXACT COMMAND Blocks**: Use commands EXACTLY as written. These are tested and verified.

3. **CRITICAL Warnings**: Pay special attention to sections marked "CRITICAL" - these prevent common failures.

4. **Complete Code Blocks**: Copy entire code blocks, not partial snippets. Every piece is required.

5. **Verification Steps**: Run verification commands after each task to ensure success.

6. **Mark Progress**: Change ⏳ to ✅ after completing each task to track progress.

### **File Naming Convention**
- Original files: `##-filename.md`
- Optimized files: `##-filename-optimized.md`
- **Always use the optimized versions when available**

## Architecture Requirements

### **Tech Stack (DO NOT CHANGE)**
- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: Clerk
- **Database**: Supabase with real-time subscriptions
- **Video**: Cloudflare Stream integration
- **Error Tracking**: Sentry
- **Deployment**: Vercel optimized

### **Claude Sonnet Optimization Patterns**
- **Task Breakdown**: Each instruction split into completable tasks
- **Command Precision**: Exact bash commands with no ambiguity
- **Complete Implementations**: Full code blocks, not partial snippets
- **Error Prevention**: CRITICAL warnings for common pitfalls
- **Verification Built-in**: Test commands after each implementation
- **Progress Tracking**: Checkbox system for task completion

### **Key Principles**
- **Mobile-First**: All components must be responsive
- **Real-Time**: Use Supabase subscriptions with proper cleanup
- **Type Safety**: Every component needs proper TypeScript types
- **Performance**: Optimize for 5,000+ concurrent users
- **Accessibility**: Include proper ARIA labels and keyboard navigation

## Project Structure
```
tempest/
├── app/                    # Next.js App Router pages
├── components/             # Reusable React components
│   ├── ui/                # shadcn/ui components
│   ├── layout/            # Navigation and layout
│   ├── tv-guide/          # Channel grid components
│   ├── video/             # Video player components
│   ├── chat/              # Real-time chat system
│   ├── interactions/      # Interactive overlays
│   ├── analytics/         # Dashboard components
│   └── admin/             # Admin interface
├── lib/                   # Utilities and configurations
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   ├── types/            # TypeScript definitions
│   ├── constants/        # App constants
│   └── supabase/         # Database client
└── docs/bolt/            # These instruction files
```

## IMMEDIATE SETUP INSTRUCTIONS

### **Step 1: Create Next.js Project ⏳**

**EXACT COMMAND - Create the project:**
```bash
npx create-next-app@latest tempest --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*"
```

**EXACT COMMAND - Navigate to project:**
```bash
cd tempest
```

**CRITICAL**: Answer prompts exactly as shown:
- ✅ TypeScript
- ✅ ESLint  
- ✅ Tailwind CSS
- ✅ App Router
- ❌ src/ directory
- ✅ Import alias (@/*)

### **Step 2: Install Core Dependencies ⏳**

**EXACT COMMAND - Install authentication:**
```bash
npm install @clerk/nextjs
```

**EXACT COMMAND - Install database:**
```bash
npm install @supabase/supabase-js @supabase/ssr
```

**EXACT COMMAND - Install UI foundation:**
```bash
npm install clsx tailwind-merge class-variance-authority
npm install lucide-react
npm install @radix-ui/react-slot
```

**EXACT COMMAND - Install utilities:**
```bash
npm install date-fns
npm install @types/node --save-dev
```

### **Step 3: Create Environment Configuration ⏳**

**EXACT COMMAND - Create environment file:**
```bash
touch .env.local
```

**COPY this EXACT content into .env.local:**
```bash
# =============================================================================
# TEMPEST STREAMING PLATFORM - ENVIRONMENT VARIABLES
# =============================================================================

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
CLERK_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
CLERK_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Clerk URLs (automatic routing)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Database URL (from Supabase)
DATABASE_URL=postgresql://postgres:XXXXXXXXXXXX@db.xxxxxxxxxxxxxxxxxxxx.supabase.co:5432/postgres

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Tempest
NODE_ENV=development

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_OVERLAYS=true
NEXT_PUBLIC_ENABLE_ADS=false
NEXT_PUBLIC_ENABLE_DEBUG=true

# Development Specific
NEXT_PUBLIC_DEV_MODE=true
ENABLE_MOCK_DATA=true
```

### **Step 4: Verify Initial Setup ⏳**

**EXACT COMMAND - Test the setup:**
```bash
npm run dev
```

**Expected result**: Development server starts on http://localhost:3000

**EXACT COMMAND - Test TypeScript:**
```bash
npx tsc --noEmit
```

**Expected result**: No errors (warnings are OK)

### **Step 5: Add Documentation Files ⏳**

Now you're ready to add the complete documentation structure. The documentation will be added to:

```
tempest/
└── docs/
    └── bolt/
        ├── PROJECT_OVERVIEW.md
        ├── DEPENDENCIES.md
        ├── SONNET_OPTIMIZATION_GUIDE.md
        └── INSTRUCTIONS/
            ├── 01-create-nextjs-project.md
            ├── 02-install-core-dependencies-optimized.md
            ├── ... (all other instruction files)
```

**CRITICAL**: After adding documentation, continue with the optimized instruction files in sequence.

## CONTINUING WITH OPTIMIZED INSTRUCTIONS

### **Available Optimized Instructions (Use These):**
- ✅ `01-create-nextjs-project.md` (completed above)
- ✅ `02-install-core-dependencies-optimized.md` (partially completed above)
- ✅ `03-create-environment-variables-optimized.md` (completed above)
- ✅ `04-configure-nextjs-settings-optimized.md`
- ✅ `05-create-middleware-configuration-optimized.md`
- ✅ `06-update-tailwind-configuration-optimized.md`
- ✅ `07-create-folder-structure-optimized.md`
- ✅ `08-create-core-utility-files-optimized.md`
- ✅ `09-create-supabase-client-configuration-optimized.md`
- ✅ `15-setup-database-tables-and-initial-data-optimized.md`

### **Next Steps After Documentation is Added:**

1. **Start with**: `docs/bolt/INSTRUCTIONS/04-configure-nextjs-settings-optimized.md`
2. **Follow every**: Task checkbox (⏳ → ✅)
3. **Use EXACT COMMANDS**: Copy exactly as written
4. **Pay attention to**: CRITICAL warnings
5. **Run verification**: Commands after each task

## Critical Implementation Rules

### **SONNET-SPECIFIC RULES:**

#### **EXACT EXECUTION:**
- Copy **EXACT COMMAND** blocks character-for-character
- Use complete code blocks, never partial snippets
- Follow task checkboxes in exact order (⏳ → ✅)
- Run verification commands after each task

#### **CRITICAL WARNINGS:**
- Pay special attention to sections marked "CRITICAL"
- These prevent common failures specific to Claude Sonnet
- Often include workarounds for known limitations

#### **DO NOT MODIFY:**
- Component file names or paths
- Tailwind CSS class names (especially shadcn/ui compatibility)
- TypeScript interfaces (must match Supabase schema exactly)
- Database schema names
- API route structures
- Environment variable names

#### **ALWAYS INCLUDE:**
- `'use client'` directives where specified
- Complete import statements
- Exact Tailwind CSS classes as specified
- Complete TypeScript type definitions
- Error boundaries and loading states
- Real-time subscription cleanup patterns
- Responsive design breakpoints

### **OPTIMIZED COMPONENT PATTERN:**
```typescript
// CRITICAL: Complete pattern for Sonnet
'use client'; // Only when specified in instructions

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';
import type { ComponentNameProps } from '@/lib/types';

// CRITICAL: Props interface with exact typing
interface ComponentProps {
  className?: string;
  // All props explicitly typed
}

export function ComponentName({ 
  className,
  ...props
}: ComponentProps) {
  // CRITICAL: State and effects with cleanup
  useEffect(() => {
    // Setup
    return () => {
      // Cleanup - MANDATORY for subscriptions
    };
  }, []);

  return (
    <div className={cn(
      "exact-tailwind-classes-from-instructions",
      className
    )}>
      {/* Complete implementation */}
    </div>
  );
}
```

## Verification Process

### **Built-in Verification (In Each Optimized Step):**

Each optimized instruction includes:

1. **Task Completion Checklist**:
   ```
   - [ ] Task 1: Description ✅
   - [ ] Task 2: Description ✅
   ```

2. **EXACT COMMAND Verification**:
   ```bash
   # Test TypeScript
   npx tsc --noEmit
   
   # Test specific functionality
   npm run dev
   ```

3. **Common Issues & Solutions**:
   - Pre-identified problems
   - Exact solutions for each

4. **Success Criteria**:
   - Explicit list of what must work
   - How to verify success

### **Additional Verification:**

After completing each step:
1. **Check Task Boxes**: All ⏳ should be ✅
2. **Run Verification Commands**: Provided in each step
3. **Check Console**: No errors should appear
4. **Test Features**: Verify functionality works as described

## Success Criteria

The completed application must:
- ✅ Support 5,000+ concurrent users
- ✅ Have <500ms interaction latency
- ✅ Work seamlessly on mobile devices
- ✅ Include real-time chat and interactions
- ✅ Have admin dashboard for content management
- ✅ Support video streaming with overlays
- ✅ Include comprehensive analytics
- ✅ Be deployable to Vercel in production

## Emergency Guidelines

### **Claude Sonnet Specific Issues:**

1. **Task Confusion**: 
   - Stick to one task at a time
   - Complete ⏳ → ✅ before moving on
   - Use EXACT COMMAND blocks only

2. **Code Completion Issues**:
   - Use complete code blocks from instructions
   - Never try to "improve" or optimize code
   - Copy EXACTLY as written

3. **Import Errors**:
   - Check optimized instructions for exact import statements
   - File paths must match folder structure exactly
   - Use TypeScript interfaces from lib/types

4. **Environment Variables**:
   - Use Step 03 optimized for complete .env.local setup
   - Variable names are case-sensitive
   - Restart dev server after changes

5. **Tailwind Issues**:
   - Use Step 06 optimized for complete Tailwind config
   - Never modify color variable names
   - Check shadcn/ui compatibility warnings

### **Common Solutions:**

- **"Module not found"**: Check Step 07 folder structure
- **"Type errors"**: Use interfaces from Step 08 utilities
- **"Build fails"**: Run verification commands from each step
- **"Styles not working"**: Check Step 06 Tailwind config

## Final Notes for Claude Sonnet

### **Sonnet Optimization Benefits:**
- **Reduced Context Usage**: Task-based structure minimizes token consumption
- **Error Prevention**: CRITICAL warnings prevent common Sonnet pitfalls
- **Complete Implementations**: No guessing or partial code generation
- **Built-in Verification**: Each step includes success testing
- **Progress Tracking**: Checkbox system maintains state across context

### **Success Patterns:**
- **Trust the Instructions**: Optimized specifically for Sonnet capabilities
- **Don't Modify Code**: Exact implementations prevent integration issues
- **Follow Task Order**: Each builds on previous completions
- **Use Verification**: Built-in testing prevents cascading failures
- **Mark Progress**: Checkboxes help maintain context across sessions

### **If Instructions Seem "Too Detailed":**
This is intentional! Sonnet performs better with:
- Explicit step-by-step breakdowns
- Complete code implementations
- Built-in error prevention
- Comprehensive verification

---

**EXECUTION CHECKLIST:**

**Phase 1: Immediate Setup (Do This First)**
- [ ] Step 1: Create Next.js project ✅
- [ ] Step 2: Install core dependencies ✅  
- [ ] Step 3: Create environment configuration ✅
- [ ] Step 4: Verify initial setup ✅
- [ ] Step 5: Add documentation files ✅

**Phase 2: Continue with Documentation (After files are added)**
- [ ] Read: `docs/bolt/PROJECT_OVERVIEW.md`
- [ ] Read: `docs/bolt/SONNET_OPTIMIZATION_GUIDE.md`
- [ ] Continue: `docs/bolt/INSTRUCTIONS/04-configure-nextjs-settings-optimized.md`
- [ ] Follow: All subsequent optimized instructions in sequence

**The optimized instructions will guide you through building a production-ready streaming platform with minimal errors and maximum efficiency.**