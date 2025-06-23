# Step 06: Update Tailwind Configuration

## Context
You are building Temptest, an interactive streaming platform. This step updates Tailwind CSS configuration to include CSS variables for consistent theming and animations that work with shadcn/ui components.

## Prerequisites
- Step 05 completed successfully
- You are in the `temptest` project directory
- Tailwind CSS installed

## Task
Replace the default `tailwind.config.ts` with Temptest-specific configuration that includes design system colors, animations, and component styling.

## Exact File to Replace

Replace the entire contents of `tailwind.config.ts` with:

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
        "fade-out": "fade-out 0.2s ease-out",
        "slide-in-from-top": "slide-in-from-top 0.3s ease-out",
        "slide-out-to-top": "slide-out-to-top 0.3s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

export default config
```

## Configuration Features

### Dark Mode Support
- `darkMode: ["class"]` - Enables class-based dark mode toggle

### Content Paths
- Scans all TypeScript/TSX files in pages, components, and app directories
- Ensures Tailwind includes all classes used in components

### Design System Colors
- Uses CSS variables for consistent theming
- Supports light/dark mode switching
- Compatible with shadcn/ui component library

### Container Settings
- Centered containers with responsive padding
- Max width of 1400px for 2xl screens

### Custom Animations
- Accordion animations for collapsible content
- Fade animations for overlays and modals
- Slide animations for notifications and chat

### Border Radius System
- Variable-based radius for consistent component styling
- Three sizes: sm, md, lg based on CSS variable

## Verification Steps
1. Confirm `tailwind.config.ts` contains the exact content above
2. Check TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```
3. Test Tailwind build:
   ```bash
   npx tailwindcss -i ./app/globals.css -o ./test-output.css --watch
   ```
   (Then delete the test file)

## Success Criteria
- `tailwind.config.ts` updated with design system configuration
- TypeScript compilation succeeds
- Tailwind CSS can process the configuration without errors
- Animation and color utilities are available

## Design System Benefits
- Consistent spacing and colors across components
- Smooth animations for user interactions
- Dark mode support for better accessibility
- Responsive design utilities
- Compatible with shadcn/ui components

## Next Step
After completing this step, proceed to Step 07: Create Project Folder Structure.