# Step 17: Create Core UI Components

## Context
You are building Tempest, an interactive streaming platform. This step creates the foundational UI components that will be used throughout the application, including layout components, navigation, and reusable interface elements with precise Tailwind CSS styling.

## Purpose
Core UI components provide consistent visual design, responsive behavior, and reusable interface patterns. These components use shadcn/ui primitives with custom Tailwind classes and design system variables to maintain brand consistency.

## Prerequisites
- Step 16 completed successfully
- Shadcn/ui components installed and configured
- Global CSS with design system variables applied
- Core React hooks created

## Task Instructions
Complete each task in order and mark as ✅ when finished:

### Task 1: Create Header Component ⏳
Create the main navigation header with responsive design and authentication integration.

**File to Create:** `components/layout/Header.tsx`

```typescript
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserButton, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Menu, Search, Tv, Play, Grid3x3, Settings } from 'lucide-react';
import { useUser } from '@/lib/hooks/useUser';
import { cn } from '@/lib/utils/cn';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { isSignedIn, isAdmin } = useUser();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const router = useRouter();

  const navigationItems = [
    {
      href: '/watch',
      label: 'Watch Live',
      icon: Tv,
      description: 'Live streaming channels'
    },
    {
      href: '/vod',
      label: 'Video Library',
      icon: Play,
      description: 'On-demand content'
    },
    {
      href: '/content',
      label: 'Browse',
      icon: Grid3x3,
      description: 'Explore all content'
    }
  ];

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      className
    )}>
      <div className="container-responsive">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link 
              href="/" 
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="hidden sm:inline-block text-xl font-bold text-gradient">
                Tempest
              </span>
            </Link>
            
            {/* Live Indicator */}
            <Badge variant="destructive" className="hidden md:inline-flex animate-pulse">
              <div className="w-2 h-2 bg-white rounded-full mr-1.5"></div>
              LIVE
            </Badge>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Search Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSearchOpen(true)}
              className="hidden sm:flex"
            >
              <Search className="w-4 h-4" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Admin Link */}
            {isAdmin && (
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="hidden lg:flex"
              >
                <Link href="/admin">
                  <Settings className="w-4 h-4 mr-2" />
                  Admin
                </Link>
              </Button>
            )}

            {/* Authentication */}
            <div className="flex items-center">
              {isSignedIn ? (
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                      userButtonPopoverCard: "bg-card border border-border shadow-lg",
                      userButtonPopoverActionButton: "hover:bg-muted",
                    }
                  }}
                  afterSignOutUrl="/"
                />
              ) : (
                <SignInButton mode="modal">
                  <Button size="sm" className="interactive-button">
                    Sign In
                  </Button>
                </SignInButton>
              )}
            </div>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-8">
                  <div className="flex items-center space-x-2 px-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-sm">T</span>
                    </div>
                    <span className="text-xl font-bold text-gradient">Tempest</span>
                  </div>
                  
                  <div className="border-t border-border pt-4">
                    <nav className="flex flex-col space-y-2">
                      {navigationItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors"
                          >
                            <Icon className="w-5 h-5 text-muted-foreground" />
                            <div className="flex flex-col">
                              <span>{item.label}</span>
                              <span className="text-xs text-muted-foreground">
                                {item.description}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                      
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center space-x-3 px-3 py-3 rounded-md text-sm font-medium text-foreground hover:bg-muted transition-colors border-t border-border mt-2 pt-4"
                        >
                          <Settings className="w-5 h-5 text-muted-foreground" />
                          <div className="flex flex-col">
                            <span>Admin Dashboard</span>
                            <span className="text-xs text-muted-foreground">
                              Platform management
                            </span>
                          </div>
                        </Link>
                      )}
                    </nav>
                  </div>

                  <div className="border-t border-border pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsSearchOpen(true)}
                      className="w-full justify-start"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Search Content
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
```

**Verification:** 
- Header component created with responsive design
- Mobile sheet menu implemented with shadcn/ui Sheet
- Tailwind classes use design system variables
- Authentication integration with Clerk UserButton

