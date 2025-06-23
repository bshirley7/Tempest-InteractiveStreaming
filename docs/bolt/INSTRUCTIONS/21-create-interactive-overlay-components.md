# Step 21: Create Interactive Overlay Components

## Context
You are building Tempest, an interactive streaming platform. This step creates interactive overlay components that appear on top of video content, including polls, emoji reactions, quiz overlays, and real-time engagement features using precise Tailwind CSS classes and smooth animations.

## Purpose
Interactive overlays transform passive video watching into engaging experiences. These components handle user interactions like polls, reactions, quizzes, and announcements while maintaining visual hierarchy and responsive design across all devices.

## Prerequisites
- Step 20 completed successfully
- Chat components with real-time features created
- Video player components implemented
- User interaction hooks (useInteractions, usePolls) available
- Framer Motion animations configured

## Task Instructions
Complete each task in order and mark as ✅ when finished:

### Task 1: Create Emoji Reaction Overlay ⏳
Create floating emoji reactions that appear over video content with smooth animations.

**File to Create:** `components/overlays/EmojiReactionOverlay.tsx`

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Laugh, 
  Surprised, 
  Angry, 
  Cry,
  ThumbsUp,
  Fire,
  Star,
  Zap,
  Target
} from 'lucide-react';
import { useInteractions } from '@/lib/hooks/useInteractions';
import { cn } from '@/lib/utils/cn';

interface FloatingEmoji {
  id: string;
  emoji: string;
  x: number;
  y: number;
  timestamp: number;
}

interface EmojiReactionOverlayProps {
  videoId: string;
  isVisible: boolean;
  className?: string;
  onReactionSent?: (emoji: string) => void;
}

const EMOJI_OPTIONS = [
  { emoji: '❤️', icon: Heart, label: 'Love', color: 'text-red-500' },
  { emoji: '😂', icon: Laugh, label: 'Funny', color: 'text-yellow-500' },
  { emoji: '😮', icon: Surprised, label: 'Wow', color: 'text-blue-500' },
  { emoji: '😠', icon: Angry, label: 'Angry', color: 'text-red-600' },
  { emoji: '😢', icon: Cry, label: 'Sad', color: 'text-blue-600' },
  { emoji: '👍', icon: ThumbsUp, label: 'Like', color: 'text-green-500' },
  { emoji: '🔥', icon: Fire, label: 'Fire', color: 'text-orange-500' },
  { emoji: '⭐', icon: Star, label: 'Amazing', color: 'text-yellow-400' },
  { emoji: '⚡', icon: Zap, label: 'Exciting', color: 'text-purple-500' },
  { emoji: '🎯', icon: Target, label: 'Perfect', color: 'text-indigo-500' },
];

