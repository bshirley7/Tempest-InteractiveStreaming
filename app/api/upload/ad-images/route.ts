import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Check if Cloudflare R2 environment variables are configured
    const requiredEnvVars = [
      'CLOUDFLARE_ACCOUNT_ID',
      'CLOUDFLARE_R2_BUCKET_NAME', 
      'CLOUDFLARE_R2_TOKEN_VALUE',
      'NEXT_PUBLIC_R2_BUCKET_URL'
    ];

    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('Missing required environment variables:', missingVars);
      return NextResponse.json({ 
        error: `Missing environment variables: ${missingVars.join(', ')}. Please configure Cloudflare R2 settings.`,
        missingVars 
      }, { status: 500 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const company = formData.get('company') as string;
    const category = formData.get('category') as string || 'general';
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!company) {
      return NextResponse.json({ error: 'Company name required' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and WebP allowed.' }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large. Max size is 10MB.' }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const timestamp = Date.now();
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `ad-images/${company}/${category}/${timestamp}-${sanitizedFileName}`;

    console.log('Attempting to upload to R2:', {
      fileName,
      fileSize: file.size,
      fileType: file.type,
      company,
      category
    });

    // Upload to Cloudflare R2
    const uploadUrl = `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${process.env.CLOUDFLARE_R2_BUCKET_NAME}/objects/${fileName}`;
    
    const uploadResponse = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${process.env.CLOUDFLARE_R2_TOKEN_VALUE}`,
        'Content-Type': file.type,
      },
      body: file,
    });

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Cloudflare R2 upload error:', {
        status: uploadResponse.status,
        statusText: uploadResponse.statusText,
        error: errorText
      });
      return NextResponse.json({ 
        error: `R2 upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`,
        details: errorText 
      }, { status: 500 });
    }

    // Construct the public URL - R2 bucket URL format
    const bucketUrl = process.env.NEXT_PUBLIC_R2_BUCKET_URL;
    const publicUrl = bucketUrl.endsWith('/') ? `${bucketUrl}${fileName}` : `${bucketUrl}/${fileName}`;

    console.log('Upload successful:', { fileName, publicUrl });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName,
      company,
      category,
      fileSize: file.size,
      fileType: file.type
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}