### Task 2: Create Footer Component ⏳
Create a responsive footer with links and platform information.

**File to Create:** `components/layout/Footer.tsx`

```typescript
import Link from 'next/link';
import { Github, Twitter, Mail, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Platform',
      links: [
        { href: '/watch', label: 'Watch Live' },
        { href: '/vod', label: 'Video Library' },
        { href: '/content', label: 'Browse Content' },
      ]
    },
    {
      title: 'Support',
      links: [
        { href: '/help', label: 'Help Center' },
        { href: '/contact', label: 'Contact Us' },
        { href: '/feedback', label: 'Send Feedback' },
      ]
    },
    {
      title: 'Legal',
      links: [
        { href: '/privacy', label: 'Privacy Policy' },
        { href: '/terms', label: 'Terms of Service' },
        { href: '/cookies', label: 'Cookie Policy' },
      ]
    }
  ];

  const socialLinks = [
    {
      href: 'https://github.com',
      icon: Github,
      label: 'GitHub'
    },
    {
      href: 'https://twitter.com',
      icon: Twitter,
      label: 'Twitter'
    },
    {
      href: 'mailto:hello@tempest.com',
      icon: Mail,
      label: 'Email'
    }
  ];

  return (
    <footer className={`bg-muted/30 border-t border-border ${className}`}>
      <div className="container-responsive py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold text-gradient">Tempest</span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Interactive streaming platform that transforms passive video consumption 
              into engaging, data-rich experiences.
            </p>
            <div className="flex space-x-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Button
                    key={social.href}
                    variant="ghost"
                    size="sm"
                    asChild
                    className="w-9 h-9 p-0"
                  >
                    <Link href={social.href} aria-label={social.label}>
                      <Icon className="w-4 h-4" />
                    </Link>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-8" />

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>© {currentYear} Tempest Platform</span>
            <span className="hidden sm:inline">•</span>
            <span className="flex items-center space-x-1">
              <span>Built with</span>
              <Heart className="w-3 h-3 text-red-500 fill-current" />
              <span>for education</span>
            </span>
          </div>
          
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>Version 1.0.0</span>
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>All systems operational</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

**Verification:** 
- Footer component created with responsive grid layout
- Tailwind classes for spacing, typography, and colors applied
- shadcn/ui Separator and Button components used
- Social media links with proper accessibility

### Task 3: Create Page Layout Component ⏳
Create a reusable page layout that combines header, main content, and footer.

**File to Create:** `components/layout/PageLayout.tsx`

```typescript
import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { cn } from '@/lib/utils/cn';

interface PageLayoutProps {
  children: ReactNode;
  className?: string;
  hideHeader?: boolean;
  hideFooter?: boolean;
  headerClassName?: string;
  footerClassName?: string;
  contentClassName?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function PageLayout({
  children,
  className,
  hideHeader = false,
  hideFooter = false,
  headerClassName,
  footerClassName,
  contentClassName,
  maxWidth = 'full'
}: PageLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-none'
  };

  return (
    <div className={cn('min-h-screen flex flex-col bg-background', className)}>
      {!hideHeader && <Header className={headerClassName} />}
      
      <main className={cn(
        'flex-1 w-full',
        maxWidth !== 'full' && `mx-auto ${maxWidthClasses[maxWidth]}`,
        contentClassName
      )}>
        {children}
      </main>
      
      {!hideFooter && <Footer className={footerClassName} />}
    </div>
  );
}

// Specialized layout for full-width content (like video pages)
interface FullWidthLayoutProps {
  children: ReactNode;
  className?: string;
}

export function FullWidthLayout({ children, className }: FullWidthLayoutProps) {
  return (
    <PageLayout 
      className={className}
      contentClassName="p-0"
      maxWidth="full"
    >
      {children}
    </PageLayout>
  );
}

