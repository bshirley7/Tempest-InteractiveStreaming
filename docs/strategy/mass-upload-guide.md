# Mass Upload to Cloudflare Stream Guide

This guide explains how to upload all videos from `public/content` to Cloudflare Stream while preserving their metadata and correctly categorizing them.

## Prerequisites

1. **Cloudflare Stream Account**: Set up Cloudflare Stream in your Cloudflare dashboard
2. **Environment Variables**: Add to your `.env.local`:
   ```
   CLOUDFLARE_ACCOUNT_ID=your_account_id
   CLOUDFLARE_API_TOKEN=your_api_token
   ```
3. **Convex Database**: Ensure your Convex schema supports the content fields

## Available Commands

### Dry Run (Recommended First Step)
```bash
npm run upload:dry-run
```
Shows what files would be uploaded without actually uploading them.

### Upload All Content
```bash
npm run upload:mass
```
Uploads all videos from `public/content` to Cloudflare Stream.

### Upload Only Movies
```bash
npm run upload:mass -- --filter=movie
```
Uploads only content from `public/content/movies/`.

### Upload Only TV Content
```bash
npm run upload:mass -- --filter=tv
```
Uploads only content from `public/content/tv/`.

### Upload Specific Channel
```bash
npm run upload:mass -- --channel=Explore
```
Uploads only content for a specific channel.

### Limited Upload (Testing)
```bash
npm run upload:mass -- --max=5
```
Uploads only the first 5 files (useful for testing).

## Content Organization

### Movies (`public/content/movies/`)
- **Content Type**: `movie`
- **Default Genre**: `Documentary`
- **Channel**: `Explore`
- All files in this folder are marked as movies in the database

### TV Content (`public/content/tv/`)
- **Content Type**: `tv`
- **Default Genre**: `Educational`
- **Channels**: Based on subfolder:
  - `campus-pulse/` → `Campus Life`
  - `career-compass/` → `Create`
  - `how-to-hub/` → `Create`
  - `retirewise/` → `Chill`
  - `study-break/` → `Campus Life`
  - `wellness-wave/` → `Chill`

## Metadata Handling

The script automatically reads JSON metadata files (e.g., `video_metadata.json`) and extracts:

- **Title**: From JSON `title` field or cleaned filename
- **Description**: From JSON `description` field
- **Duration**: From JSON `duration` field (seconds)
- **Tags**: From JSON `tags` array
- **Thumbnail**: From JSON `thumbnail` URL
- **Author**: From JSON `author` field
- **Upload Date**: From JSON `upload_date` field

## Upload Process

For each video file:

1. **Parse Metadata**: Load JSON metadata file
2. **Determine Content Type**: Based on folder structure (movies vs tv)
3. **Upload to Cloudflare**: Stream with metadata
4. **Update Database**: Create Convex content entry with proper categorization
5. **Generate Report**: Save detailed upload results

## Example Upload Flow

```bash
# 1. First, do a dry run to see what will be uploaded
npm run upload:dry-run

# 2. Upload a small batch to test
npm run upload:mass -- --max=3

# 3. Upload all movies
npm run upload:mass -- --filter=movie

# 4. Upload all TV content
npm run upload:mass -- --filter=tv

# 5. Or upload everything at once
npm run upload:mass
```

## Upload Results

After completion, you'll get:

- **Console Summary**: Success/failure counts
- **Report File**: `upload-report.json` with detailed results
- **Database Entries**: All successful uploads added to Convex
- **Cloudflare Videos**: Videos available in your Cloudflare Stream dashboard

## Error Handling

The script handles:
- **File Size Limits**: Cloudflare Stream 30GB limit
- **Rate Limiting**: 2-second delays between uploads
- **Missing Metadata**: Fallback to filename-based metadata
- **Network Errors**: Retry logic and detailed error reporting
- **Database Failures**: Separate tracking of upload vs database success

## Monitoring Upload Progress

Watch the console output for:
- ✅ Successful uploads with video IDs
- ❌ Failed uploads with error details
- 📊 Progress indicators `[X/Total]`
- 💾 Database update confirmations
- 📋 Metadata loading confirmations

## Post-Upload Verification

1. **Check Cloudflare Dashboard**: Verify videos appear in Stream
2. **Check Convex Database**: Confirm content entries are created
3. **Test Playback**: Ensure videos play correctly
4. **Review Categories**: Verify movies vs TV categorization
5. **Check Metadata**: Confirm titles, descriptions, and tags are correct

## Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   ```
   Error: Missing Cloudflare configuration
   ```
   Solution: Add `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` to `.env.local`

2. **File Too Large**
   ```
   File too large: 35.2GB (max 30GB)
   ```
   Solution: Compress video or split into smaller segments

3. **Network Timeout**
   ```
   Upload failed: Network timeout
   ```
   Solution: Check internet connection, retry failed uploads

4. **Database Update Failed**
   ```
   Database update failed: Channel not found
   ```
   Solution: Ensure all channels exist in Convex, run channel seeder

## Cost Considerations

Cloudflare Stream pricing (as of 2025):
- **Storage**: $5/month per 1,000 minutes
- **Delivery**: $1 per 1,000 minutes delivered

Estimate your costs based on total video duration before uploading.

## Best Practices

1. **Start Small**: Always do a dry run first
2. **Test Batch**: Upload 3-5 videos first to verify everything works
3. **Monitor Progress**: Watch console output for any issues
4. **Backup Metadata**: Keep your JSON files as backup
5. **Verify Results**: Check both Cloudflare and Convex after upload
6. **Plan Bandwidth**: Large uploads may take several hours