export function EmojiReactionOverlay({
  videoId,
  isVisible,
  className,
  onReactionSent
}: EmojiReactionOverlayProps) {
  const [floatingEmojis, setFloatingEmojis] = useState<FloatingEmoji[]>([]);
  const [reactionCounts, setReactionCounts] = useState<Record<string, number>>({});
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [lastReactionTime, setLastReactionTime] = useState(0);
  
  const { addReaction, getReactionCounts, interactions } = useInteractions({ videoId });

  // Update reaction counts when interactions change
  useEffect(() => {
    const counts = getReactionCounts();
    setReactionCounts(counts);
  }, [interactions, getReactionCounts]);

  // Handle new reactions from real-time updates
  useEffect(() => {
    const recentReactions = interactions
      .filter(interaction => 
        interaction.type === 'reaction' && 
        Date.now() - new Date(interaction.created_at).getTime() < 5000 // Last 5 seconds
      );

    recentReactions.forEach(reaction => {
      if (reaction.data.emoji) {
        addFloatingEmoji(reaction.data.emoji);
      }
    });
  }, [interactions]);

  const addFloatingEmoji = useCallback((emoji: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    const x = Math.random() * 80 + 10; // 10% to 90% of width
    const y = Math.random() * 70 + 20; // 20% to 90% of height
    
    const newEmoji: FloatingEmoji = {
      id,
      emoji,
      x,
      y,
      timestamp: Date.now()
    };

    setFloatingEmojis(prev => [...prev, newEmoji]);

    // Remove emoji after animation
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 3000);
  }, []);

  const handleEmojiClick = async (emoji: string) => {
    const now = Date.now();
    
    // Rate limiting: max one reaction per second
    if (now - lastReactionTime < 1000) return;
    
    setLastReactionTime(now);
    
    // Send reaction to backend
    const success = await addReaction(emoji);
    
    if (success) {
      // Add local floating emoji immediately for responsive feel
      addFloatingEmoji(emoji);
      onReactionSent?.(emoji);
      
      // Update local count optimistically
      setReactionCounts(prev => ({
        ...prev,
        [emoji]: (prev[emoji] || 0) + 1
      }));
    }
    
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      "absolute inset-0 pointer-events-none z-20",
      className
    )}>
      {/* Floating Emojis */}
      <AnimatePresence>
        {floatingEmojis.map(({ id, emoji, x, y }) => (
          <motion.div
            key={id}
            initial={{ 
              opacity: 0, 
              scale: 0.5,
              x: `${x}%`,
              y: `${y}%`
            }}
            animate={{ 
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.2, 1, 0.8],
              y: `${y - 20}%`
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ 
              duration: 3,
              ease: "easeOut"
            }}
            className="absolute text-4xl select-none pointer-events-none z-30"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
            }}
          >
            {emoji}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Reaction Controls */}
      <div className="absolute bottom-20 right-4 flex flex-col items-end space-y-2 pointer-events-auto">
        {/* Quick Reaction Counts */}
        <AnimatePresence>
          {Object.entries(reactionCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([emoji, count]) => (
              <motion.div
                key={emoji}
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                className="flex items-center space-x-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1"
              >
                <span className="text-lg">{emoji}</span>
                <Badge variant="secondary" className="text-xs min-w-[20px] justify-center">
                  {count > 999 ? `${Math.floor(count / 1000)}k` : count}
                </Badge>
              </motion.div>
            ))
          }
        </AnimatePresence>

        {/* Emoji Picker */}
        <AnimatePresence>
          {showEmojiPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", duration: 0.3 }}
            >
              <Card className="p-3 bg-background/95 backdrop-blur-sm border-border shadow-lg">
                <div className="grid grid-cols-5 gap-2">
                  {EMOJI_OPTIONS.map(({ emoji, icon: Icon, label, color }) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-10 h-10 p-0 hover:scale-110 transition-transform",
                        "hover:bg-secondary/80"
                      )}
                      onClick={() => handleEmojiClick(emoji)}
                      title={label}
                    >
                      <span className="text-lg">{emoji}</span>
                    </Button>
                  ))}
                </div>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reaction Button */}
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            "rounded-full w-12 h-12 p-0 shadow-lg",
            "bg-background/95 backdrop-blur-sm hover:bg-secondary/80",
            "border-2 border-border hover:border-primary/50",
            "transition-all duration-200 hover:scale-105",
            showEmojiPicker && "bg-primary text-primary-foreground"
          )}
          onClick={toggleEmojiPicker}
        >
          <motion.div
            animate={{ rotate: showEmojiPicker ? 45 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Heart className="w-5 h-5" />
          </motion.div>
        </Button>
      </div>
    </div>
  );
}
```

**Verification:** 
- File created with emoji reaction overlay functionality
- Floating animations implemented with Framer Motion
- Real-time reaction counts displayed
- Rate limiting and optimistic updates included

### Task 2: Create Poll Overlay Component ⏳
Create interactive poll overlays that appear during video playback.

**File to Create:** `components/overlays/PollOverlay.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  Clock, 
  Users, 
  X,
  BarChart3,
  Vote
} from 'lucide-react';
import { usePolls } from '@/lib/hooks/useInteractions';
import { useUser } from '@/lib/hooks/useUser';
import { formatNumber } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import type { Poll } from '@/lib/types';

interface PollOverlayProps {
  videoId: string;
  isVisible: boolean;
  className?: string;
  onPollVoted?: (pollId: string, optionId: string) => void;
  onPollClosed?: () => void;
}

interface PollResults {
  [optionId: string]: {
    votes: number;
    percentage: number;
  };
}