// Specialized layout for centered content (like auth pages)
interface CenteredLayoutProps {
  children: ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export function CenteredLayout({ 
  children, 
  className, 
  maxWidth = 'md' 
}: CenteredLayoutProps) {
  return (
    <PageLayout 
      className={className}
      contentClassName="flex items-center justify-center min-h-[calc(100vh-4rem)] py-8"
      maxWidth={maxWidth}
    >
      <div className="w-full px-4">
        {children}
      </div>
    </PageLayout>
  );
}

// Specialized layout for admin pages
interface AdminLayoutProps {
  children: ReactNode;
  className?: string;
}

export function AdminLayout({ children, className }: AdminLayoutProps) {
  return (
    <PageLayout 
      className={className}
      contentClassName="container-responsive py-6"
    >
      {children}
    </PageLayout>
  );
}
```

**Verification:** 
- PageLayout component with flexible configuration options
- Specialized layout variants for different use cases
- Proper Tailwind classes for responsive design
- Flexible max-width and spacing options

### Task 4: Create Loading Components ⏳
Create reusable loading states and skeleton components with Tailwind animations.

**File to Create:** `components/ui/loading.tsx`

```typescript
import { cn } from '@/lib/utils/cn';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div
      className={cn(
        'loading-spinner border-2 border-muted border-t-primary rounded-full',
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl';
}

export function LoadingOverlay({
  isLoading,
  children,
  className,
  spinnerSize = 'lg'
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
          <LoadingSpinner size={spinnerSize} />
        </div>
      )}
    </div>
  );
}

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'loading-skeleton h-4 w-full rounded-md',
        className
      )}
    />
  );
}

// Skeleton components for specific UI elements
export function VideoCardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="aspect-video w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
      <div className="flex items-center space-x-2">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function ChannelCardSkeleton() {
  return (
    <div className="p-6 space-y-4 border border-border rounded-lg">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-12 w-12 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
      <Skeleton className="aspect-video w-full rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex items-start space-x-2 p-3">
      <Skeleton className="h-6 w-6 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full max-w-xs" />
      </div>
    </div>
  );
}

