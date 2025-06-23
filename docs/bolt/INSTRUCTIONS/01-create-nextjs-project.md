# Step 01: Create Next.js Project

## Context
You are building Tempest, an interactive streaming platform. This is the foundation step that creates the Next.js application with TypeScript, Tailwind CSS, and the App Router.

## Purpose
This step creates the project foundation with exact settings required for all subsequent steps. Any deviation from these settings will cause issues in later steps.

## Prerequisites
- Node.js 18+ installed
- npm or yarn package manager available
- Terminal/command line access

## Task Instructions
Complete each task in order and mark as ✅ when finished:

### Task 1: Create Next.js Application ⏳

**EXACT COMMAND TO RUN:**
```bash
npx create-next-app@latest tempest --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```

**CRITICAL: When prompted, select these EXACT options:**
- Would you like to use ESLint? → **Yes**
- Would you like to use `src/` directory? → **No** (already set by flag)
- Would you like to use App Router? → **Yes** (already set by flag)
- Would you like to customize the default import alias? → **No** (already set by flag)

**⚠️ IMPORTANT**: Do NOT change the project name "tempest" or any flags

### Task 2: Navigate to Project Directory ⏳

```bash
cd tempest
```

### Task 3: Verify Installation ⏳

**Run these verification commands:**
```bash
# Check package.json exists
ls -la package.json

# Verify Next.js version (should be 15.x)
npm list next

# Verify TypeScript is configured
ls -la tsconfig.json

# Verify Tailwind CSS is configured
ls -la tailwind.config.ts
```

### Task 4: Clean Default Files ⏳

**Remove default content and prepare for Tempest:**
```bash
# Update default page
echo "export default function Home() {
  return (
    <main className=\"flex min-h-screen items-center justify-center\">
      <h1 className=\"text-4xl font-bold\">Tempest Streaming Platform</h1>
    </main>
  );
}" > app/page.tsx

# Clean globals.css but keep Tailwind directives
echo "@tailwind base;
@tailwind components;
@tailwind utilities;" > app/globals.css

# Remove default favicon
rm -f app/favicon.ico
```

### Task 5: Initial Test Run ⏳

```bash
npm run dev
```

**Verification:**
1. Open http://localhost:3000
2. Should see "Tempest Streaming Platform"
3. No console errors
4. Stop server with Ctrl+C

## Task Completion Checklist
Mark each task as complete:

- [ ] Task 1: Next.js app created with name "tempest" ✅
- [ ] Task 2: Navigated to project directory ✅
- [ ] Task 3: Installation verified ✅
- [ ] Task 4: Default files cleaned ✅
- [ ] Task 5: Test run successful ✅

## Verification Steps
After completing all tasks:

1. Check project structure:
   ```bash
   ls -la
   ls -la app/
   ```

2. Verify configuration files:
   - `package.json` exists
   - `next.config.js` exists
   - `tsconfig.json` exists
   - `tailwind.config.ts` exists
   - `app/` directory exists

## Success Criteria
- Next.js 15+ installed
- TypeScript configured
- Tailwind CSS configured
- App Router enabled
- Import alias @/* working
- Development server runs without errors

## Common Issues & Solutions

**Issue**: Command not found error
**Solution**: Ensure Node.js 18+ is installed: `node --version`

**Issue**: Port 3000 already in use
**Solution**: Stop other processes or use: `npm run dev -- -p 3001`

**Issue**: TypeScript errors on first run
**Solution**: This is normal. Run `npm run dev` again.

## Next Step
After all tasks show ✅, proceed to Step 02: Install Core Dependencies