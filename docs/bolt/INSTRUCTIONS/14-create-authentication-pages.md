# Step 14: Create Authentication Pages

## Context
You are building Tempest, an interactive streaming platform. This step creates the authentication pages using Clerk that allow users to sign in and sign up. These pages are essential for user access to admin features and personalized content.

## Purpose
Authentication pages enable secure user login and registration, providing access control for admin features while maintaining public access to streaming content. Clerk handles the authentication flow and security.

## Prerequisites
- Step 13 completed successfully
- You are in the `tempest` project directory
- Clerk middleware configured
- Authentication folder structure created

## Task Instructions
Complete each task in order and mark as ✅ when finished:

### Task 1: Create Sign-In Page ⏳
Create the Clerk sign-in page that handles user authentication.

**File to Create:** `app/auth/sign-in/[[...sign-in]]/page.tsx`

```typescript
import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to access your Tempest account
          </p>
        </div>
        
        <div className="bg-card border border-border rounded-lg shadow-lg p-6">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: "interactive-button w-full",
                card: "shadow-none border-none",
                headerTitle: "text-xl font-semibold text-center",
                headerSubtitle: "text-muted-foreground text-center",
                socialButtonsBlockButton: "border border-border hover:bg-muted",
                formFieldInput: "border border-border bg-background",
                footerActionLink: "text-primary hover:text-primary/80",
              },
            }}
            routing="path"
            path="/auth/sign-in"
            signUpUrl="/auth/sign-up"
            redirectUrl="/"
          />
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a href="/auth/sign-up" className="text-primary hover:text-primary/80 font-medium">
              Sign up here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
```

**Verification:** 
- File exists at correct path with dynamic route structure
- Clerk SignIn component is properly imported and configured
- Custom styling matches design system

### Task 2: Create Sign-Up Page ⏳
Create the Clerk sign-up page for new user registration.

**File to Create:** `app/auth/sign-up/[[...sign-up]]/page.tsx`

```typescript
import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">Join Tempest</h1>
          <p className="text-muted-foreground">
            Create your account to get started
          </p>
        </div>
        
        <div className="bg-card border border-border rounded-lg shadow-lg p-6">
          <SignUp 
            appearance={{
              elements: {
                formButtonPrimary: "interactive-button w-full",
                card: "shadow-none border-none",
                headerTitle: "text-xl font-semibold text-center",
                headerSubtitle: "text-muted-foreground text-center",
                socialButtonsBlockButton: "border border-border hover:bg-muted",
                formFieldInput: "border border-border bg-background",
                footerActionLink: "text-primary hover:text-primary/80",
              },
            }}
            routing="path"
            path="/auth/sign-up"
            signInUrl="/auth/sign-in"
            redirectUrl="/"
          />
        </div>
        
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <a href="/auth/sign-in" className="text-primary hover:text-primary/80 font-medium">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
```

**Verification:** 
- File exists at correct path with dynamic route structure
- Clerk SignUp component is properly imported and configured
- Custom styling matches design system

### Task 3: Create Authentication Layout ⏳
Create a layout for authentication pages that provides consistent styling.

**File to Create:** `app/auth/layout.tsx`

```typescript
import { ReactNode } from 'react';

export const metadata = {
  title: 'Authentication - Tempest',
  description: 'Sign in or create your Tempest account',
};

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-channel-campus/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-channel-explore/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-channel-create/10 rounded-full blur-3xl"></div>
      </div>
      
      {/* Header */}
      <header className="relative z-10 py-6">
        <div className="container-responsive">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold">Tempest</span>
            </a>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="/watch" className="text-muted-foreground hover:text-foreground transition-colors">
                Watch
              </a>
              <a href="/vod" className="text-muted-foreground hover:text-foreground transition-colors">
                Video Library
              </a>
              <a href="/content" className="text-muted-foreground hover:text-foreground transition-colors">
                Browse
              </a>
            </nav>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="relative z-10">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="relative z-10 py-8 mt-16">
        <div className="container-responsive">
          <div className="text-center text-sm text-muted-foreground">
            <p>© 2024 Tempest. Interactive streaming platform.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
```

