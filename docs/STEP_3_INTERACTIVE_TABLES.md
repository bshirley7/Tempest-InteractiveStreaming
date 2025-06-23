# Step 3: Interactive Tables

Create tables for scheduled programming and campus announcements.

## 🎯 Prerequisites

Make sure you've completed [Step 2: User Tables](./STEP_2_USER_TABLES.md) first.

---

## 📋 Table 1: Programs (Scheduled Content)

Stores scheduled programming and live events.

```sql
-- Programs Table (Scheduled content/live programming)
CREATE TABLE IF NOT EXISTS public.programs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  is_live BOOLEAN DEFAULT false,
  is_repeat BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_programs_channel_id ON public.programs(channel_id);
CREATE INDEX IF NOT EXISTS idx_programs_content_id ON public.programs(content_id);
CREATE INDEX IF NOT EXISTS idx_programs_start_time ON public.programs(start_time);
CREATE INDEX IF NOT EXISTS idx_programs_end_time ON public.programs(end_time);
```

**What this stores:**
- Scheduled live streams
- Programming schedules
- Event timing and channels
- Repeat broadcast information

**Example data:**
```json
{
  "title": "Physics 101 - Live Lecture",
  "start_time": "2024-01-15T14:00:00Z",
  "end_time": "2024-01-15T15:30:00Z",
  "is_live": true
}
```

---

## 📋 Table 2: Campus Updates

Stores announcements, news, and campus communications.

```sql
-- Campus Updates Table (Announcements, news)
CREATE TABLE IF NOT EXISTS public.campus_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  type TEXT DEFAULT 'general',
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  author_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
  channel_id UUID REFERENCES public.channels(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_campus_updates_type ON public.campus_updates(type);
CREATE INDEX IF NOT EXISTS idx_campus_updates_priority ON public.campus_updates(priority);
CREATE INDEX IF NOT EXISTS idx_campus_updates_is_active ON public.campus_updates(is_active);
CREATE INDEX IF NOT EXISTS idx_campus_updates_starts_at ON public.campus_updates(starts_at);
```

**What this stores:**
- Campus announcements
- Emergency notifications
- Event reminders
- Policy updates

**Example updates:**
```json
{
  "type": "emergency",
  "priority": "urgent",
  "title": "Campus Closure Due to Weather",
  "content": "All classes cancelled today due to severe weather..."
}
{
  "type": "event",
  "priority": "normal", 
  "title": "Career Fair Next Week",
  "content": "Join us for the annual career fair..."
}
```

---

## ✅ Verification

Check that all tables were created successfully:

```sql
-- Verify interactive tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'programs', 
    'campus_updates'
  )
ORDER BY table_name;
```

You should see:
```
table_name
--------------
campus_updates
programs
```

## 🚀 Next Steps

1. **Continue to Step 4**: [Default Data](./STEP_4_DEFAULT_DATA.md)
2. **Or use complete setup**: [Complete Schema](./COMPLETE_SCHEMA.md)

## 🎯 What You've Created

- ✅ **Programs** (scheduled content and live events)
- ✅ **Campus updates** (announcements and notifications)