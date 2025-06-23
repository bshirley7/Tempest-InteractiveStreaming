# Step 1: Core Tables Setup

Create the foundational tables that other tables depend on.

## 🎯 Instructions

Copy and paste each SQL block into your Supabase SQL Editor **one at a time**.

---

## 📋 Table 1: User Profiles

Stores user information synced from Clerk authentication.

```sql
-- User Profiles Table (syncs with Clerk)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  preferences JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_clerk_user_id ON public.user_profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
```

**What this stores:**
- User info from Clerk (email, name, avatar)
- User roles (admin, faculty, student)
- User preferences and settings

---

## 📋 Table 2: Channels

Stores video channel information (Campus Life, Academic, Sports, etc.).

```sql
-- Channels Table
CREATE TABLE IF NOT EXISTS public.channels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT,
  thumbnail_url TEXT,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_channels_slug ON public.channels(slug);
CREATE INDEX IF NOT EXISTS idx_channels_is_active ON public.channels(is_active);
CREATE INDEX IF NOT EXISTS idx_channels_category ON public.channels(category);
```

**What this stores:**
- Channel names and descriptions
- Channel categories and settings
- Channel logos and thumbnails (URLs only)

---

## 📋 Table 3: Content (Video Metadata)

**⚠️ IMPORTANT: This stores ONLY metadata - no video files!**

```sql
-- Content Table (Video metadata ONLY - videos stay in Cloudflare)
CREATE TABLE IF NOT EXISTS public.content (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  channel_id UUID REFERENCES public.channels(id) ON DELETE SET NULL,
  cloudflare_video_id TEXT UNIQUE NOT NULL,  -- Reference to Cloudflare Stream
  thumbnail_url TEXT,
  thumbnail_source TEXT DEFAULT 'stream',
  thumbnail_metadata JSONB DEFAULT '{}',
  duration INTEGER,  -- Duration in seconds
  category TEXT,
  genre TEXT,
  keywords TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'English',
  instructor TEXT,
  difficulty_level TEXT DEFAULT 'Beginner',
  target_audience TEXT,
  learning_objectives TEXT[] DEFAULT '{}',
  prerequisites TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  is_live BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  like_count INTEGER DEFAULT 0,
  sync_status TEXT DEFAULT 'pending',
  last_synced_at TIMESTAMPTZ,
  stream_metadata JSONB DEFAULT '{}',  -- Cloudflare Stream metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_cloudflare_video_id ON public.content(cloudflare_video_id);
CREATE INDEX IF NOT EXISTS idx_content_channel_id ON public.content(channel_id);
CREATE INDEX IF NOT EXISTS idx_content_is_published ON public.content(is_published);
CREATE INDEX IF NOT EXISTS idx_content_category ON public.content(category);
CREATE INDEX IF NOT EXISTS idx_content_sync_status ON public.content(sync_status);
CREATE INDEX IF NOT EXISTS idx_content_created_at ON public.content(created_at DESC);
```

**What this stores:**
- Video titles, descriptions, categories
- Cloudflare Stream video IDs (references only)
- Thumbnail URLs (not thumbnail files)
- Video metadata (duration, tags, etc.)
- Publication status and sync information

---

## 📋 Table 4: Videos View (Compatibility)

Creates a view for backward compatibility.

```sql
-- Videos View (for backward compatibility with existing code)
CREATE OR REPLACE VIEW public.videos AS
SELECT * FROM public.content;
```

**What this does:**
- Provides alternative name for content table
- Ensures existing code continues to work

---

## ✅ Verification

After running all SQL blocks above, verify the tables were created:

```sql
-- Check that tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_profiles', 'channels', 'content')
ORDER BY table_name;
```

You should see:
```
table_name
-----------
channels
content
user_profiles
```

## 🚀 Next Steps

1. **Continue to Step 2**: [User Tables](./STEP_2_USER_TABLES.md)
2. **Or use complete setup**: [Complete Schema](./COMPLETE_SCHEMA.md)

## 🎯 What You've Created

- ✅ **User profiles** (synced with Clerk)
- ✅ **Channels** (for organizing content)
- ✅ **Content metadata** (video info, NOT video files)
- ✅ **Videos view** (backward compatibility)