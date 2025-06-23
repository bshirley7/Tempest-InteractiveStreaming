/**
 * Cloudflare R2 client using AWS SDK
 */
import AWS from 'aws-sdk';
import { CLOUDFLARE_R2_CONFIG, isCloudflareR2Configured } from './cloudflare';

let r2Client: AWS.S3 | null = null;

/**
 * Get or create R2 client instance
 */
export function getR2Client(): AWS.S3 {
  if (!isCloudflareR2Configured()) {
    throw new Error('Cloudflare R2 is not properly configured');
  }

  if (!r2Client) {
    r2Client = new AWS.S3({
      endpoint: CLOUDFLARE_R2_CONFIG.endpoint,
      accessKeyId: CLOUDFLARE_R2_CONFIG.accessKeyId!,
      secretAccessKey: CLOUDFLARE_R2_CONFIG.secretAccessKey!,
      region: 'auto',
      signatureVersion: 'v4',
    });
  }

  return r2Client;
}

/**
 * Upload file to R2 bucket
 */
export async function uploadToR2(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType?: string,
  metadata?: Record<string, string>
): Promise<AWS.S3.ManagedUpload.SendData> {
  const client = getR2Client();
  
  const params: AWS.S3.PutObjectRequest = {
    Bucket: CLOUDFLARE_R2_CONFIG.bucketName!,
    Key: key,
    Body: body,
    ContentType: contentType,
    Metadata: metadata,
    CacheControl: 'public, max-age=31536000', // 1 year cache for logos
  };

  return client.upload(params).promise();
}

/**
 * Upload file with progress tracking
 */
export function uploadToR2WithProgress(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType?: string,
  metadata?: Record<string, string>,
  onProgress?: (progress: number) => void
): Promise<AWS.S3.ManagedUpload.SendData> {
  const client = getR2Client();
  
  const params: AWS.S3.PutObjectRequest = {
    Bucket: CLOUDFLARE_R2_CONFIG.bucketName!,
    Key: key,
    Body: body,
    ContentType: contentType,
    Metadata: metadata,
    CacheControl: 'public, max-age=31536000',
  };

  const upload = client.upload(params);
  
  if (onProgress) {
    upload.on('httpUploadProgress', (progress) => {
      const percentage = Math.round((progress.loaded / progress.total) * 100);
      onProgress(percentage);
    });
  }

  return upload.promise();
}

/**
 * Get object from R2 bucket
 */
export async function getFromR2(key: string): Promise<AWS.S3.GetObjectOutput> {
  const client = getR2Client();
  
  const params: AWS.S3.GetObjectRequest = {
    Bucket: CLOUDFLARE_R2_CONFIG.bucketName!,
    Key: key,
  };

  return client.getObject(params).promise();
}

/**
 * Delete object from R2 bucket
 */
export async function deleteFromR2(key: string): Promise<AWS.S3.DeleteObjectOutput> {
  const client = getR2Client();
  
  const params: AWS.S3.DeleteObjectRequest = {
    Bucket: CLOUDFLARE_R2_CONFIG.bucketName!,
    Key: key,
  };

  return client.deleteObject(params).promise();
}

/**
 * Generate presigned URL for R2 object
 */
export function generatePresignedUrl(
  key: string,
  operation: 'getObject' | 'putObject' = 'getObject',
  expiresIn: number = 3600
): string {
  const client = getR2Client();
  
  return client.getSignedUrl(operation, {
    Bucket: CLOUDFLARE_R2_CONFIG.bucketName!,
    Key: key,
    Expires: expiresIn,
  });
}

/**
 * List objects in R2 bucket
 */
export async function listR2Objects(prefix?: string): Promise<AWS.S3.ListObjectsV2Output> {
  const client = getR2Client();
  
  const params: AWS.S3.ListObjectsV2Request = {
    Bucket: CLOUDFLARE_R2_CONFIG.bucketName!,
    Prefix: prefix,
  };

  return client.listObjectsV2(params).promise();
}