export function DashboardStatSkeleton() {
  return (
    <div className="admin-card space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
      <div className="flex items-center space-x-2">
        <Skeleton className="h-3 w-3 rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

interface LoadingStateProps {
  title?: string;
  description?: string;
  className?: string;
}

export function LoadingState({
  title = 'Loading...',
  description = 'Please wait while we fetch your content.',
  className
}: LoadingStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 space-y-4 text-center',
      className
    )}>
      <LoadingSpinner size="lg" />
      <div className="space-y-1">
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      </div>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center py-12 space-y-4 text-center',
      className
    )}>
      {Icon && (
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-lg font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
```

**Verification:** 
- Loading components created with proper Tailwind animations
- Skeleton components for specific UI patterns
- Accessibility attributes included (role, aria-label)
- Various sizes and states supported

### Task 5: Create Error Boundary Component ⏳
Create error handling component with Tailwind styling and user-friendly messaging.

**File to Create:** `components/ErrorBoundary.tsx`

```typescript
'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-muted/20 to-background">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription>
                We encountered an unexpected error. Don't worry, our team has been notified.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Development Error Details</AlertTitle>
                  <AlertDescription className="font-mono text-xs mt-2 whitespace-pre-wrap">
                    {this.state.error.message}
                    {this.state.errorInfo?.componentStack && (
                      <details className="mt-2">
                        <summary className="cursor-pointer font-semibold">
                          Component Stack
                        </summary>
                        <pre className="mt-1 text-xs overflow-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </details>
                    )}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.handleReset}
                  className="flex-1 interactive-button"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={() => window.location.href = '/'}
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </div>
              
              <div className="text-center text-xs text-muted-foreground">
                Error ID: {Math.random().toString(36).substring(2, 15)}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional error component for API errors
interface ErrorDisplayProps {
  error: string | Error;
  retry?: () => void;
  className?: string;
  variant?: 'default' | 'minimal';
}

export function ErrorDisplay({ 
  error, 
  retry, 
  className,
  variant = 'default'
}: ErrorDisplayProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;

  if (variant === 'minimal') {
    return (
      <Alert variant="destructive" className={className}>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {errorMessage}
          {retry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={retry}
              className="ml-2 h-auto p-0 text-destructive-foreground underline"
            >
              Try again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className={`text-center py-8 ${className}`}>
      <div className="w-16 h-16 mx-auto mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-medium text-foreground mb-2">
        Something went wrong
      </h3>
      <p className="text-sm text-muted-foreground mb-4 max-w-sm mx-auto">
        {errorMessage}
      </p>
      {retry && (
        <Button onClick={retry} size="sm" className="interactive-button">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>
      )}
    </div>
  );
}

// Higher-order component for wrapping components with error boundaries
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorFallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={errorFallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}
```

**Verification:** 
- ErrorBoundary class component with proper state management
- shadcn/ui Alert, Card, and Button components used
- Development vs production error display logic
- Tailwind classes for responsive design and theming

### Task 6: Create Notification Toast System ⏳
Create a notification system using shadcn/ui toast with custom styling.

**File to Create:** `components/ui/toast-system.tsx`

```typescript
'use client';

import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertCircle, 
  AlertTriangle, 
  Info, 
  X,
  ExternalLink 
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// Enhanced toast hook with predefined styles
export function useNotification() {
  const { toast } = useToast();

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
      duration: 4000,
      className: cn(
        "border-green-200 bg-green-50 text-green-900",
        "dark:border-green-800 dark:bg-green-950 dark:text-green-100"
      ),
      action: (
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
      ),
    });
  };

  const showError = (title: string, description?: string, retry?: () => void) => {
    toast({
      title,
      description,
      duration: 6000,
      className: cn(
        "border-red-200 bg-red-50 text-red-900",
        "dark:border-red-800 dark:bg-red-950 dark:text-red-100"
      ),
      action: (
        <div className="flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          {retry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={retry}
              className="h-auto p-1 text-red-700 hover:text-red-900 dark:text-red-300 dark:hover:text-red-100"
            >
              Retry
            </Button>
          )}
        </div>
      ),
    });
  };

  const showWarning = (title: string, description?: string) => {
    toast({
      title,
      description,
      duration: 5000,
      className: cn(
        "border-yellow-200 bg-yellow-50 text-yellow-900",
        "dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100"
      ),
      action: (
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        </div>
      ),
    });
  };

  const showInfo = (title: string, description?: string, action?: {
    label: string;
    onClick: () => void;
  }) => {
    toast({
      title,
      description,
      duration: 5000,
      className: cn(
        "border-blue-200 bg-blue-50 text-blue-900",
        "dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100"
      ),
      action: (
        <div className="flex items-center space-x-2">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          {action && (
            <Button
              variant="ghost"
              size="sm"
              onClick={action.onClick}
              className="h-auto p-1 text-blue-700 hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-100"
            >
              {action.label}
            </Button>
          )}
        </div>
      ),
    });
  };

  const showCustom = (config: {
    title: string;
    description?: string;
    duration?: number;
    className?: string;
    action?: React.ReactNode;
  }) => {
    toast({
      title: config.title,
      description: config.description,
      duration: config.duration || 4000,
      className: config.className,
      action: config.action,
    });
  };

  // Specific notification types for the platform
  const showVideoError = (error: string) => {
    showError(
      'Video Playback Error',
      error,
      () => window.location.reload()
    );
  };

  const showChatError = (error: string) => {
    showError(
      'Chat Error',
      `Failed to send message: ${error}`
    );
  };

  const showConnectionError = () => {
    showWarning(
      'Connection Issues',
      'You may experience delays in real-time features.'
    );
  };

  const showFeatureNotification = (feature: string) => {
    showInfo(
      'New Feature Available',
      `${feature} is now available for all users.`,
      {
        label: 'Learn More',
        onClick: () => window.open('/help/features', '_blank')
      }
    );
  };

  const showUploadSuccess = (filename: string) => {
    showSuccess(
      'Upload Complete',
      `${filename} has been successfully uploaded and is being processed.`
    );
  };

  const showUploadProgress = (filename: string, progress: number) => {
    showCustom({
      title: 'Uploading...',
      description: `${filename} - ${progress}% complete`,
      duration: 1000,
      className: cn(
        "border-blue-200 bg-blue-50 text-blue-900",
        "dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100"
      ),
      action: (
        <div className="flex items-center space-x-2">
          <div className="w-12 h-2 bg-blue-200 dark:bg-blue-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 dark:bg-blue-400 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ),
    });
  };

  return {
    // Generic methods
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showCustom,
    
    // Platform-specific methods
    showVideoError,
    showChatError,
    showConnectionError,
    showFeatureNotification,
    showUploadSuccess,
    showUploadProgress,
  };
}

