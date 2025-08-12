# Supabase Setup for Landing Pages

## Environment Variables

Create a `.env.local` file in your project root and add the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Database Table Setup

Create a table named `landingpages` in your Supabase database with the following structure:

```sql
CREATE TABLE landingpages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id TEXT NOT NULL,
  name TEXT,
  brand TEXT,
  html_code TEXT,
  images JSONB DEFAULT '[]',
  purchase_link TEXT,
  header_code TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Optional: Add indexes for better performance

```sql
CREATE INDEX idx_landingpages_session_id ON landingpages(session_id);
CREATE INDEX idx_landingpages_created_at ON landingpages(created_at DESC);
CREATE INDEX idx_landingpages_header_code ON landingpages USING GIN (to_tsvector('english', header_code));
```

### Adding the header_code column (if table already exists)

If you already have a `landingpages` table, run this SQL to add the new column:

```sql
-- Run the contents of add_header_code_column.sql
ALTER TABLE landingpages ADD COLUMN IF NOT EXISTS header_code TEXT DEFAULT '';
```

## Getting Your Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to Settings > API in your project dashboard
3. Copy the "Project URL" and "anon public" key
4. Replace the placeholder values in your `.env.local` file

## Features

The landing pages route includes:
- Display all landing pages from the `landingpages` table
- Show ID, session_id, and creation date for each page
- Delete functionality for each landing page
- Refresh button to reload data
- Create new button that opens the landing page builder
- **Header Code Editor**: Edit HTML/CSS/JavaScript code that gets inserted in the `<head>` section
- Responsive card layout
- Loading states and error handling

## Header Code Feature

The new `header_code` column allows you to:
- Add custom HTML, CSS, and JavaScript to your landing pages
- Insert meta tags, analytics scripts, custom fonts, and external resources
- The code is automatically applied to all pages using the landing page template
- Edit the code directly from the landing pages dashboard using the code button (🔧)

## Session-Based Landing Pages

The system now supports session-based landing pages:

1. **URL Format**: `https://your-domain.com/landing/[session_id]`
2. **Session Loading**: When accessing `/landing-page-builder?session=[session_id]`, the system:
   - Checks if the session exists in Supabase
   - If found, loads the existing landing page preview
   - If not found, creates a new session with that ID
3. **Dynamic Landing Pages**: Each session gets its own unique landing page URL
4. **Preview Integration**: The landing page builder automatically shows the preview for existing sessions 