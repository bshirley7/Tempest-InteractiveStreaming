'use client';

import { Header } from '@/components/layout/header';
import { SimpleUpload } from '@/components/admin/simple-upload';

export default function SimpleUploadPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">Simple Video Upload</h1>
              <p className="text-muted-foreground">
                Upload a single video and test Cloudflare Stream + Supabase sync
              </p>
            </div>
            <SimpleUpload />
          </div>
        </div>
      </main>
    </div>
  );
}