export function PollOverlay({
  videoId,
  isVisible,
  className,
  onPollVoted,
  onPollClosed
}: PollOverlayProps) {
  const { user } = useUser();
  const { polls, votePoll, getActivePoll } = usePolls(videoId);
  const [activePoll, setActivePoll] = useState<Poll | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [pollResults, setPollResults] = useState<PollResults>({});
  const [totalVotes, setTotalVotes] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Get active poll
  useEffect(() => {
    const currentPoll = getActivePoll();
    setActivePoll(currentPoll);
    
    if (currentPoll) {
      // Reset voting state for new poll
      setHasVoted(false);
      setSelectedOption(null);
      
      // Calculate time remaining
      if (currentPoll.expires_at) {
        const now = new Date();
        const expiresAt = new Date(currentPoll.expires_at);
        const remaining = Math.max(0, expiresAt.getTime() - now.getTime());
        setTimeRemaining(Math.floor(remaining / 1000));
      }
    }
  }, [polls, getActivePoll]);

  // Countdown timer
  useEffect(() => {
    if (timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        if (newTime <= 0) {
          // Poll expired
          onPollClosed?.();
        }
        return Math.max(0, newTime);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, onPollClosed]);

  // Mock poll results calculation (in real app, this would come from backend)
  useEffect(() => {
    if (!activePoll) return;

    // Simulate poll results
    const mockResults: PollResults = {};
    let total = 0;

    activePoll.options.forEach((option, index) => {
      const votes = Math.floor(Math.random() * 100) + 10;
      mockResults[option.id] = {
        votes,
        percentage: 0 // Will be calculated after total
      };
      total += votes;
    });

    // Calculate percentages
    Object.keys(mockResults).forEach(optionId => {
      mockResults[optionId].percentage = total > 0 
        ? (mockResults[optionId].votes / total) * 100 
        : 0;
    });

    setPollResults(mockResults);
    setTotalVotes(total);
  }, [activePoll]);

  const handleVote = async (optionId: string) => {
    if (!activePoll || !user || hasVoted || isVoting) return;

    setIsVoting(true);
    setSelectedOption(optionId);

    try {
      const success = await votePoll(activePoll.id, optionId);
      
      if (success) {
        setHasVoted(true);
        onPollVoted?.(activePoll.id, optionId);
        
        // Update local results optimistically
        setPollResults(prev => {
          const newResults = { ...prev };
          const currentVotes = newResults[optionId]?.votes || 0;
          newResults[optionId] = {
            ...newResults[optionId],
            votes: currentVotes + 1
          };
          
          // Recalculate percentages
          const newTotal = totalVotes + 1;
          Object.keys(newResults).forEach(id => {
            newResults[id].percentage = (newResults[id].votes / newTotal) * 100;
          });
          
          setTotalVotes(newTotal);
          return newResults;
        });
      }
    } catch (error) {
      console.error('Error voting on poll:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getOptionColor = (optionId: string, isSelected: boolean): string => {
    if (isSelected) return 'border-primary bg-primary/10';
    if (hasVoted) return 'border-border bg-muted/50';
    return 'border-border hover:border-primary/50 hover:bg-secondary/50';
  };

  if (!isVisible || !activePoll) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", duration: 0.5 }}
        className={cn(
          "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
          "w-full max-w-md mx-4 z-30 pointer-events-auto",
          className
        )}
      >
        <Card className="bg-background/95 backdrop-blur-sm border-border shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold mb-2">
                  {activePoll.question}
                </CardTitle>
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{formatNumber(totalVotes)} votes</span>
                  </div>
                  {timeRemaining > 0 && (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimeRemaining(timeRemaining)}</span>
                    </div>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0 hover:bg-destructive/10"
                onClick={onPollClosed}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {timeRemaining > 0 && (
              <Progress 
                value={(timeRemaining / (activePoll.duration_seconds || 60)) * 100} 
                className="h-1 mt-2"
              />
            )}
          </CardHeader>

          <CardContent className="space-y-3">
            {activePoll.options.map((option) => {
              const result = pollResults[option.id];
              const isSelected = selectedOption === option.id;
              const percentage = result?.percentage || 0;
              const votes = result?.votes || 0;

              return (
                <motion.div
                  key={option.id}
                  whileHover={{ scale: hasVoted ? 1 : 1.02 }}
                  whileTap={{ scale: hasVoted ? 1 : 0.98 }}
                >
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-auto p-4 justify-start relative overflow-hidden",
                      "transition-all duration-200",
                      getOptionColor(option.id, isSelected),
                      (hasVoted || timeRemaining <= 0) && "cursor-default"
                    )}
                    onClick={() => handleVote(option.id)}
                    disabled={hasVoted || timeRemaining <= 0 || isVoting}
                  >
                    {/* Results Background */}
                    {hasVoted && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="absolute left-0 top-0 h-full bg-primary/10 border-r border-primary/20"
                      />
                    )}

                    <div className="flex items-center justify-between w-full relative z-10">
                      <div className="flex items-center space-x-3">
                        {isSelected && hasVoted && (
                          <CheckCircle className="w-5 h-5 text-primary" />
                        )}
                        {!hasVoted && !isSelected && (
                          <Vote className="w-5 h-5 text-muted-foreground" />
                        )}
                        <span className="font-medium">{option.text}</span>
                      </div>

                      {hasVoted && (
                        <div className="flex items-center space-x-2 text-sm">
                          <span className="font-medium">{percentage.toFixed(1)}%</span>
                          <Badge variant="secondary" className="text-xs">
                            {formatNumber(votes)}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </Button>
                </motion.div>
              );
            })}

            {/* Status Message */}
            <div className="pt-2 text-center">
              {!user ? (
                <p className="text-sm text-muted-foreground">
                  Sign in to participate in polls
                </p>
              ) : hasVoted ? (
                <div className="flex items-center justify-center space-x-2 text-sm text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span>Vote recorded! Results updating live...</span>
                </div>
              ) : timeRemaining <= 0 ? (
                <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Voting has ended</span>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Select an option to vote
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
```

**Verification:** 
- File created with interactive poll overlay functionality
- Real-time voting and results implemented
- Timer countdown and expiration handling
- Progress indicators and animations included

### Task 3: Create Live Chat Overlay ⏳
Create a minimized chat overlay that can be toggled over video content.

**File to Create:** `components/overlays/LiveChatOverlay.tsx`

```typescript
'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  Minimize2, 
  Maximize2, 
  X,
  Users,
  Settings,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Chat } from '@/components/chat/Chat';
import { useChat } from '@/lib/hooks/useChat';
import { useViewerCount } from '@/lib/hooks/useAnalytics';
import { formatNumber } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

interface LiveChatOverlayProps {
  videoId: string;
  isVisible: boolean;
  className?: string;
  variant?: 'minimized' | 'overlay' | 'sidebar';
  onToggle?: () => void;
  onClose?: () => void;
}

export function LiveChatOverlay({
  videoId,
  isVisible,
  className,
  variant = 'minimized',
  onToggle,
  onClose
}: LiveChatOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const lastMessageCountRef = useRef(0);
  
  const { messages, loading } = useChat({ videoId, limit: 100 });
  const { viewerCount } = useViewerCount(videoId);

  // Track unread messages when minimized
  useEffect(() => {
    if (!isExpanded && messages.length > lastMessageCountRef.current) {
      const newMessages = messages.length - lastMessageCountRef.current;
      setUnreadCount(prev => prev + newMessages);
    }
    lastMessageCountRef.current = messages.length;
  }, [messages.length, isExpanded]);

  // Reset unread count when expanded
  useEffect(() => {
    if (isExpanded) {
      setUnreadCount(0);
    }
  }, [isExpanded]);

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
    onToggle?.();
  };

  const handleClose = () => {
    setIsExpanded(false);
    onClose?.();
  };

  const getLatestMessages = () => {
    return messages.slice(-3); // Show last 3 messages in minimized view
  };

  if (!isVisible) return null;

  // Minimized floating button
  if (variant === 'minimized' && !isExpanded) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "fixed bottom-4 right-4 z-40 pointer-events-auto",
          className
        )}
      >
        <Button
          onClick={handleToggle}
          className={cn(
            "relative rounded-full w-14 h-14 p-0 shadow-lg",
            "bg-primary hover:bg-primary/90",
            "border-2 border-background"
          )}
        >
          <MessageCircle className="w-6 h-6" />
          
          {/* Unread Count Badge */}
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2"
            >
              <Badge 
                variant="destructive" 
                className="text-xs min-w-[20px] h-5 flex items-center justify-center rounded-full"
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </Badge>
            </motion.div>
          )}

          {/* Live indicator */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"
          />
        </Button>
      </motion.div>
    );
  }

  // Expanded overlay
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className={cn(
          "fixed right-4 top-4 bottom-4 w-80 z-40 pointer-events-auto",
          variant === 'sidebar' && "relative w-full h-full",
          className
        )}
      >
        <Card className="flex flex-col h-full bg-background/95 backdrop-blur-sm border-border shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
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
                onClick={() => setIsMuted(!isMuted)}
                title={isMuted ? "Unmute notifications" : "Mute notifications"}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              
              {variant !== 'sidebar' && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={handleToggle}
                  >
                    <Minimize2 className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-8 h-8 p-0"
                    onClick={handleClose}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Chat Content */}
          <div className="flex-1 relative">
            <Chat
              videoId={videoId}
              variant="overlay"
              className="h-full"
              showHeader={false}
              autoScroll={isAutoScroll}
              maxHeight="none"
            />
          </div>

          {/* Mini Recent Messages (when minimized) */}
          {!isExpanded && (
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border"
              >
                <div className="p-2 space-y-1">
                  {getLatestMessages().map((message, index) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="text-xs truncate"
                    >
                      <span className="font-medium text-primary">
                        {message.user?.username}:
                      </span>
                      <span className="ml-1 text-muted-foreground">
                        {message.message}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
```

**Verification:** 
- File created with live chat overlay functionality
- Minimized and expanded states implemented
- Unread message tracking and notifications
- Real-time viewer count integration

### Task 4: Create Announcement Overlay ⏳
Create announcement overlays for important messages and notifications.

**File to Create:** `components/overlays/AnnouncementOverlay.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  X, 
  AlertCircle, 
  Info, 
  CheckCircle, 
  AlertTriangle,
  Megaphone,
  Star,
  Gift,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Announcement {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion' | 'achievement';
  title: string;
  message: string;
  duration?: number; // milliseconds, null for persistent
  priority: 'low' | 'medium' | 'high' | 'urgent';
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  timestamp: number;
}

interface AnnouncementOverlayProps {
  announcements: Announcement[];
  position?: 'top-center' | 'top-right' | 'bottom-center' | 'bottom-right' | 'center';
  maxVisible?: number;
  className?: string;
  onDismiss?: (announcementId: string) => void;
}

const ANNOUNCEMENT_ICONS = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
  promotion: Gift,
  achievement: Star
};

const ANNOUNCEMENT_COLORS = {
  info: {
    bg: 'bg-blue-500/10 border-blue-500/20',
    icon: 'text-blue-500',
    badge: 'bg-blue-500'
  },
  success: {
    bg: 'bg-green-500/10 border-green-500/20',
    icon: 'text-green-500',
    badge: 'bg-green-500'
  },
  warning: {
    bg: 'bg-yellow-500/10 border-yellow-500/20',
    icon: 'text-yellow-500',
    badge: 'bg-yellow-500'
  },
  error: {
    bg: 'bg-red-500/10 border-red-500/20',
    icon: 'text-red-500',
    badge: 'bg-red-500'
  },
  promotion: {
    bg: 'bg-purple-500/10 border-purple-500/20',
    icon: 'text-purple-500',
    badge: 'bg-purple-500'
  },
  achievement: {
    bg: 'bg-yellow-400/10 border-yellow-400/20',
    icon: 'text-yellow-400',
    badge: 'bg-yellow-400'
  }
};

const PRIORITY_ORDERS = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1
};

export function AnnouncementOverlay({
  announcements,
  position = 'top-right',
  maxVisible = 3,
  className,
  onDismiss
}: AnnouncementOverlayProps) {
  const [visibleAnnouncements, setVisibleAnnouncements] = useState<Announcement[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Sort and filter announcements
  useEffect(() => {
    const filtered = announcements
      .filter(announcement => !dismissedIds.has(announcement.id))
      .sort((a, b) => {
        // Sort by priority first, then by timestamp
        const priorityDiff = PRIORITY_ORDERS[b.priority] - PRIORITY_ORDERS[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return b.timestamp - a.timestamp;
      })
      .slice(0, maxVisible);

    setVisibleAnnouncements(filtered);
  }, [announcements, dismissedIds, maxVisible]);

  // Auto-dismiss announcements with duration
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    visibleAnnouncements.forEach(announcement => {
      if (announcement.duration) {
        const timer = setTimeout(() => {
          handleDismiss(announcement.id);
        }, announcement.duration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [visibleAnnouncements]);

  const handleDismiss = (announcementId: string) => {
    setDismissedIds(prev => new Set(prev).add(announcementId));
    onDismiss?.(announcementId);
  };

  const getPositionClasses = (): string => {
    switch (position) {
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'center':
        return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  const getAnimationDirection = () => {
    switch (position) {
      case 'top-center':
      case 'bottom-center':
        return { initial: { y: -50 }, animate: { y: 0 }, exit: { y: -50 } };
      case 'top-right':
      case 'bottom-right':
        return { initial: { x: 300 }, animate: { x: 0 }, exit: { x: 300 } };
      case 'center':
        return { initial: { scale: 0.8, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.8, opacity: 0 } };
      default:
        return { initial: { x: 300 }, animate: { x: 0 }, exit: { x: 300 } };
    }
  };

  if (visibleAnnouncements.length === 0) return null;

  const animation = getAnimationDirection();

  return (
    <div className={cn(
      "fixed z-50 pointer-events-none",
      getPositionClasses(),
      className
    )}>
      <div className="space-y-3 max-w-sm w-full">
        <AnimatePresence mode="popLayout">
          {visibleAnnouncements.map((announcement, index) => {
            const Icon = ANNOUNCEMENT_ICONS[announcement.type];
            const colors = ANNOUNCEMENT_COLORS[announcement.type];

            return (
              <motion.div
                key={announcement.id}
                layout
                initial={animation.initial}
                animate={animation.animate}
                exit={animation.exit}
                transition={{ 
                  type: "spring", 
                  damping: 25, 
                  stiffness: 200,
                  layout: { duration: 0.3 }
                }}
                className="pointer-events-auto"
              >
                <Card className={cn(
                  "relative overflow-hidden backdrop-blur-sm shadow-lg",
                  colors.bg,
                  announcement.priority === 'urgent' && "ring-2 ring-red-500 animate-pulse"
                )}>
                  {/* Priority Indicator */}
                  {announcement.priority === 'urgent' && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-orange-500" />
                  )}

                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      {/* Icon */}
                      <div className={cn(
                        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                        colors.bg
                      )}>
                        <Icon className={cn("w-4 h-4", colors.icon)} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm mb-1">
                              {announcement.title}
                            </h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {announcement.message}
                            </p>
                          </div>

                          {/* Dismiss Button */}
                          {announcement.dismissible !== false && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-6 h-6 p-0 ml-2 hover:bg-background/50"
                              onClick={() => handleDismiss(announcement.id)}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          )}
                        </div>

                        {/* Action Button */}
                        {announcement.action && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3 h-8 text-xs"
                            onClick={announcement.action.onClick}
                          >
                            {announcement.action.label}
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Priority Badge */}
                    {announcement.priority !== 'low' && (
                      <Badge 
                        className={cn(
                          "absolute top-2 right-2 text-xs",
                          colors.badge,
                          "text-white"
                        )}
                      >
                        {announcement.priority.toUpperCase()}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Helper hook for managing announcements
export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  const addAnnouncement = (announcement: Omit<Announcement, 'id' | 'timestamp'>) => {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: `announcement-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now()
    };

    setAnnouncements(prev => [...prev, newAnnouncement]);
    return newAnnouncement.id;
  };

  const removeAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const clearAll = () => {
    setAnnouncements([]);
  };

  return {
    announcements,
    addAnnouncement,
    removeAnnouncement,
    clearAll
  };
}
```

**Verification:** 
- File created with announcement overlay system
- Multiple announcement types and priorities supported
- Auto-dismiss functionality and manual dismissal
- Flexible positioning and animations

## Task Completion Checklist
Mark each task as complete when finished:

- [ ] Task 1: Emoji reaction overlay created ✅
- [ ] Task 2: Poll overlay component created ✅  
- [ ] Task 3: Live chat overlay created ✅
- [ ] Task 4: Announcement overlay created ✅

## Verification Steps
After completing all tasks:

1. Check all overlay files exist:
   ```bash
   ls -la components/overlays/
   ```

2. Test TypeScript compilation:
   ```bash
   npx tsc --noEmit
   ```

3. Verify imports work correctly:
   ```bash
   npm run dev
   ```

## Success Criteria
- All 4 overlay components created successfully
- TypeScript compilation succeeds without errors
- Framer Motion animations properly configured
- Real-time interactions working
- Responsive design across devices
- Proper z-index layering over video

## Important Notes
- Overlays use absolute positioning with high z-index values
- All overlays support pointer-events management
- Animations use Framer Motion for smooth transitions
- Components integrate with real-time hooks
- Mobile responsiveness considered in all designs

## Troubleshooting
If you encounter issues:
1. Verify Framer Motion is properly installed
2. Check z-index conflicts with video player
3. Ensure real-time hooks are working
4. Test overlay positioning on different screen sizes

## Next Step
After completing this step and marking all tasks ✅, proceed to Step 22: Create Analytics Dashboard Components.