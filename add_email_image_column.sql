-- Add email_image_url column to campaigns table for storing selected brand image
-- This column will store the URL of the brand image selected for email body

-- Add email_image_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaigns' AND column_name = 'email_image_url') THEN
        ALTER TABLE campaigns ADD COLUMN email_image_url TEXT;
    END IF;
END $$;

-- Add comment to describe the column purpose
COMMENT ON COLUMN campaigns.email_image_url IS 'URL of the brand image selected for email body when send_email_as_image is true'; 