**Verification:** 
- File exists at correct path
- Layout includes header with navigation
- Background decorations use design system colors
- Responsive design patterns applied

### Task 4: Create Clerk Webhook Handler ⏳
Create API route to handle Clerk webhooks for user synchronization.

**File to Create:** `app/api/webhooks/clerk/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  if (!webhookSecret) {
    throw new Error('CLERK_WEBHOOK_SECRET is not set');
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error occured -- no svix headers', {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.text();
  const body = JSON.parse(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret);

  let evt: any;

  // Verify the payload with the headers
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as any;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return new Response('Error occured', {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  const { id, email_addresses, first_name, last_name, image_url, username } = evt.data;

  try {
    const supabase = await createClient();

    switch (eventType) {
      case 'user.created':
        // Create user in Supabase
        const { error: createError } = await supabase
          .from('users')
          .insert({
            clerk_id: id,
            email: email_addresses?.[0]?.email_address,
            username: username || `user_${id.slice(-8)}`,
            avatar_url: image_url,
            role: 'viewer',
            preferences: {},
          });

        if (createError) {
          console.error('Error creating user:', createError);
          return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
        }
        break;

      case 'user.updated':
        // Update user in Supabase
        const { error: updateError } = await supabase
          .from('users')
          .update({
            email: email_addresses?.[0]?.email_address,
            username: username || `user_${id.slice(-8)}`,
            avatar_url: image_url,
            updated_at: new Date().toISOString(),
          })
          .eq('clerk_id', id);

        if (updateError) {
          console.error('Error updating user:', updateError);
          return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
        }
        break;

      case 'user.deleted':
        // Soft delete user in Supabase (or hard delete if preferred)
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('clerk_id', id);

        if (deleteError) {
          console.error('Error deleting user:', deleteError);
          return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
        }
        break;

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return NextResponse.json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

**Verification:** 
- File exists at correct API route path
- Webhook verification implemented with svix
- User CRUD operations for Supabase integration
- Error handling and logging included

### Task 5: Add Required Clerk Dependencies ⏳
Install svix for webhook verification.

**Command to Execute:**
```bash
npm install svix
```

**Verification:** 
- Package installed successfully
- No dependency conflicts

### Task 6: Test Authentication Flow ⏳
Start development server and test the authentication pages.

**Commands to Execute:**
```bash
npm run dev
```

**Testing Steps:**
1. Visit http://localhost:3000/auth/sign-in
2. Verify sign-in page loads with proper styling
3. Visit http://localhost:3000/auth/sign-up  
4. Verify sign-up page loads with proper styling
5. Check that navigation links work correctly
6. Verify responsive design on mobile viewport

**Verification:** 
- Authentication pages load without errors
- Styling matches design system
- Navigation functions correctly
- Pages are responsive

## Task Completion Checklist
Mark each task as complete when finished:

- [ ] Task 1: Sign-in page created and styled ✅
- [ ] Task 2: Sign-up page created and styled ✅  
- [ ] Task 3: Authentication layout created ✅
- [ ] Task 4: Clerk webhook handler implemented ✅
- [ ] Task 5: Svix dependency installed ✅
- [ ] Task 6: Authentication flow tested ✅

## Success Criteria
- All authentication pages render correctly
- Clerk integration works without errors
- Webhook handler processes user events
- Styling is consistent with design system
- Responsive design works on all devices
- TypeScript compilation succeeds

## Important Notes
- Dynamic routes use double brackets [[...sign-in]] for Clerk routing
- Webhook handler syncs Clerk users with Supabase database
- Authentication layout provides consistent branding
- Custom styling maintains design system consistency

## Troubleshooting
If you encounter issues:
1. Verify CLERK_WEBHOOK_SECRET is set in environment variables
2. Check that Clerk publishable and secret keys are configured
3. Ensure Supabase connection is working
4. Verify middleware is protecting routes correctly

## Next Step
After completing this step and marking all tasks ✅, proceed to Step 15: Setup Database Tables and Initial Data.