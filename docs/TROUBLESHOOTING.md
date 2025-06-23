# Database Setup Troubleshooting

Common issues and solutions when setting up the Tempest database in Supabase.

## 🚨 Common Errors

### 1. "Table already exists" Error

**Error message:**
```
relation "user_profiles" already exists
```

**Solution:**
✅ This is normal when re-running setup. The SQL uses `CREATE TABLE IF NOT EXISTS` so existing tables won't be affected.

**What to do:**
- Continue with setup - no action needed
- Existing data will be preserved

---

### 2. Permission Denied Errors

**Error message:**
```
permission denied for schema public
```

**Solution:**
1. Verify you're logged into the correct Supabase project
2. Check you have admin/owner access to the project
3. Make sure you're in the SQL Editor (not API docs)

**Steps to fix:**
```bash
# Check your project URL and keys in .env.local
cat .env.local | grep SUPABASE
```

---

### 3. Foreign Key Constraint Errors

**Error message:**
```
violates foreign key constraint
```

**Solution:**
Run tables in the correct order:
1. **user_profiles** (no dependencies)
2. **channels** (no dependencies) 
3. **content** (depends on channels)
4. **All other tables** (depend on content/channels)

**Recommended approach:**
Use the [Complete Schema](./COMPLETE_SCHEMA.md) to create all tables at once.

---

### 4. Invalid Column Name Errors

**Error message:**
```
column "updated_at" does not exist
```

**Solution:**
This happens if you run triggers before creating tables.

**Fix:**
1. Create all tables first
2. Then run the trigger setup from [Step 4](./STEP_4_DEFAULT_DATA.md)

---

### 5. Clerk User ID Not Found

**Error message:**
```
insert or update on table "user_profiles" violates check constraint
```

**Solution:**
Update the admin user insertion with your actual Clerk user IDs.

**How to find your Clerk user ID:**
1. Sign in to your app
2. Open browser dev tools (F12)
3. Check Network tab for API calls containing your user ID
4. Look for calls to `/api/user` or similar

**Update the SQL:**
```sql
INSERT INTO public.user_profiles (clerk_user_id, role) VALUES
('your_actual_clerk_user_id_here', 'admin')
ON CONFLICT (clerk_user_id) DO UPDATE SET role = 'admin';
```

---

## 🔧 Environment Variable Issues

### Missing Supabase Variables

**Symptoms:**
- Sync scripts fail with connection errors
- "Invalid API key" messages

**Check these variables exist in `.env.local`:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@host:port/dbname
```

**How to find these:**
1. Go to Supabase Dashboard
2. Settings → API
3. Copy the values

---

## 🧪 Verification Commands

### Check Tables Exist
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected output:**
```
analytics_events
campus_updates
channels
chat_messages
content
interactions
programs
user_interactions
user_profiles
```

### Check Channels Created
```sql
SELECT name, slug FROM public.channels ORDER BY sort_order;
```

**Expected output:**
```
Campus Pulse     | campus-pulse
RetireWise       | retirewise
MindFeed         | mindfeed
Career Compass   | career-compass
QuizQuest        | quizquest
StudyBreak       | studybreak
Wellness Wave    | wellness-wave
How-To Hub       | how-to-hub
```

### Check Admin Users
```sql
SELECT clerk_user_id, role FROM public.user_profiles WHERE role = 'admin';
```

---

## 🚀 Testing the Setup

### 1. Test Database Connection
```bash
npm run db:check
```

### 2. Test Cloudflare Connection
```bash
npm run sync:check
```

### 3. Test Full Sync
```bash
npm run sync:simple
```

**Expected result:**
- Should find 38 videos from Cloudflare
- Should insert them into the content table
- No errors about missing tables

---

## 📞 Getting Help

### Still having issues?

1. **Check the logs:** Look for specific error messages in Supabase logs
2. **Verify permissions:** Make sure you have admin access
3. **Try step-by-step:** Use individual step guides instead of complete schema
4. **Fresh start:** Drop all tables and restart (⚠️ will lose data)

### Drop All Tables (Nuclear Option)
```sql
-- WARNING: This deletes ALL data
DROP TABLE IF EXISTS public.analytics_events CASCADE;
DROP TABLE IF EXISTS public.campus_updates CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.user_interactions CASCADE;
DROP TABLE IF EXISTS public.interactions CASCADE;
DROP TABLE IF EXISTS public.programs CASCADE;
DROP TABLE IF EXISTS public.content CASCADE;
DROP TABLE IF EXISTS public.channels CASCADE;
DROP TABLE IF EXISTS public.user_profiles CASCADE;
DROP VIEW IF EXISTS public.videos CASCADE;
```

Then restart with [Complete Schema](./COMPLETE_SCHEMA.md).

---

## 📋 Success Checklist

- ✅ All 9 tables created successfully
- ✅ 8 default channels inserted
- ✅ Admin user(s) configured
- ✅ Triggers set up for timestamps
- ✅ Foreign key relationships working
- ✅ Sync scripts can connect
- ✅ No permission errors