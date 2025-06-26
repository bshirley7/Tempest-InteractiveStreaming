/**
 * API route for handling file uploads to Cloudflare R2
 */
import { NextRequest, NextResponse } from 'next/server';
import { uploadToR2, generatePresignedUrl, uploadToR2WithProgress } from '@/lib/r2-client';
import { isCloudflareR2Configured } from '@/lib/cloudflare';
import * as Sentry from '@sentry/nextjs';

export async function POST(request: NextRequest) {
  try {
    // Check if R2 is configured
    if (!isCloudflareR2Configured()) {
      return NextResponse.json(
        { error: 'Cloudflare R2 is not properly configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 100MB for general uploads, 2MB for logos for better performance)
    const isLogo = formData.get('type') === 'logo';
    const maxSize = isLogo ? 2 * 1024 * 1024 : 100 * 1024 * 1024; // 2MB for logos, 100MB for others
    if (file.size > maxSize) {
      const maxSizeText = isLogo ? '2MB' : '100MB';
      return NextResponse.json(
        { error: `File too large. Maximum size is ${maxSizeText} for optimal performance` },
        { status: 400 }
      );
    }

    // Generate unique key for the file
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const prefix = isLogo ? 'logos' : 'uploads';
    const key = `${prefix}/${timestamp}-${sanitizedName}`;

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // For SVG files, also extract the content
    let svgContent = '';
    if (file.type.includes('svg') || file.name.toLowerCase().endsWith('.svg')) {
      svgContent = buffer.toString('utf-8');
    }

    // Upload to R2 with metadata
    const metadata = {
      originalName: file.name,
      uploadedAt: new Date().toISOString(),
      fileType: isLogo ? 'logo' : 'general',
    };

    const result = await uploadToR2(key, buffer, file.type, metadata);

    return NextResponse.json({
      success: true,
      key: key,
      url: result.Location || `https://${process.env.CLOUDFLARE_R2_BUCKET_NAME}.r2.cloudflarestorage.com/${key}`,
      size: file.size,
      type: file.type,
      metadata,
      ...(svgContent && { svgContent }),
    });

  } catch (error) {
    console.error('Upload error:', error);
    Sentry.captureException(error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
    return NextResponse.json(
      { error: `Upload failed: ${errorMessage}` },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if R2 is configured
    if (!isCloudflareR2Configured()) {
      return NextResponse.json(
        { error: 'Cloudflare R2 is not properly configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');
    const operation = searchParams.get('operation') as 'getObject' | 'putObject' || 'getObject';
    const expiresIn = parseInt(searchParams.get('expiresIn') || '3600');

    if (!key) {
      return NextResponse.json(
        { error: 'Key parameter is required' },
        { status: 400 }
      );
    }

    // Generate presigned URL
    const presignedUrl = generatePresignedUrl(key, operation, expiresIn);

    return NextResponse.json({
      success: true,
      url: presignedUrl,
      expiresIn,
    });

  } catch (error) {
    console.error('Presigned URL generation error:', error);
    Sentry.captureException(error);
    
    return NextResponse.json(
      { error: 'Failed to generate presigned URL' },
      { status: 500 }
    );
  }
}