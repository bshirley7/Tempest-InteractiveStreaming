# Step 06: Update Tailwind Configuration

## Context
You are building Tempest, an interactive streaming platform. This step updates Tailwind CSS configuration to include CSS variables for consistent theming and animations that work with shadcn/ui components.

## Purpose
Proper Tailwind configuration is CRITICAL for design consistency and shadcn/ui integration. Incorrect configuration will cause component styling failures and animation issues.

## Prerequisites
- Step 05 completed successfully
- You are in the `tempest` project directory
- Tailwind CSS installed

## Task Instructions
Complete each task in order and mark as ✅ when finished:

### Task 1: Update Tailwind Configuration ⏳

**REPLACE entire contents of tailwind.config.ts with EXACT content:**

```typescript
import type { Config } from 'tailwindcss';

// CRITICAL: Tempest streaming platform Tailwind configuration
const config: Config = {
  // CRITICAL: Enable class-based dark mode
  darkMode: ["class"],
  
  // CRITICAL: Content paths for Tailwind to scan
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  
  theme: {
    // CRITICAL: Container settings for responsive design
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    
    extend: {
      // CRITICAL: Design system colors using CSS variables
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // CRITICAL: Streaming platform specific colors
        stream: {
          live: "hsl(356, 69%, 61%)", // Red for live indicators
          "campus-life": "hsl(217, 91%, 60%)", // Blue
          explore: "hsl(142, 69%, 58%)", // Green  
          create: "hsl(32, 95%, 59%)", // Orange
          chill: "hsl(262, 69%, 65%)", // Purple
        },
        chat: {
          user: "hsl(210, 11%, 15%)",
          moderator: "hsl(142, 69%, 58%)",
          admin: "hsl(356, 69%, 61%)",
        },
      },
      
      // CRITICAL: Border radius system
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      
      // CRITICAL: Custom keyframes for streaming platform
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "fade-out": {
          from: { opacity: "1" },
          to: { opacity: "0" },
        },
        "slide-in-from-top": {
          from: { transform: "translateY(-100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-out-to-top": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(-100%)" },
        },
        "slide-in-from-bottom": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-out-to-bottom": {
          from: { transform: "translateY(0)" },
          to: { transform: "translateY(100%)" },
        },
        "pulse-live": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "bounce-emoji": {
          "0%, 20%, 53%, 80%, 100%": { transform: "translateY(0px)" },
          "40%, 43%": { transform: "translateY(-8px)" },
          "70%": { transform: "translateY(-4px)" },
          "90%": { transform: "translateY(-2px)" },
        },
      },
      
      // CRITICAL: Animations for interactive elements
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "slide-out-to-top": "slide-out-to-top 0.3s ease-out",
        "slide-in-from-bottom": "slide-in-from-bottom 0.3s ease-out",
        "slide-out-to-bottom": "slide-out-to-bottom 0.3s ease-out",
        "pulse-live": "pulse-live 2s ease-in-out infinite",
        "bounce-emoji": "bounce-emoji 1s ease-in-out",
      },
      
      // CRITICAL: Typography scale for video content
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
      },
      
      // CRITICAL: Z-index scale for overlays
      zIndex: {
        'overlay': '1000',
        'chat': '1100',
        'modal': '1200',
        'toast': '1300',
        'tooltip': '1400',
      },
    },
  },
  
  // CRITICAL: Required plugins
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

**⚠️ CRITICAL WARNING**: Do NOT modify the color variable names - they must match shadcn/ui exactly

### Task 2: Verify Tailwind Configuration ⏳

**EXACT COMMAND - Check TypeScript compilation:**
```bash
npx tsc --noEmit
```

**EXACT COMMAND - Test Tailwind build:**
```bash
npx tailwindcss -i ./app/globals.css -o ./test-output.css --minify
```

**EXACT COMMAND - Clean up test file:**
```bash
rm -f ./test-output.css
```

### Task 3: Test Color Variables ⏳

**CREATE app/test-tailwind/page.tsx to test configuration:**
```typescript
export default function TestTailwindPage() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-4xl font-bold text-foreground">Tailwind Test</h1>
      
      {/* Test design system colors */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-primary text-primary-foreground p-4 rounded-lg">
          Primary
        </div>
        <div className="bg-secondary text-secondary-foreground p-4 rounded-lg">
          Secondary
        </div>
        <div className="bg-accent text-accent-foreground p-4 rounded-lg">
          Accent
        </div>
        <div className="bg-muted text-muted-foreground p-4 rounded-lg">
          Muted
        </div>
      </div>
      
      {/* Test streaming colors */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-stream-campus-life text-white p-4 rounded-lg">
          Campus Life
        </div>
        <div className="bg-stream-explore text-white p-4 rounded-lg">
          Explore
        </div>
        <div className="bg-stream-create text-white p-4 rounded-lg">
          Create
        </div>
        <div className="bg-stream-chill text-white p-4 rounded-lg">
          Chill
        </div>
      </div>
      
      {/* Test animations */}
      <div className="space-y-4">
        <div className="bg-stream-live text-white p-4 rounded-lg animate-pulse-live">
          LIVE Animation
        </div>
        <div className="bg-card text-card-foreground p-4 rounded-lg animate-fade-in">
          Fade In Animation
        </div>
      </div>
    </div>
  );
}
```

## Task Completion Checklist
Mark each task as complete:

- [ ] Task 1: Tailwind configuration updated ✅
- [ ] Task 2: Configuration verified ✅  
- [ ] Task 3: Color variables tested ✅

## Critical Configuration Notes

**CSS VARIABLES**: All colors use hsl(var(--name)) format for shadcn/ui compatibility
**CONTENT PATHS**: Include lib/ folder to scan all TypeScript files
**ANIMATIONS**: Streaming-specific animations for live indicators and chat
**Z-INDEX SCALE**: Proper layering for video overlays and modals

## Common Issues & Solutions

**Issue**: Colors not applying correctly
**Solution**: Ensure CSS variables are defined in globals.css

**Issue**: Animations not working
**Solution**: Verify tailwindcss-animate plugin is installed

**Issue**: Build errors with TypeScript
**Solution**: Check for syntax errors in tailwind.config.ts

**Issue**: Styles not updating in development
**Solution**: Restart dev server after config changes

## Success Criteria
- tailwind.config.ts contains streaming platform colors
- TypeScript compilation succeeds
- Test page shows all colors correctly
- Animations work smoothly
- No console errors

## Next Step
After all tasks show ✅, proceed to Step 07: Create Project Folder Structure