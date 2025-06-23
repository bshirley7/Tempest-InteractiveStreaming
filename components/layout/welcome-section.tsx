'use client';

import { useState, useEffect } from 'react';
import { SignInButton, SignUpButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/header';
import { Play, Users, TrendingUp, Zap } from 'lucide-react';

export function WelcomeSection() {
  // Check if Clerk is properly configured
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
  const isClerkConfigured = typeof publishableKey === 'string' && !publishableKey.includes('actual-bullfrog');
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render auth buttons until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <Header />
        <main className="container mx-auto px-4 pt-20">
          <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
            <div className="mb-8">
              <div className="flex items-center justify-center mb-6">
                <img 
                  src="/icon.svg" 
                  alt="Tempest Icon" 
                  className="h-16 w-16 mr-4"
                />
                <img 
                  src="/logo.svg" 
                  alt="Tempest" 
                  className="h-12"
                />
              </div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-4">
                Welcome to
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
                The revolutionary streaming platform designed for universities. 
                Experience interactive content with real-time engagement, analytics, and community features.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <Header />
      <main className="container mx-auto px-4 pt-20">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <div className="mb-8">
            <div className="flex items-center justify-center mb-6">
              <img 
                src="/icon.svg" 
                alt="Tempest Icon" 
                className="h-16 w-16 mr-4"
              />
              <img 
                src="/logo.svg" 
                alt="Tempest" 
                className="h-12"
              />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent mb-4">
              Welcome to
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              The revolutionary streaming platform designed for universities. 
              Experience interactive content with real-time engagement, analytics, and community features.
            </p>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 max-w-4xl">
            <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur">
              <Zap className="h-12 w-12 text-purple-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Real-time Interaction</h3>
              <p className="text-muted-foreground">Chat, polls, and Q&A during live streams</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur">
              <TrendingUp className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-muted-foreground">Track engagement and viewer insights</p>
            </div>
            <div className="text-center p-6 rounded-lg bg-card/50 backdrop-blur">
              <Users className="h-12 w-12 text-pink-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">University Focus</h3>
              <p className="text-muted-foreground">Tailored for academic environments</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isClerkConfigured ? (
              <>
                <SignInButton mode="modal">
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    <Play className="h-5 w-5 mr-2" />
                    Get Started
                  </Button>
                </SignUpButton>
              </>
            ) : (
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                <Play className="h-5 w-5 mr-2" />
                Explore Demo
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}