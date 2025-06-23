# Database Setup Guide

This guide will help you set up all the necessary database tables in Supabase for the Tempest streaming platform.

## 📋 Prerequisites

- A Supabase project created
- Access to your Supabase dashboard
- Your environment variables configured in `.env.local`

## 🎯 Overview

You'll create **10 tables** that store only **metadata and references** - no video files:

1. **user_profiles** - User information synced from Clerk
2. **channels** - Video channels (Campus Life, Academic, etc.)
3. **content** - Video metadata (titles, descriptions, Cloudflare IDs)
4. **programs** - Scheduled programming
5. **interactions** - Polls, quizzes, ratings
6. **user_interactions** - User responses to interactions
7. **chat_messages** - Live chat messages
8. **analytics_events** - User activity tracking
9. **campus_updates** - Announcements and updates
10. **videos** - View that mirrors content table

## 🚀 Quick Setup (Recommended)

### Option 1: One-Click Setup
1. Go to your Supabase dashboard
2. Click **"SQL Editor"** in the sidebar
3. Click **"New query"**
4. Copy and paste the **[Complete Schema SQL](./COMPLETE_SCHEMA.md)**
5. Click **"Run"** (or press Ctrl/Cmd + Enter)
6. Wait for success message
7. Done! All tables created with sample data.

### Option 2: Step-by-Step Setup
Follow the individual table creation guides:
- [Step 1: Core Tables](./STEP_1_CORE_TABLES.md)
- [Step 2: User Tables](./STEP_2_USER_TABLES.md)
- [Step 3: Interactive Tables](./STEP_3_INTERACTIVE_TABLES.md)
- [Step 4: Default Data](./STEP_4_DEFAULT_DATA.md)

## ✅ Verification

After creating tables, verify the setup:

```bash
# Check if tables exist
npm run db:check

# Test the sync
npm run sync:simple
```

## 🎉 Expected Result

After successful setup:
- **10 database tables** created
- **8 default channels** added
- **Admin users** configured
- **Ready to sync 38 videos** from Cloudflare Stream

## 🔧 Troubleshooting

### Common Issues

**"Table already exists" errors:**
- This is normal if re-running the setup
- The SQL uses `CREATE TABLE IF NOT EXISTS`

**Permission errors:**
- Make sure you're logged into Supabase
- Verify you have admin access to the project

**Constraint errors:**
- Run tables in the correct order (use complete schema)
- Foreign key relationships require parent tables first

### Getting Help

If you encounter issues:
1. Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
2. Verify your environment variables
3. Ensure Supabase project is active

## 📚 Next Steps

After database setup:
1. **Run bulk sync**: `npm run sync:simple`
2. **Start dev server**: `npm run dev`
3. **Access admin panel**: `http://localhost:3000/admin`
4. **View synced content**: Check the Content tab

## 🎯 What This Does NOT Do

- ❌ Store video files (they stay in Cloudflare Stream)
- ❌ Upload or download videos
- ❌ Modify your Cloudflare content
- ✅ Only creates metadata tables for organization