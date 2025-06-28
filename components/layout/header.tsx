'use client';

import { useState, useEffect } from 'react';
import { UserButton, useUser, SignInButton } from '@clerk/nextjs';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { 
  Settings, 
  Menu,
  X,
  Zap,
  Play
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export function Header() {
  // Check if Clerk is properly configured
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = typeof publishableKey === 'string' && !publishableKey.includes('actual-bullfrog');
  
  const userHook = isClerkConfigured ? useUser() : null;
  const { isSignedIn } = userHook || { isSignedIn: false };
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render user-specific content until mounted
  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="absolute inset-0 bg-gradient-to-bl from-zinc-900/95 to-zinc-950/95 shadow-2xl shadow-purple-700/20 backdrop-blur-xl"></div>
        <div className="relative container mx-auto px-6">
          <div className="flex items-center justify-center h-[68px]">
            <img 
              src="/logo.svg" 
              alt="Tempest" 
              className="h-8"
            />
          </div>
        </div>
      </header>
    );
  }

  const navigationItems = [
    { label: 'Live TV', href: '/live', icon: Zap },
    { label: 'Library', href: '/library', icon: Play },
    { label: 'Admin', href: '/admin', icon: Settings },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Premium gradient background with purple shadow */}
      <div className="absolute inset-0 bg-gradient-to-bl from-zinc-900/95 to-zinc-950/95 shadow-2xl shadow-purple-700/20 backdrop-blur-xl"></div>
      <div className="relative container mx-auto px-6">
        <div className="flex items-center justify-between h-[68px]">
          {/* Left Section with Menu and Navigation */}
          <div className="flex items-center flex-1">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden mr-4 hover:bg-white/10 text-white"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Desktop Navigation */}
            {isSignedIn && (
              <nav className="hidden md:flex items-center space-x-6">
                {navigationItems.map((item) => (
                  <Link key={item.label} href={item.href}>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <item.icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            )}
          </div>

          {/* Center Logo */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <Link href="/" className="flex items-center">
              <img 
                src="/logo.svg" 
                alt="Tempest" 
                className="h-8 w-auto"
              />
            </Link>
          </div>


          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {isClerkConfigured && isSignedIn ? (
              <>

                {/* User Button */}
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "h-8 w-8",
                      userButtonPopoverCard: "bg-zinc-900 border border-zinc-800",
                      userButtonPopoverActions: "bg-zinc-900",
                      userButtonPopoverActionButton: "text-zinc-300 hover:bg-zinc-800 hover:text-white",
                    }
                  }}
                />
              </>
            ) : (
              <div className="flex items-center space-x-2">
                {isClerkConfigured ? (
                  <SignInButton mode="modal">
                    <Button 
                      size="sm"
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0"
                    >
                      Sign In
                    </Button>
                  </SignInButton>
                ) : (
                  <Button size="sm" disabled>
                    Demo Mode
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        {/* Full-Screen Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 top-[68px] bg-black/95 backdrop-blur-sm z-40 md:hidden">
            <div className="p-6">
              <nav className="space-y-6">
                {navigationItems.map((item) => (
                  <Link 
                    key={item.label} 
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center text-2xl font-medium text-gray-400 hover:text-white transition-colors">
                      <item.icon className="h-8 w-8 mr-4" />
                      {item.label}
                    </div>
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}