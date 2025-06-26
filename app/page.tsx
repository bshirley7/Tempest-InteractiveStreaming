'use client';

import { useState, useEffect, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { WelcomeSection } from '@/components/layout/welcome-section';
import { Button } from '@/components/ui/button';
import { Play, Tv, Video, BarChart3 } from 'lucide-react';
import Link from 'next/link';

function HomePageContent() {
  // Always call useUser hook - let ClerkProvider handle if it's configured or not
  const { isLoaded, isSignedIn, user } = useUser();
  const searchParams = useSearchParams();
  
  const [mounted, setMounted] = useState(false);

  // Check if Clerk is properly configured
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = publishableKey && publishableKey.trim() !== '';

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isClerkConfigured && !isSignedIn) {
    return <WelcomeSection />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-16">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
              <h1 className="text-5xl font-bold mb-4">
                Welcome to <span className="bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">Tempest</span>
              </h1>
              <p className="text-xl text-white/80 max-w-2xl mx-auto">
                Your university&apos;s interactive streaming platform with live TV, on-demand content, and real-time engagement
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <Link href="/live">
                <div className="bg-white/10 backdrop-blur rounded-lg p-6 hover:bg-white/20 transition-all cursor-pointer group">
                  <div className="text-center">
                    <Tv className="h-12 w-12 text-purple-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold mb-2">Live TV</h3>
                    <p className="text-white/70 text-sm">Watch live university channels with interactive features</p>
                  </div>
                </div>
              </Link>

              <Link href="/library">
                <div className="bg-white/10 backdrop-blur rounded-lg p-6 hover:bg-white/20 transition-all cursor-pointer group">
                  <div className="text-center">
                    <Video className="h-12 w-12 text-blue-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold mb-2">Video Library</h3>
                    <p className="text-white/70 text-sm">Access on-demand educational content and recordings</p>
                  </div>
                </div>
              </Link>

              <Link href="/analytics">
                <div className="bg-white/10 backdrop-blur rounded-lg p-6 hover:bg-white/20 transition-all cursor-pointer group">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-pink-400 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                    <p className="text-white/70 text-sm">Track engagement and viewing statistics</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Live Stats Section */}
        <div className="bg-background border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-primary mb-2">2,847</div>
                <div className="text-sm text-muted-foreground">Live Viewers</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">12</div>
                <div className="text-sm text-muted-foreground">Active Channels</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">156</div>
                <div className="text-sm text-muted-foreground">Content Library</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary mb-2">89%</div>
                <div className="text-sm text-muted-foreground">Engagement Rate</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access */}
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-8 text-center">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Link href="/live">
              <div className="bg-card rounded-lg p-6 border hover:shadow-lg transition-all cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h3 className="font-semibold">Campus News Live</h3>
                    <p className="text-sm text-muted-foreground">Currently: Morning Update • 1,247 viewers</p>
                  </div>
                </div>
              </div>
            </Link>

            <Link href="/library">
              <div className="bg-card rounded-lg p-6 border hover:shadow-lg transition-all cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Latest Lectures</h3>
                    <p className="text-sm text-muted-foreground">Physics 101, Chemistry Lab, and more</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}