# ShadCN + Tailwind CSS Implementation Guide

This guide provides practical implementation steps to update your existing ShadCN/Tailwind setup with the new visual design language.

## 1. Update Tailwind Configuration

### tailwind.config.ts
```typescript
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
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
        // Brand colors from logo gradient
        brand: {
          purple: "#A855F7",
          "purple-light": "#C084FC",
          "purple-dark": "#9333EA",
          indigo: "#6366F1",
          "indigo-light": "#818CF8", 
          "indigo-dark": "#4F46E5",
          blue: "#3B82F6",
          "blue-light": "#60A5FA",
          "blue-dark": "#2563EB",
        },
        // Update existing colors
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
      // Enhanced border radius
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
        "2xl": "calc(var(--radius) + 8px)",
        "3xl": "calc(var(--radius) + 16px)",
      },
      // Custom gradients
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #A855F7 0%, #6366F1 50%, #3B82F6 100%)",
        "brand-gradient-subtle": "linear-gradient(135deg, #A855F7 0%, #6366F1 50%, #3B82F6 100%)",
        "overlay-gradient": "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)",
        "card-gradient": "linear-gradient(135deg, rgba(168,85,247,0.05) 0%, transparent 100%)",
        "featured-gradient": "linear-gradient(to right, rgba(0,0,0,0.9) 0%, transparent 70%)",
      },
      // Enhanced shadows
      boxShadow: {
        "soft": "0 2px 8px -2px rgba(0,0,0,0.1)",
        "medium": "0 4px 12px -4px rgba(0,0,0,0.15)",
        "strong": "0 8px 24px -8px rgba(0,0,0,0.2)",
        "glow-purple": "0 0 20px rgba(168,85,247,0.3)",
        "glow-indigo": "0 0 20px rgba(99,102,241,0.3)",
        "glow-blue": "0 0 20px rgba(59,130,246,0.3)",
      },
      // Animation updates
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-brand": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "shimmer": "shimmer 2s infinite linear",
        "pulse-brand": "pulse-brand 2s infinite",
        "float": "float 3s ease-in-out infinite",
        "scale-in": "scale-in 0.2s ease-out",
      },
      // Custom fonts
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["SF Pro Display", "system-ui", "sans-serif"],
      },
      // Fluid typography
      fontSize: {
        "fluid-xs": "clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)",
        "fluid-sm": "clamp(0.875rem, 0.825rem + 0.25vw, 1rem)",
        "fluid-base": "clamp(1rem, 0.95rem + 0.25vw, 1.125rem)",
        "fluid-lg": "clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem)",
        "fluid-xl": "clamp(1.25rem, 1.15rem + 0.5vw, 1.5rem)",
        "fluid-2xl": "clamp(1.5rem, 1.35rem + 0.75vw, 1.875rem)",
        "fluid-3xl": "clamp(1.875rem, 1.65rem + 1.125vw, 2.25rem)",
        "fluid-4xl": "clamp(2.25rem, 1.95rem + 1.5vw, 3rem)",
        "fluid-5xl": "clamp(3rem, 2.55rem + 2.25vw, 3.75rem)",
      },
      // Backdrop filters
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        "2xl": "24px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

## 2. Update Global CSS

### app/globals.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Updated with brand colors */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    
    /* Primary uses brand purple */
    --primary: 271 91% 65%;
    --primary-foreground: 0 0% 100%;

    /* Secondary uses subtle gray */
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    /* Accent uses brand indigo */
    --accent: 239 84% 67%;
    --accent-foreground: 0 0% 100%;

    /* Updated muted colors */
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    /* Card with subtle elevation */
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    /* Popover */
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    /* Borders */
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 271 91% 65%;

    /* Destructive */
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;

    /* Border radius */
    --radius: 0.75rem;

    /* Chart colors using brand palette */
    --chart-1: 271 91% 65%;
    --chart-2: 239 84% 67%;
    --chart-3: 217 91% 60%;
    --chart-4: 280 65% 60%;
    --chart-5: 252 80% 65%;
  }

  .dark {
    /* Dark theme with deeper blacks */
    --background: 0 0% 7%;
    --foreground: 0 0% 95%;

    /* Primary maintains brand purple */
    --primary: 271 91% 65%;
    --primary-foreground: 0 0% 100%;

    /* Secondary uses dark surface */
    --secondary: 0 0% 14%;
    --secondary-foreground: 0 0% 95%;

    /* Accent uses brand indigo */
    --accent: 239 84% 67%;
    --accent-foreground: 0 0% 100%;

    /* Muted colors */
    --muted: 0 0% 14%;
    --muted-foreground: 0 0% 65%;

    /* Card with elevation */
    --card: 0 0% 11%;
    --card-foreground: 0 0% 95%;

    /* Popover */
    --popover: 0 0% 11%;
    --popover-foreground: 0 0% 95%;

    /* Borders */
    --border: 0 0% 18%;
    --input: 0 0% 18%;
    --ring: 271 91% 65%;

    /* Chart colors */
    --chart-1: 271 91% 65%;
    --chart-2: 239 84% 67%;
    --chart-3: 217 91% 60%;
    --chart-4: 280 65% 60%;
    --chart-5: 252 80% 65%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

@layer components {
  /* Glass morphism utilities */
  .glass {
    @apply bg-background/80 backdrop-blur-md border-border/20;
  }
  
  .glass-strong {
    @apply bg-background/60 backdrop-blur-xl border-border/30;
  }

  /* Gradient text */
  .gradient-text {
    @apply bg-brand-gradient bg-clip-text text-transparent;
  }

  /* Gradient border */
  .gradient-border {
    @apply relative bg-background;
    background-clip: padding-box;
    border: 1px solid transparent;
  }
  
  .gradient-border::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    padding: 1px;
    background: linear-gradient(135deg, #A855F7 0%, #6366F1 50%, #3B82F6 100%);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }

  /* Enhanced focus states */
  .focus-ring-brand {
    @apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-purple focus-visible:ring-offset-2 focus-visible:ring-offset-background;
  }

  /* Content card hover effect */
  .content-card-hover {
    @apply transition-all duration-300 ease-out hover:scale-[1.02] hover:shadow-strong;
  }

  /* Shimmer loading effect */
  .shimmer {
    @apply relative overflow-hidden;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255,255,255,0.1) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: shimmer 2s infinite linear;
  }
}

@layer utilities {
  /* Text shadow utilities */
  .text-shadow {
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .text-shadow-md {
    text-shadow: 0 4px 8px rgba(0,0,0,0.15);
  }
  
  .text-shadow-lg {
    text-shadow: 0 8px 16px rgba(0,0,0,0.2);
  }

  /* Custom animations */
  .animate-float {
    animation: float 3s ease-in-out infinite;
  }
  
  .animate-pulse-brand {
    animation: pulse-brand 2s infinite;
  }
}
```

