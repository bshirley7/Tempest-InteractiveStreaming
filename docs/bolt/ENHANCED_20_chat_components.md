# ENHANCED Step 20: Create Chat Components (Sonnet-Optimized)

## CRITICAL FOR CLAUDE SONNET
- Real-time subscriptions require EXACT cleanup patterns
- Missing cleanup = memory leaks and errors
- Copy useEffect patterns EXACTLY
- Pay attention to dependency arrays

## Task Instructions

### Task 1: Create Real-time Chat Hook ⏳

**REASONING**: Chat needs real-time Supabase subscriptions with proper cleanup, message fetching with user data, and optimistic updates for good UX.

**File to Create:** `lib/hooks/useChat.ts`

**COMPLETE REFERENCE IMPLEMENTATION** (Copy this EXACTLY):

```typescript
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useUser } from './useUser';

interface ChatMessage {
  id: string;
  message: string;
  user_id: string;
  video_id: string;
  is_command: boolean;
  command_type: string | null;
  is_deleted: boolean;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
    role: 'user' | 'moderator' | 'admin';
  };
}

interface UseChatOptions {
  videoId: string;
  limit?: number;
}

export function useChat({ videoId, limit = 50 }: UseChatOptions) {
  const { user, clerkUser } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  
  // CRITICAL: Use ref to store subscription for cleanup
  const subscriptionRef = useRef<any>(null);
  const supabase = createClient();

  // CRITICAL: Fetch initial messages - EXACT pattern required
  useEffect(() => {
    if (!videoId) return;

    async function fetchMessages() {
      try {
        setLoading(true);
        setError(null);

        // STEP 1: Fetch messages with user data
        const { data, error } = await supabase
          .from('chat_messages')
          .select(`
            *,
            user:users(id, username, avatar_url, role)
          `)
          .eq('video_id', videoId)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;

        // STEP 2: Reverse to show oldest first
        setMessages((data || []).reverse());
      } catch (err) {
        console.error('Error fetching chat messages:', err);
        setError(err instanceof Error ? err.message : 'Failed to load chat messages');
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
  }, [videoId, limit, supabase]);

  // CRITICAL: Real-time subscription - EXACT pattern required
  useEffect(() => {
    if (!videoId) return;

    // STEP 1: Create subscription
    const subscription = supabase
      .channel(`chat_${videoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `video_id=eq.${videoId}`,
        },
        async (payload) => {
          try {
            // STEP 2: Fetch complete message with user data
            const { data, error } = await supabase
              .from('chat_messages')
              .select(`
                *,
                user:users(id, username, avatar_url, role)
              `)
              .eq('id', payload.new.id)
              .single();

            if (!error && data) {
              // STEP 3: Add to messages state
              setMessages(prev => [...prev, data]);
            }
          } catch (err) {
            console.error('Error processing new message:', err);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `video_id=eq.${videoId}`,
        },
        (payload) => {
          // STEP 4: Update existing message
          setMessages(prev =>
            prev.map(msg =>
              msg.id === payload.new.id ? { ...msg, ...payload.new } : msg
            )
          );
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'chat_messages',
          filter: `video_id=eq.${videoId}`,
        },
        (payload) => {
          // STEP 5: Remove deleted message
          setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
        }
      );

    // STEP 6: Subscribe
    subscription.subscribe();
    subscriptionRef.current = subscription;

    // STEP 7: MANDATORY cleanup function
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
    };
  }, [videoId, supabase]);

  // CRITICAL: Send message function with optimistic updates
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!user || !clerkUser || !content.trim()) return false;

    setSending(true);
    try {
      // STEP 1: Check if message is a command
      const isCommand = content.startsWith('!');
      const commandType = isCommand ? content.split(' ')[0].substring(1) : null;

      // STEP 2: Insert message into database
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          video_id: videoId,
          user_id: user.id,
          message: content.trim(),
          is_command: isCommand,
          command_type: commandType,
        });

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      return false;
    } finally {
      setSending(false);
    }
  }, [user, clerkUser, videoId, supabase]);

  // CRITICAL: Delete message function
  const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('user_id', user.id); // Users can only delete their own messages

      if (error) throw error;
      
      // Remove from local state immediately
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      return true;
    } catch (err) {
      console.error('Error deleting message:', err);
      return false;
    }
  }, [user, supabase]);

  return {
    messages,
    loading,
    error,
    sending,
    sendMessage,
    deleteMessage,
    canSendMessages: !!user,
  };
}
```

### Task 2: Create Chat Message Component ⏳

**File to Create:** `components/chat/ChatMessage.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MoreHorizontal, 
  Flag, 
  Trash2, 
  Reply, 
  Heart,
  Crown,
  Shield,
  Bot
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUser } from '@/lib/hooks/useUser';
import { formatRelativeTime } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface ChatMessage {
  id: string;
  message: string;
  user_id: string;
  is_command: boolean;
  command_type: string | null;
  created_at: string;
  user: {
    id: string;
    username: string;
    avatar_url?: string;
    role: 'user' | 'moderator' | 'admin';
  };
}

