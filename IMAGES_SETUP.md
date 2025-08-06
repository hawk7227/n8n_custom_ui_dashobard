# Images Setup Guide

This guide will help you set up the images functionality in your Supabase project.

## 1. Create the Images Table

You have two options depending on your situation:

### Option A: If you don't have an images table yet (Recommended)

Run the following SQL in your Supabase SQL editor:

```sql
-- Create images table
CREATE TABLE images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  brand_name TEXT,
  file_name TEXT,
  file_size INTEGER,
  mime_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX idx_images_brand_name ON images(brand_name);
CREATE INDEX idx_images_created_at ON images(created_at);

-- Enable Row Level Security (RLS)
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (you can modify this based on your auth requirements)
CREATE POLICY "Allow all operations on images" ON images
  FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_images_updated_at 
  BEFORE UPDATE ON images 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

### Option B: If you already have an images table but missing columns

If you're getting the error "column brand_name does not exist", run this safe fix:

```sql
-- Safe fix for existing images table - add missing columns
-- This script will add the missing columns without dropping the table

-- Add brand_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'images' AND column_name = 'brand_name') THEN
        ALTER TABLE images ADD COLUMN brand_name TEXT;
    END IF;
END $$;

-- Add file_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'images' AND column_name = 'file_name') THEN
        ALTER TABLE images ADD COLUMN file_name TEXT;
    END IF;
END $$;

-- Add file_size column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'images' AND column_name = 'file_size') THEN
        ALTER TABLE images ADD COLUMN file_size INTEGER;
    END IF;
END $$;

-- Add mime_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'images' AND column_name = 'mime_type') THEN
        ALTER TABLE images ADD COLUMN mime_type TEXT;
    END IF;
END $$;

-- Add updated_at column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'images' AND column_name = 'updated_at') THEN
        ALTER TABLE images ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_images_brand_name ON images(brand_name);
CREATE INDEX IF NOT EXISTS idx_images_created_at ON images(created_at);

-- Enable Row Level Security (RLS) if not already enabled
ALTER TABLE images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Allow all operations on images" ON images;

-- Create policy to allow all operations
CREATE POLICY "Allow all operations on images" ON images
  FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_images_updated_at ON images;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_images_updated_at 
  BEFORE UPDATE ON images 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
```

## 2. Create Storage Bucket

1. Go to your Supabase dashboard
2. Navigate to **Storage** in the left sidebar
3. Click **Create a new bucket**
4. Set the bucket name to: `images`
5. Make sure **Public bucket** is checked (so images can be accessed publicly)
6. Click **Create bucket**

## 3. Configure Storage Policies

Run the following SQL to set up storage policies:

```sql
-- Allow public access to read images
CREATE POLICY "Public Access" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Allow users to update their own images (optional)
CREATE POLICY "Users can update images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'images' AND auth.role() = 'authenticated');

-- Allow users to delete images (optional)
CREATE POLICY "Users can delete images" ON storage.objects
  FOR DELETE USING (bucket_id = 'images' AND auth.role() = 'authenticated');
```

## 4. Environment Variables

Make sure your `.env.local` file has the correct Supabase configuration:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

**Important:** You need to add the `SUPABASE_SERVICE_ROLE_KEY` for server-side operations. You can find this in your Supabase dashboard under Settings > API.

## 5. Features

The images section includes the following features:

- **Upload Images**: Drag and drop or click to select images (max 10MB)
- **View Images**: Click the eye icon to view images in full size
- **Edit Brand**: Click the edit icon to change the brand name associated with an image
- **Delete Images**: Click the trash icon to delete images (removes from both storage and database)
- **Image Cards**: Display images in a responsive grid with preview thumbnails
- **Statistics**: Shows total images, total size, and number of brands
- **Search & Filter**: (Can be added later if needed)

## 6. File Structure

```
src/
├── app/
│   ├── images/
│   │   └── page.tsx              # Main images page
│   └── api/
│       ├── upload-image/
│       │   └── route.ts          # Upload API route (server-side)
│       └── delete-image/
│           └── route.ts          # Delete API route (server-side)
├── components/
│   ├── ImagesTab.tsx            # Main images component
│   ├── UploadImageDialog.tsx    # Upload dialog
│   └── EditImageDialog.tsx      # Edit dialog
└── lib/
    └── supabase.ts              # Updated with Image interface
```

## 7. Usage

1. Navigate to `/images` in your application
2. Click **Upload Image** to add new images
3. Use the action buttons on each image card to view, edit, or delete
4. Images are automatically organized by upload date
5. Brand names can be added during upload or edited later

## 8. Security Notes

- The current setup allows public read access to images
- Upload and delete operations require authentication
- File size is limited to 10MB per image
- Only image files are accepted (MIME type validation)
- Unique filenames are generated to prevent conflicts

## 9. Customization

You can customize the following:

- **File size limit**: Modify the 10MB limit in `UploadImageDialog.tsx`
- **Allowed file types**: Update the MIME type validation
- **Storage bucket name**: Change from 'images' to your preferred name
- **Image quality**: Add image compression if needed
- **Thumbnail generation**: Add automatic thumbnail creation
- **Search functionality**: Add search by brand name or filename 