## 3. Update ShadCN Components

### components/ui/button.tsx
```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-ring-brand disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-brand-gradient text-white shadow-md hover:shadow-glow-purple hover:scale-[1.02] active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 hover:shadow-md",
        outline:
          "gradient-border hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:shadow-md",
        ghost: 
          "hover:bg-accent hover:text-accent-foreground",
        link: 
          "text-primary underline-offset-4 hover:underline",
        glass:
          "glass text-foreground shadow-sm hover:shadow-md hover:bg-background/90",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3",
        lg: "h-11 rounded-xl px-8",
        xl: "h-14 rounded-2xl px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### components/ui/card.tsx
```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border bg-card text-card-foreground shadow-soft transition-all duration-300 hover:shadow-medium",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

## 4. Create Enhanced Components

### components/ui/glass-card.tsx
```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  blur?: "sm" | "md" | "lg" | "xl"
}

export function GlassCard({ 
  className, 
  blur = "md",
  children,
  ...props 
}: GlassCardProps) {
  const blurClasses = {
    sm: "backdrop-blur-sm",
    md: "backdrop-blur-md", 
    lg: "backdrop-blur-lg",
    xl: "backdrop-blur-xl"
  }

  return (
    <div
      className={cn(
        "relative rounded-xl border border-white/10",
        "bg-gradient-to-br from-white/10 to-white/5",
        "dark:from-white/5 dark:to-white/[0.02]",
        blurClasses[blur],
        "shadow-strong",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
```

### components/ui/gradient-button.tsx
```tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button, ButtonProps } from "./button"

interface GradientButtonProps extends ButtonProps {
  gradientFrom?: string
  gradientTo?: string
}

export function GradientButton({
  className,
  gradientFrom = "from-brand-purple",
  gradientTo = "to-brand-blue",
  children,
  ...props
}: GradientButtonProps) {
  return (
    <Button
      className={cn(
        "relative overflow-hidden",
        "bg-gradient-to-r",
        gradientFrom,
        gradientTo,
        "transition-all duration-300",
        "hover:shadow-glow-purple",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-white/0 before:to-white/20",
        "before:opacity-0 hover:before:opacity-100",
        "before:transition-opacity before:duration-300",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </Button>
  )
}
```

