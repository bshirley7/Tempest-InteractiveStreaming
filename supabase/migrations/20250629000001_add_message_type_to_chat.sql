-- Add message_type column to chat_messages table
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'reaction', 'system'));

-- Update existing messages to have the default type
UPDATE public.chat_messages 
SET message_type = 'text' 
WHERE message_type IS NULL;