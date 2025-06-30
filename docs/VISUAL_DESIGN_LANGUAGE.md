# Tempest Visual Design Language

## Overview

This document defines the visual design language for Tempest, aligning with modern streaming platform aesthetics inspired by AppleTV, GoogleTV, with distinctive elements from Hulu and HBO Max. Our design philosophy emphasizes premium content presentation, fluid interactions, and a sophisticated color palette built around our brand gradient.

## Brand Identity

### Core Gradient
Extracted from `public/logo.svg`:
```css
/* Primary Brand Gradient */
linear-gradient(to right, #A855F7 20%, #6366F1 70%, #3B82F6 100%)

/* Color Stops */
--brand-purple: #A855F7;  /* Purple 500 */
--brand-indigo: #6366F1;  /* Indigo 500 */
--brand-blue: #3B82F6;    /* Blue 500 */
```

### Design Principles
1. **Content First**: Let the content shine with minimal UI interference
2. **Depth & Dimension**: Use shadows, blurs, and layers to create spatial hierarchy
3. **Fluid Motion**: Smooth, physics-based animations that feel natural
4. **Premium Feel**: High contrast, bold typography, and refined details
5. **Accessibility**: WCAG AA compliance with enhanced focus states

## Color System

### Primary Palette
```css
:root {
  /* Brand Colors */
  --brand-gradient: linear-gradient(135deg, #A855F7 0%, #6366F1 50%, #3B82F6 100%);
  --brand-purple: #A855F7;
  --brand-purple-light: #C084FC;
  --brand-purple-dark: #9333EA;
  
  --brand-indigo: #6366F1;
  --brand-indigo-light: #818CF8;
  --brand-indigo-dark: #4F46E5;
  
  --brand-blue: #3B82F6;
  --brand-blue-light: #60A5FA;
  --brand-blue-dark: #2563EB;
  
  /* Semantic Colors */
  --success: #10B981;
  --warning: #F59E0B;
  --error: #EF4444;
  --info: #3B82F6;
}

/* Light Theme */
.light {
  /* Backgrounds */
  --background: 0 0% 100%;
  --background-subtle: 0 0% 98%;
  --background-muted: 0 0% 96%;
  --surface: 0 0% 100%;
  --surface-hover: 0 0% 98%;
  --overlay: 0 0% 0% / 0.5;
  
  /* Foregrounds */
  --foreground: 0 0% 9%;
  --foreground-muted: 0 0% 45%;
  --foreground-subtle: 0 0% 64%;
  
  /* Borders */
  --border: 0 0% 89%;
  --border-strong: 0 0% 82%;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}

/* Dark Theme */
.dark {
  /* Backgrounds */
  --background: 0 0% 7%;
  --background-subtle: 0 0% 9%;
  --background-muted: 0 0% 12%;
  --surface: 0 0% 11%;
  --surface-hover: 0 0% 14%;
  --overlay: 0 0% 100% / 0.1;
  
  /* Foregrounds */
  --foreground: 0 0% 95%;
  --foreground-muted: 0 0% 65%;
  --foreground-subtle: 0 0% 45%;
  
  /* Borders */
  --border: 0 0% 18%;
  --border-strong: 0 0% 27%;
  
  /* Enhanced shadows for dark mode */
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.2);
  --shadow-md: 0 4px 8px -1px rgb(0 0 0 / 0.3);
  --shadow-lg: 0 12px 20px -3px rgb(0 0 0 / 0.4);
  --shadow-xl: 0 25px 35px -5px rgb(0 0 0 / 0.5);
}
```

### Gradient System
```css
/* UI Gradients */
--gradient-brand: linear-gradient(135deg, var(--brand-purple) 0%, var(--brand-indigo) 50%, var(--brand-blue) 100%);
--gradient-subtle: linear-gradient(135deg, var(--brand-purple) / 0.1 0%, var(--brand-blue) / 0.1 100%);
--gradient-overlay: linear-gradient(to top, rgb(0 0 0 / 0.8) 0%, transparent 100%);
--gradient-card-hover: linear-gradient(135deg, var(--brand-purple) / 0.05 0%, transparent 100%);

/* Content Gradients */
--gradient-featured: linear-gradient(to right, rgb(0 0 0 / 0.9) 0%, transparent 70%);
--gradient-thumbnail: radial-gradient(ellipse at center, transparent 0%, rgb(0 0 0 / 0.4) 100%);
```