### components/ui/hero-section.tsx
```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  backgroundImage?: string
  overlay?: boolean
}

export function HeroSection({
  className,
  backgroundImage,
  overlay = true,
  children,
  ...props
}: HeroSectionProps) {
  return (
    <div
      className={cn(
        "relative min-h-[80vh] overflow-hidden",
        className
      )}
      {...props}
    >
      {backgroundImage && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      )}
      
      <div className="relative z-10 flex h-full min-h-[80vh] items-end pb-20">
        <div className="container">
          {children}
        </div>
      </div>
    </div>
  )
}
```

## 5. Update Existing Components

### components/layout/header.tsx
Add glass morphism and brand colors:
```tsx
// Update the header className
className={cn(
  "fixed top-0 left-0 right-0 z-50",
  "glass border-b",
  "transition-all duration-300",
  scrolled && "shadow-medium",
  className
)}

// Update logo with gradient text
<Link href="/" className="flex items-center space-x-2">
  <span className="text-2xl font-bold gradient-text">Tempest</span>
</Link>

// Update navigation items
<NavigationMenuItem>
  <Link href="/tv" legacyBehavior passHref>
    <NavigationMenuLink className={cn(
      navigationMenuTriggerStyle(),
      "hover:bg-brand-purple/10 hover:text-brand-purple",
      "transition-all duration-200"
    )}>
      Live TV
    </NavigationMenuLink>
  </Link>
</NavigationMenuItem>
```

### components/vod/vod-card.tsx
Enhanced with new hover effects:
```tsx
// Update the card container
<Card className={cn(
  "group relative overflow-hidden",
  "border-0 shadow-soft",
  "transition-all duration-300",
  "hover:scale-[1.02] hover:shadow-strong",
  "hover:ring-2 hover:ring-brand-purple/50",
  className
)}>

// Update overlay gradient
<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />

// Add shimmer effect on loading
{isLoading && (
  <div className="absolute inset-0 shimmer" />
)}
```

## 6. Theme Toggle Enhancement

### components/theme-toggle.tsx
```tsx
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative overflow-hidden group"
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all group-hover:rotate-180 dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 group-hover:-rotate-90" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
```

## 7. Utility Classes for Common Patterns

Add to your components:

```tsx
// Glass navigation bar
<nav className="glass sticky top-0 z-50">

// Gradient CTA button
<Button className="bg-brand-gradient hover:shadow-glow-purple">

// Content card with hover
<Card className="content-card-hover">

// Focus state with brand color
<Input className="focus-ring-brand">

// Gradient text heading
<h1 className="text-4xl font-bold gradient-text">

// Elevated surface
<div className="rounded-xl bg-card shadow-medium p-6">

// Loading skeleton with shimmer
<div className="h-64 rounded-xl bg-muted shimmer">
```

## 8. Animation Utilities

```tsx
// Floating animation
<div className="animate-float">

// Brand pulse
<div className="animate-pulse-brand">

// Scale in on mount
<div className="animate-scale-in">

// Smooth transitions
<div className="transition-all duration-300 ease-out">
```

## 9. Responsive Patterns

```tsx
// Fluid typography
<h1 className="text-fluid-3xl md:text-fluid-4xl lg:text-fluid-5xl">

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">

// Responsive grid
<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">

// Container with max width
<div className="container max-w-7xl mx-auto px-4">
```

## 10. Dark Mode Considerations

All components automatically support dark mode through CSS variables. For custom implementations:

```tsx
// Conditional styling
<div className="bg-white dark:bg-black/50">

// Gradient adjustments
<div className="bg-gradient-to-r from-brand-purple/20 dark:from-brand-purple/10">

// Shadow adjustments  
<div className="shadow-lg dark:shadow-strong">
```

## Migration Checklist

1. [ ] Update `tailwind.config.ts` with new theme extensions
2. [ ] Update `globals.css` with new CSS variables and utilities
3. [ ] Update Button component with new variants
4. [ ] Update Card component with enhanced shadows
5. [ ] Create GlassCard component
6. [ ] Create GradientButton component
7. [ ] Update Header with glass morphism
8. [ ] Enhance VOD cards with new hover effects
9. [ ] Update focus states across all interactive elements
10. [ ] Test dark mode appearance
11. [ ] Verify responsive behavior
12. [ ] Check animation performance

This implementation maintains full compatibility with ShadCN while adding the premium streaming platform aesthetics.