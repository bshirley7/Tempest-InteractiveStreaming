-- Fix Chat Messages RLS Policies
-- This migration adds the missing Row Level Security policies for the chat_messages table

-- Enable RLS on chat_messages table
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can read all chat messages for content they have access to
CREATE POLICY "Users can read chat messages" ON public.chat_messages
  FOR SELECT USING (
    -- Allow reading messages if user exists and is authenticated
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE clerk_user_id = (auth.jwt() -> 'sub')::text
    )
  );

-- Policy 2: Authenticated users can insert their own chat messages
CREATE POLICY "Users can insert own chat messages" ON public.chat_messages
  FOR INSERT WITH CHECK (
    -- Check that the user_id matches the authenticated user
    user_id = (
      SELECT id FROM public.user_profiles 
      WHERE clerk_user_id = (auth.jwt() -> 'sub')::text
    )
    AND
    -- Ensure user is not banned
    NOT EXISTS (
      SELECT 1 FROM public.user_moderation_status 
      WHERE user_id = (
        SELECT id FROM public.user_profiles 
        WHERE clerk_user_id = (auth.jwt() -> 'sub')::text
      )
      AND (is_banned = true OR (banned_until IS NOT NULL AND banned_until > now()))
    )
  );

-- Policy 3: Users can update their own messages (for editing)
CREATE POLICY "Users can update own chat messages" ON public.chat_messages
  FOR UPDATE USING (
    user_id = (
      SELECT id FROM public.user_profiles 
      WHERE clerk_user_id = (auth.jwt() -> 'sub')::text
    )
  ) WITH CHECK (
    user_id = (
      SELECT id FROM public.user_profiles 
      WHERE clerk_user_id = (auth.jwt() -> 'sub')::text
    )
  );

-- Policy 4: Moderators can manage all chat messages
CREATE POLICY "Moderators can manage all chat messages" ON public.chat_messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles
      WHERE clerk_user_id = (auth.jwt() -> 'sub')::text 
      AND role IN ('admin', 'moderator')
    )
  );

-- Create helpful indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_clerk_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_content_created ON public.chat_messages(content_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_not_deleted ON public.chat_messages(content_id) WHERE is_deleted = false;