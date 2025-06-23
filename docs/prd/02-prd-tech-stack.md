# PRD 2: Technical Architecture & Stack

## Core Technology Stack

### Frontend Framework
- **Next.js 15+** (App Router)
  - Server-side rendering for SEO
  - Built-in API routes
  - Image optimization
  - TypeScript support
  - Bolt.new compatibility

### UI Component Library
- **Shadcn/ui**
  - Components needed: Card, Button, Dialog, Progress, Badge, Sheet, Toast, ScrollArea, Tabs, Avatar, Input
  - Consistent design system
  - Fully customizable
  - TypeScript support
  - Accessibility built-in

### Styling
- **Tailwind CSS 3.x**
  - Utility-first approach
  - Responsive design utilities
  - Dark mode support
  - Performance optimized
  - Custom animations

### Real-time Backend
- **Convex**
  - WebSocket connections handled automatically
  - Real-time subscriptions
  - Built-in authentication
  - Serverless scaling
  - TypeScript schema validation
  - Free tier supports POC

### Video Infrastructure
- **Video.js 8.x**
  - Customizable HTML5 player
  - Plugin ecosystem
  - Timeline marker support
  - Mobile optimized
  - No third-party branding
  - HLS/DASH support ready

### Animation Library
- **Framer Motion**
  - Emoji reaction animations
  - Overlay transitions
  - Smooth interactions
  - Performance optimized
  - Gesture support

### Data Visualization
- **Recharts**
  - Analytics dashboard
  - Real-time chart updates
  - Responsive design
  - TypeScript support

### Icons
- **Lucide React**
  - Consistent icon set
  - Tree-shakeable
  - TypeScript support
  - 1000+ icons available

### Development Tools
- **TypeScript**
  - Type safety
  - Better IDE support
  - Self-documenting code
  - Error prevention

- **Claude Code**
  - Agentic development assistance
  - Complex feature implementation
  - Rapid prototyping

## Architecture Patterns

### State Management
- **React Context API** for global state
- **Convex subscriptions** for real-time data
- **Local component state** for UI interactions

### Data Flow
1. User interactions → Convex mutations
2. Convex subscriptions → Real-time updates
3. Component re-renders → UI updates
4. Analytics collection → Convex database

### API Design
- RESTful endpoints for static data
- WebSocket connections for real-time features
- Convex functions for database operations
- Server-side rendering for initial load

### Security Considerations
- Session-based authentication
- CORS configuration
- Input sanitization
- Rate limiting on interactions
- Secure WebSocket connections

## Scalability Architecture

### Performance Targets
- 5,000 concurrent users base allocation
- <500ms latency for interactions
- 60fps animation performance
- <3s initial page load

### Optimization Strategies
- Debounced user interactions
- Batched database writes
- Lazy loading for components
- CDN for static assets
- Video chunk loading

### Database Schema Design
```
Users Collection
- Lightweight session-based users
- No personal data storage
- Interaction history reference

Content Collection
- Video metadata
- Interactive element definitions
- Schedule information
- Channel assignment

Interactions Collection
- User reference
- Content reference
- Timestamp indexing
- Type categorization
- Payload flexibility

Analytics Collection
- Aggregated metrics
- Time-series data
- Advertiser insights
- Engagement tracking
```

## Third-party Service Integration

### Video Hosting
- Direct MP4 hosting (POC)
- Future: CDN integration
- Optimized encoding (720p, H.264)
- Progressive download support

### Future Integrations
- Payment processing (Stripe)
- Email notifications (SendGrid)
- Advanced analytics (Mixpanel)
- AD platform integration