// Toast notification components for specific use cases
interface NotificationProps {
  title: string;
  description?: string;
  onClose?: () => void;
  className?: string;
}

export function SuccessNotification({ 
  title, 
  description, 
  onClose,
  className 
}: NotificationProps) {
  return (
    <div className={cn(
      "flex items-start space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg",
      "dark:bg-green-950 dark:border-green-800",
      className
    )}>
      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-green-900 dark:text-green-100">
          {title}
        </p>
        {description && (
          <p className="mt-1 text-sm text-green-700 dark:text-green-300">
            {description}
          </p>
        )}
      </div>
      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="w-auto h-auto p-1 text-green-700 hover:text-green-900 dark:text-green-300 dark:hover:text-green-100"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}

export function ErrorNotification({ 
  title, 
  description, 
  onClose,
  className 
}: NotificationProps) {
  return (
    <div className={cn(
      "flex items-start space-x-3 p-4 bg-red-50 border border-red-200 rounded-lg",
      "dark:bg-red-950 dark:border-red-800",
      className
    )}>
      <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-red-900 dark:text-red-100">
          {title}
        </p>
        {description && (
          <p className="mt-1 text-sm text-red-700 dark:text-red-300">
            {description}
          </p>
        )}
      </div>
      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="w-auto h-auto p-1 text-red-700 hover:text-red-900 dark:text-red-300 dark:hover:text-red-100"
        >
          <X className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}
```

**Verification:** 
- Notification system created with shadcn/ui toast integration
- Platform-specific notification methods included
- Tailwind classes for color variants and dark mode
- Progress indicator for file uploads

## Task Completion Checklist
Mark each task as complete when finished:

- [ ] Task 1: Header component with responsive navigation ✅
- [ ] Task 2: Footer component with links and branding ✅  
- [ ] Task 3: Page layout components with variants ✅
- [ ] Task 4: Loading and skeleton components ✅
- [ ] Task 5: Error boundary with user-friendly display ✅
- [ ] Task 6: Toast notification system ✅

## Verification Steps
After completing all tasks:

1. Check all component files exist:
   ```bash
   ls -la components/layout/
   ls -la components/ui/loading.tsx
   ls -la components/ErrorBoundary.tsx
   ls -la components/ui/toast-system.tsx
   ```

2. Test TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```

3. Start development server and verify no errors:
   ```bash
   npm run dev
   ```

4. Test responsive design at different breakpoints
5. Verify all Tailwind classes render correctly
6. Check dark mode compatibility

## Success Criteria
- All core UI components created with proper TypeScript types
- shadcn/ui components integrated correctly
- Tailwind CSS classes applied consistently with design system
- Responsive design works across all screen sizes
- Dark mode support implemented
- Loading states and error handling user-friendly
- Components follow accessibility best practices

## Important Notes
- All components use design system CSS variables
- Tailwind classes are applied consistently
- shadcn/ui components provide accessible primitives
- Error boundaries prevent application crashes
- Loading states improve perceived performance
- Toast notifications provide user feedback

## Troubleshooting
If you encounter issues:
1. Verify shadcn/ui components are properly installed
2. Check that Tailwind CSS is configured correctly
3. Ensure design system variables are defined in globals.css
4. Test component imports and exports
5. Verify responsive classes work at different breakpoints

## Next Step
After completing this step and marking all tasks ✅, proceed to Step 18: Create TV Guide Components.