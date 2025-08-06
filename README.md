# Tempest - Interactive Streaming Platform

A next-generation streaming platform built with Next.js 14, featuring AI-generated content, real-time interactions, and comprehensive content management capabilities.

## 🚀 Features

### Core Streaming Features
- **Video On Demand (VOD)** - Browse and watch content with adaptive streaming
- **Live Streaming** - Real-time content delivery with interactive features
- **AI-Generated Content** - Automated video and advertisement generation
- **Multi-Company Support** - Showcase content from multiple fictional brands

### Interactive Features
- **Real-time Chat** - Live chat during video playback
- **Interactive Overlays** - Polls, quizzes, and emoji reactions
- **Pause Screen Ads** - Dynamic advertisements when content is paused
- **Global Announcements** - System-wide messaging overlays

### Admin Features
- **Content Management** - Upload, organize, and manage video content
- **Advertising Dashboard** - Manage image and video advertisements
- **Interaction Templates** - Create reusable interaction patterns
- **Moderation System** - User and content moderation tools
- **Analytics Dashboard** - View engagement and performance metrics

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, Radix UI, shadcn/ui
- **Video**: Cloudflare Stream API
- **Database**: Supabase (PostgreSQL)
- **Storage**: Cloudflare R2
- **Authentication**: Clerk
- **Animations**: Framer Motion
- **State Management**: React Hooks, Context API

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Cloudflare account (for Stream and R2)
- Clerk account for authentication

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
   NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

   # Cloudflare
   CLOUDFLARE_ACCOUNT_ID=your_account_id
   CLOUDFLARE_API_TOKEN=your_api_token
   NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_SUBDOMAIN=your_subdomain

   # R2 Storage
   R2_ACCOUNT_ID=your_r2_account_id
   R2_ACCESS_KEY_ID=your_r2_access_key
   R2_SECRET_ACCESS_KEY=your_r2_secret_key
   R2_BUCKET_NAME=your_bucket_name
   ```

4. **Set up the database**
   
   Run the migrations in your Supabase project:
   - Check the `scripts/` directory for SQL migration files
   - Apply them in your Supabase SQL editor

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 📁 Project Structure

```
project/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   ├── admin/             # Admin dashboard pages
│   ├── vod/               # Video on demand pages
│   ├── live/              # Live streaming pages
│   └── [company]/         # Company showcase pages
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── ui/               # Reusable UI components
│   ├── video/            # Video player components
│   └── layout/           # Layout components
├── lib/                   # Utility functions and configurations
├── hooks/                 # Custom React hooks
├── types/                # TypeScript type definitions
├── public/               # Static assets
└── docs/                 # Documentation and references
```

## 🎯 Key Features Explained

### Company Showcases
The platform features parody companies with their own branded pages:
- **HungryHawk** - Food delivery service (DoorDash parody)
- **Liquid Thunder** - Energy drink (Liquid Death parody)
- **Outwest Steakhouse** - Restaurant chain (Outback Steakhouse parody)
- And more...

### Interactive Video System
- **Floating Emojis**: Real-time emoji reactions during playback
- **Polls & Quizzes**: Interactive overlays with timed appearances
- **Chat Integration**: Live chat synchronized with video timestamps

### Content Management
- Upload videos directly to Cloudflare Stream
- Automatic thumbnail generation
- Category and tag-based organization
- AI-powered content generation integration

## 🧪 Development

### Running Tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run type-check
```

## 🚀 Deployment

The application is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Configure environment variables
4. Deploy

## 📝 API Routes

Key API endpoints:

- `/api/content` - Content management
- `/api/upload` - File upload handling
- `/api/interactions` - Interactive features
- `/api/moderation` - Content moderation
- `/api/admin` - Admin operations

## 🔒 Security

- Authentication via Clerk
- Row Level Security (RLS) in Supabase
- API rate limiting
- Input validation and sanitization
- Secure file upload with type checking

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with Next.js and React
- UI components from shadcn/ui
- Video infrastructure by Cloudflare
- Database by Supabase
- Authentication by Clerk
