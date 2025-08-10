import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with service role key for server-side operations
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Supabase configuration missing' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const formData = await request.formData();
    const brandName = formData.get('brandName') as string;
    
    // Get all files from FormData
    const files: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('files[') && value instanceof File) {
        files.push(value);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 });
    }

    const results = [];
    const errors = [];

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      try {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          errors.push({ fileName: file.name, error: 'File must be an image' });
          continue;
        }

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
          errors.push({ fileName: file.name, error: 'File size must be less than 10MB' });
          continue;
        }

        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}-${i}.${fileExt}`;
        const filePath = `${fileName}`;

        // Convert file to buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload to Supabase Storage using service role
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, buffer, {
            contentType: file.type,
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error for', file.name, ':', uploadError);
          errors.push({ fileName: file.name, error: 'Failed to upload image' });
          continue;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('images')
          .getPublicUrl(filePath);

        // Save to database using service role
        const { data: dbData, error: dbError } = await supabase
          .from('images')
          .insert({
            image_url: publicUrl,
            brand_name: brandName?.trim() || null,
            file_name: file.name,
            file_size: file.size,
            mime_type: file.type
          })
          .select()
          .single();

        if (dbError) {
          console.error('Database error for', file.name, ':', dbError);
          errors.push({ fileName: file.name, error: 'Failed to save image information' });
          continue;
        }

        results.push(dbData);
      } catch (error) {
        console.error('Error processing file', file.name, ':', error);
        errors.push({ fileName: file.name, error: 'Internal server error' });
      }
    }

    return NextResponse.json({ 
      success: true, 
      uploaded: results,
      errors: errors,
      summary: {
        total: files.length,
        successful: results.length,
        failed: errors.length
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 