-- Add email_landing_page_url column to campaigns table for storing selected landing page URL
-- This column will store the URL of the landing page that the email body image links to

-- Add email_landing_page_url column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'campaigns' AND column_name = 'email_landing_page_url') THEN
        ALTER TABLE campaigns ADD COLUMN email_landing_page_url TEXT;
    END IF;
END $$;

-- Add comment to describe the column purpose
COMMENT ON COLUMN campaigns.email_landing_page_url IS 'URL of the landing page that the email body image links to when send_email_as_image is true'; 