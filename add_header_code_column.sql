-- Add header_code column to landingpages table
-- This column will store HTML/CSS/JavaScript code that gets inserted in the <head> section

-- Add the header_code column
ALTER TABLE landingpages 
ADD COLUMN IF NOT EXISTS header_code TEXT;

-- Add a comment to describe the column purpose
COMMENT ON COLUMN landingpages.header_code IS 'HTML/CSS/JavaScript code to be inserted in the <head> section of landing pages';

-- Create an index for better performance when searching by header_code content
CREATE INDEX IF NOT EXISTS idx_landingpages_header_code ON landingpages USING GIN (to_tsvector('english', header_code));

-- Update existing records to have empty header_code if they don't have it
UPDATE landingpages 
SET header_code = '' 
WHERE header_code IS NULL;

-- Make the column NOT NULL with default empty string
ALTER TABLE landingpages 
ALTER COLUMN header_code SET NOT NULL,
ALTER COLUMN header_code SET DEFAULT '';

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'landingpages' AND column_name = 'header_code'; 