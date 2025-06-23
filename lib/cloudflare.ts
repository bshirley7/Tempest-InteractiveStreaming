/**
 * Cloudflare Stream and R2 integration utilities
 */

// Cloudflare Stream configuration
export const CLOUDFLARE_STREAM_CONFIG = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  apiToken: process.env.CLOUDFLARE_STREAM_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN,
  customerSubdomain: process.env.CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN,
};

// Cloudflare R2 configuration
export const CLOUDFLARE_R2_CONFIG = {
  accountId: process.env.CLOUDFLARE_ACCOUNT_ID,
  accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME,
  endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
};

/**
 * Check if Cloudflare Stream is properly configured
 */
export function isCloudflareStreamConfigured(): boolean {
  // Log configuration for debugging
  if (typeof window === 'undefined') {
    console.log('Cloudflare Stream Configuration Check:');
    console.log('- Account ID:', CLOUDFLARE_STREAM_CONFIG.accountId ? '✅ Set' : '❌ Missing');
    console.log('- API Token:', CLOUDFLARE_STREAM_CONFIG.apiToken ? '✅ Set' : '❌ Missing');
    console.log('- Customer Subdomain:', CLOUDFLARE_STREAM_CONFIG.customerSubdomain ? '✅ Set' : '❌ Missing');
  }
  
  return !!(
    CLOUDFLARE_STREAM_CONFIG.accountId &&
    CLOUDFLARE_STREAM_CONFIG.apiToken &&
    CLOUDFLARE_STREAM_CONFIG.customerSubdomain &&
    CLOUDFLARE_STREAM_CONFIG.accountId.length > 10 &&
    CLOUDFLARE_STREAM_CONFIG.apiToken.length > 20 &&
    CLOUDFLARE_STREAM_CONFIG.customerSubdomain.length > 5 &&
    !CLOUDFLARE_STREAM_CONFIG.customerSubdomain.includes('your-subdomain') &&
    !CLOUDFLARE_STREAM_CONFIG.apiToken.includes('your-api-token')
  );
}

/**
 * Check if Cloudflare R2 is properly configured
 */
export function isCloudflareR2Configured(): boolean {
  return !!(
    CLOUDFLARE_R2_CONFIG.accountId &&
    CLOUDFLARE_R2_CONFIG.accessKeyId &&
    CLOUDFLARE_R2_CONFIG.secretAccessKey &&
    CLOUDFLARE_R2_CONFIG.bucketName &&
    CLOUDFLARE_R2_CONFIG.accessKeyId.length > 10 &&
    CLOUDFLARE_R2_CONFIG.secretAccessKey.length > 20 &&
    CLOUDFLARE_R2_CONFIG.bucketName.length > 3 &&
    !CLOUDFLARE_R2_CONFIG.accessKeyId.includes('your-access-key') &&
    !CLOUDFLARE_R2_CONFIG.secretAccessKey.includes('your-secret-key')
  );
}

/**
 * Generate Cloudflare Stream embed URL
 */
export function getStreamEmbedUrl(videoId: string): string {
  if (!isCloudflareStreamConfigured()) {
    throw new Error('Cloudflare Stream is not properly configured');
  }
  
  return `https://${CLOUDFLARE_STREAM_CONFIG.customerSubdomain}.cloudflarestream.com/${videoId}/iframe`;
}

/**
 * Generate Cloudflare Stream thumbnail URL
 */
export function getStreamThumbnailUrl(videoId: string, options?: {
  time?: string;
  width?: number;
  height?: number;
}): string {
  if (!isCloudflareStreamConfigured()) {
    throw new Error('Cloudflare Stream is not properly configured');
  }
  
  const params = new URLSearchParams();
  if (options?.time) params.append('time', options.time);
  if (options?.width) params.append('width', options.width.toString());
  if (options?.height) params.append('height', options.height.toString());
  
  const queryString = params.toString();
  const baseUrl = `https://${CLOUDFLARE_STREAM_CONFIG.customerSubdomain}.cloudflarestream.com/${videoId}/thumbnails/thumbnail.jpg`;
  
  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
}

/**
 * Generate signed URL for Cloudflare R2 object
 */
export async function generateR2SignedUrl(
  objectKey: string,
  expiresIn: number = 3600
): Promise<string> {
  if (!isCloudflareR2Configured()) {
    throw new Error('Cloudflare R2 is not properly configured');
  }

  // This would typically use AWS SDK v3 or a similar library
  // For now, return a placeholder URL structure
  return `${CLOUDFLARE_R2_CONFIG.endpoint}/${CLOUDFLARE_R2_CONFIG.bucketName}/${objectKey}`;
}