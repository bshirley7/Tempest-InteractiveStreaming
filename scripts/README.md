# Bulk Sync Scripts

This directory contains scripts to automatically sync Cloudflare Stream videos with the Supabase content library.

## Available Scripts

### 1. API-based Sync (Requires Authentication)
```bash
# Run through API (requires dev server + authentication)
npm run sync

# Check sync status only
npm run sync:check
```

### 2. Direct Sync (No Authentication Required)
```bash
# Run direct sync bypassing API
npm run sync:direct
```

### 3. Manual Sync via curl
```bash
# If you have a valid session, you can run:
curl -X POST "http://localhost:3000/api/content-library/sync" \
  -H "Content-Type: application/json" \
  -H "Cookie: your-session-cookie"
```

## Setup Requirements

### For API-based sync:
1. Development server must be running (`npm run dev`)
2. You must be signed in to the admin panel
3. Your user ID must be in the admin list

### For direct sync:
1. Environment variables must be configured in `.env.local`:
   ```env
   CLOUDFLARE_ACCOUNT_ID=your_account_id
   CLOUDFLARE_API_TOKEN=your_api_token
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

## Script Features

- ✅ Colored console output
- ✅ Progress tracking
- ✅ Error handling
- ✅ Detailed sync results
- ✅ Graceful interruption (Ctrl+C)
- ✅ Health checks
- ✅ Timeout handling

## Usage Examples

### Check if sync is needed:
```bash
npm run sync:check
```

### Run full sync:
```bash
npm run sync:direct
```

### Run with custom base URL:
```bash
NEXT_PUBLIC_BASE_URL=https://your-domain.com npm run sync
```

## Automation

You can integrate these scripts into CI/CD pipelines, cron jobs, or GitHub Actions:

```yaml
# .github/workflows/sync-content.yml
name: Sync Content Library
on:
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run sync:direct
        env:
          CLOUDFLARE_ACCOUNT_ID: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

## Troubleshooting

### "Unauthorized" Error
- Make sure you're signed in to the admin panel
- Check that your user ID is in the ADMIN_USER_IDS array
- Use `npm run sync:direct` to bypass authentication

### "Cannot connect to server" Error
- Start the development server: `npm run dev`
- Check that the server is running on the correct port

### "Missing environment variables" Error
- Copy `.env.example` to `.env.local`
- Fill in your Cloudflare and Supabase credentials

### Timeout Errors
- Large video libraries may take time to sync
- The script has a 2-minute timeout per request
- Run the script multiple times if needed