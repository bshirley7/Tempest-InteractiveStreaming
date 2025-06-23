'use client';

import { useUser } from '@clerk/nextjs';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, User, Mail, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function UserInfoPage() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-16 container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">User Information</h1>
            <p className="text-muted-foreground">Please sign in to view your user information.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">User Information</h1>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Your Account Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* User ID - Most Important for Admin Access */}
              <div className="p-4 border rounded-lg bg-primary/5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-primary">User ID (For Admin Access)</h3>
                    <code className="text-sm bg-background px-2 py-1 rounded mt-1 block">
                      {user.id}
                    </code>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(user.id)}
                    className="ml-4"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    {copied ? 'Copied!' : 'Copy'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Add this ID to the ADMIN_USER_IDS array in app/admin/page.tsx to grant admin access
                </p>
              </div>

              {/* Other User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Full Name
                  </h3>
                  <p className="text-muted-foreground">{user.fullName || 'Not provided'}</p>
                </div>

                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </h3>
                  <p className="text-muted-foreground">{user.primaryEmailAddress?.emailAddress || 'Not provided'}</p>
                </div>

                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Created
                  </h3>
                  <p className="text-muted-foreground">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Last Sign In
                  </h3>
                  <p className="text-muted-foreground">
                    {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'Unknown'}
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h3 className="font-semibold mb-2">How to Grant Admin Access:</h3>
                <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                  <li>Copy your User ID from above</li>
                  <li>Open the file: <code>app/admin/page.tsx</code></li>
                  <li>Find the <code>ADMIN_USER_IDS</code> array (around line 11)</li>
                  <li>Add your User ID to the array like this:</li>
                </ol>
                <pre className="mt-2 p-2 bg-background rounded text-xs overflow-x-auto">
{`const ADMIN_USER_IDS: string[] = [
  '${user.id}', // Your user ID
  // Add other admin user IDs here
];`}
                </pre>
                <p className="text-xs text-muted-foreground mt-2">
                  Save the file and refresh the admin page to gain access.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 