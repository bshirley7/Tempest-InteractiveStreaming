/**
 * Clerk Webhook Handler
 * 
 * Automatically syncs Clerk user events with Supabase for data storage.
 * Clerk handles authentication, Supabase stores user data and content.
 */

import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { WebhookEvent } from '@clerk/nextjs/server';
import { syncClerkUserToSupabase } from '@/lib/clerk-supabase-sync';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

if (!webhookSecret) {
  console.warn('CLERK_WEBHOOK_SECRET is not set. Webhooks will not work.');
}

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not configured');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Get headers
  const headerPayload = request.headers;
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get body
  const payload = await request.text();

  // Create new Svix instance with secret
  const wh = new Webhook(webhookSecret);

  let evt: WebhookEvent;

  // Verify webhook
  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    );
  }

  // Handle events
  const { type, data } = evt;

  console.log(`Clerk webhook received: ${type}`);

  try {
    switch (type) {
      case 'user.created':
      case 'user.updated':
        // Sync user data to Supabase
        const syncResult = await syncClerkUserToSupabase(data);
        if (syncResult) {
          console.log(`User ${data.id} synced to Supabase successfully`);
        } else {
          console.error(`Failed to sync user ${data.id} to Supabase`);
        }
        break;

      case 'user.deleted':
        // Note: You might want to handle user deletion differently
        // (soft delete, anonymize data, etc.)
        console.log(`User ${data.id} was deleted from Clerk`);
        break;

      default:
        console.log(`Unhandled webhook type: ${type}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}