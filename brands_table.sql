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

-- Enable Row Level Security (RLS) - DISABLED as requested
-- ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS (commented out as RLS is disabled)
-- CREATE POLICY "Enable read access for all users" ON brands FOR SELECT USING (true);
-- CREATE POLICY "Enable insert for authenticated users only" ON brands FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Enable update for authenticated users only" ON brands FOR UPDATE USING (auth.role() = 'authenticated');
-- CREATE POLICY "Enable delete for authenticated users only" ON brands FOR DELETE USING (auth.role() = 'authenticated'); 