# Cloudflare Setup Guide for xCast Platform

This guide will walk you through setting up Cloudflare R2 (storage) and Stream (video) services and gathering the required environment variables for your xCast application.

## Prerequisites

- Cloudflare account (sign up at https://cloudflare.com if you don't have one)
- Credit card for verification (R2 and Stream have generous free tiers)

---

## Part 1: Cloudflare Account Setup

### 1. Get Your Account ID

1. Log into your Cloudflare dashboard: https://dash.cloudflare.com
2. In the right sidebar, you'll see **Account ID**
3. Copy this value - this is your `CLOUDFLARE_ACCOUNT_ID`

---

## Part 2: Cloudflare R2 Setup (Object Storage)

### 1. Enable Cloudflare R2

1. In your Cloudflare dashboard, go to **R2 Object Storage** in the left sidebar
2. Click **Create bucket**
3. Choose a bucket name (e.g., `xcast-assets` or `xcast-media`)
4. Select a region (choose closest to your users)
5. Click **Create bucket**
6. Copy the bucket name - this is your `CLOUDFLARE_R2_BUCKET_NAME`

### 2. Create R2 API Tokens

1. Go to **Manage R2 API tokens** (in the R2 section)
2. Click **Create API token**
3. Use these settings:
   - **Token name**: `xCast R2 Access`
   - **Permissions**: `Object Read & Write`
   - **R2 bucket**: Select your bucket or choose "All buckets"
4. Click **Create API token**
5. Copy the values:
   - **Access Key ID** → `CLOUDFLARE_R2_ACCESS_KEY_ID`
   - **Secret Access Key** → `CLOUDFLARE_R2_SECRET_ACCESS_KEY`

> ⚠️ **Important**: Save these values immediately - you cannot view the secret key again!

### 3. Configure Public Access (Optional)

If you want direct public access to your assets:

1. Go to your bucket settings
2. Under **Public access**, configure custom domains or use the default R2.dev subdomain
3. Note the public URL format for later use

---

## Part 3: Cloudflare Stream Setup (Video Hosting)

### 1. Enable Cloudflare Stream

1. In your Cloudflare dashboard, go to **Stream** in the left sidebar
2. If not enabled, click **Enable Stream**
3. Accept the pricing terms (generous free tier: 1,000 minutes of storage free)

### 2. Get Your Customer Subdomain

1. In the Stream dashboard, look for **Customer Subdomain**
2. It will be in the format: `customer-xxxxxxxx`
3. Copy this value - this is your `CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN`

### 3. Create Stream API Token

1. Go to **API Tokens** in the main Cloudflare dashboard (top right profile → My Profile → API Tokens)
2. Click **Create Token**
3. Use **Custom token** and configure:
   - **Token name**: `xCast Stream API`
   - **Permissions**:
     - `Zone:Zone:Read` (if you have domains)
     - `Account:Stream:Edit`
     - `Account:Stream:Read`
   - **Account Resources**: Include your account
4. Click **Continue to summary** → **Create Token**
5. Copy the token - this is your `CLOUDFLARE_STREAM_API_TOKEN`

---

## Part 4: Webhook Setup (Optional but Recommended)

### 1. Create Webhook Endpoint

1. In the Stream dashboard, go to **Webhooks**
2. Click **Add endpoint**
3. Enter your webhook URL: `https://yourdomain.com/api/webhooks/cloudflare-stream`
4. Select events to monitor:
   - `video.upload.success`
   - `video.upload.error`  
   - `video.processing.complete`
   - `video.processing.error`
5. Generate a secret key for verification
6. Copy the secret - this is your `CLOUDFLARE_WEBHOOK_SECRET`

---

## Part 5: Environment Variables Summary

Create a `.env.local` file in your project root with these values:

```bash
# Cloudflare Account
CLOUDFLARE_ACCOUNT_ID=your_account_id_from_step_1

# Cloudflare R2 Storage  
CLOUDFLARE_R2_ACCESS_KEY_ID=your_r2_access_key_from_step_2
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your_r2_secret_key_from_step_2
CLOUDFLARE_R2_BUCKET_NAME=your_bucket_name_from_step_2

# Cloudflare Stream
CLOUDFLARE_STREAM_API_TOKEN=your_stream_token_from_step_3
CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN=your_customer_subdomain_from_step_3

# Webhooks (optional)
CLOUDFLARE_WEBHOOK_SECRET=your_webhook_secret_from_step_4
```

---

## Part 6: Test Your Setup

### 1. Install Required Dependencies

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner form-data
```

### 2. Run Migration Script

```bash
npm run migrate:cloudflare
```

This will:
- Upload all your existing channel logos to R2
- Upload all your existing videos to Stream  
- Update your Convex database with new URLs
- Generate a detailed migration report

---

## Pricing Information

### Cloudflare R2
- **Storage**: $0.015/GB/month
- **Requests**: Class A (write): $4.50/million, Class B (read): $0.36/million
- **Data Transfer**: Egress free when accessed via Cloudflare CDN
- **Free Tier**: 10 GB storage, 1 million Class A requests, 10 million Class B requests

### Cloudflare Stream
- **Storage**: $5/1,000 minutes stored
- **Delivery**: $1/1,000 minutes delivered
- **Free Tier**: 1,000 minutes of storage, 1,000 minutes of delivery per month

---

## Troubleshooting

### Common Issues

1. **"Account ID not found"** → Double-check your account ID from the dashboard
2. **"Access denied"** → Verify your R2 API token has the correct permissions
3. **"Stream API error"** → Ensure your Stream API token includes `Stream:Edit` permissions
4. **"Bucket not found"** → Check bucket name spelling and that it exists in your account

### Support Resources

- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Cloudflare Stream Documentation](https://developers.cloudflare.com/stream/)
- [Cloudflare API Documentation](https://developers.cloudflare.com/api/)

---

## Next Steps

After completing this setup:

1. Run the migration script to transfer your existing content
2. Test video uploads through your application
3. Verify webhook events are being received
4. Configure CDN settings for optimal performance
5. Set up monitoring and analytics

Your xCast platform is now ready for production-scale video hosting with Cloudflare! 🚀