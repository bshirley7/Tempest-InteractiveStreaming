# 📚 Content Shelves Setup Guide

Your `/library` page now uses **database-driven content shelves** instead of hardcoded categories. Here's how to set everything up:

## 🚀 **Quick Start**

### 1. **Run the Database Migration**
First, you need to create the content shelves tables in Supabase:

**Option A: Via Supabase Dashboard**
- Go to your Supabase dashboard → SQL Editor
- Run the SQL from: `supabase/migrations/20250628000001_add_content_shelves.sql`

**Option B: Via Supabase CLI**
```bash
supabase db push
```

### 2. **Start Your Dev Server**
```bash
npm run dev
```

### 3. **Set Up Your First Content Shelves**
1. Go to `/admin` → Content → Content Shelves
2. Click "Create Shelf"
3. Create these recommended shelves:
   - **Career Development** (Row layout, 16:9 aspect ratio)
   - **Documentaries** (Row layout, Poster aspect ratio)
   - **Travel & Guides** (Grid layout, 16:9 aspect ratio)

### 4. **Assign Your Videos**
1. For each shelf, click the eye icon 👁️
2. Click "Assign Content"
3. Select videos from the available content list
4. Click the + button to assign them

### 5. **Check Your Library**
Visit `/library` to see your custom content shelves in action!

## 🔧 **How It Works**

### **Smart Fallback System**
The `/library` page now has a smart fallback system:

- **Content Shelves Mode**: If you have shelves configured with content assigned
- **Fallback Mode**: If no shelves are set up, shows basic "Just Added" and "Trending" sections

### **Console Debugging**
Open your browser console when visiting `/library` to see detailed logs:
- 🔄 Loading indicators
- 📦 Data fetched
- ✅ Success messages
- ❌ Error details

### **What You'll See**
- If content shelves are configured: Your custom shelves exactly as you set them up
- If not configured yet: Basic content organization + a helpful notice to set up shelves

## 📝 **Content Shelf Options**

### **Layout Styles**
- **Row**: Horizontal scrolling row (Netflix-style)
- **Grid**: 2x4 grid layout for browsing
- **Hero**: Large featured content (auto-rotates)

### **Aspect Ratios**
- **16:9**: Standard widescreen (most content)
- **Poster**: Tall movie poster style (documentaries)
- **Square**: 1:1 ratio for special content

### **Settings**
- **Name**: Display name for the shelf
- **Description**: Subtitle text
- **Max Items**: How many videos to show (1-50)
- **Display Order**: Controls the order shelves appear

## 🎯 **Your Use Case**

For your specific request about Career Development and Documentaries content:

1. **Create "Career Development" shelf**:
   - Layout: Row
   - Aspect Ratio: 16:9
   - Max Items: 12

2. **Create "Documentaries" shelf**:
   - Layout: Row  
   - Aspect Ratio: Poster
   - Max Items: 10

3. **Manually assign your career and documentary videos** to the appropriate shelves

4. The `/library` page will automatically display these shelves with your assigned content!

## 🔍 **Troubleshooting**

### **Shelves Not Loading in Admin**
Check the browser console for errors. Common issues:
- Database migration not run
- Supabase service role key not configured
- Network connectivity issues

### **Library Shows Fallback Mode**
This means:
- No content shelves are configured yet, OR
- All shelves are empty (no content assigned)

### **Content Not Appearing**
Make sure:
- Content is published (`is_published = true`)
- Content is assigned to shelves
- Shelves are active (`is_active = true`)

## 🎉 **Benefits**

✅ **Complete Control**: You decide exactly what goes where  
✅ **Flexible Layouts**: Mix rows, grids, and hero sections  
✅ **Easy Management**: Drag & drop interface in admin  
✅ **No More Auto-Categorization**: No surprises or misplaced videos  
✅ **Instant Updates**: Changes appear immediately on `/library`  

Now you can organize your library exactly how you want it! 🚀