## Typography

### Font Stack
```css
/* Display Font (Headings) */
--font-display: 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Body Font */
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Monospace Font */
--font-mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
```

### Type Scale
```css
/* Fluid Typography with clamp() */
--text-xs: clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem);
--text-sm: clamp(0.875rem, 0.825rem + 0.25vw, 1rem);
--text-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
--text-lg: clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem);
--text-xl: clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem);
--text-2xl: clamp(1.5rem, 1.35rem + 0.75vw, 1.875rem);
--text-3xl: clamp(1.875rem, 1.65rem + 1.125vw, 2.25rem);
--text-4xl: clamp(2.25rem, 1.95rem + 1.5vw, 3rem);
--text-5xl: clamp(3rem, 2.55rem + 2.25vw, 3.75rem);

/* Font Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
--font-black: 900;
```

## Spacing System

### Base Unit
```css
--space-unit: 0.25rem; /* 4px */

/* Spacing Scale */
--space-0: 0;
--space-1: calc(var(--space-unit) * 1);   /* 4px */
--space-2: calc(var(--space-unit) * 2);   /* 8px */
--space-3: calc(var(--space-unit) * 3);   /* 12px */
--space-4: calc(var(--space-unit) * 4);   /* 16px */
--space-5: calc(var(--space-unit) * 5);   /* 20px */
--space-6: calc(var(--space-unit) * 6);   /* 24px */
--space-8: calc(var(--space-unit) * 8);   /* 32px */
--space-10: calc(var(--space-unit) * 10); /* 40px */
--space-12: calc(var(--space-unit) * 12); /* 48px */
--space-16: calc(var(--space-unit) * 16); /* 64px */
--space-20: calc(var(--space-unit) * 20); /* 80px */
--space-24: calc(var(--space-unit) * 24); /* 96px */
```

## Layout System

### Container Widths
```css
--container-xs: 20rem;     /* 320px */
--container-sm: 24rem;     /* 384px */
--container-md: 28rem;     /* 448px */
--container-lg: 32rem;     /* 512px */
--container-xl: 36rem;     /* 576px */
--container-2xl: 42rem;    /* 672px */
--container-3xl: 48rem;    /* 768px */
--container-4xl: 56rem;    /* 896px */
--container-5xl: 64rem;    /* 1024px */
--container-6xl: 72rem;    /* 1152px */
--container-7xl: 80rem;    /* 1280px */
--container-full: 100%;
```

### Grid System
```css
/* Responsive Grid */
--grid-cols-mobile: 4;
--grid-cols-tablet: 8;
--grid-cols-desktop: 12;

/* Content Grids */
--content-grid-mobile: repeat(2, 1fr);
--content-grid-tablet: repeat(3, 1fr);
--content-grid-desktop: repeat(4, 1fr);
--content-grid-wide: repeat(5, 1fr);
--content-grid-ultra: repeat(6, 1fr);
```

## Border Radius

```css
--radius-none: 0;
--radius-sm: 0.25rem;     /* 4px */
--radius-md: 0.375rem;    /* 6px */
--radius-lg: 0.5rem;      /* 8px */
--radius-xl: 0.75rem;     /* 12px */
--radius-2xl: 1rem;       /* 16px */
--radius-3xl: 1.5rem;     /* 24px */
--radius-full: 9999px;
```

## Elevation System

