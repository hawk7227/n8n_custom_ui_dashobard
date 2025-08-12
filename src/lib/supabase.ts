import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LandingPage {
  id: string | number;
  created_at?: string;
  html_code?: string;
  name?: string;
  images?: any;
  brand?: string;
  purchase_link?: string;
  session_id: string | number;
  header_code?: string;
}

export interface Brand {
  id: string | number;
  brand_name: string;
  brand_content: string;
  brand_uuid: string;
  product_link?: string;
  product_images?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Image {
  id: string;
  image_url: string;
  brand_name?: string;
  file_name?: string;
  file_size?: number;
  mime_type?: string;
  created_at?: string;
  updated_at?: string;
} 