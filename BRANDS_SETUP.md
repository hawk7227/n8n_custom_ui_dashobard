# Brands Feature Setup Guide

This guide will help you set up the new Brands feature in your application.

## Database Setup

### 1. Create the Brands Table

Run the following SQL script in your Supabase SQL Editor:

```sql
-- Create brands table in Supabase
-- This table stores brand information with optional product links and images

CREATE TABLE IF NOT EXISTS brands (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    brand_name TEXT NOT NULL,
    brand_content TEXT NOT NULL,
    brand_uuid UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    product_link TEXT,
    product_images TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_brands_created_at ON brands(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_brands_brand_uuid ON brands(brand_uuid);
CREATE INDEX IF NOT EXISTS idx_brands_brand_name ON brands(brand_name);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_brands_updated_at 
    BEFORE UPDATE ON brands 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data (optional)
INSERT INTO brands (brand_name, brand_content, product_link, product_images) VALUES
('Nike', 'Just Do It. Leading sports brand known for innovative athletic footwear and apparel.', 'https://www.nike.com', ARRAY['https://example.com/nike1.jpg', 'https://example.com/nike2.jpg']),
('Apple', 'Think Different. Premium technology company creating innovative consumer electronics.', 'https://www.apple.com', ARRAY['https://example.com/apple1.jpg', 'https://example.com/apple2.jpg', 'https://example.com/apple3.jpg']),
('Coca-Cola', 'Taste the Feeling. Iconic beverage brand with a rich history spanning over a century.', 'https://www.coca-cola.com', ARRAY['https://example.com/coke1.jpg']),
('Tesla', 'Accelerating the world''s transition to sustainable energy through electric vehicles and clean energy solutions.', 'https://www.tesla.com', ARRAY['https://example.com/tesla1.jpg', 'https://example.com/tesla2.jpg']),
('Starbucks', 'To inspire and nurture the human spirit – one person, one cup and one neighborhood at a time.', 'https://www.starbucks.com', ARRAY['https://example.com/starbucks1.jpg', 'https://example.com/starbucks2.jpg', 'https://example.com/starbucks3.jpg']);
```

### 2. Verify Table Creation

After running the SQL script, you should see:
- A new `brands` table in your Supabase database
- Sample data with 5 brands
- Proper indexes for performance
- Automatic timestamp updates

## Features

### Brand Management
- **View Brands**: See all brands in a responsive card layout
- **Add Brands**: Create new brands with name, content, and optional product links/images
- **Edit Brands**: Update existing brand information
- **Delete Brands**: Remove brands with confirmation
- **Dynamic Images**: Add multiple product images per brand

### Brand Card Information
Each brand card displays:
- **Brand Name**: The name of the brand
- **Brand Content**: Description or content about the brand
- **Brand UUID**: Unique identifier for the brand
- **Product Link**: Optional link to the brand's product page
- **Product Images**: Optional array of image URLs (supports multiple images)
- **Creation Date**: When the brand was created
- **Actions**: Edit and delete buttons

### Navigation
- The Brands page is accessible via the sidebar navigation
- Uses the same layout as the Tools page with sidebar and navbar
- Responsive design that works on mobile and desktop

## Usage

### Accessing the Brands Page
1. Navigate to your application
2. Click on "Brands" in the sidebar navigation
3. You'll see the brands management interface

### Adding a New Brand
1. Click the "Add Brand" button
2. Fill in the required fields:
   - Brand Name (required)
   - Brand Content (required)
3. Optionally add:
   - Product Link (URL)
   - Product Images (multiple image URLs)
4. Click "Add Brand" to save

### Editing a Brand
1. Click the edit icon (pencil) on any brand card
2. Modify the information as needed
3. Click "Update Brand" to save changes

### Deleting a Brand
1. Click the delete icon (trash) on any brand card
2. Confirm the deletion in the popup
3. The brand will be permanently removed

## Technical Details

### Database Schema
```sql
brands table:
- id: UUID (Primary Key)
- brand_name: TEXT (Required)
- brand_content: TEXT (Required)
- brand_uuid: UUID (Unique, Auto-generated)
- product_link: TEXT (Optional)
- product_images: TEXT[] (Optional array of image URLs)
- created_at: TIMESTAMP (Auto-generated)
- updated_at: TIMESTAMP (Auto-updated)
```

### File Structure
```
src/
├── app/
│   └── brands/
│       └── page.tsx          # Brands page route
├── components/
│   ├── BrandsTab.tsx         # Main brands component
│   └── Sidebar.tsx           # Updated with brands navigation
└── lib/
    └── supabase.ts           # Supabase client configuration
```

### Dependencies
- `@supabase/supabase-js`: Database operations
- `react-hot-toast`: Toast notifications
- `react-icons`: Icons for the interface
- `next/navigation`: Next.js routing

## Security Notes

- Row Level Security (RLS) is **disabled** as requested
- No authentication required for database operations
- All users can read, write, update, and delete brands
- Consider enabling RLS in production for better security

## Troubleshooting

### Common Issues

1. **Brands not loading**: Check your Supabase connection and ensure the table exists
2. **Images not displaying**: Verify the image URLs are accessible and valid
3. **Add/Edit not working**: Check browser console for errors and ensure all required fields are filled

### Error Messages
- "Failed to fetch brands": Database connection issue
- "Failed to add brand": Validation error or database issue
- "Failed to update brand": Brand not found or validation error
- "Failed to delete brand": Brand not found or database issue

## Next Steps

Consider adding these features in the future:
- Brand categories/tags
- Brand logo upload
- Brand analytics
- Export brands to CSV/PDF
- Bulk operations (import/export)
- Brand templates 