### Shadow Tokens
```css
/* Elevation Levels */
--elevation-low: 
  0 1px 2px 0 rgb(0 0 0 / 0.05),
  0 0 0 1px rgb(0 0 0 / 0.02);

--elevation-medium: 
  0 4px 6px -1px rgb(0 0 0 / 0.07),
  0 2px 4px -2px rgb(0 0 0 / 0.05),
  0 0 0 1px rgb(0 0 0 / 0.02);

--elevation-high: 
  0 10px 15px -3px rgb(0 0 0 / 0.1),
  0 4px 6px -4px rgb(0 0 0 / 0.07),
  0 0 0 1px rgb(0 0 0 / 0.02);

--elevation-higher: 
  0 20px 25px -5px rgb(0 0 0 / 0.15),
  0 8px 10px -6px rgb(0 0 0 / 0.1),
  0 0 0 1px rgb(0 0 0 / 0.02);

/* Glow Effects */
--glow-brand: 0 0 20px var(--brand-purple) / 0.3;
--glow-subtle: 0 0 10px var(--brand-indigo) / 0.2;
```

## Animation System

### Timing Functions
```css
/* Easing Curves */
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--ease-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);

/* Duration Scale */
--duration-fast: 150ms;
--duration-normal: 250ms;
--duration-slow: 350ms;
--duration-slower: 500ms;
--duration-slowest: 700ms;
```

### Animation Presets
```css
/* Micro-interactions */
@keyframes pulse-brand {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Page Transitions */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
```

## Component Design Patterns

### Glass Morphism
```css
.glass {
  background: hsl(var(--background) / 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid hsl(var(--border) / 0.2);
}

.glass-strong {
  background: hsl(var(--background) / 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid hsl(var(--border) / 0.3);
}
```

### Gradient Borders
```css
.gradient-border {
  position: relative;
  background: hsl(var(--background));
  background-clip: padding-box;
  border: 1px solid transparent;
}

.gradient-border::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1px;
  background: var(--gradient-brand);
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}
```

### Hover Effects
```css
/* Card Hover */
.card-hover {
  transition: all var(--duration-normal) var(--ease-out);
}

.card-hover:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: var(--elevation-high);
  background: linear-gradient(
    135deg, 
    hsl(var(--surface-hover)), 
    hsl(var(--surface-hover) / 0.95)
  );
}

/* Button Hover */
.button-hover {
  position: relative;
  overflow: hidden;
  transition: all var(--duration-normal) var(--ease-out);
}

.button-hover::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--gradient-brand);
  opacity: 0;
  transition: opacity var(--duration-normal) var(--ease-out);
}

.button-hover:hover::before {
  opacity: 0.1;
}
```

### Focus States
```css
.focus-ring {
  outline: none;
  position: relative;
}

.focus-ring:focus-visible::after {
  content: '';
  position: absolute;
  inset: -3px;
  border-radius: calc(var(--radius-md) + 3px);
  border: 2px solid var(--brand-purple);
  box-shadow: 0 0 0 2px hsl(var(--background));
}
```

## Content Presentation

### Hero Section
```css
.hero {
  position: relative;
  min-height: 80vh;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    hsl(var(--background) / 0.9) 80%,
    hsl(var(--background)) 100%
  );
}

.hero-content {
  position: absolute;
  bottom: 20%;
  left: 5%;
  max-width: 600px;
}

.hero-title {
  font-size: var(--text-5xl);
  font-weight: var(--font-black);
  line-height: 1.1;
  background: var(--gradient-brand);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Content Cards
```css
.content-card {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-xl);
  overflow: hidden;
  background: hsl(var(--surface));
  transition: all var(--duration-normal) var(--ease-out);
}

.content-card:hover {
  transform: scale(1.05);
  box-shadow: var(--elevation-high);
}

.content-card:hover .content-overlay {
  opacity: 1;
}

.content-overlay {
  position: absolute;
  inset: 0;
  background: var(--gradient-overlay);
  opacity: 0;
  transition: opacity var(--duration-slow) var(--ease-out);
  display: flex;
  align-items: flex-end;
  padding: var(--space-6);
}
```

### Navigation
```css
.nav-item {
  position: relative;
  color: hsl(var(--foreground-muted));
  transition: color var(--duration-fast) var(--ease-out);
}

