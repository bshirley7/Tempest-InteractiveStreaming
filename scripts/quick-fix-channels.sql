-- Quick Fix for Channels Table Schema
-- Run this in Supabase SQL Editor to immediately fix the missing columns issue

-- Step 1: Drop and recreate the channels table with all columns
-- First, backup existing data
CREATE TEMP TABLE channels_backup AS SELECT * FROM public.channels;

-- Step 2: Drop the existing table
DROP TABLE IF EXISTS public.channels CASCADE;

-- Step 3: Recreate with all columns including the missing ones
CREATE TABLE public.channels (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    category TEXT,
    thumbnail_url TEXT,
    logo_url TEXT,
    logo_svg TEXT,
    logo_metadata JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_live BOOLEAN DEFAULT false,
    stream_key TEXT,
    cloudflare_stream_id TEXT,
    sort_order INTEGER DEFAULT 0,
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 4: Restore data from backup
INSERT INTO public.channels (
    id, name, slug, description, category, thumbnail_url, 
    is_active, is_featured, sort_order, settings, metadata, 
    created_at, updated_at
)
SELECT 
    id, name, slug, description, category, thumbnail_url,
    is_active, is_featured, sort_order, settings, metadata,
    created_at, updated_at
FROM channels_backup;

-- Step 5: Recreate indexes
CREATE INDEX idx_channels_slug ON public.channels(slug);
CREATE INDEX idx_channels_is_active ON public.channels(is_active);
CREATE INDEX idx_channels_category ON public.channels(category);
CREATE INDEX idx_channels_logo ON public.channels(logo_url) WHERE logo_url IS NOT NULL;
CREATE INDEX idx_channels_is_live ON public.channels(is_live);
CREATE INDEX idx_channels_stream_key ON public.channels(stream_key);

-- Step 6: Drop the backup table
DROP TABLE channels_backup;

-- Step 7: Verify the new structure
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'channels'
ORDER BY ordinal_position;

-- Step 8: Test query
SELECT id, name, logo_url, logo_svg, logo_metadata, is_live 
FROM public.channels 
LIMIT 5;