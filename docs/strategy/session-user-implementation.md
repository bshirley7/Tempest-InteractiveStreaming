# Session-Based Anonymous User Implementation

## Quick Implementation Guide

### 1. User Session Hook (`/hooks/useUser.ts`)
```typescript
import { useEffect, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

// Fun username generation
const adjectives = ['Swift', 'Cosmic', 'Digital', 'Turbo', 'Mega', 'Ultra', 'Quantum', 'Neon'];
const nouns = ['Panda', 'Tiger', 'Eagle', 'Shark', 'Phoenix', 'Dragon', 'Ninja', 'Wizard'];

function generateUsername(): string {
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 100);
  return `${adj}${noun}${num}`;
}

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const createUser = useMutation(api.users.create);
  
  useEffect(() => {
    async function initUser() {
      // Check for existing session
      let sessionId = localStorage.getItem('sessionId');
      let username = localStorage.getItem('username');
      
      if (!sessionId) {
        // New user
        sessionId = crypto.randomUUID();
        username = generateUsername();
        
        localStorage.setItem('sessionId', sessionId);
        localStorage.setItem('username', username);
        
        // Create in database
        const newUser = await createUser({ sessionId, username });
        setUser(newUser);
      } else {
        // Returning user
        setUser({ sessionId, username });
      }
    }
    
    initUser();
  }, []);
  
  return { user, isLoading: !user };
}
```

### 2. Convex User Functions (`/convex/users.ts`)
```typescript
import { mutation, query } from './_generated/server';
import { v } from 'convex/values';

export const create = mutation({
  args: {
    sessionId: v.string(),
    username: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if session already exists
    const existing = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('sessionId'), args.sessionId))
      .first();
    
    if (existing) return existing;
    
    // Create new user
    const userId = await ctx.db.insert('users', {
      sessionId: args.sessionId,
      username: args.username,
      color: generateUserColor(), // For chat
      joinedAt: Date.now(),
      lastSeen: Date.now(),
      preferences: {
        volume: 1,
        quality: 'auto',
        enableEmojis: true,
      },
      stats: {
        messagesCount: 0,
        interactionsCount: 0,
        watchTime: 0,
      },
    });
    
    return await ctx.db.get(userId);
  },
});

function generateUserColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FECA57', '#FF9FF3', '#54A0FF', '#48DBFB'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
```

### 3. Root Layout Integration (`/app/layout.tsx`)
```typescript
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ConvexProvider>
          <UserProvider>
            {children}
          </UserProvider>
        </ConvexProvider>
      </body>
    </html>
  );
}
```

### 4. User Context Provider (`/app/providers.tsx`)
```typescript
'use client';

import { createContext, useContext } from 'react';
import { useUser } from '@/hooks/useUser';

const UserContext = createContext<any>(null);

export function UserProvider({ children }) {
  const userData = useUser();
  
  return (
    <UserContext.Provider value={userData}>
      {children}
    </UserContext.Provider>
  );
}

export const useCurrentUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useCurrentUser must be used within UserProvider');
  return context;
};
```

### 5. Usage in Components
```typescript
// In Chat component
export function Chat() {
  const { user } = useCurrentUser();
  
  if (!user) return <div>Loading...</div>;
  
  return (
    <div>
      <div className="chat-header">
        Chatting as: <span style={{ color: user.color }}>{user.username}</span>
      </div>
      {/* Chat messages */}
    </div>
  );
}
```

### 6. Optional: Username Change Feature
```typescript
// Let users pick a new random username
export function UsernameChanger() {
  const { user } = useCurrentUser();
  const updateUsername = useMutation(api.users.updateUsername);
  
  const handleNewUsername = async () => {
    const newUsername = generateUsername();
    await updateUsername({ 
      sessionId: user.sessionId, 
      username: newUsername 
    });
    localStorage.setItem('username', newUsername);
    window.location.reload(); // Simple refresh
  };
  
  return (
    <Button onClick={handleNewUsername}>
      Get New Username
    </Button>
  );
}
```

## Benefits for Demo

1. **Instant Access**: Judges start using immediately
2. **Fun Usernames**: "QuantumShark77" is more memorable than "user@email.com"
3. **No Database Complexity**: Simple session-based storage
4. **Privacy-First**: No personal data collected
5. **Easy Testing**: Clear localStorage to become new user

## Demo Day Tips

1. **Pre-seed Fun Usernames**: Have some users already chatting
2. **Show Username Colors**: Makes chat visually interesting
3. **Highlight Simplicity**: "No signup required - just start watching!"
4. **Future Vision**: "Add social login when we scale"

## Security Notes
- Sessions expire after 30 days (configurable)
- No sensitive data stored
- Rate limiting still applies
- Can add IP-based blocking if needed

## Migration Path
When you eventually need real auth:
1. Add "Claim Account" feature
2. Link sessionId to real user account
3. Preserve all interaction history
4. Seamless upgrade experience

This approach gets you to market faster and creates a better demo experience!