interface ChatMessageProps {
  message: ChatMessage;
  className?: string;
  variant?: 'default' | 'compact' | 'highlighted';
  showActions?: boolean;
  onReply?: (message: ChatMessage) => void;
  onDelete?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
}

export function ChatMessage({
  message,
  className,
  variant = 'default',
  showActions = true,
  onReply,
  onDelete,
  onReport
}: ChatMessageProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const { user, isAdmin, isModerator } = useUser();

  const isOwnMessage = user?.id === message.user_id;
  const canDelete = isOwnMessage || isAdmin || isModerator;
  const canModerate = isAdmin || isModerator;

  // CRITICAL: Role badge rendering
  const getUserRoleBadge = () => {
    if (!message.user) return null;
    
    switch (message.user.role) {
      case 'admin':
        return (
          <Badge variant="destructive" className="text-xs px-1 py-0 ml-2">
            <Crown className="w-2.5 h-2.5 mr-0.5" />
            Admin
          </Badge>
        );
      case 'moderator':
        return (
          <Badge variant="secondary" className="text-xs px-1 py-0 ml-2">
            <Shield className="w-2.5 h-2.5 mr-0.5" />
            Mod
          </Badge>
        );
      default:
        return null;
    }
  };

  // CRITICAL: Message content parsing for commands
  const renderMessageContent = () => {
    if (message.is_command) {
      return (
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-primary" />
          <span className="text-primary font-medium">{message.message}</span>
        </div>
      );
    }

    // Parse mentions, emojis, etc.
    return <span>{message.message}</span>;
  };

  const handleAction = (action: string) => {
    switch (action) {
      case 'reply':
        onReply?.(message);
        break;
      case 'delete':
        onDelete?.(message.id);
        break;
      case 'report':
        onReport?.(message.id);
        break;
    }
  };

  return (
    <div
      className={cn(
        "group flex items-start space-x-3 py-2 px-3 hover:bg-secondary/50 transition-colors",
        variant === 'compact' && "py-1",
        variant === 'highlighted' && "bg-primary/10 border-l-2 border-primary",
        isOwnMessage && "bg-primary/5",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar */}
      <Avatar className={cn(
        "w-8 h-8 flex-shrink-0",
        variant === 'compact' && "w-6 h-6"
      )}>
        <AvatarImage src={message.user?.avatar_url} />
        <AvatarFallback className="text-xs">
          {message.user?.username?.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center space-x-2 mb-1">
          <span className="font-semibold text-sm truncate">
            {message.user?.username}
          </span>
          
          {getUserRoleBadge()}
          
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(message.created_at)}
          </span>
        </div>

        {/* Message */}
        <div className="text-sm break-words">
          {renderMessageContent()}
        </div>
      </div>

      {/* Actions */}
      {showActions && (isHovered || isOwnMessage) && (
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="w-6 h-6 p-0"
            onClick={() => setIsLiked(!isLiked)}
          >
            <Heart className={cn(
              "w-3 h-3",
              isLiked && "fill-red-500 text-red-500"
            )} />
          </Button>

          {onReply && (
            <Button
              variant="ghost"
              size="sm"
              className="w-6 h-6 p-0"
              onClick={() => handleAction('reply')}
            >
              <Reply className="w-3 h-3" />
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canDelete && (
                <DropdownMenuItem 
                  onClick={() => handleAction('delete')}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
              
              {!isOwnMessage && (
                <DropdownMenuItem onClick={() => handleAction('report')}>
                  <Flag className="w-4 h-4 mr-2" />
                  Report
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
```

### Task 3: Create Chat Input Component ⏳

**File to Create:** `components/chat/ChatInput.tsx`

```typescript
'use client';

import { useState, useRef, useCallback, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Smile,
  Hash,
  Zap
} from 'lucide-react';
import { useUser } from '@/lib/hooks/useUser';
import { cn } from '@/lib/utils/cn';

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<boolean>;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  showCommands?: boolean;
}

// CRITICAL: Chat commands configuration
const CHAT_COMMANDS = [
  { command: '!poll', description: 'Create a poll', example: '!poll What\'s your favorite color?' },
  { command: '!quiz', description: 'Start a quiz', example: '!quiz What is 2+2?' },
  { command: '!react', description: 'Send reaction', example: '!react 😍' },
  { command: '!rate', description: 'Rate content', example: '!rate 5' },
];

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
  className,
  maxLength = 500,
  showCommands = true
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showCommandSuggestions, setShowCommandSuggestions] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, isSignedIn } = useUser();

  // CRITICAL: Rate limiting pattern
  const lastMessageTime = useRef<number>(0);
  const MESSAGE_COOLDOWN = 1000; // 1 second between messages

  // CRITICAL: Command detection
  const isCommand = message.startsWith('!');
  const commandSuggestions = isCommand 
    ? CHAT_COMMANDS.filter(cmd => 
        cmd.command.toLowerCase().includes(message.toLowerCase())
      )
    : [];

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || sending || !isSignedIn) return;

    // STEP 1: Rate limiting check
    const now = Date.now();
    if (now - lastMessageTime.current < MESSAGE_COOLDOWN) {
      setRateLimited(true);
      setTimeout(() => setRateLimited(false), MESSAGE_COOLDOWN);
      return;
    }

    setSending(true);
    
    try {
      // STEP 2: Send message
      const success = await onSendMessage(message);
      
      if (success) {
        // STEP 3: Clear input and update rate limit
        setMessage('');
        lastMessageTime.current = now;
        setShowCommandSuggestions(false);
        
        // Focus back to input
        inputRef.current?.focus();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  }, [message, sending, isSignedIn, onSendMessage]);

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    
    if (e.key === 'Escape') {
      setShowCommandSuggestions(false);
    }
  };

  const handleInputChange = (value: string) => {
    if (value.length <= maxLength) {
      setMessage(value);
      
      // Show command suggestions when typing commands
      if (value.startsWith('!') && showCommands) {
        setShowCommandSuggestions(true);
      } else {
        setShowCommandSuggestions(false);
      }
    }
  };

  const insertCommand = (command: string) => {
    setMessage(command + ' ');
    setShowCommandSuggestions(false);
    inputRef.current?.focus();
  };

  if (!isSignedIn) {
    return (
      <div className={cn(
        "flex items-center justify-center p-4 bg-secondary/50 rounded-lg",
        className
      )}>
        <p className="text-sm text-muted-foreground">
          Sign in to participate in chat
        </p>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      {/* Command Suggestions */}
      {showCommandSuggestions && commandSuggestions.length > 0 && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-background border rounded-lg shadow-lg z-10">
          <div className="p-2">
            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center">
              <Hash className="w-3 h-3 mr-1" />
              Commands
            </div>
            {commandSuggestions.map((cmd) => (
              <button
                key={cmd.command}
                onClick={() => insertCommand(cmd.command)}
                className="w-full text-left p-2 hover:bg-secondary rounded-md transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{cmd.command}</div>
                    <div className="text-xs text-muted-foreground">{cmd.description}</div>
                  </div>
                  <Zap className="w-3 h-3 text-primary" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-center space-x-2 p-2 bg-background border rounded-lg">
        <div className="flex-1 relative">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={disabled || sending}
            className={cn(
              "border-0 focus-visible:ring-0 bg-transparent",
              isCommand && "text-primary font-medium"
            )}
          />
          
          {/* Character Count */}
          {message.length > maxLength * 0.8 && (
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
              <Badge 
                variant={message.length >= maxLength ? "destructive" : "secondary"}
                className="text-xs"
              >
                {message.length}/{maxLength}
              </Badge>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-1">
          {showCommands && (
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setShowCommandSuggestions(!showCommandSuggestions)}
            >
              <Hash className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-8 p-0"
          >
            <Smile className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={handleSendMessage}
            disabled={!message.trim() || sending || disabled || rateLimited}
            size="sm"
            className="w-8 h-8 p-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Rate Limit Warning */}
      {rateLimited && (
        <div className="absolute top-full left-0 right-0 mt-1">
          <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-md p-2">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              Please wait before sending another message
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Task 4: Create Main Chat Component ⏳

**File to Create:** `components/chat/Chat.tsx`

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  Users, 
  Settings,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { useChat } from '@/lib/hooks/useChat';
import { useViewerCount } from '@/lib/hooks/useAnalytics';
import { formatNumber } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface ChatProps {
  videoId: string;
  className?: string;
  variant?: 'sidebar' | 'overlay' | 'fullscreen';
  showHeader?: boolean;
  maxHeight?: string;
  autoScroll?: boolean;
}

export function Chat({
  videoId,
  className,
  variant = 'sidebar',
  showHeader = true,
  maxHeight = '400px',
  autoScroll = true
}: ChatProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // CRITICAL: Chat hook with real-time subscriptions
  const {
    messages,
    loading,
    error,
    sending,
    sendMessage,
    deleteMessage,
    canSendMessages
  } = useChat({ videoId, limit: 100 });

  const { viewerCount } = useViewerCount(videoId);

  // CRITICAL: Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  const handleReply = (message: any) => {
    // Implement reply functionality
    console.log('Reply to message:', message);
  };

  const handleReport = (messageId: string) => {
    // Implement report functionality
    console.log('Report message:', messageId);
  };

  if (loading) {
    return (
      <div className={cn(
        "flex items-center justify-center h-64 bg-background border rounded-lg",
        className
      )}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(
        "flex items-center justify-center h-64 bg-background border rounded-lg",
        className
      )}>
        <div className="text-center text-muted-foreground">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Chat unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col bg-background border rounded-lg overflow-hidden",
      variant === 'sidebar' && "h-full",
      variant === 'overlay' && "shadow-lg",
      variant === 'fullscreen' && "h-screen",
      className
    )}>
      {/* Header */}
      {showHeader && (
        <div className="flex items-center justify-between p-3 border-b bg-secondary/30">
          <div className="flex items-center space-x-3">
            <MessageCircle className="w-5 h-5 text-primary" />
            <div>
              <h3 className="font-semibold text-sm">Live Chat</h3>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Users className="w-3 h-3" />
                <span>{formatNumber(viewerCount)} viewers</span>
                <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse" />
                <span>LIVE</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4" />
            </Button>
            
            {variant !== 'fullscreen' && (
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? 
                  <Maximize2 className="w-4 h-4" /> : 
                  <Minimize2 className="w-4 h-4" />
                }
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Messages Area */}
      {!isMinimized && (
        <>
          <ScrollArea 
            ref={scrollAreaRef}
            className="flex-1"
            style={{ maxHeight: variant === 'sidebar' ? 'calc(100% - 120px)' : maxHeight }}
          >
            <div className="p-2 space-y-1">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p className="text-sm">No messages yet</p>
                  <p className="text-xs">Be the first to start the conversation!</p>
                </div>
              ) : (
                messages.map((message, index) => (
                  <ChatMessage
                    key={message.id}
                    message={message}
                    variant={variant === 'sidebar' ? 'compact' : 'default'}
                    onReply={handleReply}
                    onDelete={deleteMessage}
                    onReport={handleReport}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-3 border-t">
            <ChatInput
              onSendMessage={sendMessage}
              disabled={!canSendMessages || sending}
              placeholder={canSendMessages ? "Type a message..." : "Sign in to chat"}
              showCommands={true}
            />
          </div>
        </>
      )}

      {/* Minimized State */}
      {isMinimized && (
        <div className="p-3 text-center">
          <Badge variant="secondary" className="text-xs">
            Chat minimized • {messages.length} messages
          </Badge>
        </div>
      )}
    </div>
  );
}
```

**⚠️ CRITICAL SONNET WARNINGS:**

1. **DO NOT remove the subscription cleanup** in useChat hook - causes memory leaks
2. **DO NOT modify the dependency arrays** in useEffect hooks
3. **DO NOT remove the messagesEndRef scroll behavior** - breaks auto-scroll
4. **DO NOT change the Supabase query structure** - breaks user data fetching

**Verification Steps:**
- All files created at exact paths
- Real-time chat messages appear without refresh
- User can send messages successfully
- Commands (!poll, !react, etc.) are detected
- Cleanup functions prevent memory leaks