-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_name TEXT NOT NULL,
  campaign_description TEXT,
  campaign_type TEXT CHECK (campaign_type IN ('email', 'sms', 'both')) DEFAULT 'both',
  status TEXT CHECK (status IN ('draft', 'active', 'paused', 'completed', 'failed')) DEFAULT 'draft',
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  brand_name TEXT,
  email_subject TEXT,
  email_body TEXT,
  send_email_as_image BOOLEAN DEFAULT FALSE,
  mms_text_content TEXT,
  mms_image_url TEXT,
  selected_campaign_filter TEXT,
  total_recipients INTEGER DEFAULT 0,
  created_by TEXT DEFAULT 'User',
  tags TEXT[] DEFAULT '{}',
  emails_sent INTEGER DEFAULT 0,
  emails_delivered INTEGER DEFAULT 0,
  emails_opened INTEGER DEFAULT 0,
  emails_clicked INTEGER DEFAULT 0,
  emails_failed INTEGER DEFAULT 0,
  emails_pending INTEGER DEFAULT 0,
  mms_sent INTEGER DEFAULT 0,
  mms_delivered INTEGER DEFAULT 0,
  mms_failed INTEGER DEFAULT 0,
  mms_pending INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_campaigns_status ON campaigns(status);
CREATE INDEX IF NOT EXISTS idx_campaigns_brand_id ON campaigns(brand_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_created_at ON campaigns(created_at);

-- Enable Row Level Security
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

-- Create policy for full access (you can modify this based on your auth requirements)
CREATE POLICY "Enable full access to campaigns" ON campaigns
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
CREATE TRIGGER update_campaigns_updated_at 
  BEFORE UPDATE ON campaigns 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column(); 