# Step 2: User Interaction Tables

Create tables for user interactions like polls, quizzes, chat, and analytics.

## 🎯 Prerequisites

Make sure you've completed [Step 1: Core Tables](./STEP_1_CORE_TABLES.md) first.

---

## 📋 Table 1: Interactions

Stores polls, quizzes, ratings, and reactions for videos.

```sql
-- Interactions Table (Polls, quizzes, ratings, reactions)
CREATE TABLE IF NOT EXISTS public.interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  type TEXT NOT NULL CHECK (type IN ('poll', 'quiz', 'rating', 'reaction')),
  title TEXT NOT NULL,
  description TEXT,
  options JSONB DEFAULT '[]',
  correct_answer TEXT,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  results JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_interactions_channel_id ON public.interactions(channel_id);
CREATE INDEX IF NOT EXISTS idx_interactions_content_id ON public.interactions(content_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON public.interactions(type);
CREATE INDEX IF NOT EXISTS idx_interactions_is_active ON public.interactions(is_active);
```

**What this stores:**
- Poll questions and options
- Quiz questions with correct answers
- Rating prompts
- Reaction buttons for videos

**Example data:**
```json
{
  "type": "poll",
  "title": "What did you think of this lecture?",
  "options": ["Excellent", "Good", "Fair", "Poor"]
}
```

---

## 📋 Table 2: User Interactions

Stores user responses to polls, quizzes, and ratings.

```sql
-- User Interactions Table (User responses to polls/quizzes)
CREATE TABLE IF NOT EXISTS public.user_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  interaction_id UUID REFERENCES public.interactions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  response TEXT,
  response_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(interaction_id, user_id)  -- One response per user per interaction
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_interactions_interaction_id ON public.user_interactions(interaction_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON public.user_interactions(user_id);
```

**What this stores:**
- User's poll selections
- Quiz answers and scores
- Rating values
- Individual user responses

**Example data:**
```json
{
  "response": "Excellent",
  "response_data": {"score": 85, "time_taken": 120}
}
```

---

## 📋 Table 3: Chat Messages

Stores live chat messages during video streams.

```sql
-- Chat Messages Table (Live chat during streams)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_channel_id ON public.chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_content_id ON public.chat_messages(content_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
```

**What this stores:**
- Live chat messages
- Message timestamps and authors
- Pinned important messages
- Moderation status (deleted messages)

**Example data:**
```
"Great explanation of quantum mechanics!"
"When is the next lecture?"
"Thanks for the clear examples"
```

---

## 📋 Table 4: Analytics Events

Tracks user activity and engagement for analytics.

```sql
-- Analytics Events Table (User activity tracking)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  channel_id UUID REFERENCES public.channels(id) ON DELETE SET NULL,
  content_id UUID REFERENCES public.content(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_channel_id ON public.analytics_events(channel_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_content_id ON public.analytics_events(content_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
```

**What this stores:**
- User actions (play, pause, seek)
- Page views and navigation
- Interaction participation
- Session and device information

**Example events:**
```json
{
  "event_type": "video_play",
  "event_data": {"position": 120, "quality": "1080p"}
}
{
  "event_type": "poll_participation",
  "event_data": {"interaction_id": "abc123", "response": "A"}
}
```

---

## ✅ Verification

Check that all tables were created successfully:

```sql
-- Verify user interaction tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'interactions', 
    'user_interactions', 
    'chat_messages', 
    'analytics_events'
  )
ORDER BY table_name;
```

You should see:
```
table_name
-----------------
analytics_events
chat_messages
interactions
user_interactions
```

## 🚀 Next Steps

1. **Continue to Step 3**: [Interactive Tables](./STEP_3_INTERACTIVE_TABLES.md)
2. **Or use complete setup**: [Complete Schema](./COMPLETE_SCHEMA.md)

## 🎯 What You've Created

- ✅ **Interactions** (polls, quizzes, ratings)
- ✅ **User responses** (individual answers and scores)
- ✅ **Live chat** (real-time messaging)
- ✅ **Analytics** (user activity tracking)