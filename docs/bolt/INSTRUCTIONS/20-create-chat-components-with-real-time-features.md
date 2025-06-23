# Step 20: Create Chat Components with Real-time Features

## Context
You are building Tempest, an interactive streaming platform. This step creates the real-time chat system components with live messaging, command processing, emoji reactions, and moderation features using precise Tailwind CSS classes and Supabase real-time subscriptions.

## Purpose
The chat system enables real-time communication during live streams and VOD content, supporting interactive commands, emoji reactions, user moderation, and seamless integration with the video player. Components must handle high message volumes efficiently.

## Prerequisites
- Step 19 completed successfully
- Video player components created
- Real-time chat hook (useChat) implemented
- Supabase real-time subscriptions configured
- User authentication system working

## Task Instructions
Complete each task in order and mark as ✅ when finished:

### Task 1: Create Chat Message Component ⏳
Create individual chat message component with user info, timestamps, and interaction features.

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
  Bot,
  Zap
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
import type { ChatMessage } from '@/lib/types';

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

  // Get user role badge
  const getUserRoleBadge = () => {
    if (!message.user) return null;
    
    switch (message.user.role) {
      case 'admin':
        return (
          <Badge variant="destructive" className="text-xs px-1 py-0">
            <Crown className="w-2.5 h-2.5 mr-0.5" />
            Admin
          </Badge>
        );
      case 'moderator':
        return (
          <Badge variant="secondary" className="text-xs px-1 py-0">
            <Shield className="w-2.5 h-2.5 mr-0.5" />
            Mod
          </Badge>
        );
      default:
        return null;
    }
  };

  // Parse message for commands and emojis
  const parseMessage = (text: string) => {
    if (message.is_command) {
      return (
        <span className="flex items-center space-x-1 font-medium text-blue-600 dark:text-blue-400">
          <Zap className="w-3 h-3" />
          <span>{text}</span>
        </span>
      );
    }

    // Simple emoji parsing (in real app, use proper emoji library)
    const emojiRegex = /(\p{Emoji_Presentation}|\p{Emoji}\uFE0F)/gu;
    const parts = text.split(emojiRegex);
    
    return (
      <span className="break-words">
        {parts.map((part, index) => {
          if (emojiRegex.test(part)) {
            return (
              <span key={index} className="text-lg leading-none mx-0.5">
                {part}
              </span>
            );
          }
          return part;
        })}
      </span>
    );
  };

  const messageClasses = {
    default: 'chat-message p-3 hover:bg-muted/50',
    compact: 'p-2 hover:bg-muted/30 text-sm',
    highlighted: 'p-3 bg-primary/10 border-l-2 border-primary hover:bg-primary/20'
  };

  return (
    <div
      className={cn(
        'transition-colors duration-150 cursor-pointer group',
        messageClasses[variant],
        message.is_highlighted && 'bg-yellow-50 dark:bg-yellow-950/20',
        message.is_command && 'bg-blue-50 dark:bg-blue-950/20',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start space-x-3">
        {/* User Avatar */}
        <Avatar className={cn(
          variant === 'compact' ? 'w-6 h-6' : 'w-8 h-8',
          'flex-shrink-0'
        )}>
          <AvatarImage src={message.user?.avatar_url} />
          <AvatarFallback className="text-xs font-medium bg-gradient-to-br from-primary to-primary/70 text-white">
            {message.user?.username?.substring(0, 2).toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* User Info and Timestamp */}
          <div className="flex items-center space-x-2 mb-1">
            <span className={cn(
              'font-medium text-foreground truncate',
              variant === 'compact' ? 'text-xs' : 'text-sm'
            )}>
              {message.user?.username || 'Anonymous'}
            </span>
            
            {getUserRoleBadge()}
            
            <span className={cn(
              'text-muted-foreground flex-shrink-0',
              variant === 'compact' ? 'text-xs' : 'text-xs'
            )}>
              {formatRelativeTime(message.created_at)}
            </span>
          </div>

          {/* Message Text */}
          <div className={cn(
            'text-foreground leading-relaxed',
            variant === 'compact' ? 'text-xs' : 'text-sm'
          )}>
            {parseMessage(message.message)}
          </div>

          {/* Message Actions */}
          {showActions && (isHovered || isLiked) && (
            <div className="flex items-center space-x-1 mt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLiked(!isLiked)}
                className={cn(
                  'h-6 px-2 text-xs',
                  isLiked && 'text-red-500 bg-red-50 dark:bg-red-950/20'
                )}
              >
                <Heart className={cn('w-3 h-3 mr-1', isLiked && 'fill-current')} />
                {isLiked ? '1' : ''}
              </Button>

              {onReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReply(message)}
                  className="h-6 px-2 text-xs"
                >
                  <Reply className="w-3 h-3 mr-1" />
                  Reply
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Message Options */}
        {showActions && isHovered && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreHorizontal className="w-3 h-3" />
                <span className="sr-only">Message options</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32">
              {onReply && (
                <DropdownMenuItem onClick={() => onReply(message)}>
                  <Reply className="w-3 h-3 mr-2" />
                  Reply
                </DropdownMenuItem>
              )}
              
              {!isOwnMessage && (
                <DropdownMenuItem onClick={() => onReport?.(message.id)}>
                  <Flag className="w-3 h-3 mr-2" />
                  Report
                </DropdownMenuItem>
              )}
              
              {canDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(message.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="w-3 h-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}

// System message component for notifications
interface SystemMessageProps {
  message: string;
  type?: 'info' | 'warning' | 'error' | 'success';
  className?: string;
}

export function SystemMessage({ 
  message, 
  type = 'info',
  className 
}: SystemMessageProps) {
  const typeClasses = {
    info: 'bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    warning: 'bg-yellow-50 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
    error: 'bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    success: 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800'
  };

  const typeIcons = {
    info: <Bot className="w-3 h-3" />,
    warning: <Shield className="w-3 h-3" />,
    error: <Flag className="w-3 h-3" />,
    success: <Zap className="w-3 h-3" />
  };

  return (
    <div className={cn(
      'mx-3 my-2 p-2 rounded-lg border text-xs flex items-center space-x-2',
      typeClasses[type],
      className
    )}>
      {typeIcons[type]}
      <span>{message}</span>
    </div>
  );
}

// Typing indicator component
interface TypingIndicatorProps {
  users: string[];
  className?: string;
}

export function TypingIndicator({ users, className }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  return (
    <div className={cn('p-3 text-xs text-muted-foreground flex items-center space-x-2', className)}>
      <div className="flex space-x-1">
        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></div>
        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span>
        {users.length === 1 
          ? `${users[0]} is typing...`
          : users.length === 2
            ? `${users[0]} and ${users[1]} are typing...`
            : `${users[0]} and ${users.length - 1} others are typing...`
        }
      </span>
    </div>
  );
}
```

**Verification:** 
- ChatMessage component created with comprehensive features
- User role badges with proper Tailwind color classes
- Message parsing for commands and emojis
- shadcn/ui DropdownMenu for message actions
- Hover states and interactive elements with transitions

### Task 2: Create Chat Input Component ⏳
Create the chat input field with command suggestions, emoji picker, and send functionality.

**File to Create:** `components/chat/ChatInput.tsx`

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { 
  Send, 
  Smile, 
  Hash, 
  Zap,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useUser } from '@/lib/hooks/useUser';
import { cn } from '@/lib/utils/cn';

interface ChatInputProps {
  onSendMessage: (message: string) => Promise<boolean>;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  maxLength?: number;
  cooldownMs?: number;
}

export function ChatInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type a message...",
  className,
  maxLength = 500,
  cooldownMs = 1000
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setSending] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(0);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCommands, setShowCommands] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user, isSignedIn } = useUser();

  // Available chat commands
  const commands = [
    { 
      command: '!poll', 
      description: 'Start a poll', 
      usage: '!poll [question] [option1] [option2]',
      icon: Hash 
    },
    { 
      command: '!quiz', 
      description: 'Start a quiz', 
      usage: '!quiz [question] [answer]',
      icon: Hash 
    },
    { 
      command: '!react', 
      description: 'Send a reaction', 
      usage: '!react [emoji]',
      icon: Smile 
    },
    { 
      command: '!rate', 
      description: 'Rate the content', 
      usage: '!rate [1-5]',
      icon: Hash 
    }
  ];

  // Popular emojis
  const popularEmojis = [
    '😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥',
    '💯', '🎉', '👏', '😮', '😢', '😡', '🤯', '🚀',
    '⭐', '💎', '🌟', '✨', '🎯', '📚', '💡', '🧠'
  ];

  // Handle cooldown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (cooldownActive && cooldownTime > 0) {
      interval = setInterval(() => {
        setCooldownTime(prev => {
          if (prev <= 1) {
            setCooldownActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [cooldownActive, cooldownTime]);

  // Handle input change
  const handleInputChange = (value: string) => {
    setMessage(value);
    
    // Show command suggestions when user types '!'
    if (value.startsWith('!') && value.length > 1) {
      setShowCommands(true);
    } else {
      setShowCommands(false);
    }
  };

  // Handle send message
  const handleSend = async () => {
    if (!message.trim() || isLoading || cooldownActive || !isSignedIn) return;

    setSending(true);
    try {
      const success = await onSendMessage(message.trim());
      if (success) {
        setMessage('');
        // Start cooldown
        if (cooldownMs > 0) {
          setCooldownActive(true);
          setCooldownTime(Math.ceil(cooldownMs / 1000));
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Insert emoji
  const insertEmoji = (emoji: string) => {
    const input = inputRef.current;
    if (!input) return;

    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    const newMessage = message.slice(0, start) + emoji + message.slice(end);
    
    if (newMessage.length <= maxLength) {
      setMessage(newMessage);
      // Set cursor position after emoji
      setTimeout(() => {
        input.setSelectionRange(start + emoji.length, start + emoji.length);
        input.focus();
      }, 0);
    }
    setShowEmojiPicker(false);
  };

  // Insert command
  const insertCommand = (command: string) => {
    setMessage(command + ' ');
    setShowCommands(false);
    inputRef.current?.focus();
  };

  const isMessageValid = message.trim().length > 0 && message.length <= maxLength;
  const charactersLeft = maxLength - message.length;
  const isNearLimit = charactersLeft < 50;

  if (!isSignedIn) {
    return (
      <div className={cn('p-4 bg-muted/50 text-center', className)}>
        <div className="flex items-center justify-center space-x-2 text-muted-foreground">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Sign in to join the conversation</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('p-4 bg-background border-t border-border', className)}>
      {/* Command Suggestions */}
      {showCommands && (
        <div className="mb-2">
          <Command className="bg-popover border border-border rounded-lg shadow-lg">
            <CommandList className="max-h-32">
              <CommandGroup heading="Available Commands">
                {commands
                  .filter(cmd => cmd.command.toLowerCase().includes(message.toLowerCase()))
                  .map((cmd) => {
                    const Icon = cmd.icon;
                    return (
                      <CommandItem
                        key={cmd.command}
                        onSelect={() => insertCommand(cmd.command)}
                        className="cursor-pointer"
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        <div className="flex-1">
                          <div className="font-medium">{cmd.command}</div>
                          <div className="text-xs text-muted-foreground">{cmd.description}</div>
                        </div>
                      </CommandItem>
                    );
                  })}
              </CommandGroup>
            </CommandList>
          </Command>
        </div>
      )}

      <div className="flex items-end space-x-2">
        {/* User Avatar */}
        <div className="flex-shrink-0 mb-1">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-white text-xs font-medium">
            {user?.username?.substring(0, 2).toUpperCase() || 'U'}
          </div>
        </div>

        {/* Input Area */}
        <div className="flex-1 relative">
          {/* Character Count */}
          {isNearLimit && (
            <div className="absolute -top-6 right-0 text-xs text-muted-foreground">
              <span className={cn(charactersLeft < 20 && 'text-destructive')}>
                {charactersLeft} left
              </span>
            </div>
          )}

          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={message}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={disabled || isLoading || cooldownActive}
                maxLength={maxLength}
                className={cn(
                  'pr-10 resize-none',
                  message.startsWith('!') && 'border-blue-300 dark:border-blue-600'
                )}
              />
              
              {/* Emoji Picker Trigger */}
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 p-0"
                    disabled={disabled || isLoading || cooldownActive}
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-2" align="end">
                  <div className="grid grid-cols-8 gap-1">
                    {popularEmojis.map((emoji) => (
                      <Button
                        key={emoji}
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 p-0 text-lg hover:bg-muted"
                        onClick={() => insertEmoji(emoji)}
                      >
                        {emoji}
                      </Button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!isMessageValid || isLoading || cooldownActive}
              size="sm"
              className={cn(
                'px-3 transition-all duration-200',
                isMessageValid && !cooldownActive && 'bg-primary hover:bg-primary/90'
              )}
            >
              {cooldownActive ? (
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs">{cooldownTime}s</span>
                </div>
              ) : isLoading ? (
                <div className="loading-spinner w-4 h-4 border border-white/20 border-t-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Command Info */}
      {message.startsWith('!') && !showCommands && (
        <div className="mt-2 text-xs text-muted-foreground flex items-center space-x-1">
          <Zap className="w-3 h-3" />
          <span>Type a command like !poll, !quiz, or !react</span>
        </div>
      )}

      {/* Rate Limit Info */}
      {cooldownActive && (
        <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>Please wait {cooldownTime} second(s) before sending another message</span>
        </div>
      )}
    </div>
  );
}
```

**Verification:** 
- ChatInput component created with comprehensive features
- Command suggestions with shadcn/ui Command component
- Emoji picker with Popover integration
- Rate limiting with visual countdown
- Character count with visual warnings
- Proper Tailwind classes for responsive design

### Task 3: Create Main Chat Component ⏳
Create the main chat container that combines messages, input, and manages real-time updates.

**File to Create:** `components/chat/Chat.tsx`

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Settings, 
  Filter, 
  Pin,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { ChatMessage, SystemMessage, TypingIndicator } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatMessageSkeleton } from '@/components/ui/loading';
import { ErrorDisplay } from '@/components/ErrorBoundary';
import { useChat } from '@/lib/hooks/useChat';
import { useUser } from '@/lib/hooks/useUser';
import { useNotification } from '@/components/ui/toast-system';
import { cn } from '@/lib/utils/cn';
import type { ChatMessage as ChatMessageType } from '@/lib/types';

interface ChatProps {
  videoId: string;
  className?: string;
  variant?: 'sidebar' | 'modal' | 'fullscreen';
  showHeader?: boolean;
  autoScroll?: boolean;
  maxHeight?: string;
}

export function Chat({
  videoId,
  className,
  variant = 'sidebar',
  showHeader = true,
  autoScroll = true,
  maxHeight = 'h-96'
}: ChatProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessageType | null>(null);
  const [filter, setFilter] = useState<'all' | 'commands' | 'mentions'>('all');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user, isSignedIn } = useUser();
  const { 
    messages, 
    loading, 
    error, 
    sending, 
    sendMessage, 
    deleteMessage,
    canSendMessages 
  } = useChat({ videoId });
  
  const { showChatError, showSuccess } = useNotification();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, autoScroll]);

  // Handle sending messages
  const handleSendMessage = async (message: string): Promise<boolean> => {
    try {
      const success = await sendMessage(message);
      if (success) {
        setReplyingTo(null);
        return true;
      } else {
        showChatError('Failed to send message. Please try again.');
        return false;
      }
    } catch (error) {
      showChatError(error instanceof Error ? error.message : 'Unknown error occurred');
      return false;
    }
  };

  // Handle message actions
  const handleReply = (message: ChatMessageType) => {
    setReplyingTo(message);
  };

  const handleDelete = async (messageId: string) => {
    const success = await deleteMessage(messageId);
    if (success) {
      showSuccess('Message deleted successfully');
    } else {
      showChatError('Failed to delete message');
    }
  };

  const handleReport = (messageId: string) => {
    // TODO: Implement message reporting
    showSuccess('Message reported to moderators');
  };

  // Filter messages
  const filteredMessages = messages.filter((message) => {
    switch (filter) {
      case 'commands':
        return message.is_command;
      case 'mentions':
        return user && message.message.includes(`@${user.username}`);
      default:
        return true;
    }
  });

  // Get viewer count (mock for now)
  const viewerCount = 1234;

  const variantClasses = {
    sidebar: 'flex flex-col h-full',
    modal: 'flex flex-col',
    fullscreen: 'flex flex-col h-screen'
  };

  const headerHeight = showHeader ? 'h-16' : 'h-0';
  const inputHeight = 'h-20';

  if (error) {
    return (
      <div className={cn('flex items-center justify-center p-4', className)}>
        <ErrorDisplay 
          error={error}
          retry={() => window.location.reload()}
          variant="minimal"
        />
      </div>
    );
  }

  return (
    <div className={cn(variantClasses[variant], className)}>
      {/* Chat Header */}
      {showHeader && (
        <div className={cn('flex items-center justify-between p-4 border-b border-border', headerHeight)}>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-muted-foreground" />
            <span className="font-semibold">Live Chat</span>
            <Badge variant="secondary" className="text-xs">
              {viewerCount.toLocaleString()}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-1">
            {/* Sound Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className="p-1"
            >
              {isSoundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>

            {/* Filter Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="p-1"
            >
              <Filter className="w-4 h-4" />
            </Button>

            {/* Expand Toggle (for modal/sidebar) */}
            {variant !== 'fullscreen' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1"
              >
                {isExpanded ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className={cn(
        'flex-1 min-h-0 relative',
        variant === 'fullscreen' ? 'h-full' : maxHeight
      )}>
        <ScrollArea 
          ref={scrollAreaRef}
          className="h-full p-0"
        >
          {loading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <ChatMessageSkeleton key={i} />
              ))}
            </div>
          ) : filteredMessages.length > 0 ? (
            <div className="space-y-0">
              {/* Welcome Message */}
              <SystemMessage 
                message="Welcome to the live chat! Be respectful and follow community guidelines."
                type="info"
              />
              
              {filteredMessages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  variant={variant === 'modal' ? 'compact' : 'default'}
                  onReply={handleReply}
                  onDelete={handleDelete}
                  onReport={handleReport}
                />
              ))}
              
              {/* Typing Indicator */}
              <TypingIndicator users={[]} />
              
              {/* Scroll anchor */}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center p-8">
              <div className="space-y-2">
                <Users className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium">No messages yet</p>
                <p className="text-xs text-muted-foreground">
                  Be the first to start the conversation!
                </p>
              </div>
            </div>
          )}
        </ScrollArea>

        {/* Scroll to Bottom Button */}
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-4 right-4 opacity-80 hover:opacity-100 transition-opacity shadow-lg"
          onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="text-xs">Latest</span>
        </Button>
      </div>

      {/* Reply Banner */}
      {replyingTo && (
        <div className="px-4 py-2 bg-muted/50 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <Pin className="w-3 h-3 text-muted-foreground" />
              <span className="text-muted-foreground">Replying to</span>
              <span className="font-medium">{replyingTo.user?.username}</span>
              <span className="text-muted-foreground truncate max-w-32">
                {replyingTo.message}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setReplyingTo(null)}
              className="p-1"
            >
              ×
            </Button>
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className={inputHeight}>
        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={!canSendMessages || sending}
          placeholder={replyingTo ? `Reply to ${replyingTo.user?.username}...` : "Type a message..."}
          cooldownMs={1000}
        />
      </div>
    </div>
  );
}

// Specialized chat components for different contexts
export function SidebarChat({ videoId, className }: { videoId: string; className?: string }) {
  return (
    <Chat
      videoId={videoId}
      variant="sidebar"
      className={className}
      showHeader={true}
      maxHeight="h-full"
    />
  );
}

export function ModalChat({ videoId, className }: { videoId: string; className?: string }) {
  return (
    <Chat
      videoId={videoId}
      variant="modal"
      className={className}
      showHeader={false}
      maxHeight="h-96"
    />
  );
}

export function FullscreenChat({ videoId, className }: { videoId: string; className?: string }) {
  return (
    <Chat
      videoId={videoId}
      variant="fullscreen"
      className={className}
      showHeader={true}
      maxHeight="h-full"
    />
  );
}
```

**Verification:** 
- Chat component created with multiple variants
- Real-time message updates with useChat hook
- shadcn/ui ScrollArea for smooth scrolling
- Message filtering and moderation features
- Proper error handling and loading states
- Responsive design with Tailwind classes

### Task 4: Create Chat Commands Processor ⏳
Create a component to handle and execute chat commands for interactive features.

**File to Create:** `components/chat/ChatCommands.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Hash, 
  Users, 
  Star, 
  Heart,
  Trophy,
  Zap,
  Timer,
  CheckCircle
} from 'lucide-react';
import { useInteractions } from '@/lib/hooks/useInteractions';
import { useUser } from '@/lib/hooks/useUser';
import { cn } from '@/lib/utils/cn';

interface ChatCommandsProps {
  videoId: string;
  className?: string;
}

// Poll component triggered by !poll command
interface PollData {
  id: string;
  question: string;
  options: Array<{ id: string; text: string; votes: number }>;
  totalVotes: number;
  timeLeft: number;
  userVote?: string;
}

function ActivePoll({ poll, onVote }: { poll: PollData; onVote: (optionId: string) => void }) {
  const [timeLeft, setTimeLeft] = useState(poll.timeLeft);
  
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center space-x-2">
            <Hash className="w-4 h-4 text-blue-600" />
            <span>Live Poll</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              {poll.totalVotes} votes
            </Badge>
            {timeLeft > 0 && (
              <Badge variant="outline" className="text-xs">
                <Timer className="w-3 h-3 mr-1" />
                {formatTime(timeLeft)}
              </Badge>
            )}
          </div>
        </div>
        <CardDescription className="text-sm font-medium text-foreground">
          {poll.question}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {poll.options.map((option) => {
          const percentage = poll.totalVotes > 0 
            ? Math.round((option.votes / poll.totalVotes) * 100) 
            : 0;
          const isUserVote = poll.userVote === option.id;
          
          return (
            <div key={option.id} className="space-y-2">
              <Button
                variant={isUserVote ? "default" : "outline"}
                size="sm"
                onClick={() => onVote(option.id)}
                disabled={timeLeft === 0 || !!poll.userVote}
                className={cn(
                  'w-full justify-start text-left h-auto p-3',
                  isUserVote && 'bg-blue-600 hover:bg-blue-700'
                )}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="flex-1">{option.text}</span>
                  <div className="flex items-center space-x-2">
                    {isUserVote && <CheckCircle className="w-4 h-4" />}
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                </div>
              </Button>
              
              <Progress 
                value={percentage} 
                className="h-1"
                indicatorClassName={isUserVote ? "bg-blue-600" : "bg-muted-foreground"}
              />
            </div>
          );
        })}
        
        {timeLeft === 0 && (
          <div className="text-center text-sm text-muted-foreground pt-2 border-t border-border">
            Poll has ended
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Reaction display component
interface ReactionDisplayProps {
  reactions: Record<string, number>;
  onReact: (emoji: string) => void;
  className?: string;
}

function ReactionDisplay({ reactions, onReact, className }: ReactionDisplayProps) {
  const sortedReactions = Object.entries(reactions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6); // Show top 6 reactions

  if (sortedReactions.length === 0) return null;

  return (
    <Card className={cn('border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20', className)}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium flex items-center space-x-1">
            <Heart className="w-4 h-4 text-purple-600" />
            <span>Live Reactions</span>
          </h4>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {sortedReactions.map(([emoji, count]) => (
            <Button
              key={emoji}
              variant="outline"
              size="sm"
              onClick={() => onReact(emoji)}
              className="h-8 px-2 py-1 text-sm hover:bg-purple-100 dark:hover:bg-purple-900/30"
            >
              <span className="mr-1">{emoji}</span>
              <span className="text-xs font-medium">{count}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Rating display component
interface RatingDisplayProps {
  averageRating: number;
  totalRatings: number;
  onRate: (rating: number) => void;
  userRating?: number;
  className?: string;
}

function RatingDisplay({ 
  averageRating, 
  totalRatings, 
  onRate, 
  userRating,
  className 
}: RatingDisplayProps) {
  return (
    <Card className={cn('border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20', className)}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-600" />
            <span>Rate this content</span>
          </h4>
          <div className="text-right">
            <div className="text-lg font-bold text-yellow-700 dark:text-yellow-300">
              {averageRating.toFixed(1)}
            </div>
            <div className="text-xs text-muted-foreground">
              {totalRatings} ratings
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((rating) => (
            <Button
              key={rating}
              variant="ghost"
              size="sm"
              onClick={() => onRate(rating)}
              className={cn(
                'w-8 h-8 p-0 hover:bg-yellow-100 dark:hover:bg-yellow-900/30',
                userRating === rating && 'bg-yellow-200 dark:bg-yellow-900/50'
              )}
            >
              <Star 
                className={cn(
                  'w-4 h-4',
                  rating <= (userRating || 0) 
                    ? 'text-yellow-500 fill-current' 
                    : 'text-muted-foreground'
                )}
              />
            </Button>
          ))}
        </div>
        
        {userRating && (
          <div className="text-xs text-muted-foreground mt-2 text-center">
            You rated this {userRating} star{userRating !== 1 ? 's' : ''}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Main chat commands component
export function ChatCommands({ videoId, className }: ChatCommandsProps) {
  const [activePoll, setActivePoll] = useState<PollData | null>(null);
  const [showReactions, setShowReactions] = useState(true);
  const [showRating, setShowRating] = useState(true);
  
  const { user } = useUser();
  const { 
    addReaction, 
    addRating, 
    getReactionCounts, 
    getAverageRating,
    getInteractionsByType 
  } = useInteractions({ videoId });

  // Mock poll data (in real app, this would come from real-time subscriptions)
  useEffect(() => {
    // Simulate active poll
    const mockPoll: PollData = {
      id: 'poll-1',
      question: 'What would you like to learn next?',
      options: [
        { id: 'opt-1', text: 'Advanced React Hooks', votes: 45 },
        { id: 'opt-2', text: 'State Management', votes: 32 },
        { id: 'opt-3', text: 'Testing Strategies', votes: 28 },
        { id: 'opt-4', text: 'Performance Optimization', votes: 15 }
      ],
      totalVotes: 120,
      timeLeft: 180 // 3 minutes
    };
    
    setActivePoll(mockPoll);
  }, []);

  const reactions = getReactionCounts();
  const averageRating = getAverageRating();
  const ratings = getInteractionsByType('rating');

  const handlePollVote = async (optionId: string) => {
    if (!activePoll || !user) return;
    
    // Update local state optimistically
    setActivePoll(prev => {
      if (!prev) return null;
      return {
        ...prev,
        userVote: optionId,
        options: prev.options.map(opt => 
          opt.id === optionId 
            ? { ...opt, votes: opt.votes + 1 }
            : opt
        ),
        totalVotes: prev.totalVotes + 1
      };
    });

    // In real app, this would be sent to the server
    console.log('Poll vote:', { pollId: activePoll.id, optionId, userId: user.id });
  };

  const handleReaction = async (emoji: string) => {
    await addReaction(emoji);
  };

  const handleRating = async (rating: number) => {
    await addRating(rating);
  };

  const userRating = user ? ratings.find(r => r.user?.id === user.id)?.data.rating : undefined;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Active Poll */}
      {activePoll && (
        <ActivePoll
          poll={activePoll}
          onVote={handlePollVote}
        />
      )}

      {/* Live Reactions */}
      {showReactions && Object.keys(reactions).length > 0 && (
        <ReactionDisplay
          reactions={reactions}
          onReact={handleReaction}
        />
      )}

      {/* Content Rating */}
      {showRating && (
        <RatingDisplay
          averageRating={averageRating}
          totalRatings={ratings.length}
          onRate={handleRating}
          userRating={userRating}
        />
      )}

      {/* Command Help */}
      <Card className="border-muted">
        <CardContent className="p-3">
          <h4 className="text-sm font-medium mb-2 flex items-center space-x-1">
            <Zap className="w-4 h-4 text-muted-foreground" />
            <span>Available Commands</span>
          </h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <div><code className="bg-muted px-1 rounded">!poll</code> - Vote in polls</div>
            <div><code className="bg-muted px-1 rounded">!react [emoji]</code> - Send reactions</div>
            <div><code className="bg-muted px-1 rounded">!rate [1-5]</code> - Rate content</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

**Verification:** 
- ChatCommands component created with interactive features
- Poll voting with real-time updates and visual feedback
- Reaction system with emoji display and counts
- Rating system with star interface
- Proper Tailwind classes for component theming
- shadcn/ui Card, Progress, and Button components integrated

## Task Completion Checklist
Mark each task as complete when finished:

- [ ] Task 1: ChatMessage component with user interactions ✅
- [ ] Task 2: ChatInput with commands and emoji picker ✅  
- [ ] Task 3: Main Chat component with real-time features ✅
- [ ] Task 4: ChatCommands processor for interactive features ✅

## Verification Steps
After completing all tasks:

1. Check all chat component files exist:
   ```bash
   ls -la components/chat/
   ```

2. Test TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```

3. Start development server and test components:
   ```bash
   npm run dev
   ```

4. Test chat functionality:
   - Verify real-time message updates
   - Test command suggestions and emoji picker
   - Check message actions (reply, delete, report)
   - Test interactive commands (polls, reactions, ratings)
   - Verify responsive design and accessibility

## Success Criteria
- All chat components created with proper TypeScript types
- Real-time messaging works with Supabase subscriptions
- Interactive features (polls, reactions, ratings) functional
- Command system processes chat commands correctly
- Responsive design works across all screen sizes
- Error handling and loading states implemented
- Rate limiting and moderation features working
- Accessibility features included with proper ARIA labels

## Important Notes
- Real-time subscriptions properly cleaned up in useEffect
- Message parsing handles commands and emojis correctly
- Rate limiting prevents spam with visual feedback
- Moderation features respect user permissions
- Mobile-friendly design with touch interactions
- Performance optimized for high message volumes
- Error boundaries prevent chat system crashes

## Troubleshooting
If you encounter issues:
1. Verify Supabase real-time subscriptions are enabled
2. Check that useChat hook is properly implemented
3. Ensure authentication state is working correctly
4. Test WebSocket connections in browser dev tools
5. Verify message parsing and command detection
6. Check responsive classes at various breakpoints

## Next Step
After completing this step and marking all tasks ✅, proceed to Step 21: Create Interactive Overlay Components.