.nav-item:hover {
  color: hsl(var(--foreground));
}

.nav-item.active {
  color: var(--brand-purple);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-brand);
  border-radius: var(--radius-full);
}
```

## Responsive Design

### Breakpoints
```css
--breakpoint-sm: 640px;
--breakpoint-md: 768px;
--breakpoint-lg: 1024px;
--breakpoint-xl: 1280px;
--breakpoint-2xl: 1536px;
```

### Mobile-First Approach
```css
/* Base (Mobile) */
.container {
  padding: var(--space-4);
  max-width: 100%;
}

/* Tablet */
@media (min-width: 768px) {
  .container {
    padding: var(--space-6);
    max-width: var(--container-6xl);
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .container {
    padding: var(--space-8);
    max-width: var(--container-7xl);
  }
}
```

## Implementation Guidelines

### 1. Color Usage
- Use brand gradient for primary CTAs and active states
- Apply subtle gradients for hover effects
- Maintain high contrast ratios (WCAG AA minimum)
- Use semantic colors consistently

### 2. Typography
- Display font for headings and branding
- Body font for content and UI elements
- Maintain clear hierarchy with size and weight
- Use fluid typography for responsive scaling

### 3. Spacing
- Use consistent spacing units throughout
- Apply larger spacing for content separation
- Tighter spacing for related elements
- Responsive spacing that scales with viewport

### 4. Animation
- Keep animations smooth and purposeful
- Use spring easing for playful interactions
- Apply subtle transitions for state changes
- Respect prefers-reduced-motion preferences

### 5. Elevation
- Use shadows to create depth hierarchy
- Apply stronger shadows for modal/overlay elements
- Combine shadows with subtle borders for definition
- Dark mode shadows should be more subtle

### 6. Glass Effects
- Apply to navigation and overlay elements
- Ensure sufficient contrast for readability
- Use sparingly to maintain performance
- Provide fallbacks for unsupported browsers

## Platform-Specific Inspirations

### AppleTV Elements
- Clean, minimal interface
- Fluid animations and transitions
- Focus on content with subtle UI
- Card-based navigation
- Smooth parallax effects

### GoogleTV Elements
- Material Design principles
- Responsive grid layouts
- Contextual color extraction
- Progressive disclosure
- Accessible focus states

### Hulu Touches
- Bold typography
- Vibrant accent colors
- Dynamic content previews
- Engaging hover states
- Clear content categorization

### HBO Max Influences
- Premium, cinematic feel
- Dark theme optimization
- Immersive full-screen experiences
- Sophisticated gradients
- Editorial content presentation

## Migration Strategy

### Phase 1: Foundation
1. Update color system with brand colors
2. Implement new typography scale
3. Apply consistent spacing
4. Update border radius values

### Phase 2: Components
1. Redesign buttons with gradient accents
2. Update cards with glass morphism
3. Enhance navigation with active states
4. Implement new focus styles

### Phase 3: Polish
1. Add micro-animations
2. Implement smooth transitions
3. Apply elevation system
4. Optimize for dark mode

### Phase 4: Content
1. Design hero sections
2. Update content grids
3. Enhance media players
4. Refine content overlays

## Accessibility Considerations

1. **Color Contrast**: Maintain WCAG AA standards
2. **Focus Indicators**: Clear, visible focus states
3. **Motion**: Respect prefers-reduced-motion
4. **Typography**: Readable font sizes and line heights
5. **Interactive Areas**: Minimum 44x44px touch targets
6. **Screen Readers**: Proper ARIA labels and roles

## Performance Guidelines

1. **CSS Variables**: Use custom properties for theming
2. **GPU Acceleration**: Transform and opacity for animations
3. **Lazy Loading**: Progressive image loading
4. **Code Splitting**: Component-based CSS modules
5. **Optimization**: Minify and compress CSS assets

This design language provides a cohesive visual system that elevates the Tempest streaming platform to match the sophistication of leading streaming services while maintaining its unique brand identity.