'use client';

import { useEffect, useState, Suspense } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/layout/header';

function AnalyticsPageContent() {
  const userHook = useUser();
  const { isLoaded, isSignedIn } = userHook || { isLoaded: true, isSignedIn: false };
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [mounted, isLoaded, isSignedIn, router]);

  if (!mounted || !isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return null; // Component will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-2">Total Viewers</h3>
                <p className="text-3xl font-bold text-primary">2,847</p>
                <p className="text-sm text-muted-foreground">+12% from last week</p>
              </div>
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-2">Engagement Rate</h3>
                <p className="text-3xl font-bold text-primary">89%</p>
                <p className="text-sm text-muted-foreground">+5% from last week</p>
              </div>
              <div className="bg-card rounded-lg border p-6">
                <h3 className="text-lg font-semibold mb-2">Average Rating</h3>
                <p className="text-3xl font-bold text-primary">7.2</p>
                <p className="text-sm text-muted-foreground">+0.3 from last week</p>
              </div>
            </div>
            <div className="mt-8 bg-card rounded-lg border p-6">
              <h3 className="text-lg font-semibold mb-4">Coming Soon</h3>
              <p className="text-muted-foreground">
                Advanced analytics features including detailed viewer insights, 
                engagement metrics, and performance reports will be available soon.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    }>
      <AnalyticsPageContent />
    